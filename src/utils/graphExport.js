const EXPORT_W = 500;
const EXPORT_H = 500;
const NODE_R = 22;
const FONT_SIZE = 14;

// ── Graph-to-text formats ─────────────────────────────────────────────────────

export function exportEdgeList(graph) {
  const seen = new Set();
  const lines = [];
  for (const u of graph.nodes) {
    for (const v of graph.adjacency[u] ?? []) {
      const key = [u, v].sort().join('\0');
      if (!seen.has(key)) {
        seen.add(key);
        lines.push(`${u} ${v}`);
      }
    }
  }
  return lines.join('\n');
}

export function exportJSON(graph) {
  const payload = {
    format: 'hamiltonian-lab-v1',
    nodes: graph.nodes,
    adjacency: graph.adjacency,
    positions: graph.positions ?? null,
    startNode: graph.startNode ?? null,
  };
  return JSON.stringify(payload, null, 2);
}

// Same as JSON but with a top-level marker so the UI can auto-detect on re-import
export function exportShareableFile(graph) {
  return exportJSON(graph);
}

// ── SVG generation ────────────────────────────────────────────────────────────

function resolvePositions(graph) {
  if (graph.positions && Object.keys(graph.positions).length === graph.nodes.length) {
    // Scale positions to fit the export canvas
    const xs = graph.nodes.map(v => graph.positions[v].x);
    const ys = graph.nodes.map(v => graph.positions[v].y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const pad = NODE_R + 10;
    const scaleX = (EXPORT_W - 2 * pad) / rangeX;
    const scaleY = (EXPORT_H - 2 * pad) / rangeY;
    const scale = Math.min(scaleX, scaleY);
    const positions = {};
    for (const v of graph.nodes) {
      positions[v] = {
        x: Math.round(pad + (graph.positions[v].x - minX) * scale),
        y: Math.round(pad + (graph.positions[v].y - minY) * scale),
      };
    }
    return positions;
  }

  // Circular fallback
  const n = graph.nodes.length;
  const cx = EXPORT_W / 2;
  const cy = EXPORT_H / 2;
  const r = Math.min(cx, cy) - NODE_R - 15;
  const positions = {};
  graph.nodes.forEach((v, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    positions[v] = {
      x: Math.round(cx + r * Math.cos(angle)),
      y: Math.round(cy + r * Math.sin(angle)),
    };
  });
  return positions;
}

export function exportSVG(graph) {
  const positions = resolvePositions(graph);
  const w = EXPORT_W;
  const h = EXPORT_H;
  const r = NODE_R;

  const seen = new Set();
  let edgeLines = '';
  for (const u of graph.nodes) {
    for (const v of graph.adjacency[u] ?? []) {
      const key = [u, v].sort().join('\0');
      if (seen.has(key)) continue;
      seen.add(key);
      const pu = positions[u];
      const pv = positions[v];
      edgeLines += `  <line x1="${pu.x}" y1="${pu.y}" x2="${pv.x}" y2="${pv.y}" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>\n`;
    }
  }

  let nodeElems = '';
  for (const u of graph.nodes) {
    const p = positions[u];
    const isStart = u === graph.startNode;
    const fill = isStart ? '#3b82f6' : '#1e293b';
    const stroke = isStart ? '#60a5fa' : '#475569';
    nodeElems += `  <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>\n`;
    nodeElems += `  <text x="${p.x}" y="${p.y + Math.round(FONT_SIZE * 0.38)}" text-anchor="middle" dominant-baseline="middle" fill="#f1f5f9" font-size="${FONT_SIZE}" font-family="ui-monospace,monospace" font-weight="bold">${u}</text>\n`;
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `  <rect width="${w}" height="${h}" fill="#0f172a" rx="8"/>`,
    edgeLines.trimEnd(),
    nodeElems.trimEnd(),
    `</svg>`,
  ].join('\n');
}

// ── PNG via Canvas 2D ─────────────────────────────────────────────────────────

export function exportPNGDataURL(graph) {
  const positions = resolvePositions(graph);
  const canvas = document.createElement('canvas');
  canvas.width = EXPORT_W;
  canvas.height = EXPORT_H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(0, 0, EXPORT_W, EXPORT_H, 8);
  ctx.fill();

  // Edges
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const seen = new Set();
  for (const u of graph.nodes) {
    for (const v of graph.adjacency[u] ?? []) {
      const key = [u, v].sort().join('\0');
      if (seen.has(key)) continue;
      seen.add(key);
      const pu = positions[u];
      const pv = positions[v];
      ctx.beginPath();
      ctx.moveTo(pu.x, pu.y);
      ctx.lineTo(pv.x, pv.y);
      ctx.stroke();
    }
  }

  // Nodes
  for (const u of graph.nodes) {
    const p = positions[u];
    const isStart = u === graph.startNode;

    ctx.beginPath();
    ctx.arc(p.x, p.y, NODE_R, 0, 2 * Math.PI);
    ctx.fillStyle = isStart ? '#3b82f6' : '#1e293b';
    ctx.fill();
    ctx.strokeStyle = isStart ? '#60a5fa' : '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f1f5f9';
    ctx.font = `bold ${FONT_SIZE}px ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(u, p.x, p.y);
  }

  return canvas.toDataURL('image/png');
}

// ── Download helpers ──────────────────────────────────────────────────────────

function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadEdgeList(graph, filename = 'graph.txt') {
  triggerDownload(exportEdgeList(graph), filename, 'text/plain');
}

export function downloadJSON(graph, filename = 'graph.json') {
  triggerDownload(exportJSON(graph), filename, 'application/json');
}

export function downloadShareableFile(graph, filename = 'graph-share.json') {
  triggerDownload(exportShareableFile(graph), filename, 'application/json');
}

export function downloadSVG(graph, filename = 'graph.svg') {
  triggerDownload(exportSVG(graph), filename, 'image/svg+xml');
}

export function downloadPNG(graph, filename = 'graph.png') {
  const dataURL = exportPNGDataURL(graph);
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
