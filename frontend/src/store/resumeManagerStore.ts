import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Resume } from '../types';

export interface ManagedResume {
  id: string;
  name: string;
  data: Resume;
  updatedAt: string; // ISO string
}

interface ResumeManagerState {
  resumes: ManagedResume[];
  activeResumeId: string | null;
  createResume: (name: string, data: Resume) => ManagedResume;
  setActiveResume: (id: string) => void;
  updateResumeData: (id: string, data: Resume) => void;
  renameResume: (id: string, name: string) => void;
  deleteResume: (id: string) => void;
}

const generateId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useResumeManagerStore = create<ResumeManagerState>()(
  persist(
    (set) => ({
      resumes: [],
      activeResumeId: null,
      createResume: (name, data) => {
        const id = generateId();
        const item: ManagedResume = { id, name: name.trim() || 'Untitled Resume', data, updatedAt: new Date().toISOString() };
        set((state) => ({ resumes: [item, ...state.resumes], activeResumeId: id }));
        return item;
      },
      setActiveResume: (id) => set({ activeResumeId: id }),
      updateResumeData: (id, data) => {
        set((state) => ({
          resumes: state.resumes.map((r) => (r.id === id ? { ...r, data, updatedAt: new Date().toISOString() } : r)),
        }));
      },
      renameResume: (id, name) => {
        set((state) => ({
          resumes: state.resumes.map((r) => (r.id === id ? { ...r, name: name.trim() || r.name, updatedAt: new Date().toISOString() } : r)),
        }));
      },
      deleteResume: (id) => {
        set((state) => {
          const filtered = state.resumes.filter((r) => r.id !== id);
          const activeResumeId = state.activeResumeId === id ? (filtered[0]?.id ?? null) : state.activeResumeId;
          return { resumes: filtered, activeResumeId };
        });
      },
    }),
    {
      name: 'resumeManager',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
