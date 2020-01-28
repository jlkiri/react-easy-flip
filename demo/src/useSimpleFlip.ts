import { useRef, useEffect, useLayoutEffect } from 'react'
import * as Rematrix from "rematrix";
import { Position, USF } from './types'
import { DEFAULT_OPTIONS } from './const'
import { invertScale, invertXY } from './helpers'
import { usePreserveScale } from './usePreserveScale'
import { start } from 'repl';

export const useSimpleFlip: USF = ({
  flipId,
  flag,
  opts = DEFAULT_OPTIONS
}) => {
  const startPosition = useRef<Position | null>(null)
  const prevPosition = useRef<Position | null>(null)
  const prevFlipId = useRef<string | null>(flipId)
  const parentScale = useRef<any>(null)
  const inProgressRef = useRef<boolean>(false)

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

    if (inProgressRef.current) {
      const compStyles = window.getComputedStyle(el);
      const tf = compStyles.transform;

      const matrix = Rematrix.fromString(tf);
      const cw = (startPosition.current.width * matrix[0]) / parseInt(compStyles.width, 10);
      const ch = (startPosition.current.height * matrix[5]) / parseInt(compStyles.height, 10);

      rect.width = parseInt(compStyles.width, 10);
      rect.height = parseInt(compStyles.height, 10);

      parentScale.current = { scaleX: cw, scaleY: ch }
      startPosition.current = rect
      const tfString = Rematrix.toString(Rematrix.scale(cw, ch));
      el.style.transition = ``;
      el.style.transform = tfString;
      return;
    }







    prevPosition.current = startPosition.current
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

    inProgressRef.current = true
    el.style.transform = ``
    el.style.transition = `transform ${duration}ms ${easing} ${delay}ms`
  }, [flipId, flag, delay, easing, duration])

  usePreserveScale(flipId, parentScale, startPosition, flag)
}
