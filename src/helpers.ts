import { Position } from './types'

export function invertScale(rectA: Position, rectB: Position) {
  const scaleX = rectA.width / rectB.width
  const scaleY = rectA.height / rectB.height
  return { scaleX, scaleY }
}

export function invertXY(rectA: Position, rectB: Position) {
  const translateX = rectA.left - rectB.left
  const translateY = rectA.top - rectB.top
  return { translateX, translateY }
}

export function debounce<F extends (...args: any[]) => any>(
  cb: F,
  wait: number
) {
  let timer: any
  return function _debounce(...args: Parameters<F>) {
    clearTimeout(timer)
    timer = setTimeout(() => cb(...args), wait)
  }
}
