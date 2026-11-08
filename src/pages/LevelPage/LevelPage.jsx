/**
 * LevelPage.jsx
 * ==============
 * Reusable level learning template.
 * Streamlined single-view structure without sub-section tabs for Phase 1.
 *
 * Data-driven: reads kingdom + level from URL params and kingdomsData.js.
 * Actual educational content will be injected in Phase 2.
 */

import React, { useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext.jsx';
import {
  getLevelStatus,
  isLevelUnlocked,
  computeStars,
} from '../../logic/progressionEngine.js';
import { KINGDOMS } from '../../data/kingdomsData.js';
import ActivityHost from '../../components/ActivityHost/ActivityHost.jsx';
import { hasActivity } from '../../activities/activityRegistry.js';
import './LevelPage.css';

// ─── Stars display ────────────────────────────────────────────────────────────
function StarDisplay({ stars }) {
  return (
    <div className="level-page__complete-stars">
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ opacity: i <= stars ? 1 : 0.25 }}>⭐</span>
      ))}
    </div>
  );
}

export default function LevelPage() {
  const { kingdomId, levelId } = useParams();
  const { player, completeLevel } = usePlayer();
  const navigate = useNavigate();

  // Find kingdom and level
  const kingdom = KINGDOMS.find((k) => k.id === kingdomId);
  const level = kingdom?.levels.find((l) => l.id === levelId);

  // States
  const [score, setScore] = useState(level ? level.xpReward : 30);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  if (!kingdom || !level) return <Navigate to="/world-map" replace />;

  const levelStatus = getLevelStatus(player, kingdom, level);
  const alreadyCompleted = player.levelProgress[level.id]?.completed ?? false;
  const stars = computeStars(score, level.starThresholds);

  // Block access to locked levels
  if (levelStatus === 'locked') {
    return (
      <div className="level-page">
        <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
          <span style={{ fontSize: '4rem' }}>🔒</span>
          <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Level Locked</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            {level.pointsRequired > 0
              ? `This level requires ${level.pointsRequired} XP in the ${kingdom.name} kingdom.`
              : 'Complete the previous level first to unlock this one.'}
          </p>
          <Link to={`/kingdom/${kingdom.id}`} className="btn btn--primary">
            ← Back to {kingdom.name}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    completeLevel(kingdom.id, level, score);
    const earnedStars = computeStars(score, level.starThresholds);
    const xpEarned = Math.min(score, level.xpReward);
    setCompletionData({ score, stars: earnedStars, xpEarned });
  };

  // Find next level & next kingdom for navigation
  const nextLevel = kingdom.levels.find((l) => l.order === level.order + 1);
  const nextKingdom = KINGDOMS.find((k) => k.order === kingdom.order + 1);

  // Show full completion overlay when completed
  if (completionData) {
    return (
      <div className="level-page">
        <div className="container" style={{ paddingTop: '4rem' }}>
          <div className="level-page__complete-banner">
            <span className="level-page__complete-emoji">🎉</span>
            <h2 className="level-page__complete-title">Level Complete!</h2>
            <p className="level-page__complete-xp">
              +{completionData.xpEarned} XP Earned
            </p>
            <StarDisplay stars={completionData.stars} />

            <div className="level-page__complete-buttons">
              {nextLevel && (
                <Link
                  to={`/kingdom/${kingdom.id}/level/${nextLevel.id}`}
                  className="btn btn--primary btn--lg"
                  onClick={() => {
                    setCompletionData(null);
                    setSubmitted(false);
                  }}
                >
                  ▶ Next Level: {nextLevel.title}
                </Link>
              )}
              {!nextLevel && nextKingdom && (
                <Link
                  to={`/kingdom/${nextKingdom.id}`}
                  className="btn btn--secondary btn--lg"
                >
                  🏰 Next Kingdom: {nextKingdom.name}
                </Link>
              )}
              <Link to={`/kingdom/${kingdom.id}`} className="btn btn--ghost">
                ← Back to {kingdom.name}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="level-page">
      {/* Header */}
      <div className="level-page__header">
        <div className="container">
          {/* Breadcrumb */}
          <div className="level-page__breadcrumb">
            <Link to="/world-map">🗺️ World Map</Link>
            <span className="level-page__breadcrumb-sep">›</span>
            <Link to={`/kingdom/${kingdom.id}`}>{kingdom.emoji} {kingdom.name}</Link>
            <span className="level-page__breadcrumb-sep">›</span>
            <span>Level {level.order}</span>
          </div>

          <div className="level-page__title-row">
            <div>
              <h1 className="level-page__level-title">
                Level {level.order} — {level.title}
              </h1>
              <div className="level-page__meta">
                <span>🏰 {kingdom.name}</span>
                <span>⏱ {level.duration}</span>
                <span>⭐ Up to {level.xpReward} XP</span>
                {alreadyCompleted && (
                  <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>✓ Completed</span>
                )}
              </div>
            </div>

            {/* Stars if completed */}
            {alreadyCompleted && (
              <div className="level-page__stars">
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`star ${i <= (player.levelProgress[level.id]?.stars ?? 0) ? 'star--filled' : ''}`}
                    style={{ fontSize: '1.5rem' }}
                  >★</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {alreadyCompleted && (
          <div className="level-page__feedback level-page__feedback--info" style={{ marginBottom: '1.5rem' }}>
            ✅ You have already completed this level! You can practice again to improve your score.
          </div>
        )}

        {/* Level Overview & Concept */}
        <div className="card level-page__concept-card">
          <div className="level-page__concept-header">
            <div>
              <span className="badge badge--available" style={{ marginBottom: '0.5rem' }}>
                {kingdom.name} · Level {level.order}
              </span>
              <h2 style={{ fontSize: '1.3rem', margin: '0.25rem 0' }}>{level.title}</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                {level.description}
              </p>
            </div>
            <button
              className="level-page__audio-btn"
              onClick={() => alert('🎧 Audio narration will be available in Phase 2!')}
            >
              🎧 Audio Narration
            </button>
          </div>
        </div>

        {/* Interactive Challenge & Learning Activity Area */}
        <div className="card level-page__activity-card">
          <div className="level-page__activity-header">
            <span className="level-page__activity-badge">⚔️ Interactive Challenge</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Complete the activity to earn up to <strong>{level.xpReward} XP</strong>
            </span>
          </div>

          <div className="level-page__placeholder">
            <span className="level-page__placeholder-icon">🧩</span>
            <h3 className="level-page__placeholder-title">
              {level.title} Activity Area
            </h3>
            <p className="level-page__placeholder-desc">
              Interactive learning challenges, diagrams, and problem-solving puzzles
              for <strong>{level.title}</strong> will be implemented here in Phase 2.
            </p>
          </div>

          {/* Performance Score Slider (Simulator for Phase 1) */}
          <div className="level-page__score-input">
            <div className="level-page__score-label">
              <span>🎯 Performance Score:</span>
              <span style={{ color: '#b45309', fontWeight: 800, fontSize: '1.1rem' }}>
                {score} / {level.xpReward} XP
              </span>
            </div>
            <input
              type="range"
              className="level-page__slider"
              min={1}
              max={level.xpReward}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              disabled={submitted}
            />
            <div className="level-page__thresholds">
              <span>⭐ 1 Star ({level.starThresholds[0]}+ XP)</span>
              <span>⭐⭐ 2 Stars ({level.starThresholds[1]}+ XP)</span>
              <span>⭐⭐⭐ 3 Stars ({level.starThresholds[2]}+ XP)</span>
            </div>
          </div>

          {/* Star Rating Preview */}
          <div className="level-page__preview-stars">
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginRight: '0.5rem' }}>
              Rating:
            </span>
            {[1, 2, 3].map((i) => (
              <span key={i} style={{ fontSize: '1.6rem', opacity: i <= stars ? 1 : 0.25 }}>⭐</span>
            ))}
          </div>

          {/* Submit Action */}
          <button
            className="btn btn--primary btn--lg w-full"
            onClick={handleSubmit}
            disabled={submitted}
          >
            {submitted ? '✓ Completed!' : '✅ Complete Challenge'}
          </button>
        </div>

        {/* Quick Assistance / Hint */}
        <div className="level-page__hint-box">
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setShowHint(!showHint)}
          >
            {showHint ? '🙈 Hide Hint' : '💡 Need a Hint?'}
          </button>

          {showHint && (
            <div className="card level-page__hint-content">
              <p style={{ fontWeight: 700, marginBottom: '0.25rem', color: '#b45309' }}>
                💡 Key Hint for {level.title}:
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Focus on the core concept: <em>{level.description}</em>. In {kingdom.name},
                this step ensures correct ASIC physical design flow progression.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
