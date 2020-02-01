import React, { useCallback, useState } from 'react'
import './App.css'
import { useFlipGroup } from 'react-easy-flip'
import { useSimpleFlip } from 'react-easy-flip'

function SharedTransitionApp() {
  const [clicked, setClicked] = useState(false)
  const [id, setId] = useState('')

  const items = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: 10 }
  ]

  useSimpleFlip({
    flipId: id,
    flag: clicked,
    isShared: true
  })

  function handleClick(id: string) {
    setId(id)
    setClicked(!clicked)
  }

  if (!clicked) {
    return (
      <>
        {items.map((item, i) => {
          return (
            <div
              id={item.id.toString()}
              onClick={() => handleClick(item.id.toString())}
              className={'minisq'}
            >
              <div className={'circle'}>
                <div className="innerCircle"></div>
              </div>
            </div>
          )
        })}
      </>
    )
  }

  return (
    <section id={id} onClick={() => handleClick(id)} className={'bigsq'}>
      <div className={'circle'}>
        <div className="innerCircle"></div>
      </div>
    </section>
  )
}

function SimpleFlipApp() {
  const [clicked, setClicked] = useState(false)

  const flipId = 'simple'

  useSimpleFlip({ flipId, noPreserve: false, flag: clicked })

  function handleClick() {
    setClicked(!clicked)
  }

  return (
    <div
      id={flipId}
      onClick={handleClick}
      className={'sq' + (clicked ? '--w' : '')}
    >
      <div className="circle"></div>
    </div>
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

  const flipId = 'flipRoot'

  const onTransitionEnd = useCallback(() => {
    setButtonClickable(true)
  }, [])

  useFlipGroup({
    flipId,
    opts: { duration: 1800 },
    onTransitionEnd,
    deps: items
  })

  const shuffleItems = function shuffleItems() {
    let result = shuffle([...items])
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
      <div id={flipId} className="vroot">
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

export default SimpleFlipApp
