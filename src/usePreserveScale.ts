import { useEffect, useLayoutEffect, MutableRefObject } from 'react'

export const usePreserveScale = () => {}

// See https://developers.google.com/web/updates/2017/03/performant-expand-and-collapse
const createKeyframeAnimation = (x: number, y: number) => {
  // Figure out the size of the element when collapsed.
  let animations = []
  let inverseAnimations = []

  for (let step = 100; step >= 0; step--) {
    // Remap the step value to an eased one.
    let easedStep = ease(step / 100)

    // Calculate the scale of the element.
    const xScale = x + (1 - x) * easedStep
    const yScale = y + (1 - y) * easedStep

    animations.push({
      transform: `scale(${xScale}, ${yScale})`
    })

    // And now the inverse for the contents.
    const invXScale = 1 / xScale
    const invYScale = 1 / yScale

    inverseAnimations.push({
      transform: `scale(${invXScale}, ${invYScale})`
    })
  }

  return {
    animations,
    inverseAnimations
  }
}

function ease(v: number, pow = 4) {
  return 1 - Math.pow(1 - v, pow)
}
