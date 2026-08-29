import React, { useState } from 'react';
import { Course, CourseMaterial } from '../types';
import { 
  Plus, 
  Upload, 
  FileText, 
  X, 
  Check, 
  Brain, 
  Scale, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { extractTextFromFile, fileToBase64 } from '../lib/pdfHelper';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCourse: (course: Course) => void;
}

const COLORS: Array<'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'teal'> = [
  'emerald',
  'amber',
  'rose',
  'sky',
  'purple',
  'teal',
];

const ICONS = [
  { id: 'Scale', label: 'قانون ومحاكم', icon: <Scale className="w-5 h-5" /> },
  { id: 'GraduationCap', label: 'دراسات عليا', icon: <GraduationCap className="w-5 h-5" /> },
  { id: 'BookOpen', label: 'كتب ومراجع', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'Briefcase', label: 'قضايا وعقود', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'Brain', label: 'أبحاث وتحليل', icon: <Brain className="w-5 h-5" /> },
];

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onCreateCourse,
}) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState<'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'teal'>('emerald');
  const [selectedIcon, setSelectedIcon] = useState('Scale');
  const [uploadedFiles, setUploadedFiles] = useState<CourseMaterial[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingFiles(true);
    const newMaterials: CourseMaterial[] = [];

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

        newMaterials.push({
          id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          type: fileType,
          content: text || `[محتوى ملف: ${file.name}]`,
          inlineData: base64 ? { mimeType: file.type || 'application/pdf', data: base64 } : undefined,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          pageCount: pageCount || 1,
          tags: [fileType],
        });
      } catch (err) {
        console.error('Error reading file:', file.name, err);
      }
    }

    setUploadedFiles((prev) => [...prev, ...newMaterials]);
    setIsProcessingFiles(false);
  };

  const handleRemoveUploadedFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCourse: Course = {
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      code: code.trim().toUpperCase() || 'LAW',
      description: description.trim() || 'مقرر قانوني مخصص للفصل الدراسي',
      color: selectedColor,
      icon: selectedIcon,
      createdAt: new Date().toISOString(),
      materials: uploadedFiles,
    };

    onCreateCourse(newCourse);
    setTitle('');
    setCode('');
    setDescription('');
    setUploadedFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-['Cairo',sans-serif]">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92dvh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden mx-auto">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#6E7141] text-white flex items-center justify-center shadow-xs shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black text-slate-900 truncate">إضافة مقرر دراسي جديد</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">ارفع المذكرات والملفات ليفهمها المساعد فوراً</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          
          {/* Title & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المقرر القانوني *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: أحكام الالتزام، العقود الإدارية، الملكية الفكرية..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6E7141]/30 focus:border-[#6E7141] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رمز المقرر
              </label>
              <input
                type="text"
                placeholder="مثال: LAW301"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6E7141]/30 focus:border-[#6E7141] font-mono transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              وصف المقرر أو محاور المنهج
            </label>
            <textarea
              rows={2}
              placeholder="اكتب نبذة مختصرة عن المقرر وأهدافه وتفاصيله..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6E7141]/30 focus:border-[#6E7141] transition-all resize-none"
            />
          </div>

          {/* Icon & Color Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">أيقونة المقرر</label>
              <div className="flex items-center gap-2">
                {ICONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIcon(item.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                      selectedIcon === item.id
                        ? 'border-[#6E7141] bg-[#6E7141]/15 text-[#454726] shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    title={item.label}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">لون السمة</label>
              <div className="flex items-center gap-2">
                {COLORS.map((c) => {
                  const colorBg = {
                    emerald: 'bg-emerald-600',
                    amber: 'bg-amber-600',
                    rose: 'bg-rose-600',
                    sky: 'bg-sky-600',
                    purple: 'bg-purple-600',
                    teal: 'bg-teal-600',
                  }[c];

                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full ${colorBg} flex items-center justify-center transition-transform ${
                        selectedColor === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {selectedColor === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>رفع ملفات المقرر والمذكرات (PDF, TXT, MD, الصور)</span>
              <span className="text-slate-400 font-normal text-[11px]">يمكنك الإضافة لاحقاً أيضاً</span>
            </label>
            
            <label className="border-2 border-dashed border-slate-300 hover:border-[#6E7141] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-[#6E7141]/5 group">
              <input
                type="file"
                multiple
                accept=".pdf,.txt,.md,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessingFiles}
              />
              <div className="w-10 h-10 rounded-2xl bg-[#6E7141]/10 text-[#454726] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                {isProcessingFiles ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-700">
                {isProcessingFiles ? 'جاري قراءة واستخراج نصوص الملفات...' : 'انقر لاختيار مذكرات المقرر أو اسحبها هنا'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">يدعم ملفات الأنظمة، اللوائح، الكتب، والمذكرات الأكاديمية</p>
            </label>

            {/* List of uploaded files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-[#6E7141] shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{file.fileName}</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        ({(file.fileSize / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveUploadedFile(file.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isProcessingFiles}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#6E7141] hover:bg-[#454726] disabled:opacity-50 rounded-xl shadow-xs transition-all hover:shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              حفظ المقرر وبدء المذاكرة
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
