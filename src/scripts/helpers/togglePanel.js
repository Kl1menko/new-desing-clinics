export default function togglePanel(toggleElement, panelElement, isOpen) {
  if (!toggleElement || !panelElement) {
    return
  }

  toggleElement.setAttribute('aria-expanded', String(isOpen))
  panelElement.classList.toggle('is-open', isOpen)
  panelElement.toggleAttribute('inert', !isOpen)
}
