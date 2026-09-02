/* Job board rendering, search and filtering. Used by jobs.html and index.html. */
(function () {
  "use strict";

  var jobs = (window.JOBS || []).slice();

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function icon(name) {
    var paths = {
      pin: '<path d="M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>',
      briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
      clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
      calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="3" y1="11" x2="21" y2="11"/>',
    };
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (paths[name] || "") +
      "</svg>"
    );
  }

  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function isNew(iso) {
    return Date.now() - new Date(iso + "T00:00:00").getTime() < 7 * 24 * 3600 * 1000;
  }

  function jobCard(job) {
    var badge =
      job.type === "Contract"
        ? '<span class="badge badge--contract">Contract</span>'
        : '<span class="badge badge--permanent">Permanent</span>';
    var fresh = isNew(job.posted) ? ' <span class="badge badge--new">New</span>' : "";
    return (
      '<article class="job-card">' +
      '<div class="job-top"><div>' +
      '<h3><a href="job.html?id=' + esc(job.id) + '">' + esc(job.title) + "</a></h3>" +
      '<ul class="job-meta">' +
      "<li>" + icon("pin") + esc(job.location) + "</li>" +
      "<li>" + icon("briefcase") + esc(job.sector) + "</li>" +
      "<li>" + icon("clock") + esc(job.workPattern) + "</li>" +
      "</ul></div>" +
      '<div class="salary">' + esc(job.salary) + "</div></div>" +
      '<div class="job-foot"><span>' + badge + fresh + " &nbsp;Ref " + esc(job.ref) +
      " &middot; Posted " + fmtDate(job.posted) + "</span>" +
      '<a class="apply-link" href="job.html?id=' + esc(job.id) + '">View &amp; apply &rarr;</a></div>' +
      "</article>"
    );
  }

  function unique(list, key) {
    var seen = {};
    return list
      .map(function (j) { return j[key]; })
      .filter(function (v) { return v && !seen[v] && (seen[v] = true); })
      .sort();
  }

  function fillSelect(sel, values, label) {
    if (!sel) return;
    sel.innerHTML =
      '<option value="">' + label + "</option>" +
      values.map(function (v) { return "<option>" + esc(v) + "</option>"; }).join("");
  }

  /* ---- Full board (jobs.html) ---- */
  var board = document.getElementById("job-board");
  if (board) {
    var q = document.getElementById("f-q");
    var sector = document.getElementById("f-sector");
    var region = document.getElementById("f-region");
    var type = document.getElementById("f-type");
    var sort = document.getElementById("f-sort");
    var count = document.getElementById("results-count");
    var list = document.getElementById("job-list");
    var empty = document.getElementById("empty-state");

    fillSelect(sector, unique(jobs, "sector"), "All sectors");
    fillSelect(region, unique(jobs, "region"), "All locations");
    fillSelect(type, unique(jobs, "type"), "Contract or permanent");

    // Pre-select from URL (?q= & ?sector=) so homepage search deep-links work.
    var params = new URLSearchParams(location.search);
    if (params.get("q") && q) q.value = params.get("q");
    if (params.get("sector") && sector) {
      var wanted = params.get("sector");
      Array.prototype.forEach.call(sector.options, function (o) {
        if (o.value === wanted) sector.value = wanted;
      });
    }

    function apply() {
      var term = (q && q.value || "").trim().toLowerCase();
      var out = jobs.filter(function (j) {
        if (sector && sector.value && j.sector !== sector.value) return false;
        if (region && region.value && j.region !== region.value) return false;
        if (type && type.value && j.type !== type.value) return false;
        if (term) {
          var hay = (j.title + " " + j.sector + " " + j.location + " " + j.summary + " " + j.ref).toLowerCase();
          if (hay.indexOf(term) === -1) return false;
        }
        return true;
      });

      var mode = sort ? sort.value : "newest";
      out.sort(function (a, b) {
        if (mode === "salary") return b.salaryValue - a.salaryValue;
        if (mode === "title") return a.title.localeCompare(b.title);
        return b.posted < a.posted ? -1 : b.posted > a.posted ? 1 : 0;
      });

      list.innerHTML = out.map(jobCard).join("");
      empty.style.display = out.length ? "none" : "block";
      count.textContent = out.length + (out.length === 1 ? " role" : " roles") + " found";
    }

    [q, sector, region, type, sort].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", apply);
      el.addEventListener("change", apply);
    });
    var reset = document.getElementById("f-reset");
    if (reset)
      reset.addEventListener("click", function () {
        if (q) q.value = "";
        [sector, region, type].forEach(function (s) { if (s) s.value = ""; });
        if (sort) sort.value = "newest";
        apply();
      });

    apply();
  }

  /* ---- Featured jobs (index.html) ---- */
  var featured = document.getElementById("featured-jobs");
  if (featured) {
    var top = jobs
      .slice()
      .sort(function (a, b) { return b.posted < a.posted ? -1 : 1; })
      .slice(0, 6);
    featured.innerHTML = top.map(jobCard).join("");
  }

  /* ---- Sector counts (index.html) ---- */
  document.querySelectorAll("[data-sector-count]").forEach(function (el) {
    var name = el.getAttribute("data-sector-count");
    var n = jobs.filter(function (j) { return j.sector === name; }).length;
    el.textContent = n + (n === 1 ? " live role" : " live roles");
  });
})();
