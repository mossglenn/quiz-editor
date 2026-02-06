// src/store/idide-store.ts (FRAMEWORK)
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project } from '@/types/idide';

interface IDIDEState {
    projects: Project[];
    currentProject: Project | null;

    setProjects: (projects: Project[]) => void;
    setCurrentProject: (project: Project | null) => void;
    // TODO: IDIDE candidate - add generic artifact management
}

export const useIDIDEStore = create<IDIDEState>()(
    immer((set) => ({
        projects: [],
        currentProject: null,

        setProjects: (projects) =>
            set((state) => {
                state.projects = projects;
            }),
        setCurrentProject: (project) =>
            set((state) => {
                state.currentProject = project;
            }),
    }))
);
