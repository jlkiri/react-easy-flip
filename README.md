![minzipped](https://badgen.net/bundlephobia/minzip/react-easy-flip@3.0.0)

<p align="center">
  <img src="./assets/logo.gif" width='500px' alt='react-easy-flip animation logo' />
</p>

# React Easy Flip

⚛ A lightweight React library for smooth FLIP animations

## Features

- Animates the unanimatable (DOM positions, mounts/unmounts)

- One hook for many usecases

- Uses the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) (WAAPI)

* Stable and smooth 60fps animations

- SSR-friendly

* Built-in easing functions

- Super lightweight

## Demo

Demo link goes here.

Repository: [react-easy-flip-demo](https://github.com/jlkiri/react-easy-flip-demo)

## Install

`npm install react-easy-flip`

## Get started

1. Import `useFlip` hook and `FlipProvider`:

```javascript
import { useFlip, FlipProvider } from 'react-easy-flip'
```

2. Wrap your app (or at least a component that contains animated children) with a `FlipProvider`

```jsx
<FlipProvider>
  <MyApp />
</FlipProvider>
```

3. Assign a `data-flip-root-id` to any parent of the element(s) you want to animate

```jsx
<div data-flip-root-id="flip-root">
  <AnimatedChildren>
</div>
```

4. Pick a unique `data-flip-id` and assign it to the element(s) you want to animate. It can be the same as a `key` prop

```jsx
<img data-flip-id="animated-image" />
```

5. Use the hook by passing it the root ID you picked in (3)

```javascript
useFlip(rootId)
```

And that's it!

## Usage details

### useFlip

`useFlip` requires one argument, which is an ID of the root, i.e. any parent whose children you want to animate. You can optionally pass an options object with animation options (see details below) as a second argument. Third argument is the optional dependencies which you would normally pass to a `useEffect` hook: use it if you need to explicitly tell `react-easy-flip` that items you want to animate changed.

```
useFlip(rootId, animationOptions, deps)
```

#### Animation optons

Animation options is an object.

|    Property    |    Default     | Required |    Type    |                                           Details                                            |
| :------------: | :------------: | :------: | :--------: | :------------------------------------------------------------------------------------------: |
|   `duration`   |      400       | `false`  |  `number`  |                                   Animation duration (ms)                                    |
|    `easing`    | `easeOutCubic` | `false`  | `function` |                Easing function (that can be imported from `react-easy-flip`)                 |
|    `delay`     |       0        | `false`  |  `number`  |                                       Animation delay                                        |
| `animateColor` |     false      | `false`  | `boolean`  | A boolean that says whether background color of the animated element should also be animated |

Example:

```javascript
import { easeInOutQuint } from 'react-easy-flip`

const SomeReactComponent = () => {
  const animationOptions = {
    duration: 2000,
    easing: easeInOutQuint,
  }

  useFlip(rootId, animationOptions)

  return (
    <div data-flip-root-id="root">
      <div data-flip-id="flipped" />
    </div>
  )
}
```

## Comparison with other libraries

- `react-easy-flip` uses Web Animations API (WAAPI) for animations. No other library based on a [FLIP technique](https://aerotwist.com/blog/flip-your-animations/) currently does that.

- Similar to existing libraries such as [`react-overdrive`](https://github.com/berzniz/react-overdrive), [`react-flip-move`](https://github.com/joshwcomeau/react-flip-move) or [`react-flip-toolkit`](https://github.com/aholachek/react-flip-toolkit) (although only the latter seems to be maintained).

- Allows you to easily do so-called [shared layout animations](https://guides.codepath.com/android/shared-element-activity-transition) (e.g. smoothly move an element from one page/parent to another). Some examples are given below. This is what heavier libraries like [`framer-motion`](https://github.com/framer/motion) call Magic Motion.

- Additionally, `react-easy-flip` is the **only** lightweight FLIP library for React that provides animation via a hook. Currently `react-easy-flip` has the **smallest bundle size**. It also does not use React class components and lifecycle methods that are considered unsafe in latest releases of React.

## Recipes

### List sort/shuffle animation

[Go to code](https://github.com/jlkiri/react-easy-flip-demo/blob/master/pages/Shuffle.tsx)

<p align="center">
  <img src="./assets/simpleshuffle.gif" width='300px' alt='simple shuffle animation' />
</p>

### Both x and y coordinate shuffle

[Go to code](https://github.com/jlkiri/react-easy-flip-demo/blob/master/pages/auto-shuffle.tsx)

<p align="center">
  <img src="./assets/autoshuffle.gif" width='300px' alt='auto shuffle animation' />
</p>

### Shared layout animation

This is an todo-app-like example of shared layout animations. Click on any rectangle to move it to another parent. Note that on every click an item is actually unmounted from DOM and re-mounted in the other position, but having the same `data-flip-id` allows to be smoothly animated from one to another position.

[Go to code](https://github.com/jlkiri/react-easy-flip-demo/blob/master/pages/shared-layout.tsx)

<p align="center">
  <img src="./assets/sharedlayout.gif" width='400px' alt='shared layout  animation' />
</p>

### In/out (mount/unmount) animation (opacity)

The fade in and out keyframes are default and work out of box (= you do not need to explicitly pass them).

[Go to code](https://github.com/jlkiri/react-easy-flip-demo/blob/master/pages/in-out.tsx)

<p align="center">
  <img src="./assets/inout.gif" width='300px' alt='shared layout  animation' />
</p>

### In/out (mount/unmount) animation (translation)

An example of passing custom animation options to `<AnimateInOut>`. Here the images are moved in and out instead of simply fading in and out.

[Go to code](https://github.com/jlkiri/react-easy-flip-demo/blob/master/pages/in-out-pic.tsx)

<p align="center">
  <img src="./assets/inoutpic2.gif" width='400px' alt='shared layout  animation' />
</p>

## Requirements

This library requires React version 16.8.0 or higher (the one with Hooks).

## Done in 3.0

- [x] Full Typescript support
- [x] Add support for animating scale and shared element transitions
- [x] Add comprehensive examples
- [x] Add tests
