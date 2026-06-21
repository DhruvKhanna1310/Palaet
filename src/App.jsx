import { Routes, Route, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import QuizScreen from './screens/QuizScreen'
import ResultsScreen from './screens/ResultsScreen'
import DashboardScreen from './screens/DashboardScreen'
import './index.css'

// ── CONSUMER APP (/) ─────────────────────────────────────────
function ConsumerApp() {
  const [screen, setScreen] = useState('home')
  const [results, setResults] = useState(null)

  function handleResults(data) {
    setResults(data)
    setScreen('results')
  }

  function handleRetake() {
    setResults(null)
    setScreen('quiz')
  }

  if (screen === 'quiz') return <QuizScreen onResults={handleResults} />
  if (screen === 'results') return <ResultsScreen data={results} onRetake={handleRetake} />

  // Home screen
  return (
    <div style={styles.home}>
      <div style={styles.orb}></div>
      <div style={styles.homeInner}>
        <p style={styles.eyebrow}>AI-Powered Wine Discovery</p>
        <h1 style={styles.homeTitle}>
          The wine you've been{' '}
          <em style={styles.em}>looking for.</em>
        </h1>
        <div style={styles.rule}></div>
        <p style={styles.homeSub}>
          Tell us how you taste. We'll find your bottle from tonight's
          selection — matched to your palate, not our inventory.
        </p>
        <button style={styles.cta} onClick={() => setScreen('quiz')}>
          Begin the tasting →
        </button>
        <p style={styles.homeNote}>5 questions · 60 seconds · no wine knowledge needed</p>
      </div>
    </div>
  )
}

// ── ROOT APP WITH ROUTING ─────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ConsumerApp />} />
      <Route path="/dashboard" element={<DashboardScreen onExit={() => window.location.href = '/'} />} />
    </Routes>
  )
}

const styles = {
  home: {
    minHeight: '100vh',
    background: '#080808',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    right: '-10%',
    top: '-20%',
    width: '60%',
    aspectRatio: '1',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 40% 40%, rgba(139,32,64,0.3), rgba(139,32,64,0.05) 60%, transparent 70%)',
    filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  homeInner: {
    position: 'relative',
    zIndex: 1,
    padding: '48px 32px',
    maxWidth: '520px',
    margin: '0 auto',
    width: '100%',
  },
  eyebrow: {
    fontSize: '10px',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: '#D4849A',
    fontWeight: 500,
    marginBottom: '24px',
  },
  homeTitle: {
    fontSize: 'clamp(36px, 8vw, 64px)',
    fontWeight: 300,
    color: '#F5E8EE',
    fontFamily: 'Georgia, serif',
    lineHeight: 0.95,
    marginBottom: '24px',
  },
  em: { fontStyle: 'italic', color: '#D4849A' },
  rule: {
    width: '80px',
    height: '1px',
    background: 'linear-gradient(90deg, #B06078, transparent)',
    marginBottom: '24px',
  },
  homeSub: {
    fontSize: '15px',
    color: '#C4A8B2',
    fontWeight: 300,
    lineHeight: 1.7,
    marginBottom: '40px',
    maxWidth: '380px',
  },
  cta: {
    background: '#8B2040',
    color: '#F5E8EE',
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    padding: '16px 32px',
    borderRadius: '4px',
    border: 'none',
    display: 'block',
    marginBottom: '16px',
  },
  homeNote: {
    fontSize: '11px',
    color: '#7A5060',
    letterSpacing: '0.08em',
  },
}
