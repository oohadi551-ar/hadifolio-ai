import React, { useState } from 'react';
import { Course, QuizQuestion } from '../types';
import { 
  CheckSquare, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  BookOpen, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle,
  Loader2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizViewProps {
  activeCourse: Course | null;
  onOpenCourseSelector: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  activeCourse,
  onOpenCourseSelector,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [index: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'سهل' | 'متوسط' | 'متقدم'>('متوسط');
  const [topicFocus, setTopicFocus] = useState('');

  if (!activeCourse) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-3 text-center">
        <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">الرجاء اختيار مقرر دراسي أولاً</h3>
        <p className="text-xs text-slate-500 mb-4">اختر مقرراً لتوليد اختبار تدريبي مخصص مستخرج من مذكراته</p>
        <button
          onClick={onOpenCourseSelector}
          className="px-4 py-2 bg-[#6E7141] hover:bg-[#454726] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          اختر مقرراً الآن
        </button>
      </div>
    );
  }

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setIsSubmitted(false);
    setUserAnswers({});
    setCurrentIndex(0);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: activeCourse.title,
          materials: activeCourse.materials,
          questionCount,
          difficulty,
          topic: topicFocus.trim(),
        }),
      });

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        alert('لم نتمكن من توليد أسئلة، يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
      alert('حدث خطأ أثناء توليد الاختبار التدريبي.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });
    return score;
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    const ratio = score / questions.length;
    if (ratio >= 0.7) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const currentQ = questions[currentIndex];
  const score = isSubmitted ? calculateScore() : 0;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-4xl mx-auto py-3 sm:py-6 px-2 sm:px-4 lg:px-8 space-y-4 sm:space-y-6 font-['Cairo',sans-serif]">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#6E7141]/15 text-[#454726] border border-[#6E7141]/30">
              {activeCourse.code}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              اختبار تدريبي ذكي: {activeCourse.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            يتم توليد الأسئلة فورياً بناءً على محتويات {activeCourse.materials.length} مذكرات رسمية للمقرر
          </p>
        </div>

        {questions.length > 0 && !isLoading && (
          <button
            onClick={() => setQuestions([])}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-300/80 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط الاختبار</span>
          </button>
        )}
      </div>

      {/* Quiz Configuration Setup (if no active questions) */}
      {questions.length === 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-5 sm:space-y-6">
          <div className="text-center max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#6E7141]/15 text-[#454726] flex items-center justify-center mx-auto shadow-2xs">
              <CheckSquare className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">تخصيص الاختبار التدريبي</h3>
            <p className="text-xs text-slate-500">
              حدد عدد الأسئلة ومستوى الصعوبة أو ركّز على جزئية معينة من المذكرات
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-xs">
            
            {/* Question count */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">عدد الأسئلة</label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 10].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      questionCount === count
                        ? 'bg-[#6E7141] text-white border-[#6E7141] shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {count} أسئلة
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">مستوى الصعوبة</label>
              <div className="grid grid-cols-3 gap-2">
                {(['سهل', 'متوسط', 'متقدم'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      difficulty === lvl
                        ? 'bg-[#6E7141] text-white border-[#6E7141] shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Topic Focus */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700 block">
                تركيز على موضوع محدد (اختياري)
              </label>
              <input
                type="text"
                value={topicFocus}
                onChange={(e) => setTopicFocus(e.target.value)}
                placeholder="مثال: أحكام الشيك الإلكتروني، السندات التنفيذية، تنازع القوانين..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6E7141]/30 focus:border-[#6E7141]"
              />
            </div>

          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleGenerateQuiz}
              disabled={isLoading || activeCourse.materials.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-[#6E7141] hover:bg-[#454726] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all hover:shadow-md active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تحليل المذكرات وصياغة الأسئلة الذكية...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>بدء توليد الاختبار الآن</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Quiz Question Interface */}
      {questions.length > 0 && currentQ && (
        <div className="space-y-4">
          
          {/* Progress and Score Bar */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                السؤال {currentIndex + 1} من {questions.length}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">
                تمت الإجابة: {answeredCount}/{questions.length}
              </span>
            </div>

            {/* Quick Question Jump Dots */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {questions.map((_, idx) => {
                const isAnswered = userAnswers[idx] !== undefined;
                const isCurrent = currentIndex === idx;
                let bgClass = 'bg-slate-200 text-slate-600';
                if (isCurrent) bgClass = 'bg-[#6E7141] text-white ring-2 ring-[#6E7141]/30';
                else if (isSubmitted) {
                  bgClass = userAnswers[idx] === questions[idx].correctAnswerIndex ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white';
                } else if (isAnswered) {
                  bgClass = 'bg-slate-700 text-white';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-[10px] sm:text-xs font-bold transition-all shrink-0 ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 sm:space-y-5">
            
            {/* Question Text */}
            <div className="space-y-2">
              <span className="inline-block text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                مستوى الصعوبة: {currentQ.difficulty || difficulty}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentIndex] === optIdx;
                const isCorrect = optIdx === currentQ.correctAnswerIndex;
                let optStyles = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300';

                if (isSubmitted) {
                  if (isCorrect) {
                    optStyles = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    optStyles = 'bg-rose-50 border-rose-400 text-rose-950 font-medium';
                  } else {
                    optStyles = 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  optStyles = 'bg-[#6E7141]/10 border-[#6E7141] text-[#454726] font-bold ring-2 ring-[#6E7141]/20';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isSubmitted}
                    className={`w-full text-right p-3 sm:p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-start justify-between gap-3 ${optStyles}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#6E7141] text-white' : 'bg-white border border-slate-300 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </div>

                    {isSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation after submission */}
            {isSubmitted && (
              <div className="bg-amber-50/80 border border-amber-200/80 p-3 sm:p-4 rounded-2xl space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  <span>الشرح والتأصيل المرجعي من المذكرة:</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-sans">
                  {currentQ.explanation}
                </p>
                {currentQ.sourceMaterial && (
                  <div className="pt-1.5 border-t border-amber-200/60 text-[11px] text-amber-800 flex items-center gap-1 font-medium">
                    <FileText className="w-3 h-3" />
                    المصدر: {currentQ.sourceMaterial}
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </button>

              <div className="flex items-center gap-2">
                {!isSubmitted && answeredCount === questions.length && (
                  <button
                    onClick={handleSubmitQuiz}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    تصحيح وإنهاء الاختبار
                  </button>
                )}

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="flex items-center gap-1 px-4 py-2 bg-[#6E7141] hover:bg-[#454726] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                ) : !isSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    إنهاء وتصحيح
                  </button>
                ) : null}
              </div>
            </div>

          </div>

          {/* Result Card (when submitted) */}
          {isSubmitted && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${
                  score / questions.length >= 0.7 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    نتيجتك: {score} من {questions.length} ({Math.round((score / questions.length) * 100)}%)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {score / questions.length >= 0.7
                      ? 'مستوى ممتاز! استيعابك لمفاهيم ومسائل المذكرات متقدم جداً.'
                      : 'أداء جيد، يُنصح بمراجعة المسائل والشروحات الواردة في كل سؤال.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateQuiz}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#6E7141] hover:bg-[#454726] text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                توليد اختبار تدريبي جديد
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
