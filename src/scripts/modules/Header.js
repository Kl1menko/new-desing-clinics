/**
 * Шапка сайту: тінь при скролі, бургер-меню, випадайка «More».
 */
class Header {
  selectors = {
    root: '[data-js-header]',
    burger: '[data-js-header-burger]',
    drawer: '[data-js-header-drawer]',
    close: '[data-js-header-close]',
    dropdown: '[data-js-header-dropdown]',
    dropdownButton: '[data-js-header-dropdown-button]',
    dropdownPanel: '[data-js-header-dropdown-panel]',
  }

  stateClasses = {
    isStuck: 'is-stuck',
    isOpen: 'is-open',
    isLock: 'is-lock',
  }

  // Скільки пікселів треба проскролити, щоб шапка «відірвалась».
  scrollOffset = 4

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root)

    if (!this.rootElement) {
      return
    }

    this.burgerElement = document.querySelector(this.selectors.burger)
    this.drawerElement = document.querySelector(this.selectors.drawer)
    this.closeElement = document.querySelector(this.selectors.close)
    this.desktopMedia = window.matchMedia('(min-width: 1024px)')

    this.bindEvents()
    this.onScroll()
  }

  get isMenuOpen() {
    return this.burgerElement?.getAttribute('aria-expanded') === 'true'
  }

  toggleMenu(isOpen, { shouldRestoreFocus = true } = {}) {
    if (!this.burgerElement || !this.drawerElement) {
      return
    }

    this.burgerElement.setAttribute('aria-expanded', String(isOpen))
    this.drawerElement.classList.toggle(this.stateClasses.isOpen, isOpen)
    // Сторінка під панеллю не має скролитись.
    document.documentElement.classList.toggle(this.stateClasses.isLock, isOpen)

    // Фокус їде всередину панелі, а на закритті повертається на
    // бургер — інакше клавіатурний користувач губить місце.
    //
    // visibility анімується разом із панеллю, тож поки перехід
    // не завершився, елемент фокус не приймає і виклик тихо
    // нічого не робить. Чекаємо кінця переходу.
    if (isOpen) {
      this.drawerElement.addEventListener(
        'transitionend',
        () => this.closeElement?.focus(),
        { once: true }
      )
    } else if (shouldRestoreFocus) {
      this.burgerElement?.focus()
    }
  }

  onScroll = () => {
    this.rootElement.classList.toggle(
      this.stateClasses.isStuck,
      window.scrollY > this.scrollOffset
    )
  }

  onBurgerClick = () => {
    this.toggleMenu(!this.isMenuOpen)
  }

  onCloseClick = () => {
    this.toggleMenu(false)
  }

  onDrawerClick = (event) => {
    // Клік по логотипу чи пункту меню веде на іншу сторінку —
    // повертати фокус на бургер немає сенсу.
    if (event.target.closest('a')) {
      this.toggleMenu(false, { shouldRestoreFocus: false })
    }
  }

  onDocumentKeydown = (event) => {
    if (event.key === 'Escape' && this.isMenuOpen) {
      this.toggleMenu(false)
    }
  }

  onDesktopMediaChange = (event) => {
    if (event.matches) {
      this.toggleMenu(false, { shouldRestoreFocus: false })
    }
  }

  bindEvents() {
    window.addEventListener('scroll', this.onScroll, { passive: true })
    document.addEventListener('keydown', this.onDocumentKeydown)

    this.burgerElement?.addEventListener('click', this.onBurgerClick)
    this.closeElement?.addEventListener('click', this.onCloseClick)
    this.drawerElement?.addEventListener('click', this.onDrawerClick)
    this.desktopMedia.addEventListener('change', this.onDesktopMediaChange)

    this.bindDropdowns()
  }

  /**
   * Випадайка «More». Закривається кліком назовні, Escape
   * і виходом фокуса — щоб не лишалась відкритою випадково.
   */
  bindDropdowns() {
    document.querySelectorAll(this.selectors.dropdown).forEach((dropdownElement) => {
      const buttonElement = dropdownElement.querySelector(this.selectors.dropdownButton)
      const panelElement = dropdownElement.querySelector(this.selectors.dropdownPanel)

      if (!buttonElement || !panelElement) {
        return
      }

      const toggleDropdown = (isOpen) => {
        buttonElement.setAttribute('aria-expanded', String(isOpen))
        panelElement.classList.toggle(this.stateClasses.isOpen, isOpen)
      }

      buttonElement.addEventListener('click', (event) => {
        event.stopPropagation()
        toggleDropdown(buttonElement.getAttribute('aria-expanded') !== 'true')
      })

      document.addEventListener('click', (event) => {
        if (!dropdownElement.contains(event.target)) {
          toggleDropdown(false)
        }
      })

      dropdownElement.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          toggleDropdown(false)
          buttonElement.focus()
        }
      })

      dropdownElement.addEventListener('focusout', () => {
        requestAnimationFrame(() => {
          if (!dropdownElement.contains(document.activeElement)) {
            toggleDropdown(false)
          }
        })
      })
    })
  }
}

export default Header
