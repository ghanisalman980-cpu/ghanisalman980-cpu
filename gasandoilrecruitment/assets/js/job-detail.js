/* Renders a single job on job.html (?id=...) plus JobPosting JSON-LD. */
(function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var root = document.getElementById("job-detail");
  if (!root) return;

  var id = new URLSearchParams(location.search).get("id");
  var job = (window.JOBS || []).find(function (j) { return j.id === id; });

  var head = document.getElementById("job-head");
  var body = document.getElementById("job-body");
  var refEl = document.getElementById("job-ref");
  var applyTitle = document.getElementById("apply-job-title");
  var applyInput = document.getElementById("apply-ref");

  if (!job) {
    head.innerHTML =
      '<div class="wrap"><h1>Role not found</h1><p class="lead">This vacancy may have been filled. ' +
      '<a href="jobs.html" style="color:var(--amber)">Browse all current roles &rarr;</a></p></div>';
    body.innerHTML = "";
    var panel = document.querySelector(".apply-panel");
    if (panel) panel.style.display = "none";
    return;
  }

  document.title = job.title + " — " + job.location + " | Gas & Oil Recruitment";
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", job.summary.slice(0, 155));

  var badge =
    job.type === "Contract"
      ? '<span class="badge badge--contract">Contract</span>'
      : '<span class="badge badge--permanent">Permanent</span>';

  head.innerHTML =
    '<div class="wrap">' +
    '<nav class="breadcrumb"><a href="index.html">Home</a> &rsaquo; <a href="jobs.html">Jobs</a> &rsaquo; ' + esc(job.title) + "</nav>" +
    "<h1>" + esc(job.title) + "</h1>" +
    '<ul class="job-meta">' +
    "<li>" + esc(job.location) + "</li>" +
    "<li>" + esc(job.sector) + "</li>" +
    "<li>" + esc(job.workPattern) + "</li>" +
    "</ul>" +
    '<p style="margin:14px 0 0">' + badge + ' &nbsp; <span class="salary">' + esc(job.salary) + "</span></p>" +
    "</div>";

  function list(items) {
    return "<ul>" + items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
  }

  body.innerHTML =
    "<h2>The role</h2><p>" + esc(job.summary) + "</p>" +
    "<h2>What you'll be doing</h2>" + list(job.responsibilities) +
    "<h2>What you'll need</h2>" + list(job.requirements) +
    '<h2>Interested?</h2><p>Apply using the form on this page, or call our consultants on ' +
    '<a href="tel:' + esc((window.SITE_CONFIG || {}).phoneHref || "") + '">' +
    esc((window.SITE_CONFIG || {}).phone || "") + "</a> quoting reference <strong>" + esc(job.ref) + "</strong>. " +
    "If this role isn't quite right, <a href='candidates.html'>register your CV</a> and we'll keep you in mind for similar positions.</p>";

  refEl.textContent = "Reference: " + job.ref + " · Posted " +
    new Date(job.posted + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  if (applyTitle) applyTitle.textContent = job.title;
  if (applyInput) applyInput.value = job.ref + " — " + job.title;

  // JobPosting structured data (Google for Jobs)
  var ld = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.summary + " Responsibilities: " + job.responsibilities.join("; ") + ". Requirements: " + job.requirements.join("; "),
    identifier: { "@type": "PropertyValue", name: "Gas & Oil Recruitment", value: job.ref },
    datePosted: job.posted,
    employmentType: job.type === "Contract" ? "CONTRACTOR" : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "Gas & Oil Recruitment",
      sameAs: "https://gasandoilrecruitment.com",
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: job.currency === "GBP" ? "GB" : "QA" },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: job.currency,
      value: {
        "@type": "QuantitativeValue",
        value: job.salaryValue,
        unitText: job.salaryUnit === "day" ? "DAY" : "YEAR",
      },
    },
  };
  var script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(ld, null, 2);
  document.head.appendChild(script);
})();
