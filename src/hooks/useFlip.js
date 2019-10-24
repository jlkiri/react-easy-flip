import { useRef, useEffect, useLayoutEffect } from "react";

const debounce = function debounce(fn) {
  let timer;
  return function _debounce(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args));
  };
};

export default function useFlipAnimation({ root, opts, deps }) {
  const domRefs = useRef({ refs: Object.create(null) });

  const transition = opts.transition || 500;

  const play = function play(elem) {
    elem.style.transform = ``;
    elem.style.transition = `transform ${transition}ms`;
  };

  const invert = function invert(elem) {
    return function _invert({ dx, dy }) {
      elem.style.transform = `translate(${dx}px, ${dy}px)`;
      elem.style.transition = `transform 0s`;
    };
  };

  useEffect(() => {
    const onResize = debounce(() => {
      if (!root) return;

      const children = root.current.children;
      for (let child of children) {
        const key = child.dataset.id;
        domRefs.current.refs[key] = child.getBoundingClientRect();
      }
    });

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [root]);

  useLayoutEffect(() => {
    if (!root) return;

    const children = root.current.children;

    if (children.length < 1) return;

    requestAnimationFrame(() => {
      for (let child of children) {
        const key = child.dataset.id;

        if (key in domRefs.current.refs) {
          const coords = domRefs.current.refs[key];

          // Calculate delta of old and new DOM positions for transform
          let prevX = coords.left;
          let prevY = coords.top;

          const nextX = child.getBoundingClientRect().left;
          const nextY = child.getBoundingClientRect().top;

          const deltaX = prevX - nextX;
          const deltaY = prevY - nextY;

          invert(child)({ dx: deltaX, dy: deltaY });

          requestAnimationFrame(() => play(child));
        }

        // Save new DOM positions
        domRefs.current.refs[key] = child.getBoundingClientRect();
      }
    });
  }, [deps, root]);
}
