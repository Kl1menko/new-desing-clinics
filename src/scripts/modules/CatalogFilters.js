/**
 * Фільтри каталогу закладів.
 *
 * Фільтрація на клієнті: список країни приходить сторінкою, і
 * перемикання чекбокса не має чекати на сервер. Кожна картка
 * несе свої атрибути в data-*, тож нічого доузгоджувати не треба.
 */
class CatalogFilters {
  selectors = {
    root: '[data-js-catalog]',
    panel: '[data-js-filters]',
    overlay: '[data-js-filters-overlay]',
    toggle: '[data-js-filters-toggle]',
    toggleBadge: '[data-js-filters-badge]',
    close: '[data-js-filters-close]',
    option: '[data-js-filter-option]',
    card: '[data-js-clinic]',
    count: '[data-js-result-count]',
    active: '[data-js-active-filters]',
    empty: '[data-js-results-empty]',
    clear: '[data-js-clear-filters]',
    sort: '[data-js-sort]',
    results: '[data-js-results]',
  }

  stateClasses = {
    isOpen: 'is-open',
    isVisible: 'is-visible',
    isLock: 'is-lock',
  }

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root)

    if (!this.rootElement) {
      return
    }

    this.panelElement = this.rootElement.querySelector(this.selectors.panel)
    this.overlayElement = this.rootElement.querySelector(this.selectors.overlay)
    this.toggleElement = this.rootElement.querySelector(this.selectors.toggle)
    this.closeElement = this.rootElement.querySelector(this.selectors.close)
    this.activeElement = this.rootElement.querySelector(this.selectors.active)
    this.emptyElement = this.rootElement.querySelector(this.selectors.empty)
    this.resultsElement = this.rootElement.querySelector(this.selectors.results)
    this.sortElement = this.rootElement.querySelector(this.selectors.sort)

    this.optionElements = [...this.rootElement.querySelectorAll(this.selectors.option)]
    this.cardElements = [...this.rootElement.querySelectorAll(this.selectors.card)]
    // Початковий порядок, щоб «Relevance» можна було повернути.
    this.initialOrder = [...this.cardElements]

    this.bindEvents()
    this.apply()
  }

  /** Обрані значення, згруповані за назвою поля. */
  get selected() {
    const groups = {}

    this.optionElements
      .filter((input) => input.checked)
      .forEach((input) => {
        const { name, value } = input
        groups[name] ??= []
        groups[name].push(value)
      })

    return groups
  }

  matches(cardElement, groups) {
    // Кожна група звужує вибірку (AND), значення всередині
    // групи розширюють (OR) — звична поведінка фасетів.
    return Object.entries(groups).every(([name, values]) => {
      const raw = cardElement.dataset[name] || ''
      const own = raw.split('|').filter(Boolean)

      return values.some((value) => own.includes(value))
    })
  }

  apply() {
    const groups = this.selected
    let visible = 0

    this.cardElements.forEach((cardElement) => {
      const isMatch = this.matches(cardElement, groups)
      cardElement.hidden = !isMatch
      if (isMatch) visible += 1
    })

    this.renderCount(visible)
    this.renderActive(groups)
    this.emptyElement?.classList.toggle(this.stateClasses.isVisible, visible === 0)
  }

  renderCount(visible) {
    this.rootElement.querySelectorAll(this.selectors.count).forEach((el) => {
      el.textContent = visible.toLocaleString('en-US')
    })
  }

  renderActive(groups) {
    if (!this.activeElement) {
      return
    }

    const pills = Object.entries(groups).flatMap(([name, values]) =>
      values.map(
        (value) => `<span class="filter-pill">${value}
          <button type="button" aria-label="Remove filter ${value}"
                  data-js-remove-filter="${name}:${value}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </span>`
      )
    )

    const count = pills.length

    this.activeElement.innerHTML = count
      ? `<span class="active-filters__label">Active filters:</span>${pills.join('')}
         <button type="button" class="clear-all" data-js-clear-filters>Clear all</button>`
      : ''

    const badgeElement = this.rootElement.querySelector(this.selectors.toggleBadge)

    if (badgeElement) {
      badgeElement.textContent = String(count)
      badgeElement.hidden = count === 0
    }
  }

  togglePanel(isOpen) {
    this.panelElement?.classList.toggle(this.stateClasses.isOpen, isOpen)
    this.overlayElement?.classList.toggle(this.stateClasses.isOpen, isOpen)
    this.toggleElement?.setAttribute('aria-expanded', String(isOpen))
    document.documentElement.classList.toggle(this.stateClasses.isLock, isOpen)
  }

  onOptionChange = () => this.apply()

  onSortChange = () => {
    const mode = this.sortElement.value
    const sorted = [...this.initialOrder]

    if (mode === 'name-asc' || mode === 'name-desc') {
      sorted.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name))
      if (mode === 'name-desc') sorted.reverse()
    }

    // append переносить існуючий вузол — DOM перевпорядковується
    // без перестворення карток.
    sorted.forEach((card) => this.resultsElement.append(card))
  }

  onDocumentClick = (event) => {
    const removeButton = event.target.closest('[data-js-remove-filter]')

    if (removeButton) {
      const [name, value] = removeButton.dataset.jsRemoveFilter.split(':')
      const input = this.optionElements.find(
        (el) => el.name === name && el.value === value
      )
      if (input) {
        input.checked = false
        this.apply()
      }
      return
    }

    if (event.target.closest('[data-js-clear-filters]')) {
      this.optionElements.forEach((input) => { input.checked = false })
      this.apply()
    }
  }

  onKeydown = (event) => {
    if (event.key === 'Escape' && this.panelElement?.classList.contains(this.stateClasses.isOpen)) {
      this.togglePanel(false)
      this.toggleElement?.focus()
    }
  }

  bindEvents() {
    this.optionElements.forEach((input) => {
      input.addEventListener('change', this.onOptionChange)
    })

    this.sortElement?.addEventListener('change', this.onSortChange)
    this.toggleElement?.addEventListener('click', () => this.togglePanel(true))
    this.closeElement?.addEventListener('click', () => this.togglePanel(false))
    this.overlayElement?.addEventListener('click', () => this.togglePanel(false))

    document.addEventListener('click', this.onDocumentClick)
    document.addEventListener('keydown', this.onKeydown)
  }
}

export default CatalogFilters
