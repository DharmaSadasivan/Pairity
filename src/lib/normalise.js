export function normalise(text) {
  return text
    // NFKC normalisation: resolves composed vs decomposed Unicode characters
    // and compatibility equivalents (ligatures, special spaces, etc.).
    // This eliminates false positives caused by Word and pdf.js encoding the
    // same character in different Unicode forms.
    .normalize("NFKC")
    // Strip invisible/zero-width characters that Word embeds but PDFs omit:
    // U+200B zero-width space, U+200C ZWNJ, U+200D ZWJ,
    // U+00AD soft hyphen, U+FEFF BOM, U+FFFC object replacement char
    .replace(/[​‌‍­﻿￼]/g, "")
    // Unify smart/curly quotes to straight quotes
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    // Unify em-dash, en-dash, double-hyphen to a single hyphen-minus
    .replace(/—|--/g, "-")
    .replace(/–/g, "-")
    // Collapse all whitespace (spaces, tabs, newlines) into a single space.
    // Paragraph/line-break differences are non-substantive.
    .replace(/\s+/g, " ")
    .trim()
}
