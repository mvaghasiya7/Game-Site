/**
 * PlayerContext.jsx
 * ==================
 * Global React context for player state.
 * Handles loading/saving to localStorage for persistence.
 * All game state mutations go through this context.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { DEFAULT_PLAYER } from '../data/playerDefaults.js';
import {
  applyLevelCompletion,
  applySanityCheckCompletion,
} from '../logic/progressionEngine.js';

const STORAGE_KEY = 'pdplayground_player_v1';

// ─── Context ────────────────────────────────────────────────────────────────
const PlayerContext = createContext(null);

// ─── Reducer ────────────────────────────────────────────────────────────────
function playerReducer(state, action) {
  switch (action.type) {
    case 'LOAD_PLAYER':
      return {
        ...DEFAULT_PLAYER,
        ...action.payload,
        sanityCheckProgress: action.payload.sanityCheckProgress || {},
      };

    case 'SET_NAME':
      return { ...state, name: action.payload };

    case 'COMPLETE_LEVEL': {
      const { kingdomId, level, score } = action.payload;
      return applyLevelCompletion(state, kingdomId, level, score);
    }

    case 'PASS_SANITY_CHECK': {
      const { kingdomId, check, score } = action.payload;
      return applySanityCheckCompletion(state, kingdomId, check, score);
    }

    case 'RESET_PROGRESS':
      return {
        ...DEFAULT_PLAYER,
        name: state.name,
        avatarEmoji: state.avatarEmoji,
        createdAt: new Date().toISOString(),
      };

    case 'SET_AVATAR':
      return { ...state, avatarEmoji: action.payload };

    default:
      return state;
  }
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function PlayerProvider({ children }) {
  const [player, dispatch] = useReducer(playerReducer, {
    ...DEFAULT_PLAYER,
    createdAt: new Date().toISOString(),
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        dispatch({ type: 'LOAD_PLAYER', payload: saved });
      }
    } catch (e) {
      console.warn('Failed to load player progress:', e);
    }
  }, []);

  // Save to localStorage whenever player changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    } catch (e) {
      console.warn('Failed to save player progress:', e);
    }
  }, [player]);

  const completeLevel = useCallback((kingdomId, level, score) => {
    dispatch({ type: 'COMPLETE_LEVEL', payload: { kingdomId, level, score } });
  }, []);

  const passSanityCheck = useCallback((kingdomId, check, score = 25) => {
    dispatch({ type: 'PASS_SANITY_CHECK', payload: { kingdomId, check, score } });
  }, []);

  const resetProgress = useCallback(() => {
    dispatch({ type: 'RESET_PROGRESS' });
  }, []);

  const setPlayerName = useCallback((name) => {
    dispatch({ type: 'SET_NAME', payload: name });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        player,
        completeLevel,
        passSanityCheck,
        resetProgress,
        setPlayerName,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────
export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
}
