/**
 * Held-Karp dynamic programming Hamiltonian cycle solver.
 *
 * State: dp[mask][v] = 1 if there is a path that starts at node 0,
 *        visits exactly the nodes in `mask`, and ends at node v.
 *
 * Complexity: O(2ⁿ · n²) time, O(2ⁿ · n) space.
 * Practical upper bound: n ≤ 20 (about 20 MB RAM at that size).
 */

const MAX_NODES = 20;

class HeldKarpSolver {
  constructor(adjacency, nodes) {
    this.adjacency = adjacency;
    this.nodes = nodes;
    this.n = nodes.length;
  }

  solve() {
    const n = this.n;

    if (n > MAX_NODES) {
      return {
        skipped: true,
        reason: `Held-Karp requires O(2ⁿ·n) memory — infeasible for n > ${MAX_NODES}.`,
      };
    }
    if (n < 3) {
      return { found: false, cyclesFound: 0, nodesExplored: 0, backtracks: 0 };
    }

    // Build index-based adjacency matrix
    const adj = this._buildAdjMatrix();

    const FULL = (1 << n) - 1;
    // Use Uint8Array rows to keep memory flat
    const dp = Array.from({ length: 1 << n }, () => new Uint8Array(n));
    dp[1][0] = 1; // Start: node 0 visited, currently at node 0

    let statesProcessed = 0;

    for (let mask = 1; mask <= FULL; mask++) {
      if (!(mask & 1)) continue; // All paths start at node 0

      for (let u = 0; u < n; u++) {
        if (!dp[mask][u]) continue;
        if (!(mask & (1 << u))) continue;

        statesProcessed++;

        for (let v = 0; v < n; v++) {
          if (mask & (1 << v)) continue; // v already visited
          if (!adj[u][v]) continue;
          dp[mask | (1 << v)][v] = 1;
        }
      }
    }

    let found = false;
    for (let v = 1; v < n; v++) {
      if (dp[FULL][v] && adj[v][0]) {
        found = true;
        break;
      }
    }

    const memBytes = (1 << n) * n;
    const memLabel =
      memBytes < 1024
        ? `${memBytes} B`
        : memBytes < 1024 * 1024
        ? `${(memBytes / 1024).toFixed(1)} KB`
        : `${(memBytes / (1024 * 1024)).toFixed(1)} MB`;

    return {
      found,
      cyclesFound: found ? 1 : 0,
      nodesExplored: statesProcessed,
      backtracks: 0,
      memoryLabel: memLabel,
    };
  }

  _buildAdjMatrix() {
    const n = this.n;
    const idx = Object.fromEntries(this.nodes.map((v, i) => [v, i]));
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => {
        const u = this.nodes[i];
        const v = this.nodes[j];
        return (this.adjacency[u] ?? []).includes(v);
      })
    );
  }
}

export default HeldKarpSolver;
