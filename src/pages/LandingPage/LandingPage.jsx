/**
 * LandingPage.jsx
 * ================
 * Welcome / entry point of PD Playground.
 * Shows the platform introduction and Start Learning CTA.
 * On first visit, prompts for player name.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext.jsx';
import './LandingPage.css';

// Decorative star positions (static so they don't re-randomize)
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 3) % 100}%`,
  top: `${(i * 23 + 7) % 100}%`,
  size: (i % 3) + 1,
  delay: `${(i * 0.37) % 3}s`,
}));

const FLOW_ITEMS = [
  { emoji: '🧩', label: 'RTL' },
  { emoji: '⚗️', label: 'Synthesis' },
  { emoji: '🗺️', label: 'Floorplan' },
  { emoji: '📌', label: 'Placement' },
  { emoji: '🕐', label: 'CTS' },
  { emoji: '🔗', label: 'Routing' },
  { emoji: '🧱', label: 'Filler' },
  { emoji: '💾', label: 'GDS' },
];

const FEATURES = [
  {
    emoji: '🗺️',
    title: 'Epic World Map',
    desc: 'Navigate through 8 ASIC kingdoms on a visual adventure map.',
  },
  {
    emoji: '🏆',
    title: 'Level Progression',
    desc: 'Unlock levels and kingdoms by earning XP and completing challenges.',
  },
  {
    emoji: '⭐',
    title: 'Stars & Achievements',
    desc: 'Earn stars on every level and collect unique achievement badges.',
  },
  {
    emoji: '💾',
    title: 'Progress Saved',
    desc: 'Your journey is saved automatically — pick up exactly where you left off.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { player, setPlayerName } = usePlayer();
  const [showModal, setShowModal] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const handleStartLearning = () => {
    // If player hasn't set a real name, prompt them
    if (player.name === 'Student Explorer') {
      setShowModal(true);
    } else {
      navigate('/world-map');
    }
  };

  const handleGuestMode = () => {
    navigate('/world-map');
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed) setPlayerName(trimmed);
    setShowModal(false);
    navigate('/world-map');
  };

  const handleSkipName = () => {
    setShowModal(false);
    navigate('/world-map');
  };

  return (
    <div className="landing">
      {/* Background ambient glow */}
      <div className="landing__bg" />

      {/* Twinkling stars */}
      <div className="landing__stars">
        {STARS.map((s) => (
          <div
            key={s.id}
            className="landing__star"
            style={{
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: s.delay,
              animationDuration: `${2 + (s.id % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Hero */}
      <section className="landing__hero">
        <div className="landing__badge">
          🎓 Phase 1 Prototype · ASIC Design Learning Adventure
        </div>

        <span className="landing__logo-emoji">🎮</span>

        <h1 className="landing__title">
          PD{' '}
          <span className="landing__title-highlight">Playground</span>
        </h1>

        <p className="landing__tagline">
          Master ASIC Digital &amp; Physical Design through an epic gamified
          learning adventure. Level up from RTL all the way to Tape-Out!
        </p>

        {/* ASIC Flow preview */}
        <div className="landing__flow">
          {FLOW_ITEMS.map((item, i) => (
            <React.Fragment key={item.label}>
              <div className="landing__flow-item">
                {item.emoji} {item.label}
              </div>
              {i < FLOW_ITEMS.length - 1 && (
                <span className="landing__flow-arrow">→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="landing__cta">
          <button className="btn btn--primary btn--lg" onClick={handleStartLearning}>
            🚀 Start Learning
          </button>
          <button className="btn btn--ghost btn--lg" onClick={handleGuestMode}>
            👤 Continue as Guest
          </button>
        </div>

        <p className="landing__cta-sub">
          No account required · Progress saved in your browser
        </p>
      </section>

      {/* Feature highlights */}
      <div className="landing__features">
        {FEATURES.map((f) => (
          <div key={f.title} className="landing__feature-card">
            <span className="landing__feature-emoji">{f.emoji}</span>
            <h3 className="landing__feature-title">{f.title}</h3>
            <p className="landing__feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Name modal */}
      {showModal && (
        <div className="landing__modal-overlay" onClick={handleSkipName}>
          <div className="landing__modal" onClick={(e) => e.stopPropagation()}>
            <span style={{ fontSize: '3rem' }}>🧑‍💻</span>
            <h2>What's your name?</h2>
            <p>Personalise your learning adventure — or skip to jump right in.</p>
            <form onSubmit={handleNameSubmit}>
              <input
                className="landing__input"
                type="text"
                placeholder="Enter your name..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={30}
                autoFocus
              />
              <div className="landing__modal-buttons">
                <button type="submit" className="btn btn--primary">
                  Let's Go! 🚀
                </button>
                <button type="button" className="btn btn--ghost" onClick={handleSkipName}>
                  Skip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
