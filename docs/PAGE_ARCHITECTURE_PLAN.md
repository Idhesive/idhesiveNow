# IdhesiveNow Page Architecture Plan

> Detailed plan for building pages from the Prisma schema using Next.js 15 best practices

## Table of Contents

1. [Sitemap Overview](#sitemap-overview)
2. [Route Architecture](#route-architecture)
3. [Page Specifications](#page-specifications)
4. [Shared Component Requirements](#shared-component-requirements)
5. [Data Patterns](#data-patterns)
6. [Implementation Phases](#implementation-phases)

---

## Sitemap Overview

### Visual Sitemap

```
/                                    # Landing page (public)
├── /sign-in                         # Authentication
├── /sign-up                         # Registration
│
├── /dashboard                       # Protected dashboard root
│   ├── /                            # Dashboard home / overview
│   │
│   ├── /learn                       # Learning Hub
│   │   ├── /                        # Learning dashboard
│   │   ├── /subjects                # Subject browser
│   │   ├── /subjects/[subjectId]    # Subject detail
│   │   ├── /topics/[topicId]        # Topic learning page
│   │   ├── /paths                   # Learning paths browser
│   │   └── /paths/[pathId]          # Learning path detail
│   │
│   ├── /practice                    # Practice & Assessment Hub
│   │   ├── /                        # Practice dashboard
│   │   ├── /quiz/[sessionId]        # Active quiz session
│   │   ├── /quiz/results/[sessionId]# Quiz results
│   │   ├── /daily                   # Daily challenge
│   │   └── /history                 # Assessment history
│   │
│   ├── /progress                    # Progress & Analytics
│   │   ├── /                        # Progress overview
│   │   ├── /subjects/[subjectId]    # Subject progress
│   │   ├── /topics/[topicId]        # Topic mastery detail
│   │   └── /analytics               # Detailed analytics
│   │
│   ├── /achievements                # Gamification Hub
│   │   ├── /                        # Achievements overview
│   │   ├── /badges                  # Badge collection
│   │   ├── /badges/[badgeId]        # Badge detail
│   │   ├── /achievements            # Achievement list
│   │   └── /leaderboard             # Leaderboards
│   │
│   ├── /profile                     # User Profile Hub
│   │   ├── /                        # Profile overview
│   │   ├── /settings                # Settings
│   │   ├── /customize               # Cosmetics customization
│   │   └── /streak                  # Streak management
│   │
│   └── /settings                    # App Settings
│       ├── /                        # General settings
│       ├── /account                 # Account settings
│       ├── /notifications           # Notification preferences
│       └── /preferences             # Learning preferences
│
├── /admin                           # Admin routes (future)
│   ├── /curriculum                  # Curriculum management
│   ├── /questions                   # Question bank management
│   ├── /users                       # User management
│   └── /analytics                   # System analytics
│
└── /api                             # API routes
    ├── /auth/[...all]               # BetterAuth handler
    ├── /quiz/[...]                  # Quiz API endpoints
    └── /progress/[...]              # Progress API endpoints
```

---

## Route Architecture

### Route Groups

```
app/
├── (root)/                          # Public marketing pages
│   ├── layout.tsx                   # Public layout (minimal)
│   └── page.tsx                     # Landing page
│
├── (auth)/                          # Authentication pages
│   ├── layout.tsx                   # Auth-specific layout
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
│
├── (dashboard)/                     # Protected learner area
│   ├── layout.tsx                   # Dashboard shell (sidebar, header)
│   ├── dashboard/
│   │   ├── page.tsx                 # Dashboard home
│   │   ├── learn/
│   │   ├── practice/
│   │   ├── progress/
│   │   ├── achievements/
│   │   ├── profile/
│   │   └── settings/
│   └── loading.tsx                  # Dashboard loading state
│
├── (admin)/                         # Protected admin area
│   ├── layout.tsx                   # Admin shell
│   └── admin/
│       ├── curriculum/
│       ├── questions/
│       ├── users/
│       └── analytics/
│
└── api/
    ├── auth/[...all]/route.ts
    ├── quiz/
    └── progress/
```

### Layout Hierarchy

```
RootLayout (app/layout.tsx)
├── QtiClientInit wrapper
├── ThemeProvider
├── Toaster (Sonner)
└── TopLoader

  PublicLayout (root)
  └── Minimal header/footer

  AuthLayout (auth)
  └── Centered card layout

  DashboardLayout (dashboard)
  ├── Session check (server)
  ├── UserProvider
  ├── SidebarProvider
  ├── AppSidebar (navigation)
  └── Main content area
      └── AppHeader

  AdminLayout (admin)
  ├── Session + role check
  └── Admin-specific sidebar
```

---

## Page Specifications

### 1. Dashboard Home (`/dashboard`)

**Purpose:** Central hub showing learning status, streak, recent activity, and quick actions.

**Data Requirements:**
- `LearnerProfile` - Current grade, aggregated stats
- `LearnerProgression` - Tier, XP, engagement level
- `LearnerStreak` - Current streak, daily goal progress
- Recent `AssessmentSession` records
- Active `LearnerLearningPath` progress

**Components:**

```
DashboardHomePage
├── WelcomeHeader
│   ├── User greeting (time-based)
│   ├── CurrentStreakBadge
│   └── TierBadge
│
├── DailyGoalCard
│   ├── GoalProgressRing
│   ├── GoalDescription
│   └── CompleteGoalButton
│
├── QuickActionsGrid
│   ├── ContinueLearningCard (resume last topic/path)
│   ├── DailyChallengeCard
│   ├── PracticeCard
│   └── ReviewCard
│
├── RecentActivityFeed
│   ├── ActivityItem (badge earned, topic completed, etc.)
│   └── ViewAllLink
│
├── ProgressSummaryCard
│   ├── SubjectProgressBars
│   └── WeeklyActivityChart
│
└── UpcomingCard
    ├── NextLearningPathItem
    └── RecommendedTopics
```

**Server Actions:**
```typescript
// actions/dashboard-actions.ts
export async function getDashboardData(userId: string)
export async function updateDailyGoalProgress(userId: string, progress: number)
export async function recordDailyLogin(userId: string)
```

---

### 2. Learning Hub (`/dashboard/learn`)

#### 2.1 Learning Dashboard (`/dashboard/learn`)

**Purpose:** Entry point for learning content, showing subjects, paths, and recommendations.

**Data Requirements:**
- `Subject` list with user progress overlay
- `LearningPath` recommendations
- `Topic` mastery states
- `TutorialContent` suggestions

**Components:**

```
LearnDashboardPage
├── LearnHeader
│   ├── SearchInput (topics, subjects)
│   └── FilterDropdown (grade level, subject)
│
├── SubjectGrid
│   └── SubjectCard
│       ├── SubjectIcon (with color)
│       ├── SubjectName
│       ├── ProgressBar (topics completed)
│       └── TopicCount
│
├── LearningPathSection
│   ├── ActivePathCard (if enrolled)
│   │   ├── PathProgress
│   │   ├── CurrentItem
│   │   └── ContinueButton
│   └── RecommendedPaths
│       └── PathPreviewCard
│
├── RecentTopicsSection
│   └── TopicCard (recently accessed)
│
└── RecommendationsSection
    └── PersonalizedTopicSuggestions
```

#### 2.2 Subject Detail (`/dashboard/learn/subjects/[subjectId]`)

**Purpose:** Browse topics within a subject, organized by grade level.

**Data Requirements:**
- `Subject` with related `GradeLevel`
- `Topic` hierarchy (parent/child)
- `LearnerKnowledgeState` for each topic
- `TutorialContent` counts

**Components:**

```
SubjectDetailPage
├── SubjectHeader
│   ├── BackButton
│   ├── SubjectIcon
│   ├── SubjectName
│   ├── Description
│   └── OverallProgress
│
├── GradeLevelTabs
│   └── GradeLevelTab
│
├── TopicTree
│   └── TopicTreeNode (recursive)
│       ├── TopicIcon (mastery-based color)
│       ├── TopicName
│       ├── MasteryIndicator
│       ├── EstimatedTime
│       ├── TutorialCount
│       └── ChildTopics (collapsible)
│
└── TopicQuickView (side panel)
    ├── TopicDetails
    ├── Prerequisites
    ├── StartLearningButton
    └── PracticeButton
```

#### 2.3 Topic Learning Page (`/dashboard/learn/topics/[topicId]`)

**Purpose:** Primary learning interface for a topic with tutorials and practice.

**Data Requirements:**
- `Topic` with prerequisites, learning goals
- `TutorialContent` list (ordered)
- `LearnerKnowledgeState` for topic
- Related `Question` count
- `ExternalStandard` alignments

**Components:**

```
TopicLearnPage
├── TopicHeader
│   ├── Breadcrumb (Subject > Grade > Parent Topic > Topic)
│   ├── TopicTitle
│   ├── EstimatedTime
│   ├── MasteryBadge
│   └── ActionsMenu (favorite, share)
│
├── TopicTabs
│   ├── OverviewTab
│   │   ├── LearningGoals
│   │   ├── Prerequisites (with status)
│   │   └── StandardsAlignment
│   │
│   ├── LearnTab
│   │   ├── TutorialList
│   │   │   └── TutorialCard
│   │   │       ├── TypeIcon (VIDEO, ARTICLE, etc.)
│   │   │       ├── Title
│   │   │       ├── Duration
│   │   │       ├── CompletionCheckmark
│   │   │       └── DifficultyBadge
│   │   └── TutorialViewer (expandable/modal)
│   │
│   ├── PracticeTab
│   │   ├── QuickPracticeButton
│   │   ├── DifficultySelector
│   │   └── PracticeHistorySummary
│   │
│   └── ProgressTab
│       ├── MasteryChart
│       ├── AttemptHistory
│       └── KnowledgeStateDetails
│
└── RelatedTopicsSection
    └── RelatedTopicCard
```

#### 2.4 Learning Path Detail (`/dashboard/learn/paths/[pathId]`)

**Purpose:** Structured learning sequence with progress tracking.

**Data Requirements:**
- `LearningPath` with items
- `LearnerLearningPath` progress
- `LearningPathItem` list with `Topic` details
- Completion states

**Components:**

```
LearningPathPage
├── PathHeader
│   ├── PathTitle
│   ├── PathDescription
│   ├── CreatedBy
│   ├── TotalDuration
│   ├── ProgressBar
│   └── EnrollButton / ContinueButton
│
├── PathProgressStepper
│   └── PathStepItem
│       ├── StepNumber
│       ├── TopicName
│       ├── EstimatedTime
│       ├── RequiredMastery
│       ├── CurrentMastery
│       ├── Status (locked, current, completed)
│       └── GoToTopicButton
│
├── PathOverviewSection
│   ├── WhatYouWillLearn
│   ├── Prerequisites
│   └── EstimatedCompletion
│
└── PathReviewsSection
    └── UserReview (future feature)
```

---

### 3. Practice Hub (`/dashboard/practice`)

#### 3.1 Practice Dashboard (`/dashboard/practice`)

**Purpose:** Central hub for all practice and assessment activities.

**Data Requirements:**
- `AssessmentTemplate` list (available assessments)
- `DailyChallenge` today's challenge
- Recent `AssessmentSession` history
- Recommended practice based on `LearnerKnowledgeState`

**Components:**

```
PracticeDashboardPage
├── PracticeHeader
│   ├── QuickPracticeButton (random topic)
│   └── FilterBar (subject, difficulty)
│
├── DailyChallengeCard
│   ├── ChallengeTitle
│   ├── TopicBadge
│   ├── DifficultyBadge
│   ├── TimeRemaining
│   ├── LeaderboardPreview
│   └── StartChallengeButton
│
├── PracticeModeGrid
│   └── PracticeModeCard
│       ├── ModeIcon
│       ├── ModeName (PUZZLE_STREAK, ADAPTIVE_ASSESSMENT, etc.)
│       ├── ModeDescription
│       └── StartButton
│
├── RecommendedPracticeSection
│   ├── WeakTopicsCards (from BKT analysis)
│   └── ReviewDueCards (spaced repetition)
│
├── RecentSessionsSection
│   └── SessionCard
│       ├── SessionType
│       ├── TopicBadge
│       ├── Score
│       ├── Date
│       └── ReviewButton
│
└── StatsSummaryCard
    ├── TotalQuestionsAnswered
    ├── AccuracyRate
    └── CurrentStreak
```

#### 3.2 Quiz Session (`/dashboard/practice/quiz/[sessionId]`)

**Purpose:** Active quiz/assessment interface.

**Data Requirements:**
- `AssessmentSession` current session
- `AssessmentTemplate` for configuration
- `Question` list (via `AssessmentQuestionOrder`)
- Real-time `QuestionResponse` tracking

**Components:**

```
QuizSessionPage
├── QuizHeader
│   ├── QuizTitle
│   ├── ProgressIndicator (X of Y)
│   ├── Timer (if time-limited)
│   ├── LivesIndicator (if lives mode)
│   └── PauseButton
│
├── QuestionContainer
│   ├── QuestionNumber
│   ├── DifficultyBadge (if shown)
│   ├── QtiItemViewer (renders question XML)
│   └── HintButton (if allowed)
│
├── AnswerControls
│   ├── SubmitButton
│   ├── SkipButton (if allowed)
│   └── FlagForReviewButton
│
├── FeedbackOverlay (if immediate feedback)
│   ├── CorrectIncorrectIndicator
│   ├── ExplanationText
│   └── NextButton
│
├── NavigationPanel (for review mode)
│   └── QuestionDot (answered, flagged, current)
│
└── QuizPauseDialog
    ├── ResumeButton
    └── QuitButton (with confirmation)
```

#### 3.3 Quiz Results (`/dashboard/practice/quiz/results/[sessionId]`)

**Purpose:** Post-quiz review and analysis.

**Data Requirements:**
- Completed `AssessmentSession`
- All `QuestionResponse` with scores
- `ResponseScore` breakdown
- XP/rewards earned

**Components:**

```
QuizResultsPage
├── ResultsHeader
│   ├── QuizTitle
│   ├── CompletionBadge
│   ├── ShareButton
│   └── RetryButton
│
├── ScoreSummaryCard
│   ├── TotalScore
│   ├── AccuracyPercentage
│   ├── TimeSpent
│   ├── ComparisonToAverage
│   └── RatingChange (Glicko-2)
│
├── RewardsEarnedCard
│   ├── XpEarned
│   ├── BadgesUnlocked
│   ├── AchievementProgress
│   └── StreakMaintained
│
├── PerformanceBreakdown
│   ├── ByDifficultyChart
│   ├── ByTopicChart
│   └── ByQuestionTypeChart
│
├── QuestionReviewSection
│   └── QuestionReviewCard
│       ├── QuestionPreview
│       ├── UserAnswer
│       ├── CorrectAnswer
│       ├── ScoreEarned
│       ├── TimeSpent
│       └── ExpandButton (full review)
│
└── RecommendationsSection
    ├── TopicsToReview
    ├── SuggestedPractice
    └── NextStepsButton
```

#### 3.4 Daily Challenge (`/dashboard/practice/daily`)

**Purpose:** Daily competitive challenge with leaderboard.

**Data Requirements:**
- Today's `DailyChallenge`
- `DailyChallengeAttempt` (user's attempt if any)
- Leaderboard data (top attempts)
- User's best score

**Components:**

```
DailyChallengePage
├── ChallengeHeader
│   ├── DateDisplay
│   ├── TopicBadge
│   ├── DifficultyBadge
│   └── TimeRemaining
│
├── ChallengeStatusCard
│   ├── AttemptsRemaining (if limited)
│   ├── BestScore
│   ├── RankPosition
│   └── StartAttemptButton
│
├── LeaderboardSection
│   ├── TopThreeHighlight
│   └── LeaderboardTable
│       ├── Rank
│       ├── UserAvatar
│       ├── UserName
│       ├── Score
│       └── Time
│
├── YourRankCard
│   ├── CurrentRank
│   ├── PointsBehindNext
│   └── ImproveButton
│
└── PastChallengesSection
    └── PastChallengeCard
        ├── Date
        ├── Topic
        ├── UserScore
        └── UserRank
```

---

### 4. Progress Hub (`/dashboard/progress`)

#### 4.1 Progress Overview (`/dashboard/progress`)

**Purpose:** Comprehensive view of learning progress across all subjects.

**Data Requirements:**
- `LearnerProfile` aggregated stats
- `LearnerKnowledgeState` summaries by subject
- `LearnerTopicRating` for ability tracking
- Historical data for charts

**Components:**

```
ProgressOverviewPage
├── ProgressHeader
│   ├── OverallMasteryScore
│   ├── TotalTopicsCompleted
│   └── CurrentTier
│
├── MasteryBySubjectSection
│   └── SubjectMasteryCard
│       ├── SubjectIcon
│       ├── SubjectName
│       ├── MasteryPercentage
│       ├── TopicsCompleted / Total
│       ├── AverageRating
│       └── ViewDetailsButton
│
├── ActivityOverTimeChart
│   ├── QuestionsPerDay
│   ├── MasteryGrowth
│   └── TimeSpent
│
├── StrengthsWeaknessesSection
│   ├── StrongestTopics
│   │   └── TopicCard (high mastery)
│   └── AreasForImprovement
│       └── TopicCard (low mastery, with practice link)
│
├── RecentMilestonesSection
│   └── MilestoneCard
│       ├── MilestoneIcon
│       ├── MilestoneDescription
│       └── DateAchieved
│
└── LearningInsightsCard
    ├── BestStudyTime
    ├── AverageSessionLength
    └── PreferredDifficulty
```

#### 4.2 Subject Progress (`/dashboard/progress/subjects/[subjectId]`)

**Purpose:** Detailed progress breakdown for a specific subject.

**Data Requirements:**
- Subject's `Topic` hierarchy with mastery states
- `LearnerKnowledgeState` for each topic
- `QuestionResponse` history filtered by subject
- `LearnerTopicRating` for subject topics

**Components:**

```
SubjectProgressPage
├── SubjectHeader
│   ├── BackButton
│   ├── SubjectIcon
│   ├── SubjectName
│   └── OverallMastery
│
├── MasteryOverviewSection
│   ├── MasteryDistributionChart (pie: not started, learning, mastered)
│   ├── TopicCountByMasteryLevel
│   └── EstimatedTimeToComplete
│
├── TopicMasteryTree
│   └── TopicMasteryNode (recursive)
│       ├── TopicName
│       ├── MasteryBar
│       ├── AttemptCount
│       ├── LastPracticed
│       └── PracticeButton
│
├── HistoricalProgressChart
│   ├── MasteryOverTime
│   └── AccuracyTrend
│
├── PerformanceByQuestionType
│   └── QuestionTypeCard
│       ├── TypeName
│       ├── AccuracyRate
│       └── AttemptCount
│
└── RecommendedActionsSection
    ├── TopicsToFocus
    └── SuggestedPracticeMode
```

#### 4.3 Topic Mastery Detail (`/dashboard/progress/topics/[topicId]`)

**Purpose:** Deep dive into mastery for a specific topic.

**Data Requirements:**
- `Topic` details
- `LearnerKnowledgeState` (BKT parameters)
- `LearnerTopicRating` (Glicko-2)
- `QuestionResponse` history for topic
- `ResponseScore` details

**Components:**

```
TopicMasteryPage
├── TopicHeader
│   ├── Breadcrumb
│   ├── TopicTitle
│   ├── MasteryScore
│   └── PracticeButton
│
├── MasteryDetailsCard
│   ├── MasteryLevel (visual tier)
│   ├── ConfidenceInterval
│   ├── EstimatedProbabilityOfKnowing (BKT pKnown)
│   └── RatingHistory (Glicko-2 chart)
│
├── PerformanceStatsCard
│   ├── TotalAttempts
│   ├── CorrectRate
│   ├── AverageResponseTime
│   ├── LastPracticed
│   └── StreakOnTopic
│
├── AttemptHistorySection
│   └── AttemptCard
│       ├── Date
│       ├── AssessmentType
│       ├── Score
│       ├── TimeTaken
│       └── ReviewButton
│
├── DifficultyBreakdownChart
│   └── AccuracyByDifficulty
│
└── RelatedTopicsSection
    ├── PrerequisiteTopics (with mastery)
    └── NextTopics (unlocked by this)
```

---

### 5. Achievements Hub (`/dashboard/achievements`)

#### 5.1 Achievements Overview (`/dashboard/achievements`)

**Purpose:** Central hub for all gamification elements.

**Data Requirements:**
- `LearnerProgression` (tier, XP, level)
- `LearnerBadge` collection
- `LearnerAchievement` progress
- `LearnerStreak` current status
- `XpTransaction` recent history

**Components:**

```
AchievementsOverviewPage
├── ProfileHeroCard
│   ├── UserAvatar
│   ├── EquippedTitle
│   ├── EquippedBanner (background)
│   ├── TierBadge
│   ├── EngagementLevelBadge
│   ├── TotalXP
│   └── XpProgressToNextLevel
│
├── StreakStatusCard
│   ├── CurrentStreakFire
│   ├── StreakDays
│   ├── LongestStreak
│   ├── StreakFreezesRemaining
│   └── DailyGoalProgress
│
├── FeaturedBadgesSection
│   └── FeaturedBadgeCard (up to 5)
│       ├── BadgeIcon
│       ├── BadgeName
│       └── EarnedDate
│
├── RecentUnlocksSection
│   └── UnlockCard
│       ├── ItemType (badge, achievement, cosmetic)
│       ├── ItemPreview
│       ├── ItemName
│       └── UnlockedDate
│
├── AchievementProgressSection
│   ├── InProgressAchievements
│   │   └── AchievementProgressCard
│   │       ├── AchievementIcon
│   │       ├── AchievementName
│   │       ├── ProgressBar
│   │       └── RewardPreview
│   └── ViewAllButton
│
└── QuickStatsCard
    ├── TotalBadgesEarned
    ├── TotalAchievements
    ├── LeaderboardRank
    └── ProfileViews
```

#### 5.2 Badge Collection (`/dashboard/achievements/badges`)

**Purpose:** Browse and showcase earned badges.

**Data Requirements:**
- `BadgeDefinition` all badges
- `LearnerBadge` earned badges
- Badge categories and tiers

**Components:**

```
BadgeCollectionPage
├── BadgeHeader
│   ├── TotalBadgesEarned
│   ├── BadgesByTier
│   └── RareBadgesCount
│
├── BadgeFilters
│   ├── CategoryFilter (MASTERY, PROGRESS, STREAK, etc.)
│   ├── TierFilter (BRONZE to DIAMOND)
│   ├── RarityFilter (COMMON to LEGENDARY)
│   └── StatusFilter (earned, unearned, hidden)
│
├── FeaturedBadgesManager
│   ├── CurrentFeaturedSlots (5)
│   └── EditFeaturedButton
│
├── BadgeGrid
│   └── BadgeCard
│       ├── BadgeIcon (grayscale if unearned)
│       ├── BadgeName
│       ├── TierBadge
│       ├── RarityIndicator
│       ├── EarnedDate / Progress
│       └── FeatureButton
│
└── UnearnedBadgesSection
    └── UnearnedBadgeCard
        ├── BadgeIconSilhouette
        ├── BadgeName (or "???")
        ├── ProgressHint
        └── CriteriaPreview (if not hidden)
```

#### 5.3 Badge Detail (`/dashboard/achievements/badges/[badgeId]`)

**Purpose:** Detailed view of a specific badge.

**Data Requirements:**
- `BadgeDefinition` full details
- `LearnerBadge` earned status
- Unlock criteria
- Associated rewards

**Components:**

```
BadgeDetailPage
├── BadgeHero
│   ├── BadgeIconLarge
│   ├── BadgeName
│   ├── BadgeDescription
│   ├── TierBadge
│   ├── RarityBadge
│   └── CategoryLabel
│
├── EarnedStatusCard
│   ├── EarnedDate (if earned)
│   ├── ContextData (topic, assessment, etc.)
│   ├── FeatureToggle
│   └── ShareButton
│
├── CriteriaSection (if not hidden/earned)
│   ├── CriteriaDescription
│   ├── ProgressBar
│   └── HowToEarnTips
│
├── RewardsSection
│   ├── XpReward
│   ├── TitleUnlocked
│   ├── BannerUnlocked
│   └── IconUnlocked
│
└── RelatedBadgesSection
    └── RelatedBadgeCard (same category/tier)
```

#### 5.4 Achievement List (`/dashboard/achievements/achievements`)

**Purpose:** Browse all achievements with progress tracking.

**Data Requirements:**
- `AchievementDefinition` all achievements
- `LearnerAchievement` progress

**Components:**

```
AchievementListPage
├── AchievementHeader
│   ├── TotalCompleted
│   ├── TotalPoints
│   └── InProgressCount
│
├── AchievementFilters
│   ├── CategoryFilter (ACADEMIC, CHALLENGE, MILESTONE, etc.)
│   ├── DifficultyFilter (EASY to LEGENDARY)
│   └── StatusFilter (completed, in progress, not started)
│
├── AchievementList
│   └── AchievementCard
│       ├── AchievementIcon
│       ├── AchievementName
│       ├── Description
│       ├── DifficultyBadge
│       ├── ProgressBar (if hasProgress)
│       ├── RewardsPreview
│       └── CompletedDate (if completed)
│
└── RewardsOverviewCard
    ├── TotalXpFromAchievements
    ├── BadgesUnlocked
    └── TitlesUnlocked
```

#### 5.5 Leaderboard (`/dashboard/achievements/leaderboard`)

**Purpose:** Competitive rankings and comparisons.

**Data Requirements:**
- Aggregated leaderboard data
- User's ranking
- Filter options (daily, weekly, all-time)

**Components:**

```
LeaderboardPage
├── LeaderboardHeader
│   ├── UserRank
│   ├── UserScore
│   └── TimeframeSelector (daily, weekly, monthly, all-time)
│
├── LeaderboardFilters
│   ├── SubjectFilter
│   ├── GradeLevelFilter
│   └── RegionFilter
│
├── TopThreeSection
│   └── TopPlayerCard
│       ├── Rank (1st, 2nd, 3rd)
│       ├── UserAvatar
│       ├── UserName
│       ├── TierBadge
│       ├── Score
│       └── FeaturedBadges
│
├── LeaderboardTable
│   └── LeaderboardRow
│       ├── Rank
│       ├── RankChange (+/-)
│       ├── UserAvatar
│       ├── UserName
│       ├── TierBadge
│       ├── Score
│       └── ViewProfileButton
│
├── UserRankCard (sticky)
│   ├── UserRank
│   ├── PointsBehind
│   └── PointsAhead
│
└── LeaderboardTypesTabs
    ├── XpLeaderboard
    ├── StreakLeaderboard
    ├── AccuracyLeaderboard
    └── DailyChallengeLeaderboard
```

---

### 6. Profile Hub (`/dashboard/profile`)

#### 6.1 Profile Overview (`/dashboard/profile`)

**Purpose:** User's public profile and stats.

**Data Requirements:**
- `User` basic info
- `LearnerProfile` learning data
- `LearnerProgression` gamification data
- `LearnerStreak` streak data
- Featured badges and cosmetics

**Components:**

```
ProfileOverviewPage
├── ProfileHero
│   ├── EquippedBanner (background)
│   ├── UserAvatar
│   ├── EquippedTitle
│   ├── UserName
│   ├── TierBadge
│   ├── EngagementLevelBadge
│   ├── MemberSinceDate
│   └── ProfileViewCount
│
├── FeaturedBadgesDisplay
│   └── FeaturedBadge (up to 5)
│
├── StatsSummaryCard
│   ├── TotalXP
│   ├── QuestionsAnswered
│   ├── AccuracyRate
│   ├── CurrentStreak
│   └── LongestStreak
│
├── LearningProgressSection
│   ├── SubjectsStudied
│   ├── TopicsMastered
│   └── AssessmentsCompleted
│
├── RecentActivitySection
│   └── ActivityTimelineItem
│
└── QuickLinksCard
    ├── EditProfileButton
    ├── CustomizeButton
    └── SettingsButton
```

#### 6.2 Profile Settings (`/dashboard/profile/settings`)

**Purpose:** Edit profile information and preferences.

**Data Requirements:**
- `User` editable fields
- `LearnerProfile` preferences

**Components:**

```
ProfileSettingsPage
├── ProfilePhotoSection
│   ├── CurrentAvatar
│   ├── UploadButton
│   └── RemoveButton
│
├── BasicInfoForm
│   ├── DisplayNameInput
│   ├── EmailDisplay (non-editable)
│   ├── GradeLevelSelect
│   └── SchoolInput (optional)
│
├── PreferencesForm
│   ├── PreferredDifficultySelect
│   ├── DailyGoalTypeSelect
│   ├── DailyGoalTargetInput
│   └── NotificationPreferences
│
├── PrivacySettingsSection
│   ├── ProfileVisibilityToggle
│   ├── ShowOnLeaderboardToggle
│   └── ShowProgressToggle
│
└── SaveChangesButton
```

#### 6.3 Customize Profile (`/dashboard/profile/customize`)

**Purpose:** Equip cosmetic items for profile personalization.

**Data Requirements:**
- `CosmeticItem` all items
- `LearnerCosmetic` owned items
- `LearnerProgression` equipped items

**Components:**

```
CustomizePage
├── ProfilePreviewCard
│   ├── LivePreview (banner, avatar, title)
│   └── SaveButton
│
├── CosmeticTabs
│   ├── BannersTab
│   ├── IconsTab
│   ├── TitlesTab
│   └── FramesTab (future)
│
├── CosmeticGrid
│   └── CosmeticCard
│       ├── CosmeticPreview
│       ├── CosmeticName
│       ├── RarityBadge
│       ├── UnlockStatus
│       │   ├── Owned: EquipButton
│       │   └── Locked: UnlockRequirement
│       └── EquippedIndicator
│
└── UnlockProgressSection
    └── UnlockProgressCard
        ├── ItemPreview
        ├── UnlockMethod
        └── ProgressToUnlock
```

#### 6.4 Streak Management (`/dashboard/profile/streak`)

**Purpose:** Detailed streak tracking and management.

**Data Requirements:**
- `LearnerStreak` full data
- Streak history
- Freeze/shield inventory

**Components:**

```
StreakPage
├── StreakHeroCard
│   ├── CurrentStreakFire (animated)
│   ├── StreakDayCount
│   ├── StreakStartDate
│   └── NextMilestone
│
├── DailyGoalCard
│   ├── GoalType (QUESTIONS, MINUTES, SCORE)
│   ├── CurrentProgress
│   ├── GoalTarget
│   ├── ProgressBar
│   └── GoalMetIndicator
│
├── ProtectionInventoryCard
│   ├── StreakFreezesCount
│   │   ├── UseButton
│   │   └── ExplainerTooltip
│   ├── StreakShieldsCount
│   │   └── ShieldExplainer
│   └── GraceStatus
│       └── GraceExpiryCountdown
│
├── StreakHistorySection
│   └── StreakCalendar (heatmap)
│       └── DayCell
│           ├── ColorByAction
│           └── HoverDetails
│
├── StreakMilestonesSection
│   └── MilestoneCard
│       ├── MilestoneDay (7, 30, 100, etc.)
│       ├── Status (achieved, next, future)
│       └── RewardPreview
│
└── StreakStatsCard
    ├── LongestStreak
    ├── TotalDaysActive
    ├── FreezesUsed
    └── CloseCalls
```

---

### 7. Settings Hub (`/dashboard/settings`)

#### 7.1 General Settings (`/dashboard/settings`)

**Purpose:** App-wide settings and preferences.

**Components:**

```
GeneralSettingsPage
├── AppearanceSection
│   ├── ThemeSelector (light, dark, system)
│   └── FontSizeSelector
│
├── AccessibilitySection
│   ├── ReducedMotionToggle
│   ├── HighContrastToggle
│   └── ScreenReaderOptimizedToggle
│
├── LanguageSection
│   └── LanguageSelector
│
└── DataSection
    ├── ExportDataButton
    └── ClearLocalDataButton
```

#### 7.2 Account Settings (`/dashboard/settings/account`)

**Purpose:** Account management and security.

**Components:**

```
AccountSettingsPage
├── AccountInfoSection
│   ├── EmailDisplay
│   ├── EmailVerificationStatus
│   └── ResendVerificationButton
│
├── PasswordSection
│   ├── ChangePasswordButton
│   └── LastChangedDate
│
├── ConnectedAccountsSection
│   ├── GoogleAccountStatus
│   ├── ConnectGoogleButton / DisconnectButton
│   └── OtherProviders (future)
│
├── SessionsSection
│   ├── CurrentSession
│   └── OtherSessions
│       ├── SessionInfo (device, IP, date)
│       └── RevokeButton
│
└── DangerZoneSection
    └── DeleteAccountButton (with confirmation)
```

#### 7.3 Notification Settings (`/dashboard/settings/notifications`)

**Purpose:** Configure notification preferences.

**Components:**

```
NotificationSettingsPage
├── EmailNotificationsSection
│   ├── WeeklyProgressReportToggle
│   ├── StreakRemindersToggle
│   ├── AchievementAlertsToggle
│   └── MarketingToggle
│
├── PushNotificationsSection
│   ├── EnablePushToggle
│   ├── DailyReminderToggle
│   ├── DailyReminderTimeInput
│   └── StreakAtRiskToggle
│
└── QuietHoursSection
    ├── EnableQuietHoursToggle
    ├── QuietHoursStartTime
    └── QuietHoursEndTime
```

#### 7.4 Learning Preferences (`/dashboard/settings/preferences`)

**Purpose:** Customize learning experience.

**Data Requirements:**
- `LearnerProfile` preferences

**Components:**

```
LearningPreferencesPage
├── DifficultySection
│   ├── PreferredDifficultySelect
│   └── AdaptiveDifficultyToggle
│
├── PracticeSection
│   ├── DefaultQuestionCountSelect
│   ├── TimerEnabledToggle
│   ├── ShowCorrectAnswerToggle
│   └── ShuffleQuestionsToggle
│
├── FeedbackSection
│   ├── ImmediateFeedbackToggle
│   ├── ShowExplanationsToggle
│   └── ConfidenceTrackingToggle
│
├── SpacedRepetitionSection
│   ├── ReviewRemindersToggle
│   └── ReviewFrequencySelect
│
└── AccessibilitySection
    ├── ExtendedTimeToggle
    ├── LargerTextToggle
    └── HighContrastToggle
```

---

### 8. Admin Pages (Future)

#### 8.1 Admin Dashboard (`/admin`)

**Purpose:** System overview for administrators.

**Data Requirements:**
- User counts and activity
- Question bank stats
- System health metrics

**Components:**

```
AdminDashboardPage
├── SystemStatsCards
│   ├── TotalUsersCard
│   ├── ActiveTodayCard
│   ├── TotalQuestionsCard
│   └── AssessmentsCompletedCard
│
├── ActivityChartSection
│   ├── DailyActiveUsers
│   └── QuestionsAnsweredOverTime
│
├── RecentActivityFeed
│   └── AdminActivityItem
│
└── QuickActionsCard
    ├── ManageUsersButton
    ├── ManageQuestionsButton
    └── ViewReportsButton
```

#### 8.2 Curriculum Management (`/admin/curriculum`)

**Purpose:** CRUD for curriculum hierarchy.

**Data Requirements:**
- `Country`, `Curriculum`, `Subject`, `GradeLevel`, `Topic`

**Components:**

```
CurriculumManagementPage
├── CurriculumBreadcrumb
│   └── NavigationPath
│
├── HierarchyTabs
│   ├── CountriesTab
│   ├── CurriculaTab
│   ├── SubjectsTab
│   ├── GradeLevelsTab
│   └── TopicsTab
│
├── DataTable
│   ├── ColumnHeaders (sortable)
│   ├── SearchBar
│   ├── FilterDropdowns
│   └── DataRows
│       ├── ItemData
│       ├── EditButton
│       ├── DeleteButton
│       └── ViewChildrenButton
│
├── CreateDialog
│   └── CurriculumItemForm
│
└── EditDialog
    └── CurriculumItemForm
```

#### 8.3 Question Bank Management (`/admin/questions`)

**Purpose:** Manage question bank.

**Data Requirements:**
- `Question` with full details
- `QuestionTopic` mappings
- `QuestionRevision` history

**Components:**

```
QuestionManagementPage
├── QuestionFilters
│   ├── SubjectFilter
│   ├── TopicFilter
│   ├── DifficultyFilter
│   ├── TypeFilter
│   ├── SourceFilter
│   └── ReviewStatusFilter
│
├── QuestionDataTable
│   ├── SelectCheckbox
│   ├── QuestionPreview
│   ├── Type
│   ├── Difficulty
│   ├── Topics
│   ├── ReviewStatus
│   ├── EditButton
│   └── PreviewButton
│
├── BulkActionsBar
│   ├── SelectedCount
│   ├── BulkReviewButton
│   ├── BulkTagButton
│   └── BulkDeleteButton
│
├── QuestionEditorDialog
│   ├── QtiXmlEditor (Monaco)
│   ├── MetadataForm
│   ├── TopicAssigner
│   └── PreviewPane
│
└── ImportExportSection
    ├── ImportQtiButton
    └── ExportButton
```

---

## Shared Component Requirements

### 1. Navigation Components

```
AppSidebar (exists - extend)
├── Logo
├── NavigationLinks
│   ├── NavItem (icon, label, active state, badge)
│   └── NavGroup (collapsible)
├── UserSection
│   ├── UserAvatar
│   ├── UserName
│   └── TierBadge
└── BottomActions
    ├── SettingsLink
    └── SignOutButton

AppHeader (exists - extend)
├── PageTitle
├── Breadcrumb
├── SearchBar
├── NotificationBell
└── UserMenu

Breadcrumb (new)
├── HomeIcon
├── PathSegment (clickable)
└── CurrentPage
```

### 2. Data Display Components

```
DataTable (new - generic)
├── TableHeader
│   ├── SelectAllCheckbox
│   ├── ColumnHeader (sortable)
│   └── ActionsColumn
├── TableBody
│   └── TableRow
│       ├── SelectCheckbox
│       ├── DataCells
│       └── ActionButtons
├── TablePagination
│   ├── PageSizeSelect
│   ├── PageInfo
│   └── PaginationButtons
└── EmptyState

StatCard (new)
├── Icon
├── Label
├── Value
├── Change (optional +/-)
└── TrendIndicator

ProgressCard (new)
├── Title
├── ProgressBar
├── CurrentValue
├── TargetValue
└── Percentage

ChartCard (new)
├── ChartTitle
├── Chart (Recharts)
└── Legend
```

### 3. Gamification Components

```
TierBadge (new)
├── TierIcon
├── TierName (optional)
└── Tooltip (tier description)

XpProgressBar (new)
├── CurrentXP
├── NextLevelXP
├── ProgressBar
└── LevelIndicator

StreakDisplay (new)
├── FireIcon (animated)
├── StreakCount
└── StreakStatus (active, frozen, at risk)

BadgeDisplay (new)
├── BadgeIcon
├── BadgeName
├── TierIndicator
├── RarityIndicator
└── EarnedDate (if applicable)

AchievementCard (new)
├── AchievementIcon
├── AchievementName
├── Description
├── ProgressBar (if hasProgress)
├── RewardsPreview
└── Status

LeaderboardEntry (new)
├── RankNumber
├── RankChange
├── UserAvatar
├── UserName
├── TierBadge
├── Score
└── Highlight (for current user)
```

### 4. Learning Components

```
TopicCard (new)
├── TopicIcon
├── TopicName
├── MasteryIndicator
├── EstimatedTime
└── ActionButton (learn/practice)

SubjectCard (new)
├── SubjectIcon
├── SubjectName
├── SubjectColor
├── TopicsProgress
└── GradeRange

LearningPathCard (new)
├── PathTitle
├── PathDescription
├── ItemCount
├── EstimatedDuration
├── ProgressBar
└── EnrollButton

MasteryIndicator (new)
├── MasteryIcon
├── MasteryLevel (visual)
├── MasteryPercentage
└── Tooltip (BKT details)

PrerequisiteList (new)
└── PrerequisiteItem
    ├── TopicName
    ├── MasteryStatus
    └── CompleteButton
```

### 5. Quiz/Assessment Components

```
QuizHeader (new)
├── QuizTitle
├── ProgressIndicator
├── Timer
├── LivesDisplay
└── PauseButton

QuestionNavigation (new)
└── QuestionDot
    ├── QuestionNumber
    ├── AnsweredState
    ├── FlaggedState
    └── CurrentIndicator

FeedbackDisplay (new)
├── CorrectIncorrectIcon
├── FeedbackMessage
├── ExplanationText
├── XpEarned
└── NextButton

ResultsSummary (new)
├── ScoreCircle
├── AccuracyBar
├── TimeDisplay
├── RatingChange
└── XpEarned

QuestionReview (new)
├── QuestionText
├── UserAnswer
├── CorrectAnswer
├── IsCorrectIndicator
├── Explanation
└── TimeSpent
```

### 6. Form Components

```
FormSection (new)
├── SectionTitle
├── SectionDescription
└── FormFields

SettingsToggle (new)
├── ToggleLabel
├── ToggleDescription
├── Switch
└── ToggleStatus

SearchInput (new)
├── SearchIcon
├── Input
├── ClearButton
└── SearchResults (dropdown)

FilterBar (new)
├── FilterDropdowns
├── ActiveFilters
└── ClearFiltersButton

DateRangePicker (new)
├── StartDate
├── EndDate
├── PresetRanges
└── ApplyButton
```

### 7. Feedback Components

```
EmptyState (new)
├── IllustrationIcon
├── Title
├── Description
└── ActionButton

LoadingState (new)
├── Skeleton variants
└── LoadingSpinner

ErrorState (new)
├── ErrorIcon
├── ErrorMessage
├── RetryButton
└── SupportLink

SuccessMessage (new)
├── SuccessIcon
├── Message
└── DismissButton
```

---

## Data Patterns

### Server Actions Structure

```typescript
// actions/[domain]-actions.ts

// Pattern for read operations
export async function get[Entity](id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')

  const data = await prisma.[entity].findUnique({
    where: { id },
    include: { /* relations */ }
  })

  return data
}

// Pattern for list operations
export async function list[Entities](params: ListParams) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')

  const { page = 0, limit = 20, filters } = params

  const [data, count] = await prisma.$transaction([
    prisma.[entity].findMany({
      where: filters,
      skip: page * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.[entity].count({ where: filters })
  ])

  return { data, total: count, page, limit }
}

// Pattern for mutations
export async function create[Entity](input: CreateInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')

  // Validate with Zod
  const validated = createSchema.parse(input)

  const created = await prisma.[entity].create({
    data: {
      ...validated,
      userId: session.user.id
    }
  })

  revalidatePath('/dashboard/[path]')
  return created
}

export async function update[Entity](id: string, input: UpdateInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')

  // Verify ownership
  const existing = await prisma.[entity].findFirst({
    where: { id, userId: session.user.id }
  })
  if (!existing) throw new Error('Not found')

  const validated = updateSchema.parse(input)

  const updated = await prisma.[entity].update({
    where: { id },
    data: validated
  })

  revalidatePath('/dashboard/[path]')
  return updated
}

export async function delete[Entity](id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')

  // Verify ownership
  await prisma.[entity].delete({
    where: { id, userId: session.user.id }
  })

  revalidatePath('/dashboard/[path]')
  return { success: true }
}
```

### API Route Structure (if needed)

```typescript
// app/api/[domain]/route.ts

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') || 0)
  const limit = Number(searchParams.get('limit') || 20)

  const data = await prisma.[entity].findMany({
    where: { userId: session.user.id },
    skip: page * limit,
    take: limit
  })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  // Validate and create...

  return NextResponse.json(created, { status: 201 })
}
```

### Data Fetching in Pages

```typescript
// Server Component Pattern
export default async function Page({ params }: { params: { id: string } }) {
  const data = await getData(params.id)

  return <ClientComponent initialData={data} />
}

// Client Component with SWR/React Query (if real-time needed)
'use client'

export function ClientComponent({ initialData }: Props) {
  const { data } = useSWR('/api/data', fetcher, { fallbackData: initialData })

  return <div>{/* render */}</div>
}
```

### Form Submission Pattern

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function EntityForm({ initialData }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || defaultValues
  })

  async function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        if (initialData) {
          await updateEntity(initialData.id, values)
          toast.success('Updated successfully')
        } else {
          await createEntity(values)
          toast.success('Created successfully')
        }
        router.push('/dashboard/entities')
        router.refresh()
      } catch (error) {
        toast.error(error.message || 'Something went wrong')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* FormFields */}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Establish core infrastructure and navigation

1. **Extend Navigation**
   - Update `AppSidebar` with full navigation structure
   - Add route groups for all hubs
   - Implement `Breadcrumb` component

2. **Create Base Components**
   - `StatCard`, `ProgressCard`, `ChartCard`
   - `EmptyState`, `LoadingState`, `ErrorState`
   - `DataTable` (generic)

3. **Set Up Server Actions**
   - Create action file structure
   - Implement auth-protected action pattern
   - Add Zod schemas for all entities

4. **Dashboard Home**
   - Implement `DashboardHomePage`
   - Create `WelcomeHeader`, `DailyGoalCard`, `QuickActionsGrid`
   - Connect to `LearnerProfile`, `LearnerProgression`, `LearnerStreak`

### Phase 2: Learning Hub (Week 3-4)

**Goal:** Complete learning content browsing and paths

1. **Subject Browsing**
   - `LearnDashboardPage`
   - `SubjectCard`, `SubjectGrid`
   - `SubjectDetailPage` with topic tree

2. **Topic Learning**
   - `TopicLearnPage` with tabs
   - `TutorialList`, `TutorialCard`
   - Connect to `TutorialContent`

3. **Learning Paths**
   - `LearningPathCard`
   - `LearningPathPage` with stepper
   - Enrollment and progress tracking

### Phase 3: Practice Hub (Week 5-6)

**Goal:** Complete practice and assessment flow

1. **Practice Dashboard**
   - `PracticeDashboardPage`
   - `PracticeModeCard`, `DailyChallengeCard`
   - Connect to `AssessmentTemplate`

2. **Quiz Session**
   - Enhance existing `QuizContext`
   - `QuizSessionPage` with all modes
   - Real-time response tracking

3. **Results & History**
   - `QuizResultsPage`
   - `AssessmentHistoryPage`
   - `DailyChallengePage` with leaderboard

### Phase 4: Progress Hub (Week 7-8)

**Goal:** Analytics and mastery tracking

1. **Progress Overview**
   - `ProgressOverviewPage`
   - Charts and visualizations
   - Connect to analytics data

2. **Subject & Topic Progress**
   - `SubjectProgressPage`
   - `TopicMasteryPage`
   - BKT and Glicko-2 visualization

### Phase 5: Achievements Hub (Week 9-10)

**Goal:** Complete gamification features

1. **Gamification Components**
   - `TierBadge`, `XpProgressBar`, `StreakDisplay`
   - `BadgeDisplay`, `AchievementCard`
   - `LeaderboardEntry`

2. **Achievement Pages**
   - `AchievementsOverviewPage`
   - `BadgeCollectionPage`, `BadgeDetailPage`
   - `AchievementListPage`

3. **Leaderboard**
   - `LeaderboardPage` with filters
   - Real-time rankings

### Phase 6: Profile & Settings (Week 11-12)

**Goal:** User customization and settings

1. **Profile Hub**
   - `ProfileOverviewPage`
   - `ProfileSettingsPage`
   - `CustomizePage` for cosmetics
   - `StreakPage`

2. **Settings Hub**
   - All settings pages
   - Account management
   - Notification preferences

### Phase 7: Admin Pages (Future)

**Goal:** Administrative functionality

1. **Admin Dashboard**
2. **Curriculum Management**
3. **Question Bank Management**
4. **User Management**
5. **Analytics & Reports**

---

## File Structure Summary

```
app/
├── (root)/
│   ├── layout.tsx
│   └── page.tsx
├── (auth)/
│   ├── layout.tsx
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── loading.tsx
│   └── dashboard/
│       ├── page.tsx
│       ├── learn/
│       │   ├── page.tsx
│       │   ├── subjects/
│       │   │   ├── page.tsx
│       │   │   └── [subjectId]/page.tsx
│       │   ├── topics/
│       │   │   └── [topicId]/page.tsx
│       │   └── paths/
│       │       ├── page.tsx
│       │       └── [pathId]/page.tsx
│       ├── practice/
│       │   ├── page.tsx
│       │   ├── quiz/
│       │   │   ├── [sessionId]/page.tsx
│       │   │   └── results/[sessionId]/page.tsx
│       │   ├── daily/page.tsx
│       │   └── history/page.tsx
│       ├── progress/
│       │   ├── page.tsx
│       │   ├── subjects/[subjectId]/page.tsx
│       │   ├── topics/[topicId]/page.tsx
│       │   └── analytics/page.tsx
│       ├── achievements/
│       │   ├── page.tsx
│       │   ├── badges/
│       │   │   ├── page.tsx
│       │   │   └── [badgeId]/page.tsx
│       │   ├── achievements/page.tsx
│       │   └── leaderboard/page.tsx
│       ├── profile/
│       │   ├── page.tsx
│       │   ├── settings/page.tsx
│       │   ├── customize/page.tsx
│       │   └── streak/page.tsx
│       └── settings/
│           ├── page.tsx
│           ├── account/page.tsx
│           ├── notifications/page.tsx
│           └── preferences/page.tsx
└── api/
    ├── auth/[...all]/route.ts
    ├── quiz/
    └── progress/

actions/
├── dashboard-actions.ts
├── learn-actions.ts
├── practice-actions.ts
├── progress-actions.ts
├── achievements-actions.ts
├── profile-actions.ts
└── admin-actions.ts

components/
├── ui/                    # ShadCN (existing)
├── qti/                   # QTI (existing)
├── quiz/                  # Quiz (existing)
├── navigation/
│   ├── app-sidebar.tsx    # (extend existing)
│   ├── app-header.tsx     # (extend existing)
│   └── breadcrumb.tsx
├── data-display/
│   ├── data-table.tsx
│   ├── stat-card.tsx
│   ├── progress-card.tsx
│   └── chart-card.tsx
├── gamification/
│   ├── tier-badge.tsx
│   ├── xp-progress-bar.tsx
│   ├── streak-display.tsx
│   ├── badge-display.tsx
│   ├── achievement-card.tsx
│   └── leaderboard-entry.tsx
├── learning/
│   ├── topic-card.tsx
│   ├── subject-card.tsx
│   ├── learning-path-card.tsx
│   ├── mastery-indicator.tsx
│   └── prerequisite-list.tsx
├── assessment/
│   ├── quiz-header.tsx
│   ├── question-navigation.tsx
│   ├── feedback-display.tsx
│   ├── results-summary.tsx
│   └── question-review.tsx
├── forms/
│   ├── form-section.tsx
│   ├── settings-toggle.tsx
│   ├── search-input.tsx
│   ├── filter-bar.tsx
│   └── date-range-picker.tsx
└── feedback/
    ├── empty-state.tsx
    ├── loading-state.tsx
    ├── error-state.tsx
    └── success-message.tsx

lib/
├── schemas/
│   ├── learn-schemas.ts
│   ├── practice-schemas.ts
│   ├── progress-schemas.ts
│   ├── achievements-schemas.ts
│   └── profile-schemas.ts
└── utils/
    ├── format-date.ts
    ├── format-duration.ts
    ├── calculate-mastery.ts
    └── tier-utils.ts
```

---

## Key Implementation Notes

### 1. Route Protection Pattern

All `(dashboard)` routes are protected by the layout:

```typescript
// app/(dashboard)/layout.tsx
export default async function DashboardLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  // Ensure learner profile exists
  let learnerProfile = await prisma.learnerProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!learnerProfile) {
    learnerProfile = await prisma.learnerProfile.create({
      data: { userId: session.user.id }
    })
  }

  return (
    <UserProvider user={session.user}>
      <LearnerProvider profile={learnerProfile}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <main>{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </LearnerProvider>
    </UserProvider>
  )
}
```

### 2. Data Loading Pattern

Use server components for initial data, client components for interactivity:

```typescript
// Page (server component)
export default async function SubjectPage({ params }) {
  const subject = await getSubject(params.subjectId)
  const topics = await getTopics(params.subjectId)
  const progress = await getUserProgress(params.subjectId)

  return (
    <SubjectDetailClient
      subject={subject}
      topics={topics}
      initialProgress={progress}
    />
  )
}

// Client component for interactivity
'use client'
function SubjectDetailClient({ subject, topics, initialProgress }) {
  const [progress, setProgress] = useState(initialProgress)
  // Handle user interactions
}
```

### 3. Optimistic Updates

For better UX, use optimistic updates with server actions:

```typescript
'use client'

function StreakFreezeButton({ streakId, freezesRemaining }) {
  const [optimisticFreezes, setOptimisticFreezes] = useOptimistic(
    freezesRemaining,
    (current) => current - 1
  )

  async function handleUseFreeze() {
    setOptimisticFreezes(freezesRemaining - 1)

    try {
      await useStreakFreeze(streakId)
      toast.success('Streak freeze used!')
    } catch (error) {
      toast.error('Failed to use freeze')
      // Revalidation will restore correct state
    }
  }

  return (
    <Button onClick={handleUseFreeze} disabled={optimisticFreezes === 0}>
      Use Freeze ({optimisticFreezes} remaining)
    </Button>
  )
}
```

### 4. Real-time Updates (Quiz Sessions)

For quiz sessions, use polling or WebSocket:

```typescript
// Simple polling approach
'use client'

function QuizSessionTimer({ sessionId, endTime }) {
  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(endTime)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(endTime)
      setTimeRemaining(remaining)

      if (remaining <= 0) {
        // Auto-submit quiz
        submitQuiz(sessionId)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionId, endTime])

  return <TimerDisplay seconds={timeRemaining} />
}
```

---

## Success Metrics

1. **Page Load Performance**
   - First Contentful Paint < 1.5s
   - Time to Interactive < 3s
   - Largest Contentful Paint < 2.5s

2. **User Experience**
   - All forms have loading states
   - All actions have toast feedback
   - All pages have empty states
   - Navigation is intuitive and consistent

3. **Code Quality**
   - TypeScript strict mode enabled
   - All forms validated with Zod
   - Components are reusable
   - Server actions handle errors gracefully

4. **Accessibility**
   - WCAG 2.1 AA compliance
   - Keyboard navigation support
   - Screen reader compatible
   - Reduced motion support
