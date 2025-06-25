const svg = d3.select("svg");
const width = +svg.attr("width") || 960;
const height = +svg.attr("height") || 600;
const container = svg.append("g");

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("display", "none")
  .style("position", "fixed")
  .style("z-index", "9999")
  .style("pointer-events", "auto")
  .style("background", "#fff")
  .style("padding", "10px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("max-width", "300px")
  .style("font-size", "12px");

let isHoveringTooltip = false;
let pinned = false;

d3.json("nsf_clustered_grants_d3_with_urls_normalized.json").then(data => {
  data.forEach(d => {
    if (d.cluster_theme) {
      d.cluster_theme = d.cluster_theme.trim().replace(/^["“”]+|["“”\.]+$/g, '');
    }
  });
  const xExtent = d3.extent(data, d => d.x);
  const yExtent = d3.extent(data, d => d.y);

  const xScale = d3.scaleLinear().domain(xExtent).range([40, width - 40]);
  const yScale = d3.scaleLinear().domain(yExtent).range([height - 40, 40]);

  const color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain([...new Set(data.map(d => d.cluster))]);

  const clusterSelect = d3.select("#clusterSelect");
  const tagSelect = d3.select("#tagSelect");
  const stateSelect = d3.select("#stateSelect");
  const institutionSelect = d3.select("#institutionSelect");
  const wokeTermSelect = d3.select("#wokeKeywordSelect");
  const searchInput = d3.select("#searchInput");

  // Cluster dropdown
  const clusters = Array.from(new Set(data.map(d => d.cluster_theme))).sort();
  clusters.forEach(cl => clusterSelect.append("option").attr("value", cl).text(cl));

  // Tag dropdown (top 20 + AI/ML)
  const topTags = [
    "Mixed Methods Research",
    "Community",
    "Workforce Development",
    "Diversity and Inclusion in STEM",
    "Education",
    "Intersectionality",
    "Professional Development in STEM",
    "Culturally Responsive Pedagogy",
    "Qualitative Research",
    "Racial Equity in STEM",
    "Faculty Development",
    "Informal STEM Education",
    "Teacher Professional Development",
    "Mentorship Programs",
    "Underrepresented Groups in STEM",
    "STEM Workforce Diversity",
    "STEM Identity Development",
    "Longitudinal Study",
    "Gender Equity in Academia",
    "Interdisciplinary Collaboration",
    "AI/ML"
  ];

  topTags.forEach(tag => {
    tagSelect.append("option").attr("value", tag).text(tag);
  });

  // Woke keyword dropdown
  const allWokeTerms = new Set();
  data.forEach(d => (d.woke_flag_matches || []).forEach(term => allWokeTerms.add(term)));
  Array.from(allWokeTerms).sort().forEach(term =>
    wokeTermSelect.append("option").attr("value", term).text(term)
  );

  const states = Array.from(new Set(data.map(d => d.state).filter(Boolean))).sort();
  states.forEach(st => stateSelect.append("option").attr("value", st).text(st));

  const institutions = Array.from(new Set(data.map(d => d.institution).filter(Boolean))).sort();
  institutions.forEach(inst => institutionSelect.append("option").attr("value", inst).text(inst));

  function buildTooltipHTML(d) {
    return `
      <strong>${d.title}</strong><br>
      <em>${d.institution}</em><br>${d.city}, ${d.state}<br>
      <strong>Cluster:</strong> ${d.cluster_theme}<br>
      <strong>Tags:</strong> ${d.canonical_tags?.join(", ") || "—"}<br>
      ${d.woke_flagged ? `<strong>Woke Terms:</strong> ${d.woke_flag_matches?.join(", ") || ""}<br>` : ""}
      ${d.nsf_url ? `<a href="${d.nsf_url}" target="_blank">View grant</a>` : ""}
    `;
  }

  function render(filtered) {
    container.selectAll(".dot").remove();

    container.selectAll(".dot")
      .data(filtered, d => d.grant_number)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("fill", d => color(d.cluster))
      .on("mouseover", (event, d) => {
        if (!pinned) {
          tooltip
            .html(buildTooltipHTML(d))
            .style("left", `${event.clientX + 15}px`)
            .style("top", `${event.clientY - 10}px`)
            .style("display", "block");
        }
      })
      .on("mouseout", () => {
        if (!pinned) {
          setTimeout(() => {
            if (!isHoveringTooltip) tooltip.style("display", "none");
          }, 200);
        }
      })
      .on("click", (event, d) => {
        pinned = true;
        tooltip
          .html(buildTooltipHTML(d))
          .style("left", `${event.clientX + 15}px`)
          .style("top", `${event.clientY - 10}px`)
          .style("display", "block");
        event.stopPropagation();
      });
  }

  function update() {
    pinned = false;
    tooltip.style("display", "none");

    const clusterVal = clusterSelect.property("value");
    const tagVal = tagSelect.property("value");
    const stateVal = stateSelect.property("value");
    const instVal = institutionSelect.property("value");
    const wokeTerm = wokeTermSelect.property("value");
    const query = searchInput.property("value").toLowerCase();

    const filtered = data.filter(d => {
      const matchCluster = clusterVal === "all" || d.cluster_theme === clusterVal;
      const matchTag = tagVal === "all" || (d.canonical_tags || []).includes(tagVal);
      const matchState = stateVal === "all" || d.state === stateVal;
      const matchInst = instVal === "all" || d.institution === instVal;
      const matchQuery = !query || d.title?.toLowerCase().includes(query) || d.institution?.toLowerCase().includes(query);
      const matchWokeTerm = wokeTerm === "all" || (d.woke_flag_matches || []).includes(wokeTerm);
      return matchCluster && matchTag && matchState && matchInst && matchQuery && matchWokeTerm;
    });

    render(filtered);
  }

  clusterSelect.on("change", update);
  tagSelect.on("change", update);
  stateSelect.on("change", update);
  institutionSelect.on("change", update);
  wokeTermSelect.on("change", update);
  searchInput.on("input", update);

  update();
});

// Tooltip persistence
tooltip
  .on("mouseover", () => { isHoveringTooltip = true; })
  .on("mouseout", () => {
    isHoveringTooltip = false;
    if (!pinned) tooltip.style("display", "none");
  });

d3.select("body").on("click", () => {
  if (pinned) {
    pinned = false;
    tooltip.style("display", "none");
  }
});

// Zoom
const zoom = d3.zoom()
  .scaleExtent([0.5, 10])
  .on("zoom", event => {
    container.attr("transform", event.transform);
  });

svg.call(zoom);
