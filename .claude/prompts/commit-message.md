# Commit Message Generation Workflow

**Trigger Phrases**:

- "commit message please"
- "generate a commit message"
- "what should the commit message be?"

---

## Workflow Steps

### 1. Analyze Git Diff

**Check what changed**:

```bash
git diff --cached  # For staged changes
# or
git diff  # For unstaged changes
```

**Understand the scope**:

- Which files were modified?
- What type of change? (feature, fix, refactor, docs, etc.)
- Single concern or multiple changes?

---

### 2. Generate Commit Message

**Format**: Conventional Commits

```
<type>(<scope>): <short summary>

<optional body with details>
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring (no behavior change)
- `docs`: Documentation only
- `style`: Formatting, whitespace, etc. (no code change)
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling

**Scope** (optional):

- Component or module affected: `banks`, `questions`, `import`, `ui`, etc.

**Summary**:

- Present tense, lowercase, no period
- Max 50 characters
- Describe what the commit does, not what you did

**Body** (optional):

- Explain why (not what—diff shows what)
- Wrap at 72 characters
- Separate from summary with blank line

---

### 3. Show for Approval

**Present generated message**:

```
I analyzed the git diff and suggest this commit message:

---
feat(banks): add create bank functionality

- Implement createBank Server Action
- Add BankCard component for display
- Create /banks route with bank list

This establishes the foundation for bank management.
---

Should I use this, or would you like me to adjust it?
```

---

### 4. Commit (if user approves)

**If user says "yes" or "commit it"**:

```bash
git commit -m "feat(banks): add create bank functionality

- Implement createBank Server Action
- Add BankCard component for display
- Create /banks route with bank list

This establishes the foundation for bank management."
```

**Show confirmation**:

```
✅ Committed with message:
feat(banks): add create bank functionality
```

---

## Message Quality Guidelines

### ✅ Good Examples

```
feat(questions): add multiple choice question type

- Implement QuestionEditor component
- Add TypeSelector dropdown (MC, MR, TF)
- Create answer option editor with correct/incorrect checkboxes

Enables users to create multiple choice questions with custom feedback.
```

```
fix(import): handle missing answer columns in CSV

Previously crashed when CSV had fewer than 4 answer columns.
Now filters out empty answers before creating question objects.

Fixes edge case where Storyline exports vary in column count.
```

```
refactor(db): extract Supabase client creation to lib

Moves createClient() from inline usage to centralized module.
Improves consistency and makes future changes easier.
```

### ❌ Bad Examples

```
fix stuff
```

_(Too vague—what was fixed? Why?)_

```
Added the question editor component and also fixed some bugs in the bank list and updated the README
```

_(Multiple unrelated changes—should be separate commits)_

```
Fixed the bug where it wasn't working
```

_(What bug? What behavior changed?)_

---

## Multi-File Change Patterns

### Single Concern Across Files

```
feat(ui): add shadcn button component

- Install shadcn/ui CLI
- Add Button component from registry
- Import in QuestionEditor toolbar
```

### Multiple Concerns (Avoid)

If diff shows unrelated changes, suggest splitting:

```
I see changes for both:
1. New import feature (import.ts, ImportModal.tsx)
2. Bug fix in bank list (BankCard.tsx)

Should I suggest two separate commits?
```

---

## Commit Body Guidelines

**When to include body**:

- Why the change was needed (not obvious from diff)
- Trade-offs considered
- Breaking changes (BREAKING CHANGE: footer)
- References (Closes #123, Fixes #456)

**When to skip body**:

- Change is self-explanatory (e.g., `docs: fix typo in README`)
- Very small changes (formatting, whitespace)

---

## Special Cases

### Breaking Changes

```
feat(api)!: change bank creation endpoint signature

BREAKING CHANGE: createBank() now requires description field.

Old: createBank({ title })
New: createBank({ title, description })

Migration: Add description: '' to all createBank calls.
```

### Reverts

```
revert: "feat(import): add CSV validation"

This reverts commit a1b2c3d4.
Validation was too strict and rejected valid Storyline files.
```

### Work in Progress

```
wip: experiment with Yjs real-time collaboration

Not ready for production. Testing Yjs integration with Tiptap.
Will refine or discard based on results.
```

---

## Notes

- **Frequency**: Generate commit message whenever user asks
- **Prerequisites**: Changes must be staged (`git add`) or user must specify unstaged
- **Length**: Aim for 1-3 line summary + optional body
- **Approval**: Always show message before committing
- **Reference**: This workflow enables Desktop to understand Code work via git log

---

**End of Workflow**

Good commit messages enable Claude Desktop to understand Code session work when updating session documentation.
