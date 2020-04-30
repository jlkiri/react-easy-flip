import { useEffect, useLayoutEffect, useRef } from 'react'

type Time = number
type FlipID = string
type Rect = DOMRect | ClientRect

interface CachedStyles {
  [id: string]: { styles: any; rect: Rect }
}

interface Animations {
  [id: string]: { animation: Animation; offset: Time; previousTime: Time }
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

const isRunning = (animation: Animation) => animation.playState === 'running'

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

export const useFlip2 = (rootId: string) => {
  const cachedPositions = useRef<CachedStyles>(Object.create(null))
  const cachedAnimations = useRef<Animations>(Object.create(null))

  for (const [flipId] of Object.entries(cachedPositions.current)) {
    const element = document.querySelector(`[data-flip-id=${flipId}]`)

    if (not(empty(cachedAnimations)) && element) {
      const cache = cachedAnimations.current[flipId]

      if (cache && cache.animation && isRunning(cache.animation)) {
        cachedPositions.current[flipId].rect = element.getBoundingClientRect()
        cache.previousTime = cache.animation.currentTime || 0
        cache.offset = 800
        cache.animation.finish()
      }
    }
  }

  useEffect(() => {
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
        console.log(
          'from',
          getComputedStyle(element).getPropertyValue('background-color')
        )
      }
    }
  }, [rootId])

  useLayoutEffect(() => {
    if (empty(cachedPositions.current)) {
      return
    }

    for (const [flipId, { rect: cachedRect, styles }] of Object.entries(
      cachedPositions.current
    )) {
      const flipElement = document.querySelector(`[data-flip-id=${flipId}]`)

      if (flipElement) {
        const nextRect = flipElement.getBoundingClientRect()

        console.log(
          'to',
          getComputedStyle(flipElement).getPropertyValue('background-color')
        )

        const translateY = getTranslateY(cachedRect, nextRect)
        const translateX = getTranslateX(cachedRect, nextRect)
        const scaleX = getScaleX(cachedRect, nextRect)
        const scaleY = getScaleY(cachedRect, nextRect)

        cachedPositions.current[flipId].rect = nextRect

        cachedAnimations.current[flipId] = cachedAnimations.current[flipId] || {
          animation: null,
          offset: 800,
          previousTime: 0
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

        cachedAnimations.current[flipId].previousTime = 0

        cachedPositions.current[flipId].styles.bgColor = nextColor

        const animation = new Animation(effect, document.timeline)

        cachedAnimations.current[flipId].animation = animation

        animation.play()
      }
    }
  })
}
