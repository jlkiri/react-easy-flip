import { useRef, useEffect, useLayoutEffect } from 'react'
import { Position, USF } from './types'
import { DEFAULT_OPTIONS } from './const'
import { invertScale, invertXY } from './helpers'

export const useSimpleFlip: USF = ({
  flipRef,
  flag,
  opts = DEFAULT_OPTIONS,
  __TEST__ = false
}) => {
  const positions = useRef<Position | null>(null)

  const transition = opts.transition || DEFAULT_OPTIONS.transition
  const delay = opts.delay || DEFAULT_OPTIONS.delay
  const easing = opts.easing || DEFAULT_OPTIONS.easing
  const transformOrigin =
    opts.transformOrigin || DEFAULT_OPTIONS.transformOrigin

  useLayoutEffect(() => {
    if (flipRef.current == null) return
    positions.current = flipRef.current.getBoundingClientRect()
  }, [flipRef])

  useLayoutEffect(() => {
    if (positions.current == null || flipRef.current == null) return
    if (flag) {
      const rect = flipRef.current.getBoundingClientRect()
      const { scaleX, scaleY } = invertScale(positions.current, rect)
      const { translateX, translateY } = invertXY(positions.current, rect)
      flipRef.current.style.transform = `
        translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
      flipRef.current.style.transformOrigin = transformOrigin
    }
  }, [flipRef, flag, transformOrigin])

  useEffect(() => {
    if (flipRef.current == null) return
    if (flag) {
      flipRef.current.style.transform = ``
      flipRef.current.style.transition = `all ${transition}ms ${easing} ${delay}ms`
    }
  }, [flipRef, flag, delay, easing, transition])
}
