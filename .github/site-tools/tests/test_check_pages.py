import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location(
    "check_pages", Path(__file__).resolve().parents[1] / "scripts/check_pages.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

PAGE = '''<!doctype html><html lang="en"><head>
<title>Radio Astronomy Classroom Activities | WVU RAIL</title>
<meta name="description" content="Explore classroom radio astronomy activities from WVU RAIL. Build a telescope, set up the receiver, and learn to observe the sky.">
<meta name="robots" content="noindex">
<meta property="og:title" content="Radio Astronomy Classroom Activities | WVU RAIL">
<meta property="og:description" content="Radio astronomy lessons for the classroom.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://example.org/">
<meta property="og:image" content="https://example.org/social.png">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script>
</head><body><a href="#main">Skip to main content</a>
<main id="main" tabindex="-1"><h1>Radio astronomy</h1><h2>Lessons</h2>
<img src="decoration.png" alt=""><p>Choose a lesson.</p></main></body></html>'''


class PreviewPagesTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.site = Path(self.temp.name)

    def write(self, name, html):
        (self.site / name).write_text(html, encoding="utf-8")

    def problems(self):
        return module.check_site(self.site)[2]

    def test_accessible_page_and_decorative_image(self):
        self.write("index.html", PAGE)
        self.assertEqual(self.problems(), [])

    def test_exported_notebook_must_honor_preview_noindex(self):
        self.write("notebook.html", PAGE.replace('<meta name="robots" content="noindex">', ""))
        self.assertTrue(any("missing noindex" in issue for issue in self.problems()))

    def test_duplicate_metadata_and_malformed_schema(self):
        self.write("one.html", PAGE)
        self.write("two.html", PAGE.replace('"WebPage"}', '"WebPage"'))
        problems = self.problems()
        self.assertTrue(any("Duplicate title" in p for p in problems))
        self.assertTrue(any("Duplicate description" in p for p in problems))
        self.assertTrue(any("invalid structured data" in p for p in problems))

    def test_heading_jump_and_skip_focus(self):
        self.write("index.html", PAGE.replace("<h2>", "<h3>").replace("</h2>", "</h3>").replace(' tabindex="-1"', ""))
        problems = self.problems()
        self.assertTrue(any("heading jumps" in p for p in problems))
        self.assertTrue(any("skip-link focus" in p for p in problems))

    def test_redirects_need_language_and_noindex_but_not_page_metadata(self):
        self.write("old.html", '<html lang="en"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/new/"></html>')
        self.assertEqual(self.problems(), [])

    def test_footnote_return_links_need_text_and_a_destination(self):
        link = '<a class="reversefootnote" href="#missing">&#8617;</a>'
        self.write("index.html", PAGE.replace('</main>', link + '</main>'))
        problems = self.problems()
        self.assertTrue(any("descriptive hidden text" in p for p in problems))
        self.assertTrue(any("no matching reference" in p for p in problems))

    def test_labeled_footnote_return_link(self):
        link = ('<sup id="fnref:note">1</sup><a class="reversefootnote" href="#fnref:note">'
                '<span aria-hidden="true">&#8617;</span>'
                '<span class="visually-hidden">Return to footnote 1 in the text</span></a>')
        self.write("index.html", PAGE.replace('</main>', link + '</main>'))
        self.assertEqual(self.problems(), [])

    def test_empty_build_fails(self):
        with self.assertRaises(ValueError):
            module.check_site(self.site)

    def test_long_title_and_missing_sharing_metadata(self):
        html = PAGE.replace("<title>", "<title>" + "Long title " * 5)
        html = html.replace('property="og:image"', 'property="other"')
        self.write("notebook.html", html)
        problems = self.problems()
        self.assertTrue(any("title is too long" in p for p in problems))
        self.assertTrue(any("missing Open Graph tag: og:image" in p for p in problems))
