import { renderHook } from '@testing-library/react-hooks'
import React, { useRef } from 'react'
import useFlipAnimation from './'

it('hooks', () => {
  const rootRef = React.createRef()
  const childInfo = {}

  rootRef.current = {}

  // Mock listeners
  rootRef.current.testCb = (obj) => console.log(obj)
  rootRef.current.addEventListener = (name, cb) => {
    console.log(`${name} added`)
    const event = {
      target: rootRef.current.children[0]
    }
    console.log(cb(event))
  }
  rootRef.current.removeEventListener = (name, cb) => {
    console.log(`${name} removed`)
    const event = {
      target: rootRef.current.children[0]
    }
    console.log(cb(event))
  }

  // Mock children
  rootRef.current.children = [
    {
      dataset: {
        id: 1
      },
      getBoundingClientRect() {
        return { top: 0, left: 100 }
      }
    },
    {
      dataset: {
        id: 2
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
    opts: { transition: 0 }
  }

  const { rerender } = renderHook((args) => useFlipAnimation(args), {
    initialProps: initialArgs
  })

  rootRef.current.children = [
    {
      dataset: {
        id: 1
      },
      getBoundingClientRect() {
        return { top: 0, left: 150 }
      }
    },
    {
      dataset: {
        id: 2
      },
      getBoundingClientRect() {
        return { top: 0, left: 100 }
      }
    }
  ]

  const nextDeps = [{ id: 2, val: '2' }, { id: 1, val: '1' }]

  const nextArgs = {
    root: rootRef,
    deps: nextDeps,
    opts: { transition: 0 }
  }

  rerender(nextArgs)
})
