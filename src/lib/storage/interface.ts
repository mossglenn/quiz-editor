/**
 * Universal Storage Adapter Interface
 * 
 * This interface defines the contract for all data persistence operations.
 * It abstracts storage implementation details so the app can seamlessly
 * swap between different backends:
 * - SupabaseAdapter (cloud: Postgres + RLS)
 * - SQLiteAdapter (desktop: local database, Phase 4)
 * 
 * All data access must go through this interface. No components should
 * directly import Supabase or database clients.
 * 
 * @module lib/storage/interface
 * @category Core Framework
 * 
 * @example
 * // Using the adapter in a component
 * import { storageAdapter } from '@/lib/storage';
 * 
 * async function loadProjects() {
 *   const projects = await storageAdapter.getProjects();
 *   useCoreStore.getState().setProjects(projects);
 * }
 */

import type { Artifact, ArtifactLink, Project } from '@/types/core';

/**
 * Storage adapter interface for data persistence operations.
 * 
 * Implementation notes:
 * - All methods are async (return Promises)
 * - Methods return null when entity not found (not undefined)
 * - Methods throw errors on failure (not return error objects)
 * - Transactions are handled internally by implementations
 * - RLS (Row Level Security) enforcement in Supabase adapter
 */
export interface StorageAdapter {
    // --- Projects ---

    /**
     * Retrieve all projects accessible to the current user.
     * 
     * For SupabaseAdapter:
     * - Uses RLS to filter by user permissions
     * - Returns projects user owns or collaborates on
     * - Sorted by updated_at descending (most recent first)
     * 
     * For SQLiteAdapter (Phase 4):
     * - Returns all projects in local database
     * - No user filtering (single-user desktop app)
     * 
     * @returns Promise resolving to array of projects (empty if none)
     * @throws Error if database query fails
     * 
     * @example
     * // Load projects on app startup
     * const projects = await adapter.getProjects();
     * useCoreStore.getState().setProjects(projects);
     * 
     * @example
     * // Refresh projects after creating/deleting
     * await adapter.createProject({ name: 'New Project' });
     * const projects = await adapter.getProjects();
     * useCoreStore.getState().setProjects(projects);
     */
    getProjects(): Promise<Project[]>;

    /**
     * Retrieve a single project by ID.
     * 
     * @param id - Project UUID
     * @returns Promise resolving to project or null if not found
     * @throws Error if database query fails or user lacks access (RLS)
     * 
     * @example
     * // Load project for detail page
     * const project = await adapter.getProject(projectId);
     * if (!project) {
     *   throw new Error('Project not found');
     * }
     * useCoreStore.getState().setCurrentProject(project);
     */
    getProject(id: string): Promise<Project | null>;

    /**
     * Create a new project.
     * 
     * The adapter implementation handles:
     * - Generating unique ID
     * - Setting created_at and updated_at timestamps
     * - Setting owner_id from current user context
     * - Creating default collaborator record (owner role)
     * 
     * @param project - Project data without system-generated fields
     * @returns Promise resolving to created project with full fields
     * @throws Error if creation fails or validation fails
     * 
     * @example
     * // Create a project
     * const newProject = await adapter.createProject({
     *   name: 'My Quiz Bank',
     *   description: 'Questions for training module',
     *   owner_id: userId, // Will be set from auth context in Supabase
     * });
     * 
     * // Update store
     * const projects = await adapter.getProjects();
     * useCoreStore.getState().setProjects(projects);
     */
    createProject(
        project: Omit<Project, 'id' | 'created_at' | 'updated_at'>
    ): Promise<Project>;

    /**
     * Update an existing project's editable fields.
     * 
     * Only name and description can be updated.
     * System fields (id, created_at, owner_id) are immutable.
     * updated_at is automatically set by the adapter.
     * 
     * @param id - Project UUID to update
     * @param updates - Partial project data to merge
     * @returns Promise resolving to updated project
     * @throws Error if project not found, update fails, or user lacks permission
     * 
     * @example
     * // Update project name
     * const updated = await adapter.updateProject(projectId, {
     *   name: 'Renamed Project'
     * });
     * useCoreStore.getState().setCurrentProject(updated);
     * 
     * @example
     * // Update description
     * await adapter.updateProject(projectId, {
     *   description: 'Updated description'
     * });
     */
    updateProject(
        id: string,
        updates: Partial<Pick<Project, 'name' | 'description'>>
    ): Promise<Project>;

    /**
     * Delete a project and all its associated data.
     * 
     * CASCADE DELETE behavior:
     * - Deletes all artifacts in the project
     * - Deletes all artifact links in the project
     * - Deletes all collaborator records
     * - Cannot be undone
     * 
     * @param id - Project UUID to delete
     * @throws Error if project not found, deletion fails, or user lacks permission (must be owner)
     * 
     * @example
     * // Delete after user confirmation
     * if (confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
     *   await adapter.deleteProject(projectId);
     *   const projects = await adapter.getProjects();
     *   useCoreStore.getState().setProjects(projects);
     * }
     */
    deleteProject(id: string): Promise<void>;

    // --- Artifacts ---

    /**
     * Retrieve artifacts from a project, optionally filtered by type.
     * 
     * Type filtering is case-sensitive and matches exact type strings:
     * - 'quiz-question' - Returns only quiz questions
     * - 'quiz-bank' - Returns only quiz banks
     * - undefined - Returns all artifacts in project
     * 
     * Results are typically sorted by created_at descending.
     * 
     * @param projectId - Project UUID to query
     * @param type - Optional artifact type filter
     * @returns Promise resolving to array of artifacts (empty if none found)
     * @throws Error if database query fails
     * 
     * @example
     * // Get all artifacts in project
     * const artifacts = await adapter.getArtifacts(projectId);
     * 
     * @example
     * // Get only questions for a bank
     * const questions = await adapter.getArtifacts(projectId, 'quiz-question');
     * useQuizEditorStore.getState().setQuestions(questions as QuizQuestion[]);
     * 
     * @example
     * // Get only banks
     * const banks = await adapter.getArtifacts(projectId, 'quiz-bank');
     */
    getArtifacts(projectId: string, type?: string): Promise<Artifact[]>;

    /**
     * Retrieve a single artifact by ID.
     * 
     * @param id - Artifact UUID
     * @returns Promise resolving to artifact or null if not found
     * @throws Error if database query fails or user lacks access
     * 
     * @example
     * // Load a specific question
     * const artifact = await adapter.getArtifact(questionId);
     * if (!artifact) {
     *   throw new Error('Question not found');
     * }
     * if (artifact.type === 'quiz-question') {
     *   const question = artifact as QuizQuestion;
     *   // Use question
     * }
     * 
     * @example
     * // Load bank for editing
     * const bank = await adapter.getArtifact(bankId);
     * useQuizEditorStore.getState().setCurrentBank(bank as QuizBank);
     */
    getArtifact(id: string): Promise<Artifact | null>;

    /**
     * Create or update an artifact (upsert operation).
     * 
     * If artifact.id exists in database:
     * - Updates the existing artifact
     * - Preserves metadata.created_by and metadata.created_at
     * - Updates metadata.modified_at and metadata.modified_by
     * 
     * If artifact.id doesn't exist:
     * - Creates new artifact
     * - Sets all metadata fields
     * 
     * The caller is responsible for:
     * - Generating unique IDs for new artifacts
     * - Setting correct project_id
     * - Setting correct type and schema_version
     * - Populating metadata fields
     * - Validating data structure
     * 
     * @param artifact - Complete artifact to save
     * @throws Error if save fails, validation fails, or user lacks permission
     * 
     * @example
     * // Create new question
     * const newQuestion: QuizQuestion = {
     *   id: crypto.randomUUID(),
     *   project_id: currentProject.id,
     *   type: 'quiz-question',
     *   schema_version: '1.0.0',
     *   metadata: {
     *     created_by: userId,
     *     created_at: new Date().toISOString(),
     *     modified_at: new Date().toISOString(),
     *     modified_by: userId,
     *   },
     *   data: {
     *     question_type: 'multiple_choice',
     *     prompt: { type: 'doc', content: [] },
     *     answers: [],
     *     feedback: { 
     *       correct: { type: 'doc', content: [] },
     *       incorrect: { type: 'doc', content: [] }
     *     },
     *     settings: {}
     *   }
     * };
     * await adapter.saveArtifact(newQuestion);
     * 
     * @example
     * // Update existing question (from store)
     * const { questions, updateQuestion } = useQuizEditorStore.getState();
     * updateQuestion(questionId, { prompt: newPrompt });
     * const question = questions.find(q => q.id === questionId);
     * await adapter.saveArtifact(question);
     */
    saveArtifact(artifact: Artifact): Promise<void>;

    /**
     * Delete an artifact.
     * 
     * WARNING: This does not cascade delete artifact links.
     * Caller should delete related links first if needed.
     * 
     * @param id - Artifact UUID to delete
     * @throws Error if artifact not found, deletion fails, or user lacks permission
     * 
     * @example
     * // Delete question with confirmation
     * if (confirm('Delete this question?')) {
     *   await adapter.deleteArtifact(questionId);
     *   useQuizEditorStore.getState().deleteQuestion(questionId);
     * }
     * 
     * @example
     * // Delete bank and its questions
     * const questions = await adapter.getArtifacts(projectId, 'quiz-question');
     * const bankQuestions = questions.filter(q => 
     *   bank.data.question_ids.includes(q.id)
     * );
     * 
     * // Delete all questions first
     * for (const q of bankQuestions) {
     *   await adapter.deleteArtifact(q.id);
     * }
     * 
     * // Then delete bank
     * await adapter.deleteArtifact(bankId);
     */
    deleteArtifact(id: string): Promise<void>;

    // --- Links ---

    /**
     * Retrieve all artifact links in a project.
     * 
     * Links represent relationships between artifacts:
     * - 'assesses' - Question assesses a learning objective
     * - 'derived_from' - Content derived from source material
     * - 'contains' - Bank contains questions
     * 
     * @param projectId - Project UUID to query
     * @returns Promise resolving to array of links (empty if none)
     * @throws Error if database query fails
     * 
     * @example
     * // Get all links for visualization
     * const links = await adapter.getLinks(projectId);
     * const graph = buildDependencyGraph(artifacts, links);
     * 
     * @example
     * // Find questions in a bank
     * const links = await adapter.getLinks(projectId);
     * const bankLinks = links.filter(
     *   link => link.source_id === bankId && link.relationship === 'contains'
     * );
     * const questionIds = bankLinks.map(link => link.target_id);
     */
    getLinks(projectId: string): Promise<ArtifactLink[]>;

    /**
     * Create or update an artifact link (upsert operation).
     * 
     * Links are directional:
     * - source_id → target_id
     * - Relationship describes how source relates to target
     * 
     * @param link - Complete link to save
     * @throws Error if save fails or user lacks permission
     * 
     * @example
     * // Link question to bank
     * await adapter.saveLink({
     *   id: crypto.randomUUID(),
     *   project_id: projectId,
     *   source_id: bankId,
     *   target_id: questionId,
     *   relationship: 'contains',
     *   created_by: userId,
     *   created_at: new Date().toISOString(),
     * });
     * 
     * @example
     * // Link question to learning objective
     * await adapter.saveLink({
     *   id: crypto.randomUUID(),
     *   project_id: projectId,
     *   source_id: questionId,
     *   target_id: learningObjectiveId,
     *   relationship: 'assesses',
     *   created_by: userId,
     *   created_at: new Date().toISOString(),
     * });
     */
    saveLink(link: ArtifactLink): Promise<void>;

    /**
     * Delete an artifact link.
     * 
     * @param id - Link UUID to delete
     * @throws Error if link not found, deletion fails, or user lacks permission
     * 
     * @example
     * // Remove question from bank
     * const links = await adapter.getLinks(projectId);
     * const linkToDelete = links.find(
     *   link => link.source_id === bankId && 
     *           link.target_id === questionId &&
     *           link.relationship === 'contains'
     * );
     * if (linkToDelete) {
     *   await adapter.deleteLink(linkToDelete.id);
     * }
     */
    deleteLink(id: string): Promise<void>;
}
