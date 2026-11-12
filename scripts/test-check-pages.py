#!/usr/bin/env python3
"""Negative and positive checks for scripts/check-pages.py.

Builds a small fixture output in a temporary directory and proves:
- a complete fixture passes,
- deleting a font referenced from CSS url() fails,
- replacing that CSS url() with an external URL fails.

Run after `npm run build` is not required; the fixture is self-contained.
Exit code 1 if any expectation does not hold.
"""

import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
CHECKER = ROOT / "scripts" / "check-pages.py"

HTML = """<!doctype html>
<html><head>
<link rel="stylesheet" href="/assets/style.css">
</head><body><a href="/docs/guide/installation">installation guide</a></body></html>
"""

CSS = "@font-face { font-family: 'Fixture'; src: url('/fonts/fixture.woff2') format('woff2'); }\n"


def run_checker(dist):
    result = subprocess.run(
        [sys.executable, str(CHECKER), str(dist)],
        capture_output=True,
        text=True,
    )
    return result.returncode, result.stdout + result.stderr


def build_fixture(base):
    dist = base / "dist"
    (dist / "assets").mkdir(parents=True)
    (dist / "fonts").mkdir()
    (dist / "index.html").write_text(HTML, encoding="utf-8")
    (dist / "assets" / "style.css").write_text(CSS, encoding="utf-8")
    (dist / "fonts" / "fixture.woff2").write_bytes(b"fixture")
    (dist / "fonts" / "LICENSE-OFL.txt").write_text(
        "SIL Open Font License fixture\n", encoding="utf-8"
    )
    (dist / "docs" / "guide").mkdir(parents=True)
    (dist / "docs" / "guide" / "installation.html").write_text(
        "<html>guide</html>\n", encoding="utf-8"
    )
    return dist


def main():
    failures = []
    with tempfile.TemporaryDirectory() as tmp:
        base = pathlib.Path(tmp)

        dist = build_fixture(base / "ok")
        code, out = run_checker(dist)
        if code != 0:
            failures.append(f"complete fixture must pass, got exit {code}: {out}")

        dist = build_fixture(base / "missing-font")
        (dist / "fonts" / "fixture.woff2").unlink()
        code, out = run_checker(dist)
        if code == 0:
            failures.append("deleted CSS-referenced font must fail, got success")

        dist = build_fixture(base / "missing-licence")
        (dist / "fonts" / "LICENSE-OFL.txt").unlink()
        code, out = run_checker(dist)
        if code == 0:
            failures.append("deleted font licence file must fail, got success")

        dist = build_fixture(base / "missing-docs-target")
        (dist / "docs" / "guide" / "installation.html").unlink()
        code, out = run_checker(dist)
        if code == 0:
            failures.append("deleted docs .html target must fail, got success")

        dist = build_fixture(base / "noindex")
        (dist / "index.html").write_text(
            HTML.replace("<head>", '<head>\n<meta name="robots" content="noindex, nofollow">'),
            encoding="utf-8",
        )
        code, out = run_checker(dist)
        if code == 0:
            failures.append("a production page with noindex must fail, got success")

        dist = build_fixture(base / "external-font")
        (dist / "assets" / "style.css").write_text(
            CSS.replace("/fonts/fixture.woff2", "https://example.com/fixture.woff2"),
            encoding="utf-8",
        )
        code, out = run_checker(dist)
        if code == 0:
            failures.append("external CSS url() must fail, got success")

    for failure in failures:
        print("FAIL", failure)
    if failures:
        return 1
    print("test-check-pages: OK (pass, missing-font, missing-licence, noindex, external-url failures)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
