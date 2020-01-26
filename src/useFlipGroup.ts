import { useRef, useEffect, useLayoutEffect } from 'react'
import { UFG, Positions, Position, FlipElement } from './types'
import { DEFAULT_OPTIONS } from './const'
import { invertScale, invertXY, debounce } from './helpers'

export const useFlipGroup: UFG = ({
  flipId,
  deps,
  onTransitionEnd,
  opts = DEFAULT_OPTIONS,
  __TEST__ = false
}) => {
  const startPositions = useRef<Positions | null>(null)
  const parentPosition = useRef<Position | null>(null)
  const prevFlipId = useRef<string | null>(flipId)
  const prevDeps = useRef<any>(deps)
  const initialEl = document.getElementById(flipId)

  function saveChildrenPositions(parent: HTMLElement) {
    for (const child of parent.children as HTMLCollectionOf<
      FlipElement
    >) {
      if (child.dataset.id) {
        startPositions.current![child.dataset.id] = child.getBoundingClientRect()

        // Testing purposes
        if (__TEST__) {
          const testRoot = parent as any
          testRoot.getChildPosition(
            child.dataset.id,
            startPositions.current![child.dataset.id]
          )
        }
      }
    }
  }

  // Save initial positions
  if (initialEl && !parentPosition.current) {
    parentPosition.current = initialEl.getBoundingClientRect()
    startPositions.current = {}
    saveChildrenPositions(initialEl)
  }

  // Update parent positions on id change
  if (prevFlipId.current && prevFlipId.current !== flipId) {
    const el = document.getElementById(flipId)
    if (el) {
      parentPosition.current = el.getBoundingClientRect()
      saveChildrenPositions(el)
    }
  }

  const duration = opts.duration || DEFAULT_OPTIONS.duration
  const delay = opts.delay || DEFAULT_OPTIONS.delay
  const easing = opts.easing || DEFAULT_OPTIONS.easing
  const transformOrigin =
    opts.transformOrigin || DEFAULT_OPTIONS.transformOrigin

  // Remember previous flipId and deps
  useEffect(() => {
    prevFlipId.current = flipId
    prevDeps.current = deps
  })

  useLayoutEffect(() => {
    const el = document.getElementById(flipId)
    if (!el) return
    if (startPositions.current == null || parentPosition.current == null) return
    for (const child of el.children as HTMLCollectionOf<
      FlipElement
    >) {
      const childKey = child.dataset.id
      if (childKey) {
        if (startPositions.current[childKey]) {
          const currentPos = startPositions.current[childKey]
          const rect = child.getBoundingClientRect()
          const { scaleX, scaleY } = invertScale(currentPos, rect)
          const { translateX, translateY } = invertXY(currentPos, rect)

          startPositions.current[childKey] = rect

          child.style.transition = `0s`
          child.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
          child.style.transformOrigin = transformOrigin
        }
      }
    }
  }, [flipId, deps, transformOrigin])

  useEffect(() => {
    const el = document.getElementById(flipId)
    if (!el) return
    if (startPositions.current == null || parentPosition.current == null) return

    let firedOnce = false

    // Update saved DOM startPositions and invoke callback
    function onTransitionEndCb(e: TransitionEvent) {
      if (!firedOnce) {
        firedOnce = true
        if (onTransitionEnd) {
          onTransitionEnd()
        }
      }
    }

    for (const child of el.children as HTMLCollectionOf<
      FlipElement
    >) {

      let hasTransformsApplied
      const childKey = child.dataset.id

      if (__TEST__) {
        hasTransformsApplied = true
      } else {
        hasTransformsApplied =
          window.getComputedStyle(child).getPropertyValue('transform') !==
          'none'
      }

      if (childKey && hasTransformsApplied) {
        child.style.transform = ``
        child.style.transition = `
          transform ${duration}ms ${easing} ${delay}ms
        `
      }
    }

    el.addEventListener('transitionend', onTransitionEndCb)
    return () =>
      el.removeEventListener('transitionend', onTransitionEndCb)
  }, [flipId, deps, onTransitionEnd, duration, easing, delay, __TEST__])

  useEffect(() => {
    const el = document.getElementById(flipId)
    if (!el) return
    if (startPositions.current == null) return

    const onResize = debounce(() => {
      if (!el || startPositions.current == null) return

      const children = el.children as HTMLCollectionOf<
        FlipElement
      >
      for (const child of children) {
        const key = child.dataset.id

        if (!key) return

        startPositions.current[key] = child.getBoundingClientRect()
      }
    }, 500)

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [flipId])
}
