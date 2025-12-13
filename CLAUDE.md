# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IdhesiveNow is a Next.js 15 Intelligent Tutoring System (ITS) prototype with BetterAuth authentication, QTI 3.0 assessment rendering, and a comprehensive curriculum/progression tracking system. Uses bun as package manager.

## Development Commands

```bash
# Install dependencies
bun install

# Start development server (uses Turbopack)
bun dev

# Build for production
bun build

# Start production server
bun start

# Lint
bun lint

# Database operations
bunx prisma migrate dev     # Run migrations
bunx prisma generate        # Generate Prisma client
bunx prisma studio          # Open Prisma Studio GUI
bun run db:seed             # Seed database (bunx tsx prisma/seed.ts)
bun run db:reset            # Reset database (prisma migrate reset)
```

## Architecture

### Route Groups (App Router)
- `app/(root)/` - Public landing pages
- `app/(auth)/` - Authentication pages (sign-in, sign-up)
- `app/(admin)/` - Protected dashboard and admin routes
- `app/api/` - API routes including BetterAuth handler

### Key Directories
- `components/ui/` - ShadCN UI primitives
- `components/qti/` - QTI 3.0 web component wrappers
- `components/quiz/` - Quiz state management and rendering (modes, hooks)
- `context/` - React contexts (UserContext)
- `actions/` - Server actions for auth
- `lib/` - Utilities, auth config, Prisma client, types

### Authentication (BetterAuth)
- Server config: `lib/auth.ts` - BetterAuth with Prisma adapter, Google OAuth, email/password
- Client: `lib/auth-client.ts` - React auth client
- API route: `app/api/auth/[...all]/route.ts` - Catch-all auth handler
- Server actions: `actions/auth-actions.ts`, `actions/google-auth-action.ts`

### QTI Integration
QTI 3.0 assessment items are rendered using `@citolab/qti-components`:

- `components/qti/qti-client-init.tsx` - Initializes QTI web components (must wrap app in layout)
- `components/qti/qti-item-viewer.tsx` - React wrapper for QTI items
- `components/qti/qti-types.ts` - TypeScript definitions for QTI web components
- `lib/qti/mock-qti-data.ts` - Sample QTI XML for testing

See `QTI_INTEGRATION.md` for detailed usage.

### Quiz System
Plugin-based quiz engine at `components/quiz/`:

- `QuizContext.tsx` - State management with useReducer, plugin event system
- `modes/AssessmentMode.tsx` - Fixed assessment with navigation
- `modes/StreamMode.tsx` - Continuous streaming questions
- `hooks/useQuestionFetcher.ts` - Question data fetching
- `lib/quiz/types.ts` - QuizState, QuizEvent, QuizPlugin interfaces

### Database Schema (Prisma)
Large schema at `prisma/schema.prisma` with domains:

1. **Authentication** - User, Session, Account, Verification (BetterAuth)
2. **Curriculum** - Country > Curriculum > Subject > GradeLevel > Topic hierarchy
3. **External Standards** - StandardFramework, ExternalStandard, StandardAlignment
4. **Question Bank** - Question (QTI XML), QuestionTopic, QuestionRevision
5. **Learner Tracking** - LearnerProfile, QuestionResponse, ResponseScore, LearnerKnowledgeState
6. **Assessments** - AssessmentTemplate, AssessmentSession, multiple assessment types (PUZZLE_STREAK, ADAPTIVE_ASSESSMENT, etc.)
7. **Progression/Gamification** - LearnerProgression, LearnerStreak, BadgeDefinition, AchievementDefinition, CosmeticItem, XpTransaction

Key enums: `AssessmentType`, `QuestionSelectionStrategy`, `TerminationCondition`, `AcademicTier`, `EngagementLevel`

## Environment Variables

Required in `.env`:
```
BETTER_AUTH_SECRET=<secret>
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID=<oauth-id>
GOOGLE_CLIENT_SECRET=<oauth-secret>
```

## Testing QTI

Navigate to `/dashboard/qti-test` to test QTI rendering with sample items.

## Important Patterns

- QTI web components require `<QtiClientInit>` wrapper in root layout
- Quiz modes use the QuizContext for state; add plugins via `addPlugin()` for event handling
- Database uses Glicko-2 rating system for adaptive question selection
- Curriculum hierarchy: Country > Curriculum > Subject > GradeLevel > Topic (self-referential for subtopics)
