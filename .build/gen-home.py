#!/usr/bin/env python3
"""Генерує home.html із home-data.json + shell-home.html."""
import json, html, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((ROOT / ".build/home-data.json").read_text())

def esc(s): return html.escape(str(s), quote=True)

PROMISE_ICONS = [
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h6"/>',
    '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    '<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
]

def icon(paths):
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{paths}</svg>')

def render_promises():
    out = []
    for i, p in enumerate(data["promises"]):
        out.append(f'''        <li class="promise">
          <span class="promise__icon">{icon(PROMISE_ICONS[i % len(PROMISE_ICONS)])}</span>
          <h3>{esc(p["title"])}</h3>
          <p>{esc(p["text"])}</p>
        </li>''')
    return "\n".join(out)

PLACEHOLDER = ('<div class="country-card__placeholder">'
               '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" '
               'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
               '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/>'
               '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/>'
               '</svg><span>Photo coming soon</span></div>')

def render_countries():
    out = []
    for c in data["countries"]:
        if c["photo"]:
            media = (f'<img src="assets/images/countries/{c["photo"]}-480.webp" '
                     f'srcset="assets/images/countries/{c["photo"]}-480.webp 480w, '
                     f'assets/images/countries/{c["photo"]}-720.webp 720w" '
                     f'sizes="(min-width: 768px) 280px, 240px" '
                     f'alt="" width="480" height="640" loading="lazy" decoding="async">')
        else:
            media = PLACEHOLDER
        # Локально існує лише сторінка закладу — на неї й ведемо
        # з Belgium, решта поки на серверний шлях.
        # Локально існують дві сторінки — на них і ведемо з демо-карток.
        local = {"belgium": "index.html", "japan": "country.html"}
        href = local.get(c["slug"], f'/care-services/{esc(c["slug"])}')
        out.append(f'''          <a class="country-card" href="{href}">
            <span class="country-card__media">
              {media}
              <span class="country-card__region">{esc(c["region"])}</span>
            </span>
            <span class="country-card__body">
              <span class="country-card__name">{esc(c["name"])}</span>
              <span class="country-card__count num">{c["facilities"]:,}</span>
            </span>
          </a>''')
    return "\n".join(out)

def render_sources():
    """Вузли на двох кільцях: по три фіксовані позиції на кожному."""
    def chips(ring):
        out = []
        for src in data["sources"][ring]:
            out.append(
                f'<span class="orbit-chip orbit-chip--{src["pos"]}" '
                f'title="{esc(src["name"])} &middot; {esc(src["region"])}">'
                f'<img src="assets/{src["logo"]}" alt="" width="24" height="24" '
                f'loading="lazy" decoding="async"></span>'
            )
        return "\n            ".join(out)

    return (
        '<span class="orbit__ring orbit__ring--outer">\n'
        f'            {chips("outer")}\n'
        '          </span>\n\n'
        '          <span class="orbit__ring orbit__ring--inner">\n'
        f'            {chips("inner")}\n'
        '          </span>'
    )


shell = (ROOT / ".build/shell-home.html").read_text()
out = (shell
       .replace("<!--PROMISES-->", render_promises())
       .replace("<!--COUNTRIES-->", render_countries())
       .replace("<!--SPECIALTIES-->", esc(json.dumps(data["specialties"])))
       .replace("<!--SOURCES-->", render_sources()))
(ROOT / "home.html").write_text(out)
print("wrote home.html", len(out), "bytes")
