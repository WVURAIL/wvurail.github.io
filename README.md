# WVU Radio Astronomy Instrumentation Lab — website

Source for <https://rail.wvu.edu>. Built with [Jekyll](https://jekyllrb.com/) and hosted on
GitHub Pages. Jekyll renders the pages, shared build tools trim unused styles, and
compatibility helpers generate redirects and preserved downloads. JavaScript is
shipped directly, and the WVU Design System stylesheet is pinned in
`assets/wvu-design-system/`. The completed domain move and current publishing
ownership are documented in [.github/CUTOVER.md](.github/CUTOVER.md).

## Run locally

```bash
bundle install
bundle exec jekyll serve --config _config.yml,_config.dev.yml
# open http://localhost:4000
```

Use Ruby 3.3 and the committed `Gemfile.lock`, which pins Jekyll 4.4.
Local builds, pull request checks, and publication use this same dependency set.
The Pages workflow deploys the artifact that passed the complete website checks.

To build locally with production settings:

```bash
JEKYLL_ENV=production bundle exec jekyll build --trace
```

## Build validation

The Publish Pages workflow runs the reusable Build workflow before deployment.
Failures are visible in GitHub Actions and leave the previously deployed site in
place. The checks cover the rendered output: expected pages, populated publication
and people lists, compatibility routes, and unrendered Liquid tags.

A filter that quietly returns nothing will still produce a *successful* build with
an empty section, which is why the counts are asserted rather than just the exit
code.

## How the site is organized

| Path | What it is |
| --- | --- |
| `_data/people.yml` | **All lab members** (PI, grad students, student workers, alumni). Renders `/people/`, the PI block on the home page, the contact page, and the advising section of `/bandura/`. |
| `_data/nav.yml` | **The four primary navigation links**, used by the masthead and the footer's Site Menu. Contact is appended automatically. |
| `_data/sites.yml` | **Where we work** — the four sites and the instruments at each. Renders `/where-we-work/`; the home page shows only the count. |
| `_data/publications.yml` | **Papers.** Hand-curated; see the comments at the top of the file. Renders `/publications/`, the home-page list, and the WVU-era publications on `/bandura/` and `/bandura/cv/`. |
| `_data/education.yml` | **DSPIRA** — everything on `/education/`, plus the roster, counts and year navigation of the three cohort pages. The lesson count is written here, once. |
| `_data/cv.yml` | **Kevin Bandura's CV of record.** Everything on `/bandura/` and `/bandura/cv/` that is not already in `publications.yml` or `people.yml`. The header comment explains what belongs there. |
| `_data/institutions.yml` | **Who we work with** — collaborating institutions, rendered at `/who-we-work-with/`. |
| `_layouts/wvu.html` | **The only layout.** The `<head>` (title, description, canonical and social metadata), pinned Design System stylesheet and Adobe Fonts links, masthead and primary navigation, Common Elements footer, and shared presentation rules. |
| `_includes/cohort-roster.html`, `_includes/cohort-footer.html` | The shared head and tail of the three DSPIRA cohort pages. The roster is looked up in `education.yml` by the page's `year`. |
| `index.html`, `404.html` | The home page and the not-found page, at the repo root. Both use the `wvu` layout. |
| `_pages/` | Every other page, one file each, all `layout: wvu`. `redirect-*.html`, `talk.html` and `projects.html` are layout-less meta-refresh stubs that keep old URLs working (`/apps/`, `/dspira-2017/`, `/ret-dspira/`, `/dspiratalk/`, `/projects/`, …). Do not give them a layout. |
| `assets/js/site.js` | Loaded by the layout on every page. Adds the `js` class to `<html>` (the progressive-enhancement flag), reveals and wires the print buttons, and runs the publications filter. |
| `assets/js/gif-player.js` | Click-to-play GIF for the 2017 cohort page. An animated GIF cannot be paused, so it stays behind a button (WCAG 2.2.2) and the file is not fetched until asked for. |
| `assets/js/tools.js`, `assets/js/astro.js` | The `/tools/` pages. `astro.js` is the sidereal-time and coordinate math (Node can `require` it for testing); `tools.js` wires it to the three pages by element id. `/apps/` still redirects here. |
| `images/` | Photographs, diagrams, and branding, including recovered historical images. |
| `assets/reports/` | Preserved student reports. For published research, use the canonical DOI, ADS, or WVU Research Repository record. |
| `.github/workflows/build.yml` | Builds with locked Jekyll 4.4 dependencies, runs shared tool checks, trims CSS, generates compatibility routes, and validates the rendered output. The publication workflow reuses this build. |
| `.github/workflows/links.yml`, `lesson-count.yml`, `.github/scripts/` | Weekly checks: that every link on the built site is still alive, and that the lesson count and module list in `education.yml` still match the lessons site. |
| `.github/CUTOVER.md` | Current domain migration record, publishing ownership, and compatibility limits. |

The WVU Design System stylesheet is stored in `assets/wvu-design-system/`; its
README records the upstream version and update procedure. Publication trims unused
rules from the built copy. Adobe Fonts (Typekit) faces still load from
`use.typekit.net`. Shared build and validation tools live in `.github/site-tools/`.

## Common edits

### Add or update a person

Edit `_data/people.yml`. Each person is one list item under the right group
(`pi`, `grad`, `students`, `alumni`). All fields except `name` are optional:

```yaml
grad:
  - name: Jane Q. Researcher
    photo: /images/people/jresearcher.jpg   # square-ish crop works best
    roles:                                  # subtitle lines
      - Ph.D. Student
    bio: One or two sentences.
    link:                                   # optional; internal or external URL
      text: Personal site
      url: https://example.com
    email: jane@mail.wvu.edu                # shown on the card and, for the PI,
    phone: "(304) 000-0000"                 #   on the contact page
    office: AERB 000
    publication:                            # used for alumni
      label: Ph.D. Dissertation
      year: 2026
      title: Title of the work
      url: https://researchrepository.wvu.edu/etd/...
    now: Postdoctoral Fellow, Somewhere     # alumni: current position
    open: true                              # renders the "this could be you" card
```

Cards render automatically — no HTML editing needed. The PI is shown as a wide
feature card; graduate and student researchers share one "Researchers" grid (each
card's role line carries the distinction); alumni render as a thesis list, with
`now:` shown under the thesis when it is set. The `grad` and `alumni` lists also
feed the advising section of `/bandura/`.

### Change where we work

Edit `_data/sites.yml`. Each site has a `region`, a `place`, and a list of
`instruments`:

```yaml
- region: Canada
  place: British Columbia
  instruments:
    - name: CHIME
      note: Canadian Hydrogen Intensity Mapping Experiment, at DRAO near Penticton
      url: "https://chime-experiment.ca"      # optional; makes the name a link
```

### Add a paper

Edit `_data/publications.yml`. The file's header comment documents every field.
The minimum is:

```yaml
- year: 2025
  title: Title of the paper
  authors: "A. Author, B. Author, incl. K. Bandura"
  venue: The Astrophysical Journal
  doi: "10.3847/..."
  arxiv: "2501.00000"
  type: journal        # journal | proceedings | note | preprint — picks the band
  highlight: true      # optional — marks it "Selected work"
```

`type` matters: `/publications/` and `/bandura/` are grouped by it, so an entry
without one is absent from every band on `/publications/` and from `/bandura/`.
It is still counted in the site-wide totals and can still appear in the
home-page recent list, and nothing warns you.

Extra optional keys: `people` (lab members on the paper, rendered as "Lab
authors"), `preprint: true`, `highlight: true` (adds a "Selected work" label),
and `review:` (a reminder to a human — delete it once checked).

For a journal cover, add `cover: "Nature cover"` plus a `cover_note` with the full
citation. The cover text replaces the "Selected work" label on `/publications/`
and renders as a badge on `/bandura/`. Only set this where the issue's own cover
blurb names the paper, not merely where a paper appears in an issue that has a
cover.

Neither `highlight` nor `cover` affects the home page any more: it lists the five
most recent entries by `year`, unconditionally. The earlier site chose its
home-page preview from highlighted and cover papers; the new one does not.

The page groups entries by `type`, then by year within each band. Dissertations and
theses are **not** listed here at all — they come from the `publication:` block on
each alumnus in `_data/people.yml` and appear only on `/people/`, so a graduate is
recorded once and shown in one place.

### Change the DSPIRA page

Edit `_data/education.yml`. It holds everything `/education/` prints — the summary
and status paragraphs, the facts tiles, the lessons block, the program phases,
the summer arc, the cohort rosters and the published outputs — and the three cohort
pages read their roster, counts and year navigation from the same `cohorts:` list,
so a teacher is only ever listed once.

Two numbers deserve care. `materials.lesson_count` is the only place the lesson
count is written: every `%COUNT%` in the file and every count on the site is
substituted from it, and `.github/workflows/lesson-count.yml` checks it against the
lessons site every Monday. The roster figures on `/education/` (teachers, states,
places, returning) are computed from `cohorts:`, never typed.

The earlier README described this file as "the intro paragraph, the three numbered
points, the buttons, and the per-year archive links". That home-page section no
longer exists; the home page shows only the lesson count.

### Change the navigation

Edit `_data/nav.yml`. The Contact button is appended automatically. Keep
collaborators, faculty, and tools in the footer/contextual navigation unless one
becomes a primary destination for most visitors.

Two rules worth keeping:

1. **Every nav entry points at a real page, never an in-page anchor.** Mixing the
   two makes one tab behave differently from the rest — clicking it scrolls
   instead of navigating, and it stays "current" on the wrong page.
2. **Keep the list short and ordered like the home-page previews.** The header is
   for the routes most visitors need, not an inventory of every page.

### Add a new page

Create a file in `_pages/` with front matter:

```yaml
---
layout: wvu
title: My Page
permalink: /my-page/
description: One sentence, used for search results and link previews.
---

Content here (HTML on the Design System grid).
```

The layout supplies the masthead, navigation and footer and nothing else — no title
band and no prose column — so a page brings its own `container` / `row` / `col-*`
markup on the Design System's 24-column grid. Use `_pages/contact.html` (a hero
band, cards, a definition list) or `_pages/accessibility.html` (a single prose
column) as the model. There is no `full_width`, `lead` or `eyebrow` front matter
any more; a hero band with its eyebrow label, `h1` and lead sentence is written in
the page.

Two optional keys: `noindex: true` adds a robots meta tag, and `sitemap: false`
keeps the page out of `sitemap.xml` — the CV and the 404 page use both. `image:`
overrides the social-sharing card. Every internal link and image path goes through
`relative_url` (see Design notes).

## A trap worth knowing about

A Markdown or HTML file **without front matter** is copied verbatim into the
built site. `NOTES.md` in the repo root becomes `/NOTES.md` on the public site.
Anything internal should do both: start with an underscore, which Jekyll skips
structurally, and appear under `exclude:` in `_config.yml`. Belt and braces, because
the cost of getting it wrong is that a private working note is served at a public URL
and nothing warns you.

## Design notes

- **The Design System.** WVU Design System v3, a Bootstrap 5.3 fork on a
  24-column grid (`col-24` is full width, `col-lg-16` two thirds). The stylesheet
  is pinned in `assets/wvu-design-system/` and trimmed during publication.
  Adobe Fonts faces load from `use.typekit.net`. Follow the vendored stylesheet
  README when updating the upstream version.
- **Two class names to know**, because the obvious ones are not in the DS
  stylesheet and silently do nothing: the off-white band is
  `bg-wvu-not-quite-white` (there is no `bg-wvu-neutral-subtle`), and the display
  face is `antonia-light` / `antonia-regular` / `antonia-italic` (there is no
  `antonia-variable` utility; that is the font-family name).
- **Icons** are inline SVG. The Font Awesome Pro kit the DS documentation lists is
  account-bound and returns 403 from any origin that is not on its allowlist.
- **Print.** A rule in the layout hides the masthead, navigation and footer (and
  anything with `.no-print`) when printing, so `/bandura/cv/` prints — or saves
  as PDF — as a clean letter-sized document. Print buttons are
  `<button data-action="print" hidden>`; `site.js` reveals and wires them.
- **Links.** Every internal href, `src` and CSS `url()` goes through
  `relative_url` — `href="{{ '/people/' | relative_url }}"`,
  `src="{{ pi.photo | relative_url }}"` — so the whole site can be served under
  a subpath such as `/rail-preview/` for staging by setting `baseurl`, while
  production keeps `baseurl: ""`. Sibling GitHub Pages projects on the same host
  (`/dspira/` and `/lightwork/`) stay root-absolute on purpose. The lab build
  generates `/dspira-lessons/` compatibility routes from current lesson content.
  Link current content at its current address rather than through an old alias.
- **JavaScript.** Site interactions use local vanilla JavaScript and attach
  with `addEventListener`. Controls that need JavaScript ship hidden or disabled
  and are enabled by the script, so a visitor without it is never offered a
  control that cannot work. The font stylesheet also uses an inline load handler;
  test font loading as well as interactions before changing a Content Security Policy.
- **Images.** Give every `<img>` its real pixel `width`/`height` — the cohort
  pages take them from front matter (`cover_w`, `cover_h`, …) — so the page does
  not jump as the photographs load. Nothing renders wider than ~1600 px; keep
  uploads at or below that.

## Build and publication

Use Ruby 3.3 and the committed `Gemfile.lock` for local previews and CI.
Run `bundle install`, then `bundle exec jekyll serve`.
Pull requests run the full website checks. Publishing from `main` deploys the same validated artifact.
