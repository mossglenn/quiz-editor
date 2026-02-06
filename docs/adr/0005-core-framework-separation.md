# ADR-0005: Core Framework Separation

## Status
**Accepted** - 2025-02-05

## Context

Quiz Editor is the **first tool** in the IDIDE ecosystem. This creates architectural tension:

**The Goal:**
Build a plugin ecosystem where:
- Multiple tools work with shared artifacts
- Tools can be developed independently
- Framework code is reusable
- Clear boundaries prevent coupling

**The Problem:**
How do we structure the codebase to:
- Build Quiz Editor quickly (validate market fit)
- Extract reusable framework patterns
- Avoid premature abstraction (YAGNI)
- Enable future tool development

**Specific Questions:**

1. **Code Organization:** Where does code live?
   - Tool-specific code (Quiz Editor)?
   - Framework code (shared across tools)?
   - How to enforce boundaries?

2. **Type System:** How to organize types?
   - Core types (Artifact, Project, Link)?
   - Tool types (QuizQuestion, QuizBank)?
   - Prevent namespace pollution?

3. **State Management:** How to structure stores?
   - Framework state (projects, current project)?
   - Tool state (banks, questions, editing)?
   - Can tools share framework state?

4. **Dependencies:** What can import what?
   - Can framework import tool code?
   - Can tools import framework code?
   - Can tools import other tools?

**Tension Between:**
- **Speed:** Build Quiz Editor fast to validate
- **Quality:** Create clean, reusable abstractions
- **Learning:** Don't know what framework needs yet

## Decision

**Build Quiz Editor with Core Framework concepts embedded. Accept intentional technical debt. Refactor when building Tool #2.**

### Three-Phase Approach

**Phase 1: Build Together (Current)**
- Quiz Editor and Core Framework in same codebase
- Use namespacing to indicate separation
- Mark framework candidates with comments
- Focus on shipping MVP

**Phase 2: Intentional Separation**
- Maintain clear namespace boundaries
- Enforce through file organization
- Document coupling points
- Prepare for extraction

**Phase 3: Extract When Building Tool #2**
- Extract Core Framework to separate package
- Migrate Quiz Editor to use framework
- Build Tool #2 using framework
- Validate abstraction works

### Namespace Organization

```
src/
├── types/
│   ├── core/              # Framework types (SHARED)
│   │   ├── common.ts      # UUID, ISODateTime, Email
│   │   ├── artifact.ts    # Artifact, TiptapJSON
│   │   ├── project.ts     # Project, ProjectRole
│   │   └── link.ts        # ArtifactLink
│   └── quiz-editor/       # Tool types (TOOL SPECIFIC)
│       ├── question.ts    # QuizQuestion
│       └── bank.ts        # QuizBank
├── store/
│   ├── core-store.ts      # Framework state (SHARED)
│   └── quiz-editor-store.ts # Tool state (TOOL SPECIFIC)
├── lib/
│   └── storage/           # Framework (SHARED)
│       ├── interface.ts
│       └── supabase.ts
└── components/
    ├── ui/                # Framework UI primitives (SHARED)
    ├── bank/              # Tool components (TOOL SPECIFIC)
    └── question/          # Tool components (TOOL SPECIFIC)
```

### Import Rules

**✅ ALLOWED:**
```typescript
// Core imports core
import type { Artifact } from '@/types/core';

// Tool imports core
import type { Artifact } from '@/types/core';
import type { QuizQuestion } from '@/types/quiz-editor';

// Tool imports tool (same tool only)
import { QuestionEditor } from '@/components/question';
```

**❌ FORBIDDEN:**
```typescript
// Core CANNOT import tool
import type { QuizQuestion } from '@/types/quiz-editor'; // ❌

// Tool CANNOT import other tools
import type { Objective } from '@/types/objective-editor'; // ❌
```

**Enforcement via TypeScript paths:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/types/core": ["./src/types/core"],
      "@/types/quiz-editor": ["./src/types/quiz-editor"]
    }
  }
}
```

### Marking Framework Candidates

```typescript
// TODO: FRAMEWORK CANDIDATE
// This should be extracted to core when building tool #2
// Reason: All tools need artifact validation

/**
 * Validate artifact structure
 */
export function validateArtifact(artifact: unknown): artifact is Artifact {
  // Implementation
}
```

### Deleted Main Types Index

**Decision:** Deleted `/src/types/index.ts`

**Rationale:**
```typescript
// ❌ BEFORE: Could mix namespaces
import { Artifact, QuizQuestion } from '@/types'; // Blurs boundaries

// ✅ AFTER: Must choose namespace explicitly
import type { Artifact } from '@/types/core';           // Framework
import type { QuizQuestion } from '@/types/quiz-editor'; // Tool
```

**Benefits:**
- Enforces architectural boundaries
- Import path documents intent
- Prevents accidental coupling
- Enables future package extraction

## Consequences

### Positive

✅ **High Velocity During MVP**
- No premature abstraction
- Build what Quiz Editor needs
- Ship faster
- Learn what framework needs

✅ **Clear Boundaries**
- Namespaces show intent
- Easy to see what's framework vs tool
- Import paths self-document
- TypeScript enforces rules

✅ **Refactor Trigger Clear**
- Wait until building Tool #2
- Real requirements, not speculation
- Proven patterns
- Known coupling points

✅ **Framework Candidates Marked**
- Comments document extraction points
- Easy to find during refactor
- Reasoning captured
- No guesswork

✅ **Tool Independence**
- Tools can't import other tools
- Each tool is isolated
- Prevents tight coupling
- Enables separate deployment

✅ **Package Extraction Ready**
- Namespace structure maps to packages:
  - `@idide/core` ← `types/core/`
  - `@idide/quiz-editor` ← `types/quiz-editor/`
- Import rewrite minimal
- Clear package boundaries

### Negative

❌ **Technical Debt Created**
- Some abstractions delayed
- Code may be duplicated
- Must refactor later
- Discipline required

❌ **Extraction Work Later**
- Refactor needed when building Tool #2
- Migration complexity
- Breaking changes possible
- Testing required

❌ **No Validation Yet**
- Don't know if abstractions work
- Framework may be wrong
- Might over/under-abstract
- Learning happens later

### Mitigation Strategies

**For technical debt:**
- Document all coupling points (✅ Done)
- Mark framework candidates clearly
- Regular debt review
- Refactor trigger defined (Tool #2)

**For extraction work:**
- Clean namespace separation (✅ Done)
- Comprehensive documentation (✅ Done)
- Migration guide prepared
- Test suite before extraction

**For validation risk:**
- Build Tool #2 as soon as feasible
- Validate patterns with prototype
- Gather feedback from contributors
- Iterate on framework design

## Known Coupling Points

### 1. Database Schema

**Current State:**
```sql
-- Generic (framework-ready)
CREATE TABLE projects (...);
CREATE TABLE artifacts (...);
CREATE TABLE artifact_links (...);

-- Tool-specific (needs migration)
CREATE TABLE banks (...);       -- Should be artifacts
CREATE TABLE questions (...);   -- Should be artifacts
```

**Refactor Needed:**
- Migrate `banks` → `artifacts` with `type='quiz-bank'`
- Migrate `questions` → `artifacts` with `type='quiz-question'`
- Update storage adapter to use artifacts table
- Maintain backward compatibility

### 2. Component Architecture

**Current State:**
```typescript
// Tool-specific components
<BankEditor />
<QuestionEditor />
```

**Refactor Needed:**
- Extract base components:
  - `<Workspace />` (framework)
  - `<ArtifactList />` (framework)
  - `<ArtifactEditor />` (framework)
- Quiz Editor components extend base:
  - `<QuizBankEditor extends ArtifactEditor />`
  - `<QuestionEditor extends ArtifactEditor />`

### 3. Type System

**Current State:**
```typescript
// Already correctly separated! ✅
types/core/        # Framework types
types/quiz-editor/ # Tool types
```

**No refactor needed:** Type system already follows framework pattern.

### 4. Storage Layer

**Current State:**
```typescript
// Storage adapter pattern already framework-ready! ✅
interface StorageAdapter {
  getArtifacts(projectId: string): Promise<Artifact[]>;
  // ...
}
```

**No refactor needed:** Storage interface is already framework-level.

### 5. Routing

**Current State:**
```typescript
// Quiz Editor routes
/banks/[id]          // Tool-specific
/questions/[id]      // Tool-specific
```

**Refactor Needed:**
```typescript
// Framework routes
/projects/[id]                            // Generic

// Tool routes (after refactor)
/tools/quiz-editor/banks/[id]            // Namespaced
/tools/objective-editor/objectives/[id]  // Tool #2
```

## Implementation Guidelines

### When Writing New Code

**Ask:**
1. Is this Quiz Editor specific?
   → Put in `quiz-editor/` namespace

2. Could other tools use this?
   → Put in `core/` namespace
   → Or mark as framework candidate

3. Uncertain?
   → Start in `quiz-editor/`
   → Mark with `// TODO: FRAMEWORK CANDIDATE`

### Naming Conventions

**Be specific, not generic:**
```typescript
// ✅ Good: Specific names
QuizBank      (not Bank)
QuizQuestion  (not Question)

// ✅ Good: Generic names (framework)
Artifact
Project
```

### Feature Folders

```typescript
// Tool-specific features
features/quiz-editor/
├── components/
├── hooks/
└── utils/

// Framework features
features/core/
├── workspace/
├── sharing/
└── auth/
```

### Documentation

**Mark extraction candidates:**
```typescript
/**
 * Validate artifact structure.
 * 
 * TODO: FRAMEWORK CANDIDATE
 * Reason: All tools need artifact validation
 * Extract to: @idide/core/validation
 * When: Building Tool #2
 */
```

## Refactor Trigger

**Execute separation when starting Tool #2 (e.g., Objective Editor).**

### Refactor Checklist

**1. Extract Core Framework**
- [ ] Create `@idide/core` package
- [ ] Move `types/core/` → `@idide/core/types`
- [ ] Move `store/core-store` → `@idide/core/store`
- [ ] Move `lib/storage/` → `@idide/core/storage`
- [ ] Extract base components
- [ ] Define plugin interface

**2. Migrate Quiz Editor**
- [ ] Create `@idide/quiz-editor` package
- [ ] Update imports to use `@idide/core`
- [ ] Ensure tool-specific code contained
- [ ] Test all functionality

**3. Database Migration**
- [ ] Create migration scripts
- [ ] Test with real user data
- [ ] Ensure backward compatibility
- [ ] Document rollback procedure

**4. Build Tool #2**
- [ ] Use `@idide/core` package
- [ ] Validate framework sufficiency
- [ ] Identify missing abstractions
- [ ] Iterate on framework design

**5. Update Documentation**
- [ ] Framework API docs
- [ ] Plugin development guide
- [ ] Migration guide (for users)
- [ ] Architecture diagrams

## Alternatives Considered

### Alternative 1: Monorepo with Workspaces (Upfront)

**Approach:**
```
packages/
├── core/           # Framework package
├── quiz-editor/    # Tool package
└── app/            # Main application
```

**Pros:**
- Clean separation from day one
- Clear boundaries enforced
- Package extraction unnecessary

**Cons:**
- Premature optimization
- Delays MVP (setup overhead)
- Don't know framework needs yet
- May abstract wrong things

**Why Rejected:**
Too much upfront investment. We'd be guessing at framework boundaries. Better to build Quiz Editor first, learn patterns, then extract based on real needs.

### Alternative 2: Feature Flags / Namespacing Only

**Approach:**
Keep everything in one codebase, use namespacing but no extraction plan.

**Pros:**
- Simple setup
- No extraction work
- Everything colocated

**Cons:**
- Boundaries not enforced
- Coupling inevitable
- Extraction becomes massive
- Hard to monetize separately

**Why Rejected:**
This is "let's worry about it later" without a plan. We need extraction because:
- Tools should be independently deployable
- Framework should be monetizable separately
- Clear boundaries prevent spaghetti

### Alternative 3: Build Framework First, Then Tools

**Approach:**
Design full framework before building any tools.

**Pros:**
- Clean abstractions
- No technical debt
- Framework-first thinking

**Cons:**
- Delays MVP significantly
- Framework may be wrong
- Over-engineering risk
- No validation of patterns

**Why Rejected:**
Classic architecture astronaut trap. We'd spend months designing a framework for tools that don't exist yet. Better to build one tool, extract patterns, then generalize.

## Success Criteria

**This decision is successful if:**

1. ✅ Quiz Editor ships on schedule (MVP)
2. ✅ Clear namespace boundaries maintained
3. 📋 Extraction work is straightforward (Tool #2)
4. 📋 Framework patterns proven by Tool #2
5. 📋 No major rewrites needed
6. 📋 Tools remain independent

**Failure signals:**

- MVP delayed by over-abstraction
- Namespace boundaries violated frequently
- Extraction takes > 2 weeks
- Tool #2 requires framework rewrite
- Tight coupling between tools

## Review Schedule

- **Next Review:** When starting Tool #2 development
- **Success Validation:** After Tool #2 uses extracted framework
- **Revisit If:** Boundary violations become common

## Related Decisions

- **ADR-0001:** Storage Adapter - Framework-level abstraction
- **ADR-0002:** Semantic Artifact Typing - Framework concept
- **ADR-0004:** Zustand + Immer - Separate stores per layer

## References

- **Project Context:** [.claude/PROJECT_CONTEXT.md](../../.claude/PROJECT_CONTEXT.md)
- **Architecture:** [.claude/CLAUDE.md](../../.claude/CLAUDE.md)
- **Type System:** [src/types/](../../src/types/)
- **Stores:** [src/store/](../../src/store/)
