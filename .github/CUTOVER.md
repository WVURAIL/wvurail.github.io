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

## Current publishing ownership

The approved Design System site is deployed on `main`. Approval is complete,
and the preview is being retired. Future changes belong on `main`; a domain
change is a separate operation.

| Repository | Current ownership |
| --- | --- |
| `wvurail.github.io` | Lab root and old project-address redirects |
| `dspira` | Current lessons, historical materials, and recovery packages |
| `lightwork` | Numbered technical memos |


The lab build owns `/dspira-lessons/`, `/dspira-archive/`, `/cra/`,
`/gr-transient/`, and `/gr-dspira/`. Retired repositories no longer need Pages.
Their old HTML addresses redirect; existing download addresses keep their bytes.
Historical content lives under `/dspira/history/sites/`. See DSPIRA's
`.github/ARCHIVE_RETIREMENT.md` for recovery and verification instructions.

Keep the NSF-cited `/dspira/` and `/cra/` addresses working on both HTTP and HTTPS.
The lab-owned redirects preserve CRA without retaining a separate publisher.
The lecture decks and other institute material have verified recovery packages
and an active DSPIRA home. Do not remove those packages or compatibility routes.

When changing domains, also update the canonical targets in DSPIRA's
`tools/retired_sites.py`, `tools/publish_pages.py`, public history links, and all
three publishing workflows. Keep the original frozen recovery packages intact.

SCM ruling (Adam Glenn, 2 Sep 2026): the DSPIRA discussion forum — the giscus
rooms under `dspira/forum/` — must stay on a NON-University address
for now (an old rule against forums on WVU sites; the policy is being
rewritten). Decision (Dylan, 2 Sep 2026): wvurail.org is to be eliminated
entirely in the long run, so the lessons site comes to rail.wvu.edu with the
lab site and gets the same Design System masthead/footer treatment, and the
forum is no longer embedded at all — the `/forum/` pages become plain links
out to the repo's GitHub Discussions categories, which is what the giscus
rooms were fronting anyway. Nothing forum-like is then served from a
University page. The lab site's `/dspiratalk/` stub keeps pointing at
`/dspira/forum/`, which keeps existing as that link page.

On eliminating wvurail.org: the NSF public outcomes report for award 1611114
cites three wvurail.org addresses and cannot be edited, so the domain should
stay registered as a pure redirect (no content, one 301 rule) for as long as
those citations matter — it costs a renewal and is invisible to visitors.
Letting it lapse breaks those links and frees the name for anyone to register.

SCM also ruled that analytics are optional (WVU's standard code on request)
and that CSP is the host's concern, i.e. ours: GitHub Pages sends no CSP
header, so nothing on the branch needs to change for it.

## Approved site and build tools

The approved presentation is already on `main`; no design-branch merge is needed.
The live lab site owns the shared build tools in `.github/site-tools/`.
DSPIRA uses those tools at a pinned lab-site revision. Neither live deployment
needs the preview repository. See [preview retirement](PREVIEW_RETIREMENT.md).

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
- [x] Site approval confirmed by Dylan. The approved design is already live.
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

## The cutover commit (dspira repo)

- [ ] `_config.yml` `url:` → `https://rail.wvu.edu` (serving does not need it;
      canonicals, og:url, sitemap and feed do)
- [ ] `tools/check_links.py` default base URL
- [ ] GitHub-rendered files (`README.md`, `CONTRIBUTING.md`, `lesson-examples/**` READMEs) still say wvurail.org — they
      keep working through the redirector, update at leisure

## The cutover commit (dspira-software repo)

- [ ] Update website links in `README.md` and the `data-processing/` guide.
      Check the processing scripts for website addresses too.

## Immediately after DNS resolves

- [ ] Enforce HTTPS in Settings→Pages once the certificate issues (up to 24 h)
- [ ] Point wvurail.org DNS (lab-controlled) at the redirect shim — real 301s:
      `/*  https://rail.wvu.edu/:splat  301` covers every legacy URL. The
      NSF-cited ones are /dspira/, /dspira/ and /cra/ (award 1611114);
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
