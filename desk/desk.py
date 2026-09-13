#!/usr/bin/env python3
"""
r1 — the desk. a small local place to write and publish.

    python3 desk/desk.py          # opens http://127.0.0.1:8484

Writes markdown into blog/posts/, photos into assets/album/, and rebuilds the
static pages on every save. "push" commits and pushes with git so the live
site updates. Local only; never deploy this.
"""
import json, os, subprocess, sys, urllib.parse, webbrowser, mimetypes, re
from datetime import date
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build  # noqa: E402

ROOT = build.ROOT
PORT = int(os.environ.get("DESK_PORT", "8484"))

UI = r'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>desk · r1</title>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--bg:#000;--ink:#ebe8e0;--ink-2:#9a968c;--ink-3:#5c5951;--line:rgba(255,255,255,.1);--sun:#F4DD17;--serif:'Newsreader',Georgia,serif;--mono:'IBM Plex Mono',ui-monospace,Menlo,monospace}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{background:var(--bg);color:var(--ink);font-family:var(--serif);font-size:1.05rem;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
button,input,textarea,select{font:inherit;color:inherit;background:none;border:none;outline:none}
.app{display:grid;grid-template-columns:16rem 1fr;min-height:100vh}
.side{border-right:1px solid var(--line);padding:1.4rem 1.2rem;display:flex;flex-direction:column;gap:1.2rem;position:sticky;top:0;height:100vh;overflow:auto}
.brand{font-family:var(--mono);font-size:.85rem;display:flex;align-items:baseline;gap:.35rem}
.brand .phi{color:var(--sun);font-family:var(--serif);font-style:italic;font-size:1.25rem}
.brand small{color:var(--ink-3);margin-left:.4rem}
.tabs{display:flex;gap:1rem;font-family:var(--mono);font-size:.78rem;color:var(--ink-3)}
.tabs b{font-weight:400;cursor:pointer;padding-bottom:.2rem;border-bottom:1px solid transparent}
.tabs b.on{color:var(--sun);border-color:var(--sun)}
.new{font-family:var(--mono);font-size:.78rem;color:var(--ink-2);cursor:pointer;padding:.5rem 0;border-bottom:1px solid var(--line)}
.new:hover{color:var(--sun)}
.list{list-style:none;display:flex;flex-direction:column}
.list li{padding:.6rem 0;border-bottom:1px solid var(--line);cursor:pointer;display:flex;flex-direction:column;gap:.1rem}
.list li .t{font-size:1rem;color:var(--ink-2)}
.list li.on .t{color:#fff}
.list li .d{font-family:var(--mono);font-size:.68rem;color:var(--ink-3)}
.list li.draft .d::after{content:' · draft';color:var(--sun)}
.main{padding:2.2rem clamp(1.4rem,5vw,4rem) 6rem;max-width:64rem}
.row{display:flex;gap:1.5rem;align-items:baseline;flex-wrap:wrap}
label{font-family:var(--mono);font-size:.7rem;letter-spacing:.06em;color:var(--ink-3);display:block;margin-bottom:.25rem}
.f{display:flex;flex-direction:column}
input[type=text],input[type=date]{border-bottom:1px solid var(--line);padding:.35rem 0;color:var(--ink);min-width:12rem}
input:focus{border-color:var(--sun)}
#title{font-size:2rem;font-weight:400;line-height:1.15;width:100%;color:#fff;border-bottom:1px solid var(--line);padding:.3rem 0;margin:.4rem 0 1.4rem}
.editor{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-top:1.6rem}
.editor.solo{grid-template-columns:1fr}
textarea{width:100%;min-height:60vh;resize:vertical;font-family:var(--mono);font-size:.9rem;line-height:1.7;color:var(--ink);border:1px solid var(--line);padding:1rem;background:#050505;caret-color:var(--sun)}
textarea:focus{border-color:rgba(244,221,23,.5)}
.preview{border:1px solid var(--line);padding:1rem 1.3rem;min-height:60vh;overflow:auto;font-weight:300;color:var(--ink-2)}
.preview h2{font-family:var(--serif);font-weight:400;font-size:1.5rem;margin:1.6rem 0 .5rem;color:var(--ink)}
.preview h3{font-family:var(--mono);font-weight:400;font-size:.8rem;letter-spacing:.05em;color:rgba(244,221,23,.55);margin:1.4rem 0 .4rem}
.preview p{margin-bottom:1rem}.preview a{text-decoration:underline;text-underline-offset:.2em}
.preview code{font-family:var(--mono);font-size:.85em;color:var(--ink)}
.preview pre{background:#0a0a0a;border:1px solid var(--line);padding:.8rem 1rem;overflow:auto;margin-bottom:1rem}
.preview blockquote{border-left:1px solid var(--sun);padding-left:1rem;color:var(--ink-3);margin-bottom:1rem}
.preview ul,.preview ol{margin:0 0 1rem 1.3rem}
.preview hr{border:0;border-top:1px solid var(--line);margin:1.5rem 0}
.preview img{max-width:100%}
.bar{display:flex;gap:1.6rem;align-items:center;flex-wrap:wrap;margin-top:1.2rem;font-family:var(--mono);font-size:.78rem}
.btn{color:var(--ink);padding:.45rem 0;border-bottom:1px solid var(--ink-3);cursor:pointer}
.btn:hover{color:var(--sun);border-color:var(--sun)}
.btn.sun{border-color:var(--sun)}
.btn.warn{color:var(--ink-3)}.btn.warn:hover{color:#ff8a80;border-color:#ff8a80}
.status{color:var(--ink-3)}
.status.ok{color:var(--sun)}
.toggle{display:flex;gap:.5rem;align-items:center;cursor:pointer;color:var(--ink-2)}
.toggle input{accent-color:var(--sun)}
.hint{font-family:var(--mono);font-size:.72rem;color:var(--ink-3);margin-top:1rem;line-height:1.8}
.album{display:grid;grid-template-columns:repeat(auto-fill,minmax(11rem,1fr));gap:1.2rem;margin-top:1.6rem}
.album figure{display:flex;flex-direction:column;gap:.4rem}
.album img{width:100%;aspect-ratio:1;object-fit:cover;border:1px solid var(--line);filter:saturate(.85)}
.album figcaption{font-family:var(--mono);font-size:.68rem;color:var(--ink-3);display:flex;justify-content:space-between;gap:.5rem}
.album figcaption b{font-weight:400;color:var(--ink-2)}
.album .x{cursor:pointer;color:var(--ink-3)}.album .x:hover{color:#ff8a80}
.drop{border:1px dashed var(--line);padding:1.4rem;margin-top:1.4rem;display:flex;gap:1.5rem;align-items:flex-end;flex-wrap:wrap;font-family:var(--mono);font-size:.78rem}
.drop input[type=file]{color:var(--ink-3);font-size:.75rem}
pre.log{font-family:var(--mono);font-size:.72rem;color:var(--ink-3);white-space:pre-wrap;margin-top:1rem;max-height:14rem;overflow:auto}
[hidden]{display:none!important}
@media(max-width:820px){.app{grid-template-columns:1fr}.side{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}.editor{grid-template-columns:1fr}}
</style></head>
<body>
<div class="app">
  <aside class="side">
    <div class="brand"><span class="phi">φ</span><span>r1</span><small>the desk</small></div>
    <div class="tabs"><b class="on" data-tab="write">writing</b><b data-tab="album">album</b></div>
    <div id="writePane">
      <div class="new" id="newPost">+ new note</div>
      <ul class="list" id="posts"></ul>
    </div>
    <div id="albumPane" hidden>
      <div class="hint">photos land in assets/album. captions and dates in album.json. the page rebuilds on every change.</div>
    </div>
    <div class="hint" style="margin-top:auto">⌘S save · ⌘⏎ publish<br>local only, port ''' + str(PORT) + r'''</div>
  </aside>

  <main class="main">
    <section id="write">
      <input id="title" type="text" placeholder="a title, or don't">
      <div class="row">
        <div class="f"><label for="date">date</label><input id="date" type="date"></div>
        <div class="f"><label for="tags">tags, comma separated</label><input id="tags" type="text" placeholder="reflection, ai"></div>
        <div class="f"><label for="slug">slug</label><input id="slug" type="text" placeholder="auto from title"></div>
        <label class="toggle" style="margin-top:1rem"><input id="draft" type="checkbox"> draft (kept out of the site)</label>
        <label class="toggle" style="margin-top:1rem"><input id="showPrev" type="checkbox" checked> preview</label>
      </div>
      <div class="editor" id="editor">
        <textarea id="body" placeholder="write. markdown works: # heading, **bold**, *italic*, `code`, > quote, - list, [link](url), ![alt](image)"></textarea>
        <div class="preview" id="preview"></div>
      </div>
      <div class="bar">
        <span class="btn" id="save">save</span>
        <span class="btn sun" id="publish">publish →</span>
        <span class="btn" id="open" hidden>open on site ↗</span>
        <span class="btn warn" id="del" hidden>delete</span>
        <span class="status" id="status"></span>
        <span style="flex:1"></span>
        <span class="status" id="words"></span>
        <span class="btn" id="push">push to github ↑</span>
      </div>
      <pre class="log" id="log" hidden></pre>
    </section>

    <section id="album" hidden>
      <div class="drop">
        <div class="f"><label>photo</label><input id="file" type="file" accept="image/*"></div>
        <div class="f"><label for="cap">caption</label><input id="cap" type="text" placeholder="where, what, who"></div>
        <div class="f"><label for="when">when</label><input id="when" type="text" placeholder="2026, or a season"></div>
        <span class="btn sun" id="add">add →</span>
        <span class="status" id="astatus"></span>
      </div>
      <div class="album" id="grid"></div>
      <div class="bar"><span class="btn" id="push2">push to github ↑</span><span class="status" id="pstatus"></span></div>
      <pre class="log" id="log2" hidden></pre>
    </section>
  </main>
</div>
<script>
const $=s=>document.querySelector(s);
const api=(p,o)=>fetch('/api/'+p,o).then(r=>r.json());
let cur=null, dirty=false, tmr=null;

function slugify(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'untitled'}
function setStatus(t,ok){const s=$('#status');s.textContent=t;s.className='status'+(ok?' ok':'');}
function words(){const n=($('#body').value.trim().match(/\S+/g)||[]).length;$('#words').textContent=n?n+' words':''}

async function listPosts(){
  const ps=await api('posts');
  const ul=$('#posts');ul.innerHTML='';
  ps.forEach(p=>{const li=document.createElement('li');li.className=(p.draft?'draft':'')+(cur===p.slug?' on':'');
    li.innerHTML=`<span class="t">${p.title}</span><span class="d">${p.date}</span>`;
    li.onclick=()=>load(p.slug);ul.appendChild(li);});
}
async function load(slug){
  const p=await api('post?slug='+encodeURIComponent(slug));
  cur=slug;$('#title').value=p.title;$('#date').value=p.date;$('#tags').value=p.tags.join(', ');
  $('#slug').value=p.slug;$('#draft').checked=p.draft;$('#body').value=p.body.trim();
  $('#open').hidden=p.draft;$('#del').hidden=false;dirty=false;setStatus('');words();preview();listPosts();
}
function fresh(){
  cur=null;$('#title').value='';$('#date').value=new Date().toISOString().slice(0,10);$('#tags').value='';
  $('#slug').value='';$('#draft').checked=true;$('#body').value='';$('#open').hidden=true;$('#del').hidden=true;
  dirty=false;setStatus('');words();preview();listPosts();$('#title').focus();
}
function payload(){
  const slug=$('#slug').value.trim()||slugify($('#title').value||'untitled');
  return {slug,prev:cur,title:$('#title').value.trim()||slug,date:$('#date').value,tags:$('#tags').value,draft:$('#draft').checked,body:$('#body').value};
}
async function save(publish){
  const p=payload(); if(publish){p.draft=false;$('#draft').checked=false;}
  setStatus('saving…');
  const r=await api('save',{method:'POST',body:JSON.stringify(p)});
  if(r.ok){cur=r.slug;$('#slug').value=r.slug;dirty=false;$('#open').hidden=p.draft;$('#del').hidden=false;
    setStatus(publish?'published. now push ↑':'saved',true);listPosts();}
  else setStatus('error: '+r.error);
}
async function preview(){
  const t=$('#body').value; if(!$('#showPrev').checked)return;
  const r=await api('preview',{method:'POST',body:JSON.stringify({body:t})});$('#preview').innerHTML=r.html;
}
async function push(logEl,statEl){
  statEl.textContent='pushing…';logEl.hidden=false;logEl.textContent='';
  const r=await api('push',{method:'POST'});logEl.textContent=r.log;statEl.textContent=r.ok?'pushed':'push failed, see log';
  statEl.className='status'+(r.ok?' ok':'');
}
async function grid(){
  const items=await api('album');const g=$('#grid');g.innerHTML='';
  items.forEach((it,i)=>{const f=document.createElement('figure');
    f.innerHTML=`<img src="/assets/album/${it.file}"><figcaption><b>${it.caption||''}</b><span>${it.date||''} <span class="x" title="remove">×</span></span></figcaption>`;
    f.querySelector('.x').onclick=async()=>{if(!confirm('remove '+it.file+' from the album?'))return;await api('album/remove',{method:'POST',body:JSON.stringify({i})});grid();};
    g.appendChild(f);});
}
$('#body').addEventListener('input',()=>{dirty=true;words();clearTimeout(tmr);tmr=setTimeout(preview,350);setStatus('unsaved');});
$('#title').addEventListener('input',()=>{dirty=true;if(!cur)$('#slug').placeholder=slugify($('#title').value)||'auto from title';setStatus('unsaved');});
$('#showPrev').addEventListener('change',e=>{$('#editor').classList.toggle('solo',!e.target.checked);$('#preview').hidden=!e.target.checked;if(e.target.checked)preview();});
$('#save').onclick=()=>save(false);$('#publish').onclick=()=>save(true);$('#newPost').onclick=fresh;
$('#open').onclick=()=>window.open('/blog/'+cur+'.html','_blank');
$('#del').onclick=async()=>{if(!cur||!confirm('delete this note? it removes the markdown and the page.'))return;await api('delete',{method:'POST',body:JSON.stringify({slug:cur})});fresh();};
$('#push').onclick=()=>push($('#log'),$('#status'));$('#push2').onclick=()=>push($('#log2'),$('#pstatus'));
$('#add').onclick=async()=>{const f=$('#file').files[0];if(!f){$('#astatus').textContent='pick a photo first';return;}
  const fd=new FormData();fd.append('file',f);fd.append('caption',$('#cap').value);fd.append('date',$('#when').value);
  $('#astatus').textContent='adding…';const r=await fetch('/api/album/add',{method:'POST',body:fd}).then(r=>r.json());
  $('#astatus').textContent=r.ok?'added':'error: '+r.error;if(r.ok){$('#file').value='';$('#cap').value='';$('#when').value='';grid();}};
document.querySelectorAll('.tabs b').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs b').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  const t=b.dataset.tab;$('#write').hidden=t!=='write';$('#album').hidden=t!=='album';$('#writePane').hidden=t!=='write';$('#albumPane').hidden=t!=='album';if(t==='album')grid();});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='s'){e.preventDefault();save(false);}if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();save(true);}});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
(async()=>{await listPosts();const ps=await api('posts');ps.length?load(ps[0].slug):fresh();})();
</script>
</body></html>'''


def run(cmd):
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):  # quiet
        pass

    def _json(self, obj, code=200):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        return self.rfile.read(n) if n else b""

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        if path == "/":
            b = UI.encode()
            self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b); return
        if path == "/api/posts":
            return self._json([{k: p[k] for k in ("slug", "title", "date", "draft")} for p in build.load_posts()])
        if path == "/api/post":
            slug = q.get("slug", [""])[0]
            for p in build.load_posts():
                if p["slug"] == slug:
                    return self._json(p)
            return self._json({"error": "not found"}, 404)
        if path == "/api/album":
            return self._json(build.load_album())
        # static: serve the site itself so "open on site" works
        f = os.path.normpath(os.path.join(ROOT, path.lstrip("/")))
        if f.startswith(ROOT) and os.path.isfile(f):
            ctype = mimetypes.guess_type(f)[0] or "application/octet-stream"
            data = open(f, "rb").read()
            self.send_response(200); self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data))); self.end_headers(); self.wfile.write(data); return
        self.send_response(404); self.end_headers()

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        try:
            if path == "/api/preview":
                d = json.loads(self._body() or b"{}")
                return self._json({"html": build.render_md(d.get("body", ""))})

            if path == "/api/save":
                d = json.loads(self._body())
                slug = build.slugify(d.get("slug") or d.get("title") or "untitled")
                prev = d.get("prev")
                if prev and prev != slug:
                    for ext in (".md",):
                        old = os.path.join(build.POSTS, prev + ext)
                        if os.path.exists(old):
                            os.remove(old)
                    oldhtml = os.path.join(ROOT, "blog", prev + ".html")
                    if os.path.exists(oldhtml):
                        os.remove(oldhtml)
                if d.get("draft"):
                    stale = os.path.join(ROOT, "blog", slug + ".html")
                    if os.path.exists(stale):
                        os.remove(stale)
                build.write_post(slug, d.get("title") or slug, d.get("date") or date.today().isoformat(),
                                 d.get("tags", ""), bool(d.get("draft")), d.get("body", ""))
                build.build()
                return self._json({"ok": True, "slug": slug})

            if path == "/api/delete":
                d = json.loads(self._body())
                slug = build.slugify(d.get("slug", ""))
                for f in (os.path.join(build.POSTS, slug + ".md"), os.path.join(ROOT, "blog", slug + ".html")):
                    if os.path.exists(f):
                        os.remove(f)
                build.build()
                return self._json({"ok": True})

            if path == "/api/push":
                log = []
                for cmd in (["git", "add", "-A", "blog", "blog.html", "album.html", "assets/album"],
                            ["git", "commit", "-m", f"desk: {date.today().isoformat()}"],
                            ["git", "push"]):
                    code, out = run(cmd)
                    log.append("$ " + " ".join(cmd) + "\n" + out)
                    if code != 0 and not (cmd[1] == "commit" and "nothing to commit" in out):
                        return self._json({"ok": False, "log": "\n\n".join(log)})
                return self._json({"ok": True, "log": "\n\n".join(log)})

            if path == "/api/album/add":
                ctype = self.headers.get("Content-Type", "")
                m = re.search(r"boundary=(.+)$", ctype)
                if not m:
                    return self._json({"ok": False, "error": "expected multipart"}, 400)
                boundary = m.group(1).strip('"').encode()
                parts = self._body().split(b"--" + boundary)
                fields, fname, fdata = {}, None, None
                for part in parts:
                    if b"\r\n\r\n" not in part:
                        continue
                    head, data = part.split(b"\r\n\r\n", 1)
                    data = data.rsplit(b"\r\n", 1)[0]
                    nm = re.search(rb'name="([^"]+)"', head)
                    fn = re.search(rb'filename="([^"]*)"', head)
                    if not nm:
                        continue
                    if fn:
                        fname, fdata = fn.group(1).decode(errors="ignore"), data
                    else:
                        fields[nm.group(1).decode()] = data.decode("utf-8", "ignore")
                if not fname or not fdata:
                    return self._json({"ok": False, "error": "no file"}, 400)
                base, ext = os.path.splitext(os.path.basename(fname))
                ext = ext.lower() if ext.lower() in (".jpg", ".jpeg", ".png", ".webp", ".gif") else ".jpg"
                safe = build.slugify(base) + ext
                dest_dir = os.path.join(ROOT, "assets", "album")
                os.makedirs(dest_dir, exist_ok=True)
                dest = os.path.join(dest_dir, safe)
                n = 1
                while os.path.exists(dest):
                    n += 1
                    dest = os.path.join(dest_dir, f"{build.slugify(base)}-{n}{ext}")
                open(dest, "wb").write(fdata)
                items = build.load_album()
                items.insert(0, {"file": os.path.basename(dest), "caption": fields.get("caption", "").strip(),
                                 "date": fields.get("date", "").strip()})
                build.save_album(items)
                build.build()
                return self._json({"ok": True, "file": os.path.basename(dest)})

            if path == "/api/album/remove":
                d = json.loads(self._body())
                items = build.load_album()
                i = int(d.get("i", -1))
                if 0 <= i < len(items):
                    it = items.pop(i)
                    f = os.path.join(ROOT, "assets", "album", it["file"])
                    if os.path.exists(f):
                        os.remove(f)
                    build.save_album(items)
                    build.build()
                return self._json({"ok": True})

            self._json({"error": "unknown"}, 404)
        except Exception as e:  # keep the desk alive on bad input
            self._json({"ok": False, "error": str(e)}, 500)


if __name__ == "__main__":
    build.build()
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), H)
    url = f"http://127.0.0.1:{PORT}/"
    print(f"the desk is open at {url}  (ctrl-c to close)")
    if "--no-open" not in sys.argv:
        webbrowser.open(url)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nclosed.")
