// ============================================================
//  pages/Dashboard.jsx
//  Assembles the full DJI-style dashboard layout.
//  Imports all panel components and wires them together.
//
//  Right now all child components are PLACEHOLDERS — you will
//  replace them one by one in Steps 3, 4, 5, 6.
// ============================================================

import React from 'react'

// ── Severity color helper used across the whole dashboard ──
// Returns CSS color string for a given SSS score (1–5)
export function sevColor(score) {
  if (score >= 5) return '#ff3b3b'
  if (score === 4) return '#ffaa00'
  if (score === 3) return '#cc8800'
  if (score === 2) return '#888888'
  return '#00e676'
}

// ── Inline styles (same tokens as index.css) ──
const S = {
  // Full-height flex container
  shell: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    background: '#0a0a0a',
  },

  // ── TOP BAR ──
  topbar: {
    height: 40,
    minHeight: 40,
    background: '#111111',
    borderBottom: '1px solid #2a2a2a',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 16,
    flexShrink: 0,
  },
  logo: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '0.05em',
  },
  topbarMid: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  sysStat: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 10,
    color: '#666',
  },
  dot: (color, glow) => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: color,
    boxShadow: `0 0 6px ${glow || color}`,
  }),
  clock: {
    fontSize: 10,
    color: '#00d4ff',
    fontWeight: 500,
    letterSpacing: '0.08em',
    fontFamily: "'IBM Plex Mono', monospace",
  },

  // ── ALERT BANNER ──
  alertBanner: {
    background: 'rgba(255,59,59,0.15)',
    borderBottom: '1px solid rgba(255,59,59,0.4)',
    padding: '5px 16px',
    fontSize: 10,
    color: '#ff3b3b',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    animation: 'slideDown 0.3s ease forwards',
    minHeight: 28,
    flexShrink: 0,
  },

  // ── MAIN GRID ──
  main: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '48px 1fr 280px',
    overflow: 'hidden',
  },

  // ── SIDEBAR ──
  sidebar: {
    background: '#111111',
    borderRight: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 0',
    gap: 4,
  },
  sbBtn: (active) => ({
    width: 36,
    height: 36,
    borderRadius: 8,
    border: active ? '1px solid rgba(0,212,255,0.3)' : 'none',
    background: active ? '#1c1c1c' : 'transparent',
    color: active ? '#00d4ff' : '#666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.15s',
  }),
  sbSep: {
    width: 24,
    height: 1,
    background: '#2a2a2a',
    margin: '6px 0',
  },

  // ── CENTER COLUMN ──
  center: {
    display: 'grid',
    gridTemplateRows: '1fr 200px',
    overflow: 'hidden',
  },

  // ── RIGHT PANEL ──
  rightPanel: {
    background: '#111111',
    borderLeft: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
}

// ── MAIN COMPONENT ────────────────────────────────────────
export default function Dashboard({
  clock,
  analysisResult,
  setAnalysisResult,
  isAnalyzing,
  setIsAnalyzing,
  uploadProgress,
  setUploadProgress,
  activeSection,
  setActiveSection,
}) {
  // Does the result have any critical (SSS:5) defects?
  const hasCritical = analysisResult?.defects?.some((d) => d.severity === 5)

  return (
    <div style={S.shell}>

      {/* ── TOP BAR ── */}
      <div style={S.topbar}>
        {/* Logo */}
        <div style={S.logo}>
          IGNIS<span style={{ color: '#00d4ff' }}>AI</span>
        </div>

        {/* System status indicators */}
        <div style={S.topbarMid}>
          <div style={S.sysStat}>
            <div style={S.dot('#00e676')} />
            ML Pipeline Active
          </div>
          <div style={S.sysStat}>
            <div style={S.dot(isAnalyzing ? '#ffaa00' : '#444')} />
            {isAnalyzing ? 'Analysis Running...' : 'Idle'}
          </div>
          {hasCritical && (
            <div style={S.sysStat}>
              <div style={{ ...S.dot('#ff3b3b'), animation: 'blink 0.8s ease infinite' }} />
              <span style={{ color: '#ff3b3b' }}>
                {analysisResult.defects.filter((d) => d.severity === 5).length} Critical Alerts
              </span>
            </div>
          )}
          {/* LIVE recording dot */}
          <div style={S.sysStat}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#ff3b3b',
              boxShadow: '0 0 8px #ff3b3b',
              animation: 'blink 1.2s ease infinite',
            }} />
            <span style={{ color: '#ff3b3b', fontSize: 10 }}>LIVE</span>
          </div>
        </div>

        {/* Clock + location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={S.clock}>{clock}</div>
          <div style={{ fontSize: 9, color: '#666' }}>NH-48 · KM 234</div>
        </div>
      </div>

      {/* ── ALERT BANNER — only shows when SSS:5 found ── */}
      {hasCritical && (
        <div style={S.alertBanner}>
          <span style={{ fontSize: 12, animation: 'blink 0.8s ease infinite' }}>⚠</span>
          <span>
            CRITICAL — SSS:5 detected ·{' '}
            {analysisResult.defects
              .filter((d) => d.severity === 5)
              .map((d) => `Section ${d.section}`)
              .join(', ')}{' '}
            · Immediate action required
          </span>
        </div>
      )}

      {/* ── MAIN 3-COLUMN GRID ── */}
      <div style={S.main}>

        {/* ── SIDEBAR ── */}
        <div style={S.sidebar}>
          {[
            { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
            { id: 'upload',    icon: '↑',  label: 'Upload' },
            { id: 'map',       icon: '◎',  label: 'Map' },
            { id: 'history',   icon: '⊟',  label: 'History' },
          ].map((item) => (
            <button
              key={item.id}
              style={S.sbBtn(activeSection === item.id)}
              title={item.label}
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon}
            </button>
          ))}

          <div style={S.sbSep} />

          <button style={S.sbBtn(false)} title="Settings">⚙</button>
          <button style={S.sbBtn(false)} title="Reports">☰</button>

          {/* Push logout to bottom */}
          <div style={{ flex: 1 }} />
          <button style={{ ...S.sbBtn(false), marginBottom: 8 }} title="Logout">→</button>
        </div>

        {/* ── CENTER COLUMN ── */}
        <div style={S.center}>

          {/* FEED PANEL — replaced in Step 3 */}
          <FeedPanelPlaceholder
            analysisResult={analysisResult}
            isAnalyzing={isAnalyzing}
          />

          {/* TELEMETRY STRIP — replaced in Step 3 */}
          <TelemetryStripPlaceholder analysisResult={analysisResult} />

        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={S.rightPanel}>

          {/* UPLOAD ZONE — replaced in Step 4 */}
          <UploadZonePlaceholder
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
            uploadProgress={uploadProgress}
            setUploadProgress={setUploadProgress}
            setAnalysisResult={setAnalysisResult}
          />

          {/* DEFECT LIST — replaced in Step 4 */}
          <DefectListPlaceholder analysisResult={analysisResult} />

          {/* MAP VIEW — replaced in Step 5 */}
          <MapViewPlaceholder analysisResult={analysisResult} />

          {/* REPORT BUTTON — replaced in Step 6 */}
          <ReportButtonPlaceholder analysisResult={analysisResult} />

        </div>
      </div>
    </div>
  )
}

// ============================================================
//  PLACEHOLDER COMPONENTS
//  These show the correct layout immediately.
//  You will replace each one with the real component in the
//  matching step. Just swap the import at the top of this file.
// ============================================================

function RpSection({ title, children, noPadBottom }) {
  return (
    <div style={{
      borderBottom: '1px solid #2a2a2a',
      padding: noPadBottom ? '14px 14px 0' : '14px',
    }}>
      <div style={{
        fontSize: 9,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#666',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        {title}
        <div style={{ flex: 1, height: 1, background: '#2a2a2a' }} />
      </div>
      {children}
    </div>
  )
}

function FeedPanelPlaceholder({ isAnalyzing }) {
  return (
    <div style={{
      background: '#161616',
      borderBottom: '1px solid #2a2a2a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.04) 1px,transparent 1px)',
        backgroundSize: '32px 32px',
      }} />
      {/* Corner brackets */}
      {[
        { top: 12, left: 12,  borderWidth: '2px 0 0 2px' },
        { top: 12, right: 12, borderWidth: '2px 2px 0 0' },
        { bottom: 12, left: 12,  borderWidth: '0 0 2px 2px' },
        { bottom: 12, right: 12, borderWidth: '0 2px 2px 0' },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', width: 16, height: 16,
          borderStyle: 'solid', borderColor: '#00d4ff',
          opacity: 0.5, ...pos,
        }} />
      ))}
      {/* Placeholder message */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>⬡</div>
        <div style={{ fontSize: 11, color: '#666', letterSpacing: '0.1em' }}>
          {isAnalyzing ? (
            <span style={{ color: '#00d4ff' }}>ANALYZING IMAGES...</span>
          ) : (
            'FEED PANEL — Replaced in Step 3'
          )}
        </div>
        <div style={{ fontSize: 9, color: '#444', marginTop: 6 }}>
          Upload images to begin analysis
        </div>
      </div>
    </div>
  )
}

function TelemetryStripPlaceholder({ analysisResult }) {
  const stats = analysisResult ? [
    { label: 'Defects Found',  value: analysisResult.defects.length, unit: 'total', color: '#ff3b3b' },
    { label: 'Critical SSS:5', value: analysisResult.defects.filter(d=>d.severity===5).length, unit: 'zones', color: '#ffaa00' },
    { label: 'Bridge Health',  value: analysisResult.bridge_health, unit: '/ 100', color: analysisResult.bridge_health < 50 ? '#ff3b3b' : '#00e676' },
  ] : []

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${analysisResult ? 3 : 1}, 1fr)`,
      background: '#111111',
      borderTop: '1px solid #2a2a2a',
    }}>
      {analysisResult ? stats.map((s, i) => (
        <div key={i} style={{
          padding: '14px',
          borderRight: i < stats.length - 1 ? '1px solid #2a2a2a' : 'none',
        }}>
          <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            {s.label}
          </div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>
            {s.value}
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: '#666', fontWeight: 400, marginLeft: 4 }}>
              {s.unit}
            </span>
          </div>
        </div>
      )) : (
        <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.1em' }}>
            TELEMETRY STRIP — Replaced in Step 3 · Upload images to see live stats
          </div>
        </div>
      )}
    </div>
  )
}

function UploadZonePlaceholder({ isAnalyzing, setIsAnalyzing, setUploadProgress, setAnalysisResult }) {
  // Quick demo button — loads mock data so you can see the UI
  const loadMock = async () => {
    setIsAnalyzing(true)
    setUploadProgress(0)
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(r => setTimeout(r, 150))
      setUploadProgress(i)
    }
    // Simulate analysis delay
    await new Promise(r => setTimeout(r, 800))
    // Load mock result
    const { MOCK_RESULT } = await import('../api/client.js')
    setAnalysisResult(MOCK_RESULT)
    setIsAnalyzing(false)
  }

  return (
    <RpSection title="Upload Images">
      <div style={{
        border: '1px dashed #333',
        borderRadius: 8,
        padding: 16,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 20, color: '#444', marginBottom: 8 }}>⬆</div>
        <div style={{ fontSize: 10, color: '#666' }}>
          Drop drone images here<br />
          <span style={{ color: '#444' }}>JPG · PNG · GPS EXIF</span>
        </div>
        <button
          onClick={loadMock}
          disabled={isAnalyzing}
          style={{
            marginTop: 10,
            background: isAnalyzing ? '#333' : '#00d4ff',
            color: isAnalyzing ? '#666' : '#000',
            border: 'none',
            padding: '5px 14px',
            borderRadius: 4,
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 10,
            fontWeight: 600,
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            letterSpacing: '0.06em',
          }}
        >
          {isAnalyzing ? 'ANALYZING...' : 'LOAD DEMO DATA'}
        </button>
        <div style={{ fontSize: 9, color: '#444', marginTop: 6 }}>
          (Real upload in Step 4)
        </div>
      </div>
    </RpSection>
  )
}

function DefectListPlaceholder({ analysisResult }) {
  const defects = analysisResult?.defects || []
  return (
    <RpSection title="Detected Defects">
      {defects.length === 0 ? (
        <div style={{ fontSize: 10, color: '#444', textAlign: 'center', padding: '8px 0' }}>
          No analysis yet — load demo data above
        </div>
      ) : defects.map((d) => (
        <div key={d.id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 0',
          borderBottom: '1px solid #2a2a2a',
          animation: 'fadeUp 0.3s ease forwards',
        }}>
          {/* Severity badge */}
          <div style={{
            width: 28, height: 28,
            borderRadius: 5,
            background: `${sevColor(d.severity)}22`,
            border: `1px solid ${sevColor(d.severity)}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Rajdhani',sans-serif",
            fontSize: 13, fontWeight: 700,
            color: sevColor(d.severity),
            flexShrink: 0,
          }}>
            {d.severity}
          </div>
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: '#e8e8e8', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {d.type}
            </div>
            <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>
              Section {d.section}{d.growth_rate > 0 ? ` · +${d.growth_rate}mm/mo` : ' · Stable'}
            </div>
          </div>
          {/* Depth pill */}
          <div style={{
            fontSize: 9, padding: '2px 6px',
            borderRadius: 3,
            background: '#1c1c1c', color: '#666',
            border: '1px solid #2a2a2a',
            flexShrink: 0,
          }}>
            {d.depth_mm}mm
          </div>
        </div>
      ))}
    </RpSection>
  )
}

function MapViewPlaceholder({ analysisResult }) {
  const defects = analysisResult?.defects?.filter(d => d.lat && d.lng) || []
  return (
    <>
      <RpSection title="GPS Defect Map" noPadBottom />
      <div style={{ height: 130, background: '#161616', position: 'relative', overflow: 'hidden' }}>
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.06) 1px,transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
        <svg width="100%" height="100%" viewBox="0 0 280 130">
          <rect x="20" y="57" width="240" height="14" rx="3" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" strokeDasharray="5 3"/>
          {defects.length > 0 ? defects.map((d, i) => {
            const x = 40 + i * 55
            const color = sevColor(d.severity)
            return (
              <g key={d.id}>
                <circle cx={x} cy={64} r={4} fill={`${color}33`} stroke={color} strokeWidth={1.5}>
                  <animate attributeName="r" values="4;7;4" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite"/>
                </circle>
                <text x={x} y={d.severity >= 4 ? 50 : 82} textAnchor="middle" fill={color} fontSize={8} fontFamily="monospace">
                  SSS:{d.severity}
                </text>
              </g>
            )
          }) : (
            <text x="140" y="70" textAnchor="middle" fill="#444" fontSize={9} fontFamily="monospace">
              MAP — replaced in Step 5
            </text>
          )}
        </svg>
      </div>
    </>
  )
}

function ReportButtonPlaceholder({ analysisResult }) {
  return (
    <div style={{ padding: 14, borderBottom: '1px solid #2a2a2a' }}>
      <button
        disabled={!analysisResult}
        style={{
          width: '100%',
          background: 'transparent',
          border: `1px solid ${analysisResult ? '#333' : '#222'}`,
          color: analysisResult ? '#e8e8e8' : '#444',
          padding: 9,
          borderRadius: 6,
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 10,
          cursor: analysisResult ? 'pointer' : 'not-allowed',
          letterSpacing: '0.06em',
        }}
      >
        ⬇ GENERATE PDF REPORT
      </button>
      <div style={{ fontSize: 9, color: '#444', textAlign: 'center', marginTop: 6 }}>
        (Real export in Step 6)
      </div>
    </div>
  )
}
