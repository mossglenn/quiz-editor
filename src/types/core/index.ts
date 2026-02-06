/**
 * Core Framework Type Exports
 * 
 * This module re-exports all core types used across the framework.
 * Import from here rather than individual files for consistency.
 * 
 * Categories:
 * - Common: UUID, ISODateTime, Email
 * - Artifacts: Artifact, ArtifactMetadata, TiptapJSON
 * - Projects: Project, ProjectRole, ProjectCollaborator
 * - Links: ArtifactLink, LinkRelationship
 * 
 * @module types/core
 * @category Core Framework
 * 
 * @example
 * // Recommended: Import from core index
 * import type { Artifact, Project, UUID } from '@/types/core';
 * 
 * @example
 * // Avoid: Importing from individual files
 * import type { Artifact } from '@/types/core/artifact';
 * import type { Project } from '@/types/core/project';
 */

// Common types
export type { UUID, ISODateTime, Email } from './common';

// Artifact types and rich text
export type {
    TiptapJSON,
    TiptapNode,
    TiptapMark,
    ArtifactMetadata,
    Artifact,
} from './artifact';

// Link types
export type { LinkRelationship, ArtifactLink } from './link';

// Project types
export type { ProjectRole, ProjectCollaborator, Project } from './project';
