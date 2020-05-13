import * as React from 'react'
import { useLayoutEffect } from './useLayoutEffect'
import { FlipProvider, FlipContext } from './FlipProvider'
import {
  isRunning,
  getElementByFlipId,
  empty,
  emptyMap,
  not,
  getElementsByRootId,
  getComputedBgColor,
  getTranslateY,
  getTranslateX,
  getScaleX,
  getScaleY,
  getRect,
  getScaleAdjustedChildren,
  createAnimation,
  isScaleAdjusted
} from './helpers'
import { DEFAULT_DURATION, DEFAULT_DELAY, DEFAULT_EASING } from './const'
import { createKeyframes } from './createKeyframes'

export { FlipProvider, FlipContext }

export type FlipID = string

export interface AnimationOptions {
  duration?: number
  easing?: (x: number) => number
  delay?: number
  stagger?: number
  scale?: {
    x: number
    y: number
  }
}

export interface FlipHtmlElement extends Element {
  dataset: {
    flipId: FlipID
    preserveScale: boolean
  }
}

type ScaleAdjustedChildren = Map<FlipID, FlipHtmlElement>

export const useFlip = (
  rootId: string,
  options: AnimationOptions = {},
  deps: any
) => {
  const {
    cachedAnimations,
    cachedPositions,
    pauseAll,
    resumeAll
  } = React.useContext(FlipContext)
  const scaleAdjustedChildren = React.useRef<ScaleAdjustedChildren>(new Map())
    .current

  const {
    delay = DEFAULT_DELAY,
    duration = DEFAULT_DURATION,
    easing = DEFAULT_EASING,
    stagger = 0
  } = options

  const positionEntries = cachedPositions.entries()

  // If render happened during animation, do not wait for useLayoutEffect
  // and finish all animations, but cache their midflight position for next animation.
  // getBoundingClientRect will return correct values only here and not in useLayoutEffect!
  for (const [flipId] of positionEntries) {
    const element = getElementByFlipId(flipId)

    if (not(empty(cachedAnimations)) && element) {
      const cachedAnimation = cachedAnimations[flipId]

      if (cachedAnimation && isRunning(cachedAnimation)) {
        const v = cachedPositions.get(flipId)
        if (v) {
          cachedPositions.set(flipId, {
            rect: getRect(element),
            styles: v.styles
          })
          cachedAnimation.finish()
        }
      }
    }
  }

  React.useEffect(() => {
    // Cache element positions on initial render for subsequent calculations
    for (const root of getElementsByRootId(rootId)) {
      // Select all root children that are supposed to be animated
      const flippableElements = root.querySelectorAll(`[data-flip-id]`)

      for (const element of flippableElements) {
        const { flipId, preserveScale } = (element as FlipHtmlElement).dataset

        if (preserveScale) {
          scaleAdjustedChildren.set(flipId, element as FlipHtmlElement)
        }

        cachedPositions.set(flipId, {
          styles: {
            bgColor: getComputedBgColor(element)
          },
          rect: getRect(element)
        })
      }
    }
  }, [rootId, deps])

  useLayoutEffect(() => {
    // Do not do anything on initial render
    if (emptyMap(cachedPositions)) return

    let staggerStep = 0

    cachedPositions.forEach((value, flipId) => {
      const { rect: cachedRect, styles } = value

      // Select by data-flip-id which makes it possible to animate the element
      // that re-mounted in some other DOM location (i.e. shared layout transition)
      const flipElement = getElementByFlipId(flipId)

      if (flipElement) {
        const fallbackScale = options.scale

        const animationOptions = {
          duration,
          easing: 'linear',
          delay: delay + stagger * staggerStep,
          fill: 'both' as 'both'
        }

        if (fallbackScale && isScaleAdjusted(flipElement)) {
          const kfs = createKeyframes({
            sx: fallbackScale.x,
            sy: fallbackScale.y,
            easeFn: easing,
            calculateInverse: true
          })

          cachedAnimations[flipId] = createAnimation(
            flipElement,
            kfs.inverseAnimations,
            animationOptions
          )

          return
        }

        const scaleAdjustedElms = getScaleAdjustedChildren(flipElement)

        const hasScaleAdjustedChildren = scaleAdjustedElms.length > 0

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
        cachedPositions.get(flipId)!.rect = nextRect

        const nextColor = getComputedBgColor(flipElement)

        // Cache the color value
        const prevColor = styles.bgColor
        styles.bgColor = nextColor

        // Do not animate if there is no need to
        if (
          translateX === 0 &&
          translateY === 0 &&
          scaleX === 1 &&
          scaleY === 1
        ) {
          staggerStep++
          return
        }

        const kfs = createKeyframes({
          sx: scaleX,
          sy: scaleY,
          dx: translateX,
          dy: translateY,
          easeFn: easing,
          calculateInverse: hasScaleAdjustedChildren
        })

        const [firstKf, lastKf] = [
          {
            background: prevColor
          },
          {
            background: nextColor
          }
        ]

        kfs.animations[0] = {
          ...kfs.animations[0],
          ...firstKf
        }

        kfs.animations[20] = {
          ...kfs.animations[20],
          ...lastKf
        }

        if (hasScaleAdjustedChildren) {
          for (const elm of scaleAdjustedElms) {
            const flipId = (elm as FlipHtmlElement).dataset.flipId
            cachedAnimations[flipId] = createAnimation(
              elm as FlipHtmlElement,
              kfs.inverseAnimations,
              animationOptions
            )
          }
        }

        cachedAnimations[flipId] = createAnimation(
          flipElement,
          kfs.animations,
          animationOptions
        )

        // animation.play()

        staggerStep++
      }
    })
  })

  return { pause: pauseAll, resume: resumeAll }
}
