/*eslint no-unused-expressions: "off"*/ var t = require("react");
exports.useFlipAnimation = function(e) {
  var n = e.root,
    r = e.opts,
    i = e.deps,
    a = t.useRef({ refs: Object.create(null) }),
    o = r.transition || 500,
    s = r.delay || 0,
    u = r.easing || "ease";
  t.useEffect(
    function() {
      if (n.current) {
        var t = n.current,
          e = function(t) {
            (a.current.refs[
              t.target.dataset.id
            ] = t.target.getBoundingClientRect()),
              (t.target.inFlight = !1);
          };
        return (
          t.addEventListener("transitionend", e),
          function() {
            return t.removeEventListener("transitionend", e);
          }
        );
      }
    },
    [n, i]
  ),
    t.useEffect(
      function() {
        var t,
          e,
          r =
            ((t = function() {
              if (n.current)
                for (var t = 0, e = n.current.children; t < e.length; t += 1) {
                  var r = e[t];
                  a.current.refs[r.dataset.id] = r.getBoundingClientRect();
                }
            }),
            function() {
              for (var n = [], r = arguments.length; r--; ) n[r] = arguments[r];
              clearTimeout(e),
                (e = setTimeout(function() {
                  return t.apply(void 0, n);
                }));
            });
        return (
          window.addEventListener("resize", r),
          function() {
            return window.removeEventListener("resize", r);
          }
        );
      },
      [n]
    ),
    t.useLayoutEffect(
      function() {
        if (n.current) {
          var t = n.current.children;
          if (!(t.length < 1)) {
            var e = Object.assign({}, a.current.refs);
            requestAnimationFrame(function() {
              for (
                var n = function() {
                    var t,
                      n = i[r],
                      a = n.dataset.id;
                    if ((a in e)) {
                      var f = e[a],
                        c = f.left,
                        d = f.top,
                        l = n.getBoundingClientRect().left,
                        g = n.getBoundingClientRect().top;
                      ((t = n),
                      function(e) {
                        (t.style.transform =
                          "translate(" + e.dx + "px, " + e.dy + "px)"),
                          (t.style.transition = "transform 0s");
                      })({ dx: c - l, dy: d - g }),
                        requestAnimationFrame(function() {
                          return (
                            ((t = n).style.transform = ""),
                            (t.style.transition =
                              "transform " + o + "ms " + u + " " + s + "ms"),
                            void (t.inFlight = !0)
                          );
                          var t;
                        });
                    }
                  },
                  r = 0,
                  i = t;
                r < i.length;
                r += 1
              )
                n();
            });
            for (var r = 0, i = t; r < i.length; r += 1) {
              var f = i[r];
              f.inFlight ||
                (a.current.refs[f.dataset.id] = f.getBoundingClientRect());
            }
          }
        }
      },
      [i, o, s, u, n]
    );
};
//# sourceMappingURL=index.js.map
