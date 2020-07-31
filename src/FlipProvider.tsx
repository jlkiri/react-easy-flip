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

export class SnapshotCapturer extends React.Component {
  static contextType = FlipContext

  getSnapshotBeforeUpdate() {
    console.debug('getSnapshotBeforeUpdate')
    const { cachedStyles, cachedAnimations } = this.context

    for (const flipId of cachedStyles.keys()) {
      const element = getElementByFlipId(flipId)

      if (not(emptyMap(cachedAnimations)) && element) {
        const cachedAnimation = cachedAnimations.get(flipId)

        if (cachedAnimation && isRunning(cachedAnimation)) {
          const v = cachedStyles.get(flipId)
          if (v) {
            syncLayout.prewrite(() => {
              cachedStyles.set(flipId, getRect(element))
            })
            syncLayout.render(() => {
              cachedAnimation.finish()
            })
          }
        }
      }
    }

    syncLayout.flush()
  }

  render() {
    return this.props.children
  }
}

export const FlipProvider = ({ children }: { children: React.ReactNode }) => {
  const [forcedRenders, setForcedRenders] = React.useState(0)
  const cachedAnimations = React.useRef<Animations>(new Map()).current
  const cachedStyles = React.useRef<CachedRects>(new Map()).current

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
      cachedStyles
    }
  }, [forcedRenders, cachedStyles, cachedAnimations])

  return (
    <FlipContext.Provider value={ctx}>
      <SnapshotCapturer>{children}</SnapshotCapturer>
    </FlipContext.Provider>
  )
}
