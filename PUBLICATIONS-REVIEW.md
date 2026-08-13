# Publications list — what needs a human eye

`_data/publications.yml` was compiled automatically from INSPIRE-HEP, Crossref,
NSF-PAR, arXiv and author CVs. **69 entries, 2014–2026.** It is a strong starting
point, not a verified list. This file records every judgment call so you can
accept or reverse each one, then delete this file.

Entries needing a decision carry a `review:` key in the YAML. Delete that key
once you've confirmed the entry.

---

## 1. Read this first: a retracted paper is deliberately excluded

**"Sub-second periodicity in a fast radio burst"**, *Nature* **607**, 256 (2022),
doi `10.1038/s41586-022-04841-8`.

Retracted **23 June 2026** (retraction note doi `10.1038/s41586-026-10799-8`).
The retraction states that a calibration error in CHIME's digital beam pointing
meant the signal attributed to FRB 20191221A was actually the known Galactic
pulsar PSR J0248+6021.

Kevin, Pranav and Joseph are all authors. **It is left out of the list on
purpose.** It still appears on Google Scholar and ResearchGate, so it will look
like an omission to anyone cross-checking — worth a conscious decision rather
than letting it drift back in.

---

## 2. Scope decisions I made

| Decision | Rationale | Reverse it by |
| --- | --- | --- |
| Only work published **during** the author's WVU time | Your instruction | Adding pre-WVU papers to the YAML |
| **ICE papers excluded** (JAI 5, arXiv 1608.06262 and 1608.04347) | You said ICE is McGill postdoc work | Note: both were *published* in 2016–17, i.e. inside the WVU window. If the criterion is publication date rather than where the work was done, these come back |
| Astro2020 / LRP2020 white papers excluded (7 of them: PUMA, CHORD LRP, "Dark Energy and Modified Gravity", etc.) | Not refereed | Many labs do list these — easy to add |
| Errata excluded (e.g. ApJS 264, 53) | Not distinct papers | — |
| Conference abstracts excluded (1-page URSI AT-RASC DSPIRA abstract) | Too slight | — |
| Preprints **included** but tagged | Two of them; PEACC and one other. They render with a gold "Preprint" tag | Delete the entries, or the `preprint: true` key once published |

Also excluded: a book chapter, "Hydrogen Map of Our Milky Way" (Langston &
Bandura), in *Radio Telescope Instrumentation for Teaching*, Dec 2025,
doi `10.1088/2514-3433/ae1223ch5`. Real, and arguably belongs under Education.

---

## 3. Entries flagged `review:` — in priority order

1. **The two HIRAX SPIE 11445 papers** (mechanical/optical design; noise
   temperature testing). Genuine year conflict: NASA ADS says 2020, SPIE and
   Crossref date the volume to January 2021. The noise-temperature paper also
   circulates under two different titles — the SPIE one is used here.
2. **"A Digital Calibration Source for 21 cm Cosmology Telescopes"** (Bhopi).
   Listed as 2023 (JAI 12, 2250016 per ADS/INSPIRE); Crossref and NSF-PAR say
   2022; arXiv posting is Jan 2022. Note this is *also* Kalyani's dissertation
   title — the paper and the dissertation are separate records here, which is
   correct but looks like a duplicate at a glance.
3. **"Quantization Bias for Digital Correlators"** — article number 1850008 was
   inferred from the ADS bibcode pattern, not read off the publisher page.
4. **"Antenna characterization for the HIRAX experiment"** — first-author initial
   came from ResearchGate, not a verified author list.
5. **The two preprints** — check whether either has been published since.

## 4. Papers I checked and rejected — don't let these creep back in

- **"Holographic Beam Measurements of CHIME"**, ApJ 976, 163 (2024) — Kevin is
  *not* among the named authors.
- **"CHIME/FRB Discovery and Localization of the Swift-observed FRB 20241228A"**,
  ApJ 998, 97 (2026) — not in the author list.
- **"Drone Beam Mapping of the TONE Radio Dish Array"**, AJ 170, 6 (2025) —
  despite TONE being a WVU project, the six-author list doesn't include him.
- **"Overview of the CHORD Project"**, arXiv 2607.09374 (SPIE 2026) — on his
  ResearchGate, but authorship could not be confirmed. **Add it if you know he's
  on it.**

## 5. Known coverage gaps

- **Google Scholar and ORCID were unreachable** (robots.txt / network), so his
  own curated profile was never read. That's the single biggest blind spot.
- INSPIRE systematically misses AJ, IEEE, RNAAS and RASTI papers. Five were
  recovered by hand; there may be more of that type.
- **2016–2018 is the thinnest window** — coverage there rests on INSPIRE plus a
  CV that stops at 2016.
- Alumni coverage is by name-matching, so a paper where someone is buried in a
  long collaboration author list may be tagged to Kevin but not to them.

## 6. The "Selected" picks are mine, not yours

Nine papers carry `highlight: true`, which pins them to the Selected band and the
home page. I chose: the three WVU-led papers (Kania's RFI filters, Sanghavi's
TONE, Bhopi's calibration source), the Outriggers design overview, the first
cosmological 21 cm detection with CHIME, and the four landmark Nature/catalog
results. **Change these freely** — it's an editorial call, not a factual one.
