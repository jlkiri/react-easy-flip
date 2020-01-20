import React, { useState, useRef } from 'react'
import { useFlipAnimation } from './hook/useFlipAnimation'
import './App.css'

const shuffle = function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const itemCollection = [
  { id: 1, text: 'This is random string number 1' },
  { id: 2, text: 'This is random string number 2' },
  { id: 3, text: 'This is random string number 3' },
  { id: 4, text: 'This is random string number 4' },
  { id: 5, text: 'This is random string number 5' },
  { id: 6, text: 'This is random string number 6' },
  { id: 7, text: 'This is random string number 7' },
  { id: 8, text: 'This is random string number 8' },
  { id: 9, text: 'This is random string number 9' }
]

const Shuffle = () => {
  const [items, setItems] = useState(itemCollection)
  const verticalRef = useRef(null)
  const horizontalRef = useRef(null)

  useFlipAnimation({
    root: verticalRef,
    deps: items
  })

  useFlipAnimation({
    root: horizontalRef,
    opts: {
      transition: 700
    },
    deps: items
  })

  const shuffleItems = function shuffleItems() {
    const result = shuffle([...items])
    setItems(result)
  }

  const sortItems = function sortItems() {
    const result = [...items].sort((a, b) => a.id - b.id)
    setItems(result)
  }

  return (
    <>
      <section>
        <button className="shuffle" onClick={shuffleItems}>
          Shuffle
        </button>
        <button className="shuffle" onClick={sortItems}>
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
      <div ref={horizontalRef} className="hroot">
        {items.map((item) => {
          return (
            <div className={'hitem'} data-id={item.id} key={item.id}>
              {item.id}
            </div>
          )
        })}
      </div>
    </>
  )
}

const SimpleScale = () => {
  const ref = useRef(null)
  const [clicked, setClicked] = useState(false)

  useFlipAnimation({
    root: ref,
    opts: {
      transition: 700,
      delay: 0,
      easing: 'ease',
      transformOrigin: 'top left'
    },
    deps: clicked
  })

  return (
    <div className="square-wrapper" ref={ref}>
      <div
        data-id="unique"
        onClick={() => setClicked(!clicked)}
        className={`square${clicked ? '--moved' : ''}`}
      ></div>
    </div>
  )
}

type Examples = { [name: string]: JSX.Element }

const examples: Examples = {
  none: <div></div>,
  shuffle: <Shuffle />,
  simpleScale: <SimpleScale />
}

function App() {
  const [example, setExample] = useState('none')
  return (
    <div>
      <button onClick={() => setExample('shuffle')}>Shuffle</button>
      <button onClick={() => setExample('simpleScale')}>Simple scale</button>
      <div className="container">{examples[example]}</div>
    </div>
  )
}

export default App
