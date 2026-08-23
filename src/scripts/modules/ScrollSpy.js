/**
 * Підсвічує пункт бічної навігації для секції, яка зараз на екрані.
 */
class ScrollSpy {
  selectors = {
    link: '[data-js-scroll-spy-link]',
  }

  stateClasses = {
    isActive: 'is-active',
  }

  observerOptions = {
    rootMargin: '-25% 0px -55% 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1],
  }

  constructor() {
    this.linkElements = [...document.querySelectorAll(this.selectors.link)]

    if (!this.linkElements.length || !('IntersectionObserver' in window)) {
      return
    }

    this.sectionElements = this.linkElements
      .map((linkElement) => document.querySelector(linkElement.getAttribute('href')))
      .filter(Boolean)

    if (!this.sectionElements.length) {
      return
    }

    // id -> наскільки секція зараз видима
    this.visibleRatios = new Map()

    this.observer = new IntersectionObserver(this.onIntersect, this.observerOptions)
    this.sectionElements.forEach((sectionElement) => this.observer.observe(sectionElement))
  }

  setActiveLink(sectionId) {
    this.linkElements.forEach((linkElement) => {
      linkElement.classList.toggle(
        this.stateClasses.isActive,
        linkElement.getAttribute('href') === `#${sectionId}`
      )
    })
  }

  onIntersect = (entries) => {
    entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
      if (isIntersecting) {
        this.visibleRatios.set(target.id, intersectionRatio)
      } else {
        this.visibleRatios.delete(target.id)
      }
    })

    if (!this.visibleRatios.size) {
      return
    }

    // Активною стає найбільш видима з відстежуваних секцій.
    const [mostVisibleId] = [...this.visibleRatios.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0]

    this.setActiveLink(mostVisibleId)
  }
}

export default ScrollSpy
