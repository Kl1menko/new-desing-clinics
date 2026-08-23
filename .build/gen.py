import json, html, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((ROOT / ".build/data.json").read_text())

PASS, WARN = 1.0, 0.8

def esc(s): return html.escape(str(s), quote=True)

def state(got, target):
    r = got / target if target else 0
    return "pass" if r >= PASS else ("warn" if r >= WARN else "fail"), r

ICONS = {
 "staff":'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
 "safe care":'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
 "standardized care":'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
 "hygiene":'<path d="M12 2v6"/><path d="M8 8h8l1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/>',
 "communication":'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
 "follow-up":'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
}
def group_icon(name):
    p = ICONS.get(name.strip().lower(), ICONS["follow-up"])
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{p}</svg>'

STATE_WORD = {"pass": "target met", "warn": "partially met", "fail": "below target"}

def render_rows(rows):
    out = []
    for label, ratio in rows:
        got, target = (int(x) for x in ratio.split("/"))
        st, r = state(got, target)
        aria = f"{got} of {target} — {STATE_WORD[st]}"
        out.append(f'''            <tr class="indicators__row--{st}">
              <td class="indicators__label">{esc(label)}</td>
              <td class="indicators__value">
                <span class="score score--{st}" data-js-score="{got}/{target}">
                  <span class="score__ratio num">{got}<span aria-hidden="true"> / </span><span class="visually-hidden"> of </span>{target}</span>
                  <span class="score__bar" role="img" aria-label="{esc(aria)}"><span data-js-score-bar="{round(r*100)}" style="width:0"></span></span>
                </span>
              </td>
            </tr>''')
    return "\n".join(out)

def render_groups(rep):
    out = []
    for gi, g in enumerate(rep["groups"]):
        rows = g["rows"]
        tot = len(rows)
        met = sum(1 for _, x in rows if state(*(int(v) for v in x.split("/")))[0] == "pass")
        gid = f"g-{rep['id']}-{gi}"
        issues = tot - met
        chip = (f'<span class="group-chip group-chip--warn">{met}/{tot} met</span>'
                if issues else '<span class="group-chip group-chip--pass">All {tot} met</span>')
        out.append(f'''        <section class="indicator-group" data-js-indicator-group>
          <button class="indicator-group__head" type="button" data-js-indicator-group-toggle
                  aria-expanded="false" aria-controls="{gid}">
            <span class="indicator-group__title">{group_icon(g["name"])}{esc(g["name"])}</span>
            <span class="indicator-group__aside">
              {chip}
              <span class="indicator-group__chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </span>
            </span>
          </button>
          <div class="indicator-group__panel" id="{gid}" data-js-indicator-group-panel>
           <div>
          <div class="indicators">
            <table>
              <caption class="visually-hidden">{esc(g["name"])} indicators for {esc(rep["title"])}</caption>
              <thead>
                <tr><th scope="col">Indicator</th><th scope="col">Result</th></tr>
              </thead>
              <tbody>
{render_rows(rows)}
              </tbody>
            </table>
          </div>
           </div>
          </div>
        </section>''')
    return "\n".join(out)

def render_report(rep):
    all_rows = [r for g in rep["groups"] for r in g["rows"]]
    tot = len(all_rows)
    met = sum(1 for _, x in all_rows if state(*(int(v) for v in x.split("/")))[0] == "pass")
    below = tot - met
    pid = f"panel-{rep['id']}"
    ref = f'<span class="dot" aria-hidden="true"></span><code>{esc(rep["ref"])}</code>' if rep["ref"] else ""
    return f'''      <article class="inspection" id="{esc(rep["id"])}" data-js-inspection>
        <h4 class="visually-hidden">{esc(rep["title"])}</h4>
        <button class="inspection__toggle" type="button" data-js-inspection-toggle
                aria-expanded="false" aria-controls="{pid}">
          <span class="inspection__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h4"/><path d="M9 17h6"/></svg>
          </span>
          <span class="inspection__text">
            <span class="inspection__title">{esc(rep["title"])}</span>
            <span class="inspection__meta">
              <span>{esc(rep["type"])}</span>
              <span class="dot" aria-hidden="true"></span>
              <time datetime="{rep["datetime"]}">{esc(rep["date"])}</time>
              {ref}
            </span>
          </span>
          <span class="inspection__aside">
            <span class="inspection__score">
              <b class="num">{met}/{tot}</b>
              <small>met</small>
            </span>
            <span class="inspection__chevron" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </span>
        </button>
        <div class="inspection__panel" id="{pid}" data-js-inspection-panel role="region"
             aria-label="{esc(rep["title"])} indicators">
          <div><div class="inspection__panel-inner">
            <div class="indicator-group__head panel-head">
              <p class="eyebrow">Inspection indicators</p>
              <div class="panel-head__actions">
                <button class="filter-toggle" type="button" aria-pressed="false"
                        data-js-issues-filter="#{pid}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 3H2l8 9.46V19l4 2v-8.54z"/></svg>
                  Only issues <span data-js-issues-filter-count>{below}</span>
                </button>
              </div>
            </div>
{render_groups(rep)}
            <p class="filter-empty" data-js-issues-filter-empty>No indicators match this filter.</p>
          </div></div>
        </div>
      </article>'''

reports_html = "\n".join(render_report(r) for r in data["reports"])

nav_items = "\n".join(
    f'''            <li><a href="#{esc(r["id"])}" data-js-scroll-spy-link>{esc(r["title"])}</a></li>'''
    for r in data["reports"]
)

shell = (ROOT / ".build/shell.html").read_text()
out = shell.replace("<!--REPORTS-->", reports_html).replace("<!--REPORT_NAV-->", nav_items)
(ROOT / "index.html").write_text(out)
print("wrote index.html", len(out), "bytes")
