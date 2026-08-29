export interface CourseMaterial {
  id: string;
  title: string;
  fileName: string;
  type: 'pdf' | 'text' | 'markdown' | 'image' | 'notes';
  content: string; // extracted text
  inlineData?: {
    mimeType: string;
    data: string; // base64
  };
  fileSize: number; // bytes
  uploadedAt: string;
  pageCount?: number;
  summary?: string;
  tags?: string[];
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  icon: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'teal';
  createdAt: string;
  materials: CourseMaterial[];
  systemPromptExtra?: string;
}

export interface SourceCitation {
  materialId: string;
  materialTitle: string;
  snippet?: string;
  pageNumber?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: SourceCitation[];
  suggestedFollowUps?: string[];
  mode?: 'chat' | 'quiz' | 'summary' | 'flashcards' | 'concept';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  sourceReference?: string;
  sourceMaterial?: string;
  difficulty?: string;
}

export interface StudyFlashcard {
  id: string;
  question: string;
  answer: string;
  concept: string;
  sourceMaterialTitle?: string;
}

export interface StudyKeyConcept {
  term: string;
  definition: string;
  example?: string;
}

export interface StudyGuide {
  id: string;
  courseId: string;
  title: string;
  overview: string;
  keyConcepts: StudyKeyConcept[];
  importantRulesOrFormulas: string[];
  potentialExamQuestions: string[];
  createdAt: string;
}
