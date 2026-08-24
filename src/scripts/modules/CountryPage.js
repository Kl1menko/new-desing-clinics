const ICONS = {
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  cal: '<path d="M8 2v4M16 2v4"/><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 11h18"/>',
  dash: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
}

const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`

const VERIFIED =
  '<span class="verified verified--sm" role="img" aria-label="Accreditation verified">' +
  '<svg class="verified__seal" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.2l2.05 1.86 2.7-.5.98 2.57 2.57.98-.5 2.7L21.66 11l-1.86 2.05.5 2.7-2.57.98-.98 2.57-2.7-.5L12 20.66l-2.05-1.86-2.7.5-.98-2.57-2.57-.98.5-2.7L2.34 11l1.86-2.05-.5-2.7 2.57-.98.98-2.57 2.7.5z"/></svg>' +
  '<svg class="verified__check" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>'

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  )

class CountryPage {
  selectors = {
    root: '[data-js-country-page]',
    results: '[data-js-results]',
    filters: '[data-js-filter-groups]',
    count: '[data-js-result-count]',
  }

  fields = [
    ['accreditation', 'Accreditation status'],
    ['body', 'Accreditation body'],
    ['type', 'Institution type'],
    ['city', 'City'],
  ]

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root)

    if (!this.rootElement) {
      return
    }

    this.slug = new URLSearchParams(location.search).get('c') || 'japan'
    this.load()
  }

  async load() {
    try {
      const response = await fetch('data/countries.json')
      const all = await response.json()
      this.data = all[this.slug] || all.japan
      if (!all[this.slug]) this.slug = 'japan'
    } catch {
      this.rootElement.hidden = false
      return
    }

    this.render()
    this.rootElement.dispatchEvent(new CustomEvent('country:ready', { bubbles: true }))
  }

  optionsFor(key) {
    const counts = new Map()
    const add = (value) => value && counts.set(value, (counts.get(value) || 0) + 1)

    this.data.clinics.forEach((clinic) => {
      if (key === 'accreditation') add(clinic.accredited ? 'Accredited' : 'Registry listed only')
      else if (key === 'body') clinic.bodies.forEach(add)
      else add(clinic[key])
    })

    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'en'))
  }

  renderFilters() {
    return this.fields
      .map(([key, title]) => {
        const rows = this.optionsFor(key)
          .map(
            ([value, n]) => `            <li>
              <label class="filter-option">
                <input type="checkbox" name="${key}" value="${esc(value)}" data-js-filter-option>
                <span>${esc(value)}</span>
                <small>${n}</small>
              </label>
            </li>`
          )
          .join('\n')

        return `        <div class="filter-group">
          <h3>${esc(title)}</h3>
          <ul>\n${rows}\n          </ul>
        </div>`
      })
      .join('\n')
  }

  renderClinics() {
    return this.data.clinics
      .map((clinic) => {
        const status = clinic.accredited
          ? `<span class="clinic-card__status">${VERIFIED}Accredited</span>`
          : `<span class="clinic-card__status clinic-card__status--none">${icon('dash')}Registry only</span>`

        const since =
          clinic.accredited && clinic.since
            ? `<span class="clinic-card__row">${icon('cal')} Accredited since ${clinic.since}</span>`
            : ''

        const bodies = clinic.bodies.length
          ? `<span class="clinic-card__bodies">${clinic.bodies
              .map((b) => `<span class="body-tag">${esc(b)}</span>`)
              .join('')}</span>`
          : ''

        return `          <article class="clinic-card" data-js-clinic
                   data-name="${esc(clinic.name)}"
                   data-accreditation="${clinic.accredited ? 'Accredited' : 'Registry listed only'}"
                   data-body="${esc(clinic.bodies.join('|'))}"
                   data-type="${esc(clinic.type)}"
                   data-city="${esc(clinic.city)}">
            <div class="clinic-card__head">
              <span class="clinic-card__type">${esc(clinic.type)}</span>
              ${status}
            </div>

            <h3 class="clinic-card__name">
              <a href="clinic.html">${esc(clinic.name)}</a>
            </h3>

            <div class="clinic-card__meta">
              <span class="clinic-card__row">${icon('pin')}${esc(clinic.city)}, ${esc(this.data.name)}</span>
              ${since}
              ${bodies}
            </div>

            <div class="clinic-card__foot">
              <span class="clinic-card__view">View record ${icon('arrow')}</span>
            </div>
          </article>`
      })
      .join('\n')
  }

  render() {
    const { name, region, flag, lead, canonical, description } = this.data

    document.title = `Accredited clinics in ${name} | WhatClinicSafe`
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical)
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)

    this.setText('[data-js-country-name]', name)
    this.setText('[data-js-country-region]', region)
    this.setText('[data-js-country-lead]', lead)
    this.setText('[data-js-country-total]', this.data.total || '—')

    const flagElement = this.rootElement.querySelector('[data-js-country-flag]')
    if (flagElement) {
      flagElement.src = flag
      flagElement.alt = ''
    }

    this.rootElement.querySelector(this.selectors.filters).innerHTML = this.renderFilters()
    this.rootElement.querySelector(this.selectors.results).innerHTML = this.renderClinics()
    this.rootElement
      .querySelectorAll(this.selectors.count)
      .forEach((el) => { el.textContent = String(this.data.clinics.length) })

    this.rootElement.hidden = false
  }

  setText(selector, value) {
    document.querySelectorAll(selector).forEach((el) => { el.textContent = value })
  }
}

export default CountryPage
