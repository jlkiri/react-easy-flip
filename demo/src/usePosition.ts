import { useRef } from 'react'
import { Position } from './types'

export const usePosition = (initialPosition: Position | null = null) => {
  const cachedPosition = useRef<Position | null>(initialPosition)
  return {
    isNull() {
      return cachedPosition.current == null
    },
    getPosition() {
      return cachedPosition.current
    },
    updatePosition(newPosition: Position) {
      cachedPosition.current = newPosition
    }
  }
}
