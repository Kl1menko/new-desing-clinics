let liveRegionElement = null

export default function announce(message) {
  if (!liveRegionElement) {
    liveRegionElement = document.createElement('div')
    liveRegionElement.setAttribute('aria-live', 'polite')
    liveRegionElement.classList.add('visually-hidden')
    document.body.append(liveRegionElement)
  }

  liveRegionElement.textContent = message
}
