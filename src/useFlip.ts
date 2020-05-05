import * as React from 'react'
import { FlipProvider, FlipContext } from './FlipProvider'
import { isRunning } from './helpers'

export { FlipProvider, FlipContext }

type FlipID = string
type Rect = DOMRect | ClientRect

interface CachedStyles {
  [id: string]: { styles: any; rect: Rect }
}

interface FlipHtmlElement extends Element {
  dataset: {
    flipId: FlipID
    onlyColor: boolean
  }
}

const not = (bool: boolean) => !bool
const empty = (obj: object) => Object.keys(obj).length === 0

const getChildren = (rootElm: Element) =>
  rootElm.children as HTMLCollectionOf<FlipHtmlElement>

const getTranslateX = (cachedRect: DOMRect, nextRect: DOMRect) =>
  cachedRect.x - nextRect.x

const getTranslateY = (cachedRect: DOMRect, nextRect: DOMRect) =>
  cachedRect.y - nextRect.y

const getScaleX = (
  cachedRect: DOMRect | ClientRect,
  nextRect: DOMRect | ClientRect
) => cachedRect.width / Math.max(nextRect.width, 0.001)

const getScaleY = (
  cachedRect: DOMRect | ClientRect,
  nextRect: DOMRect | ClientRect
) => cachedRect.height / Math.max(nextRect.height, 0.001)

export const useFlip = (rootId: string) => {
  const cachedPositions = React.useRef<CachedStyles>(Object.create(null))
  const { cachedAnimations } = React.useContext(FlipContext)

  for (const [flipId] of Object.entries(cachedPositions.current)) {
    const element = document.querySelector(`[data-flip-id=${flipId}]`)

    if (not(empty(cachedAnimations)) && element) {
      const cache = cachedAnimations.current[flipId]

      if (cache && cache.animation && isRunning(cache.animation)) {
        cachedPositions.current[flipId].rect = element.getBoundingClientRect()
        cache.animation.finish()
      }
    }
  }

  React.useEffect(() => {
    const roots = document.querySelectorAll(`[data-flip-root-id=${rootId}]`)!
    for (const root of roots) {
      const flippableElements = root.querySelectorAll(`[data-flip-id]`)
      for (const element of flippableElements) {
        const { flipId } = (element as FlipHtmlElement).dataset
        cachedPositions.current[flipId] = {
          styles: {
            bgColor: getComputedStyle(element).getPropertyValue(
              'background-color'
            )
          },
          rect: element.getBoundingClientRect()
        }
      }
    }
  }, [rootId])

  React.useLayoutEffect(() => {
    if (empty(cachedPositions.current)) {
      return
    }

    for (const [flipId, { rect: cachedRect, styles }] of Object.entries(
      cachedPositions.current
    )) {
      const flipElement = document.querySelector(`[data-flip-id=${flipId}]`)

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

        if (translateX === 0 && translateY === 0) {
          continue
        }

        cachedPositions.current[flipId].rect = nextRect

        cachedAnimations.current[flipId] = cachedAnimations.current[flipId] || {
          animation: null
        }

        const nextColor = getComputedStyle(flipElement).getPropertyValue(
          'background-color'
        )

        const effect = new KeyframeEffect(
          flipElement,
          [
            {
              transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
              backgroundColor: styles.bgColor
            },
            {
              transform: `translate(0px, 0px) scale(1,1)`,
              backgroundColor: nextColor
            }
          ],
          {
            duration: 500,
            fill: 'both',
            easing: 'ease-in-out'
          }
        )

        cachedPositions.current[flipId].styles.bgColor = nextColor

        const animation = new Animation(effect, document.timeline)

        cachedAnimations.current[flipId].animation = animation

        animation.play()
      }
    }
  })
}
