import * as React from 'react'

type Time = number

interface Animations {
  [id: string]: { animation: Animation }
}

interface FlipContext {
  forceRender: () => void
  cachedAnimations: React.MutableRefObject<Animations>
}

export const FlipContext = React.createContext<FlipContext>({
  forceRender: () => {},
  cachedAnimations: Object.create(null)
})

export const FlipProvider = ({ children }: { children: React.ReactNode }) => {
  const [forcedRenders, setForcedRenders] = React.useState(0)
  const cachedAnimations = React.useRef<Animations>(Object.create(null))

  const ctx = React.useMemo(() => {
    return {
      forceRender: () => setForcedRenders(forcedRenders + 1),
      cachedAnimations
    }
  }, [forcedRenders])

  return <FlipContext.Provider value={ctx}>{children}</FlipContext.Provider>
}
