# EC2K2

An independent EC2102 Macroeconomic Analysis I study companion.

[Open EC2K2](https://ec2k2.pizziyicato.chatgpt.site) · [GitHub profile](https://github.com/pizziyicato) · [Instagram](https://www.instagram.com/pizziyicato/)

## Study sections

The public homepage explains five sections in this order.

| Section | Purpose |
| --- | --- |
| IB400 | 400 five-choice questions across Tutorial, Exam and Challenge levels |
| S&T100 | 100 six-choice synthesis questions benchmarked above relevant IB400 Challenge questions |
| PB20 | 20 connected cases, each with eight six-choice MCQ parts, for 160 additional questions |
| EC2102 Decoded | 148 concepts across 12 chapters, 740 guided sequences and 21 interactive experiments |
| Assoc. Prof Wong Wei Kang Recaps | 120 six-choice revision questions mapped to 108 source parts across all ten supplied tutorials |

The banks contain 780 questions and 4,280 option explanations. Practice and exam modes support stable option identities, shuffled choice order, strikethrough/restore, confidence, bookmarks, redo and progress backups. PB20 retains the case brief across its eight parts. Twelve cases use Jensen Huang’s publicly acknowledged affair news as context; eight use US midterms. All model households, economic shocks and numerical scenarios are hypothetical. Current-affairs knowledge is not assessed.

Decoded works through derivations, graph construction, increases, decreases and boundary cases separately. It contains 2,450 steps, 746 prediction checkpoints and 121 diagrams. Typed reflections and self-checks are learning records, not automatic evidence of mastery. The earlier IS–LM–FE / AD–AS simulator remains integrated under `dist/policy/`.

English and 简体中文 controls are available. Questions remain in English. Built-in expandable panels show bundled Chinese translations of questions, choices, case briefs and revealed explanations without leaving EC2K2. Translations are prepared with EC2102 terminology and checked against the source equations, quantities and option meanings. The browser requests only the site’s protected translation file; it sends no question or learner text to a translation service. This is machine-assisted study support, with the English original authoritative.

## Accounts and privacy

The homepage is public and registration is open to everyone. Study content requires ChatGPT sign-in and creation of an EC2K2 profile. Sites handles authentication; this repository does not store passwords. The application also protects its study files at the server.

Account progress syncs across devices, with separate local copies per user, version checks, concurrent merges and guards against account changes. Earlier browser-only progress can be imported explicitly. Export/import remains available to signed-in learners.

Before profile creation, the site explains that the owner can view display names, sign-in names and email addresses, answers, confidence, retries, guided reflections, page/study activity and timestamps. These records are private to the learner and owner. The owner dashboard is restricted by the private `OWNER_EMAIL` runtime secret and provides learner search, response review, paginated activity and explicit private exports. User records and the owner email are not part of this repository. Activity logging is best effort when browsers are offline or close before upload; it is not a guaranteed audit trail of every action.

## Content review

On 14 November 2026, all existing 620 questions and 3,320 option explanations were reviewed again. All ten tutorial papers and answer files were reconciled to the coverage ledger, and all 100 S&T items were compared with actual IB400 Challenge items. Twenty-five entries received wording, assumption, explanation or source-reference clarifications. The existing answer keys did not change. PB20’s 160 new questions were separately reviewed and numerical results checked.

Earlier source audits covered 13 lecture PDFs and associated tutorial material. Original lecture PDFs, answer files and recordings are not redistributed. Source references and coverage ledgers remain in the course data. A separate final Week 13 assessment-coverage announcement was not available. Difficulty ratings are study-design judgments, not official exam labels or predictions.

Local validation covered all 780 rendered keys and 4,280 feedback mappings, mobile layouts, redo/strikethrough, exam hiding, timers, backups, all 25 efficiency-wage steps, mandatory access, Chinese controls, translation payloads and the public homepage. Account tests covered concurrent changes, identity switching, cross-device resume, owner-only records, consent renewal and denied unauthorized requests. Local identity tests emulate trusted Sites headers; they do not prove the external ChatGPT sign-in handoff.

## November 14 context and translation update

The homepage credit is Made by Ziyi. Every PB20 part now links a concrete scenario change to its EC2102 mechanism. Affair-related cases use fictional recovery expenses, counselling/nonwork time, separate cash budgets, disclosure-reporting services and counselling-sector capacity. Midterm cases use hypothetical congressional proposals, enactment or reversal, fiscal financing and clearly distinguished monetary assumptions. A personal event is never treated as proof of an aggregate macroeconomic effect. All 160 rewritten parts were independently reviewed; keys are preserved, with revised PB attempts marked for review.

Chinese text is bundled in `dist/translations-zh.json`; `translation.js` and `translation.css` implement its inline display. All 780 questions, 4,280 option explanations, 20 case briefs and 100 S&T difficulty notes have prepared Chinese translations. The bundle contains 9,744 distinct text entries. Exact-source matching preserves the displayed option order. Translated solutions remain hidden until their English counterparts are available. No external translation service or model is loaded by the website. Browser checks matched 14,500 displayed translation segments across all 780 questions, checked every case brief, and verified exam hiding, account protection, revised-progress migration and mobile layout. The existing typography still uses web fonts, independently of translation.

## Build and hosting

This application uses an ES-module Worker and a Sites-managed D1 database. Run `npm ci` and `npm run build`. The build embeds the public shell and protected study assets into `dist/server/index.js`. Serve it through the Sites Worker runtime; serving `dist` as an unguarded static directory bypasses the mandatory-account design.

`.openai/hosting.json` preserves the existing Site identity, public audience and `DB` binding. Configure `OWNER_EMAIL` privately in the runtime. Deploy through Sites so that the schema-only SQL migrations in `drizzle/` are applied before the Worker. Existing migrations are immutable after publication.

- `dist/data.json`, `banks.json`, `pb20.json` and `walkthroughs.json` contain original study material and source mappings.
- `dist/home.js`, `home.css` and `i18n.js` implement the public guide and interface language.
- `dist/app.js`, `access.js`, `account.js` and `admin.js` implement account-aware study and owner views.
- `dist/quiz.js`, `pb20.js`, `walkthrough.js` and `labs.js` implement practice and interactive explanations.
- `worker/index.js` enforces account and owner access, progress versions and scoped activity recording.
- `db/schema.ts` and `drizzle/` define persisted account, progress and event records.

This is not an official university platform or an endorsement by the lecturer. Preserve the course’s distinctions between Classical and fixed-FE Keynesian fiscal models, horizontal and misperceptions SRAS, nominal and real interest-rate bounds, saving and initial assets, and fixed natural-rate versus hysteresis hypotheses.
