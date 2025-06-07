import {Deck} from "npm:@deck.gl/core";
import {ScatterplotLayer} from "npm:@deck.gl/layers";
import {HexagonLayer} from "npm:@deck.gl/aggregation-layers";

export function IssuesMap(data, {width = 800, height = 600} = {}) {
  // Convert high-dimensional embeddings to 2D using simplified PCA-like projection
  const validData = data.filter(item => item.embeddings && item.embeddings.length > 0);
  
  if (validData.length === 0) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = '<p>No valid embedding data found</p>';
    return errorDiv;
  }
  
  // Simple dimensionality reduction: use first two principal components
  // In production, we will use libraries like ML-Matrix for proper PCA or UMAP
  const embeddings = validData.map(item => item.embeddings);
  const dim = embeddings[0].length;
  
  // Calculate means for centering
  const means = new Array(dim).fill(0);
  embeddings.forEach(emb => {
    emb.forEach((val, i) => means[i] += val);
  });
  means.forEach((_, i) => means[i] /= embeddings.length);
  
  // Center the data and project to 2D using first two dimensions
  const processedData = validData.map((item, index) => {
    const centered = item.embeddings.map((val, i) => val - means[i]);
    
    // Use linear combination of dimensions for better spread
    const x = (centered[0] + centered[1] * 0.5);
    const y = (centered[1] + (centered[2] || 0) * 0.5);
    
    return {
      position: [x, y],
      title: item.title || 'Untitled',
      html_url: item.html_url || '',
      comments: item.comments || '',
      body: item.body || '',
      comment_length: item.comment_length || 0,
      text: item.text || '',
      index
    };
  }).filter(Boolean);

  // container div
  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.position = 'relative';
  container.style.border = '1px solid #dee2e6';
  container.style.borderRadius = '4px';

  // canvas for deck.gl
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.display = 'block';
  container.appendChild(canvas);

  // tooltip div
  const tooltip = document.createElement('div');
  tooltip.style.position = 'absolute';
  tooltip.style.padding = '8px 12px';
  tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
  tooltip.style.color = 'white';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontSize = '12px';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.display = 'none';
  tooltip.style.zIndex = '1000';
  tooltip.style.maxWidth = '300px';
  tooltip.style.wordWrap = 'break-word';
  container.appendChild(tooltip);

  const deck = new Deck({
    canvas,
    width,
    height,
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 8,
      pitch: 0,
      bearing: 0
    },
    controller: true,
    layers: [
      new HexagonLayer({
        id: 'hexagon-layer',
        data: processedData,
        pickable: true,
        extruded: true,
        radius: 50,
        elevationScale: 10,
        getPosition: d => d.position,
        getColorWeight: d => d.comment_length + 1,
        getElevationWeight: d => d.comment_length + 1,
        colorRange: [
          [255, 255, 178],
          [254, 204, 92],
          [253, 141, 60],
          [240, 59, 32],
          [189, 0, 38]
        ],
        onHover: (info) => {
          if (info.object) {
            const {x, y} = info;
            tooltip.style.display = 'block';
            tooltip.style.left = `${x + 10}px`;
            tooltip.style.top = `${y - 10}px`;
            tooltip.innerHTML = `
              <strong>Cluster</strong><br/>
              Issues: ${info.object.count}<br/>
              Avg Comment Length: ${Math.round(info.object.colorValue / info.object.count)}<br/>
              Total Comment Length: ${Math.round(info.object.elevationValue)}
            `;
          } else {
            tooltip.style.display = 'none';
          }
        }
      }),
      
      new ScatterplotLayer({
        id: 'scatter-plot-layer',
        data: processedData,
        pickable: true,
        opacity: 0.6,
        stroked: true,
        filled: true,
        radiusScale: 6,
        radiusMinPixels: 3,
        radiusMaxPixels: 15,
        lineWidthMinPixels: 1,
        getPosition: d => d.position,
        getRadius: d => Math.max(3, Math.log(d.comment_length + 1) * 2),
        getFillColor: d => {
          const intensity = Math.min(255, d.comment_length / 10);
          return [255 - intensity, intensity, 100, 180];
        },
        getLineColor: [0, 0, 0, 100],
        onHover: (info) => {
          if (info.object) {
            const {x, y} = info;
            tooltip.style.display = 'block';
            tooltip.style.left = `${x + 10}px`;
            tooltip.style.top = `${y - 10}px`;
            tooltip.innerHTML = `
              <strong>${info.object.title}</strong><br/>
              Comment Length: ${info.object.comment_length}<br/>
              ${info.object.comments ? `<div style="max-height: 60px; overflow-y: auto; margin: 4px 0; padding: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; font-size: 11px;">${info.object.comments.substring(0, 200)}${info.object.comments.length > 200 ? '...' : ''}</div>` : ''}<br/>
              <small>${info.object.html_url}</small>
            `;
          } else {
            tooltip.style.display = 'none';
          }
        },
        onClick: (info) => {
          if (info.object && info.object.html_url) {
            window.open(info.object.html_url, '_blank');
          }
        }
      })
    ]
  });

  // controls
  const controls = document.createElement('div');
  controls.style.position = 'absolute';
  controls.style.top = '10px';
  controls.style.left = '10px';
  controls.style.padding = '8px';
  controls.style.borderRadius = '4px';
  controls.style.fontSize = '12px';
  controls.innerHTML = `
    <div><strong>GitHub Issues Similarity Map</strong></div>
    <div>🔵 Individual Issues</div>
    <div>🔶 Issue Clusters</div>
    <div><small>Hover: Details | Click: Open Issue</small></div>
  `;
  container.appendChild(controls);

  // stats
  const stats = document.createElement('div');
  stats.style.position = 'absolute';
  stats.style.bottom = '10px';
  stats.style.right = '10px';
  stats.style.padding = '8px';
  stats.style.borderRadius = '4px';
  stats.style.fontSize = '12px';
  stats.innerHTML = `
    <div>Total Issues: ${processedData.length}</div>
    <div>Total Comment Length: ${processedData.reduce((sum, d) => sum + d.comment_length, 0).toLocaleString()}</div>
  `;
  container.appendChild(stats);

  // Cleanup function
  container.cleanup = () => {
    deck.finalize();
  };

  return container;
}