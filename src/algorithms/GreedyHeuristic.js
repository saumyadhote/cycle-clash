/**
 * Warnsdorff's rule heuristic for Hamiltonian cycle detection.
 *
 * At each step, move to the unvisited neighbour that has the fewest
 * unvisited neighbours of its own (minimum onward degree).
 * This greedy choice tends to avoid early dead-ends on many graph types.
 *
 * Complexity: O(n²) — one pass per node, degree scan per candidate.
 * Not guaranteed to find a cycle even when one exists.
 */
class GreedyHeuristicSolver {
  constructor(adjacency, nodes) {
    this.adjacency = adjacency;
    this.nodes = nodes;
  }

  solve(startNode) {
    let nodesExplored = 0;
    const visited = new Set([startNode]);
    const path = [startNode];
    let current = startNode;

    while (visited.size < this.nodes.length) {
      nodesExplored++;
      const candidates = (this.adjacency[current] ?? []).filter(n => !visited.has(n));

      if (candidates.length === 0) {
        return {
          found: false,
          cyclesFound: 0,
          nodesExplored,
          backtracks: 0,
          path,
          note: 'Heuristic got stuck — could not reach all nodes from this position.',
        };
      }

      // Warnsdorff: pick the candidate with the fewest available onward neighbours
      const next = candidates.reduce((best, candidate) => {
        const futureVisited = new Set([...visited, candidate]);
        const onwardDeg = (this.adjacency[candidate] ?? []).filter(
          x => !futureVisited.has(x)
        ).length;
        const bestFutureVisited = new Set([...visited, best]);
        const bestOnwardDeg = (this.adjacency[best] ?? []).filter(
          x => !bestFutureVisited.has(x)
        ).length;
        return onwardDeg < bestOnwardDeg ? candidate : best;
      });

      visited.add(next);
      path.push(next);
      current = next;
    }

    nodesExplored++;
    const canClose = (this.adjacency[current] ?? []).includes(startNode);

    return {
      found: canClose,
      cyclesFound: canClose ? 1 : 0,
      nodesExplored,
      backtracks: 0,
      path: canClose ? [...path, startNode] : path,
      note: canClose
        ? null
        : 'All nodes visited but no closing edge back to start — cycle incomplete.',
    };
  }
}

export default GreedyHeuristicSolver;
