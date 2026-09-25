#!/usr/bin/env python3
"""Check prose sentence lengths, preserving documented quotations and citations."""

import argparse
import hashlib
import json
from pathlib import Path
import re

from bs4 import BeautifulSoup

BLOCKS = "p, li, dd, dt, td, th, figcaption"
EXCEPTIONS = Path(__file__).with_name("readability_exceptions.json")


def sentences(text):
    text = re.sub(r"\b(?:e\.g|i\.e|Dr|Mr|Ms|Mrs|Prof|vs|Fig|Eq|St)\.",
                  lambda m: m[0].replace(".", "\u2024"), text)
    for part in re.split(r"(?<=[.!?])[\"”'’\)\]]*\s+", text):
        yield part.replace("\u2024", ".")


def word_count(text):
    return len(re.findall(r"\b\w+(?:['’]\w+)*\b", text))


def text_blocks(soup):
    for node in soup.select("script, style, pre, svg, math, .MathJax, .MathJax_Display"):
        node.decompose()
    for block in soup.select(BLOCKS):
        copy = BeautifulSoup(str(block), "html.parser")
        for nested in copy.find().select("p, ul, ol, dl, table"):
            nested.decompose()
        for code in copy.select("code"):
            code.replace_with("code")
        for note in copy.select("sup .footnote, a.reversefootnote"):
            note.decompose()
        for br in copy.select("br"):
            br.replace_with(". ")
        text = copy.get_text(" ", strip=True)
        text = re.sub(r"\\\(.*?\\\)|\\\[.*?\\\]", "equation", text, flags=re.S)
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            yield text


def check_site(site, exceptions):
    pages = sorted(Path(site).rglob("*.html"))
    if not pages:
        raise ValueError(f"No HTML pages found in {site}")
    problems, preserved = [], set()
    checked = 0
    for file in pages:
        name = file.relative_to(site).as_posix()
        soup = BeautifulSoup(file.read_text(encoding="utf-8"), "html.parser")
        if soup.select_one('meta[http-equiv="refresh" i]'):
            continue
        for text in text_blocks(soup):
            digest = hashlib.sha256(text.encode()).hexdigest()
            if digest in exceptions and name in exceptions[digest]["pages"]:
                preserved.add(digest)
                continue
            for sentence in sentences(text):
                checked += 1
                count = word_count(sentence)
                if count > 20:
                    problems.append({"page": name, "words": count, "sentence": sentence,
                                     "block": text, "sha256": digest})
    return checked, preserved, problems


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", type=Path, default=Path("_site"))
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    exceptions = json.loads(EXCEPTIONS.read_text(encoding="utf-8"))
    try:
        checked, preserved, problems = check_site(args.site, exceptions)
    except ValueError as error:
        parser.exit(1, f"{error}\n")
    if args.report:
        args.report.write_text(json.dumps(problems, indent=2) + "\n", encoding="utf-8")
    for row in problems:
        print(f"{row['page']}: {row['words']} words: {row['sentence']}")
    print(f"Checked {checked} sentences; preserved {len(preserved)} approved blocks; {len(problems)} over 20 words.")
    return bool(problems)


if __name__ == "__main__":
    raise SystemExit(main())
