/**
 * progressionEngine.js
 * =====================
 * Core game logic for computing kingdom/level/sanity check unlock states,
 * awarding XP, checking achievements, and computing player level.
 *
 * This module is PURE (no React, no side effects) so it can be
 * tested independently and used anywhere in the app.
 */

import { KINGDOMS } from '../data/kingdomsData.js';
import { ACHIEVEMENTS } from '../data/playerDefaults.js';

// ─── Player level thresholds (XP required to reach each player level) ──────
const PLAYER_LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250, 2800];

/**
 * Compute the player's display level (1-indexed) from total XP.
 */
export function computePlayerLevel(totalXP) {
  let level = 1;
  for (let i = 0; i < PLAYER_LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= PLAYER_LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

/**
 * Compute XP progress toward the next player level.
 * Returns { current, required, percent }
 */
export function computeLevelProgress(totalXP) {
  const level = computePlayerLevel(totalXP);
  const currentThreshold = PLAYER_LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = PLAYER_LEVEL_THRESHOLDS[level] ?? currentThreshold + 500;
  const current = totalXP - currentThreshold;
  const required = nextThreshold - currentThreshold;
  return { current, required, percent: Math.min(100, Math.round((current / required) * 100)) };
}

/**
 * Get the total XP a player has earned specifically within a kingdom
 * (from levels + sanity checks).
 */
export function getKingdomXP(player, kingdomId) {
  const kingdom = KINGDOMS.find((k) => k.id === kingdomId);
  if (!kingdom) return 0;

  // Level XP
  const levelXP = kingdom.levels.reduce((sum, level) => {
    return sum + (player.levelProgress?.[level.id]?.xpEarned ?? 0);
  }, 0);

  // Sanity Checks XP
  const sanityXP = (kingdom.sanityChecks || []).reduce((sum, check) => {
    return sum + (player.sanityCheckProgress?.[check.id]?.score ?? 0);
  }, 0);

  return levelXP + sanityXP;
}

/**
 * Get all sanity checks defined for a kingdom.
 */
export function getKingdomSanityChecks(kingdomId) {
  const kingdom = KINGDOMS.find((k) => k.id === kingdomId);
  return kingdom?.sanityChecks || [];
}

/**
 * Check if a specific sanity check has passed.
 */
export function isSanityCheckPassed(player, checkId) {
  return Boolean(player.sanityCheckProgress?.[checkId]?.passed);
}

/**
 * Count how many sanity checks have passed in a kingdom.
 */
export function countPassedKingdomSanityChecks(player, kingdomId) {
  const checks = getKingdomSanityChecks(kingdomId);
  return checks.filter((c) => isSanityCheckPassed(player, c.id)).length;
}

/**
 * Check if ALL sanity checks in a kingdom are passed.
 * Returns true if the kingdom has no sanity checks (e.g. RTL, Synthesis).
 */
export function areAllKingdomSanityChecksPassed(player, kingdomId) {
  const checks = getKingdomSanityChecks(kingdomId);
  if (!checks.length) return true;
  return checks.every((c) => isSanityCheckPassed(player, c.id));
}

/**
 * Determine if all main levels of a kingdom are completed.
 */
export function areAllKingdomLevelsCompleted(player, kingdomId) {
  const kingdom = KINGDOMS.find((k) => k.id === kingdomId);
  if (!kingdom) return false;
  return kingdom.levels.every((l) => player.levelProgress?.[l.id]?.completed);
}

/**
 * Check if a sanity check is unlocked and ready to be run.
 * Rules:
 * - The parent kingdom must be unlocked.
 * - All main levels of this kingdom must be completed (or at least kingdom XP >= pointsToUnlockNext).
 * - For order === 1: Available once kingdom levels are completed!
 * - For order > 1: Available when the previous sanity check in that kingdom has passed.
 */
export function isSanityCheckUnlocked(player, kingdomId, check) {
  if (!isKingdomUnlocked(player, kingdomId)) return false;

  const kingdom = KINGDOMS.find((k) => k.id === kingdomId);
  if (!kingdom) return false;

  // Levels must be completed to begin sign-off sanity checks
  const levelsDone = areAllKingdomLevelsCompleted(player, kingdomId);
  if (!levelsDone) return false;

  // First check unlocks as soon as levels are done
  if (check.order === 1) return true;

  // Subsequent check requires previous check in the kingdom to be passed
  const prevCheck = kingdom.sanityChecks.find((c) => c.order === check.order - 1);
  if (!prevCheck) return true;
  return isSanityCheckPassed(player, prevCheck.id);
}

/**
 * Get status of a sanity check: 'locked' | 'available' | 'passed'
 */
export function getSanityCheckStatus(player, kingdomId, check) {
  if (isSanityCheckPassed(player, check.id)) return 'passed';
  if (isSanityCheckUnlocked(player, kingdomId, check)) return 'available';
  return 'locked';
}

/**
 * Determine if a specific kingdom is unlocked for the player.
 * Kingdom 1 is always unlocked.
 * Kingdom N is unlocked when:
 * 1. Previous kingdom's levels are completed.
 * 2. Previous kingdom's XP >= its pointsToUnlockNext.
 * 3. ALL sanity checks (side quests) in the previous kingdom are passed!
 */
export function isKingdomUnlocked(player, kingdomId) {
  const kingdom = KINGDOMS.find((k) => k.id === kingdomId);
  if (!kingdom) return false;
  if (kingdom.order === 1) return true;

  const prevKingdom = KINGDOMS.find((k) => k.order === kingdom.order - 1);
  if (!prevKingdom) return false;

  // 1. Levels must be completed in previous kingdom
  const prevLevelsCompleted = areAllKingdomLevelsCompleted(player, prevKingdom.id);
  if (!prevLevelsCompleted) return false;

  // 2. XP threshold in previous kingdom
  const prevKingdomXP = getKingdomXP(player, prevKingdom.id);
  if (prevKingdomXP < prevKingdom.pointsToUnlockNext) return false;

  // 3. All sanity checks in previous kingdom must be passed
  const prevSanityPassed = areAllKingdomSanityChecksPassed(player, prevKingdom.id);
  if (!prevSanityPassed) return false;

  return true;
}

/**
 * Determine if a kingdom is completely finished (all levels done AND all sanity checks passed).
 */
export function isKingdomCompleted(player, kingdomId) {
  const levelsDone = areAllKingdomLevelsCompleted(player, kingdomId);
  const sanityDone = areAllKingdomSanityChecksPassed(player, kingdomId);
  return levelsDone && sanityDone;
}

/**
 * Get the status of a kingdom: 'locked' | 'available' | 'completed'
 */
export function getKingdomStatus(player, kingdomId) {
  if (!isKingdomUnlocked(player, kingdomId)) return 'locked';
  if (isKingdomCompleted(player, kingdomId)) return 'completed';
  return 'available';
}

/**
 * Determine if a level is unlocked.
 * Level 1 of a kingdom unlocks when the kingdom is unlocked AND the level's
 * pointsRequired is met from within that kingdom.
 * Subsequent levels also require the previous level to be completed.
 */
export function isLevelUnlocked(player, kingdom, level) {
  if (!isKingdomUnlocked(player, kingdom.id)) return false;

  const kingdomXP = getKingdomXP(player, kingdom.id);
  if (kingdomXP < level.pointsRequired) return false;

  if (level.order === 1) return true;

  const prevLevel = kingdom.levels.find((l) => l.order === level.order - 1);
  if (!prevLevel) return true;
  return player.levelProgress?.[prevLevel.id]?.completed ?? false;
}

/**
 * Determine if a level is completed.
 */
export function isLevelCompleted(player, levelId) {
  return player.levelProgress?.[levelId]?.completed ?? false;
}

/**
 * Get status of a level: 'locked' | 'available' | 'completed'
 */
export function getLevelStatus(player, kingdom, level) {
  if (!isLevelUnlocked(player, kingdom, level)) return 'locked';
  if (isLevelCompleted(player, level.id)) return 'completed';
  return 'available';
}

/**
 * Compute how many stars to award based on XP score.
 */
export function computeStars(score, thresholds) {
  if (score >= thresholds[2]) return 3;
  if (score >= thresholds[1]) return 2;
  if (score >= thresholds[0]) return 1;
  return 0;
}

/**
 * Apply level completion to player state.
 */
export function applyLevelCompletion(player, kingdomId, level, score) {
  const kingdom = KINGDOMS.find((k) => k.id === kingdomId);
  const stars = computeStars(score, level.starThresholds);
  const xpEarned = Math.min(score, level.xpReward);

  const existingProgress = player.levelProgress?.[level.id];
  const previousXP = existingProgress?.xpEarned ?? 0;
  const xpDelta = Math.max(0, xpEarned - previousXP);

  const updatedLevelProgress = {
    ...player.levelProgress,
    [level.id]: {
      completed: true,
      stars: Math.max(stars, existingProgress?.stars ?? 0),
      xpEarned: Math.max(xpEarned, previousXP),
    },
  };

  const updatedTotalXP = player.totalXP + xpDelta;

  // Check if all levels in kingdom are completed
  const allLevelsCompleted = kingdom.levels.every(
    (l) => updatedLevelProgress[l.id]?.completed
  );

  const allSanityPassed = areAllKingdomSanityChecksPassed(
    { ...player, levelProgress: updatedLevelProgress },
    kingdomId
  );

  let kingdomXPBonus = 0;
  const prevKingdomCompleted = player.kingdomProgress?.[kingdomId]?.completed;
  if (allLevelsCompleted && allSanityPassed && !prevKingdomCompleted) {
    kingdomXPBonus = 50; // bonus XP for full kingdom completion
  }

  const updatedKingdomProgress = {
    ...player.kingdomProgress,
    [kingdomId]: {
      completed: allLevelsCompleted && allSanityPassed,
      totalXP: (player.kingdomProgress?.[kingdomId]?.totalXP ?? 0) + xpDelta + kingdomXPBonus,
    },
  };

  const finalTotalXP = updatedTotalXP + kingdomXPBonus;

  const updatedPlayer = {
    ...player,
    totalXP: finalTotalXP,
    levelProgress: updatedLevelProgress,
    kingdomProgress: updatedKingdomProgress,
    lastPlayedAt: new Date().toISOString(),
  };

  const newAchievements = checkAchievements(updatedPlayer);
  return { ...updatedPlayer, achievements: newAchievements };
}

/**
 * Apply sanity check completion to player state.
 */
export function applySanityCheckCompletion(player, kingdomId, check, score = 25) {
  const existing = player.sanityCheckProgress?.[check.id];
  if (existing?.passed) return player; // Already passed

  const updatedSanityProgress = {
    ...player.sanityCheckProgress,
    [check.id]: {
      passed: true,
      score,
      completedAt: new Date().toISOString(),
    },
  };

  const updatedTotalXP = player.totalXP + score;

  // Check if all sanity checks in this kingdom are now passed
  const kingdom = KINGDOMS.find((k) => k.id === kingdomId);
  const allSanityPassed = (kingdom?.sanityChecks || []).every(
    (c) => updatedSanityProgress[c.id]?.passed
  );
  const allLevelsDone = areAllKingdomLevelsCompleted(player, kingdomId);

  let bonusXP = 0;
  if (allSanityPassed && allLevelsDone && !player.kingdomProgress?.[kingdomId]?.completed) {
    bonusXP = 50; // Bonus for full sign-off
  }

  const updatedKingdomProgress = {
    ...player.kingdomProgress,
    [kingdomId]: {
      completed: allLevelsDone && allSanityPassed,
      totalXP: (player.kingdomProgress?.[kingdomId]?.totalXP ?? 0) + score + bonusXP,
    },
  };

  const updatedPlayer = {
    ...player,
    totalXP: updatedTotalXP + bonusXP,
    sanityCheckProgress: updatedSanityProgress,
    kingdomProgress: updatedKingdomProgress,
    lastPlayedAt: new Date().toISOString(),
  };

  const newAchievements = checkAchievements(updatedPlayer);
  return { ...updatedPlayer, achievements: newAchievements };
}

/**
 * Check all achievement conditions and return full list of earned achievement IDs.
 */
export function checkAchievements(player) {
  const earned = new Set(player.achievements || []);
  ACHIEVEMENTS.forEach((ach) => {
    if (!earned.has(ach.id) && ach.condition(player)) {
      earned.add(ach.id);
    }
  });
  return Array.from(earned);
}

/**
 * Compute overall platform progress percentage.
 */
export function computeOverallProgress(player) {
  const totalLevels = KINGDOMS.reduce((sum, k) => sum + k.levels.length, 0);
  const totalChecks = countTotalSanityChecks();
  const totalItems = totalLevels + totalChecks;

  const completedLevels = Object.values(player.levelProgress || {}).filter((lp) => lp.completed).length;
  const completedChecks = Object.values(player.sanityCheckProgress || {}).filter((sc) => sc.passed).length;

  return totalItems === 0 ? 0 : Math.round(((completedLevels + completedChecks) / totalItems) * 100);
}

/**
 * Count kingdoms unlocked for the player.
 */
export function countKingdomsUnlocked(player) {
  return KINGDOMS.filter((k) => isKingdomUnlocked(player, k.id)).length;
}

/**
 * Count total levels completed.
 */
export function countLevelsCompleted(player) {
  return Object.values(player.levelProgress || {}).filter((lp) => lp.completed).length;
}

/**
 * Count total sanity checks defined across all kingdoms.
 */
export function countTotalSanityChecks() {
  return KINGDOMS.reduce((sum, k) => sum + (k.sanityChecks?.length || 0), 0);
}

/**
 * Count total sanity checks passed by player.
 */
export function countTotalSanityChecksPassed(player) {
  return Object.values(player.sanityCheckProgress || {}).filter((c) => c.passed).length;
}
