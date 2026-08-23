/**
 * Липка панель дій на мобільному.
 *
 * Ховається при скролі вниз (людина читає) і повертається при
 * скролі вгору (людина шукає дію) — щоб не з'їдати екран постійно.
 */
class MobileBar {
  selectors = {
    root: '[data-js-mobile-bar]',
  }

  stateClasses = {
    isHidden: 'is-hidden',
  }

  // Дрібні рухи пальцем не мають смикати панель.
  scrollDelta = 8
  // Біля верху сторінки панель видно завжди.
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
