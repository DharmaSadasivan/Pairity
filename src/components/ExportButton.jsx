import { useState } from 'react'
import { buildDiffSegments } from '../lib/diff.js'

export default function ExportButton({ docxName, pdfName, docxText, pdfText, changeCount }) {
  const [copied, setCopied] = useState(false)

  function generateHtml() {
    const segments = buildDiffSegments(docxText, pdfText)
    const pass = changeCount === 0
    const date = new Date().toLocaleString()

    const diffHtml = segments.map((seg) => {
      if (seg.type === 'equal') return escapeHtml(seg.text)
      if (seg.type === 'deletion') {
        return `<mark style="background:rgba(234,34,97,0.10);color:#9b0033;text-decoration:line-through;border-radius:3px;padding:0 3px">${escapeHtml(seg.text)}</mark>`
      }
      return `<mark style="background:rgba(92,214,168,0.12);color:#0a5c3a;border-radius:3px;padding:0 3px">${escapeHtml(seg.text)}</mark>`
    }).join('')

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pairity Report — ${date}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');
    body { font-family: 'Inter', system-ui, sans-serif; font-weight: 300; max-width: 900px; margin: 2rem auto; padding: 0 1.5rem; color: #0d253d; background: #fff; -webkit-font-smoothing: antialiased; }
    header { border-bottom: 1px solid #e3e8ee; padding-bottom: 1.25rem; margin-bottom: 1.5rem; }
    h1 { font-size: 1.25rem; font-weight: 300; margin: 0 0 0.5rem; letter-spacing: -0.02em; }
    .meta { font-size: 0.8rem; color: #64748d; margin-top: 0.25rem; }
    .banner { border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; font-size: 0.9rem; display: flex; align-items: flex-start; gap: 14px; }
    .banner-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
    .pass { background: rgba(92,214,168,0.08); border: 1px solid rgba(92,214,168,0.3); }
    .fail { background: rgba(234,34,97,0.06); border: 1px solid rgba(234,34,97,0.2); }
    .pass .banner-dot { background: #5cd6a8; }
    .fail .banner-dot { background: #ea2261; }
    .banner-title { font-weight: 400; color: #0d253d; margin-bottom: 4px; }
    .banner-sub { color: #64748d; font-size: 0.8rem; }
    .diff { font-family: 'JetBrains Mono', 'Menlo', monospace; font-size: 0.8rem; line-height: 1.75; white-space: pre-wrap; word-break: break-word; background: #f6f9fc; border: 1px solid #e3e8ee; border-radius: 10px; padding: 1.25rem 1.5rem; max-height: 60vh; overflow-y: auto; color: #273951; }
    footer { margin-top: 2rem; font-size: 0.75rem; color: #64748d; border-top: 1px solid #e3e8ee; padding-top: 1rem; }
    a { color: #533afd; }
  </style>
</head>
<body>
  <header>
    <h1>Pairity — Document Comparison Report</h1>
    <div class="meta">Generated: ${date}</div>
    <div class="meta">Word document: <strong>${escapeHtml(docxName)}</strong></div>
    <div class="meta">PDF: <strong>${escapeHtml(pdfName)}</strong></div>
  </header>

  <div class="banner ${pass ? 'pass' : 'fail'}">
    <div class="banner-dot"></div>
    <div>
      <div class="banner-title">${pass ? 'No differences detected' : `${changeCount} difference${changeCount === 1 ? '' : 's'} detected`}</div>
      <div class="banner-sub">${pass
        ? 'The PDF is consistent with the Word document.'
        : 'The PDF differs from the Word document in the locations highlighted below.'}</div>
    </div>
  </div>

  ${pass ? '' : `<div class="diff">${diffHtml}</div>`}

  <footer>
    Produced by <a href="https://dharmasadasivan.github.io/Pairity/">Pairity</a> — open-source legal document verification.
    Documents were processed locally in the browser; no content was uploaded to any server.
  </footer>
</body>
</html>`
  }

  function downloadHtml() {
    const html = generateHtml()
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pairity-report-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copyToClipboard() {
    const segments = buildDiffSegments(docxText, pdfText)
    const plain = segments.map((seg) => {
      if (seg.type === 'equal') return seg.text
      if (seg.type === 'deletion') return `[-${seg.text}-]`
      return `[+${seg.text}+]`
    }).join('')

    const summary = changeCount === 0
      ? 'PASS — No differences detected.'
      : `FAIL — ${changeCount} difference(s) detected.\n\n${plain}`

    await navigator.clipboard.writeText(
      `Pairity Report\nWord: ${docxName}\nPDF: ${pdfName}\nDate: ${new Date().toLocaleString()}\n\n${summary}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <button
        onClick={downloadHtml}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 16px',
          borderRadius: 9999,
          border: 0,
          background: 'var(--color-primary)',
          color: '#fff',
          font: '400 13.5px/1 var(--font-sans)',
          cursor: 'pointer',
          transition: 'background 180ms',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-deep)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}
      >
        Download report
      </button>
      <button
        onClick={copyToClipboard}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 16px',
          borderRadius: 9999,
          border: '1px solid var(--color-hairline)',
          background: 'var(--color-canvas)',
          color: 'var(--color-ink)',
          font: '400 13.5px/1 var(--font-sans)',
          cursor: 'pointer',
          transition: 'background 180ms',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-canvas-soft)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--color-canvas)'}
      >
        {copied ? 'Copied!' : 'Copy to clipboard'}
      </button>
    </div>
  )
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
