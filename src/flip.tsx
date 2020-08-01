import * as React from 'react'
import { Rect, useCache } from './FlipProvider'
import { getElementByFlipId, getRect, isRunning } from './helpers'
import { syncLayout } from './syncLayout'
import { useFlip } from './useFlip'

type SnapshotProps = {
  getBoundingRectSnapshot: () => void
  ctx: ReturnType<typeof useCache>
  flipId: string
}

class Snapshot extends React.Component<SnapshotProps> {
  componentDidUpdate(_: any, __: any, snapshot: Rect) {
    const { cachedAnimation } = this.props.ctx

    if (cachedAnimation.current) {
      console.debug('snapshot', snapshot)
      if (isRunning(cachedAnimation.current)) {
        console.debug('Scheduling forced animation finish')
        //syncLayout.render(() => {
        cachedAnimation.current!.finish()
        //})
      }
    }

    //syncLayout.flush()
  }

  getSnapshotBeforeUpdate() {
    console.log('getSnapshotBeforeUpdate')

    const element = getElementByFlipId(this.props.flipId)
    const { cachedRect } = this.props.ctx

    const snapshot = getRect(element)

    cachedRect.current = snapshot

    return snapshot
  }

  render() {
    return this.props.children
  }
}

const cache = new Map()

const get = (_target: object, type: string) => {
  const Component = (
    forwardedProps: object & { flipId: string },
    ref: React.Ref<HTMLElement>
  ) => {
    const localRef = React.useRef<HTMLElement>()
    const ctx = useCache()

    const component = React.createElement(type, {
      ...forwardedProps,
      ref: localRef,
      'data-flip-id': forwardedProps.flipId
    })

    const getBoundingRectSnapshot = () => {
      console.debug(
        'getBoundingClientRect',
        localRef.current!.getBoundingClientRect()
      )
    }

    // Makes the local ref usable inside a user-defined parent
    React.useImperativeHandle(ref, () => localRef.current!)

    useFlip(forwardedProps.flipId)

    return (
      <Snapshot
        flipId={forwardedProps.flipId}
        ctx={ctx}
        getBoundingRectSnapshot={getBoundingRectSnapshot}
      >
        {component}
      </Snapshot>
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
