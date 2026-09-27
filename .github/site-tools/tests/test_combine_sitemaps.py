import importlib.util
from pathlib import Path
import tempfile
import unittest
import xml.etree.ElementTree as ET

spec = importlib.util.spec_from_file_location(
    "combine_sitemaps", Path(__file__).resolve().parents[1] / "scripts/combine_sitemaps.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
NS = module.NS


class CombinedSitemapTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.site = Path(self.temp.name)
        (self.site / "dspira").mkdir()
        self.lab = self.site / "sitemap.xml"
        self.lessons = self.site / "dspira/sitemap.xml"
        self.lab.write_text(f'<urlset xmlns="{NS}"><url><loc>https://example.org/preview/</loc><lastmod>2026-09-23</lastmod></url></urlset>')

    def test_combines_sites_without_duplicates_or_losing_metadata(self):
        self.lessons.write_text(f'<urlset xmlns="{NS}"><url><loc>https://example.org/preview/</loc></url><url><loc>https://example.org/preview/dspira/</loc></url></urlset>')
        self.assertEqual(module.combine_sitemaps(self.site), 2)
        first = self.lab.read_bytes()
        self.assertEqual(ET.fromstring(first).findtext(f"{{{NS}}}url/{{{NS}}}lastmod"), "2026-09-23")
        self.assertEqual(module.combine_sitemaps(self.site), 2)
        self.assertEqual(first, self.lab.read_bytes())

    def test_missing_lessons_map_does_not_overwrite_lab_map(self):
        before = self.lab.read_bytes()
        with self.assertRaises(FileNotFoundError):
            module.combine_sitemaps(self.site)
        self.assertEqual(before, self.lab.read_bytes())

    def test_invalid_map_fails_before_writing(self):
        before = self.lab.read_bytes()
        for xml in [f'<sitemapindex xmlns="{NS}"/>', f'<urlset xmlns="{NS}"><url/></urlset>']:
            self.lessons.write_text(xml)
            with self.assertRaises(ValueError):
                module.combine_sitemaps(self.site)
            self.assertEqual(before, self.lab.read_bytes())
