# WVU Radio Astronomy Instrumentation Lab — website

Source for <https://wvurail.org>. Built with [Jekyll](https://jekyllrb.com/) and hosted on
GitHub Pages. No build step beyond Jekyll: the CSS and JS are hand-written and shipped as-is.

## Run locally

```bash
bundle install
bundle exec jekyll serve --config _config.yml,_config.dev.yml
# open http://localhost:4000
```

## How the site is organized

| Path | What it is |
| --- | --- |
| `_data/people.yml` | **All lab members** (PI, grad students, student workers, alumni). |
| `_data/projects.yml` | **All research projects** shown on the home and Research pages. |
| `_data/nav.yml` | **The header/footer navigation links.** |
| `_includes/` | Reusable pieces: `head`, `header`, `footer`, `scripts`, `icon`, plus the `hero`-adjacent sections `people`, `projects`, `join`, `person-card`. |
| `_layouts/` | Page shells: `default` (standard page), `home` (landing page), `page` (alias of default). |
| `_pages/` | Individual pages (People, Research, Contact, DSPIRA program pages, talks). |
| `apps/` | Small standalone web tools (sidereal-time clock, coordinate converter). |
| `assets/css/site.css` | **The entire stylesheet.** Organized into numbered sections; start there. |
| `assets/js/site.js` | Sticky header, mobile nav, hero canvas, scroll reveals, gallery lightbox. |
| `assets/fonts/` | Self-hosted woff2 (Instrument Serif, Inter, JetBrains Mono). |
| `images/`, `pdf/` | Media. |

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
    publication:                            # used for alumni
      label: Ph.D. Dissertation
      title: Title of the work
      url: https://doi.org/...
    open: true                              # renders the "this could be you" card
```

Cards render automatically — no HTML editing needed. The PI is shown as a wide
feature card; everyone else gets a grid card; alumni render as a thesis list.

### Add a project

Edit `_data/projects.yml`:

```yaml
- name: PROJECT NAME
  meta: Site, partner, or programme        # one short line under the title
  image: /images/projects/example.jpg      # 16:10 or square both crop fine
  image_alt: What the photo shows          # for screen readers
  url: https://project-link
  blurb: >
    A short description. Long blurbs are clamped to six lines on the card so
    rows stay even — put the full story on the project's own site.
```

### Change the navigation

Edit `_data/nav.yml`. The "Join the lab" button is appended automatically.

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

## Design notes

- **Type.** Instrument Serif for display, Inter for body, JetBrains Mono for labels.
  All three are self-hosted in `assets/fonts/` — no Google Fonts request.
- **Colour.** A deep blue-black night sky with WVU Old Gold (`#EAAA00`) as the single
  accent. Tokens live at the top of `site.css` under `:root`; change them there and the
  whole site follows.
- **Hero.** `#sky` is a canvas drawing a seeded starfield plus three summed sinusoids —
  the "signal". It stops animating when scrolled out of view and renders a single static
  frame when the visitor prefers reduced motion.
- **Legacy pages.** The DSPIRA archive pages (2017–2019) were written against the old
  HTML5UP theme. Section 15 of `site.css` reimplements those class names
  (`wrapper`, `banner`, `spotlight`, `actions`, `gallery`, …) so those pages still work.
  If you rewrite them, that section can go.
- **Images.** Nothing renders wider than ~1600 px; keep uploads at or below that.
