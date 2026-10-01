# Domain migration record: wvurail.org to rail.wvu.edu

The lab website is live at `https://rail.wvu.edu`. DSPIRA and LightWork publish
under the same domain. The former approval preview is archived; ongoing changes
belong in the active repositories and their current directory structure.

## Domain ownership and forwarding

- The University manages `rail.wvu.edu` DNS and points it at `wvurail.github.io`.
- The organization site's `CNAME` is `rail.wvu.edu`. GitHub Pages project sites
  inherit that custom domain.
- The lab manages the old `wvurail.org` domain through Squarespace. Its domain
  forwarding sends visitors to the new domain while preserving their paths.
- Keep the old domain registered while published citations and bookmarks use it.
  Its verification records and forwarding settings are separate from the
  University's DNS records for `rail.wvu.edu`.

Squarespace domain forwarding cannot implement arbitrary exceptions for
individual source paths. GitHub Pages serves static files and HTML compatibility
pages; it does not provide a general server-side redirect configuration. Some
old file addresses and malformed double-slash addresses remain documented
forwarding exceptions. Do not describe the migration as forwarding every possible
old address successfully.

## Current publishing ownership

| Repository | Current ownership |
| --- | --- |
| `wvurail.github.io` | Lab root, shared build tools, and old project-address compatibility routes |
| `dspira` | Current lessons, retained historical files, and resource catalogs |
| `lightwork` | Numbered technical memos and related resources |
| `dspira-software` | Maintained telescope applications and observation-processing tools |
| `dspira-hardware` | Maintained amplifier designs and assembly references imported by DSPIRA |
| `radio-research-software` | Research acquisition, detection, and transient experiments |

The lab build owns `/dspira-lessons/` compatibility paths for current lessons.
The `/gr-dspira/` page points to the current software guide. Generated file aliases
retain existing lesson downloads where supported.

The recovery releases were intentionally deleted on September 30, 2026. Their
archive-dependent `/dspira-archive/`, `/cra/`, `/gr-transient/`, and
`/dspira/history/sites/` publications are retired.
See DSPIRA's [archive retirement record](https://github.com/WVURAIL/dspira/blob/main/.github/ARCHIVE_RETIREMENT.md) for current ownership and retained material.

## Preserved material and current paths

Use the current information structure when adding or updating resources. Trace
renames and superseded versions before treating a historical file as missing.
Retain unique historical material at an appropriate current location and link it
from the website. Do not recreate obsolete source trees or overwrite maintained
software with older versions.

The DSPIRA history page at `/dspira/history/` provides individual resources and
historical context. These retained files live in the active repositories and do
not require the deleted recovery releases. Keep original author credits,
licenses, and historical bytes intact.

Two input recordings referenced by historical notebooks were not found in the
reachable repository histories. Recovery requests remain open in
`radio-research-software` [issue 56](https://github.com/WVURAIL/radio-research-software/issues/56)
and [issue 57](https://github.com/WVURAIL/radio-research-software/issues/57).
The notebooks and their saved results remain available.

Discussion pages at `/dspira/forum/` link to GitHub Discussions. They do not embed
a forum on the University domain. The lab's `/dspiratalk/` compatibility page
continues to point there.

## Build and deployment

Active sites publish from `main`. The lab uses Ruby 3.3 and locked Jekyll 4.4
dependencies. Its Publish Pages workflow runs the reusable Build workflow and
deploys the resulting validated artifact. The build also trims the pinned WVU
Design System stylesheet and generates compatibility routes.

Shared build tools live in `.github/site-tools/`. DSPIRA uses a pinned revision
of those tools; neither live deployment depends on the archived preview.
See [preview retirement](PREVIEW_RETIREMENT.md).

Before changing publishing or domain settings, verify:

1. `CNAME`, `_config.yml`, canonical links, and sitemaps agree on the live domain.
2. Lab, DSPIRA, and LightWork builds pass with their committed dependency locks.
3. Current pages, downloadable files, and compatibility routes still resolve.
4. Retained historical resources and their direct downloads remain available.
5. GitHub Actions deployment succeeds, followed by checks against the live site.

A future domain change would also require University DNS coordination, changes to
Squarespace forwarding, and updates to the canonical targets in DSPIRA's
`tools/publish_pages.py`, public resource links, and
publishing workflows. Changing repository content alone does not change external
DNS or forwarding settings.
