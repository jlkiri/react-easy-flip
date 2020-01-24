import React, { useRef, useCallback, useState, useEffect } from 'react'
import './App.css'
import { useFlipGroup } from './useFlipGroup'
import { useSimpleFlip } from './useSimpleFlip'
import { useSharedElementTransition } from './useSharedTransition'

const noop = () => {}

function SharedTransitionApp() {
  const [clicked, setClicked] = useState(false)
  const [isTransitionOver, setisTransitionOver] = useState(false)

  const onTransitionEnd = useCallback(() => {
    setisTransitionOver(!isTransitionOver)
  }, [isTransitionOver])

  const flipId = 'test'

  useSharedElementTransition({
    flipId,
    dep: clicked,
    onTransitionEnd: onTransitionEnd
  })

  function handleClick() {
    setClicked(!clicked)
  }

  if (!clicked) {
    return (
      <>
        <div
          id={flipId}
          onClick={isTransitionOver ? noop : handleClick}
          className={'sq'}
        ></div>
      </>
    )
  }

  return (
    <section
      id={flipId}
      onClick={isTransitionOver ? handleClick : noop}
      className={'sq--w'}
    ></section>
  )
}

function SimpleFlipApp() {
  const ref = useRef(null)
  const [clicked, setClicked] = useState(false)

  //useSimpleFlip(ref, clicked)
  useSimpleFlip({ flipRef: ref, flag: clicked })

  function handleClick() {
    setClicked(!clicked)
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={'sq' + (clicked ? '--w' : '')}
    ></div>
  )
}

const shuffle = function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const itemCollection = [
  { id: 'a', text: 'This is random string number 1' },
  { id: 'b', text: 'This is random string number 2' },
  { id: 'c', text: 'This is random string number 3' },
  { id: 'd', text: 'This is random string number 4' },
  { id: 'e', text: 'This is random string number 5' },
  { id: 'f', text: 'This is random string number 6' },
  { id: 'g', text: 'This is random string number 7' },
  { id: 'h', text: 'This is random string number 8' },
  { id: 'i', text: 'This is random string number 9' }
]

function App() {
  const [items, setItems] = useState(itemCollection)
  const [buttonClickable, setButtonClickable] = useState(true)
  const verticalRef = useRef(null)

  const onTransitionEnd = useCallback(() => {
    setButtonClickable(true)
  }, [])

  useFlipGroup({ flipRoot: verticalRef, onTransitionEnd, deps: items })

  const shuffleItems = function shuffleItems() {
    const result = shuffle([...items])
    setItems(result)
    setButtonClickable(false)
  }

  const sortItems = function sortItems() {
    const result = [...items].sort(
      (a, b) => a.id.charCodeAt(0) - b.id.charCodeAt(0)
    )
    setItems(result)
    setButtonClickable(false)
  }

  return (
    <div className="container">
      <section>
        <button
          disabled={!buttonClickable}
          className="shuffle"
          onClick={shuffleItems}
        >
          Shuffle
        </button>
        <button
          disabled={!buttonClickable}
          className="shuffle"
          onClick={sortItems}
        >
          Sort
        </button>
      </section>
      <div ref={verticalRef} className="vroot">
        {items.map((item) => {
          return (
            <div className={'vitem'} data-id={item.id} key={item.id}>
              {item.text}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SharedTransitionApp
