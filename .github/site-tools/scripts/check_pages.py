#!/usr/bin/env python3
"""Validate metadata and document structure in the combined preview build."""

import argparse
from collections import defaultdict
import json
from pathlib import Path

from bs4 import BeautifulSoup


def check_site(site):
    pages = sorted(Path(site).rglob("*.html"))
    if not pages:
        raise ValueError(f"No HTML pages found in {site}")
    problems = []
    titles, descriptions = defaultdict(list), defaultdict(list)
    content_pages = 0
    for path in pages:
        name = path.relative_to(site).as_posix()
        soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")

        def fail(message):
            problems.append(f"{name}: {message}")

        if not soup.html or not soup.html.get("lang"):
            fail("missing document language")
        robots = soup.select('meta[name="robots"]')
        if not any("noindex" in tag.get("content", "").lower().split(",") for tag in robots):
            fail("preview page is missing noindex")
        if soup.select_one('meta[http-equiv="refresh" i]'):
            continue
        content_pages += 1
        title = soup.title.get_text(" ", strip=True) if soup.title else ""
        if len(title) < 40:
            fail(f"title is too short ({len(title)} characters)")
        if len(title) > 75:
            fail(f"title is too long ({len(title)} characters)")
        titles[title].append(name)
        for property_name in ("og:title", "og:description", "og:type", "og:url", "og:image"):
            tag = soup.find("meta", property=property_name)
            if tag is None or not tag.get("content", "").strip():
                fail(f"missing Open Graph tag: {property_name}")
        desc = soup.select('meta[name="description"]')
        if len(desc) != 1:
            fail("expected exactly one meta description")
        description = desc[0].get("content", "").strip() if desc else ""
        if not 110 <= len(description) <= 160:
            fail(f"description has {len(description)} characters; expected 110–160")
        descriptions[description].append(name)
        schemas = soup.select('script[type="application/ld+json"]')
        if not schemas:
            fail("missing structured data")
        for schema in schemas:
            try:
                data = json.loads(schema.get_text())
                if not isinstance(data, dict) or not data.get("@context") or not data.get("@type"):
                    fail("structured data needs @context and @type")
            except json.JSONDecodeError:
                fail("invalid structured data JSON")
        main = soup.select('main, [role="main"]')
        if len(main) != 1:
            fail("expected exactly one main landmark")
            continue
        main = main[0]
        if main.get("tabindex") != "-1":
            fail("main landmark must accept skip-link focus")
        if not soup.find("a", href="#" + main.get("id", "")):
            fail("missing skip link to the main landmark")
        if len(main.select("h1")) != 1:
            fail("expected exactly one main heading")
        previous = 0
        for heading in main.select("h1, h2, h3, h4, h5, h6"):
            level = int(heading.name[1])
            if level > previous + 1:
                fail(f"heading jumps from h{previous} to h{level}: {heading.get_text(' ', strip=True)[:60]}")
            previous = level
        for backlink in soup.select("a.reversefootnote"):
            label = backlink.select_one(".visually-hidden")
            if label is None or not label.get_text(strip=True):
                fail("footnote return link needs descriptive hidden text")
            target = backlink.get("href", "")
            if not target.startswith("#") or not soup.find(id=target[1:]):
                fail("footnote return link has no matching reference")
        for img in soup.select("img"):
            # Empty alt is valid for decorative images and redundant thumbnails.
            if not img.has_attr("alt"):
                fail(f"image has no alt attribute: {img.get('src', '')[:80]}")
    for label, values in (("title", titles), ("description", descriptions)):
        for value, names in values.items():
            if value and len(names) > 1:
                problems.append(f"Duplicate {label}: {', '.join(names)}")
    return len(pages), content_pages, problems


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", type=Path, default=Path("_site"))
    args = parser.parse_args()
    try:
        pages, content, problems = check_site(args.site)
    except ValueError as error:
        parser.exit(1, f"{error}\n")
    for problem in problems:
        print(problem)
    print(f"Checked {pages} HTML pages ({content} content pages); {len(problems)} problems.")
    return bool(problems)


if __name__ == "__main__":
    raise SystemExit(main())
