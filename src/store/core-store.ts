// src/store/core-store.ts (FRAMEWORK)
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project } from '@/types/core';

interface CoreState {
    projects: Project[];
    currentProject: Project | null;

    setProjects: (projects: Project[]) => void;
    setCurrentProject: (project: Project | null) => void;
    // TODO: Add generic artifact management when building tool #2
}

export const useCoreStore = create<CoreState>()(
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
