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

  // Complete graph on 4 nodes — 3 unique Hamiltonian cycles.
  // Great for showing the algorithm explore multiple solutions.
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
};

export const GRAPH_KEYS = Object.keys(GRAPHS);
export const DEFAULT_GRAPH_KEY = 'k4';
