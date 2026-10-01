/* Collector rates page */
(function () {
  var root = document.getElementById("rates");
  if (!root) return;
  var yearTabs = document.querySelectorAll(".year-tab");
  var sheetBox = document.getElementById("sheetTabs");
  var input = document.getElementById("rateSearch");
  var meta = document.getElementById("rateMeta");
  var thead = document.querySelector("#rateTable thead");
  var tbody = document.querySelector("#rateTable tbody");
  var more = document.getElementById("moreRow");
  var cache = {}, data = null, sheet = 0, limit = 150;

  var fmt = new Intl.NumberFormat("en-IN");
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function norm(s) { return String(s).toLowerCase().replace(/sector|sec\.?/g, "sec").replace(/[^a-z0-9]+/g, " ").trim(); }
  // "sound-alike" form so that spelling variants match (Model Town = Madal Taun, Chowk = Chauk)
  function skel(s) {
    return norm(s).split(" ").map(function (w) {
      if (/^\d/.test(w)) return w;
      w = w.replace(/c(?=[eiy])/g, "s").replace(/ph/g, "f").replace(/([aeiou])w/g, "$1").replace(/w/g, "v").replace(/z/g, "j").replace(/q/g, "k").replace(/ck/g, "k").replace(/c(?!h)/g, "k").replace(/(.)\1+/g, "$1");
      return w.charAt(0) + w.slice(1).replace(/[aeiouy]/g, "");
    }).join(" ");
  }
  function match(r, words, swords) {
    return words.every(function (w) { return r._k.indexOf(w) !== -1; }) ||
           swords.every(function (w) { return r._s.indexOf(w) !== -1; });
  }

  function load(year) {
    if (cache[year]) return Promise.resolve(cache[year]);
    meta.textContent = "Loading…";
    return fetch("/assets/collector-rates/" + year + ".json").then(function (r) { return r.json(); }).then(function (d) {
      d.tables.forEach(function (t) {
        var g = "";
        t.rows.forEach(function (r) { if (!Array.isArray(r)) { g = r.g; return; } r._k = norm(r.join(" ") + " " + g); r._s = skel(r.join(" ") + " " + g); });
      });
      cache[year] = d; return d;
    });
  }

  function cell(v) {
    if (typeof v === "number") return '<td class="num">' + fmt.format(v) + "</td>";
    return "<td>" + esc(v) + "</td>";
  }

  function render() {
    var t = data.tables[sheet];
    var q = norm(input.value), words = q ? q.split(" ") : [], swords = q ? skel(q).split(" ") : [];
    thead.innerHTML = "<tr>" + t.cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr>";
    var out = [], n = 0, total = 0, pendingGroup = null;
    for (var i = 0; i < t.rows.length; i++) {
      var r = t.rows[i];
      if (!Array.isArray(r)) { pendingGroup = r.g; continue; }
      if (words.length && !match(r, words, swords)) continue;
      total++;
      if (n >= limit) continue;
      if (pendingGroup) { out.push('<tr class="grp"><td colspan="' + t.cols.length + '">' + esc(pendingGroup) + "</td></tr>"); pendingGroup = null; }
      out.push("<tr>" + r.map(cell).join("") + "</tr>");
      n++;
    }
    tbody.innerHTML = out.join("") || '<tr><td colspan="' + t.cols.length + '" style="text-align:center;padding:24px">No matching area found in this list. Try another spelling or check the other years / sheets.</td></tr>';
    meta.textContent = (words.length ? total + " matching rows" : total + " rows") + " • " + (t.unit || "");
    more.hidden = total <= limit;
  }

  function renderSheets() {
    sheetBox.innerHTML = "";
    data.tables.forEach(function (t, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "chip-f" + (i === sheet ? " is-active" : ""); b.textContent = t.name;
      b.onclick = function () { sheet = i; limit = 150; renderSheets(); render(); };
      sheetBox.appendChild(b);
    });
    sheetBox.hidden = data.tables.length < 2;
  }

  function pick(year) {
    yearTabs.forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-year") === year); });
    load(year).then(function (d) { data = d; sheet = 0; limit = 150; renderSheets(); render(); });
    history.replaceState(null, "", "?year=" + year + (input.value ? "&q=" + encodeURIComponent(input.value) : ""));
  }

  yearTabs.forEach(function (b) { b.addEventListener("click", function () { pick(b.getAttribute("data-year")); }); });
  var timer;
  input.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(function () { limit = 150; if (data) render(); }, 120);
  });
  more.querySelector("button").addEventListener("click", function () { limit += 300; render(); });

  var params = new URLSearchParams(location.search);
  if (params.get("q")) input.value = params.get("q");
  pick(params.get("year") || yearTabs[0].getAttribute("data-year"));
})();
