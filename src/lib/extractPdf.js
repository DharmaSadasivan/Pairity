import * as pdfjsLib from 'pdfjs-dist'

// Point the worker at the bundled worker file shipped with pdfjs-dist.
// Vite exposes ?url imports so we can get the exact resolved path at build time.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export async function extractPdf(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pageTexts = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()

    // Items arrive roughly in reading order. Group by approximate y-position
    // so text on the same line is joined with a space, then lines are joined
    // with a newline. This avoids run-together words that occur when adjacent
    // items are simply concatenated.
    const lines = []
    let currentY = null
    let currentLine = []

    for (const item of content.items) {
      if (!('str' in item)) continue

      const y = Math.round(item.transform[5])

      if (currentY === null) {
        currentY = y
      }

      if (Math.abs(y - currentY) > 2) {
        if (currentLine.length) lines.push(currentLine.join(' '))
        currentLine = []
        currentY = y
      }

      if (item.str.trim()) currentLine.push(item.str.trim())
    }

    if (currentLine.length) lines.push(currentLine.join(' '))
    pageTexts.push(lines.join('\n'))
  }

  return pageTexts.join('\n')
}
