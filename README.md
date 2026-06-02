# WVU Radio Astronomy Instrumentation Lab — website

Source for <https://wvurail.org>. Built with [Jekyll](https://jekyllrb.com/) and hosted on GitHub Pages.

## Run locally

```bash
bundle install
bundle exec jekyll serve --config _config.yml,_config.dev.yml
# open http://localhost:4000
```

## How the site is organized

| Path | What it is |
| --- | --- |
| `_data/people.yml` | **All lab members** (PI, grad students, student workers, alumni). Edit this to add/remove people. |
| `_data/projects.yml` | **All projects** shown on the home and Projects pages. |
| `_includes/` | Reusable pieces: `head`, `navbar`, `footer`, `scripts`, plus `people`, `projects`, `person-card`. |
| `_layouts/` | Page shells: `default` (standard page), `home` (landing page), `page` (titled content). |
| `_pages/` | Individual pages (DSPIRA program pages, talks, contact). |
| `apps/` | Small standalone web tools (sidereal-time clock, coordinate converter). |
| `assets/` | Theme CSS/JS/fonts. Lab-specific styles live in `assets/css/custom.css`. |
| `images/`, `pdf/` | Media. |

## Common edits

### Add or update a person
Edit `_data/people.yml`. Each person is one list item under the right group
(`pi`, `grad`, `students`, `alumni`). All fields except `name` are optional:

```yaml
grad:
  - name: Jane Q. Researcher
    photo: /images/people/jdoe.jpg     # optional headshot
    roles:                             # optional subtitle lines
      - Ph.D. Student
    bio: One or two sentences.         # optional
    link:                              # optional external link
      text: Personal site
      url: https://example.com
    publication:                       # optional (used for alumni)
      label: Ph.D. Dissertation
      title: Title of the work
      url: https://doi.org/...
```

The cards render automatically — no HTML editing needed.

### Add a project
Edit `_data/projects.yml`:

```yaml
- name: PROJECT NAME
  image: /images/projects/example.jpg
  url: https://project-link
  blurb: >
    A short description.
```

Projects automatically alternate left/right alignment.

### Add a new page
Create a file in `_pages/` with front matter:

```yaml
---
layout: page
title: My Page
permalink: /my-page/
---

Content here (Markdown or HTML).
```
