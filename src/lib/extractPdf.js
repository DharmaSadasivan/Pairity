import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export async function extractPdf(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pageTexts = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    pageTexts.push(buildPageText(content.items))
  }

  return pageTexts.join('\n')
}

function buildPageText(items) {
  const textItems = items
    .filter(item => 'str' in item && item.str.trim())
    .map(item => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width || 0,
      height: item.height || 0,
    }))

  if (!textItems.length) return ''

  // Use median item height to set a robust line-grouping threshold.
  const heights = textItems.map(i => i.height).filter(h => h > 0).sort((a, b) => a - b)
  const medianHeight = heights[Math.floor(heights.length / 2)] || 10
  const lineThreshold = medianHeight * 0.5

  // Sort top-to-bottom (y descending in PDF coord space), then left-to-right.
  textItems.sort((a, b) => {
    const dy = b.y - a.y
    if (Math.abs(dy) > lineThreshold) return dy
    return a.x - b.x
  })

  // Group into lines by y proximity.
  const lines = []
  let currentLine = []
  let currentY = null

  for (const item of textItems) {
    if (currentY === null || Math.abs(item.y - currentY) > lineThreshold) {
      if (currentLine.length) lines.push([...currentLine])
      currentLine = [item]
      currentY = item.y
    } else {
      currentLine.push(item)
    }
  }
  if (currentLine.length) lines.push(currentLine)

  // Build each line's text. Insert a space between adjacent items only when
  // there is a visible gap (gap > 15% of font size).
  return lines
    .map(line => {
      let text = ''
      for (let i = 0; i < line.length; i++) {
        if (i > 0) {
          const prev = line[i - 1]
          const gap = line[i].x - (prev.x + prev.width)
          if (gap > medianHeight * 0.15) text += ' '
        }
        text += line[i].str
      }
      return text
    })
    .join('\n')
}
