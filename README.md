# EC2K2

Private EC2102 study site, expanded on 9 November 2026.

## Content

IB400 contains 400 original five-choice MCQs with answer keys, explanations for all choices, concept links, three difficulty levels, topic filters, practice and exam modes, review queues, bookmarks and browser-local progress with export/import.

EC2102 Decoded contains 12 chapters, 148 concept cards and 21 interactive experiment views. The source set is 13 supplied lecture PDFs and tutorials 1–9, including two official answer sheets and eight annotated companions checked against the course originals. The coverage map accounts for all 857 pages across these 32 PDFs. The original IS–LM–FE / AD–AS simulator is integrated under `dist/policy/`. The old top-level hash routes redirect into the new sections.

## November 9 content audit

All 400 questions, their answer keys and all 2,000 choice explanations were reviewed against the source material. The bank now contains 162 Tutorial, 193 Exam and 45 Challenge questions. The audit revised 129 question entries, including 46 changes to stems or choices, and added nine concepts while expanding 122 existing explanations. Revised attempts are flagged for another attempt without erasing other progress. Choice order is randomized per session and retained when resuming or importing a backup.

The consumption experiment includes the course square-root utility and a separately labelled log-utility illustration. Model and chart verification passed 9,596 checks. Browser checks covered all 148 concept routes, all 21 experiment views, all 400 displayed answers, all 2,000 feedback mappings, desktop/mobile layouts, timers, review, backups and revised-content migration.

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
