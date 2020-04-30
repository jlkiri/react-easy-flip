import { Position } from './types'

export type Scale = ReturnType<typeof invertScale>

export function invertScale(
  rectA: Position,
  rectB: Position,
  matrix?: number[]
) {
  const modX = matrix ? matrix[0] : 1
  const modY = matrix ? matrix[5] : 1
  const scaleX = (rectA.width * modX) / Math.max(rectB.width, 0.001)
  const scaleY = (rectA.height * modY) / Math.max(rectB.height, 0.001)
  return { scaleX, scaleY }
}

export function invertXY(rectA: Position, rectB: Position, matrix?: number[]) {
  const modX = matrix ? matrix[12] : 0
  const modY = matrix ? matrix[13] : 0
  const translateX = rectA.left + modX - rectB.left
  const translateY = rectA.top + modY - rectB.top
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
