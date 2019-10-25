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
  const canonicalPositions = useRef(Object.create(null));

  const transition = opts.transition || 500;

  useEffect(() => {
    const onResize = debounce(() => {
      if (!root) return;

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
    const children = root.current.children;

    if (children.length < 1) return;

    // Save "canonical" coordinates on first render
    // These will be used to prevent transforms of in-flight elements
    for (let child of children) {
      canonicalPositions.current[
        child.dataset.id
      ] = child.getBoundingClientRect();
    }
  }, [root]);

  useLayoutEffect(() => {
    const canonicalTop = Object.values(canonicalPositions.current).map(
      pos => pos.top
    );
    const canonicalLeft = Object.values(canonicalPositions.current).map(
      pos => pos.left
    );

    const minTop = Math.min(...canonicalTop);
    const maxTop = Math.max(...canonicalTop);
    const minLeft = Math.min(...canonicalLeft);
    const maxLeft = Math.max(...canonicalLeft);

    const play = function play(elem) {
      elem.style.transform = ``;
      elem.style.transition = `transform ${transition}ms`;

      // Update saved DOM position on transition end to prevent
      // "in-flight" positions saved as previous
      const onTransitionEnd = function onTransitionEnd() {
        childCoords.current.refs[
          elem.dataset.id
        ] = elem.getBoundingClientRect();
        elem.removeEventListener("transitionend", onTransitionEnd);
      };

      elem.addEventListener("transitionend", onTransitionEnd);
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

          const noOverflowY =
            nextY >= minTop &&
            nextY <= maxTop &&
            prevY >= minTop &&
            prevY <= maxTop;
          const noOverflowX =
            nextX >= minLeft &&
            nextX <= maxLeft &&
            prevX >= minLeft &&
            prevX <= maxLeft;

          // Best effort to prevent transform of the children currently in animation
          // Otherwise, some children may move out of the viewport
          if (
            noOverflowY &&
            noOverflowX &&
            canonicalTop.includes(nextY) &&
            canonicalLeft.includes(nextX) &&
            canonicalTop.includes(prevY) &&
            canonicalLeft.includes(prevX)
          ) {
            invert(child)({ dx: deltaX, dy: deltaY });

            requestAnimationFrame(() => play(child));
          }
        }
      }
    });

    // Save new DOM positions
    for (let child of children) {
      const key = child.dataset.id;
      childCoords.current.refs[key] = child.getBoundingClientRect();
    }
  }, [deps, transition, root]);
}
