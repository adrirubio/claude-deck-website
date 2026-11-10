#!/usr/bin/env python3
"""Check the built website output in dist/.

For every built HTML page this verifies:
- every local href/src target exists in the built output,
- no external request URLs are present (fonts and assets are self-hosted),
- the page carries the preview noindex robots directive.

Usage: python3 scripts/check-pages.py [dist-dir]
Exit code 1 lists every problem found.
"""

import html.parser
import pathlib
import sys
import urllib.parse


class Page(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
        self.robots_noindex = False

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        for name in ("href", "src"):
            value = attributes.get(name)
            if value:
                # Resource loads (link, script, img) must be self-hosted.
                # Plain <a> navigation links may point off-site.
                self.refs.append((tag, value))
        if tag == "meta" and attributes.get("name") == "robots":
            content = attributes.get("content", "")
            if "noindex" in content:
                self.robots_noindex = True


def main():
    dist = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "dist").resolve()
    if not dist.is_dir():
        print(f"ERROR built output directory not found: {dist}")
        return 1

    # The three website pages only. dist/docs/ is the generated VitePress
    # tree, carried through unchanged; it is not part of this check.
    pages = sorted(
        page for page in dist.rglob("*.html") if "docs" not in page.relative_to(dist).parts
    )
    if not pages:
        print(f"ERROR no built HTML pages under {dist}")
        return 1

    errors = []
    for page in pages:
        relative = page.relative_to(dist)
        parser = Page()
        parser.feed(page.read_text(encoding="utf-8"))

        if not parser.robots_noindex:
            errors.append(f"{relative}: missing noindex robots meta")

        for tag, ref in parser.refs:
            if ref.startswith("#"):
                continue
            parts = urllib.parse.urlsplit(ref)
            if parts.scheme or parts.netloc:
                if tag in ("link", "script", "img"):
                    errors.append(f"{relative}: external request URL: {ref}")
                continue
            if parts.scheme in ("mailto", "tel", "data"):
                continue
            path = urllib.parse.unquote(parts.path)
            if not path:
                continue
            target = dist / path.lstrip("/")
            if path.endswith("/"):
                target = target / "index.html"
            elif not target.suffix:
                # Clean routes are served as <route>/index.html.
                if not target.exists():
                    target = target / "index.html"
            if not target.exists():
                errors.append(f"{relative}: missing local target: {ref}")

    for message in sorted(set(errors)):
        print("ERROR", message)
    if errors:
        return 1
    print(f"check-pages: OK ({len(pages)} built pages checked)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
