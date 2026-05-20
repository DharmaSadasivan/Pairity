import { useState, useRef } from 'react'
import { normalise } from './lib/normalise.js'
import { computeDiff } from './lib/diff.js'
import ResultsBanner from './components/ResultsBanner.jsx'
import DiffViewer from './components/DiffViewer.jsx'
import ExportButton from './components/ExportButton.jsx'
import gradientMesh from './assets/gradient-mesh.svg'

const STATE = { UPLOAD: 'upload', PROCESSING: 'processing', RESULTS: 'results' }

/* ─────────────────────────────────────────────
   Shared atoms
────────────────────────────────────────────── */
const Btn = ({ children, variant = 'primary', as: Tag = 'button', href, onClick, disabled, target, rel, ...rest }) => {
  const cls = `btn btn-${variant}`
  if (Tag === 'a') return <a className={cls} href={href} onClick={onClick} target={target} rel={rel} {...rest}>{children}</a>
  return <button className={cls} onClick={onClick} disabled={disabled} {...rest}>{children}</button>
}

const PairityMark = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M3 8h14" /><path d="M14 5l3 3-3 3" />
    <path d="M21 16H7" /><path d="M10 19l-3-3 3-3" />
  </svg>
)

const Wordmark = ({ size = 22, color = 'var(--color-ink)' }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, lineHeight: 1 }}>
    <PairityMark size={Math.round(size * 0.95)} color={color} />
    <span style={{
      font: `300 ${size}px/1 var(--font-sans)`,
      letterSpacing: `${(-size * 0.05).toFixed(2)}px`,
      color,
      fontFeatureSettings: '"ss01" on'
    }}>Pairity</span>
  </span>
)

const ShieldIcon = ({ size = 14, color = 'var(--color-primary)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const GitHubIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2.01-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.9-.39.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.73.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
  </svg>
)

/* ─────────────────────────────────────────────
   Nav
────────────────────────────────────────────── */
function Nav({ showReset, onReset }) {
  const linkStyle = {
    font: '400 14px/1 var(--font-sans)',
    color: 'var(--color-ink)',
    opacity: 0.88,
    textDecoration: 'none',
    transition: 'opacity 180ms',
    cursor: 'pointer',
  }
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'saturate(180%) blur(12px)',
      WebkitBackdropFilter: 'saturate(180%) blur(12px)',
      borderBottom: '1px solid rgba(227,232,238,0.55)'
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', gap: 32, padding: '18px 32px'
      }}>
        <Wordmark size={22} />
        {!showReset && (
          <div style={{ display: 'flex', gap: 26, flex: 1, marginLeft: 12 }}>
            <a href="#how-it-works" style={linkStyle}>How it works</a>
            <a href="#why" style={linkStyle}>Why Pairity</a>
            <a href="#limitations" style={linkStyle}>Limitations</a>
          </div>
        )}
        {showReset && <div style={{ flex: 1 }} />}
        <a href="https://github.com/DharmaSadasivan/Pairity" target="_blank" rel="noreferrer"
          style={{ ...linkStyle, display: 'inline-flex', alignItems: 'center', gap: 6, opacity: 0.88 }}>
          <GitHubIcon size={15} /> GitHub
        </a>
        {showReset
          ? <button onClick={onReset} className="btn btn-ghost" style={{ fontSize: 14 }}>
              ← New comparison
            </button>
          : <Btn as="a" href="#compare" variant="primary">Compare documents</Btn>
        }
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────────
   DropZone
────────────────────────────────────────────── */
function DropZone({ kind, label, extension, file, onFile }) {
  const [over, setOver] = useState(false)
  const inputRef = useRef(null)

  const accept = kind === 'docx'
    ? '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    : '.pdf,application/pdf'

  const onDrop = (e) => {
    e.preventDefault()
    setOver(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  const filled = !!file
  const tint = kind === 'docx' ? '#3b6cff' : '#ea2261'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      style={{
        position: 'relative',
        border: `1.5px dashed ${over ? 'var(--color-primary)' : filled ? 'var(--color-primary-subdued)' : 'var(--color-hairline-input)'}`,
        background: filled ? 'rgba(83,58,253,0.04)' : over ? 'rgba(83,58,253,0.06)' : 'var(--color-canvas-soft)',
        borderRadius: 12,
        padding: '22px 18px',
        cursor: 'pointer',
        transition: 'border-color 180ms cubic-bezier(0.4,0,0.2,1), background 180ms cubic-bezier(0.4,0,0.2,1)',
        minHeight: 132,
        display: 'flex', flexDirection: 'column', gap: 10,
        userSelect: 'none',
      }}
    >
      <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]) }} />
      {/* Doc icon */}
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <rect x="6" y="3.5" width="20" height="27" rx="2.5"
          fill={filled ? tint : 'var(--color-canvas)'}
          fillOpacity={filled ? 0.1 : 1}
          stroke={filled ? tint : 'var(--color-hairline-input)'}
          strokeWidth="1.4" />
        <path d="M22 3.5 L22 10 L28 10" stroke={filled ? tint : 'var(--color-hairline-input)'} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
        <path d="M10 16h12M10 20h12M10 24h7" stroke={filled ? tint : 'var(--color-ink-mute)'} strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
        <text x="17" y="29" textAnchor="middle" style={{ font: '500 5.5px var(--font-sans)', fill: tint, letterSpacing: '0.3px' }}>
          {kind.toUpperCase()}
        </text>
      </svg>
      <div>
        <div style={{ font: '400 14px/1.2 var(--font-sans)', color: 'var(--color-ink)', letterSpacing: '-0.2px', marginBottom: 4 }}>
          {label}
        </div>
        {filled ? (
          <div className="tnum" style={{ font: '300 12.5px/1.4 var(--font-sans)', color: 'var(--color-ink-mute)', letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.name} · {formatBytes(file.size)}
          </div>
        ) : (
          <div style={{ font: '300 12.5px/1.4 var(--font-sans)', color: 'var(--color-ink-mute)', letterSpacing: '-0.2px' }}>
            Drag {extension} here or click to browse
          </div>
        )}
      </div>
    </div>
  )
}

function formatBytes(b) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(2)} MB`
}

/* ─────────────────────────────────────────────
   DropCard (Hero's right pane)
────────────────────────────────────────────── */
function DropCard({ docxFile, setDocxFile, pdfFile, setPdfFile, onCompare, error }) {
  const canCompare = !!docxFile && !!pdfFile
  return (
    <div id="compare" style={{
      background: 'var(--color-canvas)',
      borderRadius: 18,
      border: '1px solid var(--color-hairline)',
      boxShadow: '0 30px 80px rgba(0,55,112,0.10), 0 8px 24px rgba(0,55,112,0.06)',
      padding: 28,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--color-primary)', display: 'inline-block' }} />
          <span style={{ font: '500 11px/1 var(--font-sans)', letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--color-ink)' }}>
            Compare two documents
          </span>
        </div>
        <span className="tnum" style={{ font: '300 12px/1 var(--font-sans)', color: 'var(--color-ink-mute)', letterSpacing: '-0.2px' }}>
          Step 1 of 1
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <DropZone kind="docx" label="Final Word document" extension=".docx" file={docxFile} onFile={setDocxFile} />
        <DropZone kind="pdf" label="Signing PDF" extension=".pdf" file={pdfFile} onFile={setPdfFile} />
      </div>

      {error && (
        <div style={{
          marginTop: 16,
          background: 'rgba(234,34,97,0.06)',
          border: '1px solid rgba(234,34,97,0.2)',
          borderRadius: 10,
          padding: '12px 16px',
          font: '300 13px/1.5 var(--font-sans)',
          color: '#9b0033'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, font: '300 12.5px/1.4 var(--font-sans)', color: 'var(--color-ink-mute)', letterSpacing: '-0.2px' }}>
          <ShieldIcon size={13} />
          Files are read in-browser. Nothing leaves your device.
        </div>
        <Btn variant="primary" disabled={!canCompare} onClick={canCompare ? onCompare : undefined}>
          {canCompare ? 'Compare documents →' : 'Compare documents'}
        </Btn>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Hero section
────────────────────────────────────────────── */
function Hero({ docxFile, setDocxFile, pdfFile, setPdfFile, onCompare, error }) {
  return (
    <section style={{
      position: 'relative',
      background: `url('${gradientMesh}') center top / 100% 760px no-repeat, var(--color-canvas)`,
      paddingTop: 80, paddingBottom: 56
    }}>
      <div className="container" style={{
        display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 56, alignItems: 'flex-start'
      }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 18 }}>Document comparison</div>
          <h1 style={{
            font: '300 58px/1.04 var(--font-sans)',
            letterSpacing: '-1.6px',
            color: 'var(--color-ink)',
            fontFeatureSettings: '"ss01" on',
          }}>
            The last-mile<br />check between<br />draft and signing.
          </h1>
          <p style={{
            margin: '28px 0 36px', maxWidth: 480,
            font: '300 17px/1.55 var(--font-sans)',
            color: 'var(--color-ink-secondary)'
          }}>
            Pairity extracts text from your final&nbsp;
            <code style={{ font: '500 14px var(--font-mono)', color: 'var(--color-ink)' }}>.docx</code>
            &nbsp;and the signing&nbsp;
            <code style={{ font: '500 14px var(--font-mono)', color: 'var(--color-ink)' }}>.pdf</code>,
            normalises formatting differences, and flags any substantive changes.
            Everything runs locally in your browser.
          </p>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <Btn as="a" href="#compare" variant="primary">Compare documents</Btn>
            <Btn as="a" href="https://github.com/DharmaSadasivan/Pairity" target="_blank" rel="noreferrer" variant="text">
              View on GitHub →
            </Btn>
          </div>
        </div>

        <DropCard
          docxFile={docxFile} setDocxFile={setDocxFile}
          pdfFile={pdfFile} setPdfFile={setPdfFile}
          onCompare={onCompare} error={error}
        />
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Static diff preview section (dark navy)
────────────────────────────────────────────── */
const Del = ({ children }) => (
  <span style={{ background: 'rgba(234,34,97,0.18)', color: '#ffb1c6', textDecoration: 'line-through', textDecorationColor: 'rgba(234,34,97,0.6)', padding: '0 3px', borderRadius: 3 }}>{children}</span>
)
const Add = ({ children }) => (
  <span style={{ background: 'rgba(92,214,168,0.16)', color: '#a3edcb', padding: '0 3px', borderRadius: 3 }}>{children}</span>
)
const Mod = ({ children }) => (
  <span style={{ background: 'rgba(102,94,253,0.18)', color: '#c8c3ff', padding: '0 3px', borderRadius: 3 }}>{children}</span>
)

const leftLines = [
  { num: 47, content: <>4.3&nbsp;&nbsp; <em>Limitation of Liability.</em> Subject to Section 4.4 below,</> },
  { num: 48, content: <>the aggregate liability of each party arising out of or related to</> },
  { num: 49, flagged: true, content: <>this Agreement shall not exceed <Mod>the fees paid by Customer to</Mod></> },
  { num: 50, flagged: true, content: <><Mod>Provider in the twelve (12) months preceding the event</Mod>.</> },
  { num: 51, content: <>This limitation applies whether the action is in contract, tort,</> },
  { num: 52, flagged: true, content: <>strict liability, <Del>or otherwise</Del>, even if a party has been</> },
  { num: 53, content: <>advised of the possibility of such damages.</> },
  { num: 55, content: <>4.4&nbsp;&nbsp; <em>Exclusions.</em> The limitations in Section 4.3 do not apply</> },
  { num: 56, flagged: true, content: <>to (i) a party's <Del>indemnification</Del> obligations under Section 6,</> },
]

const rightLines = [
  { num: 47, content: <>4.3&nbsp;&nbsp; <em>Limitation of Liability.</em> Subject to Section 4.4 below,</> },
  { num: 48, content: <>the aggregate liability of each party arising out of or related to</> },
  { num: 49, flagged: true, content: <>this Agreement shall not exceed <Mod>the fees paid by Customer in</Mod></> },
  { num: 50, flagged: true, content: <><Mod>the six (6) months preceding the event giving rise to</Mod>.</> },
  { num: 51, content: <>This limitation applies whether the action is in contract, tort,</> },
  { num: 52, flagged: true, content: <>strict liability, <Add>or any other theory of liability</Add>, even if</> },
  { num: 53, content: <>a party has been advised of the possibility of such damages.</> },
  { num: 55, content: <>4.4&nbsp;&nbsp; <em>Exclusions.</em> The limitations in Section 4.3 do not apply</> },
  { num: 56, flagged: true, content: <>to (i) a party's obligations under Section 6,</> },
]

function DiffPreviewSection() {
  const DiffLine = ({ num, flagged, children }) => (
    <div style={{
      display: 'grid', gridTemplateColumns: '44px 1fr',
      background: flagged ? 'rgba(83,58,253,0.07)' : 'transparent',
      borderLeft: flagged ? '2px solid var(--color-primary-soft)' : '2px solid transparent',
      padding: '2px 0'
    }}>
      <span className="tnum" style={{ textAlign: 'right', paddingRight: 14, color: 'rgba(255,255,255,0.32)', font: '300 11px/1.7 var(--font-mono)', userSelect: 'none' }}>{num}</span>
      <span style={{ paddingRight: 22 }}>{children}</span>
    </div>
  )

  const DocPane = ({ isLeft }) => {
    const lines = isLeft ? leftLines : rightLines
    return (
      <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', background: isLeft ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
        <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ font: '500 12.5px/1.2 var(--font-sans)', color: 'var(--color-on-primary)', letterSpacing: '-0.2px' }}>
              {isLeft ? 'Final.docx' : 'Signing.pdf'}
            </div>
            <div style={{ font: '300 11.5px/1.2 var(--font-sans)', color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.1px', marginTop: 3 }}>
              {isLeft ? 'Master copy from negotiation' : 'PDF prepared for signature'}
            </div>
          </div>
          <div className="tnum" style={{ font: '300 11px/1 var(--font-sans)', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
            {isLeft ? '3,184 words' : '3,182 words'}
          </div>
        </div>
        <div style={{ padding: '14px 0', font: '300 13.5px/1.7 var(--font-sans)', color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.2px' }}>
          {lines.map((line, i) => <DiffLine key={i} num={line.num} flagged={line.flagged}>{line.content}</DiffLine>)}
        </div>
      </div>
    )
  }

  return (
    <section style={{ background: 'var(--color-ink)', padding: '96px 0 104px', color: 'var(--color-on-primary)', position: 'relative' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'flex-start', marginBottom: 56 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--color-primary-soft)', marginBottom: 14 }}>What you get back</div>
            <h2 style={{ font: '300 44px/1.06 var(--font-sans)', letterSpacing: '-1.1px', color: 'var(--color-on-primary)', fontFeatureSettings: '"ss01" on' }}>
              Substantive changes,<br />flagged in seconds.
            </h2>
          </div>
          <p style={{ font: '300 16px/1.6 var(--font-sans)', color: 'rgba(255,255,255,0.72)', margin: 0, maxWidth: 460, alignSelf: 'flex-end' }}>
            Pairity strips formatting, list numbering, and case differences before comparing — so you only see the changes that matter.
          </p>
        </div>

        {/* Faux diff window */}
        <div style={{ background: 'var(--color-brand-dark-900)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Window chrome */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 7 }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--color-ruby)', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--color-magenta)', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--color-primary-soft)', display: 'inline-block' }} />
            </div>
            <div style={{ marginLeft: 8, font: '300 12.5px/1 var(--font-sans)', color: 'rgba(255,255,255,0.72)', letterSpacing: '-0.2px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <PairityMark size={14} color="rgba(255,255,255,0.85)" />
              pairity · SaaS-MSA_FINAL.docx ↔ SaaS-MSA_signing.pdf
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div className="tnum" style={{ font: '300 12px/1 var(--font-sans)', color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.2px' }}>Processed locally · 1.42s</div>
            </div>
          </div>
          {/* Panes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px' }}>
            <DocPane isLeft={true} />
            <DocPane isLeft={false} />
            {/* Summary rail */}
            <div style={{ padding: 22, background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ font: '500 11px/1 var(--font-sans)', letterSpacing: '0.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
                {[{ label: 'Flagged', value: '3', tone: 'var(--color-primary-soft)' }, { label: 'Lines scanned', value: '412', tone: 'rgba(255,255,255,0.85)' }].map(s => (
                  <div key={s.label}>
                    <div className="tnum" style={{ font: '300 28px/1 var(--font-sans)', letterSpacing: '-0.6px', color: s.tone, fontFeatureSettings: '"ss01" on, "tnum" on' }}>{s.value}</div>
                    <div style={{ font: '300 11.5px/1 var(--font-sans)', color: 'rgba(255,255,255,0.55)', marginTop: 6, letterSpacing: '-0.1px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ font: '500 11px/1 var(--font-sans)', letterSpacing: '0.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>Substantive changes</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { line: '49', tag: 'Reworded', color: 'var(--color-primary-soft)', body: <>Liability cap shortened from <strong>12 months</strong> to <strong>6 months</strong>.</> },
                  { line: '52', tag: 'Added', color: '#5cd6a8', body: <>Inserted <em>"or any other theory of liability"</em>.</> },
                  { line: '56', tag: 'Removed', color: 'var(--color-ruby)', body: <>Deleted reference to <em>"indemnification"</em> obligations.</> },
                ].map(c => (
                  <li key={c.line} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ font: '500 10.5px/1 var(--font-sans)', letterSpacing: '0.4px', textTransform: 'uppercase', color: c.color, background: 'rgba(255,255,255,0.04)', border: `1px solid ${c.color}55`, borderRadius: 9999, padding: '4px 9px' }}>{c.tag}</span>
                      <span className="tnum" style={{ font: '300 11.5px/1 var(--font-mono)', color: 'rgba(255,255,255,0.5)' }}>L{c.line}</span>
                    </div>
                    <div style={{ font: '300 13px/1.5 var(--font-sans)', color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.2px' }}>{c.body}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ marginTop: 28, display: 'flex', gap: 28, flexWrap: 'wrap', font: '300 13px/1.4 var(--font-sans)', color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.2px' }}>
          {[{ color: 'var(--color-ruby)', label: 'Removed from .docx' }, { color: '#5cd6a8', label: 'Added in signing .pdf' }, { color: 'var(--color-primary-soft)', label: 'Reworded' }].map(l => (
            <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: l.color, display: 'inline-block' }} />
              {l.label}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', fontFeatureSettings: '"ss01" on, "tnum" on' }}>
            Sample: SaaS Master Services Agreement · §4.3 Limitation of Liability
          </span>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   How it works section
────────────────────────────────────────────── */
function HowItWorksSection() {
  const steps = [
    { n: '01', title: 'Drop in the final .docx and the signing .pdf.', body: 'Both files load directly into your browser — Pairity never sees them. Drag-and-drop, or click to browse.' },
    { n: '02', title: 'Pairity extracts and normalises the text.', body: 'Formatting, list numbering, and capitalisation are stripped so styling artefacts don’t fire as false positives. Only the words remain.' },
    { n: '03', title: 'Substantive differences are flagged for review.', body: 'Pairity surfaces every meaningful deviation. The result is a verification assist — not a substitute for legal review.' },
  ]
  return (
    <section id="how-it-works" style={{ background: 'var(--color-canvas)', padding: '120px 0 96px' }}>
      <div className="container">
        <div style={{ maxWidth: 720, marginBottom: 64 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>How it works</div>
          <h2 style={{ font: '300 44px/1.06 var(--font-sans)', letterSpacing: '-1.1px', color: 'var(--color-ink)', fontFeatureSettings: '"ss01" on' }}>
            Three steps. Nothing leaves your browser.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {steps.map(s => (
            <article key={s.n} style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 20, borderTop: '1px solid var(--color-hairline)' }}>
              <div className="tnum" style={{ font: '300 13px/1 var(--font-sans)', color: 'var(--color-primary)', letterSpacing: '0.4px', fontFeatureSettings: '"ss01" on, "tnum" on' }}>{s.n}</div>
              <h3 style={{ font: '300 22px/1.2 var(--font-sans)', letterSpacing: '-0.4px', color: 'var(--color-ink)' }}>{s.title}</h3>
              <p style={{ font: '300 15px/1.55 var(--font-sans)', color: 'var(--color-ink-secondary)' }}>{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Context band (cream, editorial)
────────────────────────────────────────────── */
function ContextBandSection() {
  const inlineCode = { font: '500 13.5px var(--font-mono)', background: 'rgba(13,37,61,0.06)', padding: '1px 6px', borderRadius: 4, color: 'var(--color-ink)' }
  const KvCard = ({ label, value }) => (
    <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(155,104,41,0.18)', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ font: '500 10.5px/1 var(--font-sans)', letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--color-lemon)', marginBottom: 8 }}>{label}</div>
      <div style={{ font: '300 14.5px/1.5 var(--font-sans)', color: 'var(--color-ink)', letterSpacing: '-0.2px' }}>{value}</div>
    </div>
  )
  return (
    <section id="why" style={{ background: 'var(--color-canvas)', padding: '0 0 96px' }}>
      <div className="container">
        <div style={{ background: 'var(--color-canvas-cream)', borderRadius: 18, padding: '64px 64px', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 64, alignItems: 'flex-start' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--color-lemon)', marginBottom: 14 }}>Why Pairity</div>
            <h2 style={{ font: '300 38px/1.1 var(--font-sans)', letterSpacing: '-0.9px', color: 'var(--color-ink)', margin: '0 0 28px', fontFeatureSettings: '"ss01" on' }}>
              The "last mile" of negotiation deserves its own tool.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, font: '300 16px/1.65 var(--font-sans)', color: 'var(--color-ink-secondary)', maxWidth: 540 }}>
              <p>At the end of a negotiation, both sides typically agree on a final version of the working document — usually a <code style={inlineCode}>.docx</code>. One side converts that file to a PDF for signing, and the other side then has to verify that no changes were introduced in the conversion.</p>
              <p>That "last mile" check is more time-consuming than running a <em>Compare</em> between two Word documents. Pairity is a fast, light web app for exactly that step.</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <KvCard label="What it does" value="Compares the text inside a .docx against the text inside a .pdf." />
            <KvCard label="How it works" value="Extracts and normalises text from both files, then flags substantive differences." />
            <KvCard label="Confidentiality" value="All processing happens in your browser. Files are never uploaded." />
            <KvCard label="Cost & licence" value={<>Free and open source. Released under the <a href="https://github.com/DharmaSadasivan/Pairity/blob/main/LICENSE" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>MIT licence</a>.</>} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Limitations section
────────────────────────────────────────────── */
function LimitationsSection() {
  const items = [
    'Scanned PDFs (image PDFs) are not supported — digitally-generated PDFs only.',
    'Text inside images cannot be compared.',
    'You must accept all tracked changes in the .docx before running a comparison.',
    'Headers and footers will often be flagged.',
    'Complex layouts — footnotes, tables, multi-column — may be flagged.',
    'Capitalisation changes are not flagged. Comparison is case-insensitive to avoid false positives from styling.',
    'Clause renumbering is not detected — auto-numbered list markers are stripped before comparison.',
    'Pairity is a verification assist tool, not a substitute for legal review.',
  ]
  const inlineCodeLight = { font: '500 13.5px var(--font-mono)', background: 'var(--color-canvas-soft)', padding: '1px 6px', borderRadius: 4, color: 'var(--color-ink)' }
  return (
    <section id="limitations" style={{ background: 'var(--color-canvas)', padding: '64px 0 120px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 64, marginBottom: 56, alignItems: 'flex-end' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Known limitations</div>
            <h2 style={{ font: '300 40px/1.08 var(--font-sans)', letterSpacing: '-1px', color: 'var(--color-ink)', fontFeatureSettings: '"ss01" on' }}>
              What Pairity does — and what it doesn&rsquo;t.
            </h2>
          </div>
          <p style={{ font: '300 16px/1.6 var(--font-sans)', color: 'var(--color-ink-secondary)', margin: 0, maxWidth: 520, justifySelf: 'end' }}>
            Pairity is built around a narrow brief — flag substantive changes in the text between a final&nbsp;<code style={inlineCodeLight}>.docx</code> and a signing&nbsp;<code style={inlineCodeLight}>.pdf</code>. The constraints below are deliberate, not bugs.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 48, rowGap: 0, borderTop: '1px solid var(--color-hairline)' }}>
          {items.map((text, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 8, padding: '24px 0', borderBottom: '1px solid var(--color-hairline)', alignItems: 'baseline' }}>
              <span className="tnum" style={{ font: '300 13px/1 var(--font-sans)', color: 'var(--color-primary)', letterSpacing: '0.6px', fontFeatureSettings: '"ss01" on, "tnum" on' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p style={{ font: '300 15.5px/1.55 var(--font-sans)', color: 'var(--color-ink-secondary)', margin: 0, letterSpacing: '-0.1px' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Footer
────────────────────────────────────────────── */
function SiteFooter() {
  const FooterCol = ({ title, items }) => (
    <div>
      <div style={{ font: '500 10.5px/1 var(--font-sans)', letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--color-ink)', marginBottom: 16 }}>{title}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(it => (
          <li key={it.label}>
            <a href={it.href} target={it.external ? '_blank' : undefined} rel={it.external ? 'noreferrer' : undefined}
              style={{ font: '300 13.5px/1.4 var(--font-sans)', color: 'var(--color-ink-mute)', letterSpacing: '-0.2px', textDecoration: 'none' }}>
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <footer style={{ background: 'var(--color-canvas)', borderTop: '1px solid var(--color-hairline)', padding: '56px 0 40px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 48, marginBottom: 40 }}>
          <div>
            <Wordmark size={22} />
            <p style={{ font: '300 13.5px/1.55 var(--font-sans)', color: 'var(--color-ink-mute)', letterSpacing: '-0.2px', marginTop: 16, maxWidth: 280 }}>
              A fast, browser-only check that no changes were introduced between your final negotiated document and the PDF for signing.
            </p>
          </div>
          <FooterCol title="The tool" items={[
            { label: 'Compare documents', href: '#compare' },
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Known limitations', href: '#limitations' },
          ]} />
          <FooterCol title="Open source" items={[
            { label: 'GitHub repository', href: 'https://github.com/DharmaSadasivan/Pairity', external: true },
            { label: 'MIT licence', href: 'https://github.com/DharmaSadasivan/Pairity/blob/main/LICENSE', external: true },
          ]} />
          <FooterCol title="Author" items={[
            { label: 'Dharma Sadasivan', href: 'https://sg.linkedin.com/in/dharma-sadasivan-ab6a3912', external: true },
          ]} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-hairline)', paddingTop: 22, gap: 24, flexWrap: 'wrap', font: '300 12.5px/1.4 var(--font-sans)', color: 'var(--color-ink-mute)', letterSpacing: '-0.2px' }}>
          <span>© 2026 Dharma Sadasivan · Released under the MIT licence.</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ShieldIcon size={13} />
            No data leaves your browser.
          </span>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────
   Processing view
────────────────────────────────────────────── */
function ProcessingView() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--color-hairline)', borderTopColor: 'var(--color-primary)', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ font: '300 17px/1.4 var(--font-sans)', color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>Extracting and comparing documents…</div>
      <div style={{ font: '300 13.5px/1.4 var(--font-sans)', color: 'var(--color-ink-mute)', letterSpacing: '-0.2px' }}>Processing is happening locally in your browser.</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Results view
────────────────────────────────────────────── */
function ResultsView({ results }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>
      <ResultsBanner changeCount={results.changes.length} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 24 }}>
        <div style={{ font: '300 13px/1.4 var(--font-sans)', color: 'var(--color-ink-mute)', letterSpacing: '-0.2px' }}>
          <span style={{ fontWeight: 400, color: 'var(--color-ink)' }}>{results.docxName}</span>
          <span style={{ margin: '0 10px', color: 'var(--color-hairline-input)' }}>vs</span>
          <span style={{ fontWeight: 400, color: 'var(--color-ink)' }}>{results.pdfName}</span>
        </div>
        <ExportButton
          docxName={results.docxName}
          pdfName={results.pdfName}
          docxText={results.docxText}
          pdfText={results.pdfText}
          changeCount={results.changes.length}
        />
      </div>

      {results.changes.length > 0 && (
        <DiffViewer docxText={results.docxText} pdfText={results.pdfText} />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   App root
────────────────────────────────────────────── */
export default function App() {
  const [docxFile, setDocxFile] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [appState, setAppState] = useState(STATE.UPLOAD)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)

  async function handleCompare() {
    if (!docxFile || !pdfFile) return
    setError(null)
    setAppState(STATE.PROCESSING)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    try {
      const [{ extractDocx }, { extractPdf }] = await Promise.all([
        import('./lib/extractDocx.js'),
        import('./lib/extractPdf.js'),
      ])
      const [rawDocx, rawPdf] = await Promise.all([extractDocx(docxFile), extractPdf(pdfFile)])
      const normDocx = normalise(rawDocx)
      const normPdf = normalise(rawPdf)
      const changes = computeDiff(normDocx, normPdf)
      setResults({ docxText: normDocx, pdfText: normPdf, changes, docxName: docxFile.name, pdfName: pdfFile.name })
      setAppState(STATE.RESULTS)
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during processing.')
      setAppState(STATE.UPLOAD)
    }
  }

  function handleReset() {
    setDocxFile(null)
    setPdfFile(null)
    setResults(null)
    setError(null)
    setAppState(STATE.UPLOAD)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (appState === STATE.PROCESSING) {
    return (
      <>
        <Nav />
        <ProcessingView />
      </>
    )
  }

  if (appState === STATE.RESULTS && results) {
    return (
      <>
        <Nav showReset onReset={handleReset} />
        <ResultsView results={results} />
        <SiteFooter />
      </>
    )
  }

  // UPLOAD state
  return (
    <>
      <Nav />
      <Hero
        docxFile={docxFile} setDocxFile={setDocxFile}
        pdfFile={pdfFile} setPdfFile={setPdfFile}
        onCompare={handleCompare} error={error}
      />
      <DiffPreviewSection />
      <HowItWorksSection />
      <ContextBandSection />
      <LimitationsSection />
      <SiteFooter />
    </>
  )
}
