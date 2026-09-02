#!/usr/bin/env python3
"""
Are the links off this site still alive?

    bundle exec jekyll build
    python3 .github/scripts/check_links.py            # reads _site
    python3 .github/scripts/check_links.py --offline  # looks in _site, fetches nothing

Run it against a REAL Jekyll build. Internal links are checked by looking for
the file in _site, so a partial build reports its own missing pages as broken
links — /feed.xml comes from the jekyll-feed plugin, for instance, and is absent
from anything that did not run it. The exception is the sibling sites, below.

WHY THIS EXISTS

The build workflow already asserts that every page renders and that the
data-driven lists have entries. It says nothing about whether the links point
anywhere. Those break on a day nobody here touched the repository, because
somebody else moved a page, and nothing here notices.

Three did. The footer's "Lane Dept. of CSEE" link 404'd on every page of the
site until a human happened to click it. The Reber Telescope link 404'd because
the observatory's own URL contains a typo. The GRCon18 slides 404'd on a change
of capitalisation. None of that is findable by reading this repository.

The lessons repository has its own, larger version of this. The two sites are
separate repositories with separate builds, so the tool is duplicated rather
than shared — which is the honest trade for not inventing a shared package for
two small static sites.

THREE BUCKETS

  BROKEN     Confirmed dead. Fails the run.
  CHECK      Could not be settled. Google Drive, Docs, YouTube and Mediasite all
             answer 200 for things that are deleted or private, and some hosts
             refuse scripts outright. Sibling-site paths land here too when
             running --offline. Reported, never failed on.
  OK         Answered normally.

External links and sibling-site paths are sorted into those three. Internal
links are simpler: the file is in _site or it is not.

SIBLING SITES

/dspira-lessons/, /lightwork/, /dspira/ and /cra/ are separate GitHub Pages
projects served under this site's domain. They are never in _site, so looking
for a file would call every one of them broken. Those paths — the
SIBLING_PREFIXES tuple — are fetched over HTTP on this site's own url, read
from _config.yml, which is why the move to rail.wvu.edu needs no edit here.
With --offline they are listed as "sibling site, not checked" and never failed
on.

A soft 404 — a server answering 200 with a "this moved" or parent page — is not
detectable from a status code and this will call it OK. The NRAO PING links on
this site are exactly that shape. Only eyes catch those.
"""

import argparse
import collections
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

TIMEOUT = 25
WORKERS = 8
UA = ("Mozilla/5.0 (compatible; wvurail-link-check/1.0; "
      "+https://github.com/WVURAIL/wvurail.github.io)")

# Hosts whose 200 means little.
UNVERIFIABLE = ("drive.google.com", "docs.google.com", "forms.gle",
                "youtube.com", "youtu.be", "www.youtube.com",
                "mediasite.com", "wvu.mediasite.com", "linkedin.com",
                "www.linkedin.com", "twitter.com", "x.com")

# Answers that mean "I can see you are a robot", not "this is gone".
BOT_CODES = {401, 403, 405, 406, 418, 429, 503}

# Separate GitHub Pages projects served under this site's domain. Never in
# _site, so these paths are fetched on the site's own url instead of looked
# for on disk. Trailing slashes matter: /dspira-2017/ is this site's own page.
SIBLING_PREFIXES = ("/dspira-lessons/", "/lightwork/", "/dspira/", "/cra/")

# Where the site's own url is read from. NOT a cutover item: when the site moves
# to rail.wvu.edu the `url:` line in _config.yml changes and this follows it
# with no edit here. (check_lesson_count.py hard-codes its domain instead, and
# is listed in .github/CUTOVER.md for that reason.)
CONFIG_YML = "_config.yml"


def urls_in(site):
    """Every href/src in the built site, with the pages they appear on."""
    found = collections.defaultdict(set)
    for dirpath, _, files in os.walk(site):
        for f in files:
            if not f.endswith(".html"):
                continue
            p = os.path.join(dirpath, f)
            page = p[len(site):].replace(os.sep, "/")
            text = open(p, encoding="utf-8", errors="replace").read()
            for u in re.findall(r'(?:href|src)="([^"]+)"', text):
                u = u.strip()
                if u.startswith(("mailto:", "tel:", "javascript:", "data:", "#")):
                    continue
                found[u].add(page)
    return found


def site_url(path=CONFIG_YML):
    """The site's own address, read from _config.yml without a YAML library.

    The line is `url: "https://wvurail.org"`, quoted or not, comment or not.
    """
    text = open(path, encoding="utf-8").read()
    m = re.search(r"""^url:\s*["']?(https?://[^"'\s#]+)""", text, re.M)
    if not m:
        sys.exit(f"::error::no `url:` line found in {path} — has the file been "
                 f"restructured? Sibling-site links are fetched against it, and "
                 f"this check reads it by regex so it needs no YAML library.")
    return m.group(1).rstrip("/")


def check(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA}, method="HEAD")
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return ("ok", r.status)
    except urllib.error.HTTPError as e:
        if e.code in BOT_CODES or e.code == 501:      # HEAD often unsupported
            try:                                      # so try a real GET
                req = urllib.request.Request(url, headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                    return ("ok", r.status)
            except urllib.error.HTTPError as e2:
                return (("check", e2.code) if e2.code in BOT_CODES
                        else ("broken", e2.code))
            except Exception as e2:                   # noqa: BLE001
                return ("check", type(e2).__name__)
        return ("broken", e.code)
    except Exception as e:                            # noqa: BLE001
        return ("check", type(e).__name__)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", default="_site")
    ap.add_argument("--offline", action="store_true")
    args = ap.parse_args()
    site = os.path.abspath(args.site)
    if not os.path.isdir(site):
        sys.exit(f"::error::{args.site} does not exist — build the site first")

    found = urls_in(site)
    internal = {u: p for u, p in found.items() if not urllib.parse.urlparse(u).netloc}
    external = {u: p for u, p in found.items() if urllib.parse.urlparse(u).netloc}

    # Internal links: does the built site actually contain that path? Sibling
    # sites are never in _site, so those paths are set aside and fetched below.
    broken_internal = []
    sibling = {}
    for u, pages in sorted(internal.items()):
        path = urllib.parse.urlparse(u).path
        if not path.startswith("/"):
            continue                                  # relative; rare here
        if (path + "/").startswith(SIBLING_PREFIXES):  # /cra and /cra/ alike
            sibling[u] = pages
            continue
        cand = [os.path.join(site, path.lstrip("/")),
                os.path.join(site, path.lstrip("/"), "index.html")]
        if not any(os.path.exists(c) for c in cand):
            broken_internal.append((u, sorted(pages)))

    print(f"{len(internal) - len(sibling)} internal links, "
          f"{len(sibling)} on sibling sites, {len(external)} external")

    results = {}
    fetch = {}                                        # link as written -> URL fetched
    if not args.offline:
        try:
            urllib.request.urlopen(
                urllib.request.Request("https://example.com",
                                       headers={"User-Agent": UA}), timeout=15)
        except Exception:                             # noqa: BLE001
            print("::warning::no internet reachable — checking internal links only")
            args.offline = True
    if not args.offline:
        fetch = {u: u for u in external}
        if sibling:                                   # on this site's own domain
            base = site_url()
            fetch.update({u: base + u for u in sibling})
        with ThreadPoolExecutor(max_workers=WORKERS) as ex:
            for u, r in zip(fetch, ex.map(check, fetch.values())):
                host = urllib.parse.urlparse(fetch[u]).netloc.lower()
                if any(h in host for h in UNVERIFIABLE) and r[0] == "ok":
                    r = ("check", "host answers 200 for deleted content")
                results[u] = r
    else:
        # Not on disk, not fetched: listed so nobody thinks they were checked.
        results.update({u: ("check", "sibling site, not checked") for u in sibling})

    broken = {u: r for u, r in results.items() if r[0] == "broken"}
    unsure = {u: r for u, r in results.items() if r[0] == "check"}

    if unsure:
        print(f"\nneeds a human ({len(unsure)}) — not failed on:")
        for u, (_, why) in sorted(unsure.items()):
            print(f"  {fetch.get(u, u)}\n      {why}")

    if not broken and not broken_internal:
        print(f"\nno broken links."
              f"{'' if args.offline else f' {len(results) - len(unsure)} external and sibling-site links answered normally.'}")
        return 0

    print()
    for u, pages in broken_internal:
        print(f"::error::internal link goes nowhere: {u}")
        for p in pages[:4]:
            print(f"           on {p}")
    for u, (_, code) in sorted(broken.items()):
        print(f"::error::{code} — {fetch.get(u, u)}")
        for p in sorted(found[u])[:4]:
            print(f"           on {p}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
