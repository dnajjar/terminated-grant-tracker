// map.js
function loadMap() {
    const mapInstance = L.map("map").setView([39.5, -98.35], 4); // Centered on US
  
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(mapInstance);
  
    d3.json("nsf_clustered_grants_d3_with_tags_and_flags.json").then(data => {
      data.forEach(d => {
        if (d.lat && d.lon) {
          const color = d.nih_semantic_flagged ? "#d62728" : "#3182bd";
          const marker = L.circleMarker([d.lat, d.lon], {
            radius: 5,
            fillColor: color,
            fillOpacity: 0.85,
            stroke: false
          }).addTo(mapInstance);
  
          const popupContent = `
            <strong>${d.project_title}</strong><br>
            ${d.org_name}<br>
            ${d.org_city}, ${d.org_state}<br>
            <small><strong>Cluster:</strong> ${d.cluster}</small><br>
            <small><strong>Tags:</strong> ${d.merged_tags_str}</small><br>
            ${d.nih_semantic_flagged ? '<span style="color:red;"><strong>NIH-Flagged</strong></span>' : ''}
          `;
  
          marker.bindPopup(popupContent);
        }
      });
    });
  }
  