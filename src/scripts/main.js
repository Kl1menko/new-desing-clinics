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

function initApp() {
  // ScoreSummary — першим: акордеон і фільтр спираються на класи
  // стану, які він проставляє з розмітки.
  new ScoreSummary()
  new Header()
  new ScrollSpy()
  new InspectionAccordion()
  new IssuesFilter()
  new CopyToClipboard()
  new MobileBar()

  // Модулі головної. Кожен сам виходить, якщо його елементів
  // немає в розмітці, тож перевірка сторінки тут не потрібна.
  new SpecialtyCombobox()
  new CountryRail()
  new CatalogFilters()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}
