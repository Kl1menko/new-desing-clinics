class MobileBar {
  selectors = {
    root: '[data-js-mobile-bar]',
  }

  stateClasses = {
    isHidden: 'is-hidden',
  }

  scrollDelta = 8
  hideAfterScroll = 240

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root)

    if (!this.rootElement) {
      return
    }

    this.lastScrollY = window.scrollY
    this.isTicking = false

    this.bindEvents()
  }

  updateVisibility = () => {
    const currentScrollY = window.scrollY
    const delta = currentScrollY - this.lastScrollY

    if (Math.abs(delta) > this.scrollDelta) {
      this.rootElement.classList.toggle(
        this.stateClasses.isHidden,
        delta > 0 && currentScrollY > this.hideAfterScroll
      )
      this.lastScrollY = currentScrollY
    }

    this.isTicking = false
  }

  onScroll = () => {
    if (this.isTicking) {
      return
    }

    this.isTicking = true
    requestAnimationFrame(this.updateVisibility)
  }

  bindEvents() {
    window.addEventListener('scroll', this.onScroll, { passive: true })
  }
}

export default MobileBar
