# Pairity

**Open-source legal document comparison tool.**

At the end of contract negotiations, one party prepares a clean PDF for signing. Pairity lets the receiving party verify that the PDF is substantively identical to the final agreed Word document — catching any changes introduced during the clean-up process.

**Live site: [dharmasadasivan.github.io/Pairity](https://dharmasadasivan.github.io/Pairity/)**

---

## What it does

1. You upload your final `.docx` (with all tracked changes accepted) and the signing `.pdf`.
2. Pairity extracts the text from both files, normalises non-substantive formatting differences (whitespace, smart quotes, dash variants), and runs a word-level diff.
3. You get a **pass** (no differences) or **fail** (annotated list of every insertion and deletion) result.
4. You can download the report as an HTML file or copy it to the clipboard.

**Everything happens in your browser. No files are sent to any server.**

---

## What it flags

| Flagged | Reason |
|---|---|
| Any word insertion or deletion | Substantive |
| Any punctuation change | Can affect legal meaning |
| Structural reordering of text | Treated as substantive |

## What it normalises away (does not flag)

| Normalised | Reason |
|---|---|
| Whitespace and line-break differences | Non-substantive formatting |
| Smart quotes → straight quotes | No legal meaning difference |
| Em-dashes / en-dashes / double-hyphens → hyphen | No legal meaning difference |
| Capitalisation differences | Heading styles (e.g. ALL CAPS in PDF vs mixed case in Word) |
| Auto-numbered clause markers | Word list numbers not stored as text; stripped from both before comparison |

---

## Running locally

```bash
git clone https://github.com/DharmaSadasivan/Pairity.git
cd Pairity
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

To build a production bundle:

```bash
npm run build
# output is in dist/
```

---

## Known limitations

1. **Scanned PDFs are not supported.** Pairity requires digitally-generated PDFs (e.g. exported from Word). PDFs created by printing and scanning will not produce reliable results.

2. **Complex PDF layouts.** Text boxes, footnotes, and multi-column layouts may extract in an unexpected reading order. Be aware of this for documents with non-standard formatting.

3. **Tracked changes must be accepted.** The `.docx` you upload should be the clean final version with all tracked changes accepted. Pairity does not interpret or resolve tracked changes.

4. **Images and tables.** Text inside embedded images cannot be compared. Tables are compared as extracted text; visual table structure is not compared.

5. **Headers and footers.** PDF headers and footers (page numbers, document titles, confidentiality notices) are included in the PDF text extraction. Word headers and footers are excluded by the extraction library. This means header and footer content may appear as differences in the output. These are easy to identify and disregard; a lawyer reviewing the diff will recognise them for what they are.

6. **Capitalisation changes are not flagged.** Comparison is case-insensitive. This is intentional — Word headings are often stored in mixed case but rendered in ALL CAPS by a style, producing false positives if case is compared. Substantive word-level changes are still detected regardless of case.

7. **Clause renumbering is not detected.** Auto-numbered list markers (e.g. `(1)`, `1.`, `a.`) are stripped from both documents before comparison to avoid false positives caused by Word's auto-numbering not appearing in the source XML. This means that if a clause was renumbered in the PDF, Pairity will not flag it.

8. **Not a substitute for legal review.** A clean Pairity result does not replace a lawyer's substantive review of the document. Pairity is a verification assist tool.

---

## Privacy

Pairity is a fully static web application. It has no backend, no API calls, no analytics, and no telemetry. Your documents are processed entirely inside your browser using [mammoth.js](https://github.com/mwilliamson/mammoth.js) (for `.docx`) and [pdf.js](https://github.com/mozilla/pdf.js) (for `.pdf`). Nothing leaves your machine.

You can verify this by inspecting the network tab in your browser's developer tools while using the application — you will see no outbound requests after the initial page load.

---

## Technology

| Component | Library |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| `.docx` extraction | mammoth.js |
| PDF extraction | pdf.js (Mozilla) |
| Diff engine | diff-match-patch (Google) |

---

## Licence

[MIT](LICENSE) — use it, audit it, fork it.

Copyright (c) 2026 Dharma Sadasivan
