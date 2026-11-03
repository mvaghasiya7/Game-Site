/**
 * LevelCard.jsx
 * ==============
 * Reusable card for individual levels inside a kingdom.
 * Shows lock state, star rating, XP reward, and links to the level.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { getLevelStatus } from '../../logic/progressionEngine.js';
import './LevelCard.css';

function Stars({ count, earned }) {
  return (
    <div className="level-card__stars">
      {[1, 2, 3].map((i) => (
        <span key={i} className={`star ${i <= earned ? 'star--filled' : ''}`}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function LevelCard({ kingdom, level }) {
  const { player } = usePlayer();
  const status = getLevelStatus(player, kingdom, level);
  const progress = player.levelProgress[level.id];
  const earnedStars = progress?.stars ?? 0;

  const numberClass = `level-card__number level-card__number--${status}`;
  const cardClass = `level-card level-card--${status}`;

  const inner = (
    <>
      {/* Level number circle */}
      <div className={numberClass}>
        {status === 'locked' ? '🔒' : status === 'completed' ? '✓' : level.order}
      </div>

      {/* Title + description */}
      <div className="level-card__content">
        <div className="level-card__title">Level {level.order} — {level.title}</div>
        <div className="level-card__desc">{level.description}</div>
      </div>

      {/* Right: stars, XP, duration */}
      <div className="level-card__right">
        {status === 'completed' && <Stars count={3} earned={earnedStars} />}
        <span className="level-card__xp">⭐ +{level.xpReward} XP</span>
        {status === 'locked' && level.pointsRequired > 0 && (
          <span className="level-card__lock-hint">Needs {level.pointsRequired} XP</span>
        )}
        {status !== 'locked' && (
          <span className="level-card__duration">⏱ {level.duration}</span>
        )}
      </div>
    </>
  );

  if (status === 'locked') {
    return <div className={cardClass}>{inner}</div>;
  }

  return (
    <Link
      to={`/kingdom/${kingdom.id}/level/${level.id}`}
      className={cardClass}
    >
      {inner}
    </Link>
  );
}
