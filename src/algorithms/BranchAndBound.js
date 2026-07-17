/**
 * Branch & Bound Hamiltonian cycle solver.
 *
 * Extends backtracking with a degree-based pruning rule:
 * if any unvisited node loses all its unvisited neighbours, no Hamiltonian
 * cycle can be completed from the current state — prune immediately.
 */
class BranchAndBoundSolver {
  constructor(adjacency, nodes) {
    this.adjacency = adjacency;
    this.nodes = nodes;
    this.n = nodes.length;
  }

  solve(startNode) {
    this._nodesExplored = 0;
    this._backtracks = 0;
    this._cyclesFound = 0;
    this._pruned = 0;
    this._firstCycle = null;

    const visited = new Set([startNode]);
    const path = [startNode];
    this._search(startNode, visited, path, startNode);

    return {
      found: this._cyclesFound > 0,
      cyclesFound: this._cyclesFound,
      nodesExplored: this._nodesExplored,
      backtracks: this._backtracks,
      pruned: this._pruned,
      firstCycle: this._firstCycle,
    };
  }

  _search(current, visited, path, startNode) {
    this._nodesExplored++;

    if (visited.size === this.n) {
      if ((this.adjacency[current] ?? []).includes(startNode)) {
        this._cyclesFound++;
        if (!this._firstCycle) this._firstCycle = [...path, startNode];
      }
      return;
    }

    const candidates = (this.adjacency[current] ?? []).filter(n => !visited.has(n));
    if (candidates.length === 0) return;

    if (!this._feasible(visited)) {
      this._pruned++;
      return;
    }

    for (const next of candidates) {
      visited.add(next);
      path.push(next);
      this._search(next, visited, path, startNode);
      path.pop();
      visited.delete(next);
      this._backtracks++;
    }
  }

  /**
   * Prune if any unvisited node (other than possibly the last one) has
   * no unvisited neighbours — it could be entered but never left.
   */
  _feasible(visited) {
    const unvisited = this.nodes.filter(n => !visited.has(n));
    if (unvisited.length <= 1) return true;

    for (const node of unvisited) {
      const unvisitedNeighbours = (this.adjacency[node] ?? []).filter(n => !visited.has(n));
      if (unvisitedNeighbours.length === 0) return false;
    }
    return true;
  }
}

export default BranchAndBoundSolver;
