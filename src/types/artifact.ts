/**
 * Universal artifact types for the IDIDE ecosystem.
 * Artifacts are typed semantically (by WHAT they are, not which tool created them).
 */

// --- Rich Text ---

export interface TiptapJSON {
  type: 'doc'
  content: TiptapNode[]
}

export interface TiptapNode {
  type: string
  content?: TiptapNode[]
  text?: string
  marks?: TiptapMark[]
  attrs?: Record<string, unknown>
}

export interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

// --- Base Artifact ---

export interface ArtifactMetadata {
  created_by: string
  created_at: string
  modified_at: string
}

export interface Artifact {
  id: string
  project_id: string
  type: string
  schema_version: string
  metadata: ArtifactMetadata
  data: unknown
}

// --- Link ---

export type LinkRelationship = 'assesses' | 'derived_from' | 'contains'

export interface ArtifactLink {
  id: string
  project_id: string
  source_id: string
  target_id: string
  relationship: LinkRelationship
  created_by: string
  created_at: string
}
