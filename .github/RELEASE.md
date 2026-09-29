# Approved design release

The approved preview design is published from `main` at https://wvurail.org/.
DSPIRA publishes separately at https://wvurail.org/dspira/.
The approval preview is retired. Changes publish from `main` after validation.

Both production workflows trim the Design System stylesheet using the tested shared build helper. Publication uses the artifact that passed
the full build checks. Normal pages are indexable.

The previous lab release is `7d6daea`; the previous DSPIRA release is `6b50560`.
If navigation, lesson access, or downloads fail after publishing, revert the
release content in the affected repository and run its Pages workflow. Restore
the previous tree without changing history. Keep Pages configured to deploy through GitHub Actions.

The CNAME remains `wvurail.org`. The separate University-domain move is covered
in `CUTOVER.md` and has not been performed.
