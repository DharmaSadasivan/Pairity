# Contributing to Pairity

Thank you for your interest in contributing. Pairity is a tool used by lawyers to verify legal documents, so correctness and trust are the top priorities.

---

## Ground rules

- **No server-side processing.** Pairity's core promise is that documents never leave the user's browser. Any contribution that introduces network calls involving document content will not be accepted.
- **No telemetry or analytics.** No tracking of any kind.
- **Keep dependencies minimal.** Every dependency is a supply-chain trust decision. New dependencies need a clear justification.

---

## How to contribute

### Reporting bugs

Open an issue with:
- A description of the unexpected behaviour
- The type of document involved (e.g. "multi-column PDF", "DOCX with footnotes") — you do not need to share the actual document
- Steps to reproduce, if possible
- Browser and OS

### Suggesting improvements

Open an issue before writing code for any non-trivial change. Describe the problem you're solving and your proposed approach. This avoids wasted effort if the direction isn't right.

### Submitting a pull request

1. Fork the repository and create a branch from `main`.
2. Make your changes.
3. Test with real `.docx` and `.pdf` pairs — include a note in the PR describing what you tested.
4. Open a pull request with a clear description of what changed and why.

---

## Development setup

```bash
git clone https://github.com/your-org/pairity.git
cd pairity
npm install
npm run dev
```

---

## Architecture overview

```
src/
  lib/
    extractDocx.js   # mammoth.js wrapper — extracts raw text from .docx
    extractPdf.js    # pdf.js wrapper — extracts text from digitally-generated PDFs
    normalise.js     # Strips non-substantive differences before comparison
    diff.js          # Word-level diff via diff-match-patch; segment builder for rendering
  components/
    UploadZone.jsx   # File drop/select UI for each input
    ResultsBanner.jsx # Pass/fail result header
    DiffViewer.jsx   # Inline annotated diff with red/green highlights
    ExportButton.jsx  # HTML download + clipboard copy
  App.jsx            # Top-level state machine: upload → processing → results
```

The comparison pipeline is: extract → normalise → diff. All three steps run client-side in the browser.

---

## Areas where contributions are especially welcome

- **PDF extraction robustness** — testing with diverse contract formats (footnotes, schedules, multi-column layouts) and improving the text extraction order in `extractPdf.js`
- **Normalisation rules** — additional non-substantive differences that should be collapsed before comparison (with justification for why they are non-substantive)
- **Accessibility** — keyboard navigation, screen reader support, colour contrast
- **Internationalisation** — the diff logic works on Unicode text, but the UI is English-only

---

## Licence

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
