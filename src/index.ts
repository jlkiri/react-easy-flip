import { useRef, useEffect, useLayoutEffect } from 'react'
import { UFAHook, UFAHookOptions, IElement } from './types'

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

const useFlipAnimation: UFAHook = ({
  root,
  deps,
  opts = DEFAULT_OPTIONS,
  __TEST__
} = {}) => {
  const childCoords = useRef({ refs: Object.create(null) })

  const transition = opts.transition || DEFAULT_OPTIONS.transition
  const delay = opts.delay || DEFAULT_OPTIONS.delay
  const easing = opts.easing || DEFAULT_OPTIONS.easing

  const reportPosition = () => {}

  useEffect(() => {
    if (!root || !root.current) return

    const rootClone = root.current

    // Update saved DOM position on transition end to prevent
    // "in-flight" positions saved as previous
    const onTransitionEnd = function onTransitionEnd(e: TransitionEvent) {
      const target = e.target as IElement
      // Event is added only to elements which have id in their dataset
      const targetKey = target.dataset!.id!
      childCoords.current.refs[targetKey] = target.getBoundingClientRect()
      target.inFlight = false
    }

    rootClone.addEventListener('transitionend', onTransitionEnd)

    // Testing purposes
    if (__TEST__) {
      Array.from(rootClone.children).forEach((child) => {
        const _child = child as IElement
        _child.reportPosition = _child.reportPosition || reportPosition
        const key = _child.dataset.id!
        _child.reportPosition({
          [key]: childCoords.current.refs[key]
        })
      })
    }

    return () => rootClone.removeEventListener('transitionend', onTransitionEnd)
  }, [root, deps])

  useEffect(() => {
    if (!root || !root.current) return

    const onResize = debounce(() => {
      if (!root.current) return

      const children = root.current.children
      Array.from(children).forEach((child) => {
        const key = (child as IElement).dataset.id

        if (!key) return

        childCoords.current.refs[key] = child.getBoundingClientRect()
      })
    }, 500)

    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [root])

  useLayoutEffect(() => {
    if (!root || !root.current) return

    const play = function play(elem: IElement) {
      elem.style.transform = ``
      elem.style.transition = `transform ${transition}ms ${easing} ${delay}ms`
      elem.inFlight = true
    }

    const invert = function invert(elem: IElement) {
      return function _invert({ dx, dy }: { dx: number; dy: number }) {
        elem.style.transform = `translate(${dx}px, ${dy}px)`
        elem.style.transition = `transform 0s`
      }
    }

    const children = root.current.children

    if (children.length < 1) return

    // Clone ref content because it is updated faster than rAF executes
    const childCoordCopy = { ...childCoords.current.refs }

    requestAnimationFrame(() => {
      Array.from(children).forEach((child) => {
        const key = (child as IElement).dataset.id

        if (!key) return

        if (key in childCoordCopy) {
          const coords = childCoordCopy[key]

          // Calculate delta of old and new DOM positions for transform
          const prevX = coords.left
          const prevY = coords.top

          const nextX = child.getBoundingClientRect().left
          const nextY = child.getBoundingClientRect().top

          const deltaX = prevX - nextX
          const deltaY = prevY - nextY

          invert(child as IElement)({ dx: deltaX, dy: deltaY })

          requestAnimationFrame(() => play(child as IElement))
        }
      })
    })

    // Save new DOM positions
    Array.from(children).forEach((child) => {
      const key = (child as IElement).dataset.id

      if (!key) return

      if (!(child as IElement).inFlight) {
        childCoords.current.refs[key] = child.getBoundingClientRect()
      }
    })
  }, [deps, transition, delay, easing, root])
}

export default useFlipAnimation
