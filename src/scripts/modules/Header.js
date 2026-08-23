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
    document.documentElement.classList.toggle(this.stateClasses.isLock, isOpen)

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
