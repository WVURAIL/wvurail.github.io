# Cutover checklist: wvurail.org → rail.wvu.edu

This file is the single list of everything that must happen when the site moves
to the University domain, in order. It lives in `.github/` so Jekyll never
publishes it. The Week-0 sweep already made every internal link domain-neutral
(root-relative between the sites, `site.url`-derived where a page displays its
own address), so the move itself is small — but each item below is small *and*
load-bearing, and several go silently wrong rather than loudly.

Background, mechanism, and the review process that gates all of this: the
migration plan. The one-line version: this repo is the GitHub Pages
**organization** site, so its custom domain is inherited by every WVURAIL
project site with Pages enabled. Changing the domain here moves all of them at
once.

## The inheritance family (what moves together)

| Repo | Serves today | After cutover |
|---|---|---|
| `wvurail.github.io` | wvurail.org | rail.wvu.edu |
| `dspira-lessons` | wvurail.org/dspira-lessons/ | rail.wvu.edu/dspira-lessons/ — DS port on its `wvu` branch |
| `lightwork` | wvurail.org/lightwork/ | rail.wvu.edu/lightwork/ |
| `dspira` | wvurail.org/dspira/ | **must keep** — NSF-cited |
| `cra` | wvurail.org/cra/ | **must keep** — NSF-cited |
| `gr-transient` | wvurail.org/gr-transient/ | decide: archived 2019 prototype |

Do NOT disable Pages on `dspira` or `cra`. The public outcomes report for NSF
award 1611114 cites `wvurail.org/dspira/`, `wvurail.org/dspira-lessons/` and
`wvurail.org/cra/` by name (two of them as `http://`), and a submitted NSF
report cannot be edited. Their README notices say the content moved to
dspira-lessons; for `cra` that is true, for `dspira` it is not — the 14 DSP
lecture decks in `dspira/lectures/2018/` exist nowhere else. The DSPIRA
restructure (see the architecture plan) is what makes these URLs honest again;
until then they stay live. `gr-transient` is not cited anywhere and is a
genuine candidate for switching Pages off.

SCM ruling (Adam Glenn, 2 Sep 2026): the DSPIRA discussion forum — the giscus
rooms under `dspira-lessons/forum/` — must stay on a NON-University address
for now (an old rule against forums on WVU sites; the policy is being
rewritten). Decision (Dylan, 2 Sep 2026): wvurail.org is to be eliminated
entirely in the long run, so the lessons site comes to rail.wvu.edu with the
lab site and gets the same Design System masthead/footer treatment, and the
forum is no longer embedded at all — the `/forum/` pages become plain links
out to the repo's GitHub Discussions categories, which is what the giscus
rooms were fronting anyway. Nothing forum-like is then served from a
University page. The lab site's `/dspiratalk/` stub keeps pointing at
`/dspira-lessons/forum/`, which keeps existing as that link page.

On eliminating wvurail.org: the NSF public outcomes report for award 1611114
cites three wvurail.org addresses and cannot be edited, so the domain should
stay registered as a pure redirect (no content, one 301 rule) for as long as
those citations matter — it costs a renewal and is invisible to visitors.
Letting it lapse breaks those links and frees the name for anyone to register.

SCM also ruled that analytics are optional (WVU's standard code on request)
and that CSP is the host's concern, i.e. ours: GitHub Pages sends no CSP
header, so nothing on the branch needs to change for it.

## The Design System build (branch `wvu`)

The rail.wvu.edu presentation layer lives on the `wvu` branch: WVU Design
System v3 via the documented CDN links, the standard masthead and footer with
the EO/AA statement and the full contact block from `_config.yml`'s `contact:`
key, every internal link through `relative_url`. Sibling GitHub Pages sites
(`/dspira-lessons/`, `/lightwork/`, `/dspira/`, `/cra/`) are deliberately left
root-absolute so the site can be served under a subpath for staging.

Two things about that branch are pre-cutover state, on purpose:

- The footer is already the University footer (© West Virginia University,
  EO/AA line) — it will only ever be served from the University domain or from
  a `noindex` staging copy, so the old "not an official University web page"
  disclaimer is gone from the footer. The accessibility statement still carries
  the disclaimer paragraph, marked `CUTOVER ITEM` in the source.
- Merging `wvu` into `main` is NOT the cutover and must not happen before SCM
  approval: `main` is what wvurail.org serves. The cutover commit below is
  where the merge lands.

Staging for the review: a project repo (e.g. `WVURAIL/rail-preview`, Pages
source "GitHub Actions") that checks out this branch and builds it with
`baseurl: /rail-preview` and `noindex_all: true`, published automatically at
`wvurail.org/rail-preview/` through the domain inheritance. The workflow file
for it is drafted; the layout honours `site.noindex_all`.

## Before the cutover (safe any time)

- [x] **Probe** (done 2 Sep 2026 — clear; GitHub accepted rail.wvu.edu with
      only the expected "DNS check unsuccessful"): in a throwaway WVURAIL repo (never this one — it is
      branch-built, so saving a domain in Settings→Pages *is* a deploy), try to
      save `rail.wvu.edu` as the custom domain. Saves with "DNS check
      unsuccessful" → clear. Errors as taken → stop, ask GitHub Support.
- [x] **Verify wvurail.org for the WVURAIL org** (done 2 Sep 2026; TXT record
      `_github-pages-challenge-wvurail` lives in Squarespace DNS — keep it) (org Settings → Pages →
      verified domains; TXT record in the lab's own DNS). Closes the takeover
      window that opens the moment the domain detaches from this repo.
- [ ] Review approval in hand (Conceptboard + Website Approval and Launch Form;
      three-week minimum; zero WCAG A/AA errors).
- [ ] ITS ticket filed: CNAME `rail.wvu.edu → wvurail.github.io`, TXT
      `_github-pages-challenge-wvurail.rail.wvu.edu` (value from org
      Settings→Pages verification flow), and a request not to introduce a
      `wvu.edu` CAA record that omits `letsencrypt.org`.

## The cutover commit (this repo)

- [ ] `CNAME` file: `wvurail.org` → `rail.wvu.edu` — **this is the cutover**;
      wvurail.org stops being served by GitHub the moment it lands
- [ ] `_config.yml` `url:` → `https://rail.wvu.edu` (and the line-1 comment)
- [ ] `.github/scripts/check_lesson_count.py` `LESSONS` constant → the new
      domain. Same commit, not later: the script deliberately exits 0 when the
      site is unreachable, so a stale domain makes it green forever.
- [ ] `.github/workflows/lesson-count.yml` cosmetic references (line 5 comment,
      job display name)
- [ ] `README.md` line 3 (the site's address)

## The cutover commit (dspira-lessons repo)

- [ ] `_config.yml` `url:` → `https://rail.wvu.edu` (serving does not need it;
      canonicals, og:url, sitemap and feed do)
- [ ] `tools/check_links.py` default base URL
- [ ] GitHub-rendered files (`README.md`, `CONTRIBUTING.md`, `code/**` READMEs
      and the `map_h1_hdf5_drift.py` docstring) still say wvurail.org — they
      keep working through the redirector, update at leisure

## Immediately after DNS resolves

- [ ] Enforce HTTPS in Settings→Pages once the certificate issues (up to 24 h)
- [ ] Point wvurail.org DNS (lab-controlled) at the redirect shim — real 301s:
      `/*  https://rail.wvu.edu/:splat  301` covers every legacy URL. The
      NSF-cited ones are /dspira/, /dspira-lessons/ and /cra/ (award 1611114);
      they need to keep resolving to the content they promise, on http AND https
- [ ] Re-run both link checkers against the new domain
- [ ] SiteImprove: confirm the dashboard tracks rail.wvu.edu
- [ ] The accessibility statement: the "not an official University web page"
      disclaimer (footer + `/accessibility/`) must be REMOVED at cutover — on
      the University domain it is false. The privacy claims must match whatever
      analytics the University requires by then.

## Rollback

Everything before the ITS DNS step is one revert of the cutover commit. After
DNS exists, rolling back also means asking ITS to remove the record — plan the
cutover for a day someone can watch it.
