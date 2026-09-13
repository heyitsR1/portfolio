#!/usr/bin/env python3
"""
r1 — static build for the blog and the album.

    python3 desk/build.py

Reads   blog/posts/*.md          (markdown with a small frontmatter block)
        assets/album/album.json  (list of photos + captions)
Writes  blog/<slug>.html, blog.html, album.html

No dependencies. The markdown renderer is small on purpose: headings,
paragraphs, bold, italic, code, fenced code, quotes, lists, links, images, rules.
"""
import html, json, os, re, sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "blog", "posts")
ALBUM_JSON = os.path.join(ROOT, "assets", "album", "album.json")


# ---------------------------------------------------------------- frontmatter
def parse_post(path):
    raw = open(path, encoding="utf-8").read()
    meta = {"title": "", "date": "", "tags": [], "draft": False, "summary": ""}
    body = raw
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?", raw, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ":" not in line:
                continue
            k, v = line.split(":", 1)
            k, v = k.strip().lower(), v.strip()
            if k == "tags":
                meta["tags"] = [t.strip() for t in v.split(",") if t.strip()]
            elif k == "draft":
                meta["draft"] = v.lower() in ("true", "yes", "1")
            else:
                meta[k] = v
        body = raw[m.end():]
    slug = os.path.splitext(os.path.basename(path))[0]
    if not meta["title"]:
        meta["title"] = slug.replace("-", " ")
    if not meta["date"]:
        meta["date"] = date.today().isoformat()
    if not meta["summary"]:
        # first non-heading paragraph, trimmed
        for para in re.split(r"\n\s*\n", body.strip()):
            p = para.strip()
            if p and not p.startswith(("#", ">", "```", "-", "*", "!")):
                meta["summary"] = re.sub(r"[*_`\[\]]", "", p)[:110]
                break
    return {"slug": slug, "body": body, **meta}


def load_posts():
    posts = []
    if os.path.isdir(POSTS):
        for f in sorted(os.listdir(POSTS)):
            if f.endswith(".md"):
                posts.append(parse_post(os.path.join(POSTS, f)))
    posts.sort(key=lambda p: p["date"], reverse=True)
    return posts


def write_post(slug, title, date_, tags, draft, body):
    tags = ", ".join(tags) if isinstance(tags, (list, tuple)) else tags
    fm = f"---\ntitle: {title}\ndate: {date_}\ntags: {tags}\ndraft: {'true' if draft else 'false'}\n---\n\n"
    os.makedirs(POSTS, exist_ok=True)
    with open(os.path.join(POSTS, slug + ".md"), "w", encoding="utf-8") as fh:
        fh.write(fm + body.rstrip() + "\n")


def slugify(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or "untitled"


# ------------------------------------------------------------------ markdown
def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", r'<img src="\2" alt="\1" loading="lazy">', s)
    s = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", r'<a href="\2">\1</a>', s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![*\w])\*([^*\n]+)\*(?!\w)", r"<em>\1</em>", s)
    s = re.sub(r"(?<![_\w])_([^_\n]+)_(?!\w)", r"<em>\1</em>", s)
    s = re.sub(r"~~([^~]+)~~", r"<s>\1</s>", s)
    s = s.replace(" -- ", " — ")
    return s


def render_md(text):
    out, lines, i = [], text.replace("\r\n", "\n").split("\n"), 0
    para = []

    def flush():
        if para:
            out.append("<p>" + inline(" ".join(para).strip()) + "</p>")
            para.clear()

    while i < len(lines):
        ln = lines[i]
        st = ln.strip()

        if st.startswith("```"):
            flush()
            lang = st[3:].strip()
            buf = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                buf.append(lines[i]); i += 1
            cls = f' class="lang-{html.escape(lang)}"' if lang else ""
            out.append(f"<pre><code{cls}>{html.escape(chr(10).join(buf))}</code></pre>")
            i += 1
            continue

        if not st:
            flush(); i += 1; continue

        if re.match(r"^(-{3,}|\*{3,})$", st):
            flush(); out.append("<hr>"); i += 1; continue

        m = re.match(r"^(#{1,4})\s+(.*)$", st)
        if m:
            flush()
            lvl = len(m.group(1)) + 1  # h1 is the post title; '#' in body becomes h2
            out.append(f"<h{lvl}>{inline(m.group(2))}</h{lvl}>")
            i += 1; continue

        if st.startswith(">"):
            flush()
            buf = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                buf.append(lines[i].strip()[1:].strip()); i += 1
            out.append("<blockquote>" + render_md("\n".join(buf)) + "</blockquote>")
            continue

        if re.match(r"^[-*]\s+", st):
            flush()
            items = []
            while i < len(lines) and re.match(r"^[-*]\s+", lines[i].strip()):
                items.append(inline(re.sub(r"^[-*]\s+", "", lines[i].strip()))); i += 1
            out.append("<ul>" + "".join(f"<li>{x}</li>" for x in items) + "</ul>")
            continue

        if re.match(r"^\d+[.)]\s+", st):
            flush()
            items = []
            while i < len(lines) and re.match(r"^\d+[.)]\s+", lines[i].strip()):
                items.append(inline(re.sub(r"^\d+[.)]\s+", "", lines[i].strip()))); i += 1
            out.append("<ol>" + "".join(f"<li>{x}</li>" for x in items) + "</ol>")
            continue

        para.append(st); i += 1

    flush()
    return "\n".join(out)


# ------------------------------------------------------------------ templates
def nav(active, up=""):
    def a(href, title, g):
        cls = "nav-greek active" if active == title else "nav-greek"
        return f'      <a href="{up}{href}" class="{cls}" title="{title}">{g}</a>'
    return f'''  <nav class="navbar">
    <div class="nav-left">
      <a href="{up}index.html" class="nav-home-link" aria-label="r1, home">
        <span class="phi">φ</span>
        <span class="r1">r1</span>
      </a>
    </div>
    <div class="nav-right">
{a("index.html","home","α")}
{a("projects.html","projects","π")}
{a("blog.html","writing","β")}
{a("album.html","album","γ")}
    </div>
  </nav>'''


def page(title, desc, active, body, up="", extra_foot=""):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(desc, quote=True)}">
  <link rel="stylesheet" href="{up}css/1-base.css">
  <link rel="stylesheet" href="{up}css/2-layout.css">
  <link rel="stylesheet" href="{up}css/3-animations.css">
  <link rel="stylesheet" href="{up}css/4-components.css">
  <link rel="stylesheet" href="{up}css/5-responsive.css">
  <link rel="icon" type="image/png" href="{up}assets/favicon_3.png">
</head>

<body id="top">
  <div class="grain" aria-hidden="true"></div>

{nav(active, up)}

  <main>
{body}
  </main>

  <footer class="foot">
    <div class="wrap">
      <span>φ r1 · Aarohan Niraula · Kathmandu</span>
      <span>{extra_foot}<a href="#top">top ↑</a></span>
    </div>
  </footer>

  <script src="{up}js/fireflies.js"></script>
  <script src="{up}js/script.js"></script>
</body>
</html>
'''


def post_html(p):
    tags = "".join(f'<span class="blog-tag">{html.escape(t)}</span>' for t in p["tags"])
    body = f'''    <article class="blog-post-page">
      <div class="blog-post-container">
        <div class="blog-post-nav"><a href="../blog.html" class="back-to-blog">← writing</a></div>
        <div class="blog-post-full">
          <header class="blog-post-header">
            <h1>{inline(p["title"])}</h1>
            <div class="blog-meta"><span class="blog-date">{html.escape(p["date"])}</span><span class="blog-tags">{tags}</span></div>
          </header>
          <div class="blog-post-content">
{render_md(p["body"])}
          </div>
        </div>
      </div>
    </article>'''
    return page(f'{p["title"]} · r1', p["summary"] or p["title"], "writing", body, up="../",
                extra_foot='<a href="../blog.html">writing</a> · ')


def blog_index_html(posts):
    rows = []
    for p in posts:
        if p["draft"]:
            continue
        rows.append(f'''        <li>
          <a class="row reveal" href="blog/{p["slug"]}.html">
            <span class="name">{inline(p["title"])}</span>
            <span class="desc">{inline(p["summary"])}</span>
            <span class="meta">{html.escape(p["date"])}</span>
          </a>
        </li>''')
    body = f'''    <header class="page-head">
      <div class="wrap">
        <h1><span class="g">β</span>writing</h1>
        <p>Notes, half-thoughts, and the occasional lesson. Mostly unfinished, like me.</p>
      </div>
    </header>

    <section class="wrap" style="padding-bottom: 5rem;">
      <ul class="list">
{chr(10).join(rows) if rows else '        <li class="row reveal"><span class="name">nothing yet</span><span class="desc">soon.</span></li>'}
      </ul>

      <div class="after reveal">
        more soon, probably &nbsp;·&nbsp;
        <a href="https://www.youtube.com/@dev.aarohan" target="_blank" rel="noopener">build logs on youtube ↗</a>
      </div>
    </section>'''
    return page("writing · r1", "Notes and half-thoughts by Aarohan (r1).", "writing", body,
                extra_foot='<a href="index.html">home</a> · ')


def load_album():
    if not os.path.exists(ALBUM_JSON):
        return []
    try:
        return json.load(open(ALBUM_JSON, encoding="utf-8"))
    except Exception:
        return []


def save_album(items):
    os.makedirs(os.path.dirname(ALBUM_JSON), exist_ok=True)
    json.dump(items, open(ALBUM_JSON, "w", encoding="utf-8"), indent=2, ensure_ascii=False)


def album_html(items):
    figs = []
    for it in items:
        cap = html.escape(it.get("caption", ""))
        when = html.escape(it.get("date", ""))
        figs.append(f'''        <figure class="reveal">
          <img src="assets/album/{html.escape(it["file"])}" alt="{cap}" loading="lazy">
          <figcaption><span>{cap}</span><span>{when}</span></figcaption>
        </figure>''')
    grid = f'''      <div class="album">
{chr(10).join(figs)}
      </div>''' if figs else '''      <p class="album-empty reveal">Nothing here yet. Photos go in <span class="mono">assets/album</span>, captions in <span class="mono">album.json</span>, or use the desk.</p>'''
    body = f'''    <header class="page-head">
      <div class="wrap-wide">
        <h1><span class="g">γ</span>album</h1>
        <p>Days off the keyboard. Mostly Nepal, mostly outside, occasionally tea.</p>
      </div>
    </header>

    <section class="wrap-wide">
{grid}
    </section>'''
    return page("album · r1", "Photos from Aarohan's days off the keyboard.", "album", body,
                extra_foot='<a href="index.html">home</a> · ')


# ---------------------------------------------------------------------- build
def build():
    posts = load_posts()
    built = []
    for p in posts:
        if p["draft"]:
            continue
        out = os.path.join(ROOT, "blog", p["slug"] + ".html")
        open(out, "w", encoding="utf-8").write(post_html(p))
        built.append(p["slug"])
    open(os.path.join(ROOT, "blog.html"), "w", encoding="utf-8").write(blog_index_html(posts))
    open(os.path.join(ROOT, "album.html"), "w", encoding="utf-8").write(album_html(load_album()))
    return built


if __name__ == "__main__":
    b = build()
    print(f"built {len(b)} post(s): {', '.join(b) or '-'}; blog.html; album.html")
