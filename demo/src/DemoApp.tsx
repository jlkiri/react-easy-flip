import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useHistory
} from 'react-router-dom'
import { ReactComponent as Uranus } from './planets/uranus.svg'
import { ReactComponent as Neptune } from './planets/neptune.svg'
import { ReactComponent as Pluto } from './planets/pluto.svg'
import { ReactComponent as Mercury } from './planets/mercury.svg'
import { ReactComponent as Venus } from './planets/venus.svg'
import { ReactComponent as Earth } from './planets/earth.svg'
import { ReactComponent as Mars } from './planets/mars.svg'
import { ReactComponent as Jupiter } from './planets/jupiter.svg'
import { ReactComponent as Saturn } from './planets/saturn.svg'
import { useFlipGroup } from 'react-easy-flip'
import { useSimpleFlip } from 'react-easy-flip'

import './planets.css'

const planets = [
  {
    id: 1,
    size: 2440,
    name: 'Mercury',
    description:
      'Mercury is the smallest and innermost planet in the Solar System. Its orbit around the Sun takes 87.97 days, the shortest of all the planets in the Solar System.',
    component: <Mercury />
  },
  {
    id: 2,
    size: 6052,
    name: 'Venus',
    description:
      'Venus is the second planet from the Sun. It is named after the Roman goddess of love and beauty. As the second-brightest natural object in the night sky after the Moon, Venus can cast shadows and, rarely, is visible to the naked eye in broad daylight.',
    component: <Venus />
  },
  {
    id: 3,
    size: 6371,
    name: 'Earth',
    description:
      'Earth is the third planet from the Sun and the only astronomical object known to harbor life. According to radiometric dating and other sources of evidence, Earth formed over 4.5 billion years ago. ',
    component: <Earth />
  },
  {
    id: 4,
    size: 3390,
    name: 'Mars',
    description:
      "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System after Mercury. In English, Mars carries a name of the Roman god of war and is often referred to as the 'Red Planet'.",
    component: <Mars />
  },
  {
    id: 5,
    size: 69911,
    name: 'Jupiter',
    description:
      'Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined.',
    component: <Jupiter />
  },
  {
    id: 6,
    size: 58232,
    name: 'Saturn',
    description:
      'Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius about nine times that of Earth.',
    component: <Saturn />
  },
  {
    id: 7,
    size: 25362,
    name: 'Uranus',
    description:
      'Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System.',
    component: <Uranus />
  },
  {
    id: 8,
    size: 24622,
    name: 'Neptune',
    description:
      'Neptune is the eighth and farthest known planet from the Sun in the Solar System. In the Solar System, it is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet. ',
    component: <Neptune />
  },
  {
    id: 9,
    size: 1188,
    name: 'Pluto',
    description:
      'Pluto is an icy dwarf planet in the Kuiper belt, a ring of bodies beyond the orbit of Neptune.',
    component: <Pluto />
  }
]

export const DemoApp: React.FC = () => {
  const [routeId, setRouteId] = useState('')
  const [routeChanged, setRouteChanged] = useState(false)

  useSimpleFlip({
    flipId: routeId,
    flag: routeChanged,
    isShared: true
  })

  function onRouteChange() {
    setRouteChanged(!routeChanged)
  }

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Dashboard setRouteId={setRouteId} onRouteChange={onRouteChange} />
        </Route>
        <Route path="/:planetId">
          <Planet
            routeId={routeId}
            setRouteId={setRouteId}
            onRouteChange={onRouteChange}
          />
        </Route>
      </Switch>
    </Router>
  )
}

const Planet = ({ routeId, setRouteId, onRouteChange }: any) => {
  const match = useRouteMatch<{ planetId: string }>()
  const history = useHistory()

  useEffect(() => {
    const unlisten = history.listen((location) => {
      onRouteChange()
      setRouteId(routeId)
    })
    return () => unlisten()
  })

  const planet = planets.find((planet) => planet.name === match.params.planetId)

  return (
    <div className="planet-full">
      <div className="planet-description">
        <div className="outer" id={routeId}>
          {planet!.component}
        </div>
        <div>{planet!.description}</div>
      </div>
      <Link to="/">Back</Link>
    </div>
  )
}

export const Dashboard = ({ setRouteId, onRouteChange }: any) => {
  const [items, setItems] = useState(planets)
  const [compactView, setCompactView] = useState(true)
  const [buttonClickable, setButtonClickable] = useState(true)

  const history = useHistory()

  const infoRef = useRef<HTMLDivElement | null>(null)

  const flipId = 'flipRoot'
  const flipGroupId = 'flipGroupId'

  const onTransitionEnd = useCallback(() => {
    setButtonClickable(true)
  }, [])

  useEffect(() => {
    const unlisten = history.listen((location) => {
      onRouteChange()
      setRouteId(location.pathname.slice(1))
    })
    return () => unlisten()
  })

  useSimpleFlip({
    flipId,
    flag: compactView,
    onTransitionEnd
  })

  useFlipGroup({
    flipId: flipGroupId,
    opts: {
      duration: 750
    },
    deps: compactView
  })

  useFlipGroup({
    flipId: flipGroupId,
    opts: {
      duration: 1000
    },
    deps: items
  })

  useEffect(() => {
    if (!compactView && infoRef.current) {
      for (const child of infoRef.current.children) {
        child.classList.remove('shifted')
      }
    }
  }, [compactView])

  function toggle() {
    setButtonClickable(false)
    setCompactView(!compactView)
  }

  function sortBySizeAsc() {
    const result = [...items].sort((a, b) => a.size - b.size)
    setItems(result)
  }

  function sortBySizeDesc() {
    const result = [...items].sort((a, b) => b.size - a.size)
    setItems(result)
  }

  function sortByOrderAsc() {
    const result = [...items].sort((a, b) => a.id - b.id)
    setItems(result)
  }

  function sortByOrderDesc() {
    const result = [...items].sort((a, b) => b.id - a.id)
    setItems(result)
  }

  const planetsClass = 'planets' + (compactView ? '--compact' : '')

  return (
    <div className="main">
      <Header />
      <Toggles
        toggleClickable={buttonClickable}
        sortByOrderAsc={sortByOrderAsc}
        sortByOrderDesc={sortByOrderDesc}
        sortBySizeAsc={sortBySizeAsc}
        sortBySizeDesc={sortBySizeDesc}
        expandToggle={toggle}
      />
      <div className="planet-container">
        <div id={flipId} className={planetsClass}>
          <div id={flipGroupId}>
            {items.map((item) => {
              return (
                <div
                  id={item.name}
                  key={item.id}
                  className="outer"
                  data-id={item.id}
                >
                  <Link to={item.name}>{item.component}</Link>
                </div>
              )
            })}
          </div>
        </div>
        {!compactView && (
          <div ref={infoRef} className={'planet-info'}>
            {items.map((item) => {
              return (
                <div className="planet-name shifted">
                  <Link to={item.name}>
                    <span>{item.name}</span>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="header">
      <span>Solar System Demo App</span>
      <span>
        <a href="https://github.com/jlkiri/react-easy-flip">react-easy-flip</a>
      </span>
    </header>
  )
}

interface ToggleProps {
  sortByOrderAsc: () => void
  sortByOrderDesc: () => void
  sortBySizeAsc: () => void
  sortBySizeDesc: () => void
  expandToggle: () => void
  toggleClickable: boolean
}

const Toggles: React.FC<ToggleProps> = ({
  sortByOrderAsc,
  sortByOrderDesc,
  sortBySizeAsc,
  sortBySizeDesc,
  expandToggle,
  toggleClickable
}) => {
  return (
    <div className="toggles">
      <div className="toggles-group">
        Sort by size: <button onClick={sortBySizeAsc}>From smallest</button>
        <button onClick={sortBySizeDesc}>From largest</button>
      </div>
      <div>
        Sort by distance from the Sun:{' '}
        <button onClick={sortByOrderAsc}>From closest</button>
        <button onClick={sortByOrderDesc}>From farthest</button>
      </div>
      <button disabled={!toggleClickable} onClick={expandToggle}>
        Expand / Compact
      </button>
    </div>
  )
}
