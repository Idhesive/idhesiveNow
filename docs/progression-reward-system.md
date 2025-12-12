# Progression & Reward System Design

This document outlines a comprehensive progression and reward system for the Idhesive Intelligent Tutoring System, designed to encourage student engagement, celebrate competence growth, and motivate consistent practice without creating anxiety.

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Visual Identity System](#visual-identity-system)
3. [Badge System](#badge-system)
4. [Streak System](#streak-system)
5. [Achievement System](#achievement-system)
6. [Progression Tiers](#progression-tiers)
7. [Anti-Patterns Avoided](#anti-patterns-avoided)
8. [Database Schema](#database-schema)
9. [Implementation Roadmap](#implementation-roadmap)

---

## Design Philosophy

### Core Principles

The system is built on **Self-Determination Theory (SDT)**, supporting three innate psychological needs:

| Need | How We Support It |
|------|-------------------|
| **Competence** | Mastery-based badges that validate actual learning, not just completion |
| **Autonomy** | Multiple paths to achievement, optional competitive features, learner choice |
| **Relatedness** | Community recognition, peer comparisons (opt-in), shared milestones |

### Motivation Balance

```
Phase 1 (Months 0-1)     Phase 2 (Months 1-3)     Phase 3 (Months 3+)
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  EXTRINSIC      │      │  TRANSITIONAL   │      │  INTRINSIC      │
│                 │      │                 │      │                 │
│ • Points        │  →   │ • Mastery       │  →   │ • Learning joy  │
│ • Simple badges │      │   recognition   │      │ • Community     │
│ • Early wins    │      │ • Skill tiers   │      │ • Personal      │
│                 │      │ • Streaks       │      │   growth        │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Key Research Insights Applied

1. **From Duolingo**: Streak mechanics with safety nets (21% churn reduction)
2. **From Khan Academy**: Celestial badge hierarchy creating aspirational progression
3. **From Rocket League**: Visual identity decoupled from rank, allowing customization
4. **From Codecademy**: Skill-based badges connected to real competencies
5. **Academic Research**: Mastery framing over performance framing reduces anxiety

---

## Visual Identity System

Inspired by Rocket League's banner/icon system, learners build a visual identity that reflects their journey.

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        LEARNER CARD                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      BANNER                               │   │
│  │         (Unlocked via progression tiers)                  │   │
│  │                                                           │   │
│  │    ┌─────────┐                                           │   │
│  │    │  ICON   │   Display Name                            │   │
│  │    │(Avatar) │   Grade 4 · Mathematics                   │   │
│  │    └─────────┘   ████████████░░░░ Level 47               │   │
│  │                                                           │   │
│  │    [🔥 14-day streak]  [⭐ Scholar Tier]  [🏆 342 badges] │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  FEATURED BADGES (User-selected, up to 5)                       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                            │
│  │ 🎯 │ │ 📚 │ │ 🔥 │ │ 💎 │ │ 🌟 │                            │
│  └────┘ └────┘ └────┘ └────┘ └────┘                            │
│  Fractions  Week    30-Day  Diamond  Perfect                    │
│  Master     Warrior Streak  Scholar  Quiz                       │
└─────────────────────────────────────────────────────────────────┘
```

### Banner System

Banners are **unlocked through progression**, not purchased. Each tier unlocks new banner styles.

| Tier | Banners Unlocked | Visual Style |
|------|-----------------|--------------|
| Seed | 3 basic | Solid colors, simple patterns |
| Sprout | 5 nature | Gradients, organic patterns |
| Sapling | 8 elemental | Water, fire, earth, air themes |
| Tree | 12 cosmic | Stars, nebulae, aurora |
| Grove | 15 legendary | Animated, mythical creatures |
| Forest | 20 prestige | Rare, seasonal, achievement-locked |

**Key Design Choice**: Banners are cosmetic rewards that signal **time investment and dedication**, separate from academic tier (competence). This allows all learners to feel rewarded for engagement regardless of academic performance.

### Icon/Avatar System

Icons unlock through various achievement categories:

```typescript
enum IconCategory {
  DEFAULT       // Starting avatars
  SUBJECT       // Unlocked via subject mastery (math symbols, science beakers)
  SEASONAL      // Time-limited seasonal events
  ACHIEVEMENT   // Special achievement rewards
  COMMUNITY     // Helping others, peer learning
  CHALLENGE     // Daily/weekly challenge completion
  STREAK        // Milestone streak rewards
}
```

### Title System

Titles appear next to learner names and reflect accomplishments:

| Category | Examples |
|----------|----------|
| **Academic** | "Fraction Master", "Algebra Apprentice", "Math Wizard" |
| **Streak** | "Week Warrior", "Month Master", "Century Scholar" |
| **Challenge** | "Daily Champion", "Storm Chaser", "Puzzle King" |
| **Community** | "Helpful Hand", "Study Buddy", "Mentor" |
| **Special** | "Early Adopter", "Beta Tester", "Founding Scholar" |

---

## Badge System

### Badge Categories

Badges are organized into **six distinct categories**, ensuring every learner can excel in at least one area.

#### 1. Mastery Badges (Subject Competence)

Awarded for demonstrated competence in specific topics, validated by assessment performance.

```
TOPIC MASTERY PROGRESSION

Bronze Learner → Silver Scholar → Gold Expert → Platinum Master → Diamond Sage
     60%            70%              80%            90%              95%
   accuracy       accuracy         accuracy       accuracy         accuracy
   (10+ Qs)       (20+ Qs)         (30+ Qs)       (50+ Qs)         (75+ Qs)

Per-topic badges with sub-levels:
┌─────────────────────────────────────────────────────────────────┐
│ FRACTIONS                                                        │
│ ├── Understanding Fractions        [🥉🥈🥇💎💠]                │
│ ├── Comparing Fractions            [🥉🥈🥇💎💠]                │
│ ├── Adding & Subtracting Fractions [🥉🥈🥇💎💠]                │
│ ├── Multiplying Fractions          [🥉🥈🥇💎💠]                │
│ └── Word Problems with Fractions   [🥉🥈🥇💎💠]                │
│                                                                  │
│ META-BADGE: "Fraction Champion" (All Gold+ in category)         │
└─────────────────────────────────────────────────────────────────┘
```

**Design Rationale**: Mastery badges require both accuracy AND volume. A learner can't earn Gold by getting 4 out of 5 correct—they need sustained performance over many questions. This prevents gaming and validates genuine competence.

#### 2. Progress Badges (Growth Recognition)

Awarded for improvement and growth trajectories, regardless of absolute performance.

| Badge | Criteria | Purpose |
|-------|----------|---------|
| **First Steps** | Complete first topic | Celebrate beginning |
| **Rising Star** | Improve 10%+ in any topic | Reward growth |
| **Comeback Kid** | Return after 7+ day absence and improve | Re-engagement |
| **Steady Climber** | Improve rating 3 weeks in a row | Consistency |
| **Breakthrough** | Mastery jump from Bronze to Silver+ | Big improvements |
| **Marathon Runner** | 100 questions answered | Volume milestone |
| **Scholar's Journey** | 50% curriculum completion | Halfway celebration |

**Key Principle**: These badges celebrate **effort and trajectory**, not just outcomes. A struggling learner who improves from 40% to 55% accuracy earns recognition.

#### 3. Streak Badges (Consistency)

Awarded for maintaining learning streaks with built-in grace mechanisms.

```
STREAK MILESTONES

Week Warrior     │ 7-day streak
Fortnight Force  │ 14-day streak
Month Master     │ 30-day streak
Quarter Quest    │ 90-day streak
Century Scholar  │ 100-day streak
Year-Round       │ 365-day streak (legendary)

VISUAL PROGRESSION
Day 1-6:   🔥 (flame grows daily)
Day 7:     🔥➡️🌟 (upgrade to star)
Day 14:    🌟➡️✨ (sparkle effect)
Day 30:    ✨➡️🏆 (trophy)
Day 100:   🏆➡️👑 (crown)
```

**Grace Mechanisms** (Critical for mental health):
- **Streak Freeze**: 2 free freezes per month (use before missing)
- **Grace Period**: Miss 1 day = streak paused, not broken (24hr to restore)
- **Streak Shield**: Earned every 10 consecutive days (auto-protects next miss)

#### 4. Challenge Badges (Optional Competition)

Awarded for participation in optional competitive modes.

| Badge | Criteria |
|-------|----------|
| **Storm Survivor** | Complete a Puzzle Storm (any score) |
| **Storm Master** | Score 50+ in Puzzle Storm |
| **Streak Legend** | Reach 25+ in Puzzle Streak mode |
| **Daily Devotee** | Complete 7 Daily Challenges |
| **Daily Champion** | Finish top 10% in a Daily Challenge |
| **Speed Demon** | Complete a quiz in <50% of average time with 80%+ accuracy |

#### 5. Exploration Badges (Curiosity)

Awarded for breadth of learning and exploration.

| Badge | Criteria |
|-------|----------|
| **Curious Mind** | Attempt questions from 5 different topics |
| **Subject Explorer** | Complete at least 1 topic in each subject |
| **Grade Adventurer** | Try questions from grade above current |
| **Deep Diver** | Complete all subtopics in one topic |
| **Polymath** | Silver+ mastery in 3 different subjects |

#### 6. Community Badges (Relatedness)

Awarded for social and community engagement (future feature).

| Badge | Criteria |
|-------|----------|
| **Helpful Hand** | Help 5 peers (future peer learning feature) |
| **Study Buddy** | Complete 10 paired study sessions |
| **Team Player** | Participate in 3 group challenges |
| **Mentor** | Help 20+ peers with explanations |

### Badge Visual Design

Each badge has a consistent visual language:

```
┌─────────────────────────────────────────────────────────────────┐
│ BADGE ANATOMY                                                    │
│                                                                  │
│         ┌─────────────┐                                         │
│         │   BORDER    │  ← Indicates tier (bronze/silver/gold)  │
│         │  ┌───────┐  │                                         │
│         │  │ ICON  │  │  ← Category-specific iconography        │
│         │  │       │  │                                         │
│         │  └───────┘  │                                         │
│         │   GLOW      │  ← Rarity indicator (subtle→intense)    │
│         └─────────────┘                                         │
│            RIBBON        ← Progress bar to next tier            │
│                                                                  │
│ TIER VISUAL INDICATORS:                                         │
│ • Bronze: Copper border, muted colors                           │
│ • Silver: Silver border, soft glow                              │
│ • Gold: Gold border, warm glow                                  │
│ • Platinum: White border, bright glow                           │
│ • Diamond: Prismatic border, animated sparkle                   │
└─────────────────────────────────────────────────────────────────┘
```

### Badge Rarity Distribution

To maintain psychological value, badges follow a distribution:

| Rarity | % of Learners | Examples |
|--------|--------------|----------|
| Common | 60-80% | First Steps, Curious Mind, Week Warrior |
| Uncommon | 30-50% | Rising Star, Subject Explorer |
| Rare | 10-20% | Month Master, Storm Master |
| Epic | 3-8% | Century Scholar, Polymath |
| Legendary | <1% | Year-Round, Perfect Semester |

---

## Streak System

### Design Goals

1. **Build habits** without creating addiction
2. **Reward consistency** without punishing life circumstances
3. **Celebrate milestones** without inducing anxiety
4. **Support return** after breaks

### How Streaks Work

```typescript
interface StreakSystem {
  // Core
  currentStreak: number;          // Current consecutive days
  longestStreak: number;          // Personal best
  totalActiveDays: number;        // Lifetime total (never resets)

  // Protection
  streakFreezes: number;          // Available freezes (max 3)
  streakShields: number;          // Auto-earned shields
  graceHoursRemaining: number;    // Time to restore after miss

  // Engagement
  dailyGoalMet: boolean;          // Today's minimum met
  dailyGoalType: 'questions' | 'minutes' | 'score';
  dailyGoalTarget: number;        // e.g., 10 questions, 15 minutes
}
```

### Daily Goal Options

Learners can **choose** their daily goal (autonomy):

| Goal Type | Easy | Medium | Hard |
|-----------|------|--------|------|
| Questions | 5 Qs | 10 Qs | 20 Qs |
| Time | 10 min | 15 min | 30 min |
| Score | 50 pts | 100 pts | 200 pts |

**Key Insight**: Allowing learners to set their own goal increases intrinsic motivation and reduces pressure.

### Streak Recovery Flow

```
Day 1: Active ✓ (Streak: 1)
Day 2: Active ✓ (Streak: 2)
Day 3: Missed ✗
       ↓
┌─────────────────────────────────────────────────────────────────┐
│ GRACE PERIOD ACTIVATED (24 hours)                                │
│                                                                  │
│ Your streak is paused, not broken!                              │
│                                                                  │
│ Options:                                                         │
│ 1. Complete your daily goal now to restore streak               │
│ 2. Use a Streak Freeze (2 remaining)                            │
│ 3. Let grace period expire (streak resets to 0)                 │
│                                                                  │
│ Time remaining: 23:47:32                                        │
└─────────────────────────────────────────────────────────────────┘

If restored:
Day 4: Active ✓ (Streak: 3, Grace used)

If freeze used:
Day 4: Frozen ❄️ (Streak: 3, Freeze: 2→1)
```

### Streak Milestone Celebrations

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎉 STREAK MILESTONE REACHED! 🎉                                  │
│                                                                  │
│              ╔═══════════════════════╗                          │
│              ║   30-DAY STREAK! 🔥   ║                          │
│              ╚═══════════════════════╝                          │
│                                                                  │
│ You've been learning consistently for an entire month!          │
│                                                                  │
│ REWARDS UNLOCKED:                                               │
│ • Badge: "Month Master" 🏅                                      │
│ • Title: "Consistent Scholar"                                   │
│ • Banner: "Phoenix Rising" 🔥                                   │
│ • +1 Streak Shield (auto-protect next miss)                     │
│                                                                  │
│ Your dedication is building real knowledge!                     │
│ Keep going → Next milestone: 60 days                            │
└─────────────────────────────────────────────────────────────────┘
```

### Streak Messaging (Avoiding Anxiety)

**Instead of:**
> "Don't break your streak! You'll lose everything!"

**We say:**
> "You're building a great habit! Come back tomorrow to keep growing."

**After a broken streak:**
> "Welcome back! Your learning history is never lost. Let's start a new streak together."

---

## Achievement System

### Achievement Categories

Achievements are **larger accomplishments** that combine multiple criteria.

#### Academic Achievements

| Achievement | Criteria | Reward |
|-------------|----------|--------|
| **First Topic Master** | Achieve Gold mastery in any topic | Title + Badge |
| **Subject Champion** | Gold+ mastery in 10+ topics in one subject | Banner + Title |
| **Grade Complete** | 80%+ across all topics in a grade level | Exclusive avatar |
| **Curriculum Explorer** | Complete content from 3+ grade levels | Title + XP bonus |
| **Perfect Topic** | 100% accuracy on a topic (20+ questions) | Animated badge |

#### Challenge Achievements

| Achievement | Criteria | Reward |
|-------------|----------|--------|
| **Storm Chaser** | Complete 10 Puzzle Storms | Badge + Title |
| **Daily Devotee** | Complete 30 Daily Challenges | Exclusive banner |
| **Streak Champion** | Reach 50+ in Puzzle Streak mode | Animated icon |
| **Speed Scholar** | Top 10% time on 5 quizzes | Title |

#### Milestone Achievements

| Achievement | Criteria | Reward |
|-------------|----------|--------|
| **Century** | Answer 100 questions | Badge |
| **Thousand Club** | Answer 1,000 questions | Badge + Title |
| **Time Invested** | 10 hours of active learning | Banner |
| **Scholar's Year** | 365-day streak | Legendary badge + avatar |

### Achievement Display

```
┌─────────────────────────────────────────────────────────────────┐
│ ACHIEVEMENT PROGRESS                                             │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ 🏆 Subject Champion - Mathematics                            ││
│ │ "Achieve Gold mastery in 10+ math topics"                    ││
│ │                                                              ││
│ │ Progress: 7/10 topics at Gold+                               ││
│ │ ████████████████░░░░░░░░░░░░░░ 70%                          ││
│ │                                                              ││
│ │ Remaining:                                                   ││
│ │ • Fractions (Silver → Gold needed)                           ││
│ │ • Decimals (Bronze → Gold needed)                            ││
│ │ • Geometry (Not started)                                     ││
│ │                                                              ││
│ │ Reward: "Math Champion" banner + "Mathematician" title       ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Progression Tiers

### Academic Tier (Competence)

Based on Glicko-2 rating across all topics in a subject. Reflects actual learning competence.

```
ACADEMIC TIER PROGRESSION

Rating Range    Tier Name       Visual          Unlocks
─────────────────────────────────────────────────────────────────
0-1000         Seed            🌱              Starting content
1000-1200      Sprout          🌿              Basic challenges
1200-1400      Sapling         🌲              Intermediate content
1400-1600      Tree            🌳              Advanced challenges
1600-1800      Grove           🌲🌲🌲          Expert content
1800-2000      Forest          🌲🌲🌲🌲🌲      Mastery challenges
2000+          Ancient Forest  🌲🌲🌲🌲🌲✨    Legendary status

Visual Treatment:
• Each tier has distinct color palette (earth tones → celestial)
• Animated elements increase with tier
• Border complexity increases
• Particle effects at high tiers
```

**Design Rationale**: Using nature/growth metaphors emphasizes that learning is a journey of cultivation, not competition. "Ancient Forest" feels aspirational without implying others are lesser.

### Engagement Level (Time Investment)

Based on total XP earned, regardless of accuracy. Rewards dedication and time.

```
ENGAGEMENT LEVEL PROGRESSION

XP Range        Level Name      Visual          Unlocks
─────────────────────────────────────────────────────────────────
0-500          Newcomer        ⭐              Basic customization
500-2000       Learner         ⭐⭐            More avatars
2000-5000      Scholar         ⭐⭐⭐          Banner styles
5000-10000     Dedicated       ⭐⭐⭐⭐        Animated avatars
10000-25000    Devoted         ⭐⭐⭐⭐⭐      Exclusive banners
25000-50000    Expert          💫              Animated banners
50000+         Legendary       👑              Full customization

Level Calculation:
XP = Questions × 10 + (Correct × 5) + (Streak_Days × 20) + (Achievements × 100)
```

**Key Insight**: Separating engagement level from academic tier means a struggling learner who practices consistently can still reach high engagement levels. This maintains motivation regardless of academic performance.

### Tier Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│ LEARNER PROFILE TIERS                                            │
│                                                                  │
│ ACADEMIC (Competence)          ENGAGEMENT (Dedication)          │
│ ┌─────────────────────┐       ┌─────────────────────┐          │
│ │     🌲 TREE         │       │   ⭐⭐⭐⭐ DEVOTED   │          │
│ │   Rating: 1,523     │       │    XP: 12,450       │          │
│ │                     │       │                     │          │
│ │ ░░░░░░████████░░░░  │       │ ░░░████████████░░   │          │
│ │   Progress to Grove │       │  Progress to Expert │          │
│ │                     │       │                     │          │
│ │ Next: 1,600 (+77)   │       │ Next: 25,000        │          │
│ └─────────────────────┘       └─────────────────────┘          │
│                                                                  │
│ Both tiers unlock different rewards!                            │
│ Academic → Advanced content access                              │
│ Engagement → Cosmetic customization                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Anti-Patterns Avoided

### What We DON'T Do (And Why)

| Anti-Pattern | Why It's Harmful | Our Alternative |
|--------------|------------------|-----------------|
| **Global Leaderboards** | Demotivates 95% of users | Opt-in friend comparisons, skill-cohort ranking |
| **Public Failure Display** | Creates anxiety, shame | Private progress, growth-focused messaging |
| **Streak Punishment** | Guilt, unhealthy engagement | Grace periods, freezes, no "lost" language |
| **Pay-to-Win** | Creates inequality | All progress is earned, never purchased |
| **Achievement Scarcity** | "Only 1% can earn this" excludes | Multiple paths, everyone can excel somewhere |
| **Absolute Difficulty** | Same challenge for all = unfair | Adaptive difficulty per learner |
| **Extrinsic-Only** | Novelty wears off, learning suffers | Transition to intrinsic drivers over time |
| **One-Size-Fits-All** | Different learners need different motivation | Customizable goals, optional features |

### Messaging Guidelines

**Failure/Mistake Messaging:**

| Instead Of | We Use |
|------------|--------|
| "Wrong answer!" | "Not quite - let's review this concept" |
| "You failed" | "You're learning - here's what to focus on" |
| "Streak lost!" | "Streak paused - come back to restore it" |
| "You're behind" | "Here's your next step forward" |

**Progress Messaging:**

| Instead Of | We Use |
|------------|--------|
| "You're ranked #847" | "You've improved 15% this week" |
| "Only 3% have this" | "You've earned this through dedication" |
| "Complete to avoid penalty" | "Complete to unlock your next reward" |

---

## Database Schema

### New Models for Progression System

```prisma
// ============================================
// PROGRESSION & REWARDS
// ============================================

model LearnerProgression {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])

  // Academic Tier (competence-based)
  academicTier        AcademicTier @default(SEED)
  academicRating      Float        @default(1500)
  academicRatingHistory Json?      // [{rating, timestamp}]

  // Engagement Level (XP-based)
  engagementLevel     EngagementLevel @default(NEWCOMER)
  totalXp             Int          @default(0)
  xpHistory           Json?        // [{xp, source, timestamp}]

  // Visual Identity
  equippedBannerId    String?
  equippedIconId      String?
  equippedTitleId     String?
  featuredBadgeIds    String[]     // Up to 5

  // Stats
  totalBadgesEarned   Int @default(0)
  totalAchievements   Int @default(0)
  profileViews        Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("learner_progression")
}

enum AcademicTier {
  SEED           // 0-1000
  SPROUT         // 1000-1200
  SAPLING        // 1200-1400
  TREE           // 1400-1600
  GROVE          // 1600-1800
  FOREST         // 1800-2000
  ANCIENT_FOREST // 2000+
}

enum EngagementLevel {
  NEWCOMER       // 0-500 XP
  LEARNER        // 500-2000 XP
  SCHOLAR        // 2000-5000 XP
  DEDICATED      // 5000-10000 XP
  DEVOTED        // 10000-25000 XP
  EXPERT         // 25000-50000 XP
  LEGENDARY      // 50000+ XP
}

// ============================================
// STREAKS
// ============================================

model LearnerStreak {
  id        String @id @default(uuid())
  userId    String @unique
  user      User   @relation(fields: [userId], references: [id])

  // Current Streak
  currentStreak       Int @default(0)
  streakStartDate     DateTime?
  lastActiveDate      DateTime?

  // Records
  longestStreak       Int @default(0)
  longestStreakStart  DateTime?
  longestStreakEnd    DateTime?
  totalActiveDays     Int @default(0)

  // Protection Mechanics
  streakFreezes       Int @default(2)     // Available freezes
  streakShields       Int @default(0)     // Auto-earned shields
  graceExpiresAt      DateTime?           // When grace period ends
  lastFreezeUsed      DateTime?

  // Daily Goal
  dailyGoalType       DailyGoalType @default(QUESTIONS)
  dailyGoalTarget     Int @default(10)
  todayProgress       Int @default(0)
  todayGoalMet        Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // History
  history   StreakHistoryEntry[]

  @@map("learner_streak")
}

enum DailyGoalType {
  QUESTIONS
  MINUTES
  SCORE
}

model StreakHistoryEntry {
  id          String   @id @default(uuid())
  streakId    String
  streak      LearnerStreak @relation(fields: [streakId], references: [id])

  date        DateTime
  wasActive   Boolean
  streakCount Int

  // What happened this day
  action      StreakAction
  details     Json?     // {freezeUsed: true, graceRestored: true, etc.}

  @@unique([streakId, date])
  @@map("streak_history_entry")
}

enum StreakAction {
  ACTIVE          // Completed daily goal
  FREEZE_USED     // Used a streak freeze
  SHIELD_USED     // Auto-shield activated
  GRACE_RESTORED  // Restored during grace period
  GRACE_EXPIRED   // Grace period expired, streak reset
  STREAK_BROKEN   // Streak ended
  MILESTONE       // Hit a milestone (7, 14, 30, etc.)
}

// ============================================
// BADGES
// ============================================

model BadgeDefinition {
  id           String @id @default(uuid())
  code         String @unique  // "mastery_fractions_gold"

  // Display
  name         String          // "Fractions Master - Gold"
  description  String          // "Achieve 80%+ accuracy on 30+ fraction questions"
  iconUrl      String?

  // Classification
  category     BadgeCategory
  tier         BadgeTier
  rarity       BadgeRarity

  // Unlock Criteria
  criteria     Json            // Structured criteria definition
  // Example: {type: "mastery", topicCode: "FRAC-*", minAccuracy: 0.8, minQuestions: 30}

  // Rewards
  xpReward     Int @default(0)
  unlocksTitle String?         // Title ID if unlocks a title
  unlocksBanner String?        // Banner ID if unlocks a banner
  unlocksIcon  String?         // Icon ID if unlocks an icon

  // Ordering
  sortOrder    Int @default(0)
  isActive     Boolean @default(true)
  isHidden     Boolean @default(false) // Hidden until earned

  // Relations
  earnedBy     LearnerBadge[]

  @@map("badge_definition")
}

enum BadgeCategory {
  MASTERY        // Topic/subject competence
  PROGRESS       // Growth and improvement
  STREAK         // Consistency
  CHALLENGE      // Optional competitive modes
  EXPLORATION    // Breadth of learning
  COMMUNITY      // Social engagement
  SPECIAL        // Events, seasonal, etc.
}

enum BadgeTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
  DIAMOND
}

enum BadgeRarity {
  COMMON        // 60-80% of learners
  UNCOMMON      // 30-50%
  RARE          // 10-20%
  EPIC          // 3-8%
  LEGENDARY     // <1%
}

model LearnerBadge {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  badgeId     String
  badge       BadgeDefinition @relation(fields: [badgeId], references: [id])

  // When earned
  earnedAt    DateTime @default(now())

  // Context
  contextData Json?    // {topicId, assessmentId, etc.}

  // Display
  isFeatured  Boolean @default(false)  // Shown on profile
  isNew       Boolean @default(true)   // Not yet viewed

  @@unique([userId, badgeId])
  @@map("learner_badge")
}

// ============================================
// ACHIEVEMENTS
// ============================================

model AchievementDefinition {
  id           String @id @default(uuid())
  code         String @unique  // "subject_champion_math"

  // Display
  name         String          // "Subject Champion - Mathematics"
  description  String          // "Achieve Gold+ mastery in 10+ math topics"
  iconUrl      String?

  // Classification
  category     AchievementCategory
  difficulty   AchievementDifficulty

  // Unlock Criteria
  criteria     Json            // Complex criteria definition
  // Example: {type: "topic_mastery_count", subject: "MATH", minTier: "GOLD", minCount: 10}

  // Progress Tracking
  hasProgress  Boolean @default(true)
  progressMax  Int?            // e.g., 10 topics

  // Rewards
  xpReward     Int @default(0)
  badgeReward  String?         // Badge ID
  titleReward  String?
  bannerReward String?
  iconReward   String?

  isActive     Boolean @default(true)
  sortOrder    Int @default(0)

  earnedBy     LearnerAchievement[]

  @@map("achievement_definition")
}

enum AchievementCategory {
  ACADEMIC      // Mastery-based
  CHALLENGE     // Competitive modes
  MILESTONE     // Volume/time
  COMMUNITY     // Social
  SPECIAL       // Events
}

enum AchievementDifficulty {
  EASY
  MEDIUM
  HARD
  LEGENDARY
}

model LearnerAchievement {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  achievementId  String
  achievement    AchievementDefinition @relation(fields: [achievementId], references: [id])

  // Progress (for trackable achievements)
  currentProgress Int @default(0)
  isCompleted     Boolean @default(false)

  // When completed
  completedAt     DateTime?

  // Context
  contextData     Json?

  @@unique([userId, achievementId])
  @@map("learner_achievement")
}

// ============================================
// COSMETIC UNLOCKS
// ============================================

model CosmeticItem {
  id          String @id @default(uuid())
  code        String @unique

  // Display
  name        String
  description String?
  previewUrl  String?
  assetUrl    String?

  // Classification
  type        CosmeticType
  rarity      CosmeticRarity

  // Unlock Requirements
  unlockMethod UnlockMethod
  unlockCriteria Json?
  // Examples:
  // {method: "tier", academicTier: "GROVE"}
  // {method: "badge", badgeCode: "streak_30_day"}
  // {method: "achievement", achievementCode: "subject_champion_math"}
  // {method: "xp", minXp: 10000}

  isActive    Boolean @default(true)
  sortOrder   Int @default(0)

  // Relations
  unlockedBy  LearnerCosmetic[]

  @@map("cosmetic_item")
}

enum CosmeticType {
  BANNER
  ICON
  TITLE
  PROFILE_FRAME
  EFFECT        // Animated effects
}

enum CosmeticRarity {
  COMMON
  UNCOMMON
  RARE
  EPIC
  LEGENDARY
}

enum UnlockMethod {
  TIER          // Academic or engagement tier
  BADGE         // Earn specific badge
  ACHIEVEMENT   // Complete achievement
  XP            // Reach XP threshold
  STREAK        // Reach streak milestone
  SPECIAL       // Event, gift, etc.
}

model LearnerCosmetic {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  cosmeticId  String
  cosmetic    CosmeticItem @relation(fields: [cosmeticId], references: [id])

  unlockedAt  DateTime @default(now())
  isEquipped  Boolean @default(false)

  @@unique([userId, cosmeticId])
  @@map("learner_cosmetic")
}

// ============================================
// XP TRANSACTIONS
// ============================================

model XpTransaction {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  amount    Int
  source    XpSource
  sourceId  String?  // Related entity ID

  // Context
  description String?
  metadata   Json?

  createdAt DateTime @default(now())

  @@index([userId, createdAt])
  @@map("xp_transaction")
}

enum XpSource {
  QUESTION_ANSWERED     // +10 per question
  QUESTION_CORRECT      // +5 bonus for correct
  STREAK_DAY            // +20 per day
  STREAK_MILESTONE      // +50/100/200 for milestones
  BADGE_EARNED          // Variable per badge
  ACHIEVEMENT_COMPLETED // Variable per achievement
  CHALLENGE_COMPLETED   // Variable per challenge
  DAILY_CHALLENGE       // +50 for completion
  MASTERY_UPGRADE       // +100 per tier upgrade
}
```

### Integration with Existing Schema

Add relations to existing User model:

```prisma
model User {
  // ... existing fields

  // New relations for progression system
  progression      LearnerProgression?
  streak           LearnerStreak?
  badges           LearnerBadge[]
  achievements     LearnerAchievement[]
  cosmetics        LearnerCosmetic[]
  xpTransactions   XpTransaction[]
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal**: Core progression tracking

- [ ] Database migrations for new models
- [ ] XP calculation service
- [ ] Basic tier calculation
- [ ] Streak tracking service (without UI)

**Deliverables**:
- LearnerProgression created on first login
- XP earned for questions answered
- Streak calculated daily via cron job

### Phase 2: Streaks (Week 3-4)

**Goal**: Full streak system with grace mechanics

- [ ] Streak UI component (display + animation)
- [ ] Daily goal selection UI
- [ ] Grace period notifications
- [ ] Freeze usage UI
- [ ] Streak milestone celebrations

**Deliverables**:
- Visible streak on profile/dashboard
- Daily goal tracking
- Push/email notifications for grace periods

### Phase 3: Badges (Week 5-6)

**Goal**: Badge system with visual display

- [ ] Badge definition seeding
- [ ] Badge unlock service
- [ ] Badge display components
- [ ] Badge notification system
- [ ] Profile badge showcase

**Deliverables**:
- 20+ badges across categories
- Real-time unlock notifications
- Badge showcase on profile

### Phase 4: Visual Identity (Week 7-8)

**Goal**: Banners, icons, titles

- [ ] Cosmetic item seeding
- [ ] Unlock logic per method
- [ ] Profile customization UI
- [ ] Learner card component
- [ ] Preview system

**Deliverables**:
- 30+ banners, 20+ icons, 15+ titles
- Profile customization page
- Learner card visible in UI

### Phase 5: Achievements (Week 9-10)

**Goal**: Complex achievement system

- [ ] Achievement definition seeding
- [ ] Progress tracking service
- [ ] Achievement UI (list + progress)
- [ ] Completion celebrations
- [ ] Reward claiming

**Deliverables**:
- 15+ achievements
- Progress tracking UI
- Celebration animations

### Phase 6: Polish & Analytics (Week 11-12)

**Goal**: Refinement and monitoring

- [ ] Analytics dashboard for engagement metrics
- [ ] A/B testing framework for gamification elements
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] User feedback integration

**Deliverables**:
- Admin analytics dashboard
- Engagement metrics tracking
- Accessibility compliance

---

## Success Metrics

### Engagement Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily Active Users | +30% | After 3 months |
| Session Duration | +25% | Average time in app |
| 7-Day Retention | +20% | Return rate |
| 30-Day Retention | +40% | Long-term engagement |
| Questions per Session | +15% | Learning volume |

### Motivation Health Metrics

| Metric | Target | Purpose |
|--------|--------|---------|
| Streak Recovery Rate | >60% | Grace periods working |
| Badge Diversity | >3 categories per user | Multiple paths to success |
| Opt-out Rate (competitive) | <40% | Not forcing unwanted competition |
| Post-Break Return | >50% | System welcomes returners |

### Learning Outcome Metrics

| Metric | Target | Correlation |
|--------|--------|-------------|
| Topic Mastery Rate | +20% | Badges drive deeper learning |
| Curriculum Completion | +25% | Achievements encourage breadth |
| Assessment Scores | +10% | Gamification enhances not detracts |

---

## Appendix: Badge & Achievement Catalog

### Mastery Badges (Per Topic)

```
For each topic (e.g., Fractions, Decimals, Algebra):

Bronze Learner   │ 60%+ accuracy, 10+ questions
Silver Scholar   │ 70%+ accuracy, 20+ questions
Gold Expert      │ 80%+ accuracy, 30+ questions
Platinum Master  │ 90%+ accuracy, 50+ questions
Diamond Sage     │ 95%+ accuracy, 75+ questions
```

### Progress Badges

```
First Steps       │ Complete first topic
Rising Star       │ Improve 10%+ in any topic
Comeback Kid      │ Return after 7+ days and improve
Steady Climber    │ Improve 3 weeks in a row
Breakthrough      │ Bronze → Silver+ in one session
Marathon Runner   │ 100 questions answered
Scholar's Journey │ 50% curriculum complete
Question Century  │ 100 questions in a day
```

### Streak Badges

```
Week Warrior      │ 7-day streak
Fortnight Force   │ 14-day streak
Month Master      │ 30-day streak
Quarter Quest     │ 90-day streak
Century Scholar   │ 100-day streak
Year-Round        │ 365-day streak (legendary)
Resilient         │ Restore streak 3 times
Shield Bearer     │ Earn 5 streak shields
```

### Challenge Badges

```
Storm Survivor    │ Complete any Puzzle Storm
Storm Master      │ 50+ in Puzzle Storm
Streak Legend     │ 25+ in Puzzle Streak
Daily Devotee     │ 7 Daily Challenges
Daily Champion    │ Top 10% in Daily Challenge
Speed Demon       │ Quiz in <50% time, 80%+ accuracy
Perfect Storm     │ 100% accuracy in Puzzle Storm
```

### Exploration Badges

```
Curious Mind      │ 5 different topics attempted
Subject Explorer  │ 1+ topic in each subject
Grade Adventurer  │ Try questions above grade level
Deep Diver        │ All subtopics in one topic
Polymath          │ Silver+ in 3 subjects
Well Rounded      │ Attempt all question types
```

---

## References

1. Duolingo Gamification Study (StriveCloud, 2024)
2. Khan Academy Badge System Analysis (Trophy, 2024)
3. Self-Determination Theory (Deci & Ryan)
4. "The Role of Gamified Learning Strategies" (PMC, 2023)
5. Rocket League Progression System (Psyonix)
6. "Designing for User Retention: Psychology of Streaks" (Medium, 2024)
7. "A Badge Design Framework for Gamified Learning" (PMC, 2019)
