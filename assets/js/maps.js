/* Maps: list filter (maps/index.html) + zoom viewer (maps/<map>.html) */

/* ---------- LIST PAGE: search + category filter ---------- */
(function () {
  var grid = document.getElementById("mapGrid");
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".map-card"));
  var input = document.getElementById("mapSearch");
  var chips = document.querySelectorAll(".chip-f");
  var countEl = document.getElementById("mapCount");
  var empty = document.getElementById("mapEmpty");
  var cat = "all";

  function norm(s) {
    return (s || "").toLowerCase().replace(/sector|sec\.?/g, "sec").replace(/[^a-z0-9]+/g, " ").trim();
  }
  cards.forEach(function (c) { c._k = norm(c.getAttribute("data-k")); });

  function apply() {
    var q = norm(input.value);
    var words = q ? q.split(" ") : [];
    var shown = 0;
    cards.forEach(function (c) {
      var okCat = cat === "all" || c.getAttribute("data-cat") === cat;
      var okQ = words.every(function (w) { return c._k.indexOf(w) !== -1; });
      var show = okCat && okQ;
      c.hidden = !show;
      if (show) shown++;
    });
    countEl.textContent = shown + (shown === 1 ? " map" : " maps");
    empty.hidden = shown !== 0;
  }

  input.addEventListener("input", apply);
  chips.forEach(function (ch) {
    ch.addEventListener("click", function () {
      chips.forEach(function (x) { x.classList.remove("is-active"); });
      ch.classList.add("is-active");
      cat = ch.getAttribute("data-cat");
      apply();
    });
  });
  // ?q=sector 14 support
  var p = new URLSearchParams(location.search).get("q");
  if (p) input.value = p;
  apply();
})();

/* ---------- MAP PAGE: pan / zoom viewer ---------- */
(function () {
  var box = document.getElementById("viewer");
  if (!box) return;
  var img = box.querySelector("img");
  var status = document.getElementById("viewerStatus");
  var hd = box.getAttribute("data-hd");
  var W = +box.getAttribute("data-w"), H = +box.getAttribute("data-h");
  var s = 1, x = 0, y = 0, minS = 0.05, maxS = 2.5;
  var pointers = new Map(), last = null, pinchD = 0, pinchS = 1, moved = false;

  img.style.width = W + "px";
  img.style.height = H + "px";

  function apply() { img.style.transform = "translate(" + x + "px," + y + "px) scale(" + s + ")"; }
  function clamp() {
    var bw = box.clientWidth, bh = box.clientHeight, iw = W * s, ih = H * s;
    x = iw <= bw ? (bw - iw) / 2 : Math.min(0, Math.max(bw - iw, x));
    y = ih <= bh ? (bh - ih) / 2 : Math.min(0, Math.max(bh - ih, y));
  }
  function fit() {
    s = minS = Math.min(box.clientWidth / W, box.clientHeight / H);
    maxS = Math.max(minS * 12, 2.5);
    x = y = 0; clamp(); apply();
  }
  function zoomAt(f, cx, cy) {
    var ns = Math.min(maxS, Math.max(minS, s * f));
    x = cx - (cx - x) * (ns / s);
    y = cy - (cy - y) * (ns / s);
    s = ns; clamp(); apply();
  }
  function rel(e) { var r = box.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function hideHint() { if (status) status.style.opacity = "0"; }

  box.addEventListener("wheel", function (e) {
    e.preventDefault(); hideHint();
    var p = rel(e); zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, p[0], p[1]);
  }, { passive: false });

  box.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".viewer-tools")) return;
    box.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, rel(e));
    moved = false;
    if (pointers.size === 1) { last = rel(e); box.classList.add("is-dragging"); }
    if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      pinchD = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]); pinchS = s;
    }
  });
  box.addEventListener("pointermove", function (e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, rel(e));
    if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      var d = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
      var cx = (pts[0][0] + pts[1][0]) / 2, cy = (pts[0][1] + pts[1][1]) / 2;
      zoomAt((pinchS * d / pinchD) / s, cx, cy); moved = true; hideHint();
    } else if (pointers.size === 1 && last) {
      var p = rel(e);
      if (Math.abs(p[0] - last[0]) + Math.abs(p[1] - last[1]) > 2) moved = true;
      x += p[0] - last[0]; y += p[1] - last[1]; last = p; clamp(); apply();
    }
  });
  function up(e) {
    pointers.delete(e.pointerId);
    if (pointers.size === 1) last = Array.from(pointers.values())[0];
    if (pointers.size === 0) { last = null; box.classList.remove("is-dragging"); }
  }
  box.addEventListener("pointerup", up);
  box.addEventListener("pointercancel", up);
  box.addEventListener("dblclick", function (e) { var p = rel(e); hideHint(); zoomAt(2, p[0], p[1]); });

  var lastTap = 0;
  box.addEventListener("pointerup", function (e) {
    if (e.pointerType !== "touch" || moved) return;
    var now = Date.now();
    if (now - lastTap < 300) { var p = rel(e); hideHint(); zoomAt(2, p[0], p[1]); lastTap = 0; } else lastTap = now;
  });

  function c() { return [box.clientWidth / 2, box.clientHeight / 2]; }
  document.getElementById("zIn").onclick = function () { var p = c(); hideHint(); zoomAt(1.5, p[0], p[1]); };
  document.getElementById("zOut").onclick = function () { var p = c(); zoomAt(1 / 1.5, p[0], p[1]); };
  document.getElementById("zFit").onclick = fit;
  var fs = document.getElementById("zFull");
  if (fs) fs.onclick = function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (box.requestFullscreen) box.requestFullscreen();
  };
  document.addEventListener("fullscreenchange", function () { setTimeout(fit, 60); });
  window.addEventListener("resize", fit);

  fit();

  // load HD image after the preview is shown
  var big = new Image();
  big.decoding = "async";
  big.onload = function () {
    img.src = hd;
    if (status) status.textContent = "HD loaded • pinch / scroll to zoom";
    setTimeout(hideHint, 4000);
  };
  big.src = hd;

  // share + copy
  var share = document.getElementById("shareBtn");
  if (share) share.onclick = function () {
    var data = { title: document.title, url: location.href };
    if (navigator.share) navigator.share(data).catch(function () {});
    else window.open("https://wa.me/?text=" + encodeURIComponent(document.title + " " + location.href), "_blank", "noopener");
  };
  var copy = document.getElementById("copyBtn");
  if (copy) copy.onclick = function () {
    navigator.clipboard.writeText(location.href).then(function () {
      var t = copy.querySelector("span"); var o = t.textContent; t.textContent = "Copied!";
      setTimeout(function () { t.textContent = o; }, 1500);
    });
  };
})();
