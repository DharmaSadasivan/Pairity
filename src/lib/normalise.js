export function normalise(text) {
  return text
    // NFKC normalisation: resolves composed vs decomposed Unicode characters
    // and compatibility equivalents (ligatures, special spaces, etc.).
    // This eliminates false positives caused by Word and pdf.js encoding the
    // same character in different Unicode forms.
    .normalize(‘NFKC’)
    // Strip invisible/zero-width characters that Word embeds but PDFs omit
    // (zero-width space, ZWNJ, ZWJ, soft hyphen, BOM/ZWNBSP, object replacement)
    .replace(/[​‌‍­﻿￼]/g, ‘’)
    // Unify smart/curly quotes → straight quotes
    .replace(/[‘’]/g, “’”)
    .replace(/[“”]/g, ‘”’)
    // Unify em-dashes and double-hyphens → single hyphen-minus
    .replace(/—|--/g, ‘-’)
    // Unify en-dashes → hyphen-minus
    .replace(/–/g, ‘-’)
    // Collapse all whitespace sequences (spaces, tabs, newlines) into a
    // single space. Paragraph/line-break differences are non-substantive.
    .replace(/\s+/g, ‘ ‘)
    .trim()
}
