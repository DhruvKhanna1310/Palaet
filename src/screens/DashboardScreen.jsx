import { useState, useEffect } from 'react'
import api from '../api'

const STORE_ID = '51aed065-b215-48ce-8f42-753ef4464fe5'
const STORE_NAME = 'Hartford Wine & Spirits'

export default function DashboardScreen({ onExit }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const res = await api.get(`/analytics?store_id=${STORE_ID}&days=${days}`)
      setData(res.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (loading) return (
    <div style={s.loading}>
      <p style={s.loadingText}>Loading dashboard...</p>
    </div>
  )

  return (
    <div style={s.screen}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <p style={s.eyebrow}>Retailer Dashboard</p>
          <h1 style={s.storeName}>{STORE_NAME}</h1>
        </div>
        <div style={s.headerRight}>
          <div style={s.liveBadge}>
            <span style={s.liveDot}></span>
            Live
          </div>
          <button style={s.exitBtn} onClick={onExit}>← Back</button>
        </div>
      </div>

      {/* Period selector */}
      <div style={s.periodRow}>
        {[7, 30, 90].map(d => (
          <button
            key={d}
            style={{ ...s.periodBtn, ...(days === d ? s.periodActive : {}) }}
            onClick={() => setDays(d)}
          >
            {d} days
          </button>
        ))}
        <button style={s.refreshBtn} onClick={fetchAnalytics}>↻ Refresh</button>
      </div>

      {/* KPI Cards */}
      <div style={s.kpiRow}>
        <KPI label="Sessions" value={data.total_sessions} />
        <KPI label="Purchases" value={data.total_purchases} />
        <KPI label="Conversion" value={`${(data.conversion_rate * 100).toFixed(1)}%`} />
        <KPI label="Avg Basket" value={`$${data.avg_basket_value}`} />
        <KPI label="Low Stock" value={data.low_stock_alerts.length} alert={data.low_stock_alerts.length > 0} />
      </div>

      {/* Tabs */}
      <div style={s.tabRow}>
        {['overview', 'inventory', 'pos'].map(t => (
          <button
            key={t}
            style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab data={data} />}
      {tab === 'inventory' && <InventoryTab storeId={STORE_ID} onRefresh={fetchAnalytics} />}
      {tab === 'pos' && <POSTab storeId={STORE_ID} onRefresh={fetchAnalytics} />}
    </div>
  )
}

// ── KPI CARD ─────────────────────────────────────────────────
function KPI({ label, value, alert }) {
  return (
    <div style={{ ...s.kpi, ...(alert ? s.kpiAlert : {}) }}>
      <p style={s.kpiVal}>{value}</p>
      <p style={s.kpiLabel}>{label}</p>
    </div>
  )
}

// ── OVERVIEW TAB ─────────────────────────────────────────────
function OverviewTab({ data }) {
  const maxCount = Math.max(...data.sessions_by_day.map(d => d.count), 1)

  return (
    <div style={s.tabContent}>
      <div style={s.twoCol}>

        {/* Sessions by day chart */}
        <div style={s.card}>
          <p style={s.cardLabel}>Sessions by Day of Week</p>
          <div style={s.barChart}>
            {data.sessions_by_day.map(d => (
              <div key={d.day} style={s.barWrap}>
                <div style={s.barTrack}>
                  <div style={{
                    ...s.bar,
                    height: `${(d.count / maxCount) * 100}%`
                  }} />
                </div>
                <p style={s.barLabel}>{d.day}</p>
                <p style={s.barVal}>{d.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top recommended wines */}
        <div style={s.card}>
          <p style={s.cardLabel}>Top Recommended Wines</p>
          {data.top_wines.map((w, i) => (
            <div key={w.id} style={s.listItem}>
              <div style={s.listLeft}>
                <span style={s.listRank}>{i + 1}</span>
                <div>
                  <p style={s.listName}>{w.name}</p>
                  <p style={s.listSub}>${w.price} · {w.units_remaining} left</p>
                </div>
              </div>
              <span style={s.listVal}>{w.rec_count} recs</span>
            </div>
          ))}
        </div>

      </div>

      {/* Low stock alerts */}
      {data.low_stock_alerts.length > 0 && (
        <div style={s.alertBox}>
          <p style={s.alertTitle}>⚠️  Low Stock Alerts</p>
          <div style={s.alertGrid}>
            {data.low_stock_alerts.map(w => (
              <div key={w.id} style={s.alertItem}>
                <p style={s.alertName}>{w.name}</p>
                <p style={s.alertCount}>{w.units_remaining} left</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fruit distribution */}
      <div style={s.card}>
        <p style={s.cardLabel}>Customer Taste Profile — Fruit Preference</p>
        <div style={s.fruitRow}>
          {Object.entries(data.fruit_distribution).map(([fruit, count]) => {
            const total = Object.values(data.fruit_distribution).reduce((a, b) => a + b, 0)
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={fruit} style={s.fruitItem}>
                <div style={s.fruitBarWrap}>
                  <div style={{ ...s.fruitBar, height: `${pct}%` }} />
                </div>
                <p style={s.fruitLabel}>{fruit}</p>
                <p style={s.fruitPct}>{pct}%</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── INVENTORY TAB ─────────────────────────────────────────────
function InventoryTab({ storeId, onRefresh }) {
  const [wines, setWines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchWines() }, [])

  async function fetchWines() {
    setLoading(true)
    try {
      const res = await api.get(`/inventory?store_id=${storeId}`)
      setWines(res.data.wines)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function sellOne(wineId) {
    try {
      await api.post(`/inventory/${wineId}/sell`)
      fetchWines()
      onRefresh()
    } catch (e) { console.error(e) }
  }

  async function addStock(wineId, current) {
    const units = prompt(`Add stock for this wine. Current: ${current}. New total:`)
    if (!units || isNaN(units)) return
    try {
      await api.put(`/inventory/${wineId}/stock?units=${parseInt(units)}`)
      fetchWines()
    } catch (e) { console.error(e) }
  }

  if (loading) return <p style={s.loadingText}>Loading inventory...</p>

  return (
    <div style={s.tabContent}>
      <div style={s.card}>
        <p style={s.cardLabel}>Wine Inventory — {wines.length} bottles</p>
        <div style={s.invTable}>
          <div style={s.invHeader}>
            <span>Wine</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Actions</span>
          </div>
          {wines.map(w => (
            <div key={w.id} style={s.invRow}>
              <div>
                <p style={s.invName}>{w.name}</p>
                <p style={s.invRegion}>{w.region} · {w.year}</p>
              </div>
              <span style={s.invPrice}>${w.price}</span>
              <span style={{
                ...s.invStock,
                color: w.units_remaining <= 3 ? '#FF6B6B' : '#6BBF6B'
              }}>
                {w.units_remaining}
                {w.units_remaining <= 3 && ' ⚠️'}
              </span>
              <div style={s.invActions}>
                <button style={s.sellBtn} onClick={() => sellOne(w.id)}>– Sell</button>
                <button style={s.addBtn} onClick={() => addStock(w.id, w.units_remaining)}>+ Stock</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── POS TAB ───────────────────────────────────────────────────
function POSTab({ storeId, onRefresh }) {
  const [wines, setWines] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastSale, setLastSale] = useState(null)

  useEffect(() => { fetchWines() }, [])

  async function fetchWines() {
    setLoading(true)
    try {
      const res = await api.get(`/inventory?store_id=${storeId}&in_stock=true`)
      setWines(res.data.wines)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function recordSale(wine) {
    try {
      await api.post(`/inventory/${wine.id}/sell`)
      setLastSale(wine)
      fetchWines()
      onRefresh()
    } catch (e) { console.error(e) }
  }

  if (loading) return <p style={s.loadingText}>Loading wines...</p>

  return (
    <div style={s.tabContent}>
      {lastSale && (
        <div style={s.saleConfirm}>
          ✅ Sale recorded — {lastSale.name} · ${lastSale.price}
        </div>
      )}
      <div style={s.card}>
        <p style={s.cardLabel}>Record a Sale — tap a wine to mark it sold</p>
        <div style={s.posGrid}>
          {wines.map(w => (
            <button key={w.id} style={s.posCard} onClick={() => recordSale(w)}>
              <p style={s.posName}>{w.name}</p>
              <p style={s.posRegion}>{w.region}</p>
              <div style={s.posFoot}>
                <span style={s.posPrice}>${w.price}</span>
                <span style={s.posStock}>{w.units_remaining} left</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── STYLES ────────────────────────────────────────────────────
const s = {
  screen: { minHeight: '100vh', background: '#080808', padding: '0 0 60px' },
  loading: { minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#7A5060', fontSize: '14px' },

  header: { padding: '28px 24px 20px', borderBottom: '1px solid #1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4849A', marginBottom: '6px' },
  storeName: { fontSize: '22px', fontWeight: 300, color: '#F5E8EE', fontFamily: 'Georgia, serif' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6BBF6B', border: '1px solid rgba(107,191,107,0.25)', padding: '5px 10px', borderRadius: '20px' },
  liveDot: { width: '5px', height: '5px', borderRadius: '50%', background: '#6BBF6B', display: 'inline-block' },
  exitBtn: { background: 'transparent', color: '#7A5060', fontSize: '13px', padding: '6px 0' },

  periodRow: { padding: '14px 24px', display: 'flex', gap: '8px', borderBottom: '1px solid #1A1A1A' },
  periodBtn: { background: 'transparent', border: '1px solid #2A1A20', color: '#7A5060', fontSize: '12px', padding: '6px 14px', borderRadius: '20px' },
  periodActive: { border: '1px solid rgba(212,132,154,0.4)', color: '#D4849A', background: 'rgba(139,32,64,0.1)' },
  refreshBtn: { background: 'transparent', border: 'none', color: '#7A5060', fontSize: '13px', marginLeft: 'auto' },

  kpiRow: { display: 'flex', gap: '1px', background: '#1A1A1A', borderBottom: '1px solid #1A1A1A' },
  kpi: { flex: 1, padding: '20px 16px', background: '#0D0D0D', textAlign: 'center' },
  kpiAlert: { background: '#1A0808' },
  kpiVal: { fontSize: '28px', fontFamily: 'Georgia, serif', color: '#D4849A', fontWeight: 300, marginBottom: '4px' },
  kpiLabel: { fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A5060' },

  tabRow: { display: 'flex', gap: '0', borderBottom: '1px solid #1A1A1A', padding: '0 24px' },
  tab: { background: 'transparent', color: '#7A5060', fontSize: '13px', padding: '14px 20px', borderBottom: '2px solid transparent' },
  tabActive: { color: '#D4849A', borderBottom: '2px solid #8B2040' },

  tabContent: { padding: '24px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },

  card: { background: '#111', border: '1px solid #1E1E1E', borderRadius: '8px', padding: '20px' },
  cardLabel: { fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#D4849A', marginBottom: '16px' },

  barChart: { display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px' },
  barWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: '4px' },
  barTrack: { flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', background: 'rgba(212,132,154,0.06)', borderRadius: '3px', overflow: 'hidden' },
  bar: { width: '100%', background: 'linear-gradient(180deg, #A8364E, #8B2040)', borderRadius: '3px 3px 0 0', transition: 'height 0.4s ease' },
  barLabel: { fontSize: '10px', color: '#7A5060' },
  barVal: { fontSize: '11px', color: '#D4849A' },

  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1A1A1A' },
  listLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  listRank: { width: '20px', fontSize: '14px', fontFamily: 'Georgia, serif', color: 'rgba(212,132,154,0.3)' },
  listName: { fontSize: '13px', color: '#F5E8EE', fontWeight: 300, marginBottom: '2px' },
  listSub: { fontSize: '11px', color: '#7A5060' },
  listVal: { fontSize: '13px', color: '#D4849A', fontFamily: 'Georgia, serif' },

  alertBox: { background: 'rgba(139,0,0,0.1)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px' },
  alertTitle: { fontSize: '12px', color: '#FF8080', marginBottom: '12px', fontWeight: 500 },
  alertGrid: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  alertItem: { background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.15)', borderRadius: '6px', padding: '8px 12px' },
  alertName: { fontSize: '12px', color: '#F5E8EE', marginBottom: '2px' },
  alertCount: { fontSize: '11px', color: '#FF8080' },

  fruitRow: { display: 'flex', gap: '16px', alignItems: 'flex-end', height: '100px' },
  fruitItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' },
  fruitBarWrap: { flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', background: 'rgba(212,132,154,0.06)', borderRadius: '3px', overflow: 'hidden' },
  fruitBar: { width: '100%', background: 'linear-gradient(180deg, #D4849A, #8B2040)', borderRadius: '3px 3px 0 0' },
  fruitLabel: { fontSize: '10px', color: '#7A5060', textTransform: 'capitalize' },
  fruitPct: { fontSize: '11px', color: '#D4849A' },

  invTable: { display: 'flex', flexDirection: 'column', gap: '0' },
  invHeader: { display: 'grid', gridTemplateColumns: '2fr 80px 80px 140px', gap: '12px', padding: '8px 0', borderBottom: '1px solid #1A1A1A', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A5060' },
  invRow: { display: 'grid', gridTemplateColumns: '2fr 80px 80px 140px', gap: '12px', padding: '12px 0', borderBottom: '1px solid #111', alignItems: 'center' },
  invName: { fontSize: '13px', color: '#F5E8EE', marginBottom: '2px' },
  invRegion: { fontSize: '11px', color: '#7A5060' },
  invPrice: { fontSize: '13px', color: '#C4A8B2' },
  invStock: { fontSize: '14px', fontFamily: 'Georgia, serif', fontWeight: 300 },
  invActions: { display: 'flex', gap: '6px' },
  sellBtn: { background: 'rgba(139,32,64,0.2)', border: '1px solid rgba(139,32,64,0.3)', color: '#D4849A', fontSize: '11px', padding: '5px 10px', borderRadius: '4px' },
  addBtn: { background: 'rgba(107,191,107,0.1)', border: '1px solid rgba(107,191,107,0.25)', color: '#6BBF6B', fontSize: '11px', padding: '5px 10px', borderRadius: '4px' },

  saleConfirm: { background: 'rgba(107,191,107,0.1)', border: '1px solid rgba(107,191,107,0.25)', borderRadius: '6px', padding: '12px 16px', marginBottom: '16px', color: '#6BBF6B', fontSize: '13px' },
  posGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' },
  posCard: { background: '#0D0D0D', border: '1px solid #1E1E1E', borderRadius: '6px', padding: '14px', textAlign: 'left', cursor: 'pointer' },
  posName: { fontSize: '13px', color: '#F5E8EE', fontWeight: 300, marginBottom: '4px', lineHeight: 1.3 },
  posRegion: { fontSize: '11px', color: '#7A5060', marginBottom: '10px' },
  posFoot: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  posPrice: { fontSize: '16px', fontFamily: 'Georgia, serif', color: '#D4849A' },
  posStock: { fontSize: '10px', color: '#6BBF6B' },
}

