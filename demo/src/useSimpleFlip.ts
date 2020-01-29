import { useRef, useEffect, useLayoutEffect } from 'react'
import * as Rematrix from 'rematrix'
import { Position, USF } from './types'
import { DEFAULT_OPTIONS } from './const'
import { invertScale, invertXY } from './helpers'
import { usePreserveScale } from './usePreserveScale'

const usePosition = (initialPosition: Position | null = null) => {
  const cachedPosition = useRef<Position | null>(initialPosition)
  return {
    isNull() {
      return cachedPosition.current == null
    },
    getPosition() {
      return cachedPosition.current
    },
    updatePosition(newPosition: Position) {
      cachedPosition.current = newPosition
    }
  }
}

export const useSimpleFlip: USF = ({
  flipId,
  flag,
  opts = DEFAULT_OPTIONS
}) => {
  const cachedPosition = usePosition()
  const prevFlipId = useRef<string | null>(flipId)
  const parentScale = useRef<any>(null)
  const inProgressRef = useRef<boolean>(false)

  const initialEl = document.getElementById(flipId)

  if (initialEl && cachedPosition.isNull()) {
    cachedPosition.updatePosition(initialEl.getBoundingClientRect())
  }

  if (prevFlipId.current && prevFlipId.current !== flipId) {
    const el = document.getElementById(flipId)
    if (el) {
      cachedPosition.updatePosition(el.getBoundingClientRect())
    }
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
    if (cachedPosition.isNull()) return

    const rect = el.getBoundingClientRect()

    const compStyles = window.getComputedStyle(el)
    const matrix = Rematrix.fromString(compStyles.transform)

    const cachedPos = cachedPosition.getPosition() as Position

    // Get height/width of the currently applied style (getBCR gives wrong values)
    const appliedWidth = parseInt(compStyles.width, 10)
    const appliedHeight = parseInt(compStyles.height, 10)
    const appliedTop = parseInt(compStyles.top, 10)
    const appliedLeft = parseInt(compStyles.left, 10)

    const nextRect = {
      ...rect,
      width: appliedWidth,
      height: appliedHeight,
      top: appliedTop,
      left: appliedLeft
    }

    // Use cached positions (=previous "last") to calculate how much the element has transformed
    // and use that to calculate a reverse transform
    const { scaleX, scaleY } = invertScale(cachedPos, nextRect, matrix)
    const { translateX, translateY } = invertXY(cachedPos, nextRect, matrix)

    parentScale.current = { scaleX, scaleY }

    cachedPosition.updatePosition(nextRect)

    const tf = Rematrix.multiply(
      Rematrix.translate(translateX, translateY),
      Rematrix.scale(scaleX, scaleY)
    )

    el.style.transition = ``
    el.style.transform = Rematrix.toString(tf)
    el.style.transformOrigin = transformOrigin

    return
  }, [flipId, flag, cachedPosition, transformOrigin])

  useEffect(() => {
    const el = document.getElementById(flipId)
    if (!el) return
    if (cachedPosition.isNull()) return

    inProgressRef.current = true
    el.style.transform = ``
    el.style.transition = `transform ${duration}ms ${easing} ${delay}ms`
  }, [flipId, flag, delay, cachedPosition, easing, duration])

  usePreserveScale(flipId, parentScale, cachedPosition, flag)
}
