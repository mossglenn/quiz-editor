# .claude/ Directory

This directory contains AI-assisted development context and workflows for the Quiz Editor project.

## Files

### Core Documentation

- **`PROJECT_CONTEXT.md`** — Complete project context for Claude Code
    - Tech stack decisions, database schema, implementation plan
    - Read this first when starting Code sessions
    - Updated by Desktop after major architectural decisions

- **`SESSION.md`** — Active work log and session notes
    - Tracks what was done each session (Desktop + Code)
    - Updated via "update session" workflow
    - Shows current state, blockers, next steps

- **`CLAUDE.md`** — Architectural decisions and established patterns
    - Long-term reference (doesn't change every session)
    - Design patterns, coding conventions, lessons learned
    - Updated when patterns solidify or architecture shifts

- **`CODE_REFERENCE.md`** — Quick reference card for Code sessions
    - Tech stack reminders, common commands, file structure
    - Coding conventions, patterns, database schema
    - Troubleshooting tips, environment variables
    - Keep this open during Code sessions for quick lookup

### Workflows (prompts/)

- **`update-session.md`** — How to update SESSION.md
- **`commit-message.md`** — How to generate commit messages
- **`handoff-to-code.md`** — Transitioning from Desktop to Code

## Usage Patterns

### Desktop (Planning & Documentation)

1. Architecture discussions → update `PROJECT_CONTEXT.md`
2. End of session → "update session" → updates `SESSION.md`
3. Pattern emerges → document in `CLAUDE.md`

### Code (Implementation)

1. Start session → read `PROJECT_CONTEXT.md` + `SESSION.md`
2. Keep `CODE_REFERENCE.md` open for quick lookup
3. Implement features → commit frequently
4. Before closing → "commit message please" for final commit
5. Complex changes → note in commit body for Desktop session update

### Handoff Flow

```
Desktop: Plan feature → Update PROJECT_CONTEXT.md
    ↓
Desktop: "update session" → SESSION.md captures plan
    ↓
Code: Read SESSION.md + keep CODE_REFERENCE.md open
    ↓
Code: Implement → Commit with good messages
    ↓
Desktop: Review git log → "update session" → Capture what was built
```

## Maintenance

- **SESSION.md**: Updated every session (Desktop or Code)
- **PROJECT_CONTEXT.md**: Updated when architecture changes
- **CLAUDE.md**: Updated when patterns stabilize (infrequent)
- **CODE_REFERENCE.md**: Updated when conventions or patterns change
- **prompts/**: Updated when workflows improve

## Why This Structure?

- **Separation**: Planning (Desktop) vs. Implementation (Code)
- **Continuity**: SESSION.md bridges sessions
- **Context**: PROJECT_CONTEXT.md prevents re-explaining
- **Quick Reference**: CODE_REFERENCE.md for during-Code lookups
- **Efficiency**: Prompts codify common tasks
