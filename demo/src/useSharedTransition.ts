import { useRef, useEffect, useLayoutEffect } from 'react'
import { invertScale, invertXY } from './helpers'
import { DEFAULT_OPTIONS } from './const'
import { Position, UST } from './types'
import { usePreserveScale } from './usePreserveScale'
import { usePosition } from './usePosition'

const noop = () => { }

export const useSharedElementTransition: UST = ({
  flipId,
  dep,
  onTransitionEnd,
  opts = DEFAULT_OPTIONS
}) => {
  const cachedPosition = usePosition()
  const prevFlipId = useRef<string | null>(flipId)
  const parentScale = useRef<any>(null)

  const initialEl = document.getElementById(flipId)

  if (initialEl && cachedPosition.isNull()) {
    cachedPosition.updatePosition(initialEl.getBoundingClientRect())
  }

  if (prevFlipId.current && prevFlipId.current !== flipId) {
    const el = document.getElementById(flipId)
    if (el) {
      cachedPosition.updatePosition(el.getBoundingClientRect())
    }
  }

  const duration = opts.duration || DEFAULT_OPTIONS.duration
  const delay = opts.delay || DEFAULT_OPTIONS.delay
  const easing = opts.easing || DEFAULT_OPTIONS.easing
  const transformOrigin =
    opts.transformOrigin || DEFAULT_OPTIONS.transformOrigin

  const _onTransitionEnd = onTransitionEnd ? onTransitionEnd : noop

  useEffect(() => {
    prevFlipId.current = flipId
  })

  useLayoutEffect(() => {
    const el = document.getElementById(flipId)
    if (!el) return
    if (cachedPosition.isNull()) return

    const targetRect = el.getBoundingClientRect()
    const startRect = cachedPosition.getPosition() as Position
    cachedPosition.updatePosition(targetRect)

    const { scaleX, scaleY } = invertScale(startRect, targetRect)

    // Save scale values of a parent to be used by usePreserveScale hook
    parentScale.current = { scaleX, scaleY }

    const { translateX, translateY } = invertXY(startRect, targetRect)
    el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
    el.style.transformOrigin = transformOrigin
  }, [flipId, dep, cachedPosition, transformOrigin])

  useEffect(() => {
    let raf: any

    function onTransitionEndCb(this: any, e: any) {
      // Prevent handling of bubbled events from children
      if (e.target === this) {
        _onTransitionEnd()
      }
      cancelAnimationFrame(raf)
    }

    const el = document.getElementById(flipId)
    if (!el) return
    if (cachedPosition.isNull()) return

    el.style.transform = ``
    el.style.transition = `
      transform ${duration}ms ${easing} ${delay}ms
    `

    el.addEventListener('transitionend', onTransitionEndCb)
    return () => {
      el.removeEventListener('transitionend', onTransitionEndCb)
      cancelAnimationFrame(raf)
    }
  }, [flipId, duration, easing, delay, cachedPosition, _onTransitionEnd, dep])

  // Prevent distortion of children by adjusting their scale
  usePreserveScale(flipId, parentScale, cachedPosition, dep)
}
