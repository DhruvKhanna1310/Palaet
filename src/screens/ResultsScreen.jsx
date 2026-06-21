import { useState } from 'react'
import api from '../api'

export default function ResultsScreen({ data, onRetake }) {
    const { recommendations, session_id, scored_by } = data
    const [selected, setSelected] = useState(null)
    const [confirmed, setConfirmed] = useState(false)
    const [confirming, setConfirming] = useState(false)

    async function handleConfirm(wine) {
        setConfirming(true)
        try {
            // Layer 1 — customer self-report
            // This fills purchased_id on the session row
            await api.post(`/session/${session_id}/confirm`, {
                purchased_wine_id: wine.id,
                purchase_source: 'customer_confirmed'
            })
        } catch (e) {
            // Silent fail — UX still completes even if API call fails
            console.error(e)
        }
        setConfirming(false)
        setConfirmed(wine)
    }

    // ── CONFIRMED SCREEN ──────────────────────────────────────
    if (confirmed) {
        return (
            <div style={styles.screen}>
                <div style={styles.confirmedWrap}>
                    <div style={styles.confirmedIcon}>🍷</div>
                    <p style={styles.confirmedEyebrow}>Perfect Choice</p>
                    <h2 style={styles.confirmedTitle}>{confirmed.name}</h2>
                    <p style={styles.confirmedRegion}>{confirmed.region} · {confirmed.year}</p>
                    <p style={styles.confirmedMsg}>
                        Enjoy every sip. We hope Palate found exactly what you were looking for tonight.
                    </p>
                    <button style={styles.retakeBtn} onClick={onRetake}>
                        ← Start over
                    </button>
                </div>
            </div>
        )
    }

    // ── WINE DETAIL SCREEN ────────────────────────────────────
    if (selected) {
        const wine = selected
        return (
            <div style={styles.screen}>
                <div style={styles.detailWrap}>

                    {/* Back button */}
                    <button style={styles.backBtn} onClick={() => setSelected(null)}>
                        ← Back to all wines
                    </button>

                    {/* Badge + rank */}
                    <div style={styles.detailTop}>
                        {wine.badge && <span style={styles.badge}>{wine.badge}</span>}
                    </div>

                    {/* Style + vintage */}
                    <div style={styles.styleLine}>
                        <span style={styles.dot}></span>
                        <span style={styles.styleText}>
                            {wine.style.toUpperCase()} · {wine.year}
                        </span>
                    </div>

                    {/* Name */}
                    <h1 style={styles.detailName}>{wine.name}</h1>
                    <p style={styles.detailRegion}>{wine.region}</p>

                    <div style={styles.divider}></div>

                    {/* Tasting notes */}
                    <p style={styles.detailLabel}>Tasting Notes</p>
                    <p style={styles.detailNotes}>{wine.tasting_notes}</p>

                    {/* Why we picked it */}
                    {wine.why && (
                        <>
                            <p style={styles.detailLabel}>Why Palate chose this for you</p>
                            <p style={styles.detailWhy}>"{wine.why}"</p>
                        </>
                    )}

                    {/* Pairing */}
                    {wine.pairing && (
                        <>
                            <p style={styles.detailLabel}>Food Pairing</p>
                            <p style={styles.detailPairing}>{wine.pairing}</p>
                        </>
                    )}

                    {/* Sensory profile */}
                    <p style={styles.detailLabel}>Sensory Profile</p>
                    <div style={styles.bars}>
                        <Bar label="Body" value={wine.body} />
                        <Bar label="Tannin" value={wine.tannin} />
                        <Bar label="Acidity" value={wine.acidity} />
                        <Bar label="Sweetness" value={wine.sweetness} />
                        <Bar label="Oak" value={wine.oak} />
                    </div>

                    {/* Price + stock */}
                    <div style={styles.detailFoot}>
                        <div>
                            <p style={styles.detailPrice}>${wine.price}</p>
                            <p style={styles.detailStock}>
                                <span style={styles.stockDot}></span>
                                In Stock · {wine.units_remaining} bottles left tonight
                            </p>
                        </div>
                    </div>

                    {/* THE KEY BUTTON */}
                    <button
                        style={styles.takingBtn}
                        onClick={() => handleConfirm(wine)}
                        disabled={confirming}
                    >
                        {confirming ? 'Saving your choice...' : `I'm taking this one →`}
                    </button>

                    <button style={styles.notBtn} onClick={() => setSelected(null)}>
                        Not this one — show me the others
                    </button>

                </div>
            </div>
        )
    }

    // ── RESULTS LIST ──────────────────────────────────────────
    return (
        <div style={styles.screen}>
            <div style={styles.inner}>

                <p style={styles.eyebrow}>Your Palate Match</p>
                <h2 style={styles.title}>Your wines <em style={styles.em}>are waiting.</em></h2>
                <p style={styles.sub}>
                    Tap a wine to explore it — then tell us which one you're taking home.
                </p>

                <div style={styles.cards}>
                    {recommendations.map((wine, i) => (
                        <button
                            key={wine.id}
                            style={styles.card}
                            onClick={() => setSelected(wine)}
                        >
                            <div style={styles.cardTop}>
                                {wine.badge
                                    ? <span style={styles.badge}>{wine.badge}</span>
                                    : <span />
                                }
                                <span style={styles.rank}>0{i + 1}</span>
                            </div>

                            <div style={styles.styleLine}>
                                <span style={styles.dot}></span>
                                <span style={styles.styleText}>
                                    {wine.style.toUpperCase()} · {wine.year}
                                </span>
                            </div>

                            <h3 style={styles.wineName}>{wine.name}</h3>
                            <p style={styles.region}>{wine.region}</p>

                            <div style={styles.divider}></div>

                            <p style={styles.notes}>{wine.tasting_notes}</p>

                            {wine.why && (
                                <p style={styles.why}>"{wine.why}"</p>
                            )}

                            <div style={styles.cardFoot}>
                                <span style={styles.price}>${wine.price}</span>
                                <div style={styles.stockRow}>
                                    <span style={styles.stockDot}></span>
                                    <span style={styles.stockText}>
                                        In Stock · {wine.units_remaining} left
                                    </span>
                                </div>
                            </div>

                            <div style={styles.tapHint}>Tap to explore →</div>
                        </button>
                    ))}
                </div>

                {/* None of these option */}
                <button style={styles.noneBtn} onClick={onRetake}>
                    None of these — retake the quiz
                </button>

                <p style={styles.debug}>
                    {scored_by} · session {session_id?.slice(0, 8)}
                </p>
            </div>
        </div>
    )
}

// ── SENSORY BAR COMPONENT ─────────────────────────────────────
function Bar({ label, value }) {
    return (
        <div style={barStyles.wrap}>
            <span style={barStyles.label}>{label}</span>
            <div style={barStyles.track}>
                <div style={{ ...barStyles.fill, width: `${(value / 10) * 100}%` }} />
            </div>
            <span style={barStyles.val}>{value}</span>
        </div>
    )
}

const barStyles = {
    wrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px',
    },
    label: {
        width: '72px',
        fontSize: '11px',
        color: '#7A5060',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        flexShrink: 0,
    },
    track: {
        flex: 1,
        height: '3px',
        background: 'rgba(212,132,154,0.12)',
        borderRadius: '2px',
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        background: 'linear-gradient(90deg, #8B2040, #D4849A)',
        borderRadius: '2px',
        transition: 'width 0.6s ease',
    },
    val: {
        width: '20px',
        fontSize: '11px',
        color: '#B06078',
        textAlign: 'right',
        flexShrink: 0,
    },
}

// ── STYLES ────────────────────────────────────────────────────
const styles = {
    screen: {
        minHeight: '100vh',
        background: '#0A0A0A',
    },
    inner: {
        maxWidth: '520px',
        margin: '0 auto',
        padding: '48px 24px 64px',
    },
    eyebrow: {
        fontSize: '10px',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#D4849A',
        fontWeight: 500,
        marginBottom: '12px',
    },
    title: {
        fontSize: 'clamp(26px, 5vw, 40px)',
        fontWeight: 300,
        color: '#F5E8EE',
        fontFamily: 'Georgia, serif',
        marginBottom: '8px',
    },
    em: {
        fontStyle: 'italic',
        color: '#D4849A',
    },
    sub: {
        fontSize: '13px',
        color: '#C4A8B2',
        marginBottom: '32px',
        fontWeight: 300,
        lineHeight: 1.6,
    },
    cards: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        marginBottom: '28px',
    },
    card: {
        background: '#111111',
        border: '1px solid #1E1E1E',
        borderRadius: '8px',
        padding: '22px 20px',
        textAlign: 'left',
        width: '100%',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        position: 'relative',
    },
    cardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
    },
    badge: {
        fontSize: '9px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#D4849A',
        border: '1px solid rgba(212,132,154,0.25)',
        padding: '3px 8px',
        borderRadius: '2px',
    },
    rank: {
        fontSize: '28px',
        fontFamily: 'Georgia, serif',
        fontWeight: 300,
        color: 'rgba(212,132,154,0.07)',
        lineHeight: 1,
    },
    styleLine: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '6px',
    },
    dot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#8B2040',
        flexShrink: 0,
        display: 'inline-block',
    },
    styleText: {
        fontSize: '10px',
        letterSpacing: '0.12em',
        color: '#C4A8B2',
        textTransform: 'uppercase',
    },
    wineName: {
        fontSize: 'clamp(17px, 3.5vw, 22px)',
        fontWeight: 300,
        color: '#F5E8EE',
        fontFamily: 'Georgia, serif',
        lineHeight: 1.15,
        marginBottom: '4px',
    },
    region: {
        fontSize: '12px',
        color: '#B06078',
        fontStyle: 'italic',
        fontFamily: 'Georgia, serif',
        marginBottom: '14px',
    },
    divider: {
        width: '24px',
        height: '1px',
        background: 'rgba(212,132,154,0.18)',
        marginBottom: '12px',
    },
    notes: {
        fontSize: '12px',
        color: '#C4A8B2',
        lineHeight: 1.7,
        fontWeight: 300,
        marginBottom: '8px',
    },
    why: {
        fontSize: '11px',
        color: 'rgba(176,96,120,0.8)',
        fontStyle: 'italic',
        paddingLeft: '10px',
        borderLeft: '1px solid rgba(212,132,154,0.18)',
        marginBottom: '14px',
        lineHeight: 1.5,
    },
    cardFoot: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid #1C1C1C',
        marginBottom: '10px',
    },
    price: {
        fontSize: '22px',
        fontFamily: 'Georgia, serif',
        color: '#F5E8EE',
        fontWeight: 300,
    },
    stockRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    },
    stockDot: {
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        background: '#6BBF6B',
        display: 'inline-block',
        flexShrink: 0,
    },
    stockText: {
        fontSize: '10px',
        color: '#6BBF6B',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
    },
    tapHint: {
        fontSize: '11px',
        color: '#8B2040',
        letterSpacing: '0.08em',
        textAlign: 'right',
    },
    noneBtn: {
        background: 'transparent',
        color: '#7A5060',
        fontSize: '13px',
        padding: '8px 0',
        display: 'block',
        marginBottom: '24px',
    },
    debug: {
        fontSize: '10px',
        color: '#2A1020',
        letterSpacing: '0.06em',
    },

    // ── DETAIL SCREEN ──
    detailWrap: {
        maxWidth: '520px',
        margin: '0 auto',
        padding: '32px 24px 80px',
    },
    backBtn: {
        background: 'transparent',
        color: '#7A5060',
        fontSize: '13px',
        padding: '8px 0',
        marginBottom: '28px',
        display: 'block',
    },
    detailTop: {
        marginBottom: '12px',
    },
    detailName: {
        fontSize: 'clamp(28px, 6vw, 44px)',
        fontWeight: 300,
        color: '#F5E8EE',
        fontFamily: 'Georgia, serif',
        lineHeight: 1.05,
        marginBottom: '6px',
    },
    detailRegion: {
        fontSize: '14px',
        color: '#B06078',
        fontStyle: 'italic',
        fontFamily: 'Georgia, serif',
        marginBottom: '24px',
    },
    detailLabel: {
        fontSize: '10px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#7A5060',
        marginBottom: '8px',
        marginTop: '24px',
    },
    detailNotes: {
        fontSize: '15px',
        color: '#C4A8B2',
        lineHeight: 1.75,
        fontWeight: 300,
    },
    detailWhy: {
        fontSize: '14px',
        color: 'rgba(176,96,120,0.9)',
        fontStyle: 'italic',
        paddingLeft: '14px',
        borderLeft: '2px solid rgba(139,32,64,0.4)',
        lineHeight: 1.6,
    },
    detailPairing: {
        fontSize: '14px',
        color: '#C4A8B2',
        fontWeight: 300,
        lineHeight: 1.6,
    },
    bars: {
        marginTop: '4px',
    },
    detailFoot: {
        marginTop: '32px',
        marginBottom: '8px',
        paddingTop: '20px',
        borderTop: '1px solid #1A1A1A',
    },
    detailPrice: {
        fontSize: '36px',
        fontFamily: 'Georgia, serif',
        color: '#F5E8EE',
        fontWeight: 300,
        marginBottom: '6px',
    },
    detailStock: {
        fontSize: '11px',
        color: '#6BBF6B',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
    },
    takingBtn: {
        width: '100%',
        background: '#8B2040',
        color: '#F5E8EE',
        fontSize: '15px',
        fontWeight: 500,
        letterSpacing: '0.06em',
        padding: '18px 24px',
        borderRadius: '6px',
        marginTop: '20px',
        marginBottom: '12px',
        display: 'block',
    },
    notBtn: {
        background: 'transparent',
        color: '#7A5060',
        fontSize: '13px',
        padding: '8px 0',
        display: 'block',
        width: '100%',
        textAlign: 'center',
    },

    // ── CONFIRMED SCREEN ──
    confirmedWrap: {
        maxWidth: '400px',
        margin: '0 auto',
        padding: '80px 24px',
        textAlign: 'center',
    },
    confirmedIcon: {
        fontSize: '48px',
        marginBottom: '24px',
    },
    confirmedEyebrow: {
        fontSize: '10px',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#D4849A',
        fontWeight: 500,
        marginBottom: '16px',
    },
    confirmedTitle: {
        fontSize: 'clamp(26px, 5vw, 40px)',
        fontWeight: 300,
        color: '#F5E8EE',
        fontFamily: 'Georgia, serif',
        marginBottom: '8px',
    },
    confirmedRegion: {
        fontSize: '14px',
        color: '#B06078',
        fontStyle: 'italic',
        fontFamily: 'Georgia, serif',
        marginBottom: '28px',
    },
    confirmedMsg: {
        fontSize: '15px',
        color: '#C4A8B2',
        lineHeight: 1.7,
        fontWeight: 300,
        marginBottom: '40px',
    },
    retakeBtn: {
        background: 'transparent',
        color: '#7A5060',
        fontSize: '13px',
        padding: '8px 0',
    },
}