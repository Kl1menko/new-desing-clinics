import announce from '../helpers/announce.js'

/**
 * Фільтр «лише проблеми».
 *
 * З 65 індикаторів більшість — повний бал, тож те, заради чого
 * людина прийшла, губиться. Фільтр згортає звіт до відхилень.
 */
class IssuesFilter {
  selectors = {
    button: '[data-js-issues-filter]',
    count: '[data-js-issues-filter-count]',
    group: '[data-js-indicator-group]',
    groupToggle: '[data-js-indicator-group-toggle]',
    groupPanel: '[data-js-indicator-group-panel]',
    issueRow: '.indicators__row--warn, .indicators__row--fail',
  }

  stateClasses = {
    isFiltered: 'is-filtered',
    isOpen: 'is-open',
  }

  constructor() {
    document
      .querySelectorAll(this.selectors.button)
      .forEach((buttonElement) => this.initButton(buttonElement))
  }

  initButton(buttonElement) {
    const panelElement = document.querySelector(buttonElement.dataset.jsIssuesFilter)

    if (!panelElement) {
      return
    }

    const issuesCount = panelElement.querySelectorAll(this.selectors.issueRow).length

    // Немає що фільтрувати — ховаємо кнопку, а не показуємо порожній результат.
    if (!issuesCount) {
      buttonElement.hidden = true
      return
    }

    const countElement = buttonElement.querySelector(this.selectors.count)

    if (countElement) {
      countElement.textContent = String(issuesCount)
    }

    buttonElement.addEventListener('click', () => {
      const isFiltered = buttonElement.getAttribute('aria-pressed') !== 'true'

      buttonElement.setAttribute('aria-pressed', String(isFiltered))
      panelElement.classList.toggle(this.stateClasses.isFiltered, isFiltered)

      if (isFiltered) {
        this.openGroupsWithIssues(panelElement)
      }

      announce(
        isFiltered
          ? `Showing ${issuesCount} indicators below target`
          : 'Showing all indicators'
      )
    })
  }

  /**
   * При увімкненому фільтрі кожна вціліла група складається лише
   * з проблем — відкриваємо їх, щоб не змушувати клікати вдруге.
   */
  openGroupsWithIssues(panelElement) {
    panelElement.querySelectorAll(this.selectors.group).forEach((groupElement) => {
      const groupPanelElement = groupElement.querySelector(this.selectors.groupPanel)

      if (!groupPanelElement?.querySelector(this.selectors.issueRow)) {
        return
      }

      groupElement
        .querySelector(this.selectors.groupToggle)
        ?.setAttribute('aria-expanded', 'true')
      groupPanelElement.classList.add(this.stateClasses.isOpen)
      groupPanelElement.removeAttribute('inert')
    })
  }
}

export default IssuesFilter
