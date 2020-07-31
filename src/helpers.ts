import { FlipID, FlipHtmlElement } from './useFlip'

export interface FlipKeyframeEffectOptions extends KeyframeEffectOptions {
  staggerStep?: number
  stagger?: number
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

export const isRunning = (animation: Animation) =>
  animation.playState === 'running'

export const isPaused = (animation: Animation) =>
  animation.playState === 'paused'

export const not = (bool: boolean) => !bool
export const emptyMap = (map: Map<any, any>) => map.size === 0

export const getRect = (element: Element) => element.getBoundingClientRect()

export const getFlipId = (el: Element & FlipHtmlElement) => el.dataset.flipId

export const getElementByFlipId = (flipId: FlipID) =>
  document.querySelector(`[data-flip-id=${flipId}]`) as FlipHtmlElement

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

export const createAnimation = (
  element: FlipHtmlElement,
  keyframes: Keyframe[],
  options: FlipKeyframeEffectOptions
) => {
  const { duration, delay = 0, stagger = 0, staggerStep = 0 } = options
  const effect = new KeyframeEffect(element, keyframes, {
    duration,
    easing: 'linear',
    delay: delay + stagger * staggerStep,
    fill: 'both'
  })

  // TODO: figure out what to do when position must be updated after animation
  // e.g. class has actually changed
  return new Animation(effect, document.timeline)
}
