# Shared site tools

The live lab repository owns these build and validation tools.
They were moved unchanged from the approval preview after the site was approved.
The lab deployment uses this checkout; DSPIRA checks out a pinned lab revision.
Neither deployment needs the preview repository.

Install dependencies and run the tests from the repository root:

```sh
python3 -m pip install -r .github/site-tools/requirements-checks.txt
python3 -m unittest discover -s .github/site-tools/tests -v
npm ci --prefix .github/site-tools
npm test --prefix .github/site-tools
```

Trim a standalone site's stylesheet:

```sh
node .github/site-tools/scripts/trim_styles.mjs _site assets/wvu-design-system/site.min.css
```

Check an assembled lab, DSPIRA, and LightWork build:

```sh
python3 .github/site-tools/scripts/check_links.py --site _site --url https://wvurail.org/
```

The retained preview checks also cover subpath links, combined sitemaps, readability,
and page metadata. `check_pages.py` requires `noindex` and is intended for an
approval build, not production. Their tests use temporary fixtures and need no
deployed preview or separate branch.
