import * as React from 'react'
import { isPaused, isRunning } from './helpers'

export type Rect = DOMRect | ClientRect

export type CachedStyles = Map<string, { styles: any; rect: Rect }>
export type Animations = Map<string, Animation>
export type ChildKeyCache = Map<string, React.ReactElement>

interface FlipContext {
  forceRender: () => void
  pauseAll: () => void
  resumeAll: () => void
  cachedAnimations: Animations
  cachedStyles: CachedStyles
  childKeyCache: ChildKeyCache
}

export const FlipContext = React.createContext<FlipContext>({
  forceRender: () => {},
  pauseAll: () => {},
  resumeAll: () => {},
  cachedAnimations: new Map(),
  cachedStyles: new Map(),
  childKeyCache: new Map()
})

export const FlipProvider = ({ children }: { children: React.ReactNode }) => {
  const [forcedRenders, setForcedRenders] = React.useState(0)
  const cachedAnimations = React.useRef<Animations>(new Map()).current
  const cachedStyles = React.useRef<CachedStyles>(new Map()).current
  const childKeyCache = React.useRef(new Map()).current

  const ctx = React.useMemo(() => {
    return {
      forceRender: () => {
        setForcedRenders(forcedRenders + 1)
      },
      pauseAll: () => {
        for (const animation of cachedAnimations.values()) {
          if (isRunning(animation)) {
            animation.pause()
          }
        }
      },
      resumeAll: () => {
        for (const animation of cachedAnimations.values()) {
          if (isPaused(animation)) {
            animation.play()
          }
        }
      },
      cachedAnimations,
      cachedStyles,
      childKeyCache
    }
  }, [forcedRenders])

  return <FlipContext.Provider value={ctx}>{children}</FlipContext.Provider>
}
