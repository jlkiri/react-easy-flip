import React from 'react'
import { FlipContext } from './FlipProvider'

const $ = (el: any) => document.querySelector(el)

const isValidState = (state: any) => state === 'visible' || state === 'hidden'

export const useDeferredState = ({
  flipId,
  variants,
  initial,
  animateFirstRender
}: any) => {
  const [variant, setVariant] = React.useState(initial)
  const [isRendered, setIsRendered] = React.useState(initial === 'visible')
  const didRender = React.useRef(false)
  const { cachedAnimations } = React.useContext(FlipContext)

  const shouldAnimateFirstRender = () =>
    !didRender.current && animateFirstRender

  const isHidden = variant === 'hidden'
  const isVisible = variant === 'visible'

  const safeSetIsRendered = (state: any) => {
    if (!isValidState(state)) {
      throw Error(`Only "visible" or "hidden" are valid values!`)
    }
    setIsRendered(state)
  }

  const togglePresence = () => {
    setVariant(variant === 'hidden' ? 'visible' : 'hidden')
    if (variant === 'hidden') {
      setIsRendered(true)
    }
  }

  const handleExitAnimationEnd = () => {
    console.log('handler')
    setIsRendered(false)
  }

  const handleEnterAnimationEnd = () => {
    console.log('handler')
  }

  const animateVisible = (el: any) => {
    const animation = el.animate(variants.visible, 700)
  }

  React.useLayoutEffect(() => {
    const el = $(`[data-flip-id=${flipId}]`)

    if (!el) return

    if (shouldAnimateFirstRender()) {
      animateVisible(el)
      return
    }

    if (isHidden && didRender.current) {
      const animation = el.animate(variants.hidden, 700)
      animation.onfinish = handleExitAnimationEnd
      cachedAnimations.set(flipId, animation)
    }

    if (isVisible && didRender.current) {
      animateVisible(el)
    }
  }, [variant])

  React.useEffect(() => {
    didRender.current = true
  }, [])

  return { isRendered, togglePresence, setIsRendered: safeSetIsRendered }
}
