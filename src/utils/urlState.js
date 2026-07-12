export function encodeState(graphKey, customGraph) {
  const url = new URL(window.location.href);
  url.searchParams.set('g', graphKey);
  if (graphKey === 'custom' && customGraph?.nodes?.length > 0) {
    const compact = { n: customGraph.nodes, a: customGraph.adjacency, p: customGraph.positions, s: customGraph.startNode };
    url.searchParams.set('d', btoa(JSON.stringify(compact)));
  } else {
    url.searchParams.delete('d');
  }
  return url.toString();
}

export function decodeState() {
  const params = new URLSearchParams(window.location.search);
  const graphKey = params.get('g');
  if (!graphKey) return { graphKey: null, customGraph: null };
  if (graphKey !== 'custom') return { graphKey, customGraph: null };
  const raw = params.get('d');
  if (!raw) return { graphKey: 'custom', customGraph: null };
  try {
    const c = JSON.parse(atob(raw));
    return {
      graphKey: 'custom',
      customGraph: { nodes: c.n, adjacency: c.a, positions: c.p, startNode: c.s },
    };
  } catch {
    return { graphKey: 'custom', customGraph: null };
  }
}

export function pushURLState(graphKey, customGraph) {
  window.history.replaceState(null, '', encodeState(graphKey, customGraph));
}

export async function copyShareLink(graphKey, customGraph) {
  const url = encodeState(graphKey, customGraph);
  await navigator.clipboard.writeText(url);
}
