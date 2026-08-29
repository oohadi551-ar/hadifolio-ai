import React, { useState } from 'react';
import { Course } from '../types';
import { AppLogo } from './AppLogo';
import { 
  BookOpen, 
  Plus, 
  FileText, 
  Sparkles, 
  MessageSquare, 
  Search, 
  Trash2, 
  Scale,
  GraduationCap, 
  X
} from 'lucide-react';

interface CourseSelectorModalProps {
  isOpen: boolean;
  courses: Course[];
  activeCourseId: string | null;
  onSelectCourse: (course: Course) => void;
  onClose: () => void;
  onCreateNewCourse: () => void;
  onDeleteCourse: (courseId: string) => void;
}

export const CourseSelectorModal: React.FC<CourseSelectorModalProps> = ({
  isOpen,
  courses,
  activeCourseId,
  onSelectCourse,
  onClose,
  onCreateNewCourse,
  onDeleteCourse,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getColorStyles = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-50/80 hover:bg-emerald-100/70 border-emerald-200/80',
          badge: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
          iconBg: 'bg-emerald-700 text-white',
          btn: 'bg-emerald-700 hover:bg-emerald-800 text-white',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50/80 hover:bg-amber-100/70 border-amber-200/80',
          badge: 'bg-amber-100 text-amber-900 border border-amber-200',
          iconBg: 'bg-amber-700 text-white',
          btn: 'bg-amber-700 hover:bg-amber-800 text-white',
        };
      case 'rose':
        return {
          bg: 'bg-rose-50/80 hover:bg-rose-100/70 border-rose-200/80',
          badge: 'bg-rose-100 text-rose-900 border border-rose-200',
          iconBg: 'bg-rose-700 text-white',
          btn: 'bg-rose-700 hover:bg-rose-800 text-white',
        };
      case 'sky':
        return {
          bg: 'bg-sky-50/80 hover:bg-sky-100/70 border-sky-200/80',
          badge: 'bg-sky-100 text-sky-900 border border-sky-200',
          iconBg: 'bg-sky-700 text-white',
          btn: 'bg-sky-700 hover:bg-sky-800 text-white',
        };
      default:
        return {
          bg: 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200',
          badge: 'bg-[#6E7141]/15 text-[#454726] border border-[#6E7141]/30',
          iconBg: 'bg-[#6E7141] text-white',
          btn: 'bg-[#6E7141] hover:bg-[#454726] text-white',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-['Cairo',sans-serif]">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-4xl max-h-[92dvh] flex flex-col overflow-hidden mx-auto">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2.5 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1 sm:p-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xs shrink-0">
              <AppLogo size={32} className="w-7 h-7 sm:w-9 sm:h-9" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black text-slate-900 truncate">
                المقررات الدراسية - هادي
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                اختر مقرراً لبدء المذاكرة التفاعلية أو أضف مقرراً جديداً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-slate-50/40">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث في المقررات أو الرمز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E7141]/30 focus:border-[#6E7141]"
            />
          </div>

          <button
            onClick={onCreateNewCourse}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#6E7141] hover:bg-[#454726] rounded-xl shadow-xs transition-all hover:shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            إضافة مقرر جديد ورفع مذكراته
          </button>
        </div>

        {/* Courses Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredCourses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium text-sm">لم يتم العثور على مقررات مطابقة للبحث</p>
              <button
                onClick={onCreateNewCourse}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#454726] bg-[#6E7141]/15 rounded-xl hover:bg-[#6E7141]/25"
              >
                <Plus className="w-4 h-4" />
                إنشاء مقرر جديد الآن
              </button>
            </div>
          ) : (
            filteredCourses.map((course) => {
              const styles = getColorStyles(course.color);
              const isActive = course.id === activeCourseId;
              const totalWords = course.materials.reduce((acc, m) => acc + (m.content ? m.content.split(/\s+/).length : 0), 0);

              return (
                <div
                  key={course.id}
                  className={`relative group rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between ${styles.bg} ${
                    isActive ? 'ring-2 ring-[#6E7141] ring-offset-2 shadow-md' : 'hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Card Top */}
                    <div className="flex items-start justify-between gap-3 mb-2.5 sm:mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${styles.iconBg}`}>
                          <Scale className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${styles.badge}`}>
                            {course.code || 'LAW'}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1 line-clamp-1">
                            {course.title}
                          </h3>
                        </div>
                      </div>

                      {/* Delete action */}
                      {courses.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`هل أنت متأكد من حذف مقرر "${course.title}" وكافة مذكراته؟`)) {
                              onDeleteCourse(course.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                          title="حذف المقرر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
                      {course.description || 'لا يوجد وصف مضاف لهذا المقرر.'}
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-lg border border-slate-200/60 font-medium">
                        <FileText className="w-3.5 h-3.5 text-[#6E7141]" />
                        {course.materials.length} مذكرات رسمية
                      </span>
                      {totalWords > 0 && (
                        <span className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-lg border border-slate-200/60 font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          ~{totalWords.toLocaleString()} كلمة
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectCourse(course)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${styles.btn}`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {isActive ? 'المقرر الفعّال (فتح المحادثة)' : 'تحديد وبدء المذاكرة الذكية'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>إجمالي المقررات: {courses.length}</span>
          <span>جميع المحتويات والمذكرات والمحادثات مخزنة ومحمية محلياً</span>
        </div>

      </div>
    </div>
  );
};
