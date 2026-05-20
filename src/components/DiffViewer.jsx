import { buildDiffSegments } from '../lib/diff.js'
import { useMemo } from 'react'

export default function DiffViewer({ docxText, pdfText }) {
  const segments = useMemo(() => buildDiffSegments(docxText, pdfText), [docxText, pdfText])

  return (
    <div style={{
      borderRadius: 14,
      border: '1px solid var(--color-hairline)',
      background: 'var(--color-canvas)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-1)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--color-hairline)',
        background: 'var(--color-canvas-soft)',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
      }}>
        <span style={{ font: '500 11px/1 var(--font-sans)', letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--color-ink-mute)' }}>
          Annotated diff
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '300 12.5px/1 var(--font-sans)', color: 'var(--color-ink-mute)' }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'rgba(234,34,97,0.2)', border: '1px solid rgba(234,34,97,0.4)' }} />
          Removed from Word doc
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '300 12.5px/1 var(--font-sans)', color: 'var(--color-ink-mute)' }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'rgba(92,214,168,0.2)', border: '1px solid rgba(92,214,168,0.4)' }} />
          Added in PDF
        </span>
      </div>

      {/* Diff content */}
      <div style={{
        padding: '20px 24px',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        lineHeight: 1.75,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: 'var(--color-ink-secondary)',
        maxHeight: '60vh',
        overflowY: 'auto',
      }}>
        {segments.map((seg, i) => {
          if (seg.type === 'equal') return <span key={i}>{seg.text}</span>
          if (seg.type === 'deletion') {
            return (
              <mark key={i} style={{
                background: 'rgba(234,34,97,0.10)',
                color: '#9b0033',
                textDecoration: 'line-through',
                textDecorationColor: 'rgba(234,34,97,0.5)',
                borderRadius: 3,
                padding: '0 3px',
              }}>
                {seg.text}
              </mark>
            )
          }
          return (
            <mark key={i} style={{
              background: 'rgba(92,214,168,0.12)',
              color: '#0a5c3a',
              borderRadius: 3,
              padding: '0 3px',
            }}>
              {seg.text}
            </mark>
          )
        })}
      </div>
    </div>
  )
}
