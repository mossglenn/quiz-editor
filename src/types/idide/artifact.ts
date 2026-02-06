/**
 * Universal artifact types for the IDIDE ecosystem.
 * Artifacts are typed semantically (by WHAT they are, not which tool created them).
 */

import type { UUID, ISODateTime } from './common';

// --- Rich Text ---

export interface TiptapJSON {
    type: 'doc';
    content: TiptapNode[];
}

export interface TiptapNode {
    type: string;
    content?: TiptapNode[];
    text?: string;
    marks?: TiptapMark[];
    attrs?: Record<string, unknown>;
}

export interface TiptapMark {
    type: string;
    attrs?: Record<string, unknown>;
}

// --- Base Artifact ---

export interface ArtifactMetadata {
    created_by: UUID;
    created_at: ISODateTime;
    modified_at: ISODateTime;
    modified_by: UUID;
}

export interface Artifact {
    id: UUID;
    project_id: UUID;
    type: string;
    schema_version: string;
    metadata: ArtifactMetadata;
    data: unknown;
}
