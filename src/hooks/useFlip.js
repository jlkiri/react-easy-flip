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

  function onCancel(elem, cb) {
    return function() {
      cb();
      console.log("canceled");
      elem.removeEventListener("transitioncancel", onCancel);
    };
  }

  const registerAnimation = function registerAnimation(elem) {
    const key = elem.dataset.id;
    const elemInfo = domRefs.current.refs[key];
    const cb = () => (elemInfo.inFlight = false);
    elem.addEventListener("transitionend", function onTransitionEnd() {
      cb();
      console.log("finished");
      elem.removeEventListener("transitionend", onTransitionEnd);
    });

    elem.addEventListener("transitioncancel", onCancel(elem, cb));
  };

  const play = function play(elem) {
    elem.style.transform = ``;
    elem.style.transition = `transform ${transition}ms`;
  };

  const invert = function invert(elem) {
    return function _invert({ dx, dy }) {
      const key = elem.dataset.id;
      const elemInfo = domRefs.current.refs[key];

      //if (!elemInfo.inFlight) registerAnimation(elem);

      //elemInfo.inFlight = true;
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
        domRefs.current.refs[key].rect = child.getBoundingClientRect();
      }
    });

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [root]);

  useEffect(() => {
    // This runs after useLayoutEffect, which allows us to save
    // "previous" positions before next useLayoutEffect runs
    if (!root) return;

    const children = root.current.children;

    for (let child of children) {
      const key = child.dataset.id;
      if (!domRefs.current.refs[key]) {
        console.log("no key");
        domRefs.current.refs[key] = Object.create(null);
      }
      const childInfo = domRefs.current.refs[key];
      childInfo.rect = child.getBoundingClientRect();
    }
  }, [...deps, root]);

  useLayoutEffect(() => {
    if (!root) return;

    const children = root.current.children;

    if (children.length < 1) return;

    // Avoid keeping reference to current because it
    // updates faster than animations are done
    const domRefCopy = { ...domRefs.current.refs };

    requestAnimationFrame(() => {
      for (let child of children) {
        if (child.dataset.id in domRefCopy) {
          //child.removeEventListener("transitioncancel", onCancel);

          const coords = domRefCopy[child.dataset.id];

          let prevX = coords.rect.left;
          let prevY = coords.rect.top;

          /*if (domRefs.current.refs[child.dataset.id].inFlight) {
            console.log("inFlight");
            prevX = child.getBoundingClientRect().left;
            prevY = child.getBoundingClientRect().top;
            child.style.transition = "";
            child.style.transform = "";
          }*/

          const nextX = child.getBoundingClientRect().left;
          const nextY = child.getBoundingClientRect().top;

          const deltaX = prevX - nextX;
          const deltaY = prevY - nextY;

          invert(child)({ dx: deltaX, dy: deltaY });

          requestAnimationFrame(() => play(child));
        }
      }
    });
  }, [...deps, root]);
}
