import * as React from 'react'
import {
  emptyMap,
  getElementByFlipId,
  getRect,
  isPaused,
  isRunning,
  not
} from './helpers'
import { syncLayout } from './syncLayout'

export type Rect = DOMRect | ClientRect

export type CachedRects = Map<string, Rect>
export type Animations = Map<string, Animation>

interface FlipContext {
  forceRender: () => void
  pauseAll: () => void
  resumeAll: () => void
  cachedAnimations: Animations
  cachedStyles: CachedRects
}

export const FlipContext = React.createContext<FlipContext>({
  forceRender: () => {},
  pauseAll: () => {},
  resumeAll: () => {},
  cachedAnimations: new Map(),
  cachedStyles: new Map()
})

export const useCache = () => {
  const [forcedRenders, setForcedRenders] = React.useState(0)
  const cachedAnimation = React.useRef<Animation>()
  const cachedRect = React.useRef<Rect>()

  const ctx = {
    forceRender: () => {
      setForcedRenders(forcedRenders + 1)
    },
    pause: () => {
      if (cachedAnimation.current && isRunning(cachedAnimation.current)) {
        cachedAnimation.current.pause()
      }
    },
    resume: () => {
      if (cachedAnimation.current && isPaused(cachedAnimation.current)) {
        cachedAnimation.current.play()
      }
    },
    cachedAnimation,
    cachedRect
  }

  return ctx
}
