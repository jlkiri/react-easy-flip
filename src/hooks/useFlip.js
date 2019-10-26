import { useRef, useEffect, useLayoutEffect } from "react";

const debounce = function debounce(fn) {
  let timer;
  return function _debounce(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args));
  };
};

export default function useFlipAnimation({ root, opts, deps }) {
  const childCoords = useRef({ refs: Object.create(null) });

  const transition = opts.transition || 500;
  const delay = opts.delay || 0;
  const easing = opts.easing || "ease";

  useEffect(() => {
    if (!root.current) return;

    const rootCopy = root.current;

    // Update saved DOM position on transition end to prevent
    // "in-flight" positions saved as previous
    const onTransitionEnd = function onTransitionEnd(e) {
      const targetKey = e.target.dataset.id;
      childCoords.current.refs[targetKey] = e.target.getBoundingClientRect();
      e.target.inFlight = false;
    };

    rootCopy.addEventListener("transitionend", onTransitionEnd);
    return () => rootCopy.removeEventListener("transitionend", onTransitionEnd);
  }, [root, deps]);

  useEffect(() => {
    const onResize = debounce(() => {
      if (!root.current) return;

      const children = root.current.children;
      for (let child of children) {
        const key = child.dataset.id;
        childCoords.current.refs[key] = child.getBoundingClientRect();
      }
    });

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [root]);

  useLayoutEffect(() => {
    if (!root.current) return;

    const play = function play(elem) {
      elem.style.transform = ``;
      elem.style.transition = `transform ${transition}ms ${easing} ${delay}ms`;
      elem.inFlight = true;
    };

    const invert = function invert(elem) {
      return function _invert({ dx, dy }) {
        elem.style.transform = `translate(${dx}px, ${dy}px)`;
        elem.style.transition = `transform 0s`;
      };
    };

    const children = root.current.children;

    if (children.length < 1) return;

    // Clone ref content because it is updated faster than rAF executes
    const childCoordCopy = { ...childCoords.current.refs };

    requestAnimationFrame(() => {
      for (let child of children) {
        const key = child.dataset.id;

        if (key in childCoordCopy) {
          const coords = childCoordCopy[key];

          // Calculate delta of old and new DOM positions for transform
          const prevX = coords.left;
          const prevY = coords.top;

          const nextX = child.getBoundingClientRect().left;
          const nextY = child.getBoundingClientRect().top;

          const deltaX = prevX - nextX;
          const deltaY = prevY - nextY;

          invert(child)({ dx: deltaX, dy: deltaY });

          requestAnimationFrame(() => play(child));
        }
      }
    });

    // Save new DOM positions
    for (let child of children) {
      const key = child.dataset.id;
      if (!child.inFlight) {
        childCoords.current.refs[key] = child.getBoundingClientRect();
      }
    }
  }, [deps, transition, delay, easing, root]);
}
