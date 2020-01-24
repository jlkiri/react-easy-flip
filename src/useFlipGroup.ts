import { useRef, useEffect, useLayoutEffect } from 'react'
import { UFG, Positions, FlipElement } from './types'
import { DEFAULT_OPTIONS } from './const'
import { invertScale, invertXY } from './helpers'

const debounce = function debounce<F extends (...args: any[]) => any>(
  cb: F,
  wait: number
) {
  let timer: any
  return function _debounce(...args: Parameters<F>) {
    clearTimeout(timer)
    timer = setTimeout(() => cb(...args), wait)
  }
}

export const useFlipGroup: UFG = ({
  flipRoot,
  deps,
  onTransitionEnd,
  opts = DEFAULT_OPTIONS,
  __TEST__ = false
}) => {
  const positions = useRef<Positions | null>(null)
  const oldDepsRef = useRef<any>(deps)

  const duration = opts.duration || DEFAULT_OPTIONS.duration
  const delay = opts.delay || DEFAULT_OPTIONS.delay
  const easing = opts.easing || DEFAULT_OPTIONS.easing
  const transformOrigin =
    opts.transformOrigin || DEFAULT_OPTIONS.transformOrigin

  // Remember old dependencies
  useEffect(() => {
    oldDepsRef.current = deps
  })

  useLayoutEffect(() => {
    if (flipRoot.current !== null && positions.current !== null) {
      for (const child of flipRoot.current.children as HTMLCollectionOf<
        FlipElement
      >) {
        if (child.dataset.id) {
          const currentPos = positions.current[child.dataset.id]
          const rect = child.getBoundingClientRect()
          const { scaleX, scaleY } = invertScale(currentPos, rect)
          const { translateX, translateY } = invertXY(currentPos, rect)
          child.style.transition = `0s`
          child.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
          child.style.transformOrigin = transformOrigin
        }
      }
    }
  }, [flipRoot, deps, transformOrigin])

  useLayoutEffect(() => {
    if (flipRoot.current == null) return

    positions.current = {}
    for (const child of flipRoot.current.children as HTMLCollectionOf<
      FlipElement
    >) {
      if (!child.dataset.id) continue
      positions.current[child.dataset.id] = child.getBoundingClientRect()

      // Testing purposes
      if (__TEST__) {
        const testRoot = flipRoot.current as any
        testRoot.getChildPosition(
          child.dataset.id,
          positions.current[child.dataset.id]
        )
      }
    }
  }, [flipRoot, __TEST__])

  useEffect(() => {
    if (flipRoot.current == null) return

    for (const child of flipRoot.current.children as HTMLCollectionOf<
      FlipElement
    >) {
      let hasTransformsApplied
      if (__TEST__) {
        hasTransformsApplied = true
      } else {
        hasTransformsApplied =
          window.getComputedStyle(child).getPropertyValue('transform') !==
          'none'
      }
      if (child.dataset.id && hasTransformsApplied) {
        child.style.transform = ``
        child.style.transition = `
          transform ${duration}ms ${easing} ${delay}ms,
          scale ${duration}ms ${easing} ${delay}ms
        `
      }
    }
  }, [flipRoot, delay, easing, duration, deps, __TEST__])

  useEffect(() => {
    if (flipRoot.current == null) return

    let firedOnce = false

    const rootClone = flipRoot.current

    // Update saved DOM positions and invoke callback
    function onTransitionEndCb(e: TransitionEvent) {
      if (!firedOnce) {
        firedOnce = true
        if (onTransitionEnd) {
          onTransitionEnd()
        }
      }

      const target = e.target as any
      // Only add listener to elements which have a data-id
      const targetKey = target.dataset!.id!
      if (!targetKey) return
      if (positions.current == null) return
      positions.current[targetKey] = target.getBoundingClientRect()
    }

    rootClone.addEventListener('transitionend', onTransitionEndCb)

    if (__TEST__) {
      const testRoot = flipRoot.current as any
      for (const child of testRoot.children as HTMLCollectionOf<FlipElement>) {
        positions.current![child.dataset.id!] = child.getBoundingClientRect()
      }
      testRoot.onTransitionEnd(positions.current)
    }

    return () =>
      rootClone.removeEventListener('transitionend', onTransitionEndCb)
  }, [flipRoot, deps, onTransitionEnd, __TEST__])

  useEffect(() => {
    if (!flipRoot.current) return

    const onResize = debounce(() => {
      if (flipRoot.current == null || positions.current == null) return

      const children = flipRoot.current.children as HTMLCollectionOf<
        FlipElement
      >
      for (const child of children) {
        const key = child.dataset.id

        if (!key) return

        positions.current[key] = child.getBoundingClientRect()
      }
    }, 500)

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [flipRoot])
}
