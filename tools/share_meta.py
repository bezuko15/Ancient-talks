#!/usr/bin/env python3
"""Write Open Graph and Twitter card tags into every HTML page.

Run from the repository root after adding a page:

    python3 tools/share_meta.py

Book pages use the book title plus the author. The Icons page uses
img/og-icons.jpg. Every other page uses img/og-image.jpg. Both images
are 1200 by 630. URLs are absolute https://ancienttalks.com addresses.
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://ancienttalks.com"
DEFAULT_IMAGE = SITE + "/img/og-image.jpg"
ICONS_IMAGE = SITE + "/img/og-icons.jpg"
DEFAULT_ALT = "Ancient Talk: The Church Fathers, read aloud"
ICONS_ALT = "Icons of the saints on Ancient Talk"

META_RE = re.compile(
    r"<!--share-->.*?<!--/share-->|"
    r"<meta\s+(?:property|name)=\"(?:og:[^\"]+|twitter:[^\"]+)\"[^>]*>",
    re.S,
)


def esc(value):
    return html.escape(value, quote=True)


def load_authors():
    text = (ROOT / "js" / "books.js").read_text(encoding="utf-8")
    authors = {}
    for block in re.findall(r"\{[^{}]*\}", text):
        read = re.search(r'"read":\s*"([^"]+)"', block)
        author = re.search(r'"author":\s*"([^"]+)"', block)
        if read and author:
            authors[read.group(1)] = author.group(1)
    return authors


AUTHORS = load_authors()


def page_url(path):
    rel = path.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return SITE + "/"
    return SITE + "/" + rel


def author_for(path, text):
    rel = path.relative_to(ROOT).as_posix()
    if not rel.startswith("books/"):
        return ""
    ld = re.search(r'"author":\{"@type":"Person","name":"([^"]+)"', text)
    if ld:
        return html.unescape(ld.group(1))
    by = re.search(r'<span class="by">([^<]+)</span>', text)
    if by:
        return html.unescape(by.group(1)).strip()
    base = re.sub(r"-\d+$", "", path.stem)
    return AUTHORS.get("books/" + base + ".html", "") or AUTHORS.get(rel, "")


def share_block(title, description, url, image, alt, kind):
    return (
        "<!--share-->"
        f'<meta property="og:type" content="{kind}">'
        '<meta property="og:site_name" content="Ancient Talk">'
        f'<meta property="og:title" content="{esc(title)}">'
        f'<meta property="og:description" content="{esc(description)}">'
        f'<meta property="og:url" content="{esc(url)}">'
        f'<meta property="og:image" content="{esc(image)}">'
        '<meta property="og:image:width" content="1200">'
        '<meta property="og:image:height" content="630">'
        f'<meta property="og:image:alt" content="{esc(alt)}">'
        '<meta name="twitter:card" content="summary_large_image">'
        f'<meta name="twitter:title" content="{esc(title)}">'
        f'<meta name="twitter:description" content="{esc(description)}">'
        f'<meta name="twitter:image" content="{esc(image)}">'
        "<!--/share-->"
    )


def update(path):
    text = path.read_text(encoding="utf-8")
    title_m = re.search(r"<title>(.*?)</title>", text, re.S)
    desc_m = re.search(r'<meta name="description" content="([^"]*)"', text)
    if not title_m:
        return False
    raw_title = html.unescape(re.sub(r"\s+", " ", title_m.group(1))).strip()
    short = re.sub(r"\s*·\s*Ancient Talk$", "", raw_title).strip()
    description = html.unescape(desc_m.group(1)).strip() if desc_m else short
    author = author_for(path, text)
    if author and author.lower() not in short.lower():
        short = short + " — " + author
    if author and author.lower() not in description.lower():
        description = author + ". " + description
    canon = re.search(r'<link rel="canonical" href="([^"]+)"', text)
    url = canon.group(1) if canon and canon.group(1).startswith(SITE) else page_url(path)
    rel = path.relative_to(ROOT).as_posix()
    if rel == "icons.html":
        image, alt = ICONS_IMAGE, ICONS_ALT
    else:
        image, alt = DEFAULT_IMAGE, DEFAULT_ALT
    kind = "article" if rel.startswith("books/") else "website"
    block = share_block(short, description, url, image, alt, kind)
    cleaned = META_RE.sub("", text)
    if canon:
        cleaned = cleaned.replace(canon.group(0), canon.group(0) + block, 1)
    else:
        cleaned = cleaned.replace(title_m.group(0), title_m.group(0) + block, 1)
    if cleaned != text:
        path.write_text(cleaned, encoding="utf-8")
    return True


def main():
    pages = [p for p in ROOT.rglob("*.html") if "node_modules" not in p.parts]
    n = 0
    for path in pages:
        if update(path):
            n += 1
    print("updated", n, "of", len(pages))


if __name__ == "__main__":
    main()
