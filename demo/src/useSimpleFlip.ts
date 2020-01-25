import { useRef, useEffect, useLayoutEffect } from 'react'
import { Position, USF } from './types'
import { DEFAULT_OPTIONS } from './const'
import { invertScale, invertXY } from './helpers'
import { usePreserveScale } from './usePreserveScale'

export const useSimpleFlip: USF = ({
  flipId,
  flag,
  opts = DEFAULT_OPTIONS
}) => {
  const startPosition = useRef<Position | null>(null)
  const prevFlipId = useRef<string | null>(flipId)
  const parentScale = useRef<any>(null)

  const initialEl = document.getElementById(flipId)

  if (initialEl && !startPosition.current) {
    startPosition.current = initialEl.getBoundingClientRect()
  }

  if (prevFlipId.current && prevFlipId.current !== flipId) {
    const el = document.getElementById(flipId)
    startPosition.current = el ? el.getBoundingClientRect() : null
  }

  const duration = opts.duration || DEFAULT_OPTIONS.duration
  const delay = opts.delay || DEFAULT_OPTIONS.delay
  const easing = opts.easing || DEFAULT_OPTIONS.easing
  const transformOrigin =
    opts.transformOrigin || DEFAULT_OPTIONS.transformOrigin

  useEffect(() => {
    prevFlipId.current = flipId
  })

  useLayoutEffect(() => {
    const el = document.getElementById(flipId)
    if (!el) return
    if (startPosition.current == null) return

    const rect = el.getBoundingClientRect()
    const { scaleX, scaleY } = invertScale(startPosition.current, rect)
    const { translateX, translateY } = invertXY(startPosition.current, rect)
    startPosition.current = rect

    parentScale.current = { scaleX, scaleY }

    el.style.transition = ``
    el.style.transform = `
        translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
    el.style.transformOrigin = transformOrigin
  }, [flipId, flag, transformOrigin])

  useEffect(() => {
    const el = document.getElementById(flipId)
    if (!el) return
    if (startPosition.current == null) return

    el.style.transform = ``
    el.style.transition = `transform ${duration}ms ${easing} ${delay}ms`
  }, [flipId, flag, delay, easing, duration])

  usePreserveScale(flipId, parentScale, startPosition, flag)
}
