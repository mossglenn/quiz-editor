/**
 * Universal Artifact Link Types for the Core Framework
 * 
 * Links represent directional relationships between artifacts.
 * They enable:
 * - Dependency tracking (question assesses objective)
 * - Containment (bank contains questions)
 * - Derivation (content derived from source)
 * - Graph visualization
 * 
 * @module types/core/link
 * @category Core Framework
 */

import type { UUID, ISODateTime } from './common';

/**
 * Relationship types for artifact links.
 * 
 * Each relationship is directional: source → target
 * 
 * Relationships:
 * - 'assesses': Source artifact assesses/evaluates the target
 *   Example: Question → Learning Objective
 *   Meaning: "This question assesses this learning objective"
 * 
 * - 'derived_from': Source artifact was created from the target
 *   Example: Question → Source Material (textbook, article)
 *   Meaning: "This question was derived from this source"
 * 
 * - 'contains': Source artifact includes/contains the target
 *   Example: Bank → Question
 *   Meaning: "This bank contains this question"
 * 
 * Future relationships (Phase 2+):
 * - 'prerequisite': Target must be understood before source
 * - 'references': Source cites or mentions target
 * - 'replaces': Source supersedes/replaces target
 * - 'variant_of': Source is an alternative version of target
 * 
 * @example
 * // Bank contains questions
 * const containsLink: LinkRelationship = 'contains';
 * // bankId → questionId
 * 
 * @example
 * // Question assesses objective
 * const assessesLink: LinkRelationship = 'assesses';
 * // questionId → objectiveId
 * 
 * @example
 * // Content derived from source
 * const derivedLink: LinkRelationship = 'derived_from';
 * // contentId → sourceId
 */
export type LinkRelationship = 
    | 'assesses'     // Source evaluates/tests target
    | 'derived_from' // Source created from target
    | 'contains';    // Source includes target

/**
 * Directional link between two artifacts.
 * 
 * Links are stored in `artifact_links` table.
 * They are directional: source_id → target_id
 * Relationship describes how source relates to target.
 * 
 * Use cases:
 * - Quiz Editor: Link bank to questions (contains)
 * - Objective Editor: Link questions to objectives (assesses)
 * - Content Builder: Link content to sources (derived_from)
 * - Graph Manager: Visualize dependencies
 * 
 * Important:
 * - Links are NOT bi-directional (create reverse link if needed)
 * - Deleting artifacts doesn't cascade delete links (manual cleanup)
 * - Multiple links can exist between same artifacts with different relationships
 * 
 * @example
 * // Link bank to question
 * const link: ArtifactLink = {
 *   id: crypto.randomUUID(),
 *   project_id: projectId,
 *   source_id: bankId,
 *   target_id: questionId,
 *   relationship: 'contains',
 *   created_by: userId,
 *   created_at: new Date().toISOString(),
 * };
 * await storageAdapter.saveLink(link);
 * 
 * @example
 * // Find questions in a bank
 * const links = await storageAdapter.getLinks(projectId);
 * const bankLinks = links.filter(
 *   link => link.source_id === bankId && link.relationship === 'contains'
 * );
 * const questionIds = bankLinks.map(link => link.target_id);
 * 
 * @example
 * // Find which banks contain a question
 * const links = await storageAdapter.getLinks(projectId);
 * const containingLinks = links.filter(
 *   link => link.target_id === questionId && link.relationship === 'contains'
 * );
 * const bankIds = containingLinks.map(link => link.source_id);
 * 
 * @example
 * // Find what a question assesses
 * const links = await storageAdapter.getLinks(projectId);
 * const assessmentLinks = links.filter(
 *   link => link.source_id === questionId && link.relationship === 'assesses'
 * );
 * const objectiveIds = assessmentLinks.map(link => link.target_id);
 * 
 * @example
 * // Build dependency graph
 * interface GraphNode {
 *   id: UUID;
 *   artifact: Artifact;
 *   inbound: ArtifactLink[];
 *   outbound: ArtifactLink[];
 * }
 * 
 * function buildGraph(
 *   artifacts: Artifact[],
 *   links: ArtifactLink[]
 * ): Map<UUID, GraphNode> {
 *   const graph = new Map<UUID, GraphNode>();
 *   
 *   // Initialize nodes
 *   for (const artifact of artifacts) {
 *     graph.set(artifact.id, {
 *       id: artifact.id,
 *       artifact,
 *       inbound: [],
 *       outbound: []
 *     });
 *   }
 *   
 *   // Add links
 *   for (const link of links) {
 *     const source = graph.get(link.source_id);
 *     const target = graph.get(link.target_id);
 *     if (source) source.outbound.push(link);
 *     if (target) target.inbound.push(link);
 *   }
 *   
 *   return graph;
 * }
 * 
 * @example
 * // Remove question from bank
 * const links = await storageAdapter.getLinks(projectId);
 * const linkToDelete = links.find(
 *   link => 
 *     link.source_id === bankId &&
 *     link.target_id === questionId &&
 *     link.relationship === 'contains'
 * );
 * if (linkToDelete) {
 *   await storageAdapter.deleteLink(linkToDelete.id);
 * }
 * 
 * @example
 * // Create bi-directional relationship (if needed)
 * // Question → Objective (assesses)
 * await storageAdapter.saveLink({
 *   id: crypto.randomUUID(),
 *   project_id: projectId,
 *   source_id: questionId,
 *   target_id: objectiveId,
 *   relationship: 'assesses',
 *   created_by: userId,
 *   created_at: new Date().toISOString(),
 * });
 * 
 * // Objective → Question (reverse reference, if needed for queries)
 * await storageAdapter.saveLink({
 *   id: crypto.randomUUID(),
 *   project_id: projectId,
 *   source_id: objectiveId,
 *   target_id: questionId,
 *   relationship: 'derived_from', // Or custom reverse relationship
 *   created_by: userId,
 *   created_at: new Date().toISOString(),
 * });
 */
export interface ArtifactLink {
    /** Unique identifier for this link */
    id: UUID;
    
    /** Project this link belongs to */
    project_id: UUID;
    
    /** Source artifact ID (start of the relationship arrow) */
    source_id: UUID;
    
    /** Target artifact ID (end of the relationship arrow) */
    target_id: UUID;
    
    /** How source relates to target
     * 
     * Examples:
     * - 'contains': bank → question
     * - 'assesses': question → objective
     * - 'derived_from': content → source
     */
    relationship: LinkRelationship;
    
    /** User who created this link */
    created_by: UUID;
    
    /** When link was created (ISO 8601, UTC) */
    created_at: ISODateTime;
}
