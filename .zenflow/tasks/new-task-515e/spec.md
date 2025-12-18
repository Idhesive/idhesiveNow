# Technical Specification: Daily Practice Screen

## Task Complexity Assessment: **Medium**

This task requires building a new route with a leaderboard, session management, and integration with existing quiz infrastructure. There are some architectural considerations around database queries for leaderboards and reusing existing components.

---

## Technical Context

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Package Manager**: bun
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: BetterAuth
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS

### Relevant Dependencies
- `@prisma/client` - Database access
- `next` - App router and server components
- React hooks for client state management
- Existing quiz infrastructure in `components/quiz/`

---

## Implementation Approach

### Route Structure
Create a new route at `/dashboard/practice/daily` following the existing pattern:
- `app/(admin)/dashboard/practice/daily/page.tsx` - Server component (auth check, data fetch)
- `app/(admin)/dashboard/practice/daily/daily-content.tsx` - Client component (UI)
- `app/(admin)/dashboard/practice/daily/loading.tsx` - Loading state

### Core Features

1. **Daily Challenge Display**
   - Show today's challenge details (question count, topic, difficulty)
   - Display user's completion status
   - If not completed: Show "Start Challenge" button
   - If completed: Show user's score and rank

2. **Leaderboard**
   - Display top performers for today's challenge
   - Show user's position relative to others
   - Include: rank, username, score, time taken
   - Paginated or show top 10/25 users

3. **Challenge Session Flow**
   - When user clicks "Start Challenge", create an assessment session with:
     - Fixed question set from `DailyChallenge.questionIds`
     - Link to `DailyChallenge.templateId` for configuration
   - Use existing quiz session infrastructure (`/dashboard/practice/quiz/[sessionId]`)
   - On completion, record attempt in `DailyChallengeAttempt` table

4. **Historical View** (Optional for MVP)
   - Allow users to view previous daily challenges
   - Show their past performance

### Database Schema Usage

**Existing Models:**
- `DailyChallenge` (prisma/schema.prisma:960-980)
  - `id`, `challengeDate`, `templateId`, `questionIds[]`
  - `topScores` (JSON), `totalAttempts`, `totalCompletions`, `averageScore`

- `DailyChallengeAttempt` (prisma/schema.prisma:983-1000)
  - `id`, `userId`, `challengeDate`, `templateId`, `sessionId`
  - `score`, `timeMs`, `questionsCorrect`, `rank`, `completedAt`

- `AssessmentSession` - Existing session tracking
- `AssessmentTemplate` - Configuration for daily challenges

### Server Actions Required

Create new actions in `actions/practice-actions.ts`:

1. **`getDailyChallengeData(date?: Date)`**
   - Fetch today's (or specified date's) `DailyChallenge`
   - Fetch user's attempt if exists
   - Calculate leaderboard from `DailyChallengeAttempt` records
   - Return: challenge details, user status, top scores

2. **`startDailyChallenge(challengeId: string)`**
   - Create `AssessmentSession` with challenge's question IDs
   - Link to `DailyChallenge.templateId`
   - Return: sessionId to redirect to quiz

3. **`completeDailyChallenge(sessionId: string, challengeId: string)`**
   - Called after session completion
   - Create `DailyChallengeAttempt` record
   - Update user's rank (calculate position)
   - Update `DailyChallenge` aggregate stats

---

## Source Code Structure

### Files to Create

1. **`app/(admin)/dashboard/practice/daily/page.tsx`**
   - Server component
   - Auth check via BetterAuth
   - Fetch daily challenge data
   - Pass to client component

2. **`app/(admin)/dashboard/practice/daily/daily-content.tsx`**
   - Client component
   - Display challenge card
   - Leaderboard table
   - User stats/position
   - Handle "Start Challenge" action

3. **`app/(admin)/dashboard/practice/daily/loading.tsx`**
   - Loading skeleton UI

4. **Server Actions** (add to existing `actions/practice-actions.ts`)
   - `getDailyChallengeData()`
   - `startDailyChallenge()`
   - `completeDailyChallenge()`

### Files to Modify

1. **`actions/practice-actions.ts`**
   - Add three new server actions listed above
   - Reuse existing patterns from `getPracticeDashboardData()`

2. **`app/(admin)/dashboard/practice/quiz/[sessionId]/page.tsx`** (potentially)
   - May need to detect if session is a daily challenge
   - On completion, trigger `completeDailyChallenge()` instead of just ending session

### Reusable Components

Leverage existing components from `components/practice/`:
- `DailyChallengeCard` - Already exists, use for challenge display
- UI components from `components/ui/` (Card, Table, Badge, Button, etc.)

Create new components if needed:
- `LeaderboardTable` - Display ranked users
- `DailyChallengeStats` - User's daily challenge stats

---

## Data Model Changes

**No schema changes required** - the existing `DailyChallenge` and `DailyChallengeAttempt` models support all necessary features.

### Key Queries

1. **Get Today's Challenge:**
```typescript
const today = new Date()
today.setHours(0, 0, 0, 0)

const challenge = await prisma.dailyChallenge.findFirst({
  where: { challengeDate: today }
})
```

2. **Get Leaderboard:**
```typescript
const leaderboard = await prisma.dailyChallengeAttempt.findMany({
  where: {
    challengeDate: today,
    templateId: challenge.templateId
  },
  orderBy: [
    { score: 'desc' },
    { timeMs: 'asc' }
  ],
  take: 25,
  include: {
    user: {
      select: { id: true, name: true, image: true }
    }
  }
})
```

3. **Get User's Position:**
```typescript
const userPosition = await prisma.dailyChallengeAttempt.count({
  where: {
    challengeDate: today,
    templateId: challenge.templateId,
    OR: [
      { score: { gt: userAttempt.score } },
      {
        score: userAttempt.score,
        timeMs: { lt: userAttempt.timeMs }
      }
    ]
  }
}) + 1
```

---

## Interface/API Changes

### Server Action Interfaces

```typescript
// Get daily challenge data
interface DailyChallengeData {
  challenge: {
    id: string
    challengeDate: Date
    questionCount: number
    totalParticipants: number
    averageScore: number | null
  } | null
  userAttempt: {
    score: number
    timeMs: number
    questionsCorrect: number
    rank: number
    completedAt: Date
  } | null
  leaderboard: {
    rank: number
    userId: string
    userName: string
    userImage: string | null
    score: number
    timeMs: number
    questionsCorrect: number
  }[]
  userRank: number | null
}

// Start daily challenge
interface StartDailyChallengeResult {
  sessionId: string
}

// Complete daily challenge
interface CompleteDailyChallengeResult {
  attemptId: string
  rank: number
  score: number
}
```

---

## Verification Approach

### Development Testing

1. **Manual Testing Steps:**
   - Navigate to `/dashboard/practice/daily`
   - Verify challenge displays correctly
   - Click "Start Challenge" → should redirect to quiz session
   - Complete quiz session
   - Verify completion updates leaderboard
   - Check user's rank displays correctly
   - Refresh page → should show "completed" state

2. **Test Scenarios:**
   - No challenge available (empty state)
   - First-time challenge taker
   - Repeat visitor (already completed)
   - Multiple users completing challenge (leaderboard updates)

### Database Verification

1. Run `bunx prisma studio` to verify:
   - `DailyChallenge` record exists for today
   - `DailyChallengeAttempt` created after completion
   - `AssessmentSession` properly linked
   - Rank calculations are correct

### Lint and Build

```bash
bun lint          # Check for TypeScript/ESLint errors
bun build         # Verify production build works
```

---

## Edge Cases & Considerations

1. **Time Zones:**
   - Daily challenges are date-based (midnight UTC vs local time)
   - Ensure consistent date handling across server/client

2. **No Challenge Available:**
   - Handle case where no challenge exists for today
   - Show appropriate empty state

3. **Concurrent Completions:**
   - Multiple users completing simultaneously
   - Rank calculation race conditions
   - Consider async rank updates or transactions

4. **User Privacy:**
   - Display usernames on leaderboard
   - Consider anonymous mode option

5. **Challenge Seed Data:**
   - Daily challenges need to be created (manually or via cron)
   - Implementation should handle missing challenges gracefully

---

## Security Considerations

1. **Authorization:**
   - Verify user is authenticated before showing challenge
   - Prevent users from starting multiple attempts
   - Verify session ownership before recording completion

2. **Data Validation:**
   - Validate challengeId exists before starting
   - Ensure sessionId belongs to requesting user
   - Prevent score manipulation

---

## Performance Considerations

1. **Leaderboard Caching:**
   - Consider caching top scores in `DailyChallenge.topScores` JSON field
   - Update cache periodically rather than on every attempt

2. **Database Indexes:**
   - Existing indexes on `challengeDate` should suffice
   - Monitor query performance for leaderboard calculations

---

## Design Decisions (Confirmed)

1. **Leaderboard Display:**
   - Show top 10 users
   - **IMPORTANT:** Emphasize effort over performance - design leaderboard to highlight participation and consistency
   - Future: Should be social network-based (friends only)
   - Focus on encouraging participation rather than pure competition

2. **Challenge Refresh:**
   - Use user's local timezone for daily reset
   - Challenges are date-based per user's local time

3. **Retry Policy:**
   - Retries are allowed - users can attempt the same daily challenge multiple times
   - Track best attempt for leaderboard ranking

4. **Historical Challenges:**
   - All challenges stored in database and accessible
   - Deeplinkable URLs (e.g., `/dashboard/practice/daily/2025-12-18`)
   - Users can replay any past challenge

5. **Empty State:**
   - Show empty state when no challenge exists for today
   - Include link to browse previous challenges
