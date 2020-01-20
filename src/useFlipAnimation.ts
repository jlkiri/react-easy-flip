import { useRef, useEffect, useLayoutEffect } from 'react'
import { UFAHook, UFAHookOptions, FlipElement } from './types'

const DEFAULT_OPTIONS: UFAHookOptions = {
  transition: 500,
  delay: 0,
  easing: 'ease'
}

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

export const useFlipAnimation: UFAHook = ({
  root,
  deps,
  opts = DEFAULT_OPTIONS,
  __TEST__
}) => {
  const childCoords = useRef({ refs: Object.create(null) })

  const transition = opts.transition || DEFAULT_OPTIONS.transition
  const delay = opts.delay || DEFAULT_OPTIONS.delay
  const easing = opts.easing || DEFAULT_OPTIONS.easing

  // Save initial positions
  useLayoutEffect(() => {
    if (!root.current) return

    const children = root.current.children

    if (!children) return
    if (children.length < 1) return

    for (const child of children as HTMLCollectionOf<FlipElement>) {
      const key = child.dataset.id

      if (!key) return

      if (!child.inFlight) {
        childCoords.current.refs[key] = child.getBoundingClientRect()
      }

      // Testing purposes
      if (__TEST__) {
        const testRoot = root.current as any
        testRoot.getChildPosition(key, childCoords.current.refs[key])
      }
    }
  }, [root, __TEST__])

  useEffect(() => {
    if (!root.current) return

    const onResize = debounce(() => {
      if (!root.current) return

      const children = root.current.children as HTMLCollectionOf<FlipElement>
      for (const child of children) {
        const key = child.dataset.id

        if (!key) return

        childCoords.current.refs[key] = child.getBoundingClientRect()
      }
    }, 500)

    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [root])

  useEffect(() => {
    if (!root.current) return

    const rootClone = root.current

    // eslint-disable-next-line

    // Update saved DOM position on transition end to prevent
    // "in-flight" positions saved as previous
    function onTransitionEnd(e: TransitionEvent) {
      const target = e.target as FlipElement
      // Event is added only to elements which have id in their dataset
      const targetKey = target.dataset!.id!
      childCoords.current.refs[targetKey] = target.getBoundingClientRect()
      target.inFlight = false
    }

    rootClone.addEventListener('transitionend', onTransitionEnd)

    if (__TEST__) {
      const testRoot = root.current as any
      for (const child of testRoot.children) {
        childCoords.current.refs[
          child.dataset.id
        ] = child.getBoundingClientRect()
      }
      testRoot.onTransitionEnd(childCoords.current.refs)
    }

    return () => rootClone.removeEventListener('transitionend', onTransitionEnd)
  }, [root, deps, __TEST__])

  useEffect(() => {
    if (!root.current) return

    function play(elem: FlipElement) {
      elem.style.transform = ``
      elem.style.transition = `transform ${transition}ms ${easing} ${delay}ms`
      elem.inFlight = true
    }

    function invert(elem: FlipElement) {
      return function _invert({ dx, dy }: { dx: number; dy: number }) {
        elem.style.transform = `translate(${dx}px, ${dy}px)`
        elem.style.transition = `transform 0s`
      }
    }

    const children = root.current.children as HTMLCollectionOf<FlipElement>

    if (children.length < 1) return

    // Clone ref content because it is updated faster than rAF executes
    const childCoordCopy = { ...childCoords.current.refs }

    for (const child of children) {
      requestAnimationFrame(() => {
        const key = child.dataset.id

        if (!key) return

        if (key in childCoordCopy) {
          const coords = childCoordCopy[key]
          const rect = child.getBoundingClientRect()

          // Calculate delta of old and new DOM positions for transform
          const prevX = coords.left
          const prevY = coords.top

          const nextX = rect.left
          const nextY = rect.top

          const deltaX = prevX - nextX
          const deltaY = prevY - nextY

          invert(child)({ dx: deltaX, dy: deltaY })

          requestAnimationFrame(() => play(child))
        }
      })
    }
  }, [deps, transition, delay, easing, root])
}
