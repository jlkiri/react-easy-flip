import * as React from 'react'
import { isPaused, isRunning } from './helpers'

interface Animations {
  [flipId: string]: Animation
}

interface FlipContext {
  forceRender: () => void
  pauseAll: () => void
  resumeAll: () => void
  cachedAnimations: React.MutableRefObject<Animations>
}

export const FlipContext = React.createContext<FlipContext>({
  forceRender: () => {},
  pauseAll: () => {},
  resumeAll: () => {},
  cachedAnimations: Object.create(null)
})

export const FlipProvider = ({ children }: { children: React.ReactNode }) => {
  const [forcedRenders, setForcedRenders] = React.useState(0)
  const cachedAnimations = React.useRef<Animations>(Object.create(null))

  const ctx = React.useMemo(() => {
    return {
      forceRender: () => {
        setForcedRenders(forcedRenders + 1)
      },
      pauseAll: () => {
        /* for (const animation of Object.values(cachedAnimations.current)) {
          if (isRunning(animation)) {
            animation.pause()
          }
        } */
      },
      resumeAll: () => {
        /* for (const animation of Object.values(cachedAnimations.current)) {
          if (isPaused(animation)) {
            animation.play()
          }
        } */
      },
      cachedAnimations
    }
  }, [forcedRenders])

  return <FlipContext.Provider value={ctx}>{children}</FlipContext.Provider>
}
