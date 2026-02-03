# Desktop → Code Handoff Workflow

**Trigger Phrases**:

- "I'm ready to switch to Code"
- "What should I tell Code to do?"
- "I want to start implementing this in Code"

---

## Workflow Steps

### 1. Summarize Current State

**What to include**:

- What was decided in this Desktop session
- What's ready to implement
- Any constraints or warnings for Code
- Which phase/feature to start with

**Example Output**:

```
Great! Here's what Code should know:

**Context**:
- We've finalized the database schema (see PROJECT_CONTEXT.md)
- Tech stack is locked in: Next.js + Supabase + Tiptap
- Ready to start Phase 1: Foundation (scaffolding)

**What's Ready to Build**:
- Next.js project setup with App Router
- Supabase client configuration
- Basic routing structure (/banks, /banks/[id])
- Banks table migration (SQL in PROJECT_CONTEXT.md)

**Constraints**:
- Use shadcn/ui for components (not custom CSS)
- Server Actions for mutations (not API routes)
- TypeScript strict mode (no any types)

**Files to Reference**:
- .claude/PROJECT_CONTEXT.md (full context)
- .claude/SESSION.md (current state)
```

---

### 2. Generate Code Starter Prompt

**Create a prompt for the Code session**:

```markdown
Code Starter Prompt:

Read .claude/PROJECT_CONTEXT.md and .claude/SESSION.md to understand the project.

Then help me implement Phase 1: Foundation (Week 1-2)

Start with:

1. Set up Next.js 14 project with App Router
2. Install dependencies: @supabase/supabase-js, @supabase/ssr, tailwindcss
3. Configure Supabase client (server + client variants)
4. Create basic routing structure
5. Run banks table migration (SQL in PROJECT_CONTEXT.md)

Follow these conventions:

- TypeScript strict mode
- Functional React components
- Server Actions for mutations
- shadcn/ui for components

Let me know when you're ready to start, and we'll go step-by-step.
```

---

### 3. Offer to Update SESSION.md

**Before switching**:

```
Before you switch to Code, should I update SESSION.md to capture our Desktop work?

I can add a session entry documenting:
- Architecture decisions made
- Database schema designed
- Context files created
- Next steps for Code session

This will help Code understand what's been done.
```

---

### 4. Provide Quick Reference

**Give user a cheat sheet**:

````markdown
Quick Reference for Code Session:

**Read First**:

- .claude/PROJECT_CONTEXT.md (full context)
- .claude/SESSION.md (current state)

**Start With**:
"Read .claude/PROJECT_CONTEXT.md, then help me start Phase 1: Foundation"

**During Code Work**:

- Commit frequently (every feature/fix)
- Use "commit message please" for help
- Follow conventions in CLAUDE.md

**When Done**:

- Make final commit
- Return to Desktop
- Run "update session" to capture Code work

**Common Commands**:

```bash
# Install dependencies
npm install @supabase/supabase-js @supabase/ssr

# Run dev server
npm run dev

# Check TypeScript
npm run type-check

# Generate commit message
"commit message please"
```
````

---

### 5. Confirm Handoff

**Final check**:

```
Ready to switch to Code?

I've prepared:
✅ Code starter prompt (copy/paste this into Code)
✅ Quick reference (for during Code session)
✅ SESSION.md update (captures Desktop work)

When you're in Code, just paste the starter prompt and you're good to go!
```

---

## Code Starter Prompt Template

Use this template to generate prompts:

```markdown
Read .claude/PROJECT_CONTEXT.md and .claude/SESSION.md to understand the project.

Then help me implement [Phase/Feature Name].

Start with:

1. [Specific task 1]
2. [Specific task 2]
3. [Specific task 3]

Follow these conventions:

- [Convention 1]
- [Convention 2]
- [Convention 3]

Let me know when you're ready to start, and we'll go step-by-step.
```

---

## Return to Desktop (Code → Desktop Handoff)

**When user returns from Code**:

```
Welcome back! How did the Code session go?

To capture what you built, let's run "update session".
I'll check git log for commits and we'll document the work.
```

---

## Examples

### Example 1: Starting Phase 1

**User**: "I'm ready to switch to Code and start building"

**Claude Desktop**:

```
Perfect! Here's your Code starter prompt:

---
Read .claude/PROJECT_CONTEXT.md and .claude/SESSION.md.

Then help me implement Phase 1: Foundation.

Start with:
1. Set up Next.js 14 with App Router (npx create-next-app)
2. Install Supabase dependencies (@supabase/supabase-js, @supabase/ssr)
3. Configure environment variables (.env.local)
4. Create Supabase client utilities (server + client)
5. Run banks table migration

Follow conventions from CLAUDE.md:
- TypeScript strict mode
- Server Actions for mutations
- shadcn/ui components

Ready to start? Let's go step-by-step.
---

Copy this into your Code session and you're good to go!

Should I also update SESSION.md to capture our Desktop planning?
```

---

### Example 2: Implementing Specific Feature

**User**: "What should I tell Code to build the question editor?"

**Claude Desktop**:

```
Here's your Code prompt for the QuestionEditor:

---
Read .claude/PROJECT_CONTEXT.md for QuestionEditor component architecture.

Build the QuestionEditor component with:
1. TypeSelector dropdown (Multiple Choice, Multiple Response, True/False)
2. PromptEditor using Tiptap (basic toolbar: bold, italic, lists)
3. AnswerList component (add/remove answers, mark correct)
4. FeedbackEditor (correct + incorrect messages via Tiptap)

Technical requirements:
- Use shadcn/ui for primitives (Card, Button, Input)
- Integrate Tiptap with StarterKit extension
- State managed via Zustand store (see CLAUDE.md patterns)
- Auto-save on change (debounced 30s)

Reference files:
- src/components/banks/QuestionEditor.tsx (create this)
- src/lib/store/bankStore.ts (Zustand store)

Let's build this step-by-step. Start with the basic structure.
---

Copy this into Code and start building!
```

---

## Notes

- **Always offer to update SESSION.md** before handoff
- **Be specific** in Code prompts (no vague "build the thing")
- **Reference files** (PROJECT_CONTEXT.md, CLAUDE.md) for context
- **Follow conventions** documented in CLAUDE.md
- **Provide examples** when helpful (file paths, code snippets)

---

**End of Workflow**

This workflow ensures smooth transitions between Desktop (planning) and Code (implementation).
