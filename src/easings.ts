// https://easings.net/

export const linear = (x: number) => x
export const linearCSS = `linear`

export const easeInSine = (x: number) => 1 - Math.cos((x * Math.PI) / 2)
export const easeInSineCSS = `cubic-bezier(0.12, 0, 0.39, 0)`

export const easeOutSine = (x: number) => Math.sin((x * Math.PI) / 2)
export const easeOutSineCSS = `cubic-bezier(0.61, 1, 0.88, 1)`

export const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2
export const easeInOutSineCSS = `cubic-bezier(0.37, 0, 0.63, 1)`

export const easeInCubic = (x: number) => x ** 3
export const easeInCubicCSS = `cubic-bezier(0.32, 0, 0.67, 0)`

export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)
export const easeOutCubicCSS = `cubic-bezier(0.33, 1, 0.68, 1)`

export const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
export const easeInOutCubicCSS = `cubic-bezier(0.65, 0, 0.35, 1)`

export const easeInQuint = (x: number) => x ** 5
export const easeInQuintCSS = `cubic-bezier(0.64, 0, 0.78, 0)`

export const easeOutQuint = (x: number) => 1 - Math.pow(1 - x, 5)
export const easeOutQuintCSS = `cubic-bezier(0.22, 1, 0.36, 1)`

export const easeInOutQuint = (x: number) =>
  x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2
export const easeInOutQuintCSS = `cubic-bezier(0.83, 0, 0.17, 1)`

export const easeInBack = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return c3 * x * x * x - c1 * x * x
}
export const easeInBackCSS = `cubic-bezier(0.36, 0, 0.66, -0.56)`

export const easeOutBack = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}
export const easeOutBackCSS = `cubic-bezier(0.34, 1.56, 0.64, 1)`

export const easeInOutBack = (x: number) => {
  const c1 = 1.70158
  const c2 = c1 * 1.525

  return x < 0.5
    ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2
}
export const easeInOutBackCSS = `cubic-bezier(0.68, -0.6, 0.32, 1.6)`
