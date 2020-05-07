import { FlipID } from './useFlip'

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

export const isRunning = (animation: Animation) =>
  animation.playState === 'running'

export const isPaused = (animation: Animation) =>
  animation.playState === 'paused'

export const not = (bool: boolean) => !bool
export const empty = (obj: object) => Object.keys(obj).length === 0

export const getRect = (element: Element) => element.getBoundingClientRect()

export const getComputedBgColor = (element: Element) =>
  getComputedStyle(element).getPropertyValue('background-color')

export const getElementByFlipId = (flipId: FlipID) =>
  document.querySelector(`[data-flip-id=${flipId}]`)

export const getElementsByRootId = (rootId: string) =>
  document.querySelectorAll(`[data-flip-root-id=${rootId}]`)

export const getTranslateX = (cachedRect: DOMRect, nextRect: DOMRect) =>
  cachedRect.x - nextRect.x

export const getTranslateY = (cachedRect: DOMRect, nextRect: DOMRect) =>
  cachedRect.y - nextRect.y

export const getScaleX = (
  cachedRect: DOMRect | ClientRect,
  nextRect: DOMRect | ClientRect
) => cachedRect.width / Math.max(nextRect.width, 0.001)

export const getScaleY = (
  cachedRect: DOMRect | ClientRect,
  nextRect: DOMRect | ClientRect
) => cachedRect.height / Math.max(nextRect.height, 0.001)
