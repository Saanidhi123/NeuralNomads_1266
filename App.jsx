// ============================================================
//  App.jsx  —  Root component
//  Holds all global state and renders the full dashboard layout:
//
//  ┌─────────────────────────────────────────────┐
//  │  TopBar (logo, system status, live clock)   │
//  ├────────────────────────────────────────────┤
//  │  AlertBanner (shows when SSS:5 detected)   │
//  ├──┬──────────────────────────┬──────────────┤
//  │  │                          │  Right Panel │
//  │SB│    FeedPanel (main view) │  - Upload    │
//  │  │                          │  - Defects   │
//  │  ├──────────────────────────┤  - Map       │
//  │  │  TelemetryStrip          │  - Compass   │
//  └──┴──────────────────────────┴──────────────┘
// ============================================================

import React, { useState, useEffect } from 'react'

// ── Page imports (you'll fill these in Steps 2–6) ──
import Dashboard from './pages/Dashboard.jsx'

// ── Styles ──
import './index.css'

export default function App() {
  // ── GLOBAL STATE ─────────────────────────────────────────
  // analysisResult holds everything returned by your backend.
  // null = no analysis done yet.
  const [analysisResult, setAnalysisResult] = useState(null)

  // isAnalyzing = true while waiting for backend response
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // uploadProgress = 0-100 for the upload progress bar
  const [uploadProgress, setUploadProgress] = useState(0)

  // activeSection = which sidebar icon is highlighted
  const [activeSection, setActiveSection] = useState('dashboard')

  // Live clock string shown in the top bar
  const [clock, setClock] = useState('')

  // ── CLOCK ─────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(now.toTimeString().slice(0, 8))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)  // cleanup when component unmounts
  }, [])

  // ── RENDER ────────────────────────────────────────────────
  return (
    // The outer div fills the full viewport (height:100% set in index.css)
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Pass all state down as props so every child can read/update it */}
      <Dashboard
        clock={clock}
        analysisResult={analysisResult}
        setAnalysisResult={setAnalysisResult}
        isAnalyzing={isAnalyzing}
        setIsAnalyzing={setIsAnalyzing}
        uploadProgress={uploadProgress}
        setUploadProgress={setUploadProgress}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

    </div>
  )
}
