
const svg = d3.select("svg");
const tooltip = d3.select(".tooltip");
const width = +svg.attr("width");
const height = +svg.attr("height");

const container = svg.append("g");

d3.json("nsf_clustered_grants_d3_tagged.json").then(data => {
  const xExtent = d3.extent(data, d => d.x);
  const yExtent = d3.extent(data, d => d.y);

  const xScale = d3.scaleLinear().domain(xExtent).range([40, width - 40]);
  const yScale = d3.scaleLinear().domain(yExtent).range([height - 40, 40]);

  const color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain([...new Set(data.map(d => d.cluster))]);

  const clusterSelect = d3.select("#clusterSelect");
  const clusters = Array.from(new Set(data.map(d => d.cluster_theme))).sort();
  clusters.forEach(cl => clusterSelect.append("option").attr("value", cl).text(cl));

  const stateSelect = d3.select("#stateSelect");
  const states = Array.from(new Set(data.map(d => d.state).filter(Boolean))).sort();
  states.forEach(st => stateSelect.append("option").attr("value", st).text(st));

  const institutionSelect = d3.select("#institutionSelect");
  const institutions = Array.from(new Set(data.map(d => d.institution).filter(Boolean))).sort();
  institutions.forEach(inst => institutionSelect.append("option").attr("value", inst).text(inst));

  const tagSelect = d3.select("#tagSelect");
  tagSelect.append("option").attr("value", "Mixed Methods Research").text("Mixed Methods Research");
  tagSelect.append("option").attr("value", "Workforce Development").text("Workforce Development");
  tagSelect.append("option").attr("value", "Diversity and Inclusion in STEM").text("Diversity and Inclusion in STEM");
  tagSelect.append("option").attr("value", "Community Engagement").text("Community Engagement");
  tagSelect.append("option").attr("value", "Intersectionality").text("Intersectionality");
  tagSelect.append("option").attr("value", "Professional Development in STEM").text("Professional Development in STEM");
  tagSelect.append("option").attr("value", "Educational Equity").text("Educational Equity");
  tagSelect.append("option").attr("value", "Culturally Responsive Pedagogy").text("Culturally Responsive Pedagogy");
  tagSelect.append("option").attr("value", "Qualitative Research").text("Qualitative Research");
  tagSelect.append("option").attr("value", "Racial Equity in STEM").text("Racial Equity in STEM");
  tagSelect.append("option").attr("value", "Faculty Development").text("Faculty Development");
  tagSelect.append("option").attr("value", "Informal STEM Education").text("Informal STEM Education");
  tagSelect.append("option").attr("value", "Teacher Professional Development").text("Teacher Professional Development");
  tagSelect.append("option").attr("value", "Mentorship Programs").text("Mentorship Programs");
  tagSelect.append("option").attr("value", "Underrepresented Groups in STEM").text("Underrepresented Groups in STEM");

  const searchInput = d3.select("#searchInput");

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
        tooltip.style("display", "block")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px")
          .html(
            `<strong>${d.title}</strong><br><em>${d.institution}</em><br>${d.city}, ${d.state}<br>` +
            `<strong>Cluster:</strong> ${d.cluster_theme}<br>` +
            `<strong>Tags:</strong> ${d.canonical_tags?.join(", ") ?? "None"}`
          );
      })
      .on("mouseout", () => tooltip.style("display", "none"));
  }

  function update() {
    const clusterVal = clusterSelect.property("value");
    const query = searchInput.property("value").toLowerCase();
    const stateVal = stateSelect.property("value");
    const institutionVal = institutionSelect.property("value");
    const tagVal = tagSelect.property("value");

    const filtered = data.filter(d => {
      const matchCluster = clusterVal === "all" || d.cluster_theme === clusterVal;
      const matchQuery = !query || d.title.toLowerCase().includes(query) || d.institution.toLowerCase().includes(query);
      const matchState = stateVal === "all" || d.state === stateVal;
      const matchInst = institutionVal === "all" || d.institution === institutionVal;
      const matchTag = tagVal === "all" || (d.canonical_tags && d.canonical_tags.includes(tagVal));
      return matchCluster && matchQuery && matchState && matchInst && matchTag;
    });

    render(filtered);
  }

  searchInput.on("input", update);
  clusterSelect.on("change", update);
  stateSelect.on("change", update);
  institutionSelect.on("change", update);
  tagSelect.on("change", update);
  update();
});

// Add zoom behavior
const zoom = d3.zoom()
  .scaleExtent([0.5, 10])
  .on("zoom", (event) => {
    container.attr("transform", event.transform);
  });

svg.call(zoom);
