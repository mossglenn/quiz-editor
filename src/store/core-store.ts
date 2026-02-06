/**
 * Core Framework State Store
 * 
 * Manages application-wide state for projects and workspace context.
 * This is the framework layer - shared across all tools/plugins.
 * 
 * @module store/core-store
 * @category Framework
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project } from '@/types/core';

/**
 * Core Framework state interface.
 * 
 * Manages project-level state that all tools need access to.
 * When building tool #2, consider adding:
 * - Generic artifact list
 * - Workspace settings
 * - Collaboration state
 */
interface CoreState {
    /**
     * All projects available to the current user.
     * Loaded on app initialization from storage adapter.
     */
    projects: Project[];

    /**
     * Currently active project context.
     * Null when no project is open (e.g., on projects list page).
     * When set, tools operate within this project's scope.
     */
    currentProject: Project | null;

    /**
     * Replace the entire projects list.
     * Used when loading projects from backend or after creating/deleting projects.
     * 
     * @param projects - Complete list of user's projects
     * 
     * @example
     * const { setProjects } = useCoreStore();
     * const projects = await storageAdapter.getProjects();
     * setProjects(projects);
     */
    setProjects: (projects: Project[]) => void;

    /**
     * Set the currently active project.
     * Changes the workspace context for all tools.
     * 
     * @param project - Project to make active, or null to exit project context
     * 
     * @example
     * // Open a project
     * const { setCurrentProject } = useCoreStore();
     * setCurrentProject(selectedProject);
     * 
     * @example
     * // Exit project (return to projects list)
     * setCurrentProject(null);
     */
    setCurrentProject: (project: Project | null) => void;

    // TODO: Add when building tool #2
    // artifacts: Artifact[];
    // setArtifacts: (artifacts: Artifact[]) => void;
    // getArtifactsByType: (type: string) => Artifact[];
}

/**
 * Core Framework state store hook.
 * 
 * Uses Zustand with Immer middleware for immutable state updates.
 * This store should only contain framework-level state that multiple
 * tools need to share.
 * 
 * @returns CoreState store instance with state and actions
 * 
 * @example
 * // In a component
 * function ProjectList() {
 *   const { projects, setCurrentProject } = useCoreStore();
 *   
 *   return projects.map(project => (
 *     <ProjectCard 
 *       project={project}
 *       onClick={() => setCurrentProject(project)}
 *     />
 *   ));
 * }
 * 
 * @example
 * // Get just the current project (optimized selector)
 * function ProjectHeader() {
 *   const currentProject = useCoreStore(state => state.currentProject);
 *   return <h1>{currentProject?.name}</h1>;
 * }
 */
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
