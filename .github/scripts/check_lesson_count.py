#!/usr/bin/env python3
"""
Does _data/education.yml still agree with the lessons site about how many
lessons there are?

    python3 .github/scripts/check_lesson_count.py

This site says "48 lessons" in a few places, all of them fed by one value,
materials.lesson_count. The lessons site counts its own posts, so its number
moves on its own the moment somebody publishes. Nothing connects the two — they
are separate repositories, and Jekyll here cannot see the posts there — so the
number is copied by hand and goes stale silently.

It has gone stale twice. Once the page said 47 while the lessons site said 48,
and the page's own meta description said 44. Nobody noticed either time; there
is nothing to notice, which is the whole problem. Hence a scheduled job.

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


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read().decode("utf-8", "replace")


def main():
    declared = declared_count()

    try:
        all_html = fetch(ALL_LESSONS)
        home_html = fetch(LESSONS)
    except (urllib.error.URLError, urllib.error.HTTPError, OSError) as e:
        # Not a failure. See the note at the top.
        print(f"::warning::could not reach {LESSONS} ({e}). "
              f"Not checking the lesson count this time.")
        return 0

    # Two independent readings of the same number, so that a change in the
    # lessons site's markup shows up as a disagreement rather than as a
    # confidently wrong answer.
    #
    # DISTINCT urls, not cards. /all/ is grouped by module and a lesson with two
    # categories is listed under both, so there are more cards than lessons —
    # five of them, at the time of writing. Counting cards made the first run of
    # this script report 53 against the front page's 48. It did not report a
    # wrong number, which is the point of taking two readings, but a check that
    # fails every time is a check nobody reads.
    cards = re.findall(r'class="lesson-card"[^>]*>.*?<a[^>]*href="([^"]+)"',
                       all_html, re.S)
    listed = len(set(cards))
    hero = re.search(r"(\d+)\s+free lessons", home_html)

    if not listed or not hero:
        sys.exit("::error::could not read a lesson count from the lessons site. "
                 f"/all/ gave {listed} distinct lesson links and the front page "
                 f"{'matched' if hero else 'did not match'} 'N free lessons'. "
                 "The site's markup has probably changed and this script needs "
                 "updating — it has not established that the count is wrong.")

    hero_n = int(hero.group(1))
    if listed != hero_n:
        sys.exit(f"::error::the lessons site disagrees with itself: /all/ links "
                 f"{listed} distinct lessons, its front page says {hero_n}. Look "
                 f"there, not here — this repository is not the problem.")

    live = listed

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
    print(f"::notice title=Lesson count::agreed: {declared}. "
          f"_data/education.yml and wvurail.org/dspira-lessons both say "
          f"{declared} lessons.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
