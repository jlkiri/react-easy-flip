import * as React from 'react'
import { FlipProvider, useFlip } from './useFlip'

type SnapshotProps = {
  getBoundingRectSnapshot: () => void
}

class Snapshot extends React.Component<SnapshotProps> {
  componentDidUpdate() {}

  getSnapshotBeforeUpdate() {
    this.props.getBoundingRectSnapshot()

    return null
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
      <Snapshot getBoundingRectSnapshot={getBoundingRectSnapshot}>
        {component}
      </Snapshot>
    )
  }

  // Use cache so class component lifecycles work properly

  if (!cache.has(type)) {
    const cachedComponent = React.forwardRef(Component)
    cache.set(type, cachedComponent)

    return <FlipProvider>{cachedComponent}</FlipProvider>
  }

  return cache.get(type)
}

export const flip = new Proxy(Object.create(null), { get })
