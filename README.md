# WhatClinicSafe — редизайн

Редизайн трьох сторінок: головна, каталог країни, картка закладу.
Семантичний HTML, SCSS (BEM), vanilla JS. Без фреймворків.

## Сторінки

| Файл | Що це |
|---|---|
| `home.html` | Головна: пошук, стрічка країн, джерела даних |
| `country.html` | Каталог закладів країни з фільтрами (демо: Японія) |
| `index.html` | Картка закладу з інспекційними звітами (демо: AZ Oudenaarde) |

Локально сторінки зв'язані між собою прямими посиланнями на файли.

## Запуск

```bash
npm install
npm run build     # HTML + мініфікований CSS
npm run serve     # http://localhost:4173
```

## Розробка

```bash
npm run watch     # автозбірка SCSS
npm run html      # перегенерувати HTML з даних
npm run css       # CSS без мініфікації
```

## Структура

```
src/
  styles/
    base/       normalize, globals, utils
    helpers/    variables (токени), media, mixins
    blocks/     компоненти в BEM
    main.scss
  scripts/
    modules/    UI-модулі класами
    helpers/    дрібні утиліти
    main.js
.build/         генератори сторінок + дані (JSON)
assets/         логотипи, фото країн, іконки
dist/main.css   зібраний CSS
```

HTML генерується з `.build/*.json` через Python-скрипти: сторінка
закладу має ~65 індикаторів, каталог — картки й фільтри. Правити
треба дані, не розмітку.

## Що потребує заміни перед продакшном

- **Контакти клініки** в `index.html` (адреса, телефон, сайт) — плейсхолдери
- **Фото клініки** `assets/images/clinic-*.webp` — не AZ Oudenaarde
- **Кількість закладів** у картках країн — вигадані числа
- **Дані каталогу** `.build/country-data.json` — демо-набір із 9 закладів
- **Список спеціальностей** — 20 позицій замість повних ~300
- **Атрибуція фото** країн з Wikimedia (CC BY-SA) — див.
  `assets/images/countries/CREDITS.md`, зараз на сторінці її немає

## Ліцензії зображень

Фото країн Belgium / Germany / Spain / Thailand — Wikimedia Commons
під CC BY-SA. Умови вимагають видимої атрибуції на сторінці.
