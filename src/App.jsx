import { useState } from 'react'
import UploadZone from './components/UploadZone.jsx'
import ResultsBanner from './components/ResultsBanner.jsx'
import DiffViewer from './components/DiffViewer.jsx'
import ExportButton from './components/ExportButton.jsx'
import { normalise } from './lib/normalise.js'
import { computeDiff } from './lib/diff.js'

const STATE = { UPLOAD: 'upload', PROCESSING: 'processing', RESULTS: 'results' }

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

    try {
      const [{ extractDocx }, { extractPdf }] = await Promise.all([
        import('./lib/extractDocx.js'),
        import('./lib/extractPdf.js'),
      ])

      const [rawDocx, rawPdf] = await Promise.all([
        extractDocx(docxFile),
        extractPdf(pdfFile),
      ])

      const normDocx = normalise(rawDocx)
      const normPdf = normalise(rawPdf)
      const changes = computeDiff(normDocx, normPdf)

      setResults({
        docxText: normDocx,
        pdfText: normPdf,
        changes,
        docxName: docxFile.name,
        pdfName: pdfFile.name,
      })
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
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pairity</h1>
            <p className="text-xs text-slate-500 mt-0.5">Legal document comparison</p>
          </div>
          {appState === STATE.RESULTS && (
            <button
              onClick={handleReset}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← New comparison
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Upload state */}
        {appState === STATE.UPLOAD && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-800">
                Compare your final Word document against the signing PDF
              </h2>
              <p className="text-slate-500 mt-2 text-sm max-w-xl mx-auto">
                Upload both files below. Pairity will extract their text, normalise
                formatting differences, and flag any substantive changes.
              </p>
            </div>

            {/* Privacy note */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-800">
              <span className="text-lg leading-none mt-0.5">🔒</span>
              <div>
                <strong>Your documents stay on your device.</strong>{' '}
                Pairity processes everything locally in your browser.
                No files are uploaded to any server.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <UploadZone
                label="Final Word Document (.docx)"
                accept=".docx"
                file={docxFile}
                onFile={setDocxFile}
                icon="📄"
              />
              <UploadZone
                label="Signing PDF (.pdf)"
                accept=".pdf"
                file={pdfFile}
                onFile={setPdfFile}
                icon="📋"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-800">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleCompare}
                disabled={!docxFile || !pdfFile}
                className={`
                  px-8 py-3 rounded-xl font-semibold text-sm transition-colors
                  ${docxFile && pdfFile
                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                Compare documents
              </button>
            </div>

            {/* About Pairity */}
            <div className="border-t border-slate-200 pt-8 space-y-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">What it does</div>
                  <div className="text-sm text-slate-700">Compares DOCX vs PDF text</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">How it works</div>
                  <div className="text-sm text-slate-700">Pairity extracts and compares text directly between the DOCX and PDF.</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Confidentiality</div>
                  <div className="text-sm text-slate-700">Processing takes place entirely within your browser, ensuring confidentiality. Files are not sent to anyone.</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Cost and licence</div>
                  <div className="text-sm text-slate-700">Pairity is free and open source for you to use and adapt.</div>
                </div>

              </div>

              <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Context</div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  At the end of contractual negotiations, lawyers on both sides typically have a final version of the
                  working document (often in .docx format). One side may convert the final version to PDFs for signing,
                  requiring the other side to then check the PDF against the final version of the working document, to
                  ensure that no changes have been introduced. This "last mile" document check can be time consuming
                  and not as simple as doing a Compare between two Word documents. Pairity is a fast and light web app
                  to help you with "last mile" document checks.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Known limitations</div>
                <ol className="text-sm text-slate-700 space-y-2">
                  <li className="flex gap-2"><span className="text-slate-400 shrink-0">(1)</span><span>Scanned PDFs (i.e. image PDFs) are not supported — digitally-generated PDFs only.</span></li>
                  <li className="flex gap-2"><span className="text-slate-400 shrink-0">(2)</span><span>Text inside images cannot be compared.</span></li>
                  <li className="flex gap-2"><span className="text-slate-400 shrink-0">(3)</span><span>You must accept all tracked changes in the .docx before doing the comparison.</span></li>
                  <li className="flex gap-2"><span className="text-slate-400 shrink-0">(4)</span><span>Headers and Footers will often be flagged.</span></li>
                  <li className="flex gap-2"><span className="text-slate-400 shrink-0">(5)</span><span>Complex layouts (footnotes, tables, multi-column, etc.) may be flagged.</span></li>
                  <li className="flex gap-2"><span className="text-slate-400 shrink-0">(6)</span><span>Capitalisation changes are not flagged — comparison is case-insensitive. This avoids false positives from styling markups.</span></li>
                  <li className="flex gap-2"><span className="text-slate-400 shrink-0">(7)</span><span>Clause renumbering is not detected — auto-numbered list markers are stripped before comparison to avoid false positives from styling markups.</span></li>
                  <li className="flex gap-2"><span className="text-slate-400 shrink-0">(8)</span><span>Pairity is a verification assist tool, not a substitute for legal review.</span></li>
                </ol>
              </div>

            </div>
          </div>
        )}

        {/* Processing state */}
        {appState === STATE.PROCESSING && (
          <div className="flex flex-col items-center justify-center gap-5 py-24">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-slate-600 font-medium">Extracting and comparing documents…</div>
            <div className="text-slate-400 text-sm">Processing is happening locally in your browser.</div>
          </div>
        )}

        {/* Results state */}
        {appState === STATE.RESULTS && results && (
          <div className="space-y-6">
            <ResultsBanner changeCount={results.changes.length} />

            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                <span className="font-medium">{results.docxName}</span>
                <span className="mx-2 text-slate-300">vs</span>
                <span className="font-medium">{results.pdfName}</span>
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
        )}

      </main>

      <footer className="text-center text-xs text-slate-400 py-8 space-y-1">
        <div>Copyright &copy; 2026 Dharma Sadasivan</div>
        <div>
          Pairity is provided free of charge as open-source software under an{' '}
          <a
            href="https://github.com/DharmaSadasivan/Pairity/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600"
          >
            MIT licence
          </a>
          {' '}·{' '}
          <a
            href="https://github.com/DharmaSadasivan/Pairity"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600"
          >
            GitHub
          </a>
        </div>
        <div>No data leaves your browser.</div>
      </footer>
    </div>
  )
}
