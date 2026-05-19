import DiffMatchPatch from 'diff-match-patch'

const dmp = new DiffMatchPatch()

// DIFF_DELETE = -1, DIFF_INSERT = 1, DIFF_EQUAL = 0
const EQUAL = 0
const INSERT = 1
const DELETE = -1

export function computeDiff(docxText, pdfText) {
  // Work at word+punctuation level: split on whitespace boundaries while
  // keeping the delimiter tokens so the text round-trips exactly.
  const { chars1, chars2, lineArray } = dmp.diff_linesToChars_(
    tokenise(docxText),
    tokenise(pdfText),
  )

  const diffs = dmp.diff_main(chars1, chars2, false)
  dmp.diff_charsToLines_(diffs, lineArray)
  dmp.diff_cleanupSemantic(diffs)

  // Build a flat list of change objects with surrounding context.
  const changes = []
  let docxOffset = 0
  let pdfOffset = 0

  // Rebuild full token arrays for context extraction.
  const docxTokens = tokenise(docxText).split('\n').filter(Boolean)
  const pdfTokens = tokenise(pdfText).split('\n').filter(Boolean)

  for (const [op, text] of diffs) {
    const tokens = text.split('\n').filter(Boolean)
    const count = tokens.length

    if (op === EQUAL) {
      docxOffset += count
      pdfOffset += count
      continue
    }

    const context = extractContext(
      op === DELETE ? docxTokens : pdfTokens,
      op === DELETE ? docxOffset : pdfOffset,
      5,
    )

    changes.push({
      type: op === DELETE ? 'deletion' : 'insertion',
      text: tokens.join(' '),
      context,
      docxOffset,
      pdfOffset,
    })

    if (op === DELETE) docxOffset += count
    if (op === INSERT) pdfOffset += count
  }

  return changes
}

function extractContext(tokens, offset, radius) {
  const start = Math.max(0, offset - radius)
  const end = Math.min(tokens.length, offset + radius)
  return tokens.slice(start, end).join(' ')
}

// Split text into one token per line so diff_linesToChars_ operates on words.
// Preserves punctuation attached to words (e.g. "obligation," stays together).
function tokenise(text) {
  return text.split(/\s+/).filter(Boolean).join('\n') + '\n'
}

export function buildDiffSegments(docxText, pdfText) {
  // Returns an array of {type: 'equal'|'deletion'|'insertion', text} segments
  // suitable for rendering an inline annotated diff.
  const diffs = dmp.diff_main(docxText, pdfText, false)
  dmp.diff_cleanupSemantic(diffs)

  return diffs.map(([op, text]) => ({
    type: op === EQUAL ? 'equal' : op === DELETE ? 'deletion' : 'insertion',
    text,
  }))
}
