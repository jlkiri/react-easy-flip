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
  const currChildren = useRef<HTMLCollection | null>(null)
  const prevFlipId = useRef<string | null>(flipId)

  const initialEl = document.getElementById(flipId)
  if (initialEl && !positions.current) {
    positions.current = initialEl.getBoundingClientRect()
    currChildren.current = initialEl.children
  }

  console.log(positions.current)

  if (prevFlipId.current && prevFlipId.current !== flipId) {
    const el = document.getElementById(flipId)
    positions.current = el ? el.getBoundingClientRect() : null
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
    // const antiDistortionContainer = document.createElement('div');
    const nextChildren = el.children as HTMLCollectionOf<HTMLElement>
    const currentRect = positions.current
    positions.current = nextRect

    const { scaleX, scaleY } = invertScale(currentRect, nextRect)
    const { translateX, translateY } = invertXY(currentRect, nextRect)
    el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
    el.style.transformOrigin = transformOrigin

    if (currChildren.current) {
      for (const child of currChildren.current as HTMLCollectionOf<HTMLElement>) {
        const nextChild = Array.from(nextChildren).find(c => c.dataset.reverseId === child.dataset.reverseId)
        if (nextChild) {
          // const { scaleX, scaleY } = invertScale(child.get, nextChild)
          const { translateX, translateY } = invertXY(currentRect, nextRect)
        }
        // child.style.transform = `scale(${-scaleX}, ${scaleY})``
      }
    }

  }, [flipId, dep, transformOrigin])

  useEffect(() => {
    function onTransitionEndCb(e: any) {
      positions.current = e.target.getBoundingClientRect()
      _onTransitionEnd()
    }

    const el = document.getElementById(flipId)
    if (!el) return
    if (positions.current == null) return

    el.style.transform = ``
    el.style.transition = `
        transform ${ duration} ms ${easing} ${delay} ms,
          scale ${ duration} ms ${easing} ${delay} ms
            `

    const children = el.children

    for (const child of children as HTMLCollectionOf<HTMLElement>) {
      child.style.transform = ``
      child.style.transition = `
        scale ${ duration} ms ${easing} ${delay} ms
          `
    }

    el.addEventListener('transitionend', onTransitionEndCb)
    return () => el.removeEventListener('transitionend', onTransitionEndCb)
  }, [flipId, duration, easing, delay, _onTransitionEnd, dep])
}
