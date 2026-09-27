# Retiring the approval preview

The approved site is published from `main` at https://wvurail.org/.
The lab, DSPIRA, and LightWork repositories own their respective site sections.
The `rail-preview` repository assembled an approval copy; it did not own separate lesson content.

The useful build tools and their tests now live in `.github/site-tools/` here.
The lab workflow uses that local copy. DSPIRA uses a pinned revision of this
repository. Preview deletion therefore does not remove a live build dependency.

Before deleting the preview repository:

1. Confirm the updated lab and DSPIRA publishing workflows pass.
2. Check the live home page, lessons, and stylesheets.
3. Retire obsolete approval branches after preserving any distinct work.

Deleting the repository removes its approval URLs, workflow history, issues,
and pull requests. It does not change the live domain or the planned university
domain change. That separate process remains in [CUTOVER.md](CUTOVER.md).

If a publishing check fails, restore the previous workflow and investigate
before deleting the preview. After deletion, restore the tools from this
repository's history rather than reintroducing a preview dependency.
