import json, html, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((ROOT / ".build/country-data.json").read_text())

def esc(s): return html.escape(str(s), quote=True)

def icon(paths, w=15):
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{paths}</svg>')

VERIFIED = (
    '<span class="verified verified--sm" role="img" aria-label="Accreditation verified">'
    '<svg class="verified__seal" viewBox="0 0 24 24" aria-hidden="true">'
    '<path d="M12 1.2l2.05 1.86 2.7-.5.98 2.57 2.57.98-.5 2.7L21.66 11l-1.86 2.05.5 2.7-2.57.98-.98 2.57-2.7-.5L12 20.66l-2.05-1.86-2.7.5-.98-2.57-2.57-.98.5-2.7L2.34 11l1.86-2.05-.5-2.7 2.57-.98.98-2.57 2.7.5z"/></svg>'
    '<svg class="verified__check" viewBox="0 0 24 24" aria-hidden="true">'
    '<path d="M20 6 9 17l-5-5"/></svg></span>'
)

PIN   = '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
CAL   = '<path d="M8 2v4M16 2v4"/><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 11h18"/>'
CHECK = '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'
DASH  = '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>'
ARROW = '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'

FIELDS = [
    ("accreditation", "Accreditation status"),
    ("body",          "Accreditation body"),
    ("type",          "Institution type"),
    ("city",          "City"),
]

def render_filters():
    out = []
    for key, title in FIELDS:
        rows = []
        for opt in data["filters"][key]:
            checked = " checked" if opt.get("checked") else ""
            rows.append(
                f'''            <li>
              <label class="filter-option">
                <input type="checkbox" name="{key}" value="{esc(opt["label"])}"
                       data-js-filter-option{checked}>
                <span>{esc(opt["label"])}</span>
                <small>{opt["count"]:,}</small>
              </label>
            </li>''')
        out.append(f'''        <div class="filter-group">
          <h3>{esc(title)}</h3>
          <ul>
{chr(10).join(rows)}
          </ul>
        </div>''')
    return "\n".join(out)

def render_clinics():
    out = []
    for c in data["clinics"]:
        slug = c["name"].lower().replace(",", "").replace(" ", "-")
        href = "index.html"

        if c["accredited"]:
            status = (f'<span class="clinic-card__status">{VERIFIED}Accredited</span>')
            since = (f'''<span class="clinic-card__row">{icon(CAL)}
                Accredited since {c["since"]}</span>''' if c["since"] else "")
            tags = "".join(f'<span class="body-tag">{esc(b)}</span>' for b in c["bodies"])
            bodies = f'<span class="clinic-card__bodies">{tags}</span>' if tags else ""
            acc_value = "Accredited"
        else:
            status = (f'<span class="clinic-card__status clinic-card__status--none">'
                      f'{icon(DASH)}Registry only</span>')
            since, bodies = "", ""
            acc_value = "Registry listed only"

        out.append(f'''          <article class="clinic-card" data-js-clinic
                   data-name="{esc(c["name"])}"
                   data-accreditation="{esc(acc_value)}"
                   data-body="{esc('|'.join(c["bodies"]))}"
                   data-type="{esc(c["type"])}"
                   data-city="{esc(c["city"])}">
            <div class="clinic-card__head">
              <span class="clinic-card__type">{esc(c["type"])}</span>
              {status}
            </div>

            <h3 class="clinic-card__name">
              <a href="{href}">{esc(c["name"])}</a>
            </h3>

            <div class="clinic-card__meta">
              <span class="clinic-card__row">{icon(PIN)}{esc(c["city"])}, {esc(data["country"]["name"])}</span>
              {since}
              {bodies}
            </div>

            <div class="clinic-card__foot">
              <span class="clinic-card__view">View record {icon(ARROW, 14)}</span>
            </div>
          </article>''')
    return "\n".join(out)

shell = (ROOT / ".build/shell-country.html").read_text()
country = data["country"]

out = (shell
       .replace("<!--FILTERS-->", render_filters())
       .replace("<!--CLINICS-->", render_clinics())
       .replace("{{COUNTRY}}", esc(country["name"]))
       .replace("{{REGION}}", esc(country["region"]))
       .replace("{{PHOTO}}", country["photo"])
       .replace("{{TOTAL}}", f'{country["total"]:,}')
       .replace("{{SHOWN}}", str(len(data["clinics"])))
       .replace("{{ACCREDITED}}", f'{country["accredited"]:,}'))

(ROOT / "country.html").write_text(out)
print("wrote country.html", len(out), "bytes")
