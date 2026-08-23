/**
 * Горизонтальна стрічка країн.
 *
 * Гортання пальцем працює нативно; кнопки потрібні лише там, де
 * вказівник, тому вмикаються з lg. Стан кнопок відображає, чи є
 * куди їхати — «мертві» кнопки на краях збивають з пантелику.
 */
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

    // Перший вимір — після розкладки: на момент конструктора
    // картки ще можуть не мати остаточної ширини, і кнопка
    // «назад» лишалась активною на самому початку стрічки.
    requestAnimationFrame(this.updateButtons)
  }

  /** Крок прокрутки — ширина картки з проміжком. */
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

    // Стрічка має лівий padding для вирівнювання по контейнеру, і
    // браузер стартує вже прокрученим на цю величину — інакше
    // кнопка «назад» лишалась активною на самому початку.
    const startOffset = parseFloat(getComputedStyle(this.trackElement).paddingLeft) || 0

    // Допуск 2px: субпіксельні розміри інакше лишають кнопку
    // активною в самому кінці стрічки.
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
