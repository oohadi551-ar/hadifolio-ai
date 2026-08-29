import React, { useState } from 'react';
import { Course, StudyFlashcard } from '../types';
import { 
  Layers, 
  Sparkles, 
  RotateCw, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle, 
  Shuffle, 
  RotateCcw,
  FileText,
  Loader2
} from 'lucide-react';

interface FlashcardsViewProps {
  activeCourse: Course | null;
  onOpenCourseSelector: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  activeCourse,
  onOpenCourseSelector,
}) => {
  const [flashcards, setFlashcards] = useState<StudyFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  if (!activeCourse) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-3 text-center">
        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">الرجاء اختيار مقرر دراسي أولاً</h3>
        <p className="text-xs text-slate-500 mb-4">اختر مقرراً لتوليد بطاقات استذكار سريعة</p>
        <button
          onClick={onOpenCourseSelector}
          className="px-4 py-2 bg-[#6E7141] hover:bg-[#454726] text-white rounded-xl text-xs font-bold shadow-xs"
        >
          اختر مقرراً الآن
        </button>
      </div>
    );
  }

  const handleGenerateFlashcards = async () => {
    setIsLoading(true);
    setIsFlipped(false);
    setCurrentIndex(0);
    setMasteredIds(new Set());

    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: activeCourse.title,
          materials: activeCourse.materials,
          count: 8,
        }),
      });

      const data = await response.json();
      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
      } else {
        alert('لم نتمكن من توليد بطاقات، يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error('Error generating flashcards:', err);
      alert('حدث خطأ أثناء توليد بطاقات الاستذكار.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShuffle = () => {
    setFlashcards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-4xl mx-auto py-3 sm:py-6 px-2 sm:px-4 lg:px-8 space-y-4 sm:space-y-6 font-['Cairo',sans-serif]">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#6E7141]/15 text-[#454726] border border-[#6E7141]/30">
              {activeCourse.code}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              بطاقات الاستذكار السريع: {activeCourse.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            طريقة الاسترجاع النشط الفعالة لتثبيت المفاهيم والمصطلحات القانونية
          </p>
        </div>

        {flashcards.length > 0 && !isLoading && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShuffle}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              title="خلط ترتيب البطاقات"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>خلط</span>
            </button>
            <button
              onClick={handleGenerateFlashcards}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#454726] bg-[#6E7141]/15 hover:bg-[#6E7141]/25 rounded-xl transition-colors border border-[#6E7141]/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>توليد جديد</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Flashcard Container */}
      {flashcards.length === 0 && !isLoading ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs">
          <Layers className="w-12 h-12 text-[#6E7141] mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            لا توجد بطاقات استذكار مفعلة حالياً
          </h3>
          <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
            يقوم المساعد الذكي باستخراج أهم الأسئلة والتعاريف من مذكرات مقرر "{activeCourse.title}" وتحويلها لبطاقات تفاعلية.
          </p>
          <button
            onClick={handleGenerateFlashcards}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6E7141] hover:bg-[#454726] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4" />
            توليد بطاقات الاستذكار الآن
          </button>
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs">
          <Loader2 className="w-10 h-10 text-[#6E7141] animate-spin mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-900 mb-1">جاري تجهيز بطاقات الاستذكار...</h3>
          <p className="text-xs text-slate-500">استخراج المصطلحات وصياغة بطاقات السؤال والجواب</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          
          {/* Status Tracker */}
          <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="font-bold text-slate-900">
              البطاقة {currentIndex + 1} من {flashcards.length}
            </span>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-[11px] sm:text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                أتقنتها: {masteredIds.size}
              </span>
              <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg text-[11px] sm:text-xs">
                المتبقي: {flashcards.length - masteredIds.size}
              </span>
            </div>
          </div>

          {/* Interactive Flip Card */}
          {currentCard && (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="cursor-pointer min-h-[260px] sm:min-h-[300px] rounded-3xl p-5 sm:p-8 border-2 transition-all duration-300 flex flex-col justify-between select-none relative group shadow-xs hover:shadow-md bg-white border-slate-200 hover:border-[#6E7141]/60"
            >
              {/* Card Top Label */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#454726] bg-[#6E7141]/15 px-3 py-1 rounded-xl border border-[#6E7141]/30">
                  {isFlipped ? 'الإجابة والتوضيح' : 'السؤال والمفهوم'}
                </span>
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                  انقر لقلب البطاقة
                </span>
              </div>

              {/* Card Body */}
              <div className="my-auto py-4 sm:py-6 text-center">
                {!isFlipped ? (
                  <div className="space-y-2.5 sm:space-y-3">
                    <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                      المفهوم: {currentCard.concept}
                    </span>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-relaxed max-w-xl mx-auto">
                      {currentCard.question}
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-2.5 sm:space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md inline-block border border-emerald-200">
                      ✓ الإجابة المعتمدة
                    </span>
                    <p className="text-sm sm:text-base md:text-lg font-medium text-slate-800 leading-relaxed max-w-xl mx-auto">
                      {currentCard.answer}
                    </p>
                    {currentCard.sourceMaterialTitle && (
                      <p className="text-[11px] text-slate-400 font-mono pt-2">
                        المرجع: {currentCard.sourceMaterialTitle}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Bottom / Flip hint */}
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMastered(currentCard.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                    masteredIds.has(currentCard.id)
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {masteredIds.has(currentCard.id) ? 'تم الإتقان ✓' : 'تحديد كـ "متقن"'}
                </button>

                <span className="text-[#6E7141] font-bold text-[11px]">
                  {isFlipped ? 'انقر للعودة للسؤال' : 'انقر لكشف الإجابة'}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex((prev) => prev - 1);
                setIsFlipped(false);
              }}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              البطاقة السابقة
            </button>

            <button
              disabled={currentIndex === flashcards.length - 1}
              onClick={() => {
                setCurrentIndex((prev) => prev + 1);
                setIsFlipped(false);
              }}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-[#6E7141] hover:bg-[#454726] disabled:opacity-30 rounded-xl text-xs font-bold text-white shadow-xs transition-colors"
            >
              البطاقة التالية
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
