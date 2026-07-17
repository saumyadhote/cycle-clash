const CANVAS_W = 400;
const CANVAS_H = 400;
const MAX_NODES = 26;

// ── Layout helpers ────────────────────────────────────────────────────────────

function circularLayout(nodes) {
  const n = nodes.length;
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const r = Math.min(cx, cy) - 55;
  const positions = {};
  nodes.forEach((node, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    positions[node] = {
      x: Math.round(cx + r * Math.cos(angle)),
      y: Math.round(cy + r * Math.sin(angle)),
    };
  });
  return positions;
}

function buildGraph(nodes, edges, existingPositions = null) {
  const adjacency = {};
  for (const node of nodes) adjacency[node] = [];
  for (const [u, v] of edges) {
    if (!adjacency[u]) adjacency[u] = [];
    if (!adjacency[v]) adjacency[v] = [];
    if (!adjacency[u].includes(v)) adjacency[u].push(v);
    if (!adjacency[v].includes(u)) adjacency[v].push(u);
  }
  const positions = existingPositions ?? circularLayout(nodes);
  return { nodes, adjacency, positions, startNode: nodes[0] ?? null };
}

// ── Format detectors ──────────────────────────────────────────────────────────

function looksLikeJSON(text) {
  const t = text.trim();
  return t.startsWith('{') || t.startsWith('[');
}

function looksLikeAdjMatrix(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return false;

  const firstCells = lines[0].split(/[\s,]+/).filter(Boolean);
  const isAlphaHeader = firstCells.every(c => /^[A-Za-z]\w*$/.test(c)) && firstCells.length > 1;
  const dataLines = isAlphaHeader ? lines.slice(1) : lines;
  const n = dataLines.length;
  if (n < 2) return false;

  // Each data row must have n values (plus optional label prefix), all 0 or 1
  return dataLines.every(line => {
    const cells = line.split(/[\s,]+/).filter(Boolean);
    const hasLabelPrefix = /^[A-Za-z]/.test(cells[0]) && cells.length === n + 1;
    const dataCells = hasLabelPrefix ? cells.slice(1) : cells;
    return dataCells.length === n && dataCells.every(c => c === '0' || c === '1');
  });
}

// ── Parsers ───────────────────────────────────────────────────────────────────

export function parseEdgeList(text) {
  const lines = text.trim().split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
  const edges = [];
  const nodeSet = new Set();

  for (const line of lines) {
    // Normalise separators: ->, --, -, comma → space
    const normalised = line.trim()
      .replace(/\s*->\s*/g, ' ')
      .replace(/\s*--\s*/g, ' ')
      .replace(/[-,]/g, ' ');
    const parts = normalised.split(/\s+/).map(s => s.trim()).filter(Boolean);

    if (parts.length < 2) {
      throw new Error(`Invalid edge line: "${line.trim()}". Expected two node labels per line.`);
    }
    if (parts.length === 2) {
      edges.push([parts[0], parts[1]]);
      nodeSet.add(parts[0]);
      nodeSet.add(parts[1]);
    } else {
      // Path notation: A B C D → edges AB, BC, CD
      for (let i = 0; i < parts.length - 1; i++) {
        edges.push([parts[i], parts[i + 1]]);
        nodeSet.add(parts[i]);
        nodeSet.add(parts[i + 1]);
      }
    }
  }

  if (edges.length === 0) throw new Error('No edges found in the input.');
  if (nodeSet.size > MAX_NODES) {
    throw new Error(`Graph has ${nodeSet.size} nodes but the maximum supported is ${MAX_NODES}.`);
  }

  const nodes = [...nodeSet].sort();
  return buildGraph(nodes, edges);
}

export function parseAdjacencyMatrix(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);

  const firstCells = lines[0].split(/[\s,]+/).filter(Boolean);
  const isAlphaHeader = firstCells.every(c => /^[A-Za-z]\w*$/.test(c)) && firstCells.length > 1;
  let headerLabels = isAlphaHeader ? firstCells : null;
  const dataLines = isAlphaHeader ? lines.slice(1) : lines;
  const n = dataLines.length;

  if (n < 2) throw new Error('Matrix must have at least 2 rows and 2 columns.');
  if (n > MAX_NODES) {
    throw new Error(`Matrix size ${n}×${n} exceeds the maximum of ${MAX_NODES} nodes.`);
  }

  const nodes = headerLabels ?? dataLines.map((_, i) => String.fromCharCode(65 + i));
  const edges = [];

  for (let i = 0; i < n; i++) {
    const cells = dataLines[i].split(/[\s,]+/).filter(Boolean);
    const hasLabelPrefix = /^[A-Za-z]/.test(cells[0]) && cells.length === n + 1;
    const dataCells = hasLabelPrefix ? cells.slice(1) : cells;

    if (dataCells.length !== n) {
      throw new Error(
        `Row ${i + 1} has ${dataCells.length} values but the matrix is ${n}×${n}.`
      );
    }
    for (let j = i + 1; j < n; j++) {
      const val = dataCells[j];
      if (val !== '0' && val !== '1') {
        throw new Error(`Invalid value "${val}" at row ${i + 1}, col ${j + 1}. Expected 0 or 1.`);
      }
      if (val === '1') edges.push([nodes[i], nodes[j]]);
    }
  }

  return buildGraph(nodes, edges);
}

export function parseJSON(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON: ${e.message}`);
  }

  // Our internal graph format
  if (data && data.nodes && data.adjacency) {
    if (!Array.isArray(data.nodes)) throw new Error('"nodes" must be an array.');
    if (typeof data.adjacency !== 'object') throw new Error('"adjacency" must be an object.');
    if (data.nodes.length > MAX_NODES) {
      throw new Error(`Graph has ${data.nodes.length} nodes but the maximum supported is ${MAX_NODES}.`);
    }
    return {
      nodes: data.nodes,
      adjacency: data.adjacency,
      positions: data.positions ?? circularLayout(data.nodes),
      startNode: data.startNode ?? data.nodes[0] ?? null,
    };
  }

  // Edge array format: [[A,B],[B,C],...]
  if (Array.isArray(data)) {
    if (data.length === 0) throw new Error('Edge array is empty.');
    if (!Array.isArray(data[0])) {
      throw new Error('Expected an array of [source, target] pairs.');
    }
    const nodeSet = new Set();
    const edges = [];
    for (const item of data) {
      if (!Array.isArray(item) || item.length < 2) {
        throw new Error('Each edge must be a [source, target] pair.');
      }
      const u = String(item[0]);
      const v = String(item[1]);
      edges.push([u, v]);
      nodeSet.add(u);
      nodeSet.add(v);
    }
    if (nodeSet.size > MAX_NODES) {
      throw new Error(`Graph has ${nodeSet.size} nodes but the maximum is ${MAX_NODES}.`);
    }
    const nodes = [...nodeSet].sort();
    return buildGraph(nodes, edges);
  }

  throw new Error(
    'Unrecognised JSON format. Expected { nodes, adjacency } or [[A,B],[B,C],...].'
  );
}

// ── Auto-detect & parse ───────────────────────────────────────────────────────

export function autoDetectAndParse(text) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Input is empty.');

  const errors = [];

  if (looksLikeJSON(trimmed)) {
    try {
      return { graph: parseJSON(trimmed), format: 'json' };
    } catch (e) {
      errors.push(`JSON: ${e.message}`);
    }
  }

  if (looksLikeAdjMatrix(trimmed)) {
    try {
      return { graph: parseAdjacencyMatrix(trimmed), format: 'adjacency-matrix' };
    } catch (e) {
      errors.push(`Adjacency Matrix: ${e.message}`);
    }
  }

  try {
    return { graph: parseEdgeList(trimmed), format: 'edge-list' };
  } catch (e) {
    errors.push(`Edge List: ${e.message}`);
  }

  // Fallback: try remaining formats even if not detected
  if (!looksLikeJSON(trimmed)) {
    try {
      return { graph: parseJSON(trimmed), format: 'json' };
    } catch { /* skip */ }
  }
  if (!looksLikeAdjMatrix(trimmed)) {
    try {
      return { graph: parseAdjacencyMatrix(trimmed), format: 'adjacency-matrix' };
    } catch { /* skip */ }
  }

  throw new Error(
    `Could not parse graph data. Attempted formats:\n${errors.map(e => `  • ${e}`).join('\n')}`
  );
}

// ── File import ───────────────────────────────────────────────────────────────

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']);

export function parseFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided.'));
      return;
    }
    const ext = file.name.split('.').pop().toLowerCase();
    if (IMAGE_EXTS.has(ext)) {
      reject(new Error('Image files cannot be imported as graphs. Use JSON or TXT format.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const result = autoDetectAndParse(e.target.result);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

// ── Validation ────────────────────────────────────────────────────────────────

export function validateGraph(graph) {
  const errors = [];
  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return ['Graph has no nodes.'];
  }
  if (graph.nodes.length < 3) {
    errors.push('Graph has fewer than 3 nodes — a Hamiltonian cycle requires at least 3.');
  }
  if (!graph.adjacency) {
    errors.push('Graph has no adjacency data.');
  } else {
    for (const node of graph.nodes) {
      if (!graph.adjacency[node]) {
        errors.push(`Node "${node}" has no adjacency entry.`);
      }
    }
  }
  return errors;
}

// ── Format descriptions (for UI help text) ───────────────────────────────────

export const FORMAT_EXAMPLES = {
  edgeList: `A B
B C
C D
D A
A C`,

  adjacencyMatrix: `  A B C D
A 0 1 0 1
B 1 0 1 0
C 0 1 0 1
D 1 0 1 0`,

  json: `{
  "nodes": ["A","B","C","D"],
  "adjacency": {
    "A": ["B","D"],
    "B": ["A","C"],
    "C": ["B","D"],
    "D": ["C","A"]
  }
}`,
};
