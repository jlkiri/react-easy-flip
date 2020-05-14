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
  isScaleAdjusted,
  getFlipId,
  getChildren
} from './helpers'
import { DEFAULT_DURATION, DEFAULT_DELAY, DEFAULT_EASING } from './const'
import { createKeyframes } from './createKeyframes'
import { syncLayout, useSyncLayout } from './syncLayout'

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

type TransformValues = {
  translateX: number
  translateY: number
  scaleX: number
  scaleY: number
  bgColor: string
}

type Transforms = Map<
  FlipID,
  {
    elm: FlipHtmlElement
    parentId?: FlipID | null
    values: TransformValues
  }
>

type ScaleAdjustedChildren = Map<FlipID, FlipHtmlElement>

export const useFlip = (
  rootId: string,
  options: AnimationOptions = {},
  deps: any
) => {
  const {
    cachedAnimations,
    cachedStyles,
    pauseAll,
    resumeAll
  } = React.useContext(FlipContext)
  const scaleAdjustedChildren = React.useRef<ScaleAdjustedChildren>(new Map())
    .current
  const transforms = React.useRef<Transforms>(new Map()).current

  const {
    delay = DEFAULT_DELAY,
    duration = DEFAULT_DURATION,
    easing = DEFAULT_EASING,
    stagger = 0
  } = options

  const styleEntries = cachedStyles.keys()

  // If render happened during animation, do not wait for useLayoutEffect
  // and finish all animations, but cache their midflight position for next animation.
  // getBoundingClientRect will return correct values only here and not in useLayoutEffect!
  for (const flipId of styleEntries) {
    const element = getElementByFlipId(flipId)

    if (not(emptyMap(cachedAnimations)) && element) {
      const cachedAnimation = cachedAnimations.get(flipId)

      if (cachedAnimation && isRunning(cachedAnimation)) {
        const v = cachedStyles.get(flipId)
        if (v) {
          cachedStyles.set(flipId, {
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

        cachedStyles.set(flipId, {
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
    if (emptyMap(cachedStyles)) return

    // let staggerStep = 0
    let scaleAdjustedChildren: Set<FlipID> = new Set()
    const en = cachedStyles.entries()

    //cachedStyles.forEach((value, flipId) => {
    for (const e of en) {
      const [flipId, value] = e
      const { rect: cachedRect, styles } = value

      // Select by data-flip-id which makes it possible to animate the element
      // that re-mounted in some other DOM location (i.e. shared layout transition)
      const flipElement = getElementByFlipId(flipId)

      if (flipElement) {
        /* for (const child of getChildren(flipElement)) {
        scaleAdjustedChildren.add(getFlipId(child as any))
      } */

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
          cachedStyles.get(flipId)!.rect = nextRect

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
            // staggerStep++
            return
          }

          /* const parentId =
          flipElement.parentElement &&
          getFlipId(flipElement.parentElement as any) */

          transforms.set(flipId, {
            elm: flipElement,
            // parentId: parentId || null,
            values: {
              translateX,
              translateY,
              scaleX,
              scaleY,
              bgColor: nextColor
            }
          })

          /* const [firstKf, lastKf] = [
          {
            background: prevColor
          },
          {
            background: nextColor
          }
        ] */

          /* kfs.animations[0] = {
            ...kfs.animations[0],
            ...firstKf
          }

          kfs.animations[20] = {
            ...kfs.animations[20],
            ...lastKf
          } */
        })
      }

      // staggerStep++

      /*  const scaleAdjustedChildren = Array.from(getElementsByRootId(rootId))
            .map(getScaleAdjustedChildren)
            .flat() */
    }

    const animationOptions = {
      duration,
      easing: 'linear',
      delay: delay,
      fill: 'both' as 'both'
    }

    /* for (const child of scaleAdjustedChildren) {
      const transform = transforms.get(child)
      if (transform) {
        if (transform.parentId) {
          const parentTransform = transforms.get(transform.parentId)
          if (parentTransform) {
            transform.values.scaleX = 1 / parentTransform.values.scaleX
            transform.values.scaleY = 1 / parentTransform.values.scaleY
          }
        }
      }
    } */

    const entries = transforms.entries()

    syncLayout.render(() => {
      for (const e of entries) {
        // transforms.forEach((transform, flipId) => {
        const [flipId, transform] = e
        const { scaleX, scaleY, translateX, translateY } = transform.values
        const kfs = createKeyframes({
          sx: scaleX,
          sy: scaleY,
          dx: translateX,
          dy: translateY,
          easeFn: easing,
          calculateInverse: false
        })

        const animation = createAnimation(
          transform.elm,
          kfs.animations,
          animationOptions
        )

        cachedAnimations.set(flipId, animation)

        animation.play()

        transforms.delete(flipId)
      }
    })
  })

  useSyncLayout()

  return { pause: pauseAll, resume: resumeAll }
}
