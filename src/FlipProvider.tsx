import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback
} from 'react'

export const FlipContext = React.createContext(() => {})

export const FlipProvider = ({ children }: { children: React.ReactNode }) => {
  const [forcedRenders, setForcedRenders] = useState(0)
  const forceRender = useCallback(() => setForcedRenders(forcedRenders + 1), [
    forcedRenders
  ])
  return (
    <FlipContext.Provider value={forceRender}>{children}</FlipContext.Provider>
  )
}
