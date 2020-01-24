import { useRef, useEffect, useLayoutEffect } from 'react'
import { invertScale, invertXY } from './helpers'
import { DEFAULT_OPTIONS } from './const'
import { Position, UST } from './types'

const noop = () => { }

export const useSharedElementTransition: UST = ({
  flipId,
  dep,
  onTransitionEnd,
  opts = DEFAULT_OPTIONS,
}) => {
  const positions = useRef<Position | null>()
  const initialEl = document.getElementById(flipId.toString())
  if (initialEl && !positions.current)
    positions.current = initialEl.getBoundingClientRect()

  const duration = opts.duration || DEFAULT_OPTIONS.duration
  const delay = opts.delay || DEFAULT_OPTIONS.delay
  const easing = opts.easing || DEFAULT_OPTIONS.easing
  const transformOrigin =
    opts.transformOrigin || DEFAULT_OPTIONS.transformOrigin

  const _onTransitionEnd = onTransitionEnd ? onTransitionEnd : noop

  useLayoutEffect(() => {
    const el = document.getElementById(flipId)
    if (!el) return
    if (positions.current == null) return

    const nextRect = el.getBoundingClientRect()

    const { scaleX, scaleY } = invertScale(positions.current, nextRect)
    const { translateX, translateY } = invertXY(positions.current, nextRect)
    el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
    el.style.transformOrigin = 'top left'
  }, [flipId, dep])

  useEffect(() => {
    function onTransitionEndCb(e: any) {
      positions.current = e.target.getBoundingClientRect()
      _onTransitionEnd()
    }

    const el = document.getElementById(flipId)
    if (!el) return
    if (positions.current == null) return

    el.style.transform = ``
    el.style.transition = `3s`

    el.addEventListener('transitionend', onTransitionEndCb)
    return () => el.removeEventListener('transitionend', onTransitionEndCb)
  }, [flipId, _onTransitionEnd, dep])
}
