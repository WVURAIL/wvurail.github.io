#!/usr/bin/env python3
"""
Are the links off this site still alive?

    bundle exec jekyll build
    python3 .github/scripts/check_links.py            # reads _site
    python3 .github/scripts/check_links.py --offline  # internal links only

Run it against a REAL Jekyll build. Internal links are checked by looking for
the file in _site, so a partial build reports its own missing pages as broken
links — /feed.xml comes from the jekyll-feed plugin, for instance, and is absent
from anything that did not run it.

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
             refuse scripts outright. Reported, never failed on.
  OK         Answered normally.

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

    # Internal links: does the built site actually contain that path?
    broken_internal = []
    for u, pages in sorted(internal.items()):
        path = urllib.parse.urlparse(u).path
        if not path.startswith("/"):
            continue                                  # relative; rare here
        cand = [os.path.join(site, path.lstrip("/")),
                os.path.join(site, path.lstrip("/"), "index.html")]
        if not any(os.path.exists(c) for c in cand):
            broken_internal.append((u, sorted(pages)))

    print(f"{len(internal)} internal links, {len(external)} external")

    results = {}
    if not args.offline:
        try:
            urllib.request.urlopen(
                urllib.request.Request("https://example.com",
                                       headers={"User-Agent": UA}), timeout=15)
        except Exception:                             # noqa: BLE001
            print("::warning::no internet reachable — checking internal links only")
            args.offline = True
    if not args.offline:
        with ThreadPoolExecutor(max_workers=WORKERS) as ex:
            for u, r in zip(external, ex.map(check, external)):
                host = urllib.parse.urlparse(u).netloc.lower()
                if any(h in host for h in UNVERIFIABLE) and r[0] == "ok":
                    r = ("check", "host answers 200 for deleted content")
                results[u] = r

    broken = {u: r for u, r in results.items() if r[0] == "broken"}
    unsure = {u: r for u, r in results.items() if r[0] == "check"}

    if unsure:
        print(f"\nneeds a human ({len(unsure)}) — not failed on:")
        for u, (_, why) in sorted(unsure.items()):
            print(f"  {u}\n      {why}")

    if not broken and not broken_internal:
        print(f"\nno broken links."
              f"{'' if args.offline else f' {len(results) - len(unsure)} external links answered normally.'}")
        return 0

    print()
    for u, pages in broken_internal:
        print(f"::error::internal link goes nowhere: {u}")
        for p in pages[:4]:
            print(f"           on {p}")
    for u, (_, code) in sorted(broken.items()):
        print(f"::error::{code} — {u}")
        for p in sorted(found[u])[:4]:
            print(f"           on {p}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
