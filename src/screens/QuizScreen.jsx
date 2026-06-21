import { useState } from 'react'
import api, { STORE_ID } from '../api'

const QUESTIONS = [
    {
        id: 'ans_fruit',
        question: 'If you were choosing a fruit, which would you reach for?',
        hint: 'Think about what you naturally gravitate toward.',
        options: [
            { value: 'bright', label: 'Bright citrus', sub: 'Lemon, lime, grapefruit' },
            { value: 'fresh', label: 'Fresh berries', sub: 'Strawberry, raspberry, cherry' },
            { value: 'dark', label: 'Dark fruits', sub: 'Plum, blackberry, blueberry' },
            { value: 'stone', label: 'Stone fruit', sub: 'Peach, apricot, nectarine' },
        ]
    },
    {
        id: 'ans_texture',
        question: 'How do you take your coffee or tea?',
        hint: 'This tells us how bold or delicate you like your drinks.',
        options: [
            { value: 'bold', label: 'Strong espresso', sub: 'Black, no milk' },
            { value: 'medium', label: 'Smooth latte', sub: 'Milky, balanced' },
            { value: 'light', label: 'Light green tea', sub: 'Delicate, subtle' },
            { value: 'any', label: 'No preference', sub: 'Surprise me' },
        ]
    },
    {
        id: 'ans_sweetness',
        question: 'At the end of dinner, what do you reach for?',
        hint: 'Your sweet tooth — or lack of one — is a clear signal.',
        options: [
            { value: 'dry', label: 'Nothing sweet', sub: 'Cheese, nuts, olives' },
            { value: 'off-dry', label: 'A small bite', sub: 'Dark chocolate maybe' },
            { value: 'sweet', label: 'Full dessert', sub: 'Cake, tart, something proper' },
        ]
    },
    {
        id: 'ans_occasion',
        question: "Tonight's dinner is...",
        hint: 'The occasion helps us match the weight and style of the wine.',
        options: [
            { value: 'solo', label: 'Just me', sub: 'Quiet night in' },
            { value: 'casual', label: 'Casual dinner', sub: 'Friends, relaxed' },
            { value: 'intimate', label: 'Date night', sub: 'Something special' },
            { value: 'formal', label: 'Dinner party', sub: 'Guests, proper occasion' },
        ]
    },
    {
        id: 'ans_budget',
        question: "What's your bottle budget tonight?",
        hint: "We'll only show wines we actually have in stock in your range.",
        options: [
            { value: 'low', label: 'Under $30', sub: 'Great value picks' },
            { value: 'mid', label: '$30 – $45', sub: 'Most popular range' },
            { value: 'high', label: '$45+', sub: 'Premium selection' },
            { value: 'any', label: 'No limit', sub: 'Show me everything' },
        ]
    },
]

export default function QuizScreen({ onResults }) {
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState({})
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState(null)

    const q = QUESTIONS[step]
    const progress = ((step) / QUESTIONS.length) * 100

    async function handleSelect(value) {
        setSelected(value)
        const newAnswers = { ...answers, [q.id]: value }

        setTimeout(async () => {
            if (step < QUESTIONS.length - 1) {
                setAnswers(newAnswers)
                setSelected(null)
                setStep(step + 1)
            } else {
                // Last question — submit
                setLoading(true)
                try {
                    const res = await api.post('/recommend', {
                        store_id: STORE_ID,
                        ...newAnswers,
                    })
                    onResults(res.data)
                } catch (err) {
                    console.error(err)
                    setLoading(false)
                }
            }
        }, 300)
    }

    if (loading) {
        return (
            <div style={styles.loading}>
                <div style={styles.loadingInner}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingTitle}>Analysing your palate</p>
                    <p style={styles.loadingHint}>Matching against {'>'}40 wines in stock tonight...</p>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.screen}>
            {/* Progress bar */}
            <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>

            <div style={styles.inner}>
                {/* Step indicator */}
                <p style={styles.step}>Question {step + 1} of {QUESTIONS.length}</p>

                {/* Question */}
                <h2 style={styles.question}>{q.question}</h2>
                <p style={styles.hint}>{q.hint}</p>

                {/* Options */}
                <div style={styles.options}>
                    {q.options.map(opt => (
                        <button
                            key={opt.value}
                            style={{
                                ...styles.option,
                                ...(selected === opt.value ? styles.optionSelected : {})
                            }}
                            onClick={() => handleSelect(opt.value)}
                        >
                            <span style={styles.optLabel}>{opt.label}</span>
                            <span style={styles.optSub}>{opt.sub}</span>
                        </button>
                    ))}
                </div>

                {/* Back button */}
                {step > 0 && (
                    <button style={styles.back} onClick={() => setStep(step - 1)}>
                        ← Back
                    </button>
                )}
            </div>
        </div>
    )
}

const styles = {
    screen: {
        minHeight: '100vh',
        background: '#080808',
        display: 'flex',
        flexDirection: 'column',
    },
    progressBar: {
        width: '100%',
        height: '2px',
        background: 'rgba(212,132,154,0.15)',
    },
    progressFill: {
        height: '100%',
        background: '#D4849A',
        transition: 'width 0.4s ease',
    },
    inner: {
        flex: 1,
        padding: '48px 24px 32px',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
    },
    step: {
        fontSize: '11px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#B06078',
        marginBottom: '20px',
        fontWeight: 500,
    },
    question: {
        fontSize: 'clamp(22px, 5vw, 32px)',
        fontWeight: 300,
        color: '#F5E8EE',
        lineHeight: 1.25,
        marginBottom: '10px',
        fontFamily: 'Georgia, serif',
    },
    hint: {
        fontSize: '13px',
        color: '#C4A8B2',
        marginBottom: '36px',
        lineHeight: 1.6,
        fontWeight: 300,
    },
    options: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    option: {
        padding: '16px 20px',
        background: 'transparent',
        border: '1px solid rgba(212,132,154,0.15)',
        borderRadius: '6px',
        color: '#F5E8EE',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        transition: 'all 0.2s',
    },
    optionSelected: {
        border: '1px solid #D4849A',
        background: 'rgba(139,32,64,0.15)',
    },
    optLabel: {
        fontSize: '15px',
        fontWeight: 500,
        color: '#F5E8EE',
    },
    optSub: {
        fontSize: '12px',
        color: '#C4A8B2',
        fontWeight: 300,
    },
    back: {
        marginTop: '24px',
        background: 'transparent',
        color: '#7A5060',
        fontSize: '13px',
        padding: '8px 0',
    },
    loading: {
        minHeight: '100vh',
        background: '#080808',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingInner: {
        textAlign: 'center',
        padding: '32px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '2px solid rgba(212,132,154,0.2)',
        borderTop: '2px solid #D4849A',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 24px',
    },
    loadingTitle: {
        fontSize: '20px',
        color: '#F5E8EE',
        fontFamily: 'Georgia, serif',
        fontWeight: 300,
        marginBottom: '8px',
    },
    loadingHint: {
        fontSize: '13px',
        color: '#C4A8B2',
    },
}
