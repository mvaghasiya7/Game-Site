/**
 * activityRegistry.js — Scoped for RTL Understanding
 */
import RTLMuxChallenge from './rtl/RTLMuxChallenge.jsx';
import { validateMuxChallenge } from './rtl/validators/validateMuxChallenge.js';
import RTLDFFChallenge from './rtl/RTLDFFChallenge.jsx';
import { validateDFFChallenge } from './rtl/validators/validateDFFChallenge.js';
import RTLCombSeqChallenge from './rtl/RTLCombSeqChallenge.jsx';
import { validateCombSeqChallenge } from './rtl/validators/validateCombSeqChallenge.js';
import RTLAccumulatorChallenge from './rtl/RTLAccumulatorChallenge.jsx';
import { validateAccumulatorChallenge } from './rtl/validators/validateAccumulatorChallenge.js';
import RTLFSMChallenge from './rtl/RTLFSMChallenge.jsx';
import { validateFSMChallenge } from './rtl/validators/validateFSMChallenge.js';

export const ACTIVITY_REGISTRY = {
  'rtl-1': {
    levelId: 'rtl-1',
    kingdomId: 'rtl-understanding',
    title: '2:1 Multiplexer — The Core of RTL Dataflow Steering',
    component: RTLMuxChallenge,
    validator: validateMuxChallenge,
  },
  'rtl-2': {
    levelId: 'rtl-2',
    kingdomId: 'rtl-understanding',
    title: 'D Flip-Flop & Sequential Storage Primitives',
    component: RTLDFFChallenge,
    validator: validateDFFChallenge,
  },
  'rtl-3': {
    levelId: 'rtl-3',
    kingdomId: 'rtl-understanding',
    title: 'Combinational Logic vs. Sequential Storage',
    component: RTLCombSeqChallenge,
    validator: validateCombSeqChallenge,
  },
  'rtl-4': {
    levelId: 'rtl-4',
    kingdomId: 'rtl-understanding',
    title: 'Pipelined Accumulator & Arithmetic Datapath',
    component: RTLAccumulatorChallenge,
    validator: validateAccumulatorChallenge,
  },
  'rtl-5': {
    levelId: 'rtl-5',
    kingdomId: 'rtl-understanding',
    title: 'RTL Kingdom Capstone — 1011 Sequence Detector FSM',
    component: RTLFSMChallenge,
    validator: validateFSMChallenge,
  },
};

export function hasActivity(levelId) {
  return Boolean(ACTIVITY_REGISTRY[levelId]);
}

export function getActivity(levelId) {
  return ACTIVITY_REGISTRY[levelId] || null;
}

export function getActivityConfig(levelId) {
  return ACTIVITY_REGISTRY[levelId] || null;
}
