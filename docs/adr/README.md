# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records documenting key architectural choices for Quiz Editor and the IDIDE Core Framework.

## What are ADRs?

Architecture Decision Records capture important architectural decisions along with their context and consequences. Each ADR includes:

- **Status** - Current state (Proposed, Accepted, Deprecated, Superseded)
- **Context** - The problem and requirements
- **Decision** - What was decided and why
- **Consequences** - Positive and negative outcomes
- **Alternatives** - Options considered but rejected
- **Implementation Notes** - Practical guidance

## Why ADRs?

**For Current Team:**
- Understand why decisions were made
- Avoid revisiting settled questions
- Learn from past trade-offs

**For Future Contributors:**
- Onboard faster with historical context
- Challenge decisions with full context
- Build on documented rationale

**For Stakeholders:**
- Transparency in technical choices
- Risk assessment visibility
- Long-term maintenance planning

## How to Use ADRs

### When Making Architectural Decisions

1. **Check existing ADRs** - Has this been decided?
2. **Create new ADR** - For significant decisions
3. **Update existing ADR** - If revisiting a decision

### When to Write an ADR

**Write an ADR for decisions that:**
- Affect system structure
- Are hard to reverse
- Have significant consequences
- Need team alignment
- Impact multiple components

**Don't write ADRs for:**
- Routine implementation choices
- Easily reversible decisions
- Highly localized changes
- Obvious choices

## ADR Index

### Core Architecture

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001](./0001-storage-adapter-pattern.md) | Use Storage Adapter Pattern | Accepted | 2025-02-04 |
| [0002](./0002-semantic-artifact-typing.md) | Semantic Artifact Typing | Accepted | 2025-02-04 |
| [0003](./0003-tiptap-json-format.md) | Use Tiptap JSON for Rich Text | Accepted | 2025-02-04 |
| [0004](./0004-zustand-immer-state.md) | Use Zustand + Immer for State | Accepted | 2025-02-04 |
| [0005](./0005-core-framework-separation.md) | Core Framework Separation | Accepted | 2025-02-05 |

### Quick Reference

**ADR-0001: Storage Adapter Pattern**
- **Problem:** Need to support Supabase (cloud) and SQLite (desktop)
- **Decision:** Abstract storage behind interface
- **Key Benefit:** Swap backends without UI changes
- **Status:** Interface complete, Supabase adapter in progress

**ADR-0002: Semantic Artifact Typing**
- **Problem:** How to type artifacts for multi-tool ecosystem?
- **Decision:** Type by WHAT (semantic), not WHO (tool)
- **Key Benefit:** Tool interoperability, no vendor lock-in
- **Status:** Type system implemented

**ADR-0003: Tiptap JSON Format**
- **Problem:** How to store rich text safely and structured?
- **Decision:** Use Tiptap JSON (ProseMirror-based)
- **Key Benefit:** Structured, version-able, editor-agnostic
- **Status:** Type definitions complete, editor planned

**ADR-0004: Zustand + Immer State**
- **Problem:** Which state management library?
- **Decision:** Zustand with Immer middleware
- **Key Benefit:** Simple API, mutable-looking code, type-safe
- **Status:** Stores implemented and documented

**ADR-0005: Core Framework Separation**
- **Problem:** Build fast vs clean architecture?
- **Decision:** Build together, extract when building Tool #2
- **Key Benefit:** Speed now, clean separation later
- **Status:** Namespaces established, extraction planned

## ADR Template

When creating a new ADR, use this structure:

```markdown
# ADR-NNNN: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXXX]

## Context
What is the issue we're addressing?
What are the requirements?
What scenarios need to be supported?

## Decision
What did we decide?
How will it work?
What are the key principles?

## Consequences

### Positive
✅ Benefits of this decision

### Negative
❌ Downsides or trade-offs

### Mitigation Strategies
How we address the negative consequences

## Alternatives Considered

### Alternative 1: [Name]
**Approach:** Brief description
**Pros:** Benefits
**Cons:** Drawbacks  
**Why Rejected:** Reasoning

## Implementation Notes
Practical guidance for implementation
Current status
Migration strategy (if needed)

## References
Links to code, docs, related decisions

## Success Criteria
How we'll know this decision was right
What would make us reconsider

## Review Schedule
When to review this decision
```

## ADR Lifecycle

### 1. Proposed
- Decision is being considered
- Gathering feedback
- May have multiple proposals

### 2. Accepted
- Decision is made
- Implementation can proceed
- Document reflects current state

### 3. Deprecated
- Decision no longer recommended
- Better alternative exists
- Legacy code may still use

### 4. Superseded
- Replaced by newer ADR
- Link to successor ADR
- Kept for historical context

## Contributing

### Creating a New ADR

1. **Copy template** from above
2. **Assign number** - Next sequential number
3. **Write ADR** - Follow template structure
4. **Get feedback** - Team review
5. **Merge when accepted** - Status: Accepted
6. **Update index** - Add to table above

### Updating Existing ADR

**For clarifications:**
- Add notes to relevant sections
- Update "Current Status" in implementation notes

**For significant changes:**
- Consider creating new ADR
- Mark old ADR as "Superseded"
- Link between old and new

### Reviewing ADRs

- **Scheduled Reviews** - Check review schedule in each ADR
- **Triggered Reviews** - When problems emerge
- **Tool #2 Milestone** - Review all framework ADRs

## Best Practices

### Writing ADRs

**Be Specific:**
- ✅ "Use Zustand with Immer middleware"
- ❌ "Use a state management library"

**Show Trade-offs:**
- List positive and negative consequences
- Explain why negatives are acceptable
- Document mitigation strategies

**Include Examples:**
- Code samples clarify intent
- Show before/after patterns
- Demonstrate usage

**Document Alternatives:**
- Show what you considered
- Explain why rejected
- Helps prevent rehashing

### Reviewing ADRs

**Questions to Ask:**
- Is the context clear?
- Are alternatives explored?
- Are consequences realistic?
- Can we implement this?
- Will this age well?

## Related Documentation

- [Architecture Overview](../../.claude/CLAUDE.md) - Current architectural patterns
- [Project Context](../../.claude/PROJECT_CONTEXT.md) - Technical specifications  
- [Documentation Standards](../../.claude/PROJECT_CONTEXT.md#documentation-standards) - Code documentation
- [Working Session Guide](../../.claude/WORKING_SESSION_GUIDE.md) - Development workflow

## Questions?

- **Unclear decision?** Open issue for discussion
- **Need to challenge ADR?** Propose new ADR with "Supersedes"
- **Implementation questions?** Check code references in ADR

---

**Last Updated:** 2025-02-06
**Total ADRs:** 5 Accepted
**Next Review:** When starting Tool #2 development
