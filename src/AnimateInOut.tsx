import * as React from 'react'
import { FlipContext } from './FlipProvider'
import { isRunning } from './helpers'
import { fadeIn, fadeOut } from './keyframes'

export { fadeIn, fadeOut }
export { AnimateInOut }

interface CustomKeyframe {
  [property: string]: string | number
}

interface AnimationKeyframes {
  from: CustomKeyframe
  to: CustomKeyframe
  duration: number
  easing?: string
}

interface AnimateInOutProps {
  children: React.ReactNode
  in?: AnimationKeyframes
  out?: AnimationKeyframes
  itemAmount?: number
}

interface InOutChildProps {
  children: React.ReactElement
  childProps: React.ReactElement['props']
  callback?: () => void
  keyframes?: AnimationKeyframes
  isInitialRender: boolean
  hasRendered: boolean
  isExiting: boolean
}

const getChildKey = (child: React.ReactElement) => {
  return `${child.key}` || ''
}

const onlyValidElements = (children: React.ReactNode) => {
  const filtered: React.ReactElement[] = []

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      filtered.push(child)
    }
  })

  return filtered
}

const InOutChild = (props: InOutChildProps) => {
  const ref = React.useRef<Element>(null)
  const localCachedAnimation = React.useRef<Animation | null>(null)

  React.useLayoutEffect(() => {
    if (!ref.current) return

    if (!props.isInitialRender) {
      // Skip animations on non-relevant renders (neither exiting nor appearing)
      if (!props.isExiting && props.hasRendered) return

      const cachedAnimation = localCachedAnimation.current

      // If currently playing exiting animation keep playing
      if (cachedAnimation && isRunning(cachedAnimation)) {
        return
      }

      const keyframes = props.keyframes || (props.isExiting ? fadeOut : fadeIn)

      const kfe = new KeyframeEffect(
        ref.current,
        [keyframes.from, keyframes.to],
        {
          duration: keyframes.duration,
          easing: keyframes.easing || 'ease',
          fill: 'both'
        }
      )

      const animation = new Animation(kfe, document.timeline)

      if (props.isExiting) {
        animation.onfinish = () => props.callback && props.callback()
      }

      animation.play()

      localCachedAnimation.current = animation
    }
  }, [props])

  // Prevent interactions with exiting elements (treat as non-existent)
  const style = { ...(props.children.props.style || {}), pointerEvents: 'none' }

  return (
    <React.Fragment>
      {props.isExiting
        ? React.cloneElement(props.children, {
            ...props.children.props,
            style,
            'data-flip-id': undefined, // Prevent trigger of shared layout animations
            ref
          })
        : props.children}
    </React.Fragment>
  )
}

const AnimateInOut = React.memo(function AnimateOut({
  children,
  in: inKeyframes,
  out: outKeyframes,
  itemAmount
}: AnimateInOutProps): any {
  const cache = React.useRef(new Map<string, React.ReactElement>()).current
  const exiting = React.useRef(new Set<string>()).current
  const previousAmount = React.useRef(itemAmount)
  const initialRender = React.useRef(true)
  const { forceRender } = React.useContext(FlipContext)

  // Use an optional explicit hint to know when an element truly is removed
  // and not moved to other position in DOM (shared layout transition)
  const amountChanged = itemAmount !== previousAmount.current

  previousAmount.current = itemAmount

  const filteredChildren = onlyValidElements(children)

  const presentChildren = React.useRef(filteredChildren)

  React.useEffect(() => {
    React.Children.forEach(filteredChildren, (child) => {
      cache.set(getChildKey(child), child)
    })
  })

  // On initial render just wrap everything with InOutChild
  if (initialRender.current) {
    initialRender.current = false
    return filteredChildren.map((child) => (
      <InOutChild
        isExiting={false}
        key={getChildKey(child)}
        keyframes={inKeyframes}
        hasRendered={false}
        childProps={child.props}
        isInitialRender
      >
        {child}
      </InOutChild>
    ))
  }

  // If render is caused by shared layout animation do not play exit animations
  // but keep those already playing
  if (!amountChanged) {
    if (exiting.size !== 0) {
      return presentChildren.current
    }

    presentChildren.current = filteredChildren

    return filteredChildren
  }

  const presentKeys = presentChildren.current.map(getChildKey)
  const targetKeys = filteredChildren.map(getChildKey)

  const removeFromDOM = (key: string) => {
    // Avoid bugs when callback is called twice (i.e. not exiting anymore)
    if (!exiting.has(key)) return

    exiting.delete(key)

    // Do not force render if multiple exit animations are playing
    const removeIndex = presentChildren.current.findIndex(
      (child) => child.key === key
    )

    presentChildren.current.splice(removeIndex, 1)

    // Only force render when the last exit animation is finished
    if (exiting.size === 0) {
      presentChildren.current = filteredChildren
      forceRender()
    }
  }

  for (const key of presentKeys) {
    if (!targetKeys.includes(key)) {
      exiting.add(key)
    } else {
      // In case this key has re-entered, remove from the exiting list
      exiting.delete(key)
    }
  }

  let renderedChildren = [...filteredChildren]

  exiting.forEach((key) => {
    // If this component is actually entering again, early return.
    // Copied from framer-motion. Not sure what the usecase is but just in case.
    if (targetKeys.indexOf(key) !== -1) return

    const child = cache.get(key)

    if (!child) return

    // This is an animation onfinish callback
    const removeFromCache = () => removeFromDOM(key)

    const index = presentKeys.indexOf(key)

    renderedChildren.splice(
      index,
      0,
      <InOutChild
        isExiting
        isInitialRender={false}
        hasRendered
        childProps={child.props}
        key={key}
        keyframes={outKeyframes}
        callback={removeFromCache}
      >
        {child}
      </InOutChild>
    )
  })

  // Wrap children in InOutChild except those that are exiting
  renderedChildren = renderedChildren.map((child) => {
    if (exiting.has(getChildKey(child))) {
      return child
    }

    return (
      <InOutChild
        isExiting={false}
        childProps={child.props}
        key={getChildKey(child)}
        keyframes={inKeyframes}
        isInitialRender={false}
        hasRendered={!!cache.get(getChildKey(child))}
      >
        {child}
      </InOutChild>
    )
  })

  presentChildren.current = renderedChildren

  return renderedChildren
})
