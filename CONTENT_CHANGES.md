# Copy changes for review

Only `locales/*.json` was edited. MongoDB content was not touched (read-only).
Every change below is a targeted fix; the ideas and wording are otherwise yours.

## Fixes to existing copy

| Locale | Key | Before | After | Why |
| --- | --- | --- | --- | --- |
| all | `uiJSON.introBloc`, `uiJSON.concText` | em-dash asides | parentheses, colons or commas | House style: no em/en-dashes |
| es | `uiJSON.mainTitle` | Creed de la Vida 101 | Credo de la Vida 101 | "Creed" is English; body text already says "Credo" |
| es | `pillarsJSON`, `branchesJSON` | Confianza en Uno Mismo, Mentalidad de Aprendizaje, Equilibrio Emocional | sentence case | Spanish does not title-case |
| fr | `uiJSON.mainTitle` | Crédo de Vie 101 | Credo de la Vie 101 | Matches the body text ("Credo de la Vie", 3 times) |
| fr | `uiJSON.concText` | évoluer avec un but, intégrité et authenticité | évoluer avec un but, de l'intégrité et de l'authenticité | Missing articles |
| fr | `uiJSON.concText` | Chaque revers et succès | Chaque revers et chaque succès | Grammar |
| ru | `seoJSON.descHead` | Практическое гайд по постоянному развитию и непрерывному росту | Практический гайд по устойчивому и непрерывному росту | Gender agreement; matches "sustainable and continuous" |
| ru | `uiJSON.introBloc` | Основан на трех ключевых столпах [dash] ... [dash] эта структура | Основанная на трёх ключевых столпах (...), эта система | Participle agreement |
| ru | `uiJSON.concText` | Каждое препятствие и успех [dash] это момент для ... | Каждое препятствие и каждый успех становятся поводом ... | Reads naturally without the dash |
| ru | `branchesJSON.Learning Mindset` | Мышление на основе обучения | Готовность учиться | More natural |
| th | `branchesJSON.Resilience` | ความยืดหยุ่น | ความล้มแล้วลุกไว | Was identical to Flexibility |
| th | `uiJSON.introBloc`, `uiJSON.concText` | หลักความเชื่อแห่งชีวิต / ค่านิยมในชีวิต | หลักชีวิต | One name for the creed, matching the title |

`uiJSON.separatorInfo` was removed (only used by the old accordion).

## New copy (please review)

All new UI strings live under `siteJSON` in each locale file: navigation, the
principle pages, the footer, the 404 page and meta descriptions.

- **Hero motto**: "Be yourself. Be good to yourself. Be good to good people. / Everything is relative."
  This is your stated philosophy, translated for each locale. Change or remove it in `siteJSON.motto` and `siteJSON.coda`.
- **Contact email**: subject `CreedOfLife - General Enquiry` (localized) and a short prefilled body.
- **Home meta description**: adapted from the existing `<meta name="description">`.
- Spanish and Thai strings were written by Claude and should get a native read, Thai especially.
