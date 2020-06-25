// See https://developers.google.com/web/updates/2017/03/performant-expand-and-collapse

type CreateKeyframes = {
  sx: number
  sy: number
  dx?: number
  dy?: number
  easeFn: (x: number) => number
  calculateInverse?: boolean
}

let cachedEasings = new Map()
let cachedLoops = new Map()

const DELTA_THRESHOLD = 3

export const createSpringAnimation = ({
  sx = 1,
  sy = 1,
  dx = 0,
  dy = 0,
  stiffness = 300,
  damping = 10,
  mass = 1
}) => {
  let springLength = 1

  let x = dx

  let v = 0

  let k = -stiffness
  let d = -damping

  let animations = []
  let values = []

  let frames = 0

  let currSum = 0
  let avgX = 0
  let lastShifted = 0

  console.log('period', 2 * Math.PI * Math.sqrt(mass / stiffness))

  for (let step = 0; step <= 1000; step += 1) {
    let Fspring = k * (x - springLength)
    let Fdamping = d * v

    let a = (Fspring + Fdamping) / mass

    v += (a * 1) / 30

    x += (v * 1) / 30

    values.push(x)

    animations.push({
      transform: `translateX(${x}px)`
    })

    currSum = currSum + Math.abs(x)

    if (values.length > 60) {
      currSum = currSum - values[lastShifted]
      lastShifted++
    }

    avgX = currSum / animations.length

    if (values.length > 60 && avgX <= DELTA_THRESHOLD) {
      console.log('avg', avgX)
      console.log(`stopped at step ${step}`)
      frames = step
      break
    }
  }

  if (frames == 0) {
    frames = 1000
  }

  return { animations, frames }
}

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

  // Increase by 5, since by 1 works very poor in Firefox (but not in Chromium)
  for (let step = 0; step <= 100; step = step + 5) {
    // Remap the step value to an eased one.
    const nStep = step / 100
    const cachedV = cachedEasings.get(nStep)
    const easedStep = cachedV ? cachedV : easeFn(nStep)

    !cachedV && cachedEasings.set(nStep, easedStep)

    // Calculate the scale of the element.
    // easedStep grows from 0 to 1 according to the easing function.
    // To prevent changes when the scale value is 1 we substract it from 1 so that the multiplier is always 0
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
        transform: `scale(${invXScale}, ${invYScale}) translate(0px, 0px)`
      })
    }
  }

  cachedLoops.set(cacheKey, { animations, inverseAnimations })

  return {
    animations,
    inverseAnimations
  }
}
