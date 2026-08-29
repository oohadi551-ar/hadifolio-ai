import React, { useState } from 'react';
import { Course, StudyGuide } from '../types';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Printer, 
  Copy, 
  Check, 
  RotateCcw, 
  Bookmark, 
  FileText,
  Loader2
} from 'lucide-react';

interface StudyGuideViewProps {
  activeCourse: Course | null;
  onOpenCourseSelector: () => void;
}

export const StudyGuideView: React.FC<StudyGuideViewProps> = ({
  activeCourse,
  onOpenCourseSelector,
}) => {
  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!activeCourse) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-3 text-center">
        <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">الرجاء اختيار مقرر دراسي أولاً</h3>
        <p className="text-xs text-slate-500 mb-4">اختر مقرراً لإنشاء دليل دراسي وملخص شامل لمذكراته</p>
        <button
          onClick={onOpenCourseSelector}
          className="px-4 py-2 bg-[#6E7141] hover:bg-[#454726] text-white rounded-xl text-xs font-bold shadow-xs"
        >
          اختر مقرراً الآن
        </button>
      </div>
    );
  }

  const handleGenerateGuide = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: activeCourse.title,
          materials: activeCourse.materials,
        }),
      });

      const data = await response.json();
      if (data && data.overview) {
        setGuide({
          id: `guide-${Date.now()}`,
          courseId: activeCourse.id,
          title: data.title || `الدليل الدراسي لمقرر: ${activeCourse.title}`,
          overview: data.overview,
          keyConcepts: data.keyConcepts || [],
          importantRulesOrFormulas: data.importantRulesOrFormulas || [],
          potentialExamQuestions: data.potentialExamQuestions || [],
          createdAt: new Date().toISOString(),
        });
      } else {
        alert('لم نتمكن من توليد الدليل، يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error('Error generating study guide:', err);
      alert('حدث خطأ أثناء إعداد الملخص والدليل الدراسي.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyGuide = () => {
    if (!guide) return;
    const text = `
# ${guide.title}
## نظرة عامة
${guide.overview}

## المفاهيم والمصطلحات الأساسية
${guide.keyConcepts.map((c) => `- **${c.term}**: ${c.definition} ${c.example ? `(مثال: ${c.example})` : ''}`).join('\n')}

## القواعد والأنظمة الرئيسية
${guide.importantRulesOrFormulas.map((r) => `- ${r}`).join('\n')}

## أسئلة الاختبار المتوقعة
${guide.potentialExamQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-3 sm:py-6 px-2 sm:px-4 lg:px-8 space-y-4 sm:space-y-6 font-['Cairo',sans-serif]">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#6E7141]/15 text-[#454726] border border-[#6E7141]/30">
              {activeCourse.code}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              دليل المراجعة والملخص الشامل: {activeCourse.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ملخص مكثف للمفاهيم، القواعد، والمعادلات المستخرجة آلياً من مذكرات المقرر
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {guide && (
            <>
              <button
                onClick={handleCopyGuide}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
                title="نسخ الملخص كاملاً"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'تم النسخ' : 'نسخ النص'}
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
                title="طباعة الدليل الدراسي"
              >
                <Printer className="w-3.5 h-3.5" />
                طباعة
              </button>
            </>
          )}

          <button
            onClick={handleGenerateGuide}
            disabled={isLoading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#6E7141] hover:bg-[#454726] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:shadow-md"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {guide ? 'إعادة توليد وتحديث الملخص' : 'توليد الدليل الدراسي الشامل'}
          </button>
        </div>
      </div>

      {/* Guide Content */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs">
          <Loader2 className="w-10 h-10 text-[#6E7141] animate-spin mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-900 mb-1">جاري قراءة واستخلاص ملخص المنهج...</h3>
          <p className="text-xs text-slate-500">يقوم المساعد الذكي بتنظيم المصطلحات وتحديد القواعد والأسئلة النموذجية</p>
        </div>
      ) : !guide ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs">
          <BookOpen className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">لم يتم توليد دليل المراجعة لهذا المقرر بعد</h3>
          <p className="text-xs text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
            اضغط على الزر أدناه ليقوم الذكاء الاصطناعي بتحليل كافة مذكرات مقرر "{activeCourse.title}" واستخراج ملخص أكاديمي متكامل.
          </p>
          <button
            onClick={handleGenerateGuide}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6E7141] hover:bg-[#454726] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4" />
            بدء التوليد الفوري
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6 print:m-0">
          
          {/* Section 1: Course Overview */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#454726] font-bold text-sm">
              <Bookmark className="w-4 h-4 text-[#6E7141]" />
              <h3>نظرة عامة على محتوى المقرر</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-[#6E7141]/5 p-3.5 sm:p-4 rounded-2xl border border-[#6E7141]/20">
              {guide.overview}
            </p>
          </div>

          {/* Section 2: Key Concepts Glossary */}
          {guide.keyConcepts && guide.keyConcepts.length > 0 && (
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <BookOpen className="w-4 h-4 text-[#6E7141]" />
                <h3>المفاهيم والمصطلحات الجوهرية (Glossary)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guide.keyConcepts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                  >
                    <span className="text-xs font-bold text-[#454726] block">
                      {item.term}
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {item.definition}
                    </p>
                    {item.example && (
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200/70 mt-2">
                        💡 <span className="font-semibold">مثال تطبيقي:</span> {item.example}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Important Rules / Formulas */}
          {guide.importantRulesOrFormulas && guide.importantRulesOrFormulas.length > 0 && (
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <h3>القواعد والأحكام النظامية الرئيسية للحفظ والفهم</h3>
              </div>

              <div className="space-y-2">
                {guide.importantRulesOrFormulas.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs sm:text-sm text-slate-900 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-md bg-amber-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Potential Exam Questions */}
          {guide.potentialExamQuestions && guide.potentialExamQuestions.length > 0 && (
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-rose-600" />
                <h3>أسئلة اختبار نموذجية متوقعة</h3>
              </div>

              <div className="space-y-2">
                {guide.potentialExamQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 flex items-start gap-2.5"
                  >
                    <span className="text-rose-600 font-bold text-xs shrink-0 mt-0.5">
                      س{idx + 1}:
                    </span>
                    <span className="leading-relaxed font-medium">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
