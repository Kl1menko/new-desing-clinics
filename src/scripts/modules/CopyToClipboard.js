class CopyToClipboard {
  selectors = {
    button: '[data-js-copy]',
    toast: '[data-js-toast]',
    toastText: '[data-js-toast-text]',
  }

  stateClasses = {
    isCopied: 'is-copied',
    isVisible: 'is-visible',
  }

  toastDuration = 2200
  resetDuration = 1600

  constructor() {
    this.buttonElements = [...document.querySelectorAll(this.selectors.button)]

    if (!this.buttonElements.length) {
      return
    }

    this.toastElement = document.querySelector(this.selectors.toast)
    this.toastTimerId = null

    this.bindEvents()
  }

  async copyText(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return this.copyTextFallback(text)
    }
  }

  copyTextFallback(text) {
    const fieldElement = document.createElement('textarea')

    fieldElement.value = text
    fieldElement.setAttribute('readonly', '')
    fieldElement.style.position = 'fixed'
    fieldElement.style.opacity = '0'
    document.body.append(fieldElement)
    fieldElement.select()

    let isCopied = false

    try {
      isCopied = document.execCommand('copy')
    } catch {
      isCopied = false
    }

    fieldElement.remove()

    return isCopied
  }

  showToast(message) {
    if (!this.toastElement) {
      return
    }

    const textElement = this.toastElement.querySelector(this.selectors.toastText)

    if (textElement) {
      textElement.textContent = message
    }

    this.toastElement.classList.add(this.stateClasses.isVisible)

    clearTimeout(this.toastTimerId)
    this.toastTimerId = setTimeout(() => {
      this.toastElement.classList.remove(this.stateClasses.isVisible)
    }, this.toastDuration)
  }

  onButtonClick = async (event) => {
    const buttonElement = event.currentTarget
    const { jsCopy: value, jsCopyLabel: label = 'value' } = buttonElement.dataset

    const isCopied = await this.copyText(value)

    if (!isCopied) {
      this.showToast('Could not copy — please copy manually')
      return
    }

    buttonElement.classList.add(this.stateClasses.isCopied)
    this.showToast(`Copied ${label}`)

    setTimeout(() => {
      buttonElement.classList.remove(this.stateClasses.isCopied)
    }, this.resetDuration)
  }

  bindEvents() {
    this.buttonElements.forEach((buttonElement) => {
      buttonElement.addEventListener('click', this.onButtonClick)
    })
  }
}

export default CopyToClipboard
