import React, { useState } from 'react';
import { Course, CourseMaterial } from '../types';
import { 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  BookOpen, 
  Sparkles, 
  Eye, 
  Calendar, 
  Layers, 
  X, 
  Loader2, 
  MessageSquare,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';
import { extractTextFromFile, fileToBase64 } from '../lib/pdfHelper';

interface MaterialsViewProps {
  activeCourse: Course | null;
  onAddMaterial: (material: CourseMaterial) => void;
  onDeleteMaterial: (materialId: string) => void;
  onStartChatWithTopic: (topic: string) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  activeCourse,
  onAddMaterial,
  onDeleteMaterial,
  onStartChatWithTopic,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [isAddingTextNote, setIsAddingTextNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  if (!activeCourse) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">الرجاء اختيار مقرر أولاً</h3>
        <p className="text-xs text-slate-500">اختر مقرراً لعرض ورفع مذكراته ومواده</p>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
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
          id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          type: fileType,
          content: text || `[ملف: ${file.name}]`,
          inlineData: base64 ? { mimeType: file.type || 'application/pdf', data: base64 } : undefined,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          pageCount: pageCount || 1,
          summary: `مستند تم رفعه لمقرر ${activeCourse.title}. يشتمل على ${pageCount || 1} صفحات.`,
          tags: [fileType, 'مرفق جديد'],
        };

        onAddMaterial(newMat);
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
    setIsUploading(false);
  };

  const handleSaveTextNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newMat: CourseMaterial = {
      id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: noteTitle.trim(),
      fileName: `${noteTitle.trim()}.txt`,
      type: 'notes',
      content: noteContent.trim(),
      fileSize: new Blob([noteContent]).size,
      uploadedAt: new Date().toISOString(),
      pageCount: 1,
      summary: 'ملاحظة ومحتوى نصي مخصص تمت إضافته للمقرر.',
      tags: ['ملاحظة نصية', 'ملخص'],
    };

    onAddMaterial(newMat);
    setNoteTitle('');
    setNoteContent('');
    setIsAddingTextNote(false);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />;
      case 'image':
        return <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />;
      case 'notes':
      case 'text':
        return <FileCode className="w-5 h-5 sm:w-6 sm:h-6 text-[#6E7141]" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-3 sm:py-6 px-2 sm:px-4 lg:px-8 space-y-4 sm:space-y-6 font-['Cairo',sans-serif]">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#6E7141]/15 text-[#454726] border border-[#6E7141]/30">
              {activeCourse.code}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              المذكرات المعتمدة: {activeCourse.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            جميع المذكرات والملفات المحفوظة هنا تُستخدم كمرجع أساسي موثوق للإجابة الدقيقة وتوليد الاختبارات
          </p>
        </div>

        {/* Upload Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#6E7141] hover:bg-[#454726] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all hover:shadow-md">
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.md,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isUploading ? 'جاري الرفع...' : 'رفع مذكرة جديدة'}</span>
          </label>

          <button
            onClick={() => setIsAddingTextNote(true)}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-300/80"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة ملخص نصي</span>
          </button>
        </div>
      </div>

      {/* Add Text Note Modal */}
      {isAddingTextNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">إضافة مذكرة أو تلخيص نصي للمقرر</h3>
              <button onClick={() => setIsAddingTextNote(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTextNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المذكرة / الموضوع</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="مثال: القواعد الفقهية الحاكمة للعقود التجارية..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E7141]/30 focus:border-[#6E7141]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نص المذكرة أو الشرح</label>
                <textarea
                  rows={6}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="الصق المحتوى أو اكتب النقاط الرئيسية هنا..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E7141]/30 focus:border-[#6E7141] resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTextNote(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6E7141] hover:bg-[#454726] text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  حفظ في مذكرات المقرر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {activeCourse.materials.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1">لا توجد مذكرات مضافة لهذا المقرر بعد</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              ارفع مذكرات المحاضرات أو ملفات PDF أو ملاحظاتك، وسيقوم المساعد الذكي بتحليلها فوراً.
            </p>
          </div>
        ) : (
          activeCourse.materials.map((mat) => {
            const wordCount = mat.content ? mat.content.split(/\s+/).length : 0;

            return (
              <div
                key={mat.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 shrink-0">
                        {getFileIcon(mat.type)}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                          {mat.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{mat.fileName}</span>
                          <span>•</span>
                          <span>{mat.pageCount ? `${mat.pageCount} ص` : `${Math.round(mat.fileSize / 1024)} KB`}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteMaterial(mat.id)}
                      className="text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
                      title="حذف هذه المذكرة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary / Snippet */}
                  <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                    {mat.summary || mat.content?.slice(0, 180) + '...'}
                  </p>

                  {/* Tags */}
                  {mat.tags && mat.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {mat.tags.map((t, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-slate-400">
                    ~{wordCount.toLocaleString()} كلمة
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedMaterial(mat)}
                      className="flex items-center gap-1 text-slate-700 hover:text-[#454726] px-2.5 py-1.5 rounded-lg hover:bg-slate-100 font-bold transition-colors text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      عرض المحتوى
                    </button>

                    <button
                      onClick={() => onStartChatWithTopic(`اشرح لي محتوى مذكرة "${mat.title}" بالتفصيل`)}
                      className="flex items-center gap-1 text-white bg-[#6E7141] hover:bg-[#454726] px-3 py-1.5 rounded-lg font-bold transition-colors shadow-2xs text-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      اسأل عنها
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Material Detail Full Viewer Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85dvh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  {getFileIcon(selectedMaterial.type)}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">{selectedMaterial.title}</h3>
                  <p className="text-xs text-slate-500">{selectedMaterial.fileName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs sm:text-sm text-slate-800 leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
              {selectedMaterial.content || 'لا يوجد نص مستخرج متاح لهذا الملف.'}
            </div>

            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                الحجم: {Math.round(selectedMaterial.fileSize / 1024)} KB • الصفحات: {selectedMaterial.pageCount || 1}
              </span>
              <button
                onClick={() => {
                  const title = selectedMaterial.title;
                  setSelectedMaterial(null);
                  onStartChatWithTopic(`لخص لي أهم المسائل الواردة في مذكرة "${title}"`);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#6E7141] hover:bg-[#454726] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                طلب تلخيص شامل في المحادثة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
