![minzipped](https://badgen.net/bundlephobia/minzip/react-easy-flip)

<p align="center">
  <img src="./assets/logo.gif" width='500px' alt='react-easy-flip animation logo' />
</p>

# React Easy Flip

<center><b>An extremely lightweight React library for smooth FLIP animations (807B minified + gzipped)</b></center>

## Demo

https://flip.jlkiri.now.sh/

## Install

`npm install react-easy-flip`  
OR  
`yarn add react-easy-flip`

## Get started

1. Import `useFlipAnimation` hook:

   ```javascript
   import { useFlipAnimation } from 'react-easy-flip'
   ```

   OR

   ```javascript
   const { useFlipAnimation } = require('react-easy-flip')
   ```

2. Attach a `ref` to the element that contains animated children
3. Attach a **unique** `data-id` prop to every child (it can be the same as a `key` prop, but make sure to follow the same rules that apply to keys)
4. Use the hook by passing it your `ref` and dependencies that you would normally pass to `useEffect` (e.g. an array that is used to render children):

   `useFlipAnimation({ root: yourRoot, deps: yourArray })`

## Comparison with other libraries

Unlike similar libraries such as [`react-overdrive`](https://github.com/berzniz/react-overdrive) or [`react-flip-toolkit`](https://github.com/aholachek/react-flip-toolkit), this library does **_not yet_ support animating opacity or scale**. It can only animate positions. The primary trade-off is the package size.

Additionally, this is the **only** FLIP library for React that provides animation via a hook. It does not use React class components and lifecycle methods that are considered unsafe in latest releases of React.

## Options

You may add an `opts` options object to the argument of `useFlipAnimation`. It allows you to specify transition duration, easing function and animation delay:

|    Field     | Default  |   Type   |                     Details                     |
| :----------: | :------: | :------: | :---------------------------------------------: |
| `transition` |  `500`   | `number` |      Transition duration (in milliseconds)      |
|   `easing`   | `"ease"` | `string` | Animation easing function (any valid CSS value) |
|   `delay`    |   `0`    | `number` |        Animation delay (in milliseconds)        |

Usage example:

```javascript
const opts = {
  transition: 700,
  easing: 'ease-out',
  delay: 300
}

useFlipAnimation({ root: rootRef, opts, deps: depArray })
```

## Examples

The code for the demo above can be found in this repository [here](https://github.com/jlkiri/react-easy-flip/tree/master/demo).

## Requirements

This library requires React version 16.8.0 or higher (the one with Hooks).

## In progress

- [ ] Add Typescript support
- [ ] Add support for animating scale and opacity
- [ ] Add comprehensive examples
