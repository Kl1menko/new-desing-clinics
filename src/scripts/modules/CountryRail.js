class CountryRail {
  selectors = {
    root: '[data-js-rail]',
    track: '[data-js-rail-track]',
    prev: '[data-js-rail-prev]',
    next: '[data-js-rail-next]',
  }

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root)

    if (!this.rootElement) {
      return
    }

    this.trackElement = this.rootElement.querySelector(this.selectors.track)
    this.prevElement = this.rootElement.querySelector(this.selectors.prev)
    this.nextElement = this.rootElement.querySelector(this.selectors.next)

    if (!this.trackElement) {
      return
    }

    this.bindEvents()

    requestAnimationFrame(this.updateButtons)
  }

  get step() {
    const card = this.trackElement.firstElementChild

    if (!card) {
      return this.trackElement.clientWidth
    }

    const gap = parseFloat(getComputedStyle(this.trackElement).columnGap) || 0

    return card.getBoundingClientRect().width + gap
  }

  scrollByStep(direction) {
    this.trackElement.scrollBy({
      left: this.step * direction,
      behavior: 'smooth',
    })
  }

  updateButtons = () => {
    const { scrollLeft, scrollWidth, clientWidth } = this.trackElement

    const startOffset = parseFloat(getComputedStyle(this.trackElement).paddingLeft) || 0

    const atStart = scrollLeft <= startOffset + 2
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 2

    if (this.prevElement) this.prevElement.disabled = atStart
    if (this.nextElement) this.nextElement.disabled = atEnd
  }

  onPrevClick = () => this.scrollByStep(-1)
  onNextClick = () => this.scrollByStep(1)

  bindEvents() {
    this.prevElement?.addEventListener('click', this.onPrevClick)
    this.nextElement?.addEventListener('click', this.onNextClick)
    this.trackElement.addEventListener('scroll', this.updateButtons, { passive: true })
    window.addEventListener('resize', this.updateButtons, { passive: true })
  }
}

export default CountryRail
