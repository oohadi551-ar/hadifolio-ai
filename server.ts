import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { 
  generateGroundedAnswer, 
  extractUnitsFromMaterials,
  generateGroundedQuiz,
  generateGroundedSummary,
  generateGroundedFlashcards
} from "./src/lib/knowledgeEngine";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initializer for GoogleGenAI SDK client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not set in environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper for timeout-wrapped AI calls
async function callAIWithTimeout<T>(promise: Promise<T>, timeoutMs: number = 4000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("AI call timed out")), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

// 1. Interactive Course Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { courseTitle = "المقرر الدراسي", courseCode = "", materials = [], messages = [], userQuery } = req.body;
  const query = userQuery || messages[messages.length - 1]?.content || "";

  if (!query) {
    return res.status(400).json({ error: "Missing query or messages" });
  }

  // Generate instant grounded answer as reliable fallback
  const groundedResult = generateGroundedAnswer(query, courseTitle, materials);

  try {
    const ai = getAI();

    // Smart context filtering: select top 3 most relevant units or compact summary to ensure instantaneous Gemini response (1-2s)
    let materialsContext = "";
    if (materials && materials.length > 0) {
      const units = extractUnitsFromMaterials(materials);
      if (units.length > 0) {
        // Score units by relevance to query keywords to only send the most relevant 2-3 units
        const queryTerms = query.toLowerCase().split(/\s+/).filter((t: string) => t.length > 2);
        const scoredUnits = units.map(u => {
          let score = 0;
          const text = (u.title + " " + u.content).toLowerCase();
          for (const term of queryTerms) {
            if (text.includes(term)) score += 1;
          }
          return { unit: u, score };
        });
        scoredUnits.sort((a, b) => b.score - a.score);
        
        const topUnits = scoredUnits.slice(0, 3).map(s => s.unit);
        materialsContext = topUnits
          .map((u) => `### ${u.fullHeading || u.title}\n${(u.content || "").slice(0, 1500)}`)
          .join("\n\n");
      } else {
        materialsContext = materials
          .slice(0, 2)
          .map((m: any, index: number) => {
            const title = m.title || m.fileName || `ملف ${index + 1}`;
            const content = (m.content || m.summary || "").slice(0, 1500);
            return `=== المرجع [${index + 1}]: "${title}" ===\n${content}`;
          })
          .join("\n\n");
      }
    } else {
      materialsContext = "مقرر قانوني معتمد. أجب وفق الأصول والأنظمة والاتفاقيات القانونية المعتمدة.";
    }

    const systemInstruction = `
أنت المساعد الأكاديمي الذكي لمقرر "${courseTitle}". أجب مباشرة وبسرعة فائقة وبدون أي مقدمات أو حشو.
قواعد الإجابة:
1. الأسئلة المرقمة: أجب فوراً على كل رقم.
2. صح أو خطأ: اكتب (❌ خطأ مع التصويب في سطر) أو (✅ صح مع التعليل في سطر).
3. اختيار من متعدد: اكتب الخيار الصحيح وتعليلاً مركزاً.

المحتوى المعتمد ذو الصلة:
${materialsContext}
    `.trim();

    const recentHistory = (messages || [])
      .slice(-2)
      .map((msg: any) => `${msg.role === "user" ? "الطالب" : "المساعد"}: ${msg.content}`)
      .join("\n\n");

    const prompt = `
${recentHistory ? `السياق السابق:\n${recentHistory}\n\n` : ''}أسئلة الطالب:
"${query}"
    `.trim();

    let responseText = "";
    try {
      // Use gemini-2.5-flash with timeout for guaranteed 1-2s response
      const response = await callAIWithTimeout(
        ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
          },
        }),
        6000
      );
      responseText = response.text || "";
    } catch (modelErr: any) {
      console.warn("Fast AI note, trying quick fallback:", modelErr?.message || modelErr);
      try {
        const fallbackResp = await callAIWithTimeout(
          ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
              systemInstruction,
            },
          }),
          6000
        );
        responseText = fallbackResp.text || "";
      } catch (fallbackErr: any) {
        console.error("AI timeout/error, using instant grounded local engine:", fallbackErr?.message || fallbackErr);
      }
    }

    if (responseText && responseText.trim().length > 10) {
      return res.json({
        reply: responseText.trim(),
        sources: (materials || []).slice(0, 3).map((m: any) => ({
          materialTitle: m.title || m.fileName || "مذكرات المقرر المعتمدة",
          snippet: m.summary || m.title || "مرجع معتمد للمقرر",
        })),
        suggestedFollowUps: [
          "هل ترغب في شرح تفصيلي لأي من هذه الأسئلة؟",
          "اختبرني بأسئلة أخرى حول هذه الوحدات",
          "لخص لي أهم القواعد والأنظمة الواردة في هذا الموضوع",
        ],
      });
    }
    
    return res.json(groundedResult);
  } catch (error: any) {
    console.error("AI Error in /api/chat:", error?.message || error);
    return res.json(groundedResult);
  }
});

// 2. Interactive Practice Quiz Generator
app.post("/api/generate-quiz", async (req, res) => {
  const { courseTitle = "المقرر", materials = [], questionCount = 5, difficulty = "متوسط", topic = "" } = req.body;
  const groundedQuiz = generateGroundedQuiz(courseTitle, materials, questionCount, topic);

  try {
    const ai = getAI();

    const materialsText = (materials || [])
      .map((m: any) => `[المحاضرة/الملف: ${m.title || m.fileName}]:\n${m.content || ""}`)
      .join("\n\n");

    const prompt = `
أنت أستاذ ومصمم اختبارات جامعي لمقرر: "${courseTitle}".
قم بإنشاء اختبار تدريبي تفاعلي مكوّن من ${questionCount} أسئلة اختيار من متعدد (Multiple Choice) بمستوى صعوبة: ${difficulty}.
${topic ? `التركيز بشكل خاص على موضوع: "${topic}".` : ""}

مرفقات ومحتوى المقرر:
${materialsText || "استخدم المعرفة القياسية للمقرر."}

المطلوب:
لكل سؤال:
- نص السؤال بدقة ووضوح
- 4 خيارات إجابة
- رقم الإندكس الصحيح (0 إلى 3)
- شرح تعليمي موجز لماذا هذا الخيار هو الصحيح
- الإشارة إلى المرجع أو المحاضرة
    `.trim();

    const response = await callAIWithTimeout(
      ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctAnswerIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                    sourceReference: { type: Type.STRING },
                  },
                  required: ["id", "question", "options", "correctAnswerIndex", "explanation"],
                },
              },
            },
            required: ["questions"],
          },
        },
      }),
      20000
    );

    const parsed = JSON.parse(response.text || '{"questions": []}');
    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return res.json(parsed);
    }
    return res.json(groundedQuiz);
  } catch (error: any) {
    console.warn("AI generation note in /api/generate-quiz:", error?.message || error);
    return res.json(groundedQuiz);
  }
});

// 3. Study Guide & Summary Generator
app.post("/api/generate-summary", async (req, res) => {
  const { courseTitle = "المقرر", materials = [] } = req.body;
  const groundedSummary = generateGroundedSummary(courseTitle, materials);

  try {
    const ai = getAI();

    const materialsText = (materials || [])
      .map((m: any) => `[المحاضرة/الملف: ${m.title || m.fileName}]:\n${m.content || ""}`)
      .join("\n\n");

    const prompt = `
قم بإعداد "دليل دراسي وملخص شامل للمراجعة المركزة" لمقرر: "${courseTitle}" مستنداً على مرفقات ومذكرات المقرر أدناه.

محتوى المرفقات:
${materialsText}

المطلوب استخراجه بدقة باللغة العربية:
1. نظرة عامة وشاملة على المنهج (overview)
2. قائمة بالمفاهيم والمصطلحات الأساسية مع تعريف كل مفهوم ومثال توضيحي إن وجد (keyConcepts)
3. القوانين أو القواعد أو المعادلات أو المبادئ الأساسية الذهبية التي يجب حفظها (importantRulesOrFormulas)
4. أسئلة امتحانية نموذجية متوقعة وشاملة (potentialExamQuestions)
    `.trim();

    const response = await callAIWithTimeout(
      ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              overview: { type: Type.STRING },
              keyConcepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    example: { type: Type.STRING },
                  },
                  required: ["term", "definition"],
                },
              },
              importantRulesOrFormulas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              potentialExamQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["title", "overview", "keyConcepts", "importantRulesOrFormulas", "potentialExamQuestions"],
          },
        },
      }),
      20000
    );

    const parsed = JSON.parse(response.text || "{}");
    if (parsed && parsed.overview && parsed.keyConcepts) {
      return res.json(parsed);
    }
    return res.json(groundedSummary);
  } catch (error: any) {
    console.warn("AI generation note in /api/generate-summary:", error?.message || error);
    return res.json(groundedSummary);
  }
});

// 4. Flashcards Generator
app.post("/api/generate-flashcards", async (req, res) => {
  const { courseTitle = "المقرر", materials = [], count = 8 } = req.body;
  const groundedFlashcards = generateGroundedFlashcards(courseTitle, materials, count);

  try {
    const ai = getAI();

    const materialsText = (materials || [])
      .map((m: any) => `[المحاضرة/الملف: ${m.title || m.fileName}]:\n${m.content || ""}`)
      .join("\n\n");

    const prompt = `
أنشئ ${count} بطاقات استذكار سريعة (Flashcards) لمقرر: "${courseTitle}" مستخرجة مباشرة من المذكرات والمرفقات التالية لتعزيز الاسترجاع النشط (Active Recall).

المرفقات:
${materialsText}

المطلوب لكل بطاقة:
- السؤال أو المفهوم (question)
- الإجابة الدقيقة والموجزة والمركزة (answer)
- اسم المفهوم أو الوحدة (concept)
- اسم المرجع أو المحاضرة (sourceMaterialTitle)
    `.trim();

    const response = await callAIWithTimeout(
      ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                    concept: { type: Type.STRING },
                    sourceMaterialTitle: { type: Type.STRING },
                  },
                  required: ["id", "question", "answer", "concept"],
                },
              },
            },
            required: ["flashcards"],
          },
        },
      }),
      20000
    );

    const parsed = JSON.parse(response.text || '{"flashcards": []}');
    if (parsed && Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0) {
      return res.json(parsed);
    }
    return res.json(groundedFlashcards);
  } catch (error: any) {
    console.warn("AI generation note in /api/generate-flashcards:", error?.message || error);
    return res.json(groundedFlashcards);
  }
});

// 5. File Content Extractor & AI Analyzer
app.post("/api/analyze-file", async (req, res) => {
  try {
    const { fileName, textContent, base64Data, mimeType } = req.body;
    const ai = getAI();

    let contentsPayload: any;
    if (base64Data && mimeType) {
      contentsPayload = {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `قم بتحليل هذا المستند الأكاديمي ("${fileName}"). استخرج ملخصاً موجزاً، وأهم 3 إلى 5 وسوم (tags)، والنص الكامل أو الأفكار الرئيسية بدقة.`,
          },
        ],
      };
    } else {
      contentsPayload = `
قم بتحليل هذا المحتوى الأكاديمي ("${fileName}"):
${(textContent || "").slice(0, 20000)}

المطلوب: ملخص مكثف، وأهم الوسوم الأكاديمية (tags).
      `.trim();
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contentsPayload,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            extractedKeyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["summary", "tags"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/analyze-file:", error);
    res.status(500).json({ error: "فشل تحليل الملف", details: error?.message });
  }
});

// Express + Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Classroom AI Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
