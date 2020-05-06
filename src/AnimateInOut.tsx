import * as React from 'react'
import { FlipContext } from './FlipProvider'
import { isRunning } from './helpers'

export { AnimateInOut }

export const fadeOut = {
  from: { opacity: 1 },
  to: { opacity: 0 },
  duration: 500
}

export const fadeIn = {
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 500
}

interface AnimationKeyframe {
  from: {
    [prop: string]: string | number
  }
  to: {
    [prop: string]: string | number
  }
  duration: number
}

interface AnimateInOutProps {
  children: React.ReactNode
  in?: AnimationKeyframe
  out?: AnimationKeyframe
  itemAmount?: number
}

interface InOutChildProps {
  children: React.ReactElement
  childProps: React.ReactElement['props']
  callback?: () => void
  keyframes?: AnimationKeyframe
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
      if (!props.isExiting && props.hasRendered) return

      const currAnimation = localCachedAnimation.current

      if (currAnimation && isRunning(currAnimation)) {
        return
      }

      const keyframes = props.keyframes || (props.isExiting ? fadeOut : fadeIn)

      const kfe = new KeyframeEffect(
        ref.current,
        [keyframes.from, keyframes.to],
        {
          duration: keyframes.duration,
          fill: 'both'
        }
      )

      const animation = new Animation(kfe, document.timeline)

      if (props.isExiting) {
        animation.onfinish = () => {
          props.callback && props.callback()
        }
      }

      animation.play()

      localCachedAnimation.current = animation
    }
  }, [props])

  // Prevent interactions since the element is treated as non-existent
  const style = { ...(props.children.props.style || {}), pointerEvents: 'none' }

  return (
    <React.Fragment>
      {props.isExiting
        ? React.cloneElement(props.children, {
            ...props.children.props,
            style,
            'data-flip-id': undefined, // Prevent shared animations
            ref
          })
        : props.children}
    </React.Fragment>
  )
}

const AnimateInOut = React.memo(function AnimateOut({
  children,
  in: inKeyframes,
  out,
  itemAmount
}: AnimateInOutProps): any {
  const cache = React.useRef(new Map<string, React.ReactElement>()).current
  const exiting = React.useRef(new Set<string>()).current
  const previousAmount = React.useRef(itemAmount)
  const initialRender = React.useRef(true)

  const amountChanged = itemAmount !== previousAmount.current

  previousAmount.current = itemAmount

  const { forceRender } = React.useContext(FlipContext)

  const filteredChildren = onlyValidElements(children)

  const presentChildren = React.useRef(filteredChildren)

  React.useEffect(() => {
    React.Children.forEach(filteredChildren, (child) => {
      cache.set(getChildKey(child), child)
    })
  })

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
    if (!exiting.has(key)) return

    exiting.delete(key)

    const removeIndex = presentChildren.current.findIndex(
      (child) => child.key === key
    )

    presentChildren.current.splice(removeIndex, 1)

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
    // If this component is actually entering again, early return
    if (targetKeys.indexOf(key) !== -1) return

    const child = cache.get(key)

    if (!child) return

    const removeFromCache = () => {
      removeFromDOM(key)
    }

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
        keyframes={out}
        callback={removeFromCache}
      >
        {child}
      </InOutChild>
    )
  })

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
