import * as React from 'react'
import { useLayoutEffect } from './useLayoutEffect'
import { FlipContext, useCache } from './FlipProvider'
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

export { FlipContext }

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

type Transform = {
  elm: FlipHtmlElement
  kfs: any
}

export const useFlip = (flipId: string, context: any) => {
  const transform = React.useRef<Transform>()
  const { cachedAnimation, cachedRect, pause, resume } = context

  const { delay = DEFAULT_DELAY, duration = DEFAULT_DURATION } = {}

  // If render happened during animation, do not wait for useLayoutEffect
  // and finish all animations, but cache their midflight position for next animation.
  // getBoundingClientRect will return correct values only here and not in useLayoutEffect!

  React.useEffect(() => {
    // Cache element positions on initial render for subsequent calculations
    // Select all root children that are supposed to be animated
    const el = getElementByFlipId(flipId)

    if (!el) return

    console.debug('Initial getRect caching')
    cachedRect.current = getRect(el)
  }, [flipId])

  useLayoutEffect(() => {
    // Do not do anything on initial render
    if (!cachedRect.current) return

    // Select by data-flip-id which makes it possible to animate the element
    // that re-mounted in some other DOM location (i.e. shared layout transition)
    const flipElement = getElementByFlipId(flipId)

    if (flipElement) {
      console.debug('Registering measure job')
      syncLayout.measure(() => {
        console.debug('Measuring')
        const nextRect = getRect(flipElement)

        const translateY = getTranslateY(
          cachedRect.current as DOMRect,
          nextRect as DOMRect
        )
        const translateX = getTranslateX(
          cachedRect.current as DOMRect,
          nextRect as DOMRect
        )
        const scaleX = getScaleX(cachedRect.current!, nextRect)
        const scaleY = getScaleY(cachedRect.current!, nextRect)

        // Update the cached position
        cachedRect.current = nextRect

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

        transform.current = {
          elm: flipElement,
          kfs: kfs.animations
        }
      })
    }

    const animationOptions = {
      duration,
      easing: 'linear',
      delay: delay,
      fill: 'both' as 'both'
    }

    console.debug('Registering render job')
    syncLayout.render(() => {
      if (!transform.current) return

      const animation = createAnimation(
        transform.current.elm,
        transform.current.kfs,
        animationOptions
      )

      console.debug('Starting and caching the animation')

      cachedAnimation.current = animation

      console.log(cachedAnimation.current)

      animation.play()
    })
  })

  return { pause, resume }
}
