import React, { useState, useEffect } from 'react';
import { Course, CourseMaterial, ChatMessage } from './types';
import { 
  loadStoredCourses, 
  saveStoredCourses, 
  getActiveCourseId, 
  setActiveCourseId, 
  loadChatHistory, 
  saveChatHistory, 
  clearChatHistory 
} from './lib/storage';
import { Header } from './components/Header';
import { CourseSelectorModal } from './components/CourseSelectorModal';
import { CreateCourseModal } from './components/CreateCourseModal';
import { ChatView } from './components/ChatView';
import { MaterialsView } from './components/MaterialsView';
import { QuizView } from './components/QuizView';
import { StudyGuideView } from './components/StudyGuideView';
import { FlashcardsView } from './components/FlashcardsView';
import { PinLockModal } from './components/PinLockModal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('hadifolio_authenticated') === 'true';
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseIdState] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'materials' | 'summary' | 'quiz' | 'flashcards'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isCourseSelectorOpen, setIsCourseSelectorOpen] = useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const storedCourses = loadStoredCourses();
    setCourses(storedCourses);

    const savedActiveId = getActiveCourseId();
    if (savedActiveId && storedCourses.some((c) => c.id === savedActiveId)) {
      setActiveCourseIdState(savedActiveId);
      const history = loadChatHistory(savedActiveId);
      setMessages(history);
    } else if (storedCourses.length > 0) {
      // Default to first course or open selector
      const first = storedCourses[0];
      setActiveCourseIdState(first.id);
      setActiveCourseId(first.id);
      setMessages(loadChatHistory(first.id));
    }
  }, []);

  const activeCourse = courses.find((c) => c.id === activeCourseId) || null;

  // Handle course change
  const handleSelectCourse = (course: Course) => {
    setActiveCourseIdState(course.id);
    setActiveCourseId(course.id);
    const history = loadChatHistory(course.id);
    setMessages(history);
    setIsCourseSelectorOpen(false);
    setActiveTab('chat');
  };

  // Handle adding a newly created course
  const handleCreateCourse = (newCourse: Course) => {
    const updatedCourses = [newCourse, ...courses];
    setCourses(updatedCourses);
    saveStoredCourses(updatedCourses);
    handleSelectCourse(newCourse);
    setIsCreateCourseOpen(false);
  };

  // Handle deleting a course
  const handleDeleteCourse = (courseId: string) => {
    const updated = courses.filter((c) => c.id !== courseId);
    setCourses(updated);
    saveStoredCourses(updated);
    clearChatHistory(courseId);

    if (activeCourseId === courseId) {
      const nextCourse = updated[0] || null;
      setActiveCourseIdState(nextCourse ? nextCourse.id : null);
      setActiveCourseId(nextCourse ? nextCourse.id : null);
      setMessages(nextCourse ? loadChatHistory(nextCourse.id) : []);
    }
  };

  // Handle adding material to active course
  const handleAddMaterialToCourse = (material: CourseMaterial) => {
    if (!activeCourse) return;

    const updatedCourses = courses.map((c) => {
      if (c.id === activeCourse.id) {
        return {
          ...c,
          materials: [material, ...c.materials],
        };
      }
      return c;
    });

    setCourses(updatedCourses);
    saveStoredCourses(updatedCourses);
  };

  // Handle deleting material
  const handleDeleteMaterial = (materialId: string) => {
    if (!activeCourse) return;

    const updatedCourses = courses.map((c) => {
      if (c.id === activeCourse.id) {
        return {
          ...c,
          materials: c.materials.filter((m) => m.id !== materialId),
        };
      }
      return c;
    });

    setCourses(updatedCourses);
    saveStoredCourses(updatedCourses);
  };

  // Handle sending chat message
  const handleSendMessage = async (text: string) => {
    if (!activeCourse || !text.trim() || isLoadingChat) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveChatHistory(activeCourse.id, newMessages);
    setIsLoadingChat(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: activeCourse.title,
          courseCode: activeCourse.code,
          materials: activeCourse.materials,
          messages: newMessages,
          userQuery: text.trim(),
        }),
      });

      const data = await response.json();

      if (data.reply) {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
          sources: data.sources || [],
          suggestedFollowUps: data.suggestedFollowUps || [],
        };

        const finalMessages = [...newMessages, assistantMsg];
        setMessages(finalMessages);
        saveChatHistory(activeCourse.id, finalMessages);
      } else {
        const errorMsg: ChatMessage = {
          id: `msg-${Date.now()}-err`,
          role: 'assistant',
          content: 'عذراً، لم أتمكن من الحصول على إجابة من المساعد في الوقت الحالي. يرجى التحقق من صياغة السؤال والمحاولة ثانية.',
          timestamp: new Date().toISOString(),
        };
        const finalMessages = [...newMessages, errorMsg];
        setMessages(finalMessages);
        saveChatHistory(activeCourse.id, finalMessages);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `حدث خطأ في الاتصال بالخادم: ${err?.message || 'يرجى المحاولة لاحقاً.'}`,
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...newMessages, errorMsg];
      setMessages(finalMessages);
      saveChatHistory(activeCourse.id, finalMessages);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Handle clearing chat
  const handleClearChat = () => {
    if (!activeCourse) return;
    setMessages([]);
    clearChatHistory(activeCourse.id);
  };

  // Switch to chat with a prefilled topic
  const handleStartChatWithTopic = (topicQuery: string) => {
    setActiveTab('chat');
    handleSendMessage(topicQuery);
  };

  const handleLock = () => {
    sessionStorage.removeItem('hadifolio_authenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <PinLockModal onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-[100dvh] bg-slate-100/70 flex flex-col antialiased selection:bg-[#6E7141]/20 selection:text-[#454726] font-['Cairo',sans-serif]">
      
      {/* Top Navigation Header */}
      <Header
        activeCourse={activeCourse}
        courses={courses}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCourseSelector={() => setIsCourseSelectorOpen(true)}
        onOpenCreateCourse={() => setIsCreateCourseOpen(true)}
        onLockApp={handleLock}
      />

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col p-1.5 sm:p-3 md:p-4 max-w-7xl mx-auto w-full">
        {activeTab === 'chat' && (
          <ChatView
            activeCourse={activeCourse}
            courses={courses}
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onOpenCourseSelector={() => setIsCourseSelectorOpen(true)}
            onAddMaterialToCourse={handleAddMaterialToCourse}
            isLoading={isLoadingChat}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsView
            activeCourse={activeCourse}
            onAddMaterial={handleAddMaterialToCourse}
            onDeleteMaterial={handleDeleteMaterial}
            onStartChatWithTopic={handleStartChatWithTopic}
          />
        )}

        {activeTab === 'summary' && (
          <StudyGuideView
            activeCourse={activeCourse}
            onOpenCourseSelector={() => setIsCourseSelectorOpen(true)}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            activeCourse={activeCourse}
            onOpenCourseSelector={() => setIsCourseSelectorOpen(true)}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsView
            activeCourse={activeCourse}
            onOpenCourseSelector={() => setIsCourseSelectorOpen(true)}
          />
        )}
      </main>

      {/* Course Selection Modal */}
      <CourseSelectorModal
        isOpen={isCourseSelectorOpen}
        courses={courses}
        activeCourseId={activeCourseId}
        onSelectCourse={handleSelectCourse}
        onClose={() => setIsCourseSelectorOpen(false)}
        onCreateNewCourse={() => {
          setIsCourseSelectorOpen(false);
          setIsCreateCourseOpen(true);
        }}
        onDeleteCourse={handleDeleteCourse}
      />

      {/* Create New Course Modal */}
      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        onCreateCourse={handleCreateCourse}
      />

    </div>
  );
}
