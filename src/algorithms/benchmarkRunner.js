import BranchAndBoundSolver from './BranchAndBound';
import HeldKarpSolver from './HeldKarp';
import GreedyHeuristicSolver from './GreedyHeuristic';

const BACKTRACKING_NODE_LIMIT = 14;
const BNB_NODE_LIMIT = 16;
const HELD_KARP_NODE_LIMIT = 20;

// ── Instrumented backtracker ──────────────────────────────────────────────────
// Runs the same logic as HamiltonianSolver but also counts nodes explored
// and backtracks per-call (fixing start node for a fair per-algorithm comparison).

function runBacktracking(adjacency, nodes, startNode) {
  let nodesExplored = 0;
  let backtracks = 0;
  let rawCyclesFound = 0;
  const n = nodes.length;

  function dfs(current, visited) {
    nodesExplored++;
    if (visited.size === n) {
      if ((adjacency[current] ?? []).includes(startNode)) rawCyclesFound++;
      return;
    }
    for (const neighbor of adjacency[current] ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        dfs(neighbor, visited);
        visited.delete(neighbor);
        backtracks++;
      }
    }
  }

  dfs(startNode, new Set([startNode]));

  // Directed cycles from startNode ÷ 2 = unique undirected cycles through startNode
  const cyclesFound = Math.round(rawCyclesFound / 2);

  return { found: cyclesFound > 0, cyclesFound, nodesExplored, backtracks };
}

// ── Memory estimate labels ────────────────────────────────────────────────────

function memoryLabel(algo, n) {
  switch (algo) {
    case 'backtracking':
    case 'branch-and-bound':
      return `O(n) ≈ ${n * 16} B stack`;
    case 'held-karp': {
      const bytes = Math.min(n, 20) <= 0 ? 0 : (1 << Math.min(n, 20)) * Math.min(n, 20);
      const kb = bytes / 1024;
      const mb = kb / 1024;
      return mb >= 1
        ? `O(2ⁿ·n) ≈ ${mb.toFixed(1)} MB`
        : `O(2ⁿ·n) ≈ ${kb.toFixed(1)} KB`;
    }
    case 'heuristic':
      return `O(n) ≈ ${n * 16} B`;
    default:
      return '—';
  }
}

// ── Algorithm metadata ────────────────────────────────────────────────────────

const ALGO_META = {
  backtracking: {
    id: 'backtracking',
    name: 'Backtracking',
    complexity: { time: 'O(n!)', space: 'O(n)' },
    description:
      'Exhaustive depth-first search that tries every possible path and undoes each choice when it reaches a dead end. Guaranteed to find all cycles but scales factorially.',
    strengths: ['Finds every Hamiltonian cycle', 'Exact result', 'Simple to implement'],
    weaknesses: ['O(n!) time — impractical beyond ~14 nodes', 'No pruning of infeasible branches'],
  },
  'branch-and-bound': {
    id: 'branch-and-bound',
    name: 'Branch & Bound',
    complexity: { time: 'O(n!) worst case', space: 'O(n)' },
    description:
      'Backtracking augmented with a degree-feasibility pruning rule: if any unvisited node loses all its unvisited neighbours, the branch is abandoned immediately.',
    strengths: [
      'Prunes infeasible branches early',
      'Faster than backtracking on sparse graphs',
      'Exact result',
    ],
    weaknesses: ['Still exponential worst case', 'Pruning overhead adds cost on dense graphs'],
  },
  'held-karp': {
    id: 'held-karp',
    name: 'Held-Karp (DP)',
    complexity: { time: 'O(2ⁿ · n²)', space: 'O(2ⁿ · n)' },
    description:
      'Dynamic programming over subsets. Stores whether each (subset, endpoint) pair is reachable, avoiding redundant recomputation across overlapping subproblems.',
    strengths: [
      'Much faster than backtracking in practice',
      'Polynomial per subset',
      'No backtracking overhead',
    ],
    weaknesses: [
      'Exponential memory: O(2ⁿ·n) — impractical beyond ~20 nodes',
      'Determines existence only, not all cycles',
    ],
  },
  heuristic: {
    id: 'heuristic',
    name: 'Greedy Heuristic (Warnsdorff)',
    complexity: { time: 'O(n²)', space: 'O(n)' },
    description:
      "Warnsdorff's rule: at each step move to the unvisited neighbour with the fewest onward unvisited neighbours. Polynomial time but not guaranteed to succeed.",
    strengths: [
      'Polynomial time O(n²)',
      'Scales to large graphs',
      'Works well on many common graph types',
    ],
    weaknesses: [
      'Not guaranteed to find a cycle even when one exists',
      'Single-attempt — no backtracking or retries',
    ],
  },
};

// ── Main benchmark runner ─────────────────────────────────────────────────────

/**
 * Run all four algorithms on the given graph and return a structured comparison.
 *
 * @param {object} graph  - { nodes, adjacency, startNode }
 * @returns {{ results: AlgorithmResult[], graphSize: number, rankedIds: string[] }}
 */
export function runBenchmark(graph) {
  const { adjacency, nodes, startNode } = graph;
  const n = nodes.length;
  const results = [];

  // 1. Backtracking
  if (n > BACKTRACKING_NODE_LIMIT) {
    results.push({
      ...ALGO_META.backtracking,
      skipped: true,
      skipReason: `n = ${n} exceeds limit of ${BACKTRACKING_NODE_LIMIT} — O(n!) would timeout.`,
      memoryEstimate: memoryLabel('backtracking', n),
    });
  } else {
    const t0 = performance.now();
    const res = runBacktracking(adjacency, nodes, startNode);
    results.push({
      ...ALGO_META.backtracking,
      ...res,
      elapsedMs: performance.now() - t0,
      memoryEstimate: memoryLabel('backtracking', n),
    });
  }

  // 2. Branch & Bound
  if (n > BNB_NODE_LIMIT) {
    results.push({
      ...ALGO_META['branch-and-bound'],
      skipped: true,
      skipReason: `n = ${n} exceeds limit of ${BNB_NODE_LIMIT}.`,
      memoryEstimate: memoryLabel('branch-and-bound', n),
    });
  } else {
    const solver = new BranchAndBoundSolver(adjacency, nodes);
    const t0 = performance.now();
    const res = solver.solve(startNode);
    results.push({
      ...ALGO_META['branch-and-bound'],
      ...res,
      elapsedMs: performance.now() - t0,
      memoryEstimate: memoryLabel('branch-and-bound', n),
    });
  }

  // 3. Held-Karp
  if (n > HELD_KARP_NODE_LIMIT) {
    results.push({
      ...ALGO_META['held-karp'],
      skipped: true,
      skipReason: `n = ${n} exceeds limit of ${HELD_KARP_NODE_LIMIT} — O(2ⁿ·n) memory too large.`,
      memoryEstimate: memoryLabel('held-karp', n),
    });
  } else {
    const solver = new HeldKarpSolver(adjacency, nodes);
    const t0 = performance.now();
    const res = solver.solve();
    results.push({
      ...ALGO_META['held-karp'],
      ...res,
      elapsedMs: performance.now() - t0,
      memoryEstimate: res.memoryLabel ?? memoryLabel('held-karp', n),
    });
  }

  // 4. Greedy Heuristic (no size limit — O(n²))
  {
    const solver = new GreedyHeuristicSolver(adjacency, nodes);
    const t0 = performance.now();
    const res = solver.solve(startNode);
    results.push({
      ...ALGO_META.heuristic,
      ...res,
      elapsedMs: performance.now() - t0,
      memoryEstimate: memoryLabel('heuristic', n),
    });
  }

  // ── Rank by nodesExplored (fewer = more efficient) ────────────────────────
  const ran = results.filter(r => !r.skipped && typeof r.nodesExplored === 'number');
  const sorted = [...ran].sort((a, b) => a.nodesExplored - b.nodesExplored);
  const rankedIds = sorted.map(r => r.id);
  sorted.forEach((r, i) => {
    const result = results.find(x => x.id === r.id);
    if (result) result.rank = i + 1;
  });

  return { results, graphSize: n, rankedIds };
}

/**
 * Returns true when the graph is small enough for at least backtracking to run.
 */
export function isBenchmarkFeasible(nodeCount) {
  return nodeCount >= 3 && nodeCount <= BNB_NODE_LIMIT;
}

/**
 * Returns which algorithms will run (vs be skipped) for a given node count.
 */
export function getAlgorithmAvailability(nodeCount) {
  return {
    backtracking: nodeCount <= BACKTRACKING_NODE_LIMIT,
    'branch-and-bound': nodeCount <= BNB_NODE_LIMIT,
    'held-karp': nodeCount <= HELD_KARP_NODE_LIMIT,
    heuristic: true,
  };
}
