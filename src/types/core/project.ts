/**
 * Universal Project Types for the Core Framework
 * 
 * Projects are the top-level organizational unit.
 * All artifacts belong to a project.
 * Projects have owners and collaborators with different permission levels.
 * 
 * @module types/core/project
 * @category Core Framework
 */

import type { UUID, ISODateTime } from './common';

/**
 * Project container for artifacts.
 * 
 * A project represents a workspace for instructional content:
 * - Quiz banks and questions
 * - Learning objectives
 * - Assessment rubrics
 * - Course content
 * 
 * Projects provide:
 * - Data isolation (artifacts scoped to project)
 * - Access control (via collaborators)
 * - Organization (group related content)
 * - Sharing (invite collaborators)
 * 
 * Database mapping:
 * - Stored in `projects` table
 * - RLS policies filter by owner_id and collaborators
 * - One-to-many with artifacts
 * 
 * @example
 * // Create a new project
 * const project: Omit<Project, 'id' | 'created_at' | 'updated_at'> = {
 *   name: 'Employee Training Module',
 *   description: 'Onboarding questions for new hires',
 *   owner_id: currentUserId,
 * };
 * const created = await storageAdapter.createProject(project);
 * 
 * @example
 * // Display project info
 * function ProjectCard({ project }: { project: Project }) {
 *   return (
 *     <div>
 *       <h3>{project.name}</h3>
 *       <p>{project.description}</p>
 *       <time>{new Date(project.updated_at).toLocaleDateString()}</time>
 *     </div>
 *   );
 * }
 * 
 * @example
 * // Check ownership
 * function canDeleteProject(project: Project, userId: UUID): boolean {
 *   return project.owner_id === userId;
 * }
 */
export interface Project {
    /** Unique identifier */
    id: UUID;
    
    /** Project name (displayed in UI)
     * 
     * Max length: 100 characters (database constraint)
     * Required field
     */
    name: string;
    
    /** Optional project description
     * 
     * Max length: 500 characters (database constraint)
     * Used for: Search, tooltips, project details page
     */
    description?: string;
    
    /** User who created and owns this project
     * 
     * Owner has full permissions:
     * - Edit project settings
     * - Add/remove collaborators
     * - Delete project
     * - Transfer ownership (future)
     */
    owner_id: UUID;
    
    /** When project was created (ISO 8601, UTC) */
    created_at: ISODateTime;
    
    /** When project was last updated (ISO 8601, UTC)
     * 
     * Updated when:
     * - Project name/description changes
     * - Artifacts are added/modified/deleted
     * - Collaborators are added/removed
     * 
     * Used for: Sorting projects by recency
     */
    updated_at: ISODateTime;
}

/**
 * Roles for project collaborators.
 * 
 * Permission hierarchy (most → least):
 * - owner: Full control (delete project, manage collaborators)
 * - co-owner: Edit + manage collaborators (cannot delete project)
 * - editor: Create/edit/delete artifacts
 * - approver: Edit + approve changes (PR workflow, Phase 2)
 * - commenter: View + comment on artifacts (review workflow)
 * - viewer: Read-only access
 * 
 * Phase 1 (MVP): Only 'owner' and 'editor' implemented
 * Phase 2: Add 'approver' and 'commenter' for PR workflow
 * Phase 3: Add 'co-owner' for team management
 * 
 * @example
 * // Type-safe role checking
 * function canEdit(role: ProjectRole): boolean {
 *   return ['owner', 'co-owner', 'editor', 'approver'].includes(role);
 * }
 * 
 * @example
 * // Role-based UI
 * function ProjectActions({ role }: { role: ProjectRole }) {
 *   return (
 *     <>
 *       {role === 'owner' && <DeleteButton />}
 *       {canEdit(role) && <EditButton />}
 *       {role !== 'viewer' && <CommentButton />}
 *     </>
 *   );
 * }
 */
export type ProjectRole =
    | 'owner'       // Full control (only one per project)
    | 'co-owner'    // Edit + manage collaborators
    | 'editor'      // Create/edit/delete artifacts
    | 'approver'    // Edit + approve PRs
    | 'commenter'   // View + comment
    | 'viewer';     // Read-only

/**
 * Metadata for collaborator relationships.
 * 
 * Tracks who added the collaborator and when.
 * Used for audit trail and displaying "Added by X on Y".
 * 
 * @example
 * // Display who added a collaborator
 * function CollaboratorRow({ collaborator }: { collaborator: ProjectCollaborator }) {
 *   const addedDate = new Date(collaborator.metadata.added_at);
 *   return (
 *     <div>
 *       {collaborator.user_id}
 *       <small>Added {addedDate.toLocaleDateString()}</small>
 *     </div>
 *   );
 * }
 */
export interface CollaboratorMetadata {
    /** User who added this collaborator */
    added_by: UUID;
    
    /** When collaborator was added (ISO 8601, UTC) */
    added_at: ISODateTime;
    
    /** When collaborator role was last changed (ISO 8601, UTC) */
    modified_at: ISODateTime;
    
    /** User who last modified this collaborator's role */
    modified_by: UUID;
}

/**
 * Project collaborator with role and permissions.
 * 
 * Represents a user's access to a project.
 * Stored in `project_collaborators` table.
 * Used for:
 * - Access control (RLS policies)
 * - Team management UI
 * - Activity tracking
 * 
 * Note: Project owner is automatically a collaborator with 'owner' role.
 * 
 * @example
 * // Add a collaborator
 * const collaborator: Omit<ProjectCollaborator, 'id'> = {
 *   project_id: projectId,
 *   user_id: invitedUserId,
 *   role: 'editor',
 *   metadata: {
 *     added_by: currentUserId,
 *     added_at: new Date().toISOString(),
 *     modified_at: new Date().toISOString(),
 *     modified_by: currentUserId,
 *   }
 * };
 * // Save via storage adapter or Supabase client
 * 
 * @example
 * // Change collaborator role
 * async function updateCollaboratorRole(
 *   collaboratorId: UUID,
 *   newRole: ProjectRole
 * ) {
 *   // Update in database
 *   await supabase
 *     .from('project_collaborators')
 *     .update({
 *       role: newRole,
 *       'metadata.modified_at': new Date().toISOString(),
 *       'metadata.modified_by': currentUserId,
 *     })
 *     .eq('id', collaboratorId);
 * }
 * 
 * @example
 * // Remove collaborator
 * async function removeCollaborator(collaboratorId: UUID) {
 *   await supabase
 *     .from('project_collaborators')
 *     .delete()
 *     .eq('id', collaboratorId);
 * }
 * 
 * @example
 * // Get project collaborators
 * async function getCollaborators(projectId: UUID): Promise<ProjectCollaborator[]> {
 *   const { data } = await supabase
 *     .from('project_collaborators')
 *     .select('*')
 *     .eq('project_id', projectId);
 *   return data ?? [];
 * }
 */
export interface ProjectCollaborator {
    /** Unique identifier for this collaborator record */
    id: UUID;
    
    /** Project this collaboration is for */
    project_id: UUID;
    
    /** User being granted access */
    user_id: UUID;
    
    /** Permission level for this user */
    role: ProjectRole;
    
    /** Audit trail for collaboration */
    metadata: CollaboratorMetadata;
}
