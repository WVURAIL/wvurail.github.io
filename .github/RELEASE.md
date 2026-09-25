# Approved design release

The approved preview design is published from `main` at https://wvurail.org/.
DSPIRA publishes separately at https://wvurail.org/dspira/.
The `wvu` branches still provide the staging preview.

Both production workflows trim the Design System stylesheet using the pinned,
tested preview build helper. Normal pages are indexable. Preview pages remain
excluded from search engines.

The previous lab release is `7d6daea`; the previous DSPIRA release is `6b50560`.
If navigation, lesson access, or downloads fail after publishing, revert the
release content in the affected repository and run its Pages workflow. Restore
the previous tree without changing history. For the lab, also set Pages back to
its `main` branch source: its previous release predates the publishing workflow.

The CNAME remains `wvurail.org`. The separate University-domain move is covered
in `CUTOVER.md` and has not been performed.
