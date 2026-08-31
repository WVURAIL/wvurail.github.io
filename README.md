# WVU Radio Astronomy Instrumentation Lab — website

Source for <https://wvurail.org>. Built with [Jekyll](https://jekyllrb.com/) and hosted on
GitHub Pages. No build step beyond Jekyll: the CSS and JS are hand-written and shipped as-is.

## Run locally

```bash
bundle install
bundle exec jekyll serve --config _config.yml,_config.dev.yml
# open http://localhost:4000
```

> **A version caveat worth knowing.** This Gemfile tracks Jekyll 4.3, but GitHub
> Pages builds the live site with **Jekyll 3.9** (via the `github-pages` gem).
> The two disagree in places — most painfully on filter signatures. If a build
> ever fails on Pages but works locally, that gap is the first thing to suspect.
>
> `.github/workflows/build.yml` builds every push and pull request with the
> `github-pages` gem, so CI catches those differences before they reach `master`.
> **If a change is green locally but red in CI, trust CI** — it is the one that
> matches production.

## Why the build can fail silently

GitHub Pages reports build failures by email only, and keeps serving the previous
good build. A broken Liquid tag therefore looks like "the site didn't update"
rather than an error. The CI workflow exists to make that loud, and it checks the
rendered output too — that every page exists, that the publication and people
lists actually have entries, and that no raw Liquid leaked into the HTML.

A filter that quietly returns nothing will still produce a *successful* build with
an empty section, which is why the counts are asserted rather than just the exit
code.

## How the site is organized

| Path | What it is |
| --- | --- |
| `_data/people.yml` | **All lab members** (PI, grad students, student workers, alumni). |
| `_data/nav.yml` | **The four primary header/footer navigation links.** Secondary destinations live in the footer. |
| `_data/sites.yml` | **Where we work** — the four sites and the instruments at each. |
| `_data/education.yml` | **Science education** — the DSPIRA section on the home page. |
| `_data/publications.yml` | **Papers.** Hand-curated; see the comments at the top of the file. |
| `_includes/` | Reusable pieces: `head`, `header`, `footer`, `scripts`, `icon`, plus the page sections `sites`, `publications-preview`, `education`, `people`, `join` and the `person-card` / `publication` item templates. |
| `_layouts/` | Page shells: `default` (standard page), `home` (landing page), `cohort` (a DSPIRA cohort archive). |
| `_pages/` | Individual pages (Research & Telescopes, Publications, People, Contact, DSPIRA program pages, talks). |
| `tools/` | Small standalone web tools (sidereal-time clock, coordinate converter). `/apps/` still redirects here. |
| `assets/css/site.css` | **The entire stylesheet.** Organized into numbered sections; start there. |
| `assets/js/site.js` | Sticky header, mobile nav, hero canvas, scroll reveals, gallery lightbox. |
| `assets/fonts/` | Self-hosted woff2 (Instrument Serif, Inter, JetBrains Mono). All three are SIL OFL 1.1; the notices and licence are in `assets/fonts/OFL.txt` and have to stay with the files. |
| `images/` | Media. PDFs are not hosted here: link the canonical record (DOI, ADS, or the WVU Research Repository) instead — an untagged PDF will not pass an accessibility review. |

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
    link:                                   # external link
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
    open: true                              # renders the "this could be you" card
```

Cards render automatically — no HTML editing needed. The PI is shown as a wide
feature card; graduate and student researchers share one "Researchers" grid (each
card's role line carries the distinction); alumni render as a thesis list.

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
  highlight: true      # optional — marks it and makes it eligible for the home preview
```

Extra optional keys: `people` (lab members on the paper, rendered as tags),
`preprint: true`, `highlight: true` (adds a selected marker and makes the paper
eligible for the home-page preview), and `review:` (a reminder to a human —
delete it once checked).

For a journal cover, add `cover: "Nature cover"` plus a `cover_note` with the full
citation. Cover papers get a gold badge and lead the home-page preview when they
also carry `highlight: true`. Only set this where the issue's own cover blurb names
the paper, not merely where a paper appears in an issue that has a cover.

The page groups entries by `type`, then by year within each band. Dissertations and
theses are **not** listed here at all — they come from the `publication:` block on
each alumnus in `_data/people.yml` and appear only on `/people/`, so a graduate is
recorded once and shown in one place.

### Change the science-education section

Edit `_data/education.yml` — the intro paragraph, the three numbered points, the
buttons, and the per-year archive links.

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
layout: default
title: My Page
permalink: /my-page/
description: One sentence, used for search results and link previews.
lead: Optional intro line shown under the title.
---

Content here (Markdown or HTML).
```

Pages get a dark title header and a readable prose column automatically. Set
`full_width: true` if you want to lay the page out yourself.

## A trap worth knowing about

A Markdown or HTML file **without front matter** is copied verbatim into the
built site. `NOTES.md` in the repo root becomes `/NOTES.md` on the public site.
Anything internal should do both: start with an underscore, which Jekyll skips
structurally, and appear under `exclude:` in `_config.yml`. Belt and braces, because
the cost of getting it wrong is that a private working note is served at a public URL
and nothing warns you.

## Design notes

- **Type.** Instrument Serif for display, Inter for body, JetBrains Mono for labels.
  All three are self-hosted in `assets/fonts/` — no Google Fonts request.
- **Colour.** A deep blue-black night sky with WVU Old Gold (`#EAAA00`) as the single
  accent. Tokens live at the top of `site.css` under `:root`; change them there and the
  whole site follows.
- **Hero.** `#sky` is a canvas drawing a seeded starfield plus three summed sinusoids —
  the "signal". It stops animating when scrolled out of view and renders a single static
  frame when the visitor prefers reduced motion.
- **Cohort pages.** `/education/dspira-2017/`, `/education/dspira-2018/` and
  `/education/dspira-2019/` share
  `_layouts/cohort.html`. Each page supplies its year, headline, lead and images in front
  matter and writes only its narrative chapters; the roster, the counts and the year
  navigation are read from `_data/education.yml`, so a teacher is only ever listed once.
  The layout's own comment block documents every front-matter key it expects. Section 15
  of `site.css` holds the components (`.chapter`, `.figure`, `.photo-grid`, `.callout`).
  This replaced the last of the old HTML5UP theme markup — no page uses `wrapper`,
  `banner`, `gallery` or `image left/right` any more.
- **Figures vs. thumbnails.** `.figure-row` never crops: the images keep their own aspect
  ratio and top-align. `.photo-grid` does crop to 4:3, because it is a contact sheet and
  the lightbox has the uncropped original one click away. Give every `<img>` its real
  pixel `width`/`height` — with no CSS aspect ratio to pin them, those attributes are what
  stop the page jumping as the photographs load.
- **Images.** Nothing renders wider than ~1600 px; keep uploads at or below that.
