/* eslint-disable no-loop-func */
/* eslint-disable no-console */

import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import useFlipAnimation from '../useFlipAnimation'
import { TestRef, Position } from '../useFlipAnimation/types'

it('Properly stores child state in a ref object', () => {
  const MAX_RENDERS = 2

  const rootRef = <React.MutableRefObject<TestRef>>React.createRef()
  const positionByRender: Position = {}

  let renderNumber = 1

  rootRef.current = {}

  // Mock listeners
  rootRef.current.addEventListener = (name, _) => {
    console.log(`${name} successfully added`)

    for (let child of rootRef.current.children!) {
      const key = child.dataset!.id!
      child.reportPosition = (pos) => {
        if (renderNumber <= MAX_RENDERS) {
          positionByRender[`${key}-${renderNumber}`] = pos[key]
        }
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

  const initialDeps = [{ id: 1, val: '1' }, { id: 2, val: '2' }]

  const initialArgs = {
    root: rootRef,
    deps: initialDeps,
    opts: { transition: 0 },
    __TEST__: true
  }

  const { rerender } = renderHook((args) => useFlipAnimation(args as any), {
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

  const nextDeps = [{ id: 2, val: '2' }, { id: 1, val: '1' }]

  renderNumber++

  const nextArgs = {
    root: rootRef,
    deps: nextDeps,
    opts: { transition: 0 },
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
