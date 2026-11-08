/**
 * App.jsx
 * ========
 * Root application component.
 * Defines all client-side routes using React Router v6.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import DashboardPage from './pages/DashboardPage/DashboardPage.jsx';
import WorldMapPage from './pages/WorldMapPage/WorldMapPage.jsx';
import KingdomPage from './pages/KingdomPage/KingdomPage.jsx';
import LevelPage from './pages/LevelPage/LevelPage.jsx';
import RTLStudioPage from './pages/StudioPage/RTLStudioPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        {/* Landing page — no navbar */}
        <Route path="/" element={<LandingPage />} />

        {/* Main app routes — with persistent navbar */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <main className="page-content">
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/world-map" element={<WorldMapPage />} />
                  <Route path="/kingdom/:kingdomId" element={<KingdomPage />} />
                  <Route path="/kingdom/:kingdomId/level/:levelId" element={<LevelPage />} />
                  <Route path="/studio/rtl" element={<RTLStudioPage />} />
                  <Route path="/rtl-studio" element={<Navigate to="/studio/rtl" replace />} />
                  <Route path="/sanity-checks" element={<Navigate to="/world-map" replace />} />
                  <Route path="*" element={<Navigate to="/world-map" replace />} />
                </Routes>
              </main>
            </>
          }
        />
      </Routes>
    </div>
  );
}
