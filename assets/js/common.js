/* Common JS for inner pages (maps, collector rates) */
(function () {
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  var toggle = document.querySelector(".mobile-menu-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    var setIcon = function (open) {
      var use = toggle.querySelector("use");
      if (use) use.setAttribute("href", "/assets/icons.svg#" + (open ? "i-times" : "i-bars"));
    };
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle("active");
      toggle.setAttribute("aria-expanded", String(open));
      setIcon(open);
    });
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target)) { nav.classList.remove("active"); setIcon(false); }
    });
  }

  var header = document.querySelector(".header");
  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.pageYOffset > 50);
    }, { passive: true });
  }
})();
