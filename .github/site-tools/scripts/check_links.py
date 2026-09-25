#!/usr/bin/env python3
"""Check links and assets within the assembled preview, without network access."""

import argparse
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urljoin, urlsplit


class References(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.urls = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for name in ("href", "src", "poster", "data-gif"):
            if attrs.get(name):
                self.urls.append(attrs[name])
        if tag == "meta" and attrs.get("http-equiv", "").lower() == "refresh":
            match = re.search(r"url\s*=\s*(.+)", attrs.get("content", ""), re.I)
            if match:
                self.urls.append(match.group(1).strip().strip("'\""))


def check_site(site, base_url):
    site = Path(site).resolve()
    base_url = base_url.rstrip("/") + "/"
    base = urlsplit(base_url)
    pages = sorted(site.rglob("*.html"))
    if not pages:
        raise ValueError(f"No HTML pages found in {site}")
    broken = defaultdict(set)
    checked = set()
    for page in pages:
        relative = page.relative_to(site).as_posix()
        page_url = urljoin(base_url, relative)
        parser = References()
        parser.feed(page.read_text(encoding="utf-8"))
        for reference in parser.urls:
            target = urlsplit(urljoin(page_url, reference.strip()))
            if target.scheme not in ("http", "https") or target.netloc != base.netloc:
                continue
            # Other projects (including LightWork) remain at the host root.
            if target.path == base.path.rstrip("/"):
                path = ""
            elif target.path.startswith(base.path):
                path = unquote(target.path[len(base.path):])
            else:
                continue
            candidate = (site / path).resolve()
            try:
                candidate.relative_to(site)
            except ValueError:
                broken[target.path].add(relative)
                continue
            checked.add(target.path)
            candidates = [candidate, candidate / "index.html"]
            # GitHub Pages also serves foo.html at /foo.
            if not candidate.suffix and not target.path.endswith("/"):
                candidates.append(candidate.with_suffix(".html"))
            if not any(item.is_file() for item in candidates):
                broken[target.path].add(relative)
    return len(pages), len(checked), broken


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", default="_site")
    parser.add_argument("--url", default="https://wvurail.org/rail-preview/")
    args = parser.parse_args()
    try:
        pages, targets, broken = check_site(args.site, args.url)
    except ValueError as error:
        parser.exit(1, f"{error}\n")
    for target, sources in sorted(broken.items()):
        print(f"Missing {target}")
        for source in sorted(sources):
            print(f"  from {source}")
    print(f"Checked {pages} HTML pages and {targets} preview targets; "
          f"{len(broken)} missing targets.")
    return bool(broken)


if __name__ == "__main__":
    raise SystemExit(main())
