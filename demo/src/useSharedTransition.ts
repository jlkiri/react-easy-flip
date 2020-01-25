import { useRef, useEffect, useLayoutEffect } from 'react'
import { invertScale, invertXY } from './helpers'
import { DEFAULT_OPTIONS } from './const'
import { Position, UST } from './types'

const noop = () => { }

// TODO: Prevent children warp for BOTH useShared and useFlipGroup

export const useSharedElementTransition: UST = ({
  flipId,
  dep,
  onTransitionEnd,
  opts = DEFAULT_OPTIONS,
}) => {
  const positions = useRef<Position | null>(null)
  const childPos = useRef<Position | null>(null)
  const prevFlipId = useRef<string | null>(flipId)
  const isPlaying = useRef<boolean>(false)

  const initialEl = document.getElementById(flipId)

  if (initialEl && !positions.current) {
    positions.current = initialEl.getBoundingClientRect()
    childPos.current = initialEl.firstElementChild && initialEl.firstElementChild.getBoundingClientRect()
  }

  if (prevFlipId.current && prevFlipId.current !== flipId) {
    const el = document.getElementById(flipId)
    positions.current = el ? el.getBoundingClientRect() : null
    childPos.current = el ? el.children[0].getBoundingClientRect() : null
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
    if (positions.current == null) return

    const nextRect = el.getBoundingClientRect()
    const currentRect = positions.current
    positions.current = nextRect

    const { scaleX, scaleY } = invertScale(currentRect, nextRect)
    const { translateX, translateY } = invertXY(currentRect, nextRect)
    el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
    el.style.transformOrigin = transformOrigin;

    const child = el.firstElementChild as HTMLElement
    const rScaleX = 1 / scaleX
    const rScaleY = 1 / scaleY
    child.style.transform = `scale(${rScaleX}, ${rScaleY})`

  }, [flipId, dep, transformOrigin])

  useEffect(() => {
    let raf: any

    function onTransitionEndCb(this: any, e: any) {
      // Prevent handling of bubbled events from children
      if (e.target === this) {
        _onTransitionEnd()
        isPlaying.current = false
      } else {
        childPos.current = e.target.getBoundingClientRect()
      }
      cancelAnimationFrame(raf)
    }

    const el = document.getElementById(flipId)
    if (!el) return
    if (positions.current == null) return

    isPlaying.current = true

    el.style.transform = ``
    el.style.transition = `
      transform ${duration}ms ${easing} ${delay}ms
    `;

    function rescaleChild() {
      const nextRect = el!.getBoundingClientRect()
      const child = el!.children[0] as HTMLElement
      const { scaleX, scaleY } = invertScale(nextRect, positions.current!)
      const rScaleX = 1 / scaleX
      const rScaleY = 1 / scaleY
      child.style.transform = `scale(${rScaleX}, ${rScaleY})`
      requestAnimationFrame(rescaleChild)
    }

    raf = requestAnimationFrame(rescaleChild)

    el.addEventListener('transitionend', onTransitionEndCb)
    return () => {
      el.removeEventListener('transitionend', onTransitionEndCb)
      cancelAnimationFrame(raf)
    }
  }, [flipId, duration, easing, delay, _onTransitionEnd, dep])
}
