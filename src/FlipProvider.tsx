import * as React from 'react'
import { isPaused, isRunning } from './helpers'

export type Rect = DOMRect | ClientRect

export type CachedStyles = Map<string, { styles: any; rect: Rect }>

interface Animations {
  [flipId: string]: Animation
}

interface FlipContext {
  forceRender: () => void
  pauseAll: () => void
  resumeAll: () => void
  cachedAnimations: React.MutableRefObject<Animations>
  cachedPositions: CachedStyles
  childKeyCache: Map<string, React.ReactElement>
}

export const FlipContext = React.createContext<FlipContext>({
  forceRender: () => {},
  pauseAll: () => {},
  resumeAll: () => {},
  cachedAnimations: Object.create(null),
  cachedPositions: new Map(),
  childKeyCache: new Map()
})

export const FlipProvider = ({ children }: { children: React.ReactNode }) => {
  const [forcedRenders, setForcedRenders] = React.useState(0)
  const cachedAnimations = React.useRef<Animations>(Object.create(null))
  const cachedPositions = React.useRef<CachedStyles>(new Map()).current
  const childKeyCache = React.useRef(new Map<string, React.ReactElement>())
    .current

  const ctx = React.useMemo(() => {
    return {
      forceRender: () => {
        setForcedRenders(forcedRenders + 1)
      },
      pauseAll: () => {
        for (const animation of Object.values(cachedAnimations.current)) {
          if (isRunning(animation)) {
            animation.pause()
          }
        }
      },
      resumeAll: () => {
        for (const animation of Object.values(cachedAnimations.current)) {
          if (isPaused(animation)) {
            animation.play()
          }
        }
      },
      cachedAnimations,
      cachedPositions,
      childKeyCache
    }
  }, [forcedRenders])

  return <FlipContext.Provider value={ctx}>{children}</FlipContext.Provider>
}
