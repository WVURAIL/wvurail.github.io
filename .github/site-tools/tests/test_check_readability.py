import hashlib
import importlib.util
from pathlib import Path
import tempfile
import unittest

from bs4 import BeautifulSoup

spec = importlib.util.spec_from_file_location(
    "check_readability", Path(__file__).resolve().parents[1] / "scripts/check_readability.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
check_site = module.check_site
sentences = module.sentences
text_blocks = module.text_blocks
word_count = module.word_count


class ReadabilityTests(unittest.TestCase):
    def test_sentence_endings_and_abbreviations(self):
        text = 'Dr. Smith measured 10 K. Code follows. (This is separate.) Another sentence.'
        self.assertEqual(len(list(sentences(text))), 4)

    def test_hyphenated_words_count_conservatively(self):
        self.assertEqual(word_count("A low-noise amplifier isn't optional."), 6)

    def test_nested_lists_do_not_duplicate_paragraphs(self):
        soup = BeautifulSoup('<li><p>First paragraph.</p><ul><li>Second item.</li></ul></li>', 'html.parser')
        self.assertEqual(list(text_blocks(soup)), ['First paragraph.', 'Second item.'])

    def test_code_and_equations_are_not_prose(self):
        soup = BeautifulSoup(r'<p>Use <code>a very long identifier</code> with \(a + b + c\).</p><pre>sample code</pre>', 'html.parser')
        self.assertEqual(list(text_blocks(soup)), ['Use code with equation.'])

    def test_limit_and_exact_exception(self):
        long = ' '.join(['word'] * 21) + '.'
        short = ' '.join(['word'] * 20) + '.'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            page = root / 'index.html'
            page.write_text(f'<p>{short}</p><p>{long}</p>', encoding='utf-8')
            self.assertEqual(len(check_site(root, {})[2]), 1)
            digest = hashlib.sha256(long.encode()).hexdigest()
            exceptions = {digest: {'pages': ['index.html']}}
            self.assertFalse(check_site(root, exceptions)[2])
            page.write_text(f'<p>{long} Changed.</p>', encoding='utf-8')
            self.assertEqual(len(check_site(root, exceptions)[2]), 1)

    def test_exceptions_do_not_apply_to_other_pages(self):
        text = ' '.join(['word'] * 21) + '.'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'new.html').write_text(f'<p>{text}</p>', encoding='utf-8')
            digest = hashlib.sha256(text.encode()).hexdigest()
            self.assertEqual(len(check_site(root, {digest: {'pages': ['old.html']}})[2]), 1)

    def test_empty_build_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(ValueError):
                check_site(Path(directory), {})


if __name__ == '__main__':
    unittest.main()
