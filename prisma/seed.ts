import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding progression system...\n");

  // ============================================================================
  // BADGES
  // ============================================================================
  console.log("📛 Seeding badges...");

  const badges = [
    // ==================== PROGRESS BADGES ====================
    {
      code: "first_steps",
      name: "First Steps",
      description: "Complete your first topic",
      category: "PROGRESS" as const,
      tier: "BRONZE" as const,
      rarity: "COMMON" as const,
      criteria: { type: "topic_completion", count: 1 },
      xpReward: 50,
      sortOrder: 1,
    },
    {
      code: "rising_star",
      name: "Rising Star",
      description: "Improve your accuracy by 10% or more in any topic",
      category: "PROGRESS" as const,
      tier: "BRONZE" as const,
      rarity: "COMMON" as const,
      criteria: { type: "accuracy_improvement", minImprovement: 0.1 },
      xpReward: 75,
      sortOrder: 2,
    },
    {
      code: "comeback_kid",
      name: "Comeback Kid",
      description: "Return after 7+ days away and improve your performance",
      category: "PROGRESS" as const,
      tier: "SILVER" as const,
      rarity: "UNCOMMON" as const,
      criteria: { type: "comeback", minDaysAway: 7, mustImprove: true },
      xpReward: 100,
      sortOrder: 3,
    },
    {
      code: "steady_climber",
      name: "Steady Climber",
      description: "Improve your rating for 3 weeks in a row",
      category: "PROGRESS" as const,
      tier: "SILVER" as const,
      rarity: "UNCOMMON" as const,
      criteria: { type: "consecutive_improvement", weeks: 3 },
      xpReward: 150,
      sortOrder: 4,
    },
    {
      code: "breakthrough",
      name: "Breakthrough",
      description: "Jump from Bronze to Silver or higher mastery in a single session",
      category: "PROGRESS" as const,
      tier: "GOLD" as const,
      rarity: "RARE" as const,
      criteria: { type: "tier_jump", fromTier: "BRONZE", minJump: 1 },
      xpReward: 200,
      sortOrder: 5,
    },
    {
      code: "marathon_runner",
      name: "Marathon Runner",
      description: "Answer 100 questions",
      category: "PROGRESS" as const,
      tier: "BRONZE" as const,
      rarity: "COMMON" as const,
      criteria: { type: "questions_answered", count: 100 },
      xpReward: 100,
      sortOrder: 6,
    },
    {
      code: "scholars_journey",
      name: "Scholar's Journey",
      description: "Complete 50% of your curriculum",
      category: "PROGRESS" as const,
      tier: "GOLD" as const,
      rarity: "RARE" as const,
      criteria: { type: "curriculum_completion", percentage: 0.5 },
      xpReward: 300,
      sortOrder: 7,
    },
    {
      code: "question_century",
      name: "Question Century",
      description: "Answer 100 questions in a single day",
      category: "PROGRESS" as const,
      tier: "GOLD" as const,
      rarity: "RARE" as const,
      criteria: { type: "daily_questions", count: 100 },
      xpReward: 250,
      sortOrder: 8,
    },

    // ==================== STREAK BADGES ====================
    {
      code: "streak_week_warrior",
      name: "Week Warrior",
      description: "Maintain a 7-day learning streak",
      category: "STREAK" as const,
      tier: "BRONZE" as const,
      rarity: "COMMON" as const,
      criteria: { type: "streak", days: 7 },
      xpReward: 100,
      sortOrder: 10,
    },
    {
      code: "streak_fortnight_force",
      name: "Fortnight Force",
      description: "Maintain a 14-day learning streak",
      category: "STREAK" as const,
      tier: "SILVER" as const,
      rarity: "UNCOMMON" as const,
      criteria: { type: "streak", days: 14 },
      xpReward: 150,
      sortOrder: 11,
    },
    {
      code: "streak_month_master",
      name: "Month Master",
      description: "Maintain a 30-day learning streak",
      category: "STREAK" as const,
      tier: "GOLD" as const,
      rarity: "RARE" as const,
      criteria: { type: "streak", days: 30 },
      xpReward: 300,
      unlocksBanner: "banner_phoenix_rising",
      sortOrder: 12,
    },
    {
      code: "streak_quarter_quest",
      name: "Quarter Quest",
      description: "Maintain a 90-day learning streak",
      category: "STREAK" as const,
      tier: "PLATINUM" as const,
      rarity: "EPIC" as const,
      criteria: { type: "streak", days: 90 },
      xpReward: 500,
      unlocksTitle: "title_dedicated_scholar",
      sortOrder: 13,
    },
    {
      code: "streak_century_scholar",
      name: "Century Scholar",
      description: "Maintain a 100-day learning streak",
      category: "STREAK" as const,
      tier: "PLATINUM" as const,
      rarity: "EPIC" as const,
      criteria: { type: "streak", days: 100 },
      xpReward: 750,
      sortOrder: 14,
    },
    {
      code: "streak_year_round",
      name: "Year-Round Learner",
      description: "Maintain a 365-day learning streak",
      category: "STREAK" as const,
      tier: "DIAMOND" as const,
      rarity: "LEGENDARY" as const,
      criteria: { type: "streak", days: 365 },
      xpReward: 2000,
      unlocksBanner: "banner_eternal_flame",
      unlocksTitle: "title_legendary_scholar",
      sortOrder: 15,
    },
    {
      code: "streak_resilient",
      name: "Resilient",
      description: "Restore your streak using grace period 3 times",
      category: "STREAK" as const,
      tier: "SILVER" as const,
      rarity: "UNCOMMON" as const,
      criteria: { type: "grace_restores", count: 3 },
      xpReward: 100,
      sortOrder: 16,
    },
    {
      code: "streak_shield_bearer",
      name: "Shield Bearer",
      description: "Earn 5 streak shields",
      category: "STREAK" as const,
      tier: "GOLD" as const,
      rarity: "RARE" as const,
      criteria: { type: "shields_earned", count: 5 },
      xpReward: 200,
      sortOrder: 17,
    },

    // ==================== MASTERY BADGES (Template - per topic) ====================
    // These would be generated dynamically per topic, but here are examples
    {
      code: "mastery_math_bronze",
      name: "Math Learner",
      description: "Achieve 60%+ accuracy on 10+ math questions",
      category: "MASTERY" as const,
      tier: "BRONZE" as const,
      rarity: "COMMON" as const,
      criteria: { type: "mastery", subject: "MATH", minAccuracy: 0.6, minQuestions: 10 },
      xpReward: 50,
      sortOrder: 20,
    },
    {
      code: "mastery_math_silver",
      name: "Math Scholar",
      description: "Achieve 70%+ accuracy on 20+ math questions",
      category: "MASTERY" as const,
      tier: "SILVER" as const,
      rarity: "UNCOMMON" as const,
      criteria: { type: "mastery", subject: "MATH", minAccuracy: 0.7, minQuestions: 20 },
      xpReward: 100,
      sortOrder: 21,
    },
    {
      code: "mastery_math_gold",
      name: "Math Expert",
      description: "Achieve 80%+ accuracy on 30+ math questions",
      category: "MASTERY" as const,
      tier: "GOLD" as const,
      rarity: "RARE" as const,
      criteria: { type: "mastery", subject: "MATH", minAccuracy: 0.8, minQuestions: 30 },
      xpReward: 200,
      sortOrder: 22,
    },
    {
      code: "mastery_math_platinum",
      name: "Math Master",
      description: "Achieve 90%+ accuracy on 50+ math questions",
      category: "MASTERY" as const,
      tier: "PLATINUM" as const,
      rarity: "EPIC" as const,
      criteria: { type: "mastery", subject: "MATH", minAccuracy: 0.9, minQuestions: 50 },
      xpReward: 400,
      sortOrder: 23,
    },
    {
      code: "mastery_math_diamond",
      name: "Math Sage",
      description: "Achieve 95%+ accuracy on 75+ math questions",
      category: "MASTERY" as const,
      tier: "DIAMOND" as const,
      rarity: "LEGENDARY" as const,
      criteria: { type: "mastery", subject: "MATH", minAccuracy: 0.95, minQuestions: 75 },
      xpReward: 750,
      unlocksTitle: "title_math_wizard",
      sortOrder: 24,
    },

    // ==================== CHALLENGE BADGES ====================
    {
      code: "challenge_storm_survivor",
      name: "Storm Survivor",
      description: "Complete a Puzzle Storm session",
      category: "CHALLENGE" as const,
      tier: "BRONZE" as const,
      rarity: "COMMON" as const,
      criteria: { type: "puzzle_storm_complete", minScore: 1 },
      xpReward: 50,
      sortOrder: 30,
    },
    {
      code: "challenge_storm_master",
      name: "Storm Master",
      description: "Score 50+ in a Puzzle Storm",
      category: "CHALLENGE" as const,
      tier: "GOLD" as const,
      rarity: "RARE" as const,
      criteria: { type: "puzzle_storm_complete", minScore: 50 },
      xpReward: 200,
      sortOrder: 31,
    },
    {
      code: "challenge_streak_legend",
      name: "Streak Legend",
      description: "Reach 25+ correct answers in Puzzle Streak mode",
      category: "CHALLENGE" as const,
      tier: "GOLD" as const,
      rarity: "RARE" as const,
      criteria: { type: "puzzle_streak_score", minScore: 25 },
      xpReward: 250,
      sortOrder: 32,
    },
    {
      code: "challenge_daily_devotee",
      name: "Daily Devotee",
      description: "Complete 7 Daily Challenges",
      category: "CHALLENGE" as const,
      tier: "SILVER" as const,
      rarity: "UNCOMMON" as const,
      criteria: { type: "daily_challenges_completed", count: 7 },
      xpReward: 150,
      sortOrder: 33,
    },
    {
      code: "challenge_daily_champion",
      name: "Daily Champion",
      description: "Finish in the top 10% of a Daily Challenge",
      category: "CHALLENGE" as const,
      tier: "GOLD" as const,
      rarity: "RARE" as const,
      criteria: { type: "daily_challenge_percentile", maxPercentile: 10 },
      xpReward: 300,
      sortOrder: 34,
    },
    {
      code: "challenge_speed_demon",
      name: "Speed Demon",
      description: "Complete a quiz in under 50% of the average time with 80%+ accuracy",
      category: "CHALLENGE" as const,
      tier: "GOLD" as const,
      rarity: "RARE" as const,
      criteria: { type: "speed_completion", maxTimePercent: 0.5, minAccuracy: 0.8 },
      xpReward: 250,
      sortOrder: 35,
    },
    {
      code: "challenge_perfect_storm",
      name: "Perfect Storm",
      description: "Achieve 100% accuracy in a Puzzle Storm session",
      category: "CHALLENGE" as const,
      tier: "PLATINUM" as const,
      rarity: "EPIC" as const,
      criteria: { type: "puzzle_storm_perfect" },
      xpReward: 500,
      sortOrder: 36,
    },

    // ==================== EXPLORATION BADGES ====================
    {
      code: "explore_curious_mind",
      name: "Curious Mind",
      description: "Attempt questions from 5 different topics",
      category: "EXPLORATION" as const,
      tier: "BRONZE" as const,
      rarity: "COMMON" as const,
      criteria: { type: "topics_attempted", count: 5 },
      xpReward: 75,
      sortOrder: 40,
    },
    {
      code: "explore_subject_explorer",
      name: "Subject Explorer",
      description: "Complete at least 1 topic in each available subject",
      category: "EXPLORATION" as const,
      tier: "SILVER" as const,
      rarity: "UNCOMMON" as const,
      criteria: { type: "all_subjects_attempted" },
      xpReward: 200,
      sortOrder: 41,
    },
    {
      code: "explore_grade_adventurer",
      name: "Grade Adventurer",
      description: "Try questions from a grade level above your current one",
      category: "EXPLORATION" as const,
      tier: "SILVER" as const,
      rarity: "UNCOMMON" as const,
      criteria: { type: "above_grade_attempt" },
      xpReward: 150,
      sortOrder: 42,
    },
    {
      code: "explore_deep_diver",
      name: "Deep Diver",
      description: "Complete all subtopics within a single topic",
      category: "EXPLORATION" as const,
      tier: "GOLD" as const,
      rarity: "RARE" as const,
      criteria: { type: "all_subtopics_complete" },
      xpReward: 250,
      sortOrder: 43,
    },
    {
      code: "explore_polymath",
      name: "Polymath",
      description: "Achieve Silver+ mastery in 3 different subjects",
      category: "EXPLORATION" as const,
      tier: "PLATINUM" as const,
      rarity: "EPIC" as const,
      criteria: { type: "multi_subject_mastery", subjects: 3, minTier: "SILVER" },
      xpReward: 500,
      unlocksTitle: "title_polymath",
      sortOrder: 44,
    },
    {
      code: "explore_well_rounded",
      name: "Well Rounded",
      description: "Attempt all available question types",
      category: "EXPLORATION" as const,
      tier: "SILVER" as const,
      rarity: "UNCOMMON" as const,
      criteria: { type: "all_question_types" },
      xpReward: 150,
      sortOrder: 45,
    },

    // ==================== SPECIAL BADGES ====================
    {
      code: "special_early_adopter",
      name: "Early Adopter",
      description: "Joined during the beta period",
      category: "SPECIAL" as const,
      tier: "GOLD" as const,
      rarity: "RARE" as const,
      criteria: { type: "special", event: "beta_signup" },
      xpReward: 500,
      unlocksBanner: "banner_pioneer",
      isHidden: true,
      sortOrder: 50,
    },
    {
      code: "special_founding_scholar",
      name: "Founding Scholar",
      description: "One of the first 1000 users",
      category: "SPECIAL" as const,
      tier: "PLATINUM" as const,
      rarity: "EPIC" as const,
      criteria: { type: "special", event: "first_1000" },
      xpReward: 1000,
      unlocksTitle: "title_founding_scholar",
      isHidden: true,
      sortOrder: 51,
    },
  ];

  for (const badge of badges) {
    await prisma.badgeDefinition.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    });
  }
  console.log(`   ✅ Created ${badges.length} badges\n`);

  // ============================================================================
  // ACHIEVEMENTS
  // ============================================================================
  console.log("🏆 Seeding achievements...");

  const achievements = [
    // Academic Achievements
    {
      code: "first_topic_master",
      name: "First Topic Master",
      description: "Achieve Gold mastery in any topic",
      category: "ACADEMIC" as const,
      difficulty: "MEDIUM" as const,
      criteria: { type: "topic_mastery", minTier: "GOLD", count: 1 },
      hasProgress: false,
      xpReward: 300,
      titleReward: "title_topic_master",
      sortOrder: 1,
    },
    {
      code: "subject_champion_math",
      name: "Subject Champion - Mathematics",
      description: "Achieve Gold+ mastery in 10+ math topics",
      category: "ACADEMIC" as const,
      difficulty: "HARD" as const,
      criteria: { type: "topic_mastery_count", subject: "MATH", minTier: "GOLD", minCount: 10 },
      hasProgress: true,
      progressMax: 10,
      xpReward: 1000,
      bannerReward: "banner_math_champion",
      titleReward: "title_mathematician",
      sortOrder: 2,
    },
    {
      code: "grade_complete",
      name: "Grade Complete",
      description: "Achieve 80%+ accuracy across all topics in your grade level",
      category: "ACADEMIC" as const,
      difficulty: "HARD" as const,
      criteria: { type: "grade_completion", minAccuracy: 0.8 },
      hasProgress: true,
      xpReward: 1500,
      iconReward: "icon_graduation_cap",
      sortOrder: 3,
    },
    {
      code: "curriculum_explorer",
      name: "Curriculum Explorer",
      description: "Complete content from 3+ grade levels",
      category: "ACADEMIC" as const,
      difficulty: "HARD" as const,
      criteria: { type: "multi_grade", minGrades: 3 },
      hasProgress: true,
      progressMax: 3,
      xpReward: 800,
      titleReward: "title_explorer",
      sortOrder: 4,
    },
    {
      code: "perfect_topic",
      name: "Perfect Topic",
      description: "Achieve 100% accuracy on a topic (minimum 20 questions)",
      category: "ACADEMIC" as const,
      difficulty: "LEGENDARY" as const,
      criteria: { type: "perfect_topic", minQuestions: 20 },
      hasProgress: false,
      xpReward: 1000,
      badgeReward: "mastery_perfectionist",
      sortOrder: 5,
    },

    // Challenge Achievements
    {
      code: "storm_chaser",
      name: "Storm Chaser",
      description: "Complete 10 Puzzle Storm sessions",
      category: "CHALLENGE" as const,
      difficulty: "MEDIUM" as const,
      criteria: { type: "puzzle_storm_count", count: 10 },
      hasProgress: true,
      progressMax: 10,
      xpReward: 500,
      titleReward: "title_storm_chaser",
      sortOrder: 10,
    },
    {
      code: "daily_devotee_30",
      name: "Daily Devotee",
      description: "Complete 30 Daily Challenges",
      category: "CHALLENGE" as const,
      difficulty: "MEDIUM" as const,
      criteria: { type: "daily_challenges", count: 30 },
      hasProgress: true,
      progressMax: 30,
      xpReward: 600,
      bannerReward: "banner_daily_champion",
      sortOrder: 11,
    },
    {
      code: "streak_champion",
      name: "Streak Champion",
      description: "Reach 50+ correct in Puzzle Streak mode",
      category: "CHALLENGE" as const,
      difficulty: "HARD" as const,
      criteria: { type: "puzzle_streak_high", minScore: 50 },
      hasProgress: false,
      xpReward: 750,
      iconReward: "icon_streak_flame",
      sortOrder: 12,
    },
    {
      code: "speed_scholar",
      name: "Speed Scholar",
      description: "Finish in top 10% time on 5 different quizzes",
      category: "CHALLENGE" as const,
      difficulty: "HARD" as const,
      criteria: { type: "speed_top_percentile", percentile: 10, count: 5 },
      hasProgress: true,
      progressMax: 5,
      xpReward: 600,
      titleReward: "title_speed_scholar",
      sortOrder: 13,
    },

    // Milestone Achievements
    {
      code: "century_club",
      name: "Century",
      description: "Answer 100 questions",
      category: "MILESTONE" as const,
      difficulty: "EASY" as const,
      criteria: { type: "questions_total", count: 100 },
      hasProgress: true,
      progressMax: 100,
      xpReward: 200,
      sortOrder: 20,
    },
    {
      code: "thousand_club",
      name: "Thousand Club",
      description: "Answer 1,000 questions",
      category: "MILESTONE" as const,
      difficulty: "MEDIUM" as const,
      criteria: { type: "questions_total", count: 1000 },
      hasProgress: true,
      progressMax: 1000,
      xpReward: 500,
      titleReward: "title_dedicated",
      sortOrder: 21,
    },
    {
      code: "ten_thousand_club",
      name: "Ten Thousand Club",
      description: "Answer 10,000 questions",
      category: "MILESTONE" as const,
      difficulty: "LEGENDARY" as const,
      criteria: { type: "questions_total", count: 10000 },
      hasProgress: true,
      progressMax: 10000,
      xpReward: 2000,
      titleReward: "title_legendary_scholar",
      bannerReward: "banner_legend",
      sortOrder: 22,
    },
    {
      code: "time_invested_10h",
      name: "Time Invested",
      description: "Spend 10 hours learning",
      category: "MILESTONE" as const,
      difficulty: "MEDIUM" as const,
      criteria: { type: "time_spent", hours: 10 },
      hasProgress: true,
      progressMax: 600, // minutes
      xpReward: 400,
      bannerReward: "banner_time_keeper",
      sortOrder: 23,
    },
    {
      code: "scholars_year",
      name: "Scholar's Year",
      description: "Maintain a 365-day streak",
      category: "MILESTONE" as const,
      difficulty: "LEGENDARY" as const,
      criteria: { type: "streak_milestone", days: 365 },
      hasProgress: true,
      progressMax: 365,
      xpReward: 5000,
      titleReward: "title_year_round_scholar",
      bannerReward: "banner_eternal_flame",
      iconReward: "icon_golden_crown",
      sortOrder: 24,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievementDefinition.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
  }
  console.log(`   ✅ Created ${achievements.length} achievements\n`);

  // ============================================================================
  // COSMETIC ITEMS
  // ============================================================================
  console.log("🎨 Seeding cosmetic items...");

  const cosmetics = [
    // ==================== DEFAULT BANNERS ====================
    {
      code: "banner_default_blue",
      name: "Ocean Blue",
      description: "A calming blue gradient",
      type: "BANNER" as const,
      rarity: "COMMON" as const,
      unlockMethod: "DEFAULT" as const,
      unlockCriteria: Prisma.JsonNull,
      sortOrder: 1,
    },
    {
      code: "banner_default_green",
      name: "Forest Green",
      description: "A refreshing green gradient",
      type: "BANNER" as const,
      rarity: "COMMON" as const,
      unlockMethod: "DEFAULT" as const,
      unlockCriteria: Prisma.JsonNull,
      sortOrder: 2,
    },
    {
      code: "banner_default_purple",
      name: "Royal Purple",
      description: "A majestic purple gradient",
      type: "BANNER" as const,
      rarity: "COMMON" as const,
      unlockMethod: "DEFAULT" as const,
      unlockCriteria: Prisma.JsonNull,
      sortOrder: 3,
    },

    // ==================== TIER-UNLOCKED BANNERS ====================
    {
      code: "banner_sprout_meadow",
      name: "Spring Meadow",
      description: "Fresh greens of new growth",
      type: "BANNER" as const,
      rarity: "COMMON" as const,
      unlockMethod: "TIER" as const,
      unlockCriteria: { academicTier: "SPROUT" },
      sortOrder: 10,
    },
    {
      code: "banner_sapling_forest",
      name: "Deep Forest",
      description: "Rich woodland colors",
      type: "BANNER" as const,
      rarity: "UNCOMMON" as const,
      unlockMethod: "TIER" as const,
      unlockCriteria: { academicTier: "SAPLING" },
      sortOrder: 11,
    },
    {
      code: "banner_tree_mountain",
      name: "Mountain Vista",
      description: "Majestic peaks at sunrise",
      type: "BANNER" as const,
      rarity: "UNCOMMON" as const,
      unlockMethod: "TIER" as const,
      unlockCriteria: { academicTier: "TREE" },
      sortOrder: 12,
    },
    {
      code: "banner_grove_aurora",
      name: "Northern Lights",
      description: "Dancing aurora borealis",
      type: "BANNER" as const,
      rarity: "RARE" as const,
      unlockMethod: "TIER" as const,
      unlockCriteria: { academicTier: "GROVE" },
      sortOrder: 13,
    },
    {
      code: "banner_forest_cosmos",
      name: "Cosmic Dreams",
      description: "Swirling galaxies and nebulae",
      type: "BANNER" as const,
      rarity: "EPIC" as const,
      unlockMethod: "TIER" as const,
      unlockCriteria: { academicTier: "FOREST" },
      sortOrder: 14,
    },
    {
      code: "banner_ancient_celestial",
      name: "Celestial Guardian",
      description: "Ancient stars watching over all",
      type: "BANNER" as const,
      rarity: "LEGENDARY" as const,
      unlockMethod: "TIER" as const,
      unlockCriteria: { academicTier: "ANCIENT_FOREST" },
      sortOrder: 15,
    },

    // ==================== BADGE-UNLOCKED BANNERS ====================
    {
      code: "banner_phoenix_rising",
      name: "Phoenix Rising",
      description: "Rise from the ashes of yesterday",
      type: "BANNER" as const,
      rarity: "RARE" as const,
      unlockMethod: "BADGE" as const,
      unlockCriteria: { badgeCode: "streak_month_master" },
      sortOrder: 20,
    },
    {
      code: "banner_eternal_flame",
      name: "Eternal Flame",
      description: "A fire that never dies",
      type: "BANNER" as const,
      rarity: "LEGENDARY" as const,
      unlockMethod: "BADGE" as const,
      unlockCriteria: { badgeCode: "streak_year_round" },
      sortOrder: 21,
    },
    {
      code: "banner_pioneer",
      name: "Pioneer Spirit",
      description: "For those who dared to begin",
      type: "BANNER" as const,
      rarity: "RARE" as const,
      unlockMethod: "BADGE" as const,
      unlockCriteria: { badgeCode: "special_early_adopter" },
      sortOrder: 22,
    },
    {
      code: "banner_math_champion",
      name: "Mathematical Mastery",
      description: "Numbers bow to your will",
      type: "BANNER" as const,
      rarity: "EPIC" as const,
      unlockMethod: "ACHIEVEMENT" as const,
      unlockCriteria: { achievementCode: "subject_champion_math" },
      sortOrder: 23,
    },
    {
      code: "banner_daily_champion",
      name: "Champion's Glory",
      description: "Daily dedication rewarded",
      type: "BANNER" as const,
      rarity: "RARE" as const,
      unlockMethod: "ACHIEVEMENT" as const,
      unlockCriteria: { achievementCode: "daily_devotee_30" },
      sortOrder: 24,
    },
    {
      code: "banner_time_keeper",
      name: "Time Keeper",
      description: "Master of moments",
      type: "BANNER" as const,
      rarity: "RARE" as const,
      unlockMethod: "ACHIEVEMENT" as const,
      unlockCriteria: { achievementCode: "time_invested_10h" },
      sortOrder: 25,
    },
    {
      code: "banner_legend",
      name: "Living Legend",
      description: "Your dedication is legendary",
      type: "BANNER" as const,
      rarity: "LEGENDARY" as const,
      unlockMethod: "ACHIEVEMENT" as const,
      unlockCriteria: { achievementCode: "ten_thousand_club" },
      sortOrder: 26,
    },

    // ==================== DEFAULT ICONS ====================
    {
      code: "icon_default_student",
      name: "Student",
      description: "A fresh-faced learner",
      type: "ICON" as const,
      rarity: "COMMON" as const,
      unlockMethod: "DEFAULT" as const,
      unlockCriteria: Prisma.JsonNull,
      sortOrder: 100,
    },
    {
      code: "icon_default_book",
      name: "Bookworm",
      description: "Knowledge seeker",
      type: "ICON" as const,
      rarity: "COMMON" as const,
      unlockMethod: "DEFAULT" as const,
      unlockCriteria: Prisma.JsonNull,
      sortOrder: 101,
    },
    {
      code: "icon_default_star",
      name: "Rising Star",
      description: "Destined for greatness",
      type: "ICON" as const,
      rarity: "COMMON" as const,
      unlockMethod: "DEFAULT" as const,
      unlockCriteria: Prisma.JsonNull,
      sortOrder: 102,
    },

    // ==================== UNLOCKABLE ICONS ====================
    {
      code: "icon_graduation_cap",
      name: "Graduate",
      description: "Academic excellence achieved",
      type: "ICON" as const,
      rarity: "EPIC" as const,
      unlockMethod: "ACHIEVEMENT" as const,
      unlockCriteria: { achievementCode: "grade_complete" },
      sortOrder: 110,
    },
    {
      code: "icon_streak_flame",
      name: "Streak Flame",
      description: "Burning with dedication",
      type: "ICON" as const,
      rarity: "RARE" as const,
      unlockMethod: "STREAK" as const,
      unlockCriteria: { minStreak: 30 },
      sortOrder: 111,
    },
    {
      code: "icon_golden_crown",
      name: "Golden Crown",
      description: "Royalty among scholars",
      type: "ICON" as const,
      rarity: "LEGENDARY" as const,
      unlockMethod: "ACHIEVEMENT" as const,
      unlockCriteria: { achievementCode: "scholars_year" },
      sortOrder: 112,
    },
    {
      code: "icon_math_pi",
      name: "Pi Symbol",
      description: "Mathematical prowess",
      type: "ICON" as const,
      rarity: "RARE" as const,
      unlockMethod: "BADGE" as const,
      unlockCriteria: { badgeCode: "mastery_math_gold" },
      sortOrder: 113,
    },
    {
      code: "icon_lightning",
      name: "Lightning Bolt",
      description: "Speed and precision",
      type: "ICON" as const,
      rarity: "RARE" as const,
      unlockMethod: "BADGE" as const,
      unlockCriteria: { badgeCode: "challenge_speed_demon" },
      sortOrder: 114,
    },

    // ==================== TITLES ====================
    {
      code: "title_learner",
      name: "Learner",
      description: "Every journey begins with a single step",
      type: "TITLE" as const,
      rarity: "COMMON" as const,
      unlockMethod: "DEFAULT" as const,
      unlockCriteria: Prisma.JsonNull,
      sortOrder: 200,
    },
    {
      code: "title_topic_master",
      name: "Topic Master",
      description: "Achieved Gold mastery in a topic",
      type: "TITLE" as const,
      rarity: "RARE" as const,
      unlockMethod: "ACHIEVEMENT" as const,
      unlockCriteria: { achievementCode: "first_topic_master" },
      sortOrder: 201,
    },
    {
      code: "title_mathematician",
      name: "Mathematician",
      description: "Master of mathematical arts",
      type: "TITLE" as const,
      rarity: "EPIC" as const,
      unlockMethod: "ACHIEVEMENT" as const,
      unlockCriteria: { achievementCode: "subject_champion_math" },
      sortOrder: 202,
    },
    {
      code: "title_math_wizard",
      name: "Math Wizard",
      description: "Numbers bend to your will",
      type: "TITLE" as const,
      rarity: "LEGENDARY" as const,
      unlockMethod: "BADGE" as const,
      unlockCriteria: { badgeCode: "mastery_math_diamond" },
      sortOrder: 203,
    },
    {
      code: "title_dedicated_scholar",
      name: "Dedicated Scholar",
      description: "Unwavering commitment to learning",
      type: "TITLE" as const,
      rarity: "EPIC" as const,
      unlockMethod: "BADGE" as const,
      unlockCriteria: { badgeCode: "streak_quarter_quest" },
      sortOrder: 204,
    },
    {
      code: "title_legendary_scholar",
      name: "Legendary Scholar",
      description: "Your dedication is the stuff of legends",
      type: "TITLE" as const,
      rarity: "LEGENDARY" as const,
      unlockMethod: "BADGE" as const,
      unlockCriteria: { badgeCode: "streak_year_round" },
      sortOrder: 205,
    },
    {
      code: "title_founding_scholar",
      name: "Founding Scholar",
      description: "Among the first to embark on this journey",
      type: "TITLE" as const,
      rarity: "EPIC" as const,
      unlockMethod: "BADGE" as const,
      unlockCriteria: { badgeCode: "special_founding_scholar" },
      sortOrder: 206,
    },
    {
      code: "title_polymath",
      name: "Polymath",
      description: "Master of many disciplines",
      type: "TITLE" as const,
      rarity: "EPIC" as const,
      unlockMethod: "BADGE" as const,
      unlockCriteria: { badgeCode: "explore_polymath" },
      sortOrder: 207,
    },
    {
      code: "title_explorer",
      name: "Explorer",
      description: "Seeker of knowledge across boundaries",
      type: "TITLE" as const,
      rarity: "RARE" as const,
      unlockMethod: "ACHIEVEMENT" as const,
      unlockCriteria: { achievementCode: "curriculum_explorer" },
      sortOrder: 208,
    },
    {
      code: "title_storm_chaser",
      name: "Storm Chaser",
      description: "Thrives in the chaos of challenge",
      type: "TITLE" as const,
      rarity: "RARE" as const,
      unlockMethod: "ACHIEVEMENT" as const,
      unlockCriteria: { achievementCode: "storm_chaser" },
      sortOrder: 209,
    },
    {
      code: "title_speed_scholar",
      name: "Speed Scholar",
      description: "Quick mind, quicker answers",
      type: "TITLE" as const,
      rarity: "RARE" as const,
      unlockMethod: "ACHIEVEMENT" as const,
      unlockCriteria: { achievementCode: "speed_scholar" },
      sortOrder: 210,
    },
    {
      code: "title_dedicated",
      name: "The Dedicated",
      description: "1000 questions answered",
      type: "TITLE" as const,
      rarity: "UNCOMMON" as const,
      unlockMethod: "ACHIEVEMENT" as const,
      unlockCriteria: { achievementCode: "thousand_club" },
      sortOrder: 211,
    },
    {
      code: "title_year_round_scholar",
      name: "Year-Round Scholar",
      description: "365 days of unbroken dedication",
      type: "TITLE" as const,
      rarity: "LEGENDARY" as const,
      unlockMethod: "ACHIEVEMENT" as const,
      unlockCriteria: { achievementCode: "scholars_year" },
      sortOrder: 212,
    },

    // ==================== PROFILE FRAMES ====================
    {
      code: "frame_default",
      name: "Standard Frame",
      description: "A simple, clean frame",
      type: "PROFILE_FRAME" as const,
      rarity: "COMMON" as const,
      unlockMethod: "DEFAULT" as const,
      unlockCriteria: Prisma.JsonNull,
      sortOrder: 300,
    },
    {
      code: "frame_bronze",
      name: "Bronze Frame",
      description: "A warm bronze border",
      type: "PROFILE_FRAME" as const,
      rarity: "COMMON" as const,
      unlockMethod: "XP" as const,
      unlockCriteria: { minXp: 500 },
      sortOrder: 301,
    },
    {
      code: "frame_silver",
      name: "Silver Frame",
      description: "A polished silver border",
      type: "PROFILE_FRAME" as const,
      rarity: "UNCOMMON" as const,
      unlockMethod: "XP" as const,
      unlockCriteria: { minXp: 2000 },
      sortOrder: 302,
    },
    {
      code: "frame_gold",
      name: "Gold Frame",
      description: "A prestigious gold border",
      type: "PROFILE_FRAME" as const,
      rarity: "RARE" as const,
      unlockMethod: "XP" as const,
      unlockCriteria: { minXp: 5000 },
      sortOrder: 303,
    },
    {
      code: "frame_platinum",
      name: "Platinum Frame",
      description: "A brilliant platinum border",
      type: "PROFILE_FRAME" as const,
      rarity: "EPIC" as const,
      unlockMethod: "XP" as const,
      unlockCriteria: { minXp: 15000 },
      sortOrder: 304,
    },
    {
      code: "frame_diamond",
      name: "Diamond Frame",
      description: "A dazzling diamond border",
      type: "PROFILE_FRAME" as const,
      rarity: "LEGENDARY" as const,
      unlockMethod: "XP" as const,
      unlockCriteria: { minXp: 50000 },
      sortOrder: 305,
    },
  ];

  for (const cosmetic of cosmetics) {
    await prisma.cosmeticItem.upsert({
      where: { code: cosmetic.code },
      update: cosmetic,
      create: cosmetic,
    });
  }
  console.log(`   ✅ Created ${cosmetics.length} cosmetic items\n`);

  // ============================================================================
  // CAPS CURRICULUM - GRADE 4 MATHEMATICS
  // Based on South African CAPS (Curriculum and Assessment Policy Statement)
  // ============================================================================
  console.log("📚 Seeding CAPS Curriculum (Grade 4 Mathematics)...\n");

  // Create Country
  const southAfrica = await prisma.country.upsert({
    where: { code: "ZA" },
    update: {},
    create: {
      code: "ZA",
      name: "South Africa",
    },
  });
  console.log("   ✅ Created country: South Africa");

  // Create Curriculum
  const capsCurriculum = await prisma.curriculum.upsert({
    where: { code: "CAPS" },
    update: {},
    create: {
      countryId: southAfrica.id,
      code: "CAPS",
      name: "Curriculum and Assessment Policy Statement",
      description: "The South African National Curriculum for Grades R-12",
      version: "2012",
    },
  });
  console.log("   ✅ Created curriculum: CAPS");

  // Create Mathematics Subject
  const mathSubject = await prisma.subject.upsert({
    where: {
      curriculumId_code: {
        curriculumId: capsCurriculum.id,
        code: "MATH",
      },
    },
    update: {},
    create: {
      curriculumId: capsCurriculum.id,
      code: "MATH",
      name: "Mathematics",
      description: "Development of mathematical concepts, skills and problem-solving abilities",
      color: "#3B82F6",
      icon: "calculator",
    },
  });
  console.log("   ✅ Created subject: Mathematics");

  // Create Grade 4 Level
  const grade4 = await prisma.gradeLevel.upsert({
    where: {
      id: `${mathSubject.id}-grade-4`,
    },
    update: {},
    create: {
      id: `${mathSubject.id}-grade-4`,
      subjectId: mathSubject.id,
      grade: 4,
      name: "Grade 4",
      description: "Intermediate Phase - First Year",
    },
  });
  console.log("   ✅ Created grade level: Grade 4");

  // ============================================================================
  // CAPS GRADE 4 MATHEMATICS TOPICS
  // Based on the 5 Content Areas from CAPS:
  // 1. Numbers, Operations and Relationships
  // 2. Patterns, Functions and Algebra
  // 3. Space and Shape (Geometry)
  // 4. Measurement
  // 5. Data Handling
  // ============================================================================

  const topicsData = [
    // ==================== 1. NUMBERS, OPERATIONS AND RELATIONSHIPS ====================
    {
      code: "NUM-001",
      name: "Numbers, Operations and Relationships",
      description: "Understanding whole numbers, counting, place value, and arithmetic operations",
      learningGoals: [
        "Count forwards and backwards in a variety of intervals",
        "Recognize and represent numbers to at least 10 000",
        "Order and compare whole numbers",
        "Perform calculations using all four operations",
      ],
      prerequisites: [],
      estimatedHours: 80,
      sortOrder: 1,
      children: [
        {
          code: "NUM-001-01",
          name: "Whole Numbers: Counting",
          description: "Counting forwards and backwards in intervals",
          learningGoals: [
            "Count forwards and backwards in 1s, 2s, 3s, 5s, 10s, 25s, 50s, 100s",
            "Count forwards and backwards between any two given numbers",
            "Count in intervals of any whole number",
          ],
          prerequisites: [],
          estimatedHours: 8,
          sortOrder: 1,
        },
        {
          code: "NUM-001-02",
          name: "Whole Numbers: Number Symbols and Names",
          description: "Reading, writing and representing numbers",
          learningGoals: [
            "Read and write number symbols 0-10 000",
            "Read and write number names 0-10 000",
            "Identify and describe the place value of digits",
            "Decompose and compose numbers",
          ],
          prerequisites: ["NUM-001-01"],
          estimatedHours: 10,
          sortOrder: 2,
        },
        {
          code: "NUM-001-03",
          name: "Whole Numbers: Ordering and Comparing",
          description: "Comparing and ordering whole numbers",
          learningGoals: [
            "Compare whole numbers using <, > and =",
            "Order numbers from smallest to greatest and vice versa",
            "Position numbers on a number line",
          ],
          prerequisites: ["NUM-001-02"],
          estimatedHours: 6,
          sortOrder: 3,
        },
        {
          code: "NUM-001-04",
          name: "Number Sentences",
          description: "Writing and solving number sentences",
          learningGoals: [
            "Write number sentences to describe problem situations",
            "Solve and complete number sentences",
            "Check solutions by substitution",
          ],
          prerequisites: ["NUM-001-03"],
          estimatedHours: 8,
          sortOrder: 4,
        },
        {
          code: "NUM-001-05",
          name: "Addition and Subtraction",
          description: "Mastering addition and subtraction of whole numbers",
          learningGoals: [
            "Add and subtract whole numbers up to 10 000",
            "Use various strategies: breaking down, building up, compensation",
            "Estimate answers before calculating",
            "Use inverse operations to check answers",
          ],
          prerequisites: ["NUM-001-04"],
          estimatedHours: 15,
          sortOrder: 5,
        },
        {
          code: "NUM-001-06",
          name: "Multiplication",
          description: "Understanding and performing multiplication",
          learningGoals: [
            "Know multiplication tables up to 10 × 10",
            "Multiply 2-digit by 2-digit numbers",
            "Multiply 3-digit by 1-digit numbers",
            "Use the distributive property",
          ],
          prerequisites: ["NUM-001-05"],
          estimatedHours: 12,
          sortOrder: 6,
        },
        {
          code: "NUM-001-07",
          name: "Division",
          description: "Understanding and performing division",
          learningGoals: [
            "Divide 3-digit by 1-digit numbers",
            "Understand division with remainders",
            "Use inverse relationship between multiplication and division",
            "Solve word problems involving division",
          ],
          prerequisites: ["NUM-001-06"],
          estimatedHours: 12,
          sortOrder: 7,
        },
        {
          code: "NUM-001-08",
          name: "Common Fractions",
          description: "Introduction to fractions",
          learningGoals: [
            "Recognize and name unit fractions (halves, thirds, quarters, etc.)",
            "Compare fractions with the same denominator",
            "Add and subtract fractions with the same denominator",
            "Find fractions of whole numbers",
          ],
          prerequisites: ["NUM-001-07"],
          estimatedHours: 10,
          sortOrder: 8,
        },
      ],
    },
    // ==================== 2. PATTERNS, FUNCTIONS AND ALGEBRA ====================
    {
      code: "PAT-001",
      name: "Patterns, Functions and Algebra",
      description: "Investigating and extending patterns, input-output relationships",
      learningGoals: [
        "Investigate and extend numeric and geometric patterns",
        "Describe patterns in words",
        "Determine input and output values",
        "Understand the concept of a variable",
      ],
      prerequisites: [],
      estimatedHours: 20,
      sortOrder: 2,
      children: [
        {
          code: "PAT-001-01",
          name: "Numeric Patterns",
          description: "Exploring and extending number patterns",
          learningGoals: [
            "Investigate and extend numeric patterns",
            "Describe the rule for a pattern in words",
            "Create own numeric patterns",
            "Find missing numbers in sequences",
          ],
          prerequisites: [],
          estimatedHours: 8,
          sortOrder: 1,
        },
        {
          code: "PAT-001-02",
          name: "Geometric Patterns",
          description: "Exploring patterns with shapes",
          learningGoals: [
            "Investigate and extend geometric patterns",
            "Describe patterns using physical objects and drawings",
            "Create own geometric patterns",
          ],
          prerequisites: ["PAT-001-01"],
          estimatedHours: 6,
          sortOrder: 2,
        },
        {
          code: "PAT-001-03",
          name: "Input and Output",
          description: "Understanding number machines and relationships",
          learningGoals: [
            "Determine input values given output values",
            "Determine output values given input values",
            "Describe the rule for input-output relationships",
            "Complete flow diagrams",
          ],
          prerequisites: ["PAT-001-02"],
          estimatedHours: 6,
          sortOrder: 3,
        },
      ],
    },
    // ==================== 3. SPACE AND SHAPE (GEOMETRY) ====================
    {
      code: "GEO-001",
      name: "Space and Shape",
      description: "Properties of 2-D shapes and 3-D objects, position and movement",
      learningGoals: [
        "Recognize and name 2-D shapes and 3-D objects",
        "Describe properties of shapes and objects",
        "Identify and describe symmetry",
        "Follow and give directions",
      ],
      prerequisites: [],
      estimatedHours: 25,
      sortOrder: 3,
      children: [
        {
          code: "GEO-001-01",
          name: "2-D Shapes",
          description: "Properties of two-dimensional shapes",
          learningGoals: [
            "Recognize and name circles, triangles, squares, rectangles",
            "Describe properties: sides, corners, straight/curved",
            "Sort and classify shapes by properties",
            "Draw shapes and patterns",
          ],
          prerequisites: [],
          estimatedHours: 8,
          sortOrder: 1,
        },
        {
          code: "GEO-001-02",
          name: "3-D Objects",
          description: "Properties of three-dimensional objects",
          learningGoals: [
            "Recognize and name spheres, cubes, prisms, pyramids, cylinders, cones",
            "Describe 3-D objects in terms of faces, edges, vertices",
            "Relate 3-D objects to 2-D shapes",
            "Build 3-D models",
          ],
          prerequisites: ["GEO-001-01"],
          estimatedHours: 8,
          sortOrder: 2,
        },
        {
          code: "GEO-001-03",
          name: "Symmetry",
          description: "Line symmetry in 2-D shapes",
          learningGoals: [
            "Identify lines of symmetry in 2-D shapes",
            "Draw lines of symmetry",
            "Complete symmetrical patterns",
          ],
          prerequisites: ["GEO-001-01"],
          estimatedHours: 4,
          sortOrder: 3,
        },
        {
          code: "GEO-001-04",
          name: "Position and Movement",
          description: "Describing position and giving directions",
          learningGoals: [
            "Use vocabulary: left, right, above, below, between",
            "Follow and give directions using landmarks",
            "Use grid coordinates to describe position",
          ],
          prerequisites: [],
          estimatedHours: 5,
          sortOrder: 4,
        },
      ],
    },
    // ==================== 4. MEASUREMENT ====================
    {
      code: "MEA-001",
      name: "Measurement",
      description: "Measuring length, mass, capacity, time, and perimeter/area",
      learningGoals: [
        "Estimate and measure using standard units",
        "Convert between units of measurement",
        "Solve problems involving measurement",
        "Calculate perimeter and area",
      ],
      prerequisites: [],
      estimatedHours: 30,
      sortOrder: 4,
      children: [
        {
          code: "MEA-001-01",
          name: "Length",
          description: "Measuring and estimating length",
          learningGoals: [
            "Estimate and measure length in mm, cm, m, km",
            "Convert between units: mm, cm, m, km",
            "Use appropriate units for different contexts",
            "Solve problems involving length",
          ],
          prerequisites: [],
          estimatedHours: 6,
          sortOrder: 1,
        },
        {
          code: "MEA-001-02",
          name: "Mass",
          description: "Measuring and estimating mass",
          learningGoals: [
            "Estimate and measure mass in g and kg",
            "Convert between g and kg",
            "Use appropriate measuring instruments",
            "Solve problems involving mass",
          ],
          prerequisites: [],
          estimatedHours: 5,
          sortOrder: 2,
        },
        {
          code: "MEA-001-03",
          name: "Capacity and Volume",
          description: "Measuring capacity and volume",
          learningGoals: [
            "Estimate and measure capacity in ml and ℓ",
            "Convert between ml and ℓ",
            "Compare capacities of different containers",
            "Solve problems involving capacity",
          ],
          prerequisites: [],
          estimatedHours: 5,
          sortOrder: 3,
        },
        {
          code: "MEA-001-04",
          name: "Time",
          description: "Reading time and calculating duration",
          learningGoals: [
            "Read time on analog and digital clocks",
            "Convert between units of time",
            "Calculate elapsed time",
            "Read and interpret calendars and timetables",
          ],
          prerequisites: [],
          estimatedHours: 8,
          sortOrder: 4,
        },
        {
          code: "MEA-001-05",
          name: "Perimeter and Area",
          description: "Introduction to perimeter and area",
          learningGoals: [
            "Calculate perimeter of squares and rectangles",
            "Calculate area of squares and rectangles",
            "Understand the difference between perimeter and area",
            "Solve problems involving perimeter and area",
          ],
          prerequisites: ["MEA-001-01"],
          estimatedHours: 6,
          sortOrder: 5,
        },
      ],
    },
    // ==================== 5. DATA HANDLING ====================
    {
      code: "DAT-001",
      name: "Data Handling",
      description: "Collecting, organizing, representing and analyzing data",
      learningGoals: [
        "Collect and organize data",
        "Represent data in tables and graphs",
        "Read and interpret data",
        "Answer questions about data",
      ],
      prerequisites: [],
      estimatedHours: 15,
      sortOrder: 5,
      children: [
        {
          code: "DAT-001-01",
          name: "Collecting and Organizing Data",
          description: "Gathering and sorting information",
          learningGoals: [
            "Collect data using surveys, observations, and experiments",
            "Organize data using tally marks and tables",
            "Sort and classify data",
          ],
          prerequisites: [],
          estimatedHours: 4,
          sortOrder: 1,
        },
        {
          code: "DAT-001-02",
          name: "Representing Data",
          description: "Creating graphs and charts",
          learningGoals: [
            "Draw pictographs with one-to-many correspondence",
            "Draw bar graphs",
            "Choose appropriate representation for data",
          ],
          prerequisites: ["DAT-001-01"],
          estimatedHours: 5,
          sortOrder: 2,
        },
        {
          code: "DAT-001-03",
          name: "Interpreting Data",
          description: "Reading and analyzing data displays",
          learningGoals: [
            "Read and interpret pictographs and bar graphs",
            "Answer questions about data",
            "Compare data sets",
            "Make predictions based on data",
          ],
          prerequisites: ["DAT-001-02"],
          estimatedHours: 6,
          sortOrder: 3,
        },
      ],
    },
  ];

  // Create topics and subtopics
  let topicCount = 0;
  for (const topicData of topicsData) {
    const { children, ...parentData } = topicData;

    // Create parent topic
    const parentTopic = await prisma.topic.upsert({
      where: {
        gradeLevelId_code: {
          gradeLevelId: grade4.id,
          code: parentData.code,
        },
      },
      update: {
        name: parentData.name,
        description: parentData.description,
        learningGoals: parentData.learningGoals,
        prerequisites: parentData.prerequisites,
        estimatedHours: parentData.estimatedHours,
        sortOrder: parentData.sortOrder,
      },
      create: {
        gradeLevelId: grade4.id,
        code: parentData.code,
        name: parentData.name,
        description: parentData.description,
        learningGoals: parentData.learningGoals,
        prerequisites: parentData.prerequisites,
        estimatedHours: parentData.estimatedHours,
        sortOrder: parentData.sortOrder,
      },
    });
    topicCount++;

    // Create child topics
    if (children) {
      for (const childData of children) {
        await prisma.topic.upsert({
          where: {
            gradeLevelId_code: {
              gradeLevelId: grade4.id,
              code: childData.code,
            },
          },
          update: {
            name: childData.name,
            description: childData.description,
            learningGoals: childData.learningGoals,
            prerequisites: childData.prerequisites,
            estimatedHours: childData.estimatedHours,
            sortOrder: childData.sortOrder,
            parentId: parentTopic.id,
          },
          create: {
            gradeLevelId: grade4.id,
            parentId: parentTopic.id,
            code: childData.code,
            name: childData.name,
            description: childData.description,
            learningGoals: childData.learningGoals,
            prerequisites: childData.prerequisites,
            estimatedHours: childData.estimatedHours,
            sortOrder: childData.sortOrder,
          },
        });
        topicCount++;
      }
    }
  }
  console.log(`   ✅ Created ${topicCount} topics for Grade 4 Mathematics`);

  // ============================================================================
  // QUESTIONS FOR GRADE 4 MATHEMATICS
  // ============================================================================
  console.log("❓ Seeding practice questions...");

  // Get all topics to create questions for
  const questionsTopics = await prisma.topic.findMany({
    where: { gradeLevelId: grade4.id, parentId: { not: null } },
    select: { id: true, code: true, name: true },
  });

  // Sample QTI questions for different topic areas
  const questionsData: {
    topicCode: string;
    questions: {
      title: string;
      questionText: string;
      qtiXml: string;
      type: "CHOICE" | "TEXT_ENTRY";
      difficultyLevel: "FOUNDATIONAL" | "DEVELOPING" | "PROFICIENT" | "ADVANCED";
      correctAnswers: string | string[];
      estimatedTime: number;
      tags: string[];
    }[];
  }[] = [
    // Numbers: Counting
    {
      topicCode: "NUM-001-01",
      questions: [
        {
          title: "Count by 25s",
          questionText: "What number comes next in this sequence: 25, 50, 75, ___?",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="NUM-001-01-Q1" title="Count by 25s" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>A</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>What number comes next in this sequence: 25, 50, 75, ___?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">100</qti-simple-choice>
      <qti-simple-choice identifier="B">85</qti-simple-choice>
      <qti-simple-choice identifier="C">90</qti-simple-choice>
      <qti-simple-choice identifier="D">125</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "DEVELOPING",
          correctAnswers: "A",
          estimatedTime: 30,
          tags: ["counting", "patterns", "multiples"],
        },
        {
          title: "Count backwards by 100s",
          questionText: "Count backwards: 1000, 900, 800, ___",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="NUM-001-01-Q2" title="Count backwards by 100s" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>B</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>Count backwards: 1000, 900, 800, ___</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">600</qti-simple-choice>
      <qti-simple-choice identifier="B">700</qti-simple-choice>
      <qti-simple-choice identifier="C">750</qti-simple-choice>
      <qti-simple-choice identifier="D">650</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "PROFICIENT",
          correctAnswers: "B",
          estimatedTime: 30,
          tags: ["counting", "backwards", "hundreds"],
        },
      ],
    },
    // Numbers: Addition and Subtraction
    {
      topicCode: "NUM-001-05",
      questions: [
        {
          title: "Three-digit addition",
          questionText: "What is 234 + 567?",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="NUM-001-05-Q1" title="Three-digit addition" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>C</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>What is 234 + 567?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">791</qti-simple-choice>
      <qti-simple-choice identifier="B">701</qti-simple-choice>
      <qti-simple-choice identifier="C">801</qti-simple-choice>
      <qti-simple-choice identifier="D">811</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "PROFICIENT",
          correctAnswers: "C",
          estimatedTime: 45,
          tags: ["addition", "three-digit", "no-regrouping"],
        },
        {
          title: "Three-digit subtraction",
          questionText: "What is 845 - 362?",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="NUM-001-05-Q2" title="Three-digit subtraction" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>A</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>What is 845 - 362?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">483</qti-simple-choice>
      <qti-simple-choice identifier="B">583</qti-simple-choice>
      <qti-simple-choice identifier="C">493</qti-simple-choice>
      <qti-simple-choice identifier="D">473</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "PROFICIENT",
          correctAnswers: "A",
          estimatedTime: 45,
          tags: ["subtraction", "three-digit", "regrouping"],
        },
        {
          title: "Word problem - addition",
          questionText: "A farmer has 256 apples and picks 189 more. How many apples does the farmer have now?",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="NUM-001-05-Q3" title="Word problem - addition" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>B</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>A farmer has 256 apples and picks 189 more. How many apples does the farmer have now?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">435</qti-simple-choice>
      <qti-simple-choice identifier="B">445</qti-simple-choice>
      <qti-simple-choice identifier="C">455</qti-simple-choice>
      <qti-simple-choice identifier="D">545</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "ADVANCED",
          correctAnswers: "B",
          estimatedTime: 60,
          tags: ["addition", "word-problem", "real-world"],
        },
      ],
    },
    // Numbers: Multiplication
    {
      topicCode: "NUM-001-06",
      questions: [
        {
          title: "Multiplication table - 6s",
          questionText: "What is 6 × 7?",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="NUM-001-06-Q1" title="Multiplication table - 6s" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>C</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>What is 6 × 7?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">36</qti-simple-choice>
      <qti-simple-choice identifier="B">48</qti-simple-choice>
      <qti-simple-choice identifier="C">42</qti-simple-choice>
      <qti-simple-choice identifier="D">54</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "DEVELOPING",
          correctAnswers: "C",
          estimatedTime: 20,
          tags: ["multiplication", "times-tables", "6s"],
        },
        {
          title: "Multiplication by 10",
          questionText: "What is 47 × 10?",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="NUM-001-06-Q2" title="Multiplication by 10" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>A</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>What is 47 × 10?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">470</qti-simple-choice>
      <qti-simple-choice identifier="B">4700</qti-simple-choice>
      <qti-simple-choice identifier="C">407</qti-simple-choice>
      <qti-simple-choice identifier="D">57</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "PROFICIENT",
          correctAnswers: "A",
          estimatedTime: 20,
          tags: ["multiplication", "tens", "place-value"],
        },
      ],
    },
    // Numbers: Division
    {
      topicCode: "NUM-001-07",
      questions: [
        {
          title: "Division facts",
          questionText: "What is 56 ÷ 8?",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="NUM-001-07-Q1" title="Division facts" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>B</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>What is 56 ÷ 8?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">6</qti-simple-choice>
      <qti-simple-choice identifier="B">7</qti-simple-choice>
      <qti-simple-choice identifier="C">8</qti-simple-choice>
      <qti-simple-choice identifier="D">9</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "DEVELOPING",
          correctAnswers: "B",
          estimatedTime: 20,
          tags: ["division", "facts", "8s"],
        },
        {
          title: "Division with remainder",
          questionText: "What is 43 ÷ 5? Give the quotient and remainder.",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="NUM-001-07-Q2" title="Division with remainder" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>C</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>What is 43 ÷ 5? Give the quotient and remainder.</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">8 remainder 2</qti-simple-choice>
      <qti-simple-choice identifier="B">9 remainder 3</qti-simple-choice>
      <qti-simple-choice identifier="C">8 remainder 3</qti-simple-choice>
      <qti-simple-choice identifier="D">7 remainder 8</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "PROFICIENT",
          correctAnswers: "C",
          estimatedTime: 45,
          tags: ["division", "remainder", "5s"],
        },
      ],
    },
    // Numbers: Fractions
    {
      topicCode: "NUM-001-08",
      questions: [
        {
          title: "Identify a fraction",
          questionText: "What fraction of the circle is shaded? If 3 out of 8 equal parts are shaded.",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="NUM-001-08-Q1" title="Identify a fraction" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>A</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>What fraction of the circle is shaded? If 3 out of 8 equal parts are shaded.</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">3/8</qti-simple-choice>
      <qti-simple-choice identifier="B">8/3</qti-simple-choice>
      <qti-simple-choice identifier="C">5/8</qti-simple-choice>
      <qti-simple-choice identifier="D">3/5</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "FOUNDATIONAL",
          correctAnswers: "A",
          estimatedTime: 30,
          tags: ["fractions", "identify", "parts-of-whole"],
        },
        {
          title: "Equivalent fractions",
          questionText: "Which fraction is equivalent to 1/2?",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="NUM-001-08-Q2" title="Equivalent fractions" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>D</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>Which fraction is equivalent to 1/2?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">2/3</qti-simple-choice>
      <qti-simple-choice identifier="B">3/4</qti-simple-choice>
      <qti-simple-choice identifier="C">2/5</qti-simple-choice>
      <qti-simple-choice identifier="D">4/8</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "PROFICIENT",
          correctAnswers: "D",
          estimatedTime: 30,
          tags: ["fractions", "equivalent", "comparison"],
        },
      ],
    },
    // Patterns: Numeric Patterns
    {
      topicCode: "PAT-001-01",
      questions: [
        {
          title: "Complete the pattern",
          questionText: "What number comes next? 3, 6, 9, 12, ___",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="PAT-001-01-Q1" title="Complete the pattern" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>B</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>What number comes next? 3, 6, 9, 12, ___</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">14</qti-simple-choice>
      <qti-simple-choice identifier="B">15</qti-simple-choice>
      <qti-simple-choice identifier="C">16</qti-simple-choice>
      <qti-simple-choice identifier="D">18</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "DEVELOPING",
          correctAnswers: "B",
          estimatedTime: 20,
          tags: ["patterns", "multiples", "3s"],
        },
      ],
    },
    // Space and Shape: 2-D Shapes
    {
      topicCode: "SPA-001-01",
      questions: [
        {
          title: "Identify quadrilaterals",
          questionText: "Which of these is a quadrilateral?",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="SPA-001-01-Q1" title="Identify quadrilaterals" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>C</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>Which of these is a quadrilateral?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">Triangle</qti-simple-choice>
      <qti-simple-choice identifier="B">Pentagon</qti-simple-choice>
      <qti-simple-choice identifier="C">Rectangle</qti-simple-choice>
      <qti-simple-choice identifier="D">Hexagon</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "DEVELOPING",
          correctAnswers: "C",
          estimatedTime: 20,
          tags: ["shapes", "2d", "quadrilateral"],
        },
      ],
    },
    // Measurement: Time
    {
      topicCode: "MEA-001-04",
      questions: [
        {
          title: "Read digital time",
          questionText: "If the time is 2:45 PM, what time will it be in 30 minutes?",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="MEA-001-04-Q1" title="Read digital time" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>A</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>If the time is 2:45 PM, what time will it be in 30 minutes?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">3:15 PM</qti-simple-choice>
      <qti-simple-choice identifier="B">3:45 PM</qti-simple-choice>
      <qti-simple-choice identifier="C">2:75 PM</qti-simple-choice>
      <qti-simple-choice identifier="D">3:05 PM</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "PROFICIENT",
          correctAnswers: "A",
          estimatedTime: 30,
          tags: ["time", "elapsed-time", "digital"],
        },
      ],
    },
    // Measurement: Perimeter and Area
    {
      topicCode: "MEA-001-05",
      questions: [
        {
          title: "Calculate perimeter",
          questionText: "What is the perimeter of a rectangle with length 8 cm and width 5 cm?",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="MEA-001-05-Q1" title="Calculate perimeter" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>B</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>What is the perimeter of a rectangle with length 8 cm and width 5 cm?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">13 cm</qti-simple-choice>
      <qti-simple-choice identifier="B">26 cm</qti-simple-choice>
      <qti-simple-choice identifier="C">40 cm</qti-simple-choice>
      <qti-simple-choice identifier="D">21 cm</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "PROFICIENT",
          correctAnswers: "B",
          estimatedTime: 45,
          tags: ["perimeter", "rectangle", "measurement"],
        },
        {
          title: "Calculate area",
          questionText: "What is the area of a rectangle with length 6 cm and width 4 cm?",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="MEA-001-05-Q2" title="Calculate area" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>C</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>What is the area of a rectangle with length 6 cm and width 4 cm?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">10 cm²</qti-simple-choice>
      <qti-simple-choice identifier="B">20 cm²</qti-simple-choice>
      <qti-simple-choice identifier="C">24 cm²</qti-simple-choice>
      <qti-simple-choice identifier="D">64 cm²</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "PROFICIENT",
          correctAnswers: "C",
          estimatedTime: 45,
          tags: ["area", "rectangle", "measurement"],
        },
      ],
    },
    // Data Handling: Interpreting Data
    {
      topicCode: "DAT-001-03",
      questions: [
        {
          title: "Read a bar graph",
          questionText: "In a bar graph showing favorite fruits, if apples has a bar reaching 15 and oranges has a bar reaching 10, how many more students prefer apples?",
          qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="DAT-001-03-Q1" title="Read a bar graph" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>A</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>In a bar graph showing favorite fruits, if apples has a bar reaching 15 and oranges has a bar reaching 10, how many more students prefer apples?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
      <qti-simple-choice identifier="A">5</qti-simple-choice>
      <qti-simple-choice identifier="B">25</qti-simple-choice>
      <qti-simple-choice identifier="C">150</qti-simple-choice>
      <qti-simple-choice identifier="D">10</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
          type: "CHOICE",
          difficultyLevel: "DEVELOPING",
          correctAnswers: "A",
          estimatedTime: 30,
          tags: ["data", "bar-graph", "interpretation"],
        },
      ],
    },
  ];

  // Create questions and link to topics
  let questionCount = 0;
  for (const topicQuestions of questionsData) {
    const topic = questionsTopics.find((t) => t.code === topicQuestions.topicCode);
    if (!topic) {
      console.log(`   ⚠️ Topic not found: ${topicQuestions.topicCode}`);
      continue;
    }

    for (const qData of topicQuestions.questions) {
      const question = await prisma.question.upsert({
        where: {
          publicId: `${topicQuestions.topicCode}-Q${questionCount + 1}`,
        },
        update: {
          title: qData.title,
          questionText: qData.questionText,
          qtiXml: qData.qtiXml,
          type: qData.type,
          difficultyLevel: qData.difficultyLevel,
          correctAnswers: qData.correctAnswers,
          estimatedTime: qData.estimatedTime,
          tags: qData.tags,
          source: "TEACHER_CREATED",
          isActive: true,
          isReviewed: true,
          reviewedAt: new Date(),
        },
        create: {
          publicId: `${topicQuestions.topicCode}-Q${questionCount + 1}`,
          title: qData.title,
          questionText: qData.questionText,
          qtiXml: qData.qtiXml,
          type: qData.type,
          difficultyLevel: qData.difficultyLevel,
          correctAnswers: qData.correctAnswers,
          estimatedTime: qData.estimatedTime,
          tags: qData.tags,
          source: "TEACHER_CREATED",
          isActive: true,
          isReviewed: true,
          reviewedAt: new Date(),
        },
      });

      // Link question to topic
      await prisma.questionTopic.upsert({
        where: {
          questionId_topicId: {
            questionId: question.id,
            topicId: topic.id,
          },
        },
        update: {
          isPrimary: true,
        },
        create: {
          questionId: question.id,
          topicId: topic.id,
          isPrimary: true,
        },
      });

      questionCount++;
    }
  }
  console.log(`   ✅ Created ${questionCount} practice questions`);

  // ============================================================================
  // ASSESSMENT TEMPLATES
  // ============================================================================
  console.log("📋 Seeding assessment templates...");

  const assessmentTemplates = [
    {
      code: "quick-practice-5",
      name: "Quick Practice",
      description: "5 random questions to warm up",
      assessmentType: "QUIZ" as const,
      selectionStrategy: "RANDOM_FROM_POOL" as const,
      terminationCondition: "FIXED_COUNT" as const,
      questionLimit: 5,
      showFeedbackAfterEach: true,
      showCorrectAnswer: true,
      allowSkip: true,
      allowHints: true,
      isPublic: true,
    },
    {
      code: "full-assessment-20",
      name: "Full Assessment",
      description: "20 questions comprehensive assessment",
      assessmentType: "FIXED_ASSESSMENT" as const,
      selectionStrategy: "RANDOM_FROM_POOL" as const,
      terminationCondition: "FIXED_COUNT" as const,
      questionLimit: 20,
      timeLimitSeconds: 1800, // 30 minutes
      showFeedbackAfterEach: false,
      showCorrectAnswer: true,
      allowSkip: true,
      allowHints: false,
      isPublic: true,
    },
    {
      code: "puzzle-streak",
      name: "Puzzle Streak",
      description: "Keep your streak going! 3 mistakes and you're out.",
      assessmentType: "PUZZLE_STREAK" as const,
      selectionStrategy: "DIFFICULTY_LADDER" as const,
      terminationCondition: "ERROR_THRESHOLD" as const,
      errorThreshold: 3,
      startingLives: 3,
      showFeedbackAfterEach: true,
      showCorrectAnswer: true,
      allowSkip: false,
      allowHints: false,
      isRanked: true,
      isPublic: true,
    },
    {
      code: "adaptive-practice",
      name: "Adaptive Practice",
      description: "Questions adjust to your skill level",
      assessmentType: "ADAPTIVE_ASSESSMENT" as const,
      selectionStrategy: "ADAPTIVE_GLICKO" as const,
      terminationCondition: "FIXED_COUNT" as const,
      questionLimit: 10,
      showFeedbackAfterEach: true,
      showCorrectAnswer: true,
      allowSkip: false,
      allowHints: true,
      isPublic: true,
    },
  ];

  for (const template of assessmentTemplates) {
    await prisma.assessmentTemplate.upsert({
      where: { code: template.code },
      update: template,
      create: template,
    });
  }
  console.log(`   ✅ Created ${assessmentTemplates.length} assessment templates`);

  // Create a default learning path for Grade 4 Mathematics
  const defaultLearningPath = await prisma.learningPath.upsert({
    where: { id: `${grade4.id}-default-path` },
    update: {
      name: "Grade 4 Mathematics - Term 1-4",
      description: "Complete curriculum learning path following CAPS guidelines",
      isDefault: true,
    },
    create: {
      id: `${grade4.id}-default-path`,
      gradeLevelId: grade4.id,
      name: "Grade 4 Mathematics - Term 1-4",
      description: "Complete curriculum learning path following CAPS guidelines",
      isDefault: true,
    },
  });

  // Get all topics for this grade level in order
  const allTopics = await prisma.topic.findMany({
    where: { gradeLevelId: grade4.id, parentId: { not: null } },
    orderBy: [{ sortOrder: "asc" }],
  });

  // Create learning path items
  for (let i = 0; i < allTopics.length; i++) {
    const topic = allTopics[i];
    await prisma.learningPathItem.upsert({
      where: {
        learningPathId_topicId: {
          learningPathId: defaultLearningPath.id,
          topicId: topic.id,
        },
      },
      update: {
        sortOrder: i + 1,
        estimatedHours: topic.estimatedHours,
      },
      create: {
        learningPathId: defaultLearningPath.id,
        topicId: topic.id,
        sortOrder: i + 1,
        estimatedHours: topic.estimatedHours,
      },
    });
  }
  console.log(`   ✅ Created learning path with ${allTopics.length} items`);
  console.log("");

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Database seeded successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`   📛 Badges:       ${badges.length}`);
  console.log(`   🏆 Achievements: ${achievements.length}`);
  console.log(`   🎨 Cosmetics:    ${cosmetics.length}`);
  console.log(`   📚 Topics:       ${topicCount}`);
  console.log(`   🗺️  Learning Path: Grade 4 Mathematics (${allTopics.length} items)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
