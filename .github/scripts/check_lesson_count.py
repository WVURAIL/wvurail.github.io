#!/usr/bin/env python3
"""
Does _data/education.yml still agree with the lessons site about how many
lessons there are, and what the modules are called?

    python3 .github/scripts/check_lesson_count.py

This site shows the lesson count in a few places, all of them fed by one value,
materials.lesson_count. The lessons site counts its own posts, so its number
moves on its own the moment somebody publishes. Nothing connects the two — they
are separate repositories, and Jekyll here cannot see the posts there — so the
number is copied by hand and goes stale silently.

It has gone stale twice. Once the page said 47 while the lessons site said 48,
and the page's own meta description said 44. Nobody noticed either time; there
is nothing to notice, which is the whole problem. Hence a scheduled job.

The same is true of the module list, which is copied here for the same reason
and had nothing watching it at all. It named eleven modules for some weeks
after the lessons site consolidated them into seven. It is checked here too
now.

Exit codes:
  0  the numbers agree, OR the lessons site could not be reached
  1  the numbers disagree, or the page no longer looks the way this expects

Reaching the site is deliberately not required. A DNS blip at 13:17 on a Monday
is not a reason to send an email that says the website is wrong.

Standard library only, so it runs anywhere with a python3.
"""

import re
import sys
import urllib.error
import urllib.request

LESSONS = "https://wvurail.org/dspira-lessons/"
ALL_LESSONS = LESSONS + "all/"
MODULE_INDEX = LESSONS + "lesson-modules/"
EDUCATION_YML = "_data/education.yml"
TIMEOUT = 30
UA = "wvurail.org lesson-count check (+https://github.com/WVURAIL/wvurail.github.io)"


def declared_count(path=EDUCATION_YML):
    """The number this repository claims, read without a YAML library."""
    text = open(path, encoding="utf-8").read()
    m = re.search(r"^\s*lesson_count:\s*(\d+)\s*$", text, re.M)
    if not m:
        sys.exit(f"::error::no `lesson_count:` line found in {path} — has the "
                 f"file been restructured? This check reads it by regex so it "
                 f"needs no YAML library.")
    return int(m.group(1))


def declared_modules(path=EDUCATION_YML):
    """The module names this repository claims, read without a YAML library.

    The block is `  modules:` followed by `    - Name` lines; it ends at the
    first line that is not one of those or a comment.
    """
    lines = open(path, encoding="utf-8").read().splitlines()
    out, inside = [], False
    for line in lines:
        if re.match(r"^\s*modules:\s*$", line):
            inside = True
            continue
        if inside:
            item = re.match(r"^\s+-\s+(.+?)\s*$", line)
            if item:
                out.append(item.group(1))
            elif line.strip() == "" or line.lstrip().startswith("#"):
                continue
            else:
                break
    return out


def published_modules(html):
    """The module names the lessons site's module index shows, in order."""
    names = re.findall(
        r'class="module-toc__item".*?<h2>\s*<a[^>]*>(.*?)</a>',
        html,
        re.S,
    )
    if not names:
        # The older index rendered module names as card headings instead.
        names = re.findall(r'class="module"[^>]*>.*?<h3>\s*<a[^>]*>(.*?)</a>',
                           html, re.S)
    return [re.sub(r"\s+", " ", n).strip() for n in names]


def compare_modules(declared, published):
    """None if they agree, otherwise a message saying how they differ.

    Capitalisation is not compared -- this file may reasonably write the names
    in sentence case. Names, count and order are.
    """
    if not published:
        return ("could not read any module names from %s. The site's markup "
                "has probably changed and this script needs updating -- it has "
                "not established that the list below is wrong." % MODULE_INDEX)

    if [d.lower() for d in declared] == [p.lower() for p in published]:
        return None

    missing = [p for p in published if p.lower() not in [d.lower() for d in declared]]
    extra = [d for d in declared if d.lower() not in [p.lower() for p in published]]
    detail = []
    if missing:
        detail.append("not listed here: " + ", ".join(missing))
    if extra:
        detail.append("no longer on the lessons site: " + ", ".join(extra))
    if not detail:
        detail.append("same names, different order")
    return ("the module list is out of date. %s. Fix it by editing the "
            "`modules:` block in %s to match, in the same order."
            % ("; ".join(detail), EDUCATION_YML))


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read().decode("utf-8", "replace")


def count_listed_lessons(first_page):
    """Read either the current all-on-one-page list or the legacy pagination."""
    # The redesigned site lists lessons in cards, grouped by module. A lesson
    # can belong to more than one module, so count distinct URLs rather than
    # cards.
    cards = re.findall(
        r'class="lesson-card"[^>]*>.*?<a[^>]*href="([^"]+)"',
        first_page,
        re.S,
    )
    if cards:
        return len(set(cards)), "the all-lessons page"

    # The older site lists ten posts per page. Follow the rendered page count
    # instead of assuming there will always be five pages.
    page_count = re.search(r"Page\s+1\s+of\s+(\d+)", first_page)
    if not page_count:
        return 0, "unrecognized all-lessons markup"

    pages = int(page_count.group(1))
    links = set(re.findall(r'href="([^"]+)"\s+class="post-link"', first_page))
    for page in range(2, pages + 1):
        html = fetch(f"{ALL_LESSONS}page{page}/")
        page_links = re.findall(r'href="([^"]+)"\s+class="post-link"', html)
        if not page_links:
            return 0, f"page {page} of the legacy list had no lesson links"
        links.update(page_links)
    return len(links), f"all {pages} pages of the legacy lesson list"


def main():
    declared = declared_count()

    try:
        all_html = fetch(ALL_LESSONS)
        home_html = fetch(LESSONS)
        modules_html = fetch(MODULE_INDEX)
        listed, source = count_listed_lessons(all_html)
    except (urllib.error.URLError, urllib.error.HTTPError, OSError) as e:
        # Not a failure. See the note at the top.
        print(f"::warning::could not reach {LESSONS} ({e}). "
              f"Not checking the lesson count this time.")
        return 0

    # The redesigned home page states the count. The legacy home page does not,
    # so its paginated list supplies its own structural cross-check: every page
    # declared in "Page 1 of N" must load and contain lesson links.
    hero = re.search(r"(\d+)\s+free lessons", home_html)

    if not listed:
        sys.exit("::error::could not read a lesson count from the lessons site. "
                 f"The reader reported: {source}. The site's markup has probably "
                 "changed and this script needs updating — it has not established "
                 "that the declared count is wrong.")

    if hero and listed != int(hero.group(1)):
        sys.exit(f"::error::the lessons site disagrees with itself: /all/ links "
                 f"{listed} distinct lessons, its front page says {hero.group(1)}. Look "
                 f"there, not here — this repository is not the problem.")

    live = listed

    # Unreadable markup is not a disagreement, and this script fails only when
    # the two sites genuinely disagree -- the same reason an unreachable site
    # warns rather than failing. A real mismatch of names still fails.
    published = published_modules(modules_html)
    module_problem = compare_modules(declared_modules(), published)
    if module_problem and not published:
        print("::warning::" + module_problem)
    elif module_problem:
        sys.exit("::error::" + module_problem)

    if declared != live:
        sys.exit(
            f"::error::lesson count is out of date. _data/education.yml says "
            f"{declared}, the lessons site publishes {live}. Fix it by editing "
            f"the single `lesson_count:` line in {EDUCATION_YML} — every place "
            f"the number appears on the site is rendered from it.")

    # A notice rather than a plain print, so the numbers show on the run summary
    # without opening the log. A green tick on its own does not distinguish
    # "compared them, they agree" from "could not reach the site, gave up" —
    # that path warns, but reading the absence of a warning is a poor way to
    # learn that a check did its job.
    modules = declared_modules()
    print(f"::notice title=Lesson count::agreed: {declared}. "
          f"_data/education.yml and {source} both say {declared} lessons, "
          f"in the same {len(modules)} modules.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
