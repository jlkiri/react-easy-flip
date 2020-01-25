import { useRef, useEffect, useLayoutEffect } from 'react'
import { invertScale, invertXY } from './helpers'
import { Position } from './types'

type UST = (...args: any) => any

export const useSharedElementTransition: UST = (
  flipId,
  dep,
  onTransitionEnd
) => {
  const positions = useRef<Position | null>()
  const initialEl = document.getElementById(flipId)
  if (initialEl && !positions.current)
    positions.current = initialEl.getBoundingClientRect()

  useLayoutEffect(() => {
    const el = document.getElementById(flipId)
    if (!el) return
    if (positions.current == null) return

    const first = positions.current
    const last = el.getBoundingClientRect()

    const { scaleX, scaleY } = invertScale(first, last)
    const { translateX, translateY } = invertXY(first, last)
    el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
    el.style.transformOrigin = 'top left'
  }, [flipId, dep])

  useEffect(() => {
    console.log(flipId)
    function onTransitionEndCb(e: any) {
      positions.current = e.target.getBoundingClientRect()
      onTransitionEnd()
    }

    const el = document.getElementById(flipId)
    if (!el) return
    if (positions.current == null) return
    console.log('play phase')

    el.style.transform = ``
    el.style.transition = `3s`
    el.addEventListener('transitionend', onTransitionEndCb)
  }, [flipId, onTransitionEnd, dep])
}