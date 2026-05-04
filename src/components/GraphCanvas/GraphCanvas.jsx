import { useMemo } from 'react';
import styles from './GraphCanvas.module.css';

const NODE_RADIUS = 22;

function getUniqueEdges(nodes, adjacency) {
  const seen = new Set();
  const edges = [];
  for (const node of nodes) {
    for (const neighbor of adjacency[node]) {
      const key = [node, neighbor].sort().join('-');
      if (!seen.has(key)) { seen.add(key); edges.push([node, neighbor]); }
    }
  }
  return edges;
}

function edgeKey(a, b) {
  return [a, b].sort().join('-');
}

// ── Game mode helpers ────────────────────────────────────────────────────────

function getGameNodeClass(nodeId, gameState, validMoves, canReturnToStart) {
  const { currentNode, startNode, visitedNodes, isWon } = gameState;
  if (isWon) return styles.nodeWon;
  if (canReturnToStart && nodeId === startNode) return styles.nodeCanReturn;
  if (nodeId === currentNode) return styles.nodeCurrent;
  if (validMoves.includes(nodeId)) return styles.nodeValidMove;
  if (visitedNodes.has(nodeId)) return styles.nodeVisited;
  if (nodeId === startNode) return styles.nodeStart;
  return styles.nodeDefault;
}

function getGameTraversedKeys(path, isWon, startNode) {
  const keys = new Set();
  for (let i = 0; i < path.length - 1; i++) {
    keys.add(edgeKey(path[i], path[i + 1]));
  }
  if (isWon && path.length > 0) {
    keys.add(edgeKey(path[path.length - 1], startNode));
  }
  return keys;
}

// ── Algo mode helpers ────────────────────────────────────────────────────────

function getAlgoNodeClass(nodeId, algoStep) {
  if (!algoStep) return styles.nodeDefault;
  const { type, path, node } = algoStep;
  const inPath = path.includes(nodeId);
  const isCurrent = nodeId === path[path.length - 1];

  if (type === 'found')     return inPath ? styles.algoFound : styles.algoDefault;
  if (type === 'dead_end')  return isCurrent ? styles.algoDeadEnd : (inPath ? styles.algoInPath : styles.algoDefault);
  if (type === 'backtrack') return nodeId === node ? styles.algoCurrent : (inPath ? styles.algoInPath : styles.algoDefault);
  if (type === 'visit')     return isCurrent ? styles.algoCurrent : (inPath ? styles.algoInPath : styles.algoDefault);
  if (type === 'start')     return isCurrent ? styles.algoCurrent : styles.algoDefault;
  return styles.algoDefault;
}

function getAlgoEdgeClass(a, b, algoStep) {
  if (!algoStep) return '';
  const { type, path } = algoStep;
  const key = edgeKey(a, b);
  for (let i = 0; i < path.length - 1; i++) {
    if (edgeKey(path[i], path[i + 1]) === key) {
      return type === 'found' ? styles.edgeAlgoFound : styles.edgeAlgoActive;
    }
  }
  return '';
}

// ── Component ────────────────────────────────────────────────────────────────

export default function GraphCanvas({
  graph,
  // game mode
  gameState, validMoves, canReturnToStart, onNodeClick, onComplete,
  // algo mode
  algoStep,
}) {
  const { adjacency, positions, nodes } = graph;
  const isAlgoMode = !!algoStep;

  const allEdges = useMemo(() => getUniqueEdges(nodes, adjacency), [nodes, adjacency]);

  const gameTraversedKeys = useMemo(() => {
    if (isAlgoMode || !gameState) return new Set();
    return getGameTraversedKeys(gameState.path, gameState.isWon, gameState.startNode);
  }, [isAlgoMode, gameState]);

  const handleNodeClick = (nodeId) => {
    if (isAlgoMode || !gameState || gameState.isWon) return;
    if (canReturnToStart && nodeId === gameState.startNode) {
      onComplete();
    } else {
      onNodeClick(nodeId);
    }
  };

  return (
    <svg viewBox="0 0 400 400" className={styles.canvas}>
      {/* Edges */}
      {allEdges.map(([a, b]) => {
        const key = edgeKey(a, b);
        let edgeClass = styles.edge;

        if (isAlgoMode) {
          const ac = getAlgoEdgeClass(a, b, algoStep);
          if (ac) edgeClass += ' ' + ac;
        } else {
          if (gameTraversedKeys.has(key)) {
            edgeClass += ' ' + (gameState?.isWon ? styles.edgeWon : styles.edgeTraversed);
          }
        }

        return (
          <line
            key={key}
            x1={positions[a].x} y1={positions[a].y}
            x2={positions[b].x} y2={positions[b].y}
            className={edgeClass}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(nodeId => {
        const pos = positions[nodeId];

        const nodeClass = isAlgoMode
          ? getAlgoNodeClass(nodeId, algoStep)
          : getGameNodeClass(nodeId, gameState, validMoves ?? [], canReturnToStart);

        const isClickable = !isAlgoMode && gameState && !gameState.isWon && (
          (validMoves ?? []).includes(nodeId) ||
          (canReturnToStart && nodeId === gameState.startNode)
        );

        const isStartNode = gameState?.startNode === nodeId || graph.startNode === nodeId;

        return (
          <g
            key={nodeId}
            onClick={() => handleNodeClick(nodeId)}
            className={`${styles.nodeGroup} ${isClickable ? styles.clickable : ''}`}
          >
            {isStartNode && !isAlgoMode && (
              <circle cx={pos.x} cy={pos.y} r={NODE_RADIUS + 6} className={styles.startRing} />
            )}
            <circle cx={pos.x} cy={pos.y} r={NODE_RADIUS} className={`${styles.nodeCircle} ${nodeClass}`} />
            <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" className={styles.nodeLabel}>
              {nodeId}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
