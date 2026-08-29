import React from 'react';
import { Course } from '../types';
import { AppLogo } from './AppLogo';
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Sparkles, 
  CheckSquare, 
  Layers, 
  ChevronDown, 
  Plus, 
  Library,
  Lock
} from 'lucide-react';

interface HeaderProps {
  activeCourse: Course | null;
  courses: Course[];
  activeTab: 'chat' | 'materials' | 'summary' | 'quiz' | 'flashcards';
  onSelectTab: (tab: 'chat' | 'materials' | 'summary' | 'quiz' | 'flashcards') => void;
  onOpenCourseSelector: () => void;
  onOpenCreateCourse: () => void;
  onLockApp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCourse,
  courses,
  activeTab,
  onSelectTab,
  onOpenCourseSelector,
  onOpenCreateCourse,
  onLockApp,
}) => {
  const getCourseColorClass = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50/95 text-emerald-800 border-emerald-300/80 hover:bg-emerald-100/90';
      case 'amber':
        return 'bg-amber-50/95 text-amber-900 border-amber-300/80 hover:bg-amber-100/90';
      case 'rose':
        return 'bg-rose-50/95 text-rose-900 border-rose-300/80 hover:bg-rose-100/90';
      case 'sky':
        return 'bg-sky-50/95 text-sky-900 border-sky-300/80 hover:bg-sky-100/90';
      case 'purple':
        return 'bg-purple-50/95 text-purple-900 border-purple-300/80 hover:bg-purple-100/90';
      case 'teal':
        return 'bg-teal-50/95 text-teal-900 border-teal-300/80 hover:bg-teal-100/90';
      default:
        return 'bg-[#6E7141]/10 text-[#454726] border-[#6E7141]/30 hover:bg-[#6E7141]/20';
    }
  };

  const navItems = [
    { id: 'chat', label: 'المحادثة الذكية', icon: MessageSquare, badge: null },
    { id: 'materials', label: 'المذكرات', icon: FileText, badge: activeCourse?.materials.length || 0 },
    { id: 'summary', label: 'دليل المراجعة', icon: Sparkles, badge: null },
    { id: 'quiz', label: 'اختبار تدريبي', icon: CheckSquare, badge: null },
    { id: 'flashcards', label: 'بطاقات الاستذكار', icon: Layers, badge: null },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        
        {/* Main Navbar Top Row */}
        <div className="flex items-center justify-between h-13 sm:h-16 gap-1.5 sm:gap-3">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button 
              onClick={onOpenCourseSelector}
              className="p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 shadow-2xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0"
              title="القائمة الرئيسية للمقررات"
            >
              <AppLogo size={30} className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-xs sm:text-sm md:text-base font-black text-slate-900 leading-tight tracking-tight whitespace-nowrap">
                  هادي المساعد الشخصي
                </span>
                <span className="hidden lg:inline-block text-[10px] font-bold bg-[#6E7141]/15 text-[#454726] px-1.5 py-0.2 rounded-md border border-[#6E7141]/30">
                  قانون
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden md:block leading-tight">
                المساعد الأكاديمي الذكي
              </span>
            </div>
          </div>

          {/* Active Course Switcher Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 max-w-[160px] sm:max-w-xs md:max-w-sm justify-center">
            <button
              id="btn-switch-course"
              onClick={onOpenCourseSelector}
              className={`w-full flex items-center justify-between gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] ${
                activeCourse
                  ? getCourseColorClass(activeCourse.color)
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="اختر أو غيّر المقرر الدراسي"
            >
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 truncate">
                <BookOpen className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <div className="text-right min-w-0 truncate">
                  {activeCourse ? (
                    <span className="font-bold block truncate text-[11px] sm:text-xs">
                      {activeCourse.title}
                    </span>
                  ) : (
                    <span className="text-slate-600 text-xs">اختر مقرراً...</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-md bg-white/90 font-bold border border-black/5 text-slate-700">
                  {activeCourse ? `${activeCourse.materials.length}` : `${courses.length}`}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </div>
            </button>

            <button
              id="btn-new-course-header"
              onClick={onOpenCreateCourse}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-xl transition-colors shrink-0 active:scale-95"
              title="إضافة مقرر جديد"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>مقرر جديد</span>
            </button>
          </div>

          {/* Feature Navigation Tabs on Desktop */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs font-bold ring-1 ring-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#6E7141]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge > 0 && (
                    <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded-full font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              id="btn-all-courses-view"
              onClick={onOpenCourseSelector}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200/80 transition-colors shadow-2xs shrink-0"
              title="عرض جميع المقررات والمذكرات"
            >
              <Library className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {onLockApp && (
              <button
                onClick={onLockApp}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-amber-800 bg-amber-50/90 hover:bg-amber-100 active:bg-amber-200 border border-amber-200/80 transition-colors shadow-2xs shrink-0"
                title="قفل المنصة برمز المرور"
              >
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Mobile & Tablet Responsive Sub Navigation Tabs - Smooth Horizontal Scroll Track */}
        <div className="xl:hidden border-t border-slate-100/90 py-1.5 px-0.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x scroll-smooth pb-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-bold transition-all active:scale-95 ${
                    isActive
                      ? 'bg-[#6E7141] text-white shadow-xs'
                      : 'text-slate-700 bg-slate-100/90 hover:bg-slate-200 border border-slate-200/60 shadow-2xs'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold leading-none ${
                      isActive ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
};
