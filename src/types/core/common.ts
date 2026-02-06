/**
 * Common Type Aliases for the Core Framework
 * 
 * These type aliases provide semantic meaning to primitive types.
 * They serve as documentation and enable future validation/refinement.
 * 
 * @module types/core/common
 * @category Core Framework
 */

/**
 * Universally Unique Identifier (UUID) string.
 * 
 * UUIDs are used for all entity IDs in the system:
 * - Projects
 * - Artifacts
 * - Links
 * - Users
 * 
 * Format: RFC 4122 UUID (version 4)
 * Example: "550e8400-e29b-41d4-a716-446655440000"
 * 
 * Generation:
 * - Browser: `crypto.randomUUID()`
 * - Node: `import { randomUUID } from 'crypto'`
 * - Supabase: `gen_random_uuid()` function
 * 
 * @example
 * // Generate a new UUID
 * const id: UUID = crypto.randomUUID();
 * 
 * @example
 * // Type a function parameter
 * function getProject(id: UUID): Promise<Project> {
 *   return storageAdapter.getProject(id);
 * }
 */
export type UUID = string;

/**
 * ISO 8601 DateTime string in UTC timezone.
 * 
 * Used for all timestamps in metadata:
 * - created_at
 * - modified_at
 * - updated_at
 * - added_at
 * 
 * Format: "YYYY-MM-DDTHH:mm:ss.sssZ"
 * Example: "2025-02-06T15:30:45.123Z"
 * 
 * Always stored in UTC (Z suffix).
 * Display layer converts to user's local timezone.
 * 
 * @example
 * // Generate current timestamp
 * const now: ISODateTime = new Date().toISOString();
 * 
 * @example
 * // Parse and format for display
 * const timestamp: ISODateTime = artifact.metadata.created_at;
 * const date = new Date(timestamp);
 * const formatted = date.toLocaleDateString();
 * 
 * @example
 * // Compare timestamps
 * const isNewer = (a: ISODateTime, b: ISODateTime) => a > b;
 */
export type ISODateTime = string;

/**
 * Email address string.
 * 
 * Used for user identification and communication.
 * No validation enforced at type level - validation happens at:
 * - Input forms (client-side)
 * - API endpoints (server-side)
 * - Database constraints
 * 
 * Format: Standard email format (RFC 5322)
 * Example: "user@example.com"
 * 
 * @example
 * // Type a user email field
 * interface User {
 *   id: UUID;
 *   email: Email;
 *   name: string;
 * }
 * 
 * @example
 * // Function accepting email
 * async function inviteCollaborator(
 *   projectId: UUID,
 *   email: Email,
 *   role: ProjectRole
 * ): Promise<void> {
 *   // Send invitation
 * }
 */
export type Email = string;
