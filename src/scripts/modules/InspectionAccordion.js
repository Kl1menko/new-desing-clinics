import togglePanel from '../helpers/togglePanel.js'

class InspectionAccordion {
  selectors = {
    root: '[data-js-inspection]',
    toggle: '[data-js-inspection-toggle]',
    panel: '[data-js-inspection-panel]',
    expandAll: '[data-js-inspection-expand-all]',
    expandAllLabel: '[data-js-inspection-expand-all-label]',
    group: '[data-js-indicator-group]',
    groupToggle: '[data-js-indicator-group-toggle]',
    groupPanel: '[data-js-indicator-group-panel]',
    bar: '[data-js-score-bar]',
    issueRow: '.indicators__row--warn, .indicators__row--fail',
  }

  stateClasses = {
    isOpen: 'is-open',
  }

  labels = {
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
  }

  constructor() {
    this.rootElements = [...document.querySelectorAll(this.selectors.root)]

    if (!this.rootElements.length) {
      return
    }

    this.reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')

    this.initReports()
    this.initGroups()
    this.bindEvents()
    this.openFromHash()
  }

  initReports() {
    this.rootElements.forEach((rootElement) => {
      const toggleElement = rootElement.querySelector(this.selectors.toggle)

      if (!toggleElement) {
        return
      }

      this.toggleReport(rootElement, false)

      toggleElement.addEventListener('click', () => {
        const isOpen = toggleElement.getAttribute('aria-expanded') !== 'true'

        this.toggleReport(rootElement, isOpen, { shouldScroll: true })

        if (isOpen && rootElement.id) {
          history.replaceState(null, '', `#${rootElement.id}`)
        }
      })
    })
  }

  initGroups() {
    document.querySelectorAll(this.selectors.group).forEach((groupElement) => {
      const toggleElement = groupElement.querySelector(this.selectors.groupToggle)
      const panelElement = groupElement.querySelector(this.selectors.groupPanel)

      if (!toggleElement || !panelElement) {
        return
      }

      const hasIssues = Boolean(panelElement.querySelector(this.selectors.issueRow))

      groupElement.dataset.jsGroupDefaultOpen = String(hasIssues)
      togglePanel(toggleElement, panelElement, false)

      toggleElement.addEventListener('click', () => {
        togglePanel(
          toggleElement,
          panelElement,
          toggleElement.getAttribute('aria-expanded') !== 'true'
        )
      })
    })
  }

  toggleReport(rootElement, isOpen, { shouldScroll = false } = {}) {
    const toggleElement = rootElement.querySelector(this.selectors.toggle)
    const panelElement = rootElement.querySelector(this.selectors.panel)

    if (!toggleElement || !panelElement) {
      return
    }

    rootElement.classList.toggle(this.stateClasses.isOpen, isOpen)
    togglePanel(toggleElement, panelElement, isOpen)

    if (!isOpen) {
      return
    }

    this.applyGroupDefaults(panelElement)
    this.growBars(panelElement)

    if (shouldScroll && rootElement.getBoundingClientRect().top < 0) {
      rootElement.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }

  applyGroupDefaults(panelElement) {
    if (panelElement.dataset.jsGroupsApplied === 'true') {
      return
    }

    panelElement.dataset.jsGroupsApplied = 'true'

    panelElement.querySelectorAll(this.selectors.group).forEach((groupElement) => {
      if (groupElement.dataset.jsGroupDefaultOpen !== 'true') {
        return
      }

      togglePanel(
        groupElement.querySelector(this.selectors.groupToggle),
        groupElement.querySelector(this.selectors.groupPanel),
        true
      )
    })
  }

  growBars(panelElement) {
    if (panelElement.dataset.jsBarsGrown === 'true') {
      return
    }

    panelElement.dataset.jsBarsGrown = 'true'

    panelElement.querySelectorAll(this.selectors.bar).forEach((barElement) => {
      const width = `${barElement.dataset.jsScoreBar || 0}%`

      if (this.reducedMotionMedia.matches) {
        barElement.style.width = width
        return
      }

      requestAnimationFrame(() => {
        barElement.style.width = width
      })
    })
  }

  onExpandAllClick = (event) => {
    const buttonElement = event.currentTarget
    const shouldExpand = buttonElement.getAttribute('aria-pressed') !== 'true'

    buttonElement.setAttribute('aria-pressed', String(shouldExpand))

    const labelElement = buttonElement.querySelector(this.selectors.expandAllLabel)

    if (labelElement) {
      labelElement.textContent = shouldExpand
        ? this.labels.collapseAll
        : this.labels.expandAll
    }

    this.rootElements.forEach((rootElement) => {
      this.toggleReport(rootElement, shouldExpand)
    })
  }

  openFromHash = () => {
    const targetId = location.hash.slice(1)

    if (!targetId) {
      return
    }

    const rootElement = document.getElementById(targetId)?.closest(this.selectors.root)

    if (!rootElement) {
      return
    }

    this.toggleReport(rootElement, true)
    requestAnimationFrame(() => {
      rootElement.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  }

  bindEvents() {
    document.querySelectorAll(this.selectors.expandAll).forEach((buttonElement) => {
      buttonElement.addEventListener('click', this.onExpandAllClick)
    })

    window.addEventListener('hashchange', this.openFromHash)
  }
}

export default InspectionAccordion
