import { Course, CourseMaterial, ChatMessage } from '../types';
import { DEFAULT_COURSES } from '../data/defaultCourses';

const STORAGE_KEYS = {
  COURSES: 'classroom_ai_courses_v1',
  ACTIVE_COURSE_ID: 'classroom_ai_active_course_v1',
  CHAT_HISTORIES: 'classroom_ai_chat_histories_v1',
};

export function loadStoredCourses(): Course[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(DEFAULT_COURSES));
      setActiveCourseId('course-law-416');
      return DEFAULT_COURSES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(DEFAULT_COURSES));
      setActiveCourseId('course-law-416');
      return DEFAULT_COURSES;
    }

    // Merge default courses and filter out old deleted ones (CS302, PHYS101, MKT202)
    const obsoleteIds = ['course-ai-101', 'course-phys-101', 'course-business-202'];
    let updated = parsed.filter((c: Course) => !obsoleteIds.includes(c.id));
    for (const defCourse of DEFAULT_COURSES) {
      const idx = updated.findIndex((c: Course) => c.id === defCourse.id);
      if (idx === -1) {
        updated.unshift(defCourse);
      } else {
        // Keep rich content in sync
        updated[idx] = defCourse;
      }
    }

    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to load courses from storage:', e);
    return DEFAULT_COURSES;
  }
}

export function saveStoredCourses(courses: Course[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  } catch (e) {
    console.error('Failed to save courses to storage:', e);
  }
}

export function getActiveCourseId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_COURSE_ID);
  } catch {
    return null;
  }
}

export function setActiveCourseId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_COURSE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_COURSE_ID);
    }
  } catch (e) {
    console.error('Failed to set active course id:', e);
  }
}

export function loadChatHistory(courseId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.CHAT_HISTORIES}_${courseId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(courseId: string, messages: ChatMessage[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.CHAT_HISTORIES}_${courseId}`, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat history:', e);
  }
}

export function clearChatHistory(courseId: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEYS.CHAT_HISTORIES}_${courseId}`);
  } catch (e) {
    console.error('Failed to clear chat history:', e);
  }
}
