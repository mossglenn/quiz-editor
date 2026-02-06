/**
 * Universal artifact link type for the Core Framework.
 */

import type { UUID, ISODateTime } from './common';

export type LinkRelationship = 'assesses' | 'derived_from' | 'contains';

export interface ArtifactLink {
    id: UUID;
    project_id: UUID;
    source_id: UUID;
    target_id: UUID;
    relationship: LinkRelationship;
    created_by: UUID;
    created_at: ISODateTime;
}
