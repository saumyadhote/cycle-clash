export function checkDirac(nodes, adjacency) {
  const n = nodes.length;
  if (n < 3) return { applicable: false };
  const minDegree = Math.min(...nodes.map(v => (adjacency[v] ?? []).length));
  const threshold = n / 2;
  return { applicable: true, satisfied: minDegree >= threshold, minDegree, threshold };
}

export function checkOre(nodes, adjacency) {
  const n = nodes.length;
  if (n < 3) return { applicable: false };
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const u = nodes[i];
      const v = nodes[j];
      if ((adjacency[u] ?? []).includes(v)) continue;
      const degSum = (adjacency[u] ?? []).length + (adjacency[v] ?? []).length;
      if (degSum < n) {
        return { applicable: true, satisfied: false, witness: { u, v, degSum }, n };
      }
    }
  }
  return { applicable: true, satisfied: true, n };
}
