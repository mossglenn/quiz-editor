/**
 * Universal Artifact Types for the Core Framework
 * 
 * Artifacts are the fundamental unit of content in the system.
 * They are typed semantically by WHAT they are, not which tool created them.
 * 
 * This enables:
 * - Multiple tools to work with the same artifact types
 * - Tool interoperability (Quiz Editor + Objective Editor both use questions)
 * - Plugin-agnostic data model (no vendor lock-in)
 * 
 * @module types/core/artifact
 * @category Core Framework
 */

import type { UUID, ISODateTime } from './common';

// --- Rich Text (Tiptap JSON) ---

/**
 * Tiptap document structure for rich text content.
 * 
 * This is the JSON format Tiptap editor uses internally. All rich text
 * in the application (prompts, answers, feedback, descriptions) uses this format.
 * 
 * Structure:
 * - Root node is always type: 'doc'
 * - Content is array of block-level nodes (paragraphs, headings, lists, etc.)
 * - Nodes can contain nested content for complex formatting
 * - Text nodes can have marks (bold, italic, links, etc.)
 * 
 * Why Tiptap JSON?
 * - WYSIWYG editing with Tiptap library
 * - Structured format enables validation
 * - Can be converted to HTML/Markdown
 * - Version-able and diffable
 * 
 * @see https://tiptap.dev/guide/output#option-1-json
 * 
 * @example
 * // Empty document
 * const empty: TiptapJSON = {
 *   type: 'doc',
 *   content: []
 * };
 * 
 * @example
 * // Simple paragraph
 * const simple: TiptapJSON = {
 *   type: 'doc',
 *   content: [{
 *     type: 'paragraph',
 *     content: [{ type: 'text', text: 'Hello world' }]
 *   }]
 * };
 * 
 * @example
 * // Formatted text with marks
 * const formatted: TiptapJSON = {
 *   type: 'doc',
 *   content: [{
 *     type: 'paragraph',
 *     content: [{
 *       type: 'text',
 *       text: 'Bold text',
 *       marks: [{ type: 'bold' }]
 *     }]
 *   }]
 * };
 * 
 * @example
 * // Complex document with multiple blocks
 * const complex: TiptapJSON = {
 *   type: 'doc',
 *   content: [
 *     {
 *       type: 'heading',
 *       attrs: { level: 2 },
 *       content: [{ type: 'text', text: 'Question' }]
 *     },
 *     {
 *       type: 'paragraph',
 *       content: [{ type: 'text', text: 'Choose the best answer:' }]
 *     },
 *     {
 *       type: 'bulletList',
 *       content: [
 *         {
 *           type: 'listItem',
 *           content: [{
 *             type: 'paragraph',
 *             content: [{ type: 'text', text: 'Option A' }]
 *           }]
 *         }
 *       ]
 *     }
 *   ]
 * };
 */
export interface TiptapJSON {
    /** Root document type - always 'doc' */
    type: 'doc';
    /** Array of block-level nodes (paragraphs, headings, lists, etc.) */
    content: TiptapNode[];
}

/**
 * A node in the Tiptap document tree.
 * 
 * Nodes represent structural elements:
 * - Block nodes: paragraph, heading, list, blockquote, codeBlock
 * - Inline nodes: text, image, mention
 * - Container nodes: listItem, tableCell
 * 
 * @example
 * // Text node
 * const textNode: TiptapNode = {
 *   type: 'text',
 *   text: 'Plain text'
 * };
 * 
 * @example
 * // Text with formatting (bold + link)
 * const formattedText: TiptapNode = {
 *   type: 'text',
 *   text: 'Click here',
 *   marks: [
 *     { type: 'bold' },
 *     { type: 'link', attrs: { href: 'https://example.com' } }
 *   ]
 * };
 * 
 * @example
 * // Paragraph containing text
 * const paragraph: TiptapNode = {
 *   type: 'paragraph',
 *   content: [
 *     { type: 'text', text: 'First ' },
 *     { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
 *     { type: 'text', text: ' text.' }
 *   ]
 * };
 */
export interface TiptapNode {
    /** Node type: 'text', 'paragraph', 'heading', 'bulletList', etc. */
    type: string;
    /** Child nodes (for container nodes like paragraphs, lists) */
    content?: TiptapNode[];
    /** Text content (only for text nodes) */
    text?: string;
    /** Formatting marks (bold, italic, link, etc.) */
    marks?: TiptapMark[];
    /** Node-specific attributes (e.g., heading level, link href) */
    attrs?: Record<string, unknown>;
}

/**
 * A formatting mark applied to text nodes.
 * 
 * Marks represent inline formatting:
 * - Text styling: bold, italic, underline, strike, code
 * - Semantic: link, highlight
 * - Custom: Any app-specific marks
 * 
 * Marks can be combined (bold + italic + link).
 * 
 * @example
 * // Bold mark
 * const bold: TiptapMark = { type: 'bold' };
 * 
 * @example
 * // Link mark with href
 * const link: TiptapMark = {
 *   type: 'link',
 *   attrs: { href: 'https://example.com', target: '_blank' }
 * };
 * 
 * @example
 * // Highlight mark with color
 * const highlight: TiptapMark = {
 *   type: 'highlight',
 *   attrs: { color: '#ffeb3b' }
 * };
 */
export interface TiptapMark {
    /** Mark type: 'bold', 'italic', 'link', 'code', etc. */
    type: string;
    /** Mark-specific attributes (e.g., link href, highlight color) */
    attrs?: Record<string, unknown>;
}

// --- Base Artifact System ---

/**
 * Metadata tracked for all artifacts.
 * 
 * Provides audit trail for artifact lifecycle:
 * - Who created it and when
 * - Who last modified it and when
 * 
 * Used for:
 * - Displaying "Last edited by X on Y"
 * - Conflict detection in collaborative editing
 * - Tracking changes over time
 * - Rolling back changes
 * 
 * All timestamps are ISO 8601 in UTC.
 * 
 * @example
 * // Creating metadata for new artifact
 * const metadata: ArtifactMetadata = {
 *   created_by: userId,
 *   created_at: new Date().toISOString(),
 *   modified_at: new Date().toISOString(),
 *   modified_by: userId,
 * };
 * 
 * @example
 * // Updating metadata on edit
 * function updateArtifact(artifact: Artifact) {
 *   artifact.metadata.modified_at = new Date().toISOString();
 *   artifact.metadata.modified_by = currentUserId;
 *   // Save artifact
 * }
 * 
 * @example
 * // Display last modified info
 * function LastModified({ artifact }: { artifact: Artifact }) {
 *   const date = new Date(artifact.metadata.modified_at);
 *   return <span>Last edited {date.toLocaleDateString()}</span>;
 * }
 */
export interface ArtifactMetadata {
    /** User ID who created this artifact */
    created_by: UUID;
    /** Timestamp when artifact was created (ISO 8601, UTC) */
    created_at: ISODateTime;
    /** Timestamp when artifact was last modified (ISO 8601, UTC) */
    modified_at: ISODateTime;
    /** User ID who last modified this artifact */
    modified_by: UUID;
}

/**
 * Base artifact interface - all artifacts extend this.
 * 
 * Artifacts are the fundamental unit of content in the system.
 * They represent any piece of instructional content:
 * - Quiz questions (QuizQuestion)
 * - Question banks (QuizBank)
 * - Learning objectives (future)
 * - Assessment rubrics (future)
 * - Content pages (future)
 * 
 * Design Principles:
 * 1. Semantic typing: Artifacts are typed by WHAT they are (type field)
 * 2. Tool-agnostic: Multiple tools can work with same artifact types
 * 3. Versioned: schema_version enables migration
 * 4. Generic data: Each type defines its own data structure
 * 
 * Relationship with Database:
 * - Stored in single `artifacts` table
 * - Type discrimination via `type` field
 * - Data stored as JSONB
 * - Queried with type filters
 * 
 * @example
 * // Quiz question artifact
 * const question: Artifact = {
 *   id: crypto.randomUUID(),
 *   project_id: projectId,
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
 *     feedback: { correct: {...}, incorrect: {...} },
 *     settings: {}
 *   }
 * };
 * 
 * @example
 * // Loading and type-checking artifacts
 * const artifacts = await storageAdapter.getArtifacts(projectId);
 * const questions = artifacts.filter(a => a.type === 'quiz-question');
 * const banks = artifacts.filter(a => a.type === 'quiz-bank');
 * 
 * @example
 * // Using with type guards (from quiz-editor types)
 * import { isQuizQuestion } from '@/types/quiz-editor';
 * 
 * const artifact: Artifact = await storageAdapter.getArtifact(id);
 * if (isQuizQuestion(artifact)) {
 *   // TypeScript knows: artifact is QuizQuestion
 *   console.log(artifact.data.prompt);
 * }
 */
export interface Artifact {
    /** Unique identifier for this artifact */
    id: UUID;
    
    /** Project this artifact belongs to */
    project_id: UUID;
    
    /** Semantic type: 'quiz-question', 'quiz-bank', 'learning-objective', etc.
     * 
     * Used for:
     * - Type discrimination (filtering, querying)
     * - Tool routing (which tool can handle this artifact)
     * - TypeScript type narrowing (with type guards)
     * 
     * Convention: kebab-case, namespace-prefixed if needed
     * Examples: 'quiz-question', 'quiz-bank', 'learning-objective'
     */
    type: string;
    
    /** Schema version for data migration
     * 
     * Format: Semantic versioning (e.g., '1.0.0', '2.1.0')
     * 
     * Used for:
     * - Migrating data structures when types evolve
     * - Handling backwards compatibility
     * - Gradual rollout of type changes
     * 
     * Increment:
     * - Patch (1.0.x): Bug fixes, no structure change
     * - Minor (1.x.0): Additive changes (new optional fields)
     * - Major (x.0.0): Breaking changes (removed/renamed fields)
     */
    schema_version: string;
    
    /** Audit trail metadata */
    metadata: ArtifactMetadata;
    
    /** Type-specific data payload
     * 
     * Structure depends on artifact type:
     * - QuizQuestion: QuizQuestionData
     * - QuizBank: QuizBankData
     * - etc.
     * 
     * Stored as JSONB in database.
     * Validated by tool-specific type definitions.
     */
    data: unknown;
}
