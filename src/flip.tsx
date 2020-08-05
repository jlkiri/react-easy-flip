import * as React from 'react'
import { Rect, useCache } from './FlipProvider'
import { getElementByFlipId, getRect, isRunning } from './helpers'
import { syncLayout, useSyncLayout } from './syncLayout'
import { useFlip } from './useFlip'

type SnapshotProps = {
  getBoundingRectSnapshot: () => Rect | null
  context: ReturnType<typeof useCache>
  flipId: string
}

const Layout = () => {
  useSyncLayout()

  return null
}

class Snapshot extends React.Component<SnapshotProps> {
  componentDidUpdate() {}

  getSnapshotBeforeUpdate() {
    console.debug('getSnapshotBeforeUpdate')

    return this.props.getBoundingRectSnapshot()
  }

  render() {
    return this.props.children
  }
}

const cache = new Map()

const get = (_target: object, type: string) => {
  const Component = (
    forwardedProps: object & { flipId: string; flip: boolean },
    ref: React.Ref<HTMLElement>
  ) => {
    const localRef = React.useRef<HTMLElement>()
    const context = useCache() // this gets used inside getBoundingRectSnapshot but it is not context, hence undefined animations

    useFlip(forwardedProps.flipId, context)

    const component = React.createElement(type, {
      ...forwardedProps,
      ref: localRef,
      'data-flip-id': forwardedProps.flipId
    })

    const getBoundingRectSnapshot = () => {
      if (!forwardedProps.flipId) return null

      const element = getElementByFlipId(forwardedProps.flipId)
      const { cachedRect, cachedAnimation } = context

      console.debug(
        'getBoundingRectSnapshot cachedAnimation',
        cachedAnimation.current
      )

      const snapshot = getRect(element)

      cachedRect.current = snapshot

      console.debug('snapshot', snapshot)

      syncLayout.interrupt(() => {
        console.debug('interrupting')
        console.debug('cachedAnimation', cachedAnimation.current)
        if (cachedAnimation.current) {
          if (isRunning(cachedAnimation.current)) {
            console.debug('Animation interrupt')

            cachedAnimation.current!.finish()
          }
        }
      })

      return snapshot
    }

    // Makes the local ref usable inside a user-defined parent
    React.useImperativeHandle(ref, () => localRef.current!)

    const Provider = () => {}

    return (
      <>
        <Snapshot
          flipId={forwardedProps.flipId}
          context={context}
          getBoundingRectSnapshot={getBoundingRectSnapshot}
        >
          {component}
        </Snapshot>
        {forwardedProps.flip && <Layout />}
      </>
    )
  }

  // Use cache so class component lifecycles work properly

  if (!cache.has(type)) {
    const cachedComponent = React.forwardRef(Component)
    cache.set(type, cachedComponent)

    return cachedComponent
  }

  return cache.get(type)
}

export const flip = new Proxy(Object.create(null), { get })
