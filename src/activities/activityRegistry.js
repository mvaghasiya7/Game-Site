/**
 * activityRegistry.js — Scoped for Floorplanning
 */
import FPExpandedLessonChallenge from './floorplanning/expanded/FPExpandedLessonChallenge.jsx';
import { EXPANDED_LESSONS } from './floorplanning/expanded/fpExpandedCurriculumData.js';
import FPIntroChallenge from './floorplanning/FPIntroChallenge.jsx';
import { validateFPIntro } from './floorplanning/validators/validateFPIntro.js';
import FPGeometryChallenge from './floorplanning/FPGeometryChallenge.jsx';
import { validateFPGeometry } from './floorplanning/validators/validateFPGeometry.js';
import FPPinPlacementChallenge from './floorplanning/FPPinPlacementChallenge.jsx';
import { validateFPPinPlacement } from './floorplanning/validators/validateFPPinPlacement.js';
import FPMacroPlacementChallenge from './floorplanning/FPMacroPlacementChallenge.jsx';
import { validateFPMacroPlacement } from './floorplanning/validators/validateFPMacroPlacement.js';
import FPKingdomChallenge from './floorplanning/FPKingdomChallenge.jsx';
import { validateFPKingdom } from './floorplanning/validators/validateFPKingdom.js';

export const ACTIVITY_REGISTRY = {
  'fp-1': {
    levelId: 'fp-1',
    kingdomId: 'floorplanning',
    title: 'Introduction to Floorplanning — Die, Core, and Power Grid',
    component: FPIntroChallenge,
    validator: validateFPIntro,
  },
  'fp-2': {
    levelId: 'fp-2',
    kingdomId: 'floorplanning',
    title: 'Core Utilization & Aspect Ratio Geometry',
    component: FPGeometryChallenge,
    validator: validateFPGeometry,
  },
  'fp-3': {
    levelId: 'fp-3',
    kingdomId: 'floorplanning',
    title: 'I/O Pin Placement & Ring Design',
    component: FPPinPlacementChallenge,
    validator: validateFPPinPlacement,
  },
  'fp-4': {
    levelId: 'fp-4',
    kingdomId: 'floorplanning',
    title: 'Macro Placement & Halo Clearances',
    component: FPMacroPlacementChallenge,
    validator: validateFPMacroPlacement,
  },
  'fp-5': {
    levelId: 'fp-5',
    kingdomId: 'floorplanning',
    title: 'Floorplanning Kingdom Capstone — Complete Floorplan Strategy',
    component: FPKingdomChallenge,
    validator: validateFPKingdom,
  },
};

// Register all expanded FP lessons (fp-6 through fp-36)
Object.entries(EXPANDED_LESSONS).forEach(([id, lesson]) => {
  ACTIVITY_REGISTRY[id] = {
    levelId: id,
    kingdomId: 'floorplanning',
    title: `${lesson.title} — ${lesson.moduleTitle}`,
    component: FPExpandedLessonChallenge,
    validator: lesson.validate,
    maxScore: lesson.xpReward,
    starThresholds: lesson.starThresholds,
    isExpanded: true,
  };
});

export function hasActivity(levelId) {
  return Boolean(ACTIVITY_REGISTRY[levelId]);
}

export function getActivity(levelId) {
  return ACTIVITY_REGISTRY[levelId] || null;
}

export function getActivityConfig(levelId) {
  return ACTIVITY_REGISTRY[levelId] || null;
}
