import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location(
    "check_links", Path(__file__).resolve().parents[1] / "scripts/check_links.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PreviewLinksTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.site = Path(self.temp.name)

    def write(self, path, text=""):
        file = self.site / path
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(text, encoding="utf-8")

    def check(self):
        return module.check_site(self.site, "https://wvurail.org/rail-preview/")[2]

    def test_combined_sites_and_relative_assets(self):
        self.write("index.html", '<a href="/rail-preview/dspira/">Lessons</a>')
        self.write("dspira/index.html",
                   '<a href="../">Lab</a><img src="images/a%20b.png">'
                   '<a href="lesson?mode=read#section">Lesson</a>')
        self.write("dspira/lesson.html", "<h1>Lesson</h1>")
        self.write("dspira/images/a b.png")
        self.assertFalse(self.check())

    def test_lightwork_must_stay_outside_preview(self):
        self.write("dspira/index.html",
                   '<a href="/rail-preview/lightwork/">Broken</a>'
                   '<a href="/lightwork/">Live project</a>')
        self.assertEqual(self.check(), {
            "/rail-preview/lightwork/": {"dspira/index.html"}})

    def test_missing_asset_and_redirect_are_checked_on_deep_pages(self):
        self.write("education/cohorts/2017/index.html",
                   "<img src='/rail-preview/images/missing.png'>"
                   '<meta http-equiv="refresh" content="0; URL=/rail-preview/missing/">')
        self.assertEqual(set(self.check()), {
            "/rail-preview/images/missing.png", "/rail-preview/missing/"})

    def test_host_and_path_boundaries(self):
        self.write("index.html",
                   '<a href="https://example.com/rail-preview/missing/">External</a>'
                   '<a href="/rail-preview-other/">Other project</a>'
                   '<a href="mailto:lab@example.com">Email</a>'
                   '<a href="/rail-preview">Preview root</a>'
                   '<a href="https://wvurail.org/rail-preview/missing/">Missing</a>')
        self.assertEqual(set(self.check()), {"/rail-preview/missing/"})

    def test_empty_build_fails(self):
        with self.assertRaisesRegex(ValueError, "No HTML pages"):
            self.check()


if __name__ == "__main__":
    unittest.main()
