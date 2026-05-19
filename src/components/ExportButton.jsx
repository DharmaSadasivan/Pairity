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
        return `<mark style="background:#fee2e2;color:#991b1b;text-decoration:line-through;border-radius:2px;padding:0 2px">${escapeHtml(seg.text)}</mark>`
      }
      return `<mark style="background:#dcfce7;color:#166534;border-radius:2px;padding:0 2px">${escapeHtml(seg.text)}</mark>`
    }).join('')

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pairity Report — ${date}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; color: #1e293b; }
    header { border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.5rem; }
    h1 { font-size: 1.5rem; margin: 0 0 0.25rem; }
    .meta { font-size: 0.85rem; color: #64748b; }
    .banner { border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; }
    .pass { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
    .fail { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
    .diff { font-family: monospace; font-size: 0.875rem; line-height: 1.7; white-space: pre-wrap; word-break: break-word; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; }
    footer { margin-top: 2rem; font-size: 0.75rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 1rem; }
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
    <strong>${pass ? '✅ No differences detected' : `⚠️ ${changeCount} difference${changeCount === 1 ? '' : 's'} detected`}</strong><br/>
    ${pass
      ? 'The PDF is consistent with the Word document.'
      : 'The PDF differs from the Word document in the locations highlighted below.'}
  </div>

  ${pass ? '' : `<div class="diff">${diffHtml}</div>`}

  <footer>
    Produced by <a href="https://github.com/pairity">Pairity</a> — open-source legal document verification.
    Documents were processed locally in the browser; no content was uploaded to any server.
  </footer>
</body>
</html>`
  }

  function downloadHtml() {
    const html = generateHtml()
    const blob = new Blob([html], { type: 'text/html' })
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
    <div className="flex gap-3">
      <button
        onClick={downloadHtml}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
      >
        Download report
      </button>
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
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
