/* eslint-disable no-loop-func */
/* eslint-disable no-console */

import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { useFlipGroup } from '../useFlipGroup'
import { TestRef, Positions } from '../types'

it('Properly stores child state in a ref object', () => {
  const MAX_RENDERS = 2

  const rootRef = React.createRef() as React.MutableRefObject<TestRef>
  const positionByRender: Positions = {}

  let renderNumber = 1

  rootRef.current = {}

  // Collect children information
  rootRef.current.getChildPosition = (
    key: string,
    pos: ClientRect | DOMRect
  ) => {
    if (renderNumber <= MAX_RENDERS) {
      positionByRender[`${key}-${renderNumber}`] = pos
    }
  }

  // Mock listeners
  rootRef.current.addEventListener = (name, _) => {
    console.log(`${name} successfully added`)

    if (name === 'transitionend') {
      rootRef.current.onTransitionEnd = (positions: Positions) => {
        Object.entries(positions).forEach(([key, val]) => {
          rootRef.current.getChildPosition!(key, val)
        })
      }
    }
  }

  rootRef.current.removeEventListener = (name, _) => {
    console.log(`${name} successfully removed`)
  }

  // Mock children
  rootRef.current.children = [
    {
      dataset: {
        id: `first`
      },
      getBoundingClientRect() {
        return { top: 0, left: 100 }
      }
    },
    {
      dataset: {
        id: `second`
      },
      getBoundingClientRect() {
        return { top: 0, left: 150 }
      }
    }
  ]

  const initialDeps = [
    { id: 1, val: '1' },
    { id: 2, val: '2' }
  ]

  const initialArgs = {
    root: rootRef,
    deps: initialDeps,
    opts: { transition: 0, delay: 0, easing: 'ease' },
    __TEST__: true
  }

  const { rerender } = renderHook((args) => useFlipGroup(args as any), {
    initialProps: initialArgs
  })

  rootRef.current.children = [
    {
      dataset: {
        id: `second`
      },
      getBoundingClientRect() {
        return { top: 0, left: 100 }
      }
    },
    {
      dataset: {
        id: `first`
      },
      getBoundingClientRect() {
        return { top: 0, left: 150 }
      }
    }
  ]

  const nextDeps = [
    { id: 2, val: '2' },
    { id: 1, val: '1' }
  ]

  renderNumber++

  const nextArgs = {
    root: rootRef,
    deps: nextDeps,
    opts: { transition: 0, delay: 0, easing: 'ease' },
    __TEST__: true
  }

  rerender(nextArgs)

  expect(positionByRender[`first-1`].left).toBe(
    positionByRender['second-2'].left
  )
  expect(positionByRender[`first-2`].left).toBe(
    positionByRender['second-1'].left
  )
})
