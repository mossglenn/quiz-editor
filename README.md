# Quiz Editor

> **The first tool in the IDIDE ecosystem for instructional designers**

Create, edit, and manage quiz question banks with seamless Articulate Storyline 360 integration.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

---

## 🚧 Project Status

**Current Phase:** Pre-MVP Implementation  
**Status:** Active Development  
**Version:** 0.1.0 (Not Production Ready)

This project is in early development. Core architecture is being established. Not recommended for production use yet.

---

## 🎯 Features

### Current (Implemented)
- ✅ **Type System** - Core Framework + Quiz Editor type definitions
- ✅ **Storage Interface** - Abstract storage adapter pattern
- ✅ **State Management** - Zustand + Immer stores
- ✅ **Documentation** - Comprehensive JSDoc throughout

### Planned (MVP - Phase 1)
- 🚧 **WYSIWYG Editor** - Rich text editing with Tiptap
- 🚧 **Question Banks** - Organize questions into reusable banks
- 🚧 **Storyline Integration** - Import/export CSV compatible with Articulate Storyline 360
- 🚧 **Project Management** - Create and manage multiple projects
- 🚧 **Authentication** - Supabase auth with RLS

### Future (Post-MVP)
- 📋 **Collaboration** - Multi-user editing and sharing
- 📋 **Version Control** - Git-style branching and PR workflow
- 📋 **Graph Manager** - Visual dependency management
- 📋 **Desktop App** - Self-hosted Tauri application
- 📋 **Plugin Ecosystem** - Additional tools for instructional design

---

## 🏗️ Architecture

Quiz Editor uses a **hub-plugin architecture** designed for extensibility:

```
Core Framework (Shared)
├── types/core/        # Artifact, Project, Link types
├── lib/storage/       # Storage adapter interface
└── store/core-store   # Framework-level state

Quiz Editor Plugin (Tool-Specific)
├── types/quiz-editor/ # Question, Bank types
├── components/        # UI components
└── store/quiz-editor  # Tool-specific state
```

**Key Architectural Principles:**
- **Semantic Artifact Typing** - Artifacts typed by WHAT they are (not which tool created them)
- **Storage Adapter Pattern** - Swap backends (Supabase/SQLite) without changing UI
- **Namespace Separation** - Core Framework vs Tool separation enforced
- **Schema Versioning** - All artifacts include `schema_version` for migrations

See [Architecture Documentation](./.claude/CLAUDE.md) for detailed design decisions.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([install](https://nodejs.org))
- **npm** 9+ (comes with Node)
- **Supabase account** ([sign up](https://supabase.com)) - Required for MVP
- **Git** ([install](https://git-scm.com))

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/quiz-editor.git
cd quiz-editor

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Setup

Create `.env.local` with:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Future features
# NEXT_PUBLIC_ANALYTICS_ID=
# SENTRY_DSN=
```

> 📝 **Note:** Complete setup guide coming soon in [docs/setup.md](docs/setup.md)

---

## 📁 Project Structure

```
quiz-editor/
├── .claude/                # AI-assisted development documentation
│   ├── CLAUDE.md          # Architectural decisions and patterns
│   ├── PROJECT_CONTEXT.md # Technical specifications
│   ├── SESSION.md         # Current development state
│   └── prompts/           # Workflow automation prompts
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui primitives
│   │   ├── bank/         # Bank components (planned)
│   │   ├── question/     # Question components (planned)
│   │   └── project/      # Project components (planned)
│   ├── lib/
│   │   ├── storage/      # Storage adapter interface
│   │   └── utils.ts      # Utility functions
│   ├── store/
│   │   ├── core-store.ts        # Framework state
│   │   └── quiz-editor-store.ts # Tool-specific state
│   └── types/
│       ├── core/         # Framework types (Artifact, Project, Link)
│       └── quiz-editor/  # Tool types (Question, Bank)
├── supabase/             # Database migrations (planned)
├── docs/                 # Documentation (planned)
└── examples/             # Usage examples (planned)
```

---

## 💻 Tech Stack

### Core
- **Framework:** [Next.js 15](https://nextjs.org) (App Router)
- **Language:** [TypeScript 5](https://www.typescriptlang.org) (strict mode)
- **UI Library:** [React 19](https://react.dev)

### Data & State
- **Database:** [Supabase](https://supabase.com) (Postgres + Auth + RLS)
- **State Management:** [Zustand 5](https://zustand-demo.pmnd.rs) + [Immer](https://immerjs.github.io/immer/)
- **Data Fetching:** Next.js Server Actions

### UI & Styling
- **Component Library:** [shadcn/ui](https://ui.shadcn.com)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com)
- **Icons:** [Lucide React](https://lucide.dev)
- **Theming:** [next-themes](https://github.com/pacocoursey/next-themes)

### Editor (Planned)
- **Rich Text Editor:** [Tiptap](https://tiptap.dev)
- **CSV Parser:** [PapaParse](https://www.papaparse.com) (for Storyline import/export)

### Development
- **Linting:** ESLint
- **Type Checking:** TypeScript compiler
- **Git Workflow:** Conventional commits

---

## 🧪 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check (coming soon)
npm run type-check
```

### Code Style

- **TypeScript strict mode** - No `any` types
- **Functional components** - React hooks (no classes)
- **Tailwind CSS** - Utility-first styling
- **Conventional commits** - Structured commit messages

**Example commit:**
```bash
feat(quiz-editor): add question creation form
fix(storage): handle null artifacts gracefully
docs(readme): update installation instructions
```

### Documentation Standards

**All code must include JSDoc documentation.**

See [Documentation Standards](./.claude/PROJECT_CONTEXT.md#documentation-standards) for complete guidelines.

**Quick example:**
```typescript
/**
 * Update a question's data fields.
 * Automatically updates metadata.modified_at timestamp.
 * 
 * @param id - ID of question to update
 * @param updates - Partial question data to merge
 * 
 * @example
 * updateQuestion(questionId, { prompt: newPrompt });
 */
updateQuestion: (id: string, updates: Partial<QuizQuestion['data']>) => void;
```

---

## 📚 Documentation

### For Developers
- [Architecture Overview](./.claude/CLAUDE.md) - Design decisions and patterns
- [Project Context](./.claude/PROJECT_CONTEXT.md) - Technical specifications
- [Session Guide](./.claude/WORKING_SESSION_GUIDE.md) - Development workflow
- [Code Standards](./.claude/PROJECT_CONTEXT.md#documentation-standards) - JSDoc and conventions

### For Contributors (Coming Soon)
- [Contributing Guide](CONTRIBUTING.md) - How to contribute ⏳
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines ⏳
- [Setup Guide](docs/setup.md) - Detailed environment setup ⏳
- [API Documentation](docs/api/) - API reference ⏳

### For Users (Coming Soon)
- [User Guide](docs/user-guide.md) - How to use Quiz Editor ⏳
- [Storyline Integration](docs/storyline.md) - Import/export guide ⏳
- [FAQ](docs/faq.md) - Frequently asked questions ⏳

---

## 🤝 Contributing

**Status:** Not accepting external contributions yet.

We're still establishing core architecture and patterns. Once the MVP is stable, we'll open contributions.

**When we're ready for contributors, you'll find:**
- ✅ CONTRIBUTING.md - Contribution guidelines
- ✅ CODE_OF_CONDUCT.md - Community standards
- ✅ Issues labeled "good first issue"
- ✅ Developer setup guide
- ✅ Testing documentation

**Want to help?**
- ⭐ **Star this repo** to show interest
- 👀 **Watch releases** to stay updated
- 💬 **Open discussions** for ideas (when enabled)

---

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- [ ] Core type system ✅ Done
- [ ] Storage adapter interface ✅ Done
- [ ] State management ✅ Done
- [ ] Authentication & RLS
- [ ] Project management UI
- [ ] Question editor (Tiptap)
- [ ] Bank management
- [ ] Storyline import/export

### Phase 2: Collaboration
- [ ] Multi-user projects
- [ ] Real-time updates
- [ ] Comments and feedback
- [ ] Team management
- [ ] Activity history

### Phase 3: Advanced Features
- [ ] Graph Manager (visual PR review)
- [ ] Quiz Review plugin (SME feedback)
- [ ] Version control (branching/merging)
- [ ] Analytics dashboard
- [ ] Export to multiple formats

### Phase 4: Desktop Edition
- [ ] Tauri application
- [ ] Local SQLite storage
- [ ] Git integration
- [ ] Self-hosted deployment
- [ ] Offline-first sync

See [PROJECT_CONTEXT.md](./.claude/PROJECT_CONTEXT.md) for detailed implementation plan.

---

## 📝 License

[License TBD] - Not yet determined

**Current Status:** Private development. License will be chosen before public release.

**Options under consideration:**
- MIT - Maximum freedom
- Apache 2.0 - Patent protection
- AGPL - Copyleft for SaaS

---

## 🔗 Links

### Project
- **Repository:** https://github.com/yourusername/quiz-editor
- **Issues:** https://github.com/yourusername/quiz-editor/issues
- **Discussions:** [Coming Soon]
- **Documentation:** [Coming Soon]

### Ecosystem
- **IDIDE Hub:** [Coming Soon] - Central graph manager
- **Plugin Marketplace:** [Coming Soon] - Additional tools

### Related Tools
- **Articulate Storyline 360:** https://articulate.com/360/storyline
- **Import Format Docs:** https://www.articulatesupport.com/article/Storyline-360-Importing-Questions-from-Excel-Spreadsheets-and-Text-Files

---

## 📧 Contact

**Project Lead:** Amos Glenn

- **Email:** [Your Email]
- **Twitter:** [Your Twitter]
- **LinkedIn:** [Your LinkedIn]

**For Questions:**
- Open a [GitHub Discussion](link) [Coming Soon]
- Join our [Discord](link) [Coming Soon]

---

## 🙏 Acknowledgments

### Technologies
Built with amazing open-source tools:
- [Next.js](https://nextjs.org) by Vercel
- [Supabase](https://supabase.com) for backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Zustand](https://zustand-demo.pmnd.rs) for state management
- [Tiptap](https://tiptap.dev) for rich text editing

### Inspiration
- Articulate Storyline 360 - The industry standard for e-learning
- Figma - Plugin architecture inspiration
- VS Code - Extension ecosystem model

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/quiz-editor?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/quiz-editor?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/yourusername/quiz-editor?style=social)

**Lines of Code:** [Coming Soon]  
**Test Coverage:** [Coming Soon]  
**Build Status:** [Coming Soon]

---

**Built with ❤️ for instructional designers**

---

## Development Notes

This project uses an AI-assisted development workflow with Claude Desktop and Claude Code:
- **Claude Desktop** - Architecture planning and session management
- **Claude Code** - Implementation and coding
- **Documentation** - All development context in `.claude/` directory

See [WORKING_SESSION_GUIDE.md](./.claude/WORKING_SESSION_GUIDE.md) for workflow details.
