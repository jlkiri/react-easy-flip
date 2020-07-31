import * as React from 'react'
import { useLayoutEffect } from './useLayoutEffect'
import { FlipProvider, FlipContext } from './FlipProvider'
import {
  getElementByFlipId,
  emptyMap,
  getElementsByRootId,
  getTranslateY,
  getTranslateX,
  getScaleX,
  getScaleY,
  getRect,
  createAnimation
} from './helpers'
import { DEFAULT_DURATION, DEFAULT_DELAY } from './const'
import { createKeyframes } from './createKeyframes'
import { syncLayout, useSyncLayout } from './syncLayout'

export { FlipProvider, FlipContext }

export type FlipID = string

export interface AnimationOptions {
  duration?: number
  delay?: number
}

export interface FlipHtmlElement extends Element {
  dataset: {
    flipId: FlipID
  }
}

type Transforms = Map<
  FlipID,
  {
    elm: FlipHtmlElement
    kfs: any
  }
>

export const useFlip = (
  rootId: string,
  options: AnimationOptions = {},
  deps?: any
) => {
  const {
    cachedAnimations,
    cachedStyles,
    pauseAll,
    resumeAll
  } = React.useContext(FlipContext)
  const transforms = React.useRef<Transforms>(new Map()).current

  const { delay = DEFAULT_DELAY, duration = DEFAULT_DURATION } = options

  // If render happened during animation, do not wait for useLayoutEffect
  // and finish all animations, but cache their midflight position for next animation.
  // getBoundingClientRect will return correct values only here and not in useLayoutEffect!

  React.useEffect(() => {
    // Cache element positions on initial render for subsequent calculations
    for (const root of getElementsByRootId(rootId)) {
      // Select all root children that are supposed to be animated
      const flippableElements = root.querySelectorAll(`[data-flip-id]`)

      for (const element of flippableElements) {
        const { flipId } = (element as FlipHtmlElement).dataset

        cachedStyles.set(flipId, getRect(element))
      }
    }
  }, [rootId, deps, cachedStyles])

  useLayoutEffect(() => {
    // Do not do anything on initial render
    if (emptyMap(cachedStyles)) return

    const cachedStyleEntries = cachedStyles.entries()

    for (const [flipId, cachedRect] of cachedStyleEntries) {
      // Select by data-flip-id which makes it possible to animate the element
      // that re-mounted in some other DOM location (i.e. shared layout transition)
      const flipElement = getElementByFlipId(flipId)

      if (flipElement) {
        syncLayout.read(() => {
          const nextRect = getRect(flipElement)

          const translateY = getTranslateY(
            cachedRect as DOMRect,
            nextRect as DOMRect
          )
          const translateX = getTranslateX(
            cachedRect as DOMRect,
            nextRect as DOMRect
          )
          const scaleX = getScaleX(cachedRect, nextRect)
          const scaleY = getScaleY(cachedRect, nextRect)

          // Update the cached position
          cachedStyles.set(flipId, nextRect)

          // Do not animate if there is no need to
          if (
            translateX === 0 &&
            translateY === 0 &&
            scaleX === 1 &&
            scaleY === 1
          ) {
            return
          }

          const kfs = createKeyframes({
            sx: scaleX,
            sy: scaleY,
            dx: translateX,
            dy: translateY,
            calculateInverse: true
          })

          transforms.set(flipId, {
            elm: flipElement,
            kfs: kfs.animations
          })
        })
      }
    }

    const animationOptions = {
      duration,
      easing: 'linear',
      delay: delay,
      fill: 'both' as 'both'
    }

    for (const flipId of cachedStyles.keys()) {
      syncLayout.render(() => {
        const transform = transforms.get(flipId)

        if (!transform) return

        const animation = createAnimation(
          transform.elm,
          transform.kfs,
          animationOptions
        )

        cachedAnimations.set(flipId, animation)
        transforms.delete(flipId)

        animation.play()
      })
    }
  })

  useSyncLayout()

  return { pause: pauseAll, resume: resumeAll }
}
