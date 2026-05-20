export default function ResultsBanner({ changeCount }) {
  const pass = changeCount === 0

  return (
    <div style={{
      borderRadius: 14,
      padding: '24px 28px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 20,
      background: pass ? 'rgba(92,214,168,0.08)' : 'rgba(234,34,97,0.06)',
      border: `1px solid ${pass ? 'rgba(92,214,168,0.3)' : 'rgba(234,34,97,0.2)'}`,
    }}>
      {/* Status dot */}
      <div style={{
        width: 10, height: 10, borderRadius: 5, flexShrink: 0, marginTop: 6,
        background: pass ? '#5cd6a8' : 'var(--color-ruby)',
      }} />
      <div>
        <div style={{
          font: '400 18px/1.2 var(--font-sans)',
          letterSpacing: '-0.3px',
          color: 'var(--color-ink)',
          marginBottom: 6,
        }}>
          {pass ? 'No differences detected' : `${changeCount} difference${changeCount === 1 ? '' : 's'} detected`}
        </div>
        <div style={{
          font: '300 14px/1.5 var(--font-sans)',
          color: 'var(--color-ink-mute)',
          letterSpacing: '-0.2px',
        }}>
          {pass
            ? 'The PDF is consistent with the Word document.'
            : 'The PDF differs from the Word document in the locations highlighted below.'}
        </div>
      </div>
    </div>
  )
}
