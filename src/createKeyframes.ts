// See https://developers.google.com/web/updates/2017/03/performant-expand-and-collapse

type CreateKeyframes = {
  sx: number
  sy: number
  dx: number
  dy: number
  easeFn: (x: number) => number
  calculateInverse?: boolean
}

let cachedEasings = new Map()
let cachedLoops = new Map()

export const createKeyframes = ({
  sx = 1,
  sy = 1,
  dx = 0,
  dy = 0,
  easeFn,
  calculateInverse = false
}: CreateKeyframes) => {
  const cacheKey = `${Math.round(sx)}${Math.round(sy)}${Math.round(
    dx
  )}${Math.round(dy)}`
  const cachedLoop = cachedLoops.get(cacheKey)

  if (cachedLoop) return cachedLoop

  // Figure out the size of the element when collapsed.
  let animations = []
  let inverseAnimations = []

  // Decrease by 5, since by 1 works very poor in Firefox (but not in Chromium)
  for (let step = 0; step <= 100; step = step + 5) {
    // Remap the step value to an eased one.
    const nStep = step / 100
    const cachedV = cachedEasings.get(nStep)
    const easedStep = cachedV ? cachedV : easeFn(nStep)

    !cachedV && cachedEasings.set(nStep, easedStep)

    // Calculate the scale of the element.
    const scaleX = sx + (1 - sx) * easedStep
    const scaleY = sy + (1 - sy) * easedStep
    const translateX = dx - dx * easedStep
    const translateY = dy - dy * easedStep

    animations.push({
      transform: `scale(${scaleX}, ${scaleY}) translate(${translateX}px, ${translateY}px)`
    })

    if (calculateInverse) {
      // And now the inverse for the contents.
      const invXScale = 1 / scaleX
      const invYScale = 1 / scaleY

      // TODO: Counter-translations?
      inverseAnimations.push({
        transform: `scale(${invXScale}, ${invYScale})`
      })
    }
  }

  cachedLoops.set(cacheKey, { animations, inverseAnimations })

  return {
    animations,
    inverseAnimations
  }
}
