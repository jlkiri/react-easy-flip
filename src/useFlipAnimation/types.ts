export type Position = { [x: string]: ClientRect | DOMRect };

export interface UFAHookArguments {
  root?: React.RefObject<HTMLElement>,
  deps?: any,
  opts?: any,
  __TEST__?: boolean
}

export interface TestRef {
  addEventListener?: (name: string, _: any) => void;
  removeEventListener?: (name: string, _: any) => void;
  children?: ITestElement[]
}

export type UFAHook = (args: UFAHookArguments) => void;

export interface IElement extends HTMLElement {
  reportPosition?: (arg: Position) => void,
  inFlight?: boolean
}

export type ITestElement = Pick<IElement, 'reportPosition' | 'dataset' | 'inFlight'>
  & { getBoundingClientRect: () => { top: number, left: number } }