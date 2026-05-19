export function normalise(text) {
  return text
    // Unify smart/curly quotes → straight quotes
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    // Unify em-dashes and double-hyphens → single hyphen-minus
    // (treated as equivalent punctuation for comparison purposes)
    .replace(/—|--/g, '-')
    // Unify en-dashes → hyphen-minus
    .replace(/–/g, '-')
    // Collapse all whitespace sequences (spaces, tabs, newlines) into a
    // single space. Paragraph/line-break differences are non-substantive.
    .replace(/\s+/g, ' ')
    .trim()
}
