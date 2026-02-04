# Daily Workflow

## Workflow 1: "Update Session" (End of Session)

Trigger: "update session"
Purpose: Document what happened in current session
Steps:

1. Read SESSION.md
2. Check git log
3. Analyze conversation
4. Propose update
5. Write SESSION.md

When to use: End of Desktop or Code session (to capture work done)

---

## Workflow 2: "I'm Ready to Switch to Code" (Handoff)

Trigger: "I'm ready to switch to Code" or "handoff to Code"
Purpose: Prepare for transition from Desktop → Code
Steps:

1. Review what was decided in Desktop session
2. Generate Code starter prompt (what Code should build)
3. Offer to update SESSION.md first (if not already done)
4. Provide quick reference for Code session

When to use: When you're about to open Code and want implementation guidance

---

## Workflow 3: Starting a Code Session

1. If coming from Desktop, use provided reference snippet
2. If not, use the following: `Read .claude/PROJECT_CONTEXT.md and .claude/SESSION.md to understand the project.`
3. Look at SESSION.md → "Current State" → "What's Next" to see what to build.
4. Ask Code to help implement the next item from "What's Next".

When to use: When starting a Code session

## How to Use CODE_REFERENCE.md

Before you start coding:

1. Read PROJECT_CONTEXT.md (full context)
2. Read SESSION.md (current state)
3. Keep CODE_REFERENCE.md open in a split pane or second monitor

While coding:

- **Need a command?** → Check "Tech Stack Reminders"
- **Forgot file structure?** → Check "File Structure"
- **How do I do X?** → Check "Common Patterns"
- **TypeScript error?** → Check "Troubleshooting"
- **Database field?** → Check "Database Schema Quick Reference"

It's like having a cheat sheet always available!

---

## Workflow 4: Committing

Trigger: "Commit message please"
Purpose: Commit changes with message
Steps:

1. Code reviews changes and presents draft message
2. Suggest changes or approve message
3. Code commits with approved message

When to use: When finished making changes

---

## Workflow 5: Ending Code Session

1. Switch to Desktop
2. Say "update session" to run that workflow

---
