import mammoth from 'mammoth'

export async function extractDocx(file) {
  const arrayBuffer = await file.arrayBuffer()
  // convertToHtml (rather than extractRawText) gives us explicit block elements
  // for every paragraph and soft return, so that adjacent paragraphs always
  // produce a whitespace boundary after normalisation — even when the source
  // document uses soft line breaks (Shift+Enter) with no trailing space.
  const result = await mammoth.convertToHtml({ arrayBuffer })
  return result.value
    // Self-closing line breaks → newline
    .replace(/<br\s*\/?>/gi, '\n')
    // Closing block elements → newline
    .replace(/<\/(p|div|li|h[1-6]|td|th)>/gi, '\n')
    // Strip all remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}
