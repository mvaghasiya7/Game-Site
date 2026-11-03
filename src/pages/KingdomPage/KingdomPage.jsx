/**
 * KingdomPage.jsx
 * ================
 * Reusable kingdom page template — driven entirely by kingdomsData.js.
 * Renders any kingdom based on the :kingdomId URL parameter.
 * Features:
 * - Kingdom Hero & Stats
 * - Main Concept Levels
 * - Stage Sanity Check Side Quests (Gatekeeper to unlock next kingdom)
 * - Interactive Sanity Check Verification Terminal Modal
 */

import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext.jsx';
import LevelCard from '../../components/LevelCard/LevelCard.jsx';
import {
  getKingdomStatus,
  getKingdomXP,
  isKingdomUnlocked,
  getKingdomSanityChecks,
  countPassedKingdomSanityChecks,
  areAllKingdomLevelsCompleted,
  areAllKingdomSanityChecksPassed,
  getSanityCheckStatus,
  isSanityCheckUnlocked,
  isSanityCheckPassed,
} from '../../logic/progressionEngine.js';
import { KINGDOMS } from '../../data/kingdomsData.js';
import './KingdomPage.css';

export default function KingdomPage() {
  const { kingdomId } = useParams();
  const { player, passSanityCheck } = usePlayer();
  const [activeCheck, setActiveCheck] = useState(null);
  const [runningSimulation, setRunningSimulation] = useState(false);
  const [simulationDone, setSimulationDone] = useState(false);

  // Find kingdom by ID from central data
  const kingdom = KINGDOMS.find((k) => k.id === kingdomId);

  // 404 → redirect to world map
  if (!kingdom) return <Navigate to="/world-map" replace />;

  const status = getKingdomStatus(player, kingdomId);
  const unlocked = isKingdomUnlocked(player, kingdomId);
  const kingdomXP = getKingdomXP(player, kingdomId);

  // Levels info
  const completedLevels = kingdom.levels.filter(
    (l) => player.levelProgress?.[l.id]?.completed
  ).length;
  const levelsDone = areAllKingdomLevelsCompleted(player, kingdomId);

  // Sanity checks info
  const sanityChecks = getKingdomSanityChecks(kingdomId);
  const totalSanity = sanityChecks.length;
  const passedSanity = countPassedKingdomSanityChecks(player, kingdomId);
  const allSanityPassed = areAllKingdomSanityChecksPassed(player, kingdomId);

  // Total weighted progress
  const totalItems = kingdom.levels.length + totalSanity;
  const completedItems = completedLevels + passedSanity;
  const progressPercent = Math.round((completedItems / totalItems) * 100);

  // Next kingdom info
  const nextKingdom = KINGDOMS.find((k) => k.order === kingdom.order + 1);
  const prevKingdom = KINGDOMS.find((k) => k.order === kingdom.order - 1);
  const prevKingdomXP = prevKingdom ? getKingdomXP(player, prevKingdom.id) : 0;
  const xpNeeded = prevKingdom
    ? Math.max(0, prevKingdom.pointsToUnlockNext - prevKingdomXP)
    : 0;

  // Open interactive verification modal
  const handleOpenCheck = (check) => {
    setActiveCheck(check);
    setRunningSimulation(false);
    setSimulationDone(isSanityCheckPassed(player, check.id));
  };

  // Run EDA verification simulation
  const handleRunSimulation = () => {
    setRunningSimulation(true);
    setTimeout(() => {
      setRunningSimulation(false);
      setSimulationDone(true);
    }, 1100);
  };

  // Pass and sign off check
  const handlePassCheck = () => {
    if (!activeCheck) return;
    passSanityCheck(kingdom.id, activeCheck, activeCheck.xpReward);
  };

  return (
    <div
      className="kingdom-page"
      style={{
        '--kingdom-gradient': kingdom.gradient,
        '--kingdom-color': kingdom.borderColor,
      }}
    >
      {/* Hero banner */}
      <div className="kingdom-page__hero">
        <div className="container kingdom-page__hero-inner">
          {/* Back button */}
          <Link to="/world-map" className="kingdom-page__back">
            ← Back to World Map
          </Link>

          <div className="kingdom-page__header">
            {/* Kingdom emoji */}
            <div className="kingdom-page__emoji-box">{kingdom.emoji}</div>

            <div style={{ flex: 1 }}>
              {/* Status badge */}
              <div style={{ marginBottom: '0.4rem' }}>
                {status === 'locked' && <span className="badge badge--locked">🔒 Locked</span>}
                {status === 'available' && <span className="badge badge--available">▶ In Progress</span>}
                {status === 'completed' && <span className="badge badge--completed">✓ Stage Certified</span>}
              </div>

              <h1 className="kingdom-page__title">{kingdom.name}</h1>
              <p className="kingdom-page__subtitle">{kingdom.subtitle}</p>
              <p className="kingdom-page__description">{kingdom.description}</p>

              {/* Subconcept chip */}
              <div className="kingdom-page__subconcept">
                🎯 Focus: {kingdom.subconcept}
              </div>

              {/* Stats */}
              {unlocked && (
                <div className="kingdom-page__stats">
                  <div className="kingdom-page__stat">
                    <span className="kingdom-page__stat-value">{completedLevels}/{kingdom.levels.length}</span>
                    <span className="kingdom-page__stat-label">Levels Done</span>
                  </div>
                  {totalSanity > 0 && (
                    <div className="kingdom-page__stat">
                      <span className="kingdom-page__stat-value">{passedSanity}/{totalSanity}</span>
                      <span className="kingdom-page__stat-label">Side Quests</span>
                    </div>
                  )}
                  <div className="kingdom-page__stat">
                    <span className="kingdom-page__stat-value">{kingdomXP}</span>
                    <span className="kingdom-page__stat-label">XP Earned</span>
                  </div>
                  {kingdom.pointsToUnlockNext > 0 && (
                    <div className="kingdom-page__stat">
                      <span className="kingdom-page__stat-value">{kingdom.pointsToUnlockNext}</span>
                      <span className="kingdom-page__stat-label">Min XP for Next</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* ─── LOCKED STATE ─────────────────────────────── */}
        {!unlocked ? (
          <div className="kingdom-page__locked-banner">
            <span className="kingdom-page__locked-icon">🔒</span>
            <h2 className="kingdom-page__locked-title">Kingdom Locked</h2>
            <p className="kingdom-page__locked-desc">
              {prevKingdom
                ? `Complete all levels and pass all sanity check side quests in "${prevKingdom.name}" to unlock this kingdom.`
                : 'Complete the previous kingdom to unlock this one.'}
            </p>
            <Link to="/world-map" className="btn btn--primary">
              ← Back to World Map
            </Link>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="kingdom-page__progress-section">
              <div className="kingdom-page__progress-header">
                <h2 style={{ fontSize: '1.1rem' }}>Stage Progress</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {progressPercent}% complete ({completedItems}/{totalItems} tasks)
                </span>
              </div>
              <div className="progress-bar" style={{ height: '12px' }}>
                <div
                  className={`progress-bar__fill ${status === 'completed' ? 'progress-bar__fill--green' : ''}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Stage sign-off gatekeeper info */}
              {totalSanity > 0 && (
                <div className="kingdom-page__gatekeeper-note">
                  <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                  <div>
                    <strong>Sign-Off Gatekeeper:</strong> Pass all {totalSanity} Sanity Check side quests in sequence
                    to certify the {kingdom.name} stage and unlock {nextKingdom?.name || 'the next kingdom'}.
                  </div>
                </div>
              )}
            </div>

            {/* ─── MAIN LEVELS SECTION ──────────────────────── */}
            <div className="kingdom-page__section-wrapper">
              <div className="kingdom-page__section-title-row">
                <h2 className="kingdom-page__levels-title">
                  📚 Part 1: Core Concept Levels
                </h2>
                <span className="badge badge--available">
                  {completedLevels}/{kingdom.levels.length} Complete
                </span>
              </div>

              <div className="kingdom-page__levels-list">
                {kingdom.levels.map((level) => (
                  <LevelCard key={level.id} kingdom={kingdom} level={level} />
                ))}
              </div>
            </div>

            {/* ─── SANITY CHECK SIDE QUESTS SECTION ─────────── */}
            {totalSanity > 0 && (
              <div className="kingdom-page__sanity-section">
                <div className="kingdom-page__section-title-row">
                  <div>
                    <h2 className="kingdom-page__sanity-title">
                      🛡️ Part 2: Stage Sanity Checks (Side Quests)
                    </h2>
                    <p className="kingdom-page__sanity-subtitle">
                      Complete each verification audit in order before advancing to the next kingdom.
                    </p>
                  </div>
                  <span className={`badge ${allSanityPassed ? 'badge--completed' : 'badge--available'}`}>
                    {allSanityPassed ? '✓ All Passed' : `${passedSanity}/${totalSanity} Passed`}
                  </span>
                </div>

                {!levelsDone && (
                  <div className="kingdom-page__sanity-locked-alert">
                    <span>🔒</span>
                    <div>
                      <strong>Sanity Checks are on standby:</strong> Finish all {kingdom.levels.length} core levels
                      above to generate the design database and activate these sign-off side quests!
                    </div>
                  </div>
                )}

                <div className="kingdom-page__sanity-grid">
                  {sanityChecks.map((check) => {
                    const checkStatus = getSanityCheckStatus(player, kingdom.id, check);
                    const isPassed = checkStatus === 'passed';
                    const isUnlocked = checkStatus === 'available';

                    return (
                      <div
                        key={check.id}
                        className={`sanity-quest-card sanity-quest-card--${checkStatus}`}
                        onClick={() => !checkStatus.startsWith('locked') && handleOpenCheck(check)}
                      >
                        <div className="sanity-quest-card__top">
                          <span className="sanity-quest-card__order">#{check.order}</span>
                          <span className="sanity-quest-card__emoji">{check.emoji}</span>
                          <span className="sanity-quest-card__category">{check.category}</span>
                        </div>

                        <h3 className="sanity-quest-card__name">{check.name}</h3>
                        <div className="sanity-quest-card__fullname">{check.fullName}</div>
                        <p className="sanity-quest-card__desc">{check.description}</p>

                        <div className="sanity-quest-card__footer">
                          {isPassed ? (
                            <span className="badge badge--completed">✅ Passed (+{check.xpReward} XP)</span>
                          ) : isUnlocked ? (
                            <button
                              className="btn btn--primary btn--sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCheck(check);
                              }}
                            >
                              ▶ Run Check (+{check.xpReward} XP)
                            </button>
                          ) : (
                            <span className="badge badge--locked">🔒 Locked</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── NEXT KINGDOM READY BANNER ─────────────────── */}
            {allSanityPassed && levelsDone && nextKingdom && (
              <div className="kingdom-page__next-banner">
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: '#047857', marginBottom: '0.25rem' }}>
                    {kingdom.name} Stage Signed Off!
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    All core levels completed and all {totalSanity} sanity checks verified with 0 violations.
                    {nextKingdom.name} is now open for exploration!
                  </p>
                </div>
                <Link to={`/kingdom/${nextKingdom.id}`} className="btn btn--primary btn--lg">
                  🏰 Enter {nextKingdom.name} →
                </Link>
              </div>
            )}

            {/* Subconcept description */}
            <div className="card" style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                🎯 About {kingdom.name} Physical Design Focus
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                {kingdom.subconcept_description}
              </p>
              <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                Interactive visual editors, detailed ruledecks, and EDA sandbox tools will be added in Phase 2.
              </p>
            </div>
          </>
        )}
      </div>

      {/* ─── SANITY CHECK TERMINAL MODAL ────────────────── */}
      {activeCheck && (
        <div className="sanity-modal-overlay" onClick={() => setActiveCheck(null)}>
          <div className="sanity-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sanity-modal__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.8rem' }}>{activeCheck.emoji}</span>
                <div>
                  <h2 style={{ fontSize: '1.3rem', margin: 0 }}>
                    Sanity Check: {activeCheck.name}
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {kingdom.name} · Step #{activeCheck.order} · {activeCheck.category}
                  </span>
                </div>
              </div>
              <button
                className="sanity-modal__close"
                onClick={() => setActiveCheck(null)}
              >
                ✕
              </button>
            </div>

            <div className="sanity-modal__body">
              <p style={{ color: '#475569', fontSize: '0.92rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                {activeCheck.description}
              </p>

              {/* Simulated EDA Terminal */}
              <div className="sanity-terminal">
                <div className="sanity-terminal__titlebar">
                  <span className="sanity-terminal__dot sanity-terminal__dot--red" />
                  <span className="sanity-terminal__dot sanity-terminal__dot--yellow" />
                  <span className="sanity-terminal__dot sanity-terminal__dot--green" />
                  <span className="sanity-terminal__title">EDA Sign-Off Terminal — {activeCheck.fullName}</span>
                </div>
                <div className="sanity-terminal__content">
                  <div className="sanity-terminal__line">
                    <span className="sanity-terminal__prompt">$</span> {activeCheck.command}
                  </div>

                  {runningSimulation && (
                    <div className="sanity-terminal__line sanity-terminal__line--amber">
                      [EXEC] Running design rule engine on database... please wait...
                    </div>
                  )}

                  {simulationDone && (
                    <>
                      <div className="sanity-terminal__line sanity-terminal__line--dim">
                        [INIT] Loading stage technology rules and constraints... [OK]
                      </div>
                      <div className="sanity-terminal__line sanity-terminal__line--dim">
                        [SCAN] Inspecting {kingdom.name} layer geometries & netlist... [DONE]
                      </div>
                      <div className="sanity-terminal__line sanity-terminal__line--green">
                        [CRITERIA] {activeCheck.criteria}
                      </div>
                      <div className="sanity-terminal__line sanity-terminal__line--bright-green">
                        [VERIFY] PASSED — 0 violations found. Database certified clean!
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="sanity-modal__actions">
                {isSanityCheckPassed(player, activeCheck.id) ? (
                  <div className="sanity-modal__passed-notice">
                    ✅ This sanity check is certified and passed! (+{activeCheck.xpReward} XP earned)
                  </div>
                ) : !simulationDone ? (
                  <button
                    className="btn btn--secondary btn--lg w-full"
                    onClick={handleRunSimulation}
                    disabled={runningSimulation}
                  >
                    {runningSimulation ? '⏳ Running Ruledeck Verification...' : '⚡ Run Verification Check'}
                  </button>
                ) : (
                  <button
                    className="btn btn--success btn--lg w-full"
                    onClick={() => {
                      handlePassCheck();
                      setActiveCheck(null);
                    }}
                  >
                    ✅ Sign-Off & Pass Check (+{activeCheck.xpReward} XP)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
