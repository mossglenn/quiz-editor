/**
 * Universal project type for IDIDE ecosystem.
 * This is the foundational type.
 */

import type { UUID, ISODateTime } from './common';

export interface Project {
    id: UUID;
    name: string;
    description?: string;
    owner_id: UUID;
    created_at: ISODateTime;
    updated_at: ISODateTime;
}

export type ProjectRole =
    | 'owner'
    | 'co-owner'
    | 'editor'
    | 'approver'
    | 'commenter'
    | 'viewer';

export interface CollaboratorMetadata {
    added_by: UUID;
    added_at: ISODateTime;
    modified_at: ISODateTime;
    modified_by: UUID;
}
export interface ProjectCollaborator {
    id: UUID;
    project_id: UUID;
    user_id: UUID;
    role: ProjectRole;
    metadata: CollaboratorMetadata;
}
