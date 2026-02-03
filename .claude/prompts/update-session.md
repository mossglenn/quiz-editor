# Update Session Workflow

**Trigger Phrases**:

- "update session"
- "update session documentation"
- "update SESSION.md"

---

## Workflow Steps

### 1. Gather Context from Multiple Sources

**Desktop Session Context**:

- Review current conversation for:
    - Architecture decisions made
    - Features planned or designed
    - Blockers encountered
    - Questions raised (answered or open)
    - Files created/updated

**Code Session Context** (if applicable):

- Check git log for recent commits:

```bash
  git log --oneline --since="last session" --no-merges
```

- Review commit messages for:
    - Features implemented
    - Bugs fixed
    - Refactorings completed
- Check git diff for file changes:

```bash
  git diff HEAD~5..HEAD --stat
```

---

### 2. Present Findings for Confirmation

Show what was discovered:

**Example Output**:

```
I found the following from our Desktop conversation:
- ✅ Decided on table-based storage (Postgres)
- ✅ Designed database schema with RLS policies
- ✅ Created PROJECT_CONTEXT.md for Code sessions
- ❓ Open question: Which drag-and-drop library to use?

And from git log (Code session):
- ✅ feat: set up Next.js project with App Router
- ✅ feat: configure Supabase client
- ✅ feat: create banks table migration
- ❓ Are there any other changes I should capture?

Should I proceed with this update?
```

**Ask clarifying questions**:

- "Was there a blocker I didn't capture?"
- "Should X be marked as done or still in progress?"
- "Any observations or lessons learned you want noted?"

---

### 3. Generate Proposed Update

Draft updates for SESSION.md sections:

**Current State**:

- Move completed items from "What's Next" to "What's Done"
- Add new "What's Next" items based on conversation
- Update "Active Decisions" if architecture changed
- Add new "Blockers" if any emerged
- Update "Open Questions" (resolve answered ones, add new ones)

**Session History Entry**:

```markdown
### YYYY-MM-DD — [Session Title] ([Desktop/Code])

**Focus**: [One-line summary]

**Accomplishments**:

- [Concrete achievements]
- [Features implemented or designed]

**Key Decisions**:

- [Architecture choices]
- [Tech stack selections]

**Technical Details**:

- [Implementation specifics]
- [Database changes, API additions, etc.]

**Notes for Next Session**:

- [What to do next]
- [Context for handoff]

**Files Created/Updated**:

- [List of files touched]
```

**Notes & Observations**:

- Add emerging patterns if noticed
- Document lessons learned
- Note future considerations

---

### 4. Wait for Approval

**Present proposed update**:

```
Here's my proposed SESSION.md update:

[Show full proposed changes in a code block]

Does this accurately capture the session?
Any corrections or additions before I write it?
```

---

### 5. Apply Approved Update

**After user confirms**:

1. Update `.claude/SESSION.md` with approved content
2. Update "Last Updated" timestamp
3. Show summary of changes:

```
   ✅ Updated SESSION.md:
   - Moved 3 items from "What's Next" to "What's Done"
   - Added session history entry for 2025-02-03
   - Documented 2 key decisions
   - Noted 1 open question
```

---

### 6. Check if CLAUDE.md Needs Update

**After SESSION.md is updated**:

```
I've updated SESSION.md.

I also noticed we discussed [architectural pattern X].
Should I add this to CLAUDE.md under [Design Patterns / Anti-Patterns / etc.]?
```

**Only update CLAUDE.md if**:

- A new pattern has solidified (used 2+ times)
- An architectural decision has long-term implications
- A coding convention was established
- An anti-pattern was identified

---

## Key Behaviors

### ✅ Do This

- Check git log to capture Code session work
- Ask clarifying questions when context is unclear
- Present proposed update BEFORE writing to file
- Be specific and concrete (not vague)
- Synthesize Desktop + Code contexts into coherent narrative
- Use clear section headers and formatting
- Include file paths for created/updated files

### ❌ Don't Do This

- Update SESSION.md without user approval
- Miss Code session commits (always check git)
- Be vague ("made progress on X" → specify what was done)
- Duplicate information (SESSION vs CLAUDE.md overlap)
- Forget to update timestamps
- Skip clarifying questions when uncertain

---

## Examples

### Example 1: Desktop Planning Session

**User**: "update session"

**Claude**:

```
I'll review our conversation and git history to update SESSION.md.

From our Desktop conversation today, I see:
- ✅ Finalized tech stack (Next.js, Supabase, Tiptap)
- ✅ Designed complete database schema
- ✅ Created PROJECT_CONTEXT.md for Code sessions
- ✅ Set up .claude/ workflow structure

From git log:
(No commits since last session—this was planning only)

Should I add these to "What's Done" and create a session entry titled:
"2025-02-03 — Planning & Context Generation (Desktop)"

Focus: Architecture decisions, tech stack selection, context documentation

Any corrections or additions?
```

---

### Example 2: Code Implementation Session

**User**: "update session"

**Claude**:

```
Let me check our conversation and git commits.

From our Desktop conversation:
(No Desktop discussion this session—pure Code work)

From git log (last 5 commits):
- feat: set up Next.js project with App Router
- feat: configure Supabase client and env vars
- feat: create banks table migration
- feat: build BankCard component
- fix: TypeScript errors in supabase client

Should I create a session entry titled:
"2025-02-04 — Phase 1 Foundation (Code)"

Focus: Project scaffolding, Supabase setup, initial components

Accomplishments:
- ✅ Scaffolded Next.js 14 with App Router
- ✅ Installed dependencies (Supabase, Tailwind, shadcn)
- ✅ Configured Supabase client (server + client)
- ✅ Ran banks table migration
- ✅ Built BankCard component (basic UI)

Next steps:
- [ ] Create BankListPage
- [ ] Build Server Actions for bank CRUD
- [ ] Add routing for /banks

Is this accurate? Any blockers or observations to note?
```

---

### Example 3: Cross-Context Session

**User**: "update session"

**Claude**:

```
Checking both Desktop conversation and git commits...

From our Desktop conversation today:
- ✅ Discussed import/export format (Storyline CSV)
- ✅ Designed import parser logic
- ❓ Open question: Should we validate column order or allow flexible ordering?

From git log (last 3 commits):
- feat: implement Storyline CSV import function
- test: add manual test for sample CSV files
- docs: update README with import instructions

Should I create a session entry combining both contexts?

"2025-02-05 — Storyline Import Feature (Desktop + Code)"

Focus: Designed and implemented CSV import functionality

Accomplishments:
- ✅ Researched Storyline CSV format (Desktop)
- ✅ Designed import parser architecture (Desktop)
- ✅ Implemented importStorylineCSV function (Code)
- ✅ Tested with sample CSV files (Code)
- ✅ Documented import process in README (Code)

Open Questions:
- Should CSV parser enforce strict column order, or allow flexible ordering?

Technical Details:
- Uses papaparse for CSV parsing
- Validates with Zod schema
- Converts plain text to Tiptap JSON
- Handles Multiple Choice, Multiple Response, True/False types

Does this capture everything?
```

---

## Notes

- **Frequency**: Run "update session" at end of every Desktop or Code session
- **Granularity**: One session entry per day (or per major phase)
- **Git Integration**: Always check git log for Code sessions—don't rely on conversation alone
- **Approval Required**: Never update SESSION.md without user confirmation
- **Cross-Referencing**: Link to PROJECT_CONTEXT.md or CLAUDE.md when appropriate

---

**End of Workflow**

This workflow enables effortless session documentation that captures work from both Claude Desktop and Claude Code.
