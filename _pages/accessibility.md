---
layout: default
permalink: /accessibility/
title: Accessibility
eyebrow: About this site
lead: What we aim for, what we know is imperfect, and how to tell us when something gets in your way.
description: Accessibility statement for wvurail.org — conformance target, known issues, and how to report a problem.
---

## What we aim for

This site targets **WCAG 2.1 Level AA**. West Virginia University is required to
meet that standard under Section 504 of the Rehabilitation Act and Title II of
the Americans with Disabilities Act, and we hold the lab's own site to it
whether or not it is hosted on University systems.

## Where we are

Every page has been checked with automated tooling and by hand: keyboard-only
navigation, a 320&nbsp;pixel viewport, 200% zoom, and increased text spacing.
The site carries no third-party scripts, no analytics, and no tracking, and it
self-hosts its fonts, so nothing about your visit is shared with anyone else.

Specifically, the site aims to:

- describe every photograph in context rather than by filename
- keep a single `h1` on each page with headings that cascade beneath it
- give every interactive element a visible keyboard focus indicator
- respect your system's reduced-motion setting for all animation
- mark links inside running text with an underline, not colour alone
- link to canonical records rather than serving PDFs

## Known issues

We would rather list these than imply the site is perfect.

- The tools at `/tools/` display a clock that updates every second. The reading
  is announced only when you press the button, so a screen reader is not
  interrupted continuously — but there is no control to stop the visible tick.
- The home page hero animates a starfield behind the heading. It stops entirely
  if your system requests reduced motion, but there is no in-page control.
- Some older DSPIRA cohort pages are archives, kept as they were published. If
  something on them is unusable, tell us and we will fix or retire the page.

## Telling us about a problem

If any part of this site gets in your way, email
[{{ site.email }}](mailto:{{ site.email }}?Subject=Accessibility%20on%20wvurail.org).
Say which page and what happened; you do not need to know the technical cause.
We will reply, and we will tell you what we can fix and when.

For accessibility of West Virginia University's own web properties, see
[WVU Digital Accessibility](https://digitalaccessibility.wvu.edu/).

## About this site's status

RAIL is a research group in the Lane Department of Computer Science and
Electrical Engineering. This site is maintained by the lab rather than by the
University: it is not an official West Virginia University web page, and its
content is the lab's responsibility.
