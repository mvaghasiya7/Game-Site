/**
 * Navbar.jsx
 * ===========
 * Persistent top navigation bar shown on all pages except the landing page.
 */

import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext.jsx';
import './Navbar.css';

export default function Navbar() {
  const { player } = usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', emoji: '📊' },
    { to: '/world-map', label: 'World Map', emoji: '🏛️' },
    { to: '/studio/sta', label: 'STA Studio', emoji: '⏱️' },
    { to: '/studio/floorplanning', label: 'Floorplan Studio', emoji: '🗺️' },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/world-map" className="navbar__logo">
          <span className="navbar__logo-emoji">🎮</span>
          <span>PD <span className="navbar__logo-text">Playground</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              <span>{link.emoji}</span>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* XP display + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="navbar__xp">
            ⭐ {player.totalXP} XP
          </div>
          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}
