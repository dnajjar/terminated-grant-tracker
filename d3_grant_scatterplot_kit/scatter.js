
const svg = d3.select("svg");
const tooltip = d3.select(".tooltip");
const width = +svg.attr("width");
const height = +svg.attr("height");

const container = svg.append("g");

d3.json("nsf_clustered_grants_d3.json").then(data => {
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
            `<strong>Tags:</strong> ${d.tags}`
          );
      })
      .on("mouseout", () => tooltip.style("display", "none"));
  }

  function update() {
    const clusterVal = clusterSelect.property("value");
    const query = searchInput.property("value").toLowerCase();
    const stateVal = stateSelect.property("value");
    const institutionVal = institutionSelect.property("value");

    const filtered = data.filter(d => {
      const matchCluster = clusterVal === "all" || d.cluster_theme === clusterVal;
      const matchQuery = !query || d.title.toLowerCase().includes(query) || d.institution.toLowerCase().includes(query);
      const matchState = stateVal === "all" || d.state === stateVal;
      const matchInst = institutionVal === "all" || d.institution === institutionVal;
      return matchCluster && matchQuery && matchState && matchInst;
    });

    render(filtered);
  }

  searchInput.on("input", update);
  clusterSelect.on("change", update);
  stateSelect.on("change", update);
  institutionSelect.on("change", update);
  update();
});

// Add zoom behavior
const zoom = d3.zoom()
  .scaleExtent([0.5, 10])
  .on("zoom", (event) => {
    container.attr("transform", event.transform);
  });

svg.call(zoom);
