import { useRef, useEffect, useLayoutEffect } from 'react'
import * as Rematrix from 'rematrix'
import { Position, USF } from './types'
import { DEFAULT_OPTIONS } from './const'
import { invertScale, invertXY, Scale } from './helpers'
import { usePreserveScale } from './usePreserveScale'
import { usePosition } from './usePosition'

const noop = () => {}

// cf. https://github.com/aholachek/react-flip-toolkit/blob/a9f2c75584773b16c9e291f9caa0070247a99744/packages/react-flip-toolkit/src/FlipToolkit/flip/animateFlippedElements/index.ts
export const convertMatrix3dArrayTo2dArray = (matrix: any): any =>
  [0, 1, 4, 5, 12, 13].map((index) => matrix[index])

export const convertMatrix2dArrayToString = (matrix: any) =>
  `matrix(${matrix.join(', ')})`

export const useSimpleFlip: USF = ({
  flipId,
  flag,
  onTransitionEnd,
  isShared = false,
  opts = DEFAULT_OPTIONS
}) => {
  const cachedPosition = usePosition()
  const cachedTransform = useRef<string | null>(null)
  const prevFlipId = useRef<string | null>(flipId)
  const parentScale = useRef<Scale | null>(null)
  const isPlaying = useRef<boolean>(false)

  const initialEl = document.getElementById(flipId)

  const _onTransitionEnd = onTransitionEnd ? onTransitionEnd : noop

  if (initialEl && cachedPosition.isNull()) {
    cachedPosition.updatePosition(initialEl.getBoundingClientRect())
  }

  if (prevFlipId.current && prevFlipId.current !== flipId) {
    const el = document.getElementById(flipId)
    if (el) {
      cachedPosition.updatePosition(el.getBoundingClientRect())
    }
  }

  if (initialEl && isShared) {
    cachedTransform.current = window
      .getComputedStyle(initialEl!)
      .getPropertyValue('transform')
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
    const shouldUseCachedTransform = isPlaying.current && isShared

    const matrix = Rematrix.fromString(
      shouldUseCachedTransform ? cachedTransform.current : compStyles.transform
    )

    const cachedPos = cachedPosition.getPosition() as Position

    // Get height/width of the currently applied style (getBCR gives wrong values?)
    const appliedWidth = isShared
      ? parseInt(compStyles.width!, 10)
      : Math.max(rect.width / matrix[0], 0.001)
    const appliedHeight = isShared
      ? parseInt(compStyles.height!, 10)
      : Math.max(rect.height / matrix[5], 0.001)
    const appliedTop = rect.top - matrix[13]
    const appliedLeft = rect.left - matrix[12]

    const nextRect = {
      ...rect,
      width: appliedWidth,
      height: appliedHeight,
      top: isShared ? rect.top : appliedTop,
      left: isShared ? rect.left : appliedLeft
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

    // Invert
    el.style.transition = ``
    el.style.transform = convertMatrix2dArrayToString(
      convertMatrix3dArrayTo2dArray(tf)
    )
    el.style.transformOrigin = transformOrigin

    isPlaying.current = true

    return
  }, [flipId, flag, cachedPosition, isShared, transformOrigin])

  useEffect(() => {
    const el = document.getElementById(flipId)
    if (!el) return

    function onTransitionEndCb(this: any, e: any) {
      // Prevent handling of bubbled events from children
      if (e.target === this) {
        isPlaying.current = false
        _onTransitionEnd()
      }
    }

    // Play
    // Double rAF is a hack for Firefox (not needed in Chrome at all)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = ``
        el.style.transition = `transform ${duration}ms ${easing} ${delay}ms`
      })
    })

    el.addEventListener('transitionend', onTransitionEndCb)
    return () => el.removeEventListener('transitionend', onTransitionEndCb)
  }, [flipId, flag, delay, _onTransitionEnd, easing, duration])

  usePreserveScale(flipId, parentScale, cachedPosition, flag, isPlaying)
}
