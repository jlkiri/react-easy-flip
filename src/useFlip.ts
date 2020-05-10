import * as React from 'react'
import { useLayoutEffect } from './useLayoutEffect'
import { FlipProvider, FlipContext } from './FlipProvider'
import {
  isRunning,
  getElementByFlipId,
  empty,
  not,
  getElementsByRootId,
  getComputedBgColor,
  getTranslateY,
  getTranslateX,
  getScaleX,
  getScaleY,
  getRect
} from './helpers'
import { DEFAULT_DURATION, DEFAULT_DELAY, DEFAULT_EASING } from './const'
import { createKeyframes } from './createKeyframes'

export { FlipProvider, FlipContext }

export type FlipID = string
export type Rect = DOMRect | ClientRect

export interface CachedStyles {
  [id: string]: { styles: any; rect: Rect }
}

export interface AnimationOptions {
  duration?: number
  easing?: (x: number) => number
  delay?: number
  stagger?: number
}

export interface FlipHtmlElement extends Element {
  dataset: {
    flipId: FlipID
    preserveScale: boolean
  }
}

export const useFlip = (rootId: string, options: AnimationOptions = {}) => {
  const cachedPositions = React.useRef<CachedStyles>(Object.create(null))
  const { cachedAnimations, pauseAll, resumeAll } = React.useContext(
    FlipContext
  )

  const {
    delay = DEFAULT_DELAY,
    duration = DEFAULT_DURATION,
    easing = DEFAULT_EASING,
    stagger = 0
  } = options

  const positionEntries = Object.entries(cachedPositions.current)

  // If render happened during animation, do not wait for useLayoutEffect
  // and finish all animations, but cache their midflight position for next animation.
  // getBoundingClientRect will return correct values only here and not in useLayoutEffect!
  for (const [flipId] of positionEntries) {
    const element = getElementByFlipId(flipId)

    if (not(empty(cachedAnimations)) && element) {
      const cachedAnimation = cachedAnimations.current[flipId]

      if (cachedAnimation && isRunning(cachedAnimation)) {
        cachedPositions.current[flipId].rect = getRect(element)
        cachedAnimation.finish()
      }
    }
  }

  React.useEffect(() => {
    // Cache element positions on initial render for subsequent calculations
    for (const root of getElementsByRootId(rootId)) {
      // Select all root children that are supposed to be animated
      const flippableElements = root.querySelectorAll(`[data-flip-id]`)

      for (const element of flippableElements) {
        const { flipId } = (element as FlipHtmlElement).dataset
        cachedPositions.current[flipId] = {
          styles: {
            bgColor: getComputedBgColor(element)
          },
          rect: getRect(element)
        }
      }
    }
  }, [rootId])

  useLayoutEffect(() => {
    // Do not do anything on initial render
    if (empty(cachedPositions.current)) {
      return
    }

    Object.entries(cachedPositions.current).forEach((entry, i) => {
      const [flipId, { rect: cachedRect, styles }] = entry

      // Select by data-flip-id which makes it possible to animate the element
      // that re-mounted in some other DOM location (i.e. shared layout transition)
      const flipElement = getElementByFlipId(flipId)

      if (flipElement) {
        const scaleAdjustedElms = flipElement.querySelectorAll(
          '[data-preserve-scale=true]'
        )

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
        cachedPositions.current[flipId].rect = nextRect

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
            const effect = new KeyframeEffect(elm, kfs.inverseAnimations, {
              duration,
              easing: 'linear',
              delay: delay + stagger * i,
              fill: 'both'
            })

            const animation = new Animation(effect, document.timeline)
            animation.play()
          }
        }

        const effect = new KeyframeEffect(flipElement, kfs.animations, {
          duration,
          easing: 'linear',
          delay: delay + stagger * i,
          fill: 'both'
        })

        const animation = new Animation(effect, document.timeline)

        cachedAnimations.current[flipId] = animation

        animation.play()
      }
    })
  })

  return { pause: pauseAll, resume: resumeAll }
}
