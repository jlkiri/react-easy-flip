import React, { useState, useCallback } from 'react'
import { ReactComponent as Uranus } from './planets/uranus.svg'
import { ReactComponent as Neptune } from './planets/neptune.svg'
import { ReactComponent as Pluto } from './planets/pluto.svg'
import { ReactComponent as Mercury } from './planets/mercury.svg'
import { ReactComponent as Venus } from './planets/venus.svg'
import { ReactComponent as Earth } from './planets/earth.svg'
import { ReactComponent as Mars } from './planets/mars.svg'
import { ReactComponent as Jupiter } from './planets/jupiter.svg'
import { ReactComponent as Saturn } from './planets/saturn.svg'
import './planets.css'
import { useFlipGroup } from 'react-easy-flip'
import { useSimpleFlip } from 'react-easy-flip'

const itemCollection = [
  { id: 1, comp: <Mercury /> },
  { id: 2, comp: <Venus /> },
  { id: 3, comp: <Earth /> },
  { id: 4, comp: <Mars /> },
  { id: 5, comp: <Jupiter /> },
  { id: 6, comp: <Saturn /> },
  { id: 7, comp: <Uranus /> },
  { id: 8, comp: <Neptune /> },
  { id: 9, comp: <Pluto /> }
]

const shuffle = function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function TestApp() {
  // const [items, setItems] = useState(itemCollection)
  const [flag, setFlag] = useState(false)

  const flipId = 'flipRoot'
  const flipGroupId = 'flipGroupId'

  /* const onTransitionEnd = useCallback(() => {
    setButtonClickable(true)
  }, []) */

  useSimpleFlip({
    flipId,
    flag
  })

  useFlipGroup({
    flipId: flipGroupId,
    deps: flag
  })

  const toggle = function toggle() {
    // let result = shuffle([...items])
    // setItems(result)
    setFlag(!flag)
    // setButtonClickable(false)
  }

  return (
    <div id={flipId} className={'planets' + (flag ? '--f' : '')}>
      <div id={flipGroupId}>
        <div onClick={toggle} className="outer" data-id="1">
          <div className="inner"></div>
        </div>
        <div onClick={toggle} className="outer" data-id="2">
          <div className="inner"></div>
        </div>
        <div onClick={toggle} className="outer" data-id="3">
          <div className="inner"></div>
        </div>
      </div>
    </div>
  )
}
