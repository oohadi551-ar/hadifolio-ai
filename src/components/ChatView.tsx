import React, { useState, useRef, useEffect } from 'react';
import { Course, ChatMessage, CourseMaterial } from '../types';
import { 
  Send, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RotateCcw, 
  Trash2,
  HelpCircle, 
  Paperclip, 
  ArrowDown, 
  Info,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { extractTextFromFile, fileToBase64 } from '../lib/pdfHelper';

interface ChatViewProps {
  activeCourse: Course | null;
  courses: Course[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearChat: () => void;
  onOpenCourseSelector: () => void;
  onAddMaterialToCourse: (material: CourseMaterial) => void;
  isLoading: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  activeCourse,
  courses,
  messages,
  onSendMessage,
  onClearChat,
  onOpenCourseSelector,
  onAddMaterialToCourse,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<{ title: string; snippet: string } | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading || !activeCourse) return;
    const text = inputText;
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('ميزة القراءة الصوتية غير مدعومة في هذا المتصفح');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*_`$]/g, '').slice(0, 1500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeCourse) return;

    setIsUploadingAttachment(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { text, pageCount } = await extractTextFromFile(file);
        let base64 = '';
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          base64 = await fileToBase64(file);
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        let fileType: CourseMaterial['type'] = 'pdf';
        if (ext === 'txt' || ext === 'md' || file.type.startsWith('text/')) {
          fileType = 'text';
        } else if (file.type.startsWith('image/')) {
          fileType = 'image';
        }

        const newMat: CourseMaterial = {
          id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          type: fileType,
          content: text || `[ملف: ${file.name}]`,
          inlineData: base64 ? { mimeType: file.type || 'application/pdf', data: base64 } : undefined,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          pageCount: pageCount || 1,
          tags: ['مرفق جديد'],
        };

        onAddMaterialToCourse(newMat);
      } catch (err) {
        console.error('Error attaching file:', err);
      }
    }
    setIsUploadingAttachment(false);
  };

  // Quick suggestions based on active course
  const defaultSuggestions = activeCourse
    ? [
        `لخص لي أهم محاور مقرر ${activeCourse.title}`,
        'ما هي المفاهيم والمصطلحات الأساسية في المذكرات؟',
        'اشرح لي المسائل والقواعد النظامية بالتفصيل مع أمثلة عملية',
        'اطرح علي سؤالاً لاختبار فهمي لما درسته في هذا المقرر',
      ]
    : [];

  return (
    <div className="flex-1 flex flex-col h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-8rem)] max-w-5xl mx-auto w-full bg-white sm:rounded-2xl sm:my-2 lg:my-3 sm:border sm:border-slate-200/80 sm:shadow-xs overflow-hidden">
      
      {/* Top Course Context Bar */}
      <div className="bg-slate-50/95 border-b border-slate-200/80 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          {activeCourse ? (
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                {activeCourse.title}
              </span>
              <span className="hidden sm:inline-block bg-[#6E7141]/15 text-[#454726] px-2 py-0.5 rounded-md font-semibold border border-[#6E7141]/30 shrink-0 text-[11px]">
                {activeCourse.materials.length} مذكرات متصلة
              </span>
            </div>
          ) : (
            <span className="text-slate-600 font-medium">لم يتم تحديد مقرر بعد</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenCourseSelector}
            className="flex items-center gap-1 text-[#6E7141] hover:text-[#454726] font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors text-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تبديل المقرر</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
              title="تصفير ومسح المحادثة بالكامل"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير المحادثة</span>
            </button>
          )}
        </div>
      </div>

      {/* Clear Chat Confirmation Banner */}
      {showClearConfirm && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1">
          <span className="font-bold text-rose-900 flex items-center gap-1.5">
            <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
            هل أنت متأكد من رغبتك في تصفير ومسح سجل محادثة هذا المقرر؟
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onClearChat();
                setShowClearConfirm(false);
              }}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-2xs transition-colors"
            >
              نعم، تصفير
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-medium border border-slate-200 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
        
        {/* If no course selected */}
        {!activeCourse ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4 shadow-xs">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">اختر مقرراً للبدء</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              اختر أحد المقررات القانونية المتاحة، وسيقوم المساعد الذكي بفهم كافة مذكراته والإجابة على استفساراتك بدقة متناهية.
            </p>
            <button
              onClick={onOpenCourseSelector}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#6E7141] hover:bg-[#454726] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
            >
              <Sparkles className="w-4 h-4" />
              عرض قائمة المقررات الدراسية
            </button>
          </div>
        ) : messages.length === 0 ? (
          
          /* Empty Chat Welcome Screen for Active Course */
          <div className="max-w-2xl mx-auto py-4 sm:py-8 text-center space-y-4 sm:space-y-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#6E7141] to-[#454726] text-white flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2">
                مرحباً بك في مساعد مقرر: {activeCourse.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                تم استيعاب وفهرسة {activeCourse.materials.length} مذكرات رسمية متصلة بهذا المقرر. يمكنك الاستفسار عن الأنظمة، القواعد، الشروط، أو طلب نماذج وملخصات فورية!
              </p>
            </div>

            {/* Quick Attached Materials Badges */}
            {activeCourse.materials.length > 0 && (
              <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200/80 text-right">
                <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#6E7141]" />
                  المذكرات والملفات المرجعية المعتمدة للإجابة:
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {activeCourse.materials.map((m) => (
                    <span
                      key={m.id}
                      className="text-xs bg-white text-slate-700 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 font-medium flex items-center gap-1.5 shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate max-w-[200px]">{m.title}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Starter Suggestion Chips */}
            <div className="space-y-2 text-right">
              <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-[#6E7141]" />
                اقتراحات لبدء المحادثة فوراً:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {defaultSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(suggestion)}
                    className="p-2.5 sm:p-3 text-xs text-right bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-xl text-slate-800 font-medium transition-all shadow-2xs hover:shadow-xs group flex items-start gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#6E7141] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="leading-relaxed">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          
          /* Message List */
          messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-start flex-row-reverse' : 'justify-start'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs text-xs font-bold ${
                    isUser
                      ? 'bg-slate-800 text-white'
                      : 'bg-gradient-to-br from-[#6E7141] to-[#454726] text-white'
                  }`}
                >
                  {isUser ? 'أنت' : <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4.5 transition-all ${
                    isUser
                      ? 'bg-[#6E7141] text-white rounded-tl-xs shadow-xs'
                      : 'bg-slate-50 text-slate-900 border border-slate-200/80 rounded-tr-xs shadow-xs'
                  }`}
                >
                  {/* Markdown Content */}
                  <div className={`prose prose-sm max-w-none text-xs sm:text-sm leading-relaxed ${isUser ? 'text-white prose-invert' : 'text-slate-800'}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Sources / Citations Section */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200/70">
                      <p className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#6E7141]" />
                        المصادر والمراجع المقتبسة من مذكرات المقرر:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveCitation({ title: src.materialTitle, snippet: src.snippet || '' })}
                            className="text-[11px] font-medium bg-white hover:bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200/80 flex items-center gap-1 transition-colors shadow-2xs"
                            title="انقر لعرض المقتطف المرجعي"
                          >
                            <FileText className="w-3 h-3 text-amber-700" />
                            <span className="truncate max-w-[220px]">{src.materialTitle}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-Ups */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200/70">
                      <p className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        أسئلة مقترحة لمزيد من التعمق:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((question, i) => (
                          <button
                            key={i}
                            onClick={() => onSendMessage(question)}
                            className="text-[11px] text-right bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all font-medium flex items-center gap-1 shadow-2xs"
                          >
                            <span>💡 {question}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bubble Actions */}
                  {!isUser && (
                    <div className="mt-2.5 sm:mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                      <span>{new Date(msg.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            speakingId === msg.id ? 'text-[#6E7141] bg-slate-200' : 'hover:text-slate-600 hover:bg-white'
                          }`}
                          title="قراءة صوتية"
                        >
                          {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1.5 rounded-lg hover:text-slate-600 hover:bg-white transition-colors"
                          title="نسخ الإجابة"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 sm:gap-3 justify-start items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#6E7141] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tr-xs p-3.5 text-xs text-slate-600 flex items-center gap-3 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#6E7141]" />
              <span>جاري استرجاع نصوص المذكرات وتحليل الإجابة النظامية الدقيقة...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Citation Popover Modal */}
      {activeCitation && (
        <div className="bg-amber-50 border-t border-b border-amber-200 px-3 sm:px-4 py-2.5 sm:py-3 flex items-start justify-between gap-3 text-xs animate-in slide-in-from-bottom-2">
          <div>
            <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              المقتطف المرجعي من مذكرة: "{activeCitation.title}"
            </span>
            <p className="text-amber-800 leading-relaxed font-mono text-[11px] bg-white/80 p-2 rounded-lg border border-amber-200/60">
              {activeCitation.snippet || 'تم الاستشهاد بالمعلومات من نصوص هذه المذكرة.'}
            </p>
          </div>
          <button
            onClick={() => setActiveCitation(null)}
            className="text-amber-800 hover:text-amber-950 font-bold px-2.5 py-1 bg-amber-100 rounded-lg shrink-0"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-2.5 sm:p-4 bg-slate-50 border-t border-slate-200">
        <form onSubmit={handleSend} className="relative flex items-end gap-1.5 sm:gap-2 bg-white p-1.5 sm:p-2 rounded-2xl border border-slate-200 shadow-2xs focus-within:ring-2 focus-within:ring-[#6E7141]/30 focus-within:border-[#6E7141] transition-all">
          
          {/* File Attachment Button */}
          <label
            className={`p-2 text-slate-400 hover:text-[#6E7141] rounded-xl hover:bg-slate-100 cursor-pointer transition-colors shrink-0 ${
              isUploadingAttachment ? 'opacity-50 pointer-events-none' : ''
            }`}
            title="إرفاق مذكرة جديدة لهذا المقرر"
          >
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.md,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
            {isUploadingAttachment ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#6E7141]" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </label>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              activeCourse
                ? `اطرح استفسارك القانوني حول "${activeCourse.title}"...`
                : 'الرجاء اختيار مقرر للبدء...'
            }
            disabled={!activeCourse || isLoading}
            className="flex-1 max-h-28 py-1.5 px-2 text-xs sm:text-sm bg-transparent border-0 focus:outline-none resize-none text-slate-900 placeholder:text-slate-400 leading-relaxed"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || !activeCourse}
            className="p-2 sm:p-2.5 rounded-xl bg-[#6E7141] hover:bg-[#454726] text-white disabled:opacity-40 disabled:hover:bg-[#6E7141] transition-all shadow-xs shrink-0"
            title="إرسال السؤال"
          >
            <Send className="w-4 h-4 rtl:-rotate-90" />
          </button>
        </form>

        <p className="text-[10px] sm:text-[11px] text-center text-slate-400 mt-1.5">
          يستند المساعد الذكي بدقة متناهية إلى مذكرات المقرر ومواده المعتمدة
        </p>
      </div>

    </div>
  );
};
