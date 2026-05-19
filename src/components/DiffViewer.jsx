import { buildDiffSegments } from '../lib/diff.js'
import { useMemo } from 'react'

export default function DiffViewer({ docxText, pdfText }) {
  const segments = useMemo(() => buildDiffSegments(docxText, pdfText), [docxText, pdfText])

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Annotated diff</span>
        <span className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-200 border border-red-400"></span> Removed from Word doc
          <span className="inline-block w-3 h-3 rounded-sm bg-green-200 border border-green-400 ml-2"></span> Added in PDF
        </span>
      </div>
      <div className="p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-slate-800">
        {segments.map((seg, i) => {
          if (seg.type === 'equal') return <span key={i}>{seg.text}</span>
          if (seg.type === 'deletion') {
            return (
              <mark key={i} className="bg-red-100 text-red-800 line-through decoration-red-400 rounded px-0.5">
                {seg.text}
              </mark>
            )
          }
          return (
            <mark key={i} className="bg-green-100 text-green-800 rounded px-0.5">
              {seg.text}
            </mark>
          )
        })}
      </div>
    </div>
  )
}
