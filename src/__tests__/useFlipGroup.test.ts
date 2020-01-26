/* eslint-disable no-loop-func */
/* eslint-disable no-console */

import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { useFlipGroup } from '../useFlipGroup'
import { TestRef, Positions } from '../types'

it('Properly stores child state in a ref object', () => {
  const MAX_RENDERS = 2
  const FLIP_ID = 'TEST'

  const rootRef = React.createRef() as React.MutableRefObject<TestRef>
  const positionByRender: Positions = {}

  let renderNumber = 1

  rootRef.current = {}

  // Collect children information
  rootRef.current.getChildPosition = (
    key: string,
    pos: ClientRect | DOMRect
  ) => {
    console.log('hiiihhhhihihihii')
    if (renderNumber <= MAX_RENDERS) {
      positionByRender[`${key}-${renderNumber}`] = pos
    }
  }

  rootRef.current.log = (msg) => console.log(msg)

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
      style: {
        transform: '',
        transition: ''
      },
      getBoundingClientRect() {
        return { top: 0, left: 100, width: 200, height: 200 }
      }
    },
    {
      dataset: {
        id: `second`
      },
      style: {
        transform: '',
        transition: ''
      },
      getBoundingClientRect() {
        return { top: 0, left: 150, width: 400, height: 400 }
      }
    }
  ]

  const initialDeps = [
    { id: 1, val: '1' },
    { id: 2, val: '2' }
  ]

  const initialArgs = {
    flipId: FLIP_ID,
    deps: initialDeps,
    opts: { transition: 0, delay: 0, easing: 'ease' },
    __TEST__: true,
    __TEST_REF__: rootRef
  }

  const { rerender } = renderHook((args) => useFlipGroup(args as any), {
    initialProps: initialArgs
  })

  rootRef.current.children = [
    {
      dataset: {
        id: `second`
      },
      style: {
        transform: '',
        transition: ''
      },
      getBoundingClientRect() {
        return { top: 0, left: 100, width: 400, height: 400 }
      }
    },
    {
      dataset: {
        id: `first`
      },
      style: {
        transform: '',
        transition: ''
      },
      getBoundingClientRect() {
        return { top: 0, left: 150, width: 200, height: 200 }
      }
    }
  ]

  const nextDeps = [
    { id: 2, val: '2' },
    { id: 1, val: '1' }
  ]

  renderNumber++

  const nextArgs = {
    flipId: FLIP_ID,
    deps: nextDeps,
    opts: { transition: 0, delay: 0, easing: 'ease' },
    __TEST__: true,
    __TEST_REF__: rootRef
  }

  rerender(nextArgs)

  console.log(positionByRender)

  expect(positionByRender[`first-1`].left).toBe(
    positionByRender['second-2'].left
  )
  expect(positionByRender[`first-2`].left).toBe(
    positionByRender['second-1'].left
  )
})
