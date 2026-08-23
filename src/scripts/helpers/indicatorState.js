/**
 * Один поріг для всього проєкту: і таблиця, і зведення, і фільтр
 * мають однаково відповідати на питання «це проблема чи ні».
 */
export const INDICATOR_STATES = ['pass', 'warn', 'fail']

const PASS_RATIO = 1
const WARN_RATIO = 0.8

export function getIndicatorState(ratio) {
  if (ratio >= PASS_RATIO) {
    return 'pass'
  }

  return ratio >= WARN_RATIO ? 'warn' : 'fail'
}
