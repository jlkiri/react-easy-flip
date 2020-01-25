import { useEffect, useLayoutEffect } from 'react'
import { invertScale } from './helpers'

export const usePreserveScale = (flipId: any, pscale: any, target: any, dep: any) => {
  useLayoutEffect(() => {
    const el = document.getElementById(flipId)
    if (!el) return
    if (!pscale.current) return
    for (const child of el.children as HTMLCollectionOf<HTMLElement>) {
      const rScaleX = 1 / pscale.current.scaleX
      const rScaleY = 1 / pscale.current.scaleY
      child.style.transform = `scale(${rScaleX}, ${rScaleY})`
    }
  }, [flipId, pscale, dep])

  useEffect(() => {
    let raf: any
    const el = document.getElementById(flipId)
    if (!el) return
    if (target.current == null) return
    function rescaleChild() {
      const inProgressRect = el!.getBoundingClientRect()
      for (const child of el!.children as HTMLCollectionOf<HTMLElement>) {
        const { scaleX, scaleY } = invertScale(inProgressRect, target.current)
        const rScaleX = 1 / scaleX
        const rScaleY = 1 / scaleY
        child.style.transform = `scale(${rScaleX}, ${rScaleY})`
        requestAnimationFrame(rescaleChild)
      }
    }
    raf = requestAnimationFrame(rescaleChild)
    return () => cancelAnimationFrame(raf)
  }, [flipId, target, dep])
}