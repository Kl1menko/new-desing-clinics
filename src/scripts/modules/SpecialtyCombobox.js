class SpecialtyCombobox {
  selectors = {
    root: '[data-js-combobox]',
    input: '[data-js-combobox-input]',
    list: '[data-js-combobox-list]',
  }

  stateClasses = {
    isOpen: 'is-open',
  }

  maxVisible = 8

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root)

    if (!this.rootElement) {
      return
    }

    this.inputElement = this.rootElement.querySelector(this.selectors.input)
    this.listElement = this.rootElement.querySelector(this.selectors.list)

    if (!this.inputElement || !this.listElement) {
      return
    }

    this.options = this.readOptions()
    this.matches = []
    this.totalMatches = 0
    this.activeIndex = -1

    this.bindEvents()
  }

  readOptions() {
    try {
      return JSON.parse(this.listElement.dataset.jsComboboxOptions || '[]')
    } catch {
      return []
    }
  }

  get isOpen() {
    return this.listElement.classList.contains(this.stateClasses.isOpen)
  }

  filter(query) {
    const q = query.trim().toLowerCase()

    if (!q) {
      this.totalMatches = this.options.length
      return this.options.slice(0, this.maxVisible)
    }

    const starts = []
    const contains = []

    this.options.forEach((option) => {
      const value = option.toLowerCase()
      if (value.startsWith(q)) starts.push(option)
      else if (value.includes(q)) contains.push(option)
    })

    const all = [...starts, ...contains]
    this.totalMatches = all.length

    return all.slice(0, this.maxVisible)
  }

  render() {
    if (!this.matches.length) {
      this.listElement.innerHTML =
        '<p class="combobox__empty">No specialty matches that search.</p>'
      return
    }

    const query = this.inputElement.value.trim()
    const total = this.totalMatches

    const hint = query
      ? `${total} ${total === 1 ? 'match' : 'matches'}`
      : `${this.options.length} specialties — start typing to narrow`

    const items = this.matches
      .map(
        (option, index) =>
          `<li role="option" id="specialty-option-${index}" aria-selected="${
            index === this.activeIndex
          }">${this.highlight(option, query)}</li>`
      )
      .join('')

    const more =
      total > this.matches.length
        ? `<p class="combobox__more">+${total - this.matches.length} more — keep typing</p>`
        : ''

    this.listElement.innerHTML =
      `<p class="combobox__hint">${hint}</p>${items}${more}`
  }

  highlight(option, query) {
    if (!query) {
      return option
    }

    const at = option.toLowerCase().indexOf(query.toLowerCase())

    if (at < 0) {
      return option
    }

    return (
      option.slice(0, at) +
      `<mark>${option.slice(at, at + query.length)}</mark>` +
      option.slice(at + query.length)
    )
  }

  open() {
    this.listElement.classList.add(this.stateClasses.isOpen)
    this.inputElement.setAttribute('aria-expanded', 'true')
  }

  close() {
    this.listElement.classList.remove(this.stateClasses.isOpen)
    this.inputElement.setAttribute('aria-expanded', 'false')
    this.inputElement.removeAttribute('aria-activedescendant')
    this.activeIndex = -1
  }

  select(option) {
    this.inputElement.value = option
    this.close()
  }

  setActive(index) {
    if (!this.matches.length) {
      return
    }

    const count = this.matches.length
    this.activeIndex = (index + count) % count

    this.render()
    this.inputElement.setAttribute(
      'aria-activedescendant',
      `specialty-option-${this.activeIndex}`
    )

    this.listElement
      .querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }

  onInput = () => {
    this.matches = this.filter(this.inputElement.value)
    this.activeIndex = -1
    this.render()
    this.open()
  }

  onFocus = () => {
    this.matches = this.filter(this.inputElement.value)
    this.render()
    this.open()
  }

  onKeydown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()

      if (!this.isOpen) {
        this.onFocus()
        return
      }

      this.setActive(this.activeIndex + (event.key === 'ArrowDown' ? 1 : -1))
      return
    }

    if (event.key === 'Enter' && this.isOpen && this.activeIndex >= 0) {
      event.preventDefault()
      this.select(this.matches[this.activeIndex])
      return
    }

    if (event.key === 'Escape' && this.isOpen) {
      event.preventDefault()
      this.close()
    }
  }

  onListClick = (event) => {
    const optionElement = event.target.closest('[role="option"]')

    if (optionElement) {
      this.select(optionElement.textContent)
      this.inputElement.focus()
    }
  }

  onDocumentClick = (event) => {
    if (!this.rootElement.contains(event.target)) {
      this.close()
    }
  }

  bindEvents() {
    this.inputElement.addEventListener('input', this.onInput)
    this.inputElement.addEventListener('focus', this.onFocus)
    this.inputElement.addEventListener('keydown', this.onKeydown)
    this.listElement.addEventListener('click', this.onListClick)
    document.addEventListener('click', this.onDocumentClick)
  }
}

export default SpecialtyCombobox
