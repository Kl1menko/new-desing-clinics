import Header from './modules/Header.js'
import ScrollSpy from './modules/ScrollSpy.js'
import ScoreSummary from './modules/ScoreSummary.js'
import InspectionAccordion from './modules/InspectionAccordion.js'
import IssuesFilter from './modules/IssuesFilter.js'
import CopyToClipboard from './modules/CopyToClipboard.js'
import MobileBar from './modules/MobileBar.js'
import SpecialtyCombobox from './modules/SpecialtyCombobox.js'
import CountryRail from './modules/CountryRail.js'
import CatalogFilters from './modules/CatalogFilters.js'
import CountryPage from './modules/CountryPage.js'

function initApp() {
  new ScoreSummary()
  new Header()
  new ScrollSpy()
  new InspectionAccordion()
  new IssuesFilter()
  new CopyToClipboard()
  new MobileBar()

  new SpecialtyCombobox()
  new CountryRail()

  // сторінка країни рендериться з JSON — фільтри вмикаємо після рендеру
  const countryRoot = document.querySelector('[data-js-country-page]')

  if (countryRoot) {
    countryRoot.addEventListener('country:ready', () => new CatalogFilters(), { once: true })
    new CountryPage()
  } else {
    new CatalogFilters()
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}
