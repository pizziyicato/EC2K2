# EC2K2

Private EC2102 study site, expanded on 9 November 2026.

## Content

IB400 contains 400 original five-choice MCQs with answer keys, explanations for all choices, concept links, three difficulty levels, topic filters, practice and exam modes, review queues, bookmarks and browser-local progress with export/import.

EC2102 Decoded contains 12 chapters, 139 concept cards and 21 interactive experiment views. The source set is 13 supplied lecture PDFs and tutorials 1–9. The original IS–LM–FE / AD–AS simulator is integrated under `dist/policy/`. The old top-level hash routes redirect into the new sections.

## Source layout

- `dist/data.json` stores the original question and concept content with PDF page references.
- `dist/app.js` implements the study interface and progress storage.
- `dist/labs.js` contains the interactive model equations and charts.
- `dist/styles.css` implements the responsive layout.
- `.openai/hosting.json` preserves the existing private Site identity.

This is a buildless static site. Serve the `dist` directory for local preview. The Sites source helper commits, pushes and packages that directory for the existing Site.

## Boundaries

The final Week 13 coverage announcement and Tutorial 10 were not available in the local source set. Do not claim certified coverage of later material. Difficulty classifications are pedagogical judgments, not official exam labels. Numerical models are illustrative. Progress is local to each browser and can be backed up with Export progress.

Preserve distinctions between Classical and fixed-FE Keynesian fiscal models, horizontal fixed-price SRAS and misperceptions SRAS, nominal and real interest-rate bounds, saving and assets with initial wealth, and the fixed-natural-rate and hysteresis hypotheses.
