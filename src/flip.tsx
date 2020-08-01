import * as React from 'react'

class Snapshot extends React.Component {
  listRef = React.createRef()

  componentDidUpdate() {
    return true
  }

  getSnapshotBeforeUpdate() {
    this.props.getBoundingRectSnapshot()

    return null
  }

  render() {
    return this.props.children
  }
}

const cache = new Map()

const get = (_target, type) => {
  const Component = (forwardedProps, ref) => {
    const localRef = React.useRef()

    const component = React.createElement(type, {
      ...forwardedProps,
      ref: localRef
    })

    const getBoundingRectSnapshot = () => {
      console.debug(
        'getBoundingClientRect',
        localRef.current.getBoundingClientRect()
      )
    }

    React.useImperativeHandle(ref, () => localRef.current)

    return (
      <Snapshot getBoundingRectSnapshot={getBoundingRectSnapshot}>
        {component}
      </Snapshot>
    )
  }

  if (!cache.has(type)) {
    const cachedComponent = React.forwardRef(Component)
    cache.set(type, cachedComponent)

    return cachedComponent
  }

  return cache.get(type)
}

export const flip = new Proxy({}, { get })
