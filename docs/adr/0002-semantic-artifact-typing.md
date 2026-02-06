# ADR-0002: Semantic Artifact Typing

## Status
**Accepted** - 2025-02-04

## Context

IDIDE (now "Core Framework") is designed as a hub-plugin ecosystem where multiple tools can work with instructional content:
- Quiz Editor (create questions)
- Objective Editor (define learning objectives) 
- Content Builder (create course materials)
- Assessment Designer (create rubrics)
- Future community plugins

**Challenge: How do we type artifacts so multiple tools can interoperate?**

**Scenarios to support:**

1. **Multi-Tool Editing**
   - Quiz Editor creates a question
   - Objective Editor links question to learning objective
   - Both tools need to understand "question" type

2. **Tool Competition**
   - User tries "Quiz Editor Classic" (our tool)
   - User tries "SuperQuiz Pro" (competitor's tool)
   - User should be able to switch tools without losing data

3. **Data Portability**
   - Export project from one IDIDE instance
   - Import into another IDIDE instance
   - All tools still work with artifacts

4. **Plugin Marketplace**
   - Community creates plugins for niche needs
   - Plugins must handle standard artifact types
   - Users can mix and match plugins

**Anti-Pattern to Avoid:**
Tool-specific artifact IDs create vendor lock-in:
```typescript
// BAD: Tool-specific naming
id: 'quiz-editor:question:abc-123'
created_by_tool: 'quiz-editor'
```

This couples data to the creating tool, preventing interoperability.

## Decision

**Use semantic artifact typing: Artifacts are typed by WHAT they are, not which tool created them.**

### Core Principle

```typescript
/**
 * Artifacts are typed by their semantic meaning.
 * 
 * Type discriminator is 'type' field (not tool ID).
 * Multiple tools can handle the same semantic type.
 * Schema version enables evolution.
 */
export interface Artifact {
  id: UUID;              // Tool-agnostic: 'artifact:uuid'
  project_id: UUID;
  type: string;          // Semantic: 'question', 'objective', 'rubric'
  schema_version: string;// Evolution: 'v1.0.0', 'v2.0.0'
  metadata: ArtifactMetadata;
  data: unknown;         // Type-specific structure
}
```

### Type Naming Convention

**Format:** `kebab-case` semantic name

**Examples:**
- `'question'` - NOT `'quiz-editor-question'`
- `'learning-objective'` - NOT `'objective-editor-objective'`
- `'assessment-rubric'` - NOT `'assessment-designer-rubric'`

**Rationale:** Type describes the artifact's purpose, not its origin.

### Schema Versioning

```typescript
// Version 1.0.0
{
  type: 'question',
  schema_version: 'v1.0.0',
  data: {
    prompt: string,      // Plain text
    answers: Answer[]
  }
}

// Version 2.0.0 (adds rich text)
{
  type: 'question',
  schema_version: 'v2.0.0',
  data: {
    prompt: TiptapJSON,  // Rich text!
    answers: Answer[],
    metadata: {          // New optional fields
      difficulty: 'easy' | 'medium' | 'hard',
      tags: string[]
    }
  }
}
```

**Tools declare supported versions:**
```json
// plugin-manifest.json
{
  "handles": [{
    "type": "question",
    "schema_versions": ["v1.0.0", "v2.0.0"]
  }]
}
```

### Tool Interoperability

**Multiple tools can handle same type:**

```typescript
// Quiz Editor Classic
{
  "name": "quiz-editor",
  "handles": [{
    "type": "question",
    "can_read": true,
    "can_write": true,
    "schema_versions": ["v1.0.0"]
  }]
}

// SuperQuiz Pro (competitor)
{
  "name": "superquiz-pro",
  "handles": [{
    "type": "question",
    "can_read": true,
    "can_write": true,
    "schema_versions": ["v1.0.0", "v2.0.0"]
  }]
}
```

**User can switch tools:**
1. Create questions in Quiz Editor Classic
2. Switch to SuperQuiz Pro
3. Edit same questions (both handle `type: 'question'`)
4. No data migration needed

## Consequences

### Positive

✅ **No Vendor Lock-In**
- Data independent of creating tool
- Users can switch tools freely
- Market competition benefits users

✅ **Tool Interoperability**
- Multiple tools work on same artifacts
- Quiz Editor + Objective Editor integration works
- Community plugins can extend ecosystem

✅ **Data Portability**
- Export/import between IDIDE instances
- Artifacts remain valid across platforms
- No proprietary formats

✅ **Future-Proof**
- New tools can handle existing types
- Schema versioning enables evolution
- Backward compatibility maintained

✅ **Plugin Marketplace Enabled**
- Clear contract for plugin developers
- Standard types = standard plugins
- Network effects accelerate ecosystem

### Negative

❌ **Type Name Collisions**
- Two tools might use same type name differently
- Requires governance/registry eventually
- Community coordination needed

❌ **Schema Evolution Complexity**
- Must maintain backward compatibility
- Migration code for version updates
- Testing across versions

❌ **Tool Coordination Required**
- Tools must agree on type schemas
- Changes require ecosystem coordination
- Slower evolution of standards

### Mitigation Strategies

**For type collisions:**
- Core types (question, objective) reserved
- Namespace system for custom types: `'vendor:custom-type'`
- Type registry (Phase 3) for discovery and validation

**For schema evolution:**
- Semantic versioning (MAJOR.MINOR.PATCH)
- Migration utilities provided by framework
- Tools declare supported versions explicitly
- Graceful degradation for unsupported versions

**For tool coordination:**
- Document standard types in framework docs
- RFC process for type changes (future)
- Version compatibility matrix
- Community forums for discussion

## Alternatives Considered

### Alternative 1: Tool-Specific Typing

**Approach:**
```typescript
{
  id: 'quiz-editor:question:abc-123',
  created_by_tool: 'quiz-editor',
  type: 'quiz-editor-question'
}
```

**Pros:**
- No type collision risk
- Clear ownership
- Tool can use custom schema

**Cons:**
- Vendor lock-in (data coupled to tool)
- No tool interoperability
- Can't switch tools without migration
- Defeats ecosystem purpose

**Why Rejected:**
Fundamentally incompatible with plugin ecosystem goals. If users can't switch tools, there's no market competition and no network effects.

### Alternative 2: Universal Schema Without Versioning

**Approach:**
```typescript
{
  type: 'question',
  // No schema_version field
  data: { /* fixed schema */ }
}
```

**Pros:**
- Simpler (no version management)
- Single schema to document
- No migration code needed

**Cons:**
- Can't evolve schemas
- Breaking changes require new type name
- Forced to maintain old formats forever
- Stifles innovation

**Why Rejected:**
We will need to evolve schemas. Rich text (v2.0.0) adds TiptapJSON to prompts. Without versioning, we'd need a new type name: `'question-v2'`. This fragments the ecosystem.

### Alternative 3: RDF-Style Semantic Types

**Approach:**
```typescript
{
  '@type': 'http://schema.idide.io/types/question',
  '@context': 'http://schema.idide.io/v1',
  // ... properties
}
```

**Pros:**
- Standards-based (JSON-LD)
- Global namespacing
- Rich metadata

**Cons:**
- Overengineered for our needs
- Steep learning curve
- Verbose schemas
- Tooling complexity

**Why Rejected:**
We're building a practical instructional design tool, not a semantic web application. Simple string types are sufficient for our use case.

## Implementation Notes

### Type Registry (Future - Phase 3)

When ecosystem grows, implement type registry:

```typescript
// Central registry of standard types
interface TypeRegistry {
  registerType(definition: TypeDefinition): void;
  getType(name: string): TypeDefinition | null;
  searchTypes(query: string): TypeDefinition[];
}

interface TypeDefinition {
  name: string;              // 'question'
  namespace: string;         // 'core' or 'vendor-name'
  versions: SchemaVersion[]; // All versions
  description: string;
  examples: Example[];
}
```

**Registry prevents collisions and enables discovery.**

### Current Standard Types

**Core Framework types (reserved):**
- `'question'` - Quiz question
- `'question-bank'` - Collection of questions
- `'learning-objective'` - Learning outcome (future)
- `'assessment-rubric'` - Grading criteria (future)
- `'content-page'` - Course content (future)

**Namespace for custom types:**
- `'acme:custom-question'` - Vendor-specific
- `'community:simulation'` - Community plugin

### Migration Example

```typescript
/**
 * Migrate question from v1 to v2
 */
function migrateQuestionV1toV2(artifact: Artifact): Artifact {
  if (artifact.type !== 'question') {
    throw new Error('Not a question');
  }
  
  if (artifact.schema_version !== 'v1.0.0') {
    return artifact; // Already migrated
  }
  
  const v1Data = artifact.data as QuestionV1Data;
  
  return {
    ...artifact,
    schema_version: 'v2.0.0',
    data: {
      prompt: textToTiptap(v1Data.prompt),  // Plain → Rich
      answers: v1Data.answers,
      metadata: {                             // New fields
        difficulty: 'medium',
        tags: []
      }
    }
  };
}
```

### Type Guards

```typescript
/**
 * Type guard for QuizQuestion
 */
export function isQuizQuestion(artifact: Artifact): artifact is QuizQuestion {
  return artifact.type === 'quiz-question';
}

/**
 * Type guard with version check
 */
export function isQuizQuestionV2(artifact: Artifact): boolean {
  return artifact.type === 'quiz-question' && 
         artifact.schema_version === 'v2.0.0';
}
```

## References

- **Type Definitions:** [src/types/core/artifact.ts](../../src/types/core/artifact.ts)
- **Quiz Editor Types:** [src/types/quiz-editor/](../../src/types/quiz-editor/)
- **Architecture Overview:** [.claude/CLAUDE.md](../../.claude/CLAUDE.md#1-semantic-artifact-typing)

## Related Decisions

- **ADR-0001:** Storage Adapter Pattern - Works with semantic types
- **ADR-0003:** Tiptap JSON Format - Used in schema v2.0.0
- **ADR-0005:** Core Framework Separation - Types organized by semantics

## Success Criteria

**This decision is successful if:**

1. ✅ Can create QuizQuestion artifacts with semantic typing
2. 📋 Future Objective Editor can link to questions by type
3. 📋 Tool #2 demonstrates interoperability
4. 📋 Schema v2 migration works without data loss
5. 📋 Community plugins can handle standard types

**Failure signals:**

- Tools can't share artifacts
- Type collisions occur frequently
- Schema evolution breaks compatibility
- Users can't switch between tools
- Data export/import fails

## Review Schedule

- **Next Review:** When building Tool #2 (tests interoperability)
- **Revisit If:** Type collisions become common
- **Registry Decision:** When 10+ standard types exist
