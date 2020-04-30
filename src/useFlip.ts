import { useEffect, useRef, useLayoutEffect } from 'react'

interface Pos {
  [id: string]: DOMRect | ClientRect
}

interface Animations {
  [id: string]: Animation
}

interface FlipHtmlElement extends Element {
  dataset: {
    flipId: string
  }
}

const hasKeys = (obj: object) => Object.keys(obj).length >= 1

const getChildren = (rootElm: Element) =>
  rootElm.children as HTMLCollectionOf<FlipHtmlElement>

const isRunning = (animation: Animation) => animation.playState === 'running'

const getTranslateX = (
  cachedRect: DOMRect | ClientRect,
  nextRect: DOMRect | ClientRect
) => cachedRect.left - nextRect.left

const getTranslateY = (
  cachedRect: DOMRect | ClientRect,
  nextRect: DOMRect | ClientRect
) => cachedRect.top - nextRect.top

const getScaleX = (
  cachedRect: DOMRect | ClientRect,
  nextRect: DOMRect | ClientRect
) => cachedRect.width / Math.max(nextRect.width, 0.001)

const getScaleY = (
  cachedRect: DOMRect | ClientRect,
  nextRect: DOMRect | ClientRect
) => cachedRect.height / Math.max(nextRect.height, 0.001)

export const useFlip = (rootId: string) => {
  const cachedPositions = useRef<Pos>(Object.create(null))
  const cachedAnimations = useRef<Animations>(Object.create(null))

  useEffect(() => {
    const elmt = document.getElementById(rootId)!
    for (const child of getChildren(elmt)) {
      const { flipId } = child.dataset
      cachedPositions.current[flipId] = child.getBoundingClientRect()
    }
  }, [rootId])

  useLayoutEffect(() => {
    if (!hasKeys(cachedPositions.current)) {
      return
    }

    const elmt = document.getElementById(rootId)

    if (!elmt) return

    for (const child of getChildren(elmt)) {
      const { flipId } = child.dataset
      const allAnimations = cachedAnimations.current

      if (hasKeys(allAnimations)) {
        const cachedAnimation = allAnimations[flipId]
        if (cachedAnimation && isRunning(cachedAnimation)) {
          cachedAnimation.cancel()
        }
      }

      const cachedRect = cachedPositions.current[flipId]
      const nextRect = child.getBoundingClientRect()

      const translateY = getTranslateY(cachedRect, nextRect)
      const translateX = getTranslateX(cachedRect, nextRect)
      const scaleX = getScaleX(cachedRect, nextRect)
      const scaleY = getScaleY(cachedRect, nextRect)

      cachedPositions.current[flipId] = nextRect

      allAnimations[flipId] = child.animate(
        [
          {
            transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
          },
          { transform: `translate(0px, 0px) scale(1,1)` }
        ],
        { duration: 500, fill: 'forwards' }
      )
    }
  })
}
