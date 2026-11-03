/**
 * WorldMapPage.jsx
 * =================
 * The central world map showing all 8 ASIC kingdoms on a connected journey path.
 * Kingdoms alternate left and right for a winding-road feel.
 * Stage-specific Sanity Checks are integrated directly into each kingdom as side quests.
 */

import React from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import KingdomCard from '../../components/KingdomCard/KingdomCard.jsx';
import {
  computeOverallProgress,
  countKingdomsUnlocked,
  countLevelsCompleted,
  countTotalSanityChecksPassed,
  countTotalSanityChecks,
  getKingdomStatus,
} from '../../logic/progressionEngine.js';
import { KINGDOMS } from '../../data/kingdomsData.js';
import './WorldMapPage.css';

export default function WorldMapPage() {
  const { player } = usePlayer();
  const overallProgress = computeOverallProgress(player);
  const kingdomsUnlocked = countKingdomsUnlocked(player);
  const levelsCompleted = countLevelsCompleted(player);
  const totalLevels = KINGDOMS.reduce((s, k) => s + k.levels.length, 0);
  const passedSanity = countTotalSanityChecksPassed(player);
  const totalSanity = countTotalSanityChecks();

  return (
    <div className="world-map">
      <div className="container">
        {/* Header */}
        <div className="world-map__header">
          <div className="world-map__title-row">
            <span style={{ fontSize: '2rem' }}>🗺️</span>
            <h1 className="section-title">ASIC Design Journey</h1>
          </div>
          <p className="world-map__subtitle">
            Progress through each kingdom in sequence. Complete all levels and pass the stage
            Sanity Check side quests to unlock the next world in the ASIC flow!
          </p>

          {/* Summary stats */}
          <div className="world-map__summary">
            <div className="world-map__summary-stat">
              <div className="world-map__summary-value">{overallProgress}%</div>
              <div className="world-map__summary-label">Overall Progress</div>
            </div>
            <div className="world-map__summary-stat">
              <div className="world-map__summary-value">{kingdomsUnlocked}/8</div>
              <div className="world-map__summary-label">Kingdoms Open</div>
            </div>
            <div className="world-map__summary-stat">
              <div className="world-map__summary-value">{levelsCompleted}/{totalLevels}</div>
              <div className="world-map__summary-label">Levels Done</div>
            </div>
            <div className="world-map__summary-stat">
              <div className="world-map__summary-value">{passedSanity}/{totalSanity}</div>
              <div className="world-map__summary-label">Sanity Checks</div>
            </div>
            <div className="world-map__summary-stat">
              <div className="world-map__summary-value">{player.totalXP}</div>
              <div className="world-map__summary-label">Total XP</div>
            </div>
          </div>
        </div>

        {/* Journey path */}
        <div className="world-map__journey">
          {/* Vertical path line */}
          <div className="world-map__path-line" />

          {KINGDOMS.map((kingdom, index) => {
            const isLeft = index % 2 === 0; // alternate sides
            const status = getKingdomStatus(player, kingdom.id);

            const dotClass = `world-map__node-dot world-map__node-dot--${
              status === 'completed' ? 'completed' : status === 'available' ? 'active' : 'locked'
            }`;

            const card = <KingdomCard kingdom={kingdom} isLast={index === KINGDOMS.length - 1} />;
            const spacer = <div className="world-map__spacer" />;

            return (
              <div
                key={kingdom.id}
                className={`world-map__kingdom-row world-map__kingdom-row--${isLeft ? 'left' : 'right'}`}
              >
                {isLeft ? (
                  <>
                    <div className="world-map__card-slot">{card}</div>
                    <div className="world-map__node">
                      <div className={dotClass}>{kingdom.emoji}</div>
                    </div>
                    {spacer}
                  </>
                ) : (
                  <>
                    {spacer}
                    <div className="world-map__node">
                      <div className={dotClass}>{kingdom.emoji}</div>
                    </div>
                    <div className="world-map__card-slot">{card}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
