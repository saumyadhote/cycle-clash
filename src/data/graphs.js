function polygonPositions(labels, cx, cy, r, startAngleDeg = -90) {
  const positions = {};
  labels.forEach((label, i) => {
    const angle = (startAngleDeg + (360 / labels.length) * i) * (Math.PI / 180);
    positions[label] = { x: Math.round(cx + r * Math.cos(angle)), y: Math.round(cy + r * Math.sin(angle)) };
  });
  return positions;
}

function completeAdjacency(nodes) {
  const adj = {};
  for (const node of nodes) adj[node] = nodes.filter(n => n !== node);
  return adj;
}

export const GRAPHS = {
  triangle: {
    name: 'Triangle',
    description: 'K₃ — 3 nodes, 3 edges',
    nodes: ['A', 'B', 'C'],
    adjacency: {
      A: ['B', 'C'],
      B: ['A', 'C'],
      C: ['A', 'B'],
    },
    positions: {
      A: { x: 200, y: 60 },
      B: { x: 72,  y: 268 },
      C: { x: 328, y: 268 },
    },
    startNode: 'A',
  },

  k4: {
    name: 'Complete K₄',
    description: 'K₄ — 4 nodes, all pairs connected',
    nodes: ['A', 'B', 'C', 'D'],
    adjacency: {
      A: ['B', 'C', 'D'],
      B: ['A', 'C', 'D'],
      C: ['A', 'B', 'D'],
      D: ['A', 'B', 'C'],
    },
    positions: {
      A: { x: 110, y: 110 },
      B: { x: 290, y: 110 },
      C: { x: 290, y: 290 },
      D: { x: 110, y: 290 },
    },
    startNode: 'A',
  },

  pentagon: {
    name: 'Pentagon',
    description: 'C₅ — 5 nodes, cycle graph',
    nodes: ['A', 'B', 'C', 'D', 'E'],
    adjacency: {
      A: ['B', 'E'],
      B: ['A', 'C'],
      C: ['B', 'D'],
      D: ['C', 'E'],
      E: ['D', 'A'],
    },
    positions: {
      A: { x: 200, y: 52  },
      B: { x: 343, y: 155 },
      C: { x: 288, y: 322 },
      D: { x: 112, y: 322 },
      E: { x: 57,  y: 155 },
    },
    startNode: 'A',
  },

  k5: {
    name: 'Complete K₅',
    description: 'K₅ — 5 nodes, 12 unique Hamiltonian cycles',
    nodes: ['A', 'B', 'C', 'D', 'E'],
    adjacency: completeAdjacency(['A', 'B', 'C', 'D', 'E']),
    positions: polygonPositions(['A', 'B', 'C', 'D', 'E'], 200, 200, 155),
    startNode: 'A',
  },

  k6: {
    name: 'Complete K₆',
    description: 'K₆ — 6 nodes, 60 unique Hamiltonian cycles',
    nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
    adjacency: completeAdjacency(['A', 'B', 'C', 'D', 'E', 'F']),
    positions: polygonPositions(['A', 'B', 'C', 'D', 'E', 'F'], 200, 200, 155),
    startNode: 'A',
  },

  wheel: {
    name: 'Wheel W₄',
    description: 'W₄ — hub + 4 rim nodes, spoked graph',
    nodes: ['O', 'A', 'B', 'C', 'D'],
    adjacency: {
      O: ['A', 'B', 'C', 'D'],
      A: ['O', 'B', 'D'],
      B: ['O', 'A', 'C'],
      C: ['O', 'B', 'D'],
      D: ['O', 'C', 'A'],
    },
    positions: {
      O: { x: 200, y: 200 },
      A: { x: 200, y: 55  },
      B: { x: 345, y: 200 },
      C: { x: 200, y: 345 },
      D: { x: 55,  y: 200 },
    },
    startNode: 'A',
  },

  k33: {
    name: 'Bipartite K₃,₃',
    description: 'K₃,₃ — complete bipartite, 3 unique cycles',
    nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
    adjacency: {
      A: ['D', 'E', 'F'],
      B: ['D', 'E', 'F'],
      C: ['D', 'E', 'F'],
      D: ['A', 'B', 'C'],
      E: ['A', 'B', 'C'],
      F: ['A', 'B', 'C'],
    },
    positions: {
      A: { x: 100, y: 90  },
      B: { x: 200, y: 90  },
      C: { x: 300, y: 90  },
      D: { x: 100, y: 310 },
      E: { x: 200, y: 310 },
      F: { x: 300, y: 310 },
    },
    startNode: 'A',
  },

  petersen: {
    name: 'Petersen Graph',
    description: 'Petersen — 10 nodes, famously non-Hamiltonian (0 cycles)',
    nodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    adjacency: {
      A: ['B', 'E', 'F'],
      B: ['A', 'C', 'G'],
      C: ['B', 'D', 'H'],
      D: ['C', 'E', 'I'],
      E: ['D', 'A', 'J'],
      F: ['A', 'H', 'I'],
      G: ['B', 'I', 'J'],
      H: ['C', 'F', 'J'],
      I: ['D', 'F', 'G'],
      J: ['E', 'G', 'H'],
    },
    positions: {
      ...polygonPositions(['A', 'B', 'C', 'D', 'E'], 200, 200, 155),
      ...polygonPositions(['F', 'G', 'H', 'I', 'J'], 200, 200, 70),
    },
    startNode: 'A',
  },
};

export const GRAPH_KEYS = Object.keys(GRAPHS);
export const DEFAULT_GRAPH_KEY = 'k4';
