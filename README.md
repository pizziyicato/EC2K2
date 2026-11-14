# EC2K2

Public EC2102 study site at https://ec2k2.pizziyicato.chatgpt.site.

## Content

IB400 contains 400 original five-choice MCQs with answer keys, explanations for all choices, concept links, three difficulty levels, topic filters, practice and exam modes, review queues, bookmarks and browser-local progress with export/import.

S&T100 contains 100 six-choice synthesis MCQs designed above the IB400 Challenge level. Each combines course mechanisms, constraints, multiple changes or reverse reasoning and explains why its reasoning demands go further.

Wong Wei Kang Recaps converts all ten supplied tutorials into 120 six-choice revision MCQs, mapped to 108 requested source parts. The source-part map connects every requested subpart to one or more questions. All choices have explanations and each question links to Decoded. The section identifies the course lecturer and is an independent study adaptation.

The navigation order is IB400, S&T100, EC2102 Decoded, then Wong Wei Kang Recaps. Every bank supports separate progress, source or shuffled order, option strikethrough, practice and exam modes, question redo and full-set redo. Strikes use stable option identities and survive resume and backup import. Redo clears the current response, confidence and eliminations while retaining the previous marked result until the next check, the attempt count and the first-answer result. Starting a new set replaces the single active session. Existing version-2 backups remain compatible.

EC2102 Decoded contains 12 chapters, 148 concept cards and 21 interactive experiment views. Every concept now has a guided derivation, graph-building sequence, independent increase and decrease sequences, and edge-case reasoning. Predict-before-reveal checkpoints, typed explanations, curve highlighting and an enlarged graph view support active study. Walk position and predictions are stored with browser-local progress and included in export/import. Each concept opens a relevant experiment below its walkthrough.

The November 9 audit covered 13 supplied lecture PDFs, tutorials 1–9, two official answer sheets and eight annotated companions, totalling 857 pages across 32 PDFs. The November 14 expansion additionally uses all ten tutorial question papers and all ten answer files. The earlier audit remains dated separately. The original IS–LM–FE / AD–AS simulator is integrated under `dist/policy/`. The old top-level hash routes redirect into the new sections.

Tutorial 10 now also extends the efficiency-wage walkthrough with the joint profit-maximization first-order conditions, the positive-employment qualification, the discrete effort/wage comparison, employment calculation and labor-availability boundary. Existing step indexes were retained. Decoded now has 2,450 steps and 746 prediction checkpoints.

## November 14 validation

All 220 new questions and their 1,320 choice explanations were independently reviewed against the tutorial sources and stated model assumptions. Six draft S&T questions were strengthened after comparison with IB400 Challenge. Ambiguous utility weights, finite MPC responses, asset timing and borrowing assumptions were made explicit. Recap questions remain self-contained in shuffled sets.

Browser checks passed all 620 rendered keys and all 3,320 option-feedback mappings, plus five/six-option layouts, strikethrough/restore, selected-option elimination, saved order and markings, redo with retained attempt counts, hidden exam answers, timer expiry, export/import including sixth choices, legacy backups, source-question Back navigation, bank filters, desktop/mobile layouts and the 25-step efficiency-wage walkthrough. IB400's data file is byte-identical to its previously audited version.

## November 10 guided walkthroughs

All 148 concepts have five guided sequences, with 2,443 steps, 743 prediction checkpoints and 121 diagrams (86 plots and 35 reasoning maps). Symbol tables identify assumptions and connect illustrative notation to the lecture notation. The IS, LM and AD sequences explicitly transfer underlying market equilibria into the derived axes before drawing the locus. Both directional cases and boundary branches are worked separately. Figures use labelled numerical teaching calibrations. Final browser verification passed all 2,443 steps, 740 sequences, 743 checkpoints and all 12 mobile chapter layouts, with no page errors. The UI checks also passed resume, typed predictions, export/import, keyboard navigation, graph enlargement and a question-bank regression.

Prediction text and visited steps are learning records, not automatic proof of understanding. The existing 400 questions and answer content are unchanged by this update.

## November 9 content audit

All 400 questions, their answer keys and all 2,000 choice explanations were reviewed against the source material. The bank now contains 162 Tutorial, 193 Exam and 45 Challenge questions. The audit revised 129 question entries, including 46 changes to stems or choices, and added nine concepts while expanding 122 existing explanations. Revised attempts are flagged for another attempt without erasing other progress. Choice order is randomized per session and retained when resuming or importing a backup.

The consumption experiment includes the course square-root utility and a separately labelled log-utility illustration. Model and chart verification passed 9,596 checks. Browser checks covered all 148 concept routes, all 21 experiment views, all 400 displayed answers, all 2,000 feedback mappings, desktop/mobile layouts, timers, review, backups and revised-content migration.

## Source layout

- `dist/data.json` stores the original question and concept content with PDF page references.
- `dist/banks.json` stores S&T100, tutorial recaps and the tutorial-part coverage ledger.
- `dist/quiz.js` renders the shared five/six-option quiz experience and validates saved sessions.
- `dist/walkthroughs.json` stores the guided sequences, source references and equation-generated diagrams.
- `dist/walkthrough.js` renders step navigation, graph reveals, predictions and saved walkthrough progress.
- `dist/app.js` implements the study interface and progress storage.
- `dist/labs.js` contains the interactive model equations and charts.
- `dist/styles.css` implements the responsive layout.
- `.openai/hosting.json` preserves the existing Site identity. Preserve the public audience requested on November 14.

This is a buildless static site. Serve the `dist` directory for local preview. The Sites source helper commits, pushes and packages that directory for the existing Site.

## Boundaries

All ten tutorials and their answer files are available in the November 14 source set. A separate final Week 13 assessment-coverage announcement was not found. Do not claim certification of the final assessment scope. Difficulty classifications are pedagogical judgments, not official exam labels. Numerical models are illustrative. Progress is local to each browser and can be backed up with Export progress. Public access does not publish a visitor's local progress.

Preserve distinctions between Classical and fixed-FE Keynesian fiscal models, horizontal fixed-price SRAS and misperceptions SRAS, nominal and real interest-rate bounds, saving and assets with initial wealth, and the fixed-natural-rate and hysteresis hypotheses.
