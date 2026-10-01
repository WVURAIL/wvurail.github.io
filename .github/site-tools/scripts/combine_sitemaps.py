#!/usr/bin/env python3
"""Combine the lab and lessons sitemaps at the preview root."""

import argparse
from pathlib import Path
import xml.etree.ElementTree as ET

NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
ET.register_namespace("", NS)


def combine_sitemaps(site):
    site = Path(site)
    combined = ET.Element(f"{{{NS}}}urlset")
    seen = set()
    for path in (site / "sitemap.xml", site / "dspira/sitemap.xml"):
        root = ET.parse(path).getroot()
        if root.tag != f"{{{NS}}}urlset":
            raise ValueError(f"Expected a sitemap urlset in {path}")
        for entry in root.findall(f"{{{NS}}}url"):
            location = entry.findtext(f"{{{NS}}}loc", "").strip()
            if not location:
                raise ValueError(f"Missing sitemap location in {path}")
            if location not in seen:
                seen.add(location)
                combined.append(entry)
    ET.indent(combined)
    ET.ElementTree(combined).write(site / "sitemap.xml", encoding="utf-8", xml_declaration=True)
    return len(seen)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", type=Path, default=Path("_site"))
    args = parser.parse_args()
    print(f"Combined sitemap contains {combine_sitemaps(args.site)} URLs.")


if __name__ == "__main__":
    main()
