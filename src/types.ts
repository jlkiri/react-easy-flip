export type Position = { [x: string]: ClientRect | DOMRect }
export type UFAHook = (args: UFAHookArguments) => void
export type ITestElement = Pick<
  IElement,
  'reportPosition' | 'dataset' | 'inFlight'
> & { getBoundingClientRect: () => { top: number; left: number } }

export interface IElement extends HTMLElement {
  reportPosition?: (arg: Position) => void
  inFlight?: boolean
}

export interface UFAHookOptions {
  transition: number
  easing: string
  delay: number
}

export interface UFAHookArguments {
  root?: React.RefObject<HTMLElement>
  deps?: any
  opts?: UFAHookOptions
  __TEST__?: boolean
}

export interface TestRef {
  addEventListener?: (name: string, _: any) => void
  removeEventListener?: (name: string, _: any) => void
  children?: ITestElement[]
}
