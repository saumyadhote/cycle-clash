import HamiltonianSolver from '../algorithms/HamiltonianSolver';
import { checkDirac, checkOre } from '../algorithms/theorems';

const FEASIBILITY_THRESHOLD = 12;

export function analyzeGraph(graph) {
  if (!graph || graph.nodes.length === 0) return null;

  const { nodes, adjacency } = graph;
  const n = nodes.length;

  const degrees = computeDegrees(nodes, adjacency);
  const degreeValues = nodes.map(v => degrees[v]);
  const edgeCount = degreeValues.reduce((s, d) => s + d, 0) / 2;
  const minDegree = Math.min(...degreeValues);
  const maxDegree = Math.max(...degreeValues);
  const maxPossibleEdges = n > 1 ? (n * (n - 1)) / 2 : 0;
  const density = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;
  const degreeSequence = [...degreeValues].sort((a, b) => b - a);

  const isConnected = n <= 1 || checkConnectivity(nodes, adjacency);
  const dirac = checkDirac(nodes, adjacency);
  const ore = checkOre(nodes, adjacency);

  const feasible = n >= 3 && n <= FEASIBILITY_THRESHOLD;
  let isHamiltonian = null;
  let cycleCount = null;

  if (n < 3) {
    isHamiltonian = false;
    cycleCount = 0;
  } else if (!isConnected) {
    isHamiltonian = false;
    cycleCount = 0;
  } else if (minDegree < 2) {
    isHamiltonian = false;
    cycleCount = 0;
  } else if (feasible) {
    const solver = new HamiltonianSolver(adjacency, nodes);
    const result = solver.countCycles();
    cycleCount = result.totalCount;
    isHamiltonian = cycleCount > 0;
  }

  const explanation =
    isHamiltonian === false
      ? buildNonHamiltonianExplanation({ isConnected, n, minDegree, dirac, ore })
      : null;

  return {
    vertexCount: n,
    edgeCount,
    isConnected,
    isHamiltonian,
    cycleCount,
    feasible,
    minDegree,
    maxDegree,
    density,
    degreeSequence,
    degrees,
    dirac,
    ore,
    explanation,
  };
}

function computeDegrees(nodes, adjacency) {
  const degrees = {};
  for (const v of nodes) {
    degrees[v] = (adjacency[v] ?? []).length;
  }
  return degrees;
}

function checkConnectivity(nodes, adjacency) {
  const visited = new Set([nodes[0]]);
  const queue = [nodes[0]];
  while (queue.length > 0) {
    const curr = queue.shift();
    for (const neighbor of adjacency[curr] ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited.size === nodes.length;
}

function buildNonHamiltonianExplanation({ isConnected, n, minDegree, dirac, ore }) {
  if (n < 3) {
    return 'A Hamiltonian cycle requires at least 3 vertices.';
  }
  if (!isConnected) {
    return (
      'The graph is disconnected. A Hamiltonian cycle must visit every vertex, ' +
      'which is impossible when some vertices are unreachable from others. ' +
      'Connecting the isolated components would be the first step toward feasibility.'
    );
  }
  if (minDegree < 2) {
    return (
      `At least one vertex has degree ${minDegree}. Every vertex in a Hamiltonian cycle ` +
      'must have at least two edges — one to enter and one to leave. ' +
      'A vertex with degree 0 or 1 cannot participate in any cycle.'
    );
  }
  if (!dirac.satisfied && dirac.applicable) {
    return (
      `Dirac's and Ore's sufficient conditions are not met. The minimum degree of ${dirac.minDegree} ` +
      `falls below the threshold of n/2 = ${dirac.threshold.toFixed(1)}. ` +
      'The exhaustive search confirms that no Hamiltonian cycle exists. ' +
      'The graph lacks the edge density needed to guarantee a complete traversal.'
    );
  }
  return (
    'Neither Dirac\'s nor Ore\'s sufficient conditions are satisfied. ' +
    'The exhaustive search confirms no Hamiltonian cycle exists in this graph. ' +
    'The structure lacks the edge density required for a complete traversal.'
  );
}
