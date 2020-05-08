// See https://developers.google.com/web/updates/2017/03/performant-expand-and-collapse

type CreateKeyframes = {
  sx: number
  sy: number
  dx: number
  dy: number
  calculateInverse?: boolean
}

export const createKeyframes = ({
  sx,
  sy,
  dx,
  dy,
  calculateInverse = false
}: CreateKeyframes) => {
  // Figure out the size of the element when collapsed.
  let animations = []
  let inverseAnimations = []

  for (let step = 100; step >= 0; step--) {
    // Remap the step value to an eased one.
    let easedStep = ease(step / 100)

    // Calculate the scale of the element.
    const scaleX = sx + (1 - sx) * easedStep
    const scaleY = sy + (1 - sy) * easedStep
    const translateX = dx - dx * easedStep
    const translateY = dy - dy * easedStep

    console.log(scaleX, scaleY, translateX, translateY)

    animations.push({
      transform: `scale(${scaleX}, ${scaleY}) translate(${translateX}px, ${translateY}px)`
    })

    if (calculateInverse) {
      // And now the inverse for the contents.
      const invXScale = 1 / scaleX
      const invYScale = 1 / scaleY

      inverseAnimations.push({
        transform: `scale(${invXScale}, ${invYScale})`
      })
    }
  }

  return {
    animations,
    inverseAnimations
  }
}

function ease(v: number, pow = 4) {
  return 1 - Math.pow(1 - v, pow)
}
