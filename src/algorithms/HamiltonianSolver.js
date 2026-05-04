class HamiltonianSolver {
  constructor(adjacency, nodes) {
    this.adjacency = adjacency;
    this.nodes = nodes;
  }

  countCycles() {
    let rawCount = 0;
    const rawCycles = [];

    for (const startNode of this.nodes) {
      const visited = new Set([startNode]);
      const path = [startNode];
      this._backtrack(startNode, visited, path, startNode, rawCycles, () => { rawCount++; });
    }

    return {
      totalCount: Math.round(rawCount / (2 * this.nodes.length)),
      allCycles: this._deduplicateCycles(rawCycles),
    };
  }

  // Record every decision the backtracking algorithm makes for step-by-step replay.
  // Fixing the start node to `startNode` keeps the trace focused and educational.
  recordSteps(startNode) {
    const steps = [];
    const push = (type, path, extra = {}) =>
      steps.push({ type, path: [...path], ...extra });

    push('start', [startNode], { node: startNode, description: `Begin search from node ${startNode}` });

    const visited = new Set([startNode]);
    const path = [startNode];
    this._backtrackRecorded(startNode, visited, path, startNode, push);

    push('done', [], { node: null, description: 'Search complete — all paths exhausted.' });
    return steps;
  }

  _backtrackRecorded(current, visited, path, startNode, push) {
    if (visited.size === this.nodes.length) {
      const canReturn = this.adjacency[current].includes(startNode);
      if (canReturn) {
        push('found', path, {
          node: current,
          description: `✓ All ${this.nodes.length} nodes visited. ${current}→${startNode} edge exists — cycle found!`,
        });
      } else {
        push('dead_end', path, {
          node: current,
          description: `✗ All nodes visited, but no edge from ${current} back to ${startNode}. Dead end.`,
        });
      }
      return;
    }

    const unvisited = this.adjacency[current].filter(n => !visited.has(n));

    if (unvisited.length === 0) {
      push('dead_end', path, {
        node: current,
        description: `✗ No unvisited neighbors from ${current}. Dead end.`,
      });
      return;
    }

    for (const neighbor of this.adjacency[current]) {
      if (!visited.has(neighbor)) {
        const newPath = [...path, neighbor];
        push('visit', newPath, {
          node: neighbor,
          from: current,
          description: `→ Try ${neighbor} from ${current}  (path: ${newPath.join(' → ')})`,
        });
        visited.add(neighbor);
        path.push(neighbor);

        this._backtrackRecorded(neighbor, visited, path, startNode, push);

        path.pop();
        visited.delete(neighbor);

        push('backtrack', [...path], {
          node: current,
          removed: neighbor,
          description: `↩ Backtrack: remove ${neighbor}, return to ${current}  (path: ${[...path].join(' → ')})`,
        });
      }
    }
  }

  _backtrack(current, visited, path, startNode, rawCycles, increment) {
    if (visited.size === this.nodes.length) {
      if (this.adjacency[current].includes(startNode)) {
        increment();
        rawCycles.push([...path]);
      }
      return;
    }

    for (const neighbor of this.adjacency[current]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        path.push(neighbor);
        this._backtrack(neighbor, visited, path, startNode, rawCycles, increment);
        visited.delete(neighbor);
        path.pop();
      }
    }
  }

  _deduplicateCycles(cycles) {
    const seen = new Set();
    const unique = [];
    for (const cycle of cycles) {
      const key = this._normalize(cycle).join(',');
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(cycle);
      }
    }
    return unique;
  }

  // Consider rotations AND reversal — same undirected cycle.
  _normalize(cycle) {
    const reversed = [...cycle].reverse();
    const allForms = [
      ...cycle.map((_, i) => [...cycle.slice(i), ...cycle.slice(0, i)]),
      ...reversed.map((_, i) => [...reversed.slice(i), ...reversed.slice(0, i)]),
    ];
    return allForms.sort((a, b) => a.join('').localeCompare(b.join('')))[0];
  }
}

export default HamiltonianSolver;
