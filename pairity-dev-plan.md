# Pairity — Development Plan

## Project Overview

**Pairity** is an open-source legal document verification tool that compares a final negotiated Word document (`.docx`) against a PDF prepared for signing, to detect whether any changes were introduced during the conversion/clean-up process.

**Target users:** Lawyers reviewing a counterparty-prepared signing PDF against their agreed final Word document.

**Core value proposition:** Client-side processing only — no documents are uploaded to any server. This is a hard requirement for legal confidentiality.

---

## Problem Statement

At the conclusion of contract negotiations, one side prepares a "clean" PDF for signing. The receiving party must verify that the PDF is identical in substance to the final agreed Word document. This check is currently done manually and is time-consuming and error-prone. Pairity automates this check.

---

## Scope — Version 1

### In scope
- Input: one `.docx` file + one `.pdf` file
- Output: pass/fail result + annotated diff report
- Client-side processing only (no server, no uploads)
- Digitally-generated PDFs only (not scanned/OCR)
- Web app interface

### Out of scope (v1)
- Word vs Word comparison (already handled by Word's built-in Compare function)
- PDF vs PDF comparison
- Scanned/OCR PDFs
- Bulk/batch processing
- Track changes handling (input `.docx` is assumed to be the clean final version with all changes accepted)

---

## Normalisation Rules

These are applied before comparison to eliminate non-substantive differences:

| Normalise away | Reason |
|---|---|
| Whitespace differences | Not substantive |
| Line break / paragraph break differences | Formatting artefact |
| Smart quotes → straight quotes | No legal meaning difference |
| Em-dashes / double hyphens → unified form | No legal meaning difference |
| Headers and footers | Extracted separately or excluded from main comparison |

| Always flag | Reason |
|---|---|
| Any punctuation change | Can affect legal meaning |
| Any word-level text change | Substantive |
| Any insertion or deletion of text | Substantive |
| Structural reordering of clauses | Treat as substantive — same clause in different position may carry different meaning or scope |

---

## Technical Architecture

### Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | React (Vite) | Fast, component-based, easy to deploy as static site |
| Styling | Tailwind CSS | Utility-first, no build complexity |
| `.docx` extraction | `mammoth.js` | Browser-compatible, extracts clean text from `.docx`, handles accepted-changes state |
| PDF extraction | `pdf.js` (Mozilla) | Browser-native, reliable for digitally-generated PDFs, no server needed |
| Diff engine | `diff-match-patch` (Google) or `jsdiff` | Word-level diff with change detection |
| Deployment | GitHub Pages or Netlify | Static site, suits open-source model |

### Processing Pipeline

```
[User uploads .docx]          [User uploads .pdf]
        │                              │
        ▼                              ▼
  mammoth.js                      pdf.js
  Extract text                  Extract text
        │                              │
        ▼                              ▼
  Normalise text                Normalise text
  (whitespace, quotes,          (whitespace, quotes,
   em-dashes)                    em-dashes)
        │                              │
        └──────────┬───────────────────┘
                   ▼
           Diff engine
           (word-level)
                   │
                   ▼
        ┌──────────┴──────────┐
        │                     │
   No differences         Differences found
        │                     │
        ▼                     ▼
  ✅ PASS result        ❌ FAIL result
  "Documents are        + Annotated diff
   identical"            report
```

### Key Technical Decisions

**Why mammoth.js for `.docx`:**
mammoth.js extracts the accepted/final text state of a Word document without requiring server-side processing. It handles the common Word XML edge cases (runs, paragraph marks, field codes) and is well-maintained. It does not extract tracked changes — which is correct behaviour for Pairity since the input `.docx` should already be the clean final version.

**Why pdf.js for PDF:**
Mozilla's pdf.js is the standard for browser-based PDF text extraction. It handles digitally-generated PDFs (Word-to-PDF) reliably. Known limitation: text extraction order for complex layouts (footnotes, text boxes) may need tuning — test against real contract PDFs early in development.

**Diff granularity:**
Word-level diff (not character-level, not line-level). Word-level produces the most readable and legally meaningful output — a lawyer can see "the word 'reasonable' was changed to 'sole'" rather than a character-by-character breakdown.

---

## Output / Report

### Pass state
```
✅ No differences detected
The PDF is consistent with the Word document.
```

### Fail state
```
⚠️ X difference(s) detected

[Annotated view showing:]
- Deleted text highlighted in red with strikethrough
- Inserted text highlighted in green
- Location context: clause/paragraph reference where possible
```

The report should be exportable (copy to clipboard, or download as HTML/PDF) so the lawyer can document their review.

---

## UI/UX Design

### Layout
Single-page app, three states:

1. **Upload state** — Two drop zones side by side: "Final Word Document (.docx)" and "Signing PDF (.pdf)". Single "Compare" button.

2. **Processing state** — Progress indicator while extraction and diff run (entirely client-side, so should be fast).

3. **Results state** — Pass/fail banner at top. If fail: scrollable annotated diff below. Option to start a new comparison.

### Trust messaging
Prominent note on the upload screen: *"Pairity processes your documents locally in your browser. No files are uploaded to any server."*

---

## File Structure

```
pairity/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── UploadZone.jsx       # File drop/upload UI
│   │   ├── ResultsBanner.jsx    # Pass/fail display
│   │   ├── DiffViewer.jsx       # Annotated diff display
│   │   └── ExportButton.jsx     # Download/copy report
│   ├── lib/
│   │   ├── extractDocx.js       # mammoth.js wrapper
│   │   ├── extractPdf.js        # pdf.js wrapper
│   │   ├── normalise.js         # Text normalisation
│   │   └── diff.js              # Diff logic wrapper
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## Development Phases

### Phase 1 — Core pipeline (MVP)
- [ ] Scaffold Vite + React + Tailwind project
- [ ] Implement `.docx` text extraction (`extractDocx.js`)
- [ ] Implement PDF text extraction (`extractPdf.js`)
- [ ] Implement normalisation (`normalise.js`)
- [ ] Implement word-level diff (`diff.js`)
- [ ] Wire up basic UI: upload → compare → result

### Phase 2 — Output quality
- [ ] Annotated diff viewer with highlighted changes
- [ ] Location context in diff output (paragraph/section reference)
- [ ] Export report (HTML download or copy to clipboard)
- [ ] Tune PDF extraction for contract document formats (test with real samples)

### Phase 3 — Polish & open-source readiness
- [ ] Trust/privacy messaging in UI
- [ ] README with usage instructions, methodology, and limitations
- [ ] CONTRIBUTING guide
- [ ] Licensing (suggest MIT or Apache 2.0)
- [ ] Deploy to GitHub Pages

---

## Known Limitations (to document in README)

1. **Scanned PDFs not supported.** Pairity requires digitally-generated PDFs. PDFs created by physically printing and scanning a document will not produce reliable results.

2. **Complex PDF layouts.** Text boxes, footnotes, and multi-column layouts in PDFs may extract in unexpected order. Users should be aware of this for documents with non-standard formatting.

3. **Track changes must be accepted.** The `.docx` input should be the clean final version with all tracked changes accepted. Pairity does not resolve or interpret tracked changes.

4. **Images and tables.** Text within images embedded in the document cannot be extracted or compared. Tables are compared as extracted text; visual table formatting is not compared.

5. **Not a substitute for legal review.** Pairity is a verification assist tool. A clean Pairity result does not replace a lawyer's substantive review of the document.

---

## Open Source Considerations

- **Licence:** MIT recommended — maximises adoption, aligns with legal community's trust requirements (ability to audit the code)
- **Key README sections:** What it does, what it doesn't do, how to run locally, how to contribute, privacy statement
- **No telemetry, no analytics, no external calls** — any such features would undermine the trust proposition

---

*Prepared for development handoff — May 2026*
