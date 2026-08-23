import { INDICATOR_STATES, getIndicatorState } from '../helpers/indicatorState.js'

/**
 * Рахує статуси індикаторів і зведення по сторінці.
 *
 * Джерело правди — розмітка: підсумок фізично не може розійтися
 * з таблицею, бо рахується з тих самих значень.
 */
class ScoreSummary {
  selectors = {
    score: '[data-js-score]',
    bar: '[data-js-score-bar]',
    summary: '[data-js-summary]',
    meterTrack: '[data-js-summary-meter]',
  }

  constructor() {
    this.scoreElements = [...document.querySelectorAll(this.selectors.score)]
    this.summaryElement = document.querySelector(this.selectors.summary)

    if (!this.scoreElements.length) {
      return
    }

    this.counts = this.applyStates()
    this.renderSummary()
  }

  /** Проставляє класи стану на клітинки й рядки, рахує підсумок. */
  applyStates() {
    const counts = { pass: 0, warn: 0, fail: 0, total: 0 }

    this.scoreElements.forEach((scoreElement) => {
      const [value, target] = scoreElement.dataset.jsScore.split('/').map(Number)

      if (!Number.isFinite(value) || !Number.isFinite(target) || target === 0) {
        return
      }

      const ratio = value / target
      const state = getIndicatorState(ratio)

      scoreElement.classList.add(`score--${state}`)
      // Клас на рядку потрібен для лівої мітки й фільтра.
      scoreElement.closest('tr')?.classList.add(`indicators__row--${state}`)

      const barElement = scoreElement.querySelector(this.selectors.bar)

      if (barElement) {
        barElement.dataset.jsScoreBar = String(Math.round(ratio * 100))
      }

      counts[state] += 1
      counts.total += 1
    })

    return counts
  }

  setSummaryValue(name, value) {
    this.summaryElement
      .querySelectorAll(`[data-js-summary-${name}]`)
      .forEach((element) => {
        element.textContent = value
      })
  }

  renderSummary() {
    const { pass, warn, fail, total } = this.counts

    if (!this.summaryElement || !total) {
      return
    }

    const toPercent = (count) => (count / total) * 100

    this.setSummaryValue('total', total)
    this.setSummaryValue('pass', pass)
    this.setSummaryValue('warn', warn)
    this.setSummaryValue('fail', fail)
    this.setSummaryValue('below', warn + fail)
    this.setSummaryValue('rate', `${Math.round(toPercent(pass))}%`)

    requestAnimationFrame(() => {
      INDICATOR_STATES.forEach((state) => {
        const segmentElement = this.summaryElement.querySelector(
          `[data-js-summary-segment="${state}"]`
        )

        if (segmentElement) {
          segmentElement.style.width = `${toPercent(this.counts[state])}%`
        }
      })
    })

    const trackElement = this.summaryElement.querySelector(this.selectors.meterTrack)

    trackElement?.setAttribute(
      'aria-label',
      `${pass} of ${total} indicators fully met, ${warn} partially met, ${fail} below target`
    )
  }
}

export default ScoreSummary
