import { useState, useCallback } from 'react';

const NODE_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function nextLabel(existingNodes) {
  for (const label of NODE_LABELS) {
    if (!existingNodes.includes(label)) return label;
  }
  return null;
}

const EMPTY_GRAPH = { nodes: [], adjacency: {}, positions: {}, startNode: null };

export function useGraphBuilder(initial = null) {
  const [graph, setGraph] = useState(initial ?? EMPTY_GRAPH);
  const [selectedNode, setSelectedNode] = useState(null);

  const addNode = useCallback((x, y) => {
    setGraph(prev => {
      const label = nextLabel(prev.nodes);
      if (!label) return prev;
      return {
        nodes: [...prev.nodes, label],
        adjacency: { ...prev.adjacency, [label]: [] },
        positions: { ...prev.positions, [label]: { x: Math.round(x), y: Math.round(y) } },
        startNode: prev.startNode ?? label,
      };
    });
  }, []);

  const toggleEdge = useCallback((a, b) => {
    if (a === b) return;
    setGraph(prev => {
      const aNeighbors = prev.adjacency[a] ?? [];
      const bNeighbors = prev.adjacency[b] ?? [];
      const hasEdge = aNeighbors.includes(b);
      return {
        ...prev,
        adjacency: {
          ...prev.adjacency,
          [a]: hasEdge ? aNeighbors.filter(n => n !== b) : [...aNeighbors, b],
          [b]: hasEdge ? bNeighbors.filter(n => n !== a) : [...bNeighbors, a],
        },
      };
    });
  }, []);

  const removeNode = useCallback((nodeId) => {
    setGraph(prev => {
      const newNodes = prev.nodes.filter(n => n !== nodeId);
      const newPositions = Object.fromEntries(Object.entries(prev.positions).filter(([k]) => k !== nodeId));
      const newAdj = {};
      for (const n of newNodes) newAdj[n] = (prev.adjacency[n] ?? []).filter(x => x !== nodeId);
      return {
        nodes: newNodes,
        adjacency: newAdj,
        positions: newPositions,
        startNode: prev.startNode === nodeId ? (newNodes[0] ?? null) : prev.startNode,
      };
    });
    setSelectedNode(prev => prev === nodeId ? null : prev);
  }, []);

  const clearGraph = useCallback(() => {
    setGraph(EMPTY_GRAPH);
    setSelectedNode(null);
  }, []);

  const loadGraph = useCallback((g) => {
    setGraph({ nodes: g.nodes, adjacency: g.adjacency, positions: g.positions, startNode: g.startNode });
    setSelectedNode(null);
  }, []);

  const handleNodeClick = useCallback((nodeId) => {
    setSelectedNode(prev => {
      if (prev === null) return nodeId;
      if (prev === nodeId) return null;
      toggleEdge(prev, nodeId);
      return null;
    });
  }, [toggleEdge]);

  const deselect = useCallback(() => setSelectedNode(null), []);

  return { graph, selectedNode, addNode, removeNode, clearGraph, loadGraph, handleNodeClick, deselect };
}
