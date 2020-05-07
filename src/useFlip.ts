import * as React from 'react'
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
  getScaleY
} from './helpers'
import { DEFAULT_DURATION, DEFAULT_DELAY, DEFAULT_EASING } from './const'

export { FlipProvider, FlipContext }

export type FlipID = string
export type Rect = DOMRect | ClientRect

export interface CachedStyles {
  [id: string]: { styles: any; rect: Rect }
}

export interface AnimationOptions {
  duration?: number
  easing?: string
  delay?: number
}

export interface FlipHtmlElement extends Element {
  dataset: {
    flipId: FlipID
  }
}

export const useFlip = (rootId: string, options: AnimationOptions = {}) => {
  const cachedPositions = React.useRef<CachedStyles>(Object.create(null))
  const { cachedAnimations } = React.useContext(FlipContext)

  const { delay, duration, easing } = {
    duration: DEFAULT_DURATION,
    easing: DEFAULT_EASING,
    delay: DEFAULT_DELAY,
    ...options
  }

  const positionEntries = Object.entries(cachedPositions.current)

  // If render happened during animation, do not wait for useLayoutEffect
  // and finish all animations, but cache their midflight position for next animation.
  // getBoundingClientRect will return correct values only here and not in useLayoutEffect!
  for (const [flipId] of positionEntries) {
    const element = getElementByFlipId(flipId)

    if (not(empty(cachedAnimations)) && element) {
      const cachedAnimation = cachedAnimations.current[flipId]

      if (cachedAnimation && isRunning(cachedAnimation)) {
        cachedPositions.current[flipId].rect = element.getBoundingClientRect()
        cachedAnimation.finish()
      }
    }
  }

  React.useEffect(() => {
    // Cache element positions on initial render for subsequent calculations
    const roots = getElementsByRootId(rootId)

    for (const root of roots) {
      // Select all root children that are supposed to be animated
      const flippableElements = root.querySelectorAll(`[data-flip-id]`)

      for (const element of flippableElements) {
        const { flipId } = (element as FlipHtmlElement).dataset
        cachedPositions.current[flipId] = {
          styles: {
            bgColor: getComputedBgColor(element)
          },
          rect: element.getBoundingClientRect()
        }
      }
    }
  }, [rootId])

  React.useLayoutEffect(() => {
    // Do not do anything on initial render
    if (empty(cachedPositions.current)) {
      return
    }

    const positions = Object.entries(cachedPositions.current)

    for (const [i, entry] of positions.entries()) {
      const [flipId, { rect: cachedRect, styles }] = entry

      // Select by data-flip-id which makes it possible to animate the element
      // that re-mounted in some other DOM location (i.e. shared layout transition)
      const flipElement = getElementByFlipId(flipId)

      if (flipElement) {
        const nextRect = flipElement.getBoundingClientRect()

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
          continue
        }

        const effect = new KeyframeEffect(
          flipElement,
          [
            {
              transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
              background: prevColor
            },
            {
              transform: `translate(0px, 0px) scale(1,1)`,
              background: nextColor
            }
          ],
          {
            duration,
            easing,
            delay,
            fill: 'both'
          }
        )

        const animation = new Animation(effect, document.timeline)

        cachedAnimations.current[flipId] = animation

        animation.play()
      }
    }
  })
}
