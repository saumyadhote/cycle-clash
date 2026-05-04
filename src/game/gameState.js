export const createGameState = ({ adjacency, nodes, startNode }) => ({
  adjacency,
  nodes,
  startNode,
  currentNode: startNode,
  visitedNodes: new Set([startNode]),
  path: [startNode],
  isWon: false,
});

export const isValidMove = (state, nextNode) => {
  const isAdjacent = state.adjacency[state.currentNode].includes(nextNode);
  const notVisited = !state.visitedNodes.has(nextNode);
  return isAdjacent && notVisited;
};

export const canComplete = (state) =>
  !state.isWon &&
  state.visitedNodes.size === state.nodes.length &&
  state.adjacency[state.currentNode].includes(state.startNode);

export const getValidMoves = (state) =>
  state.adjacency[state.currentNode].filter(n => !state.visitedNodes.has(n));

export const isStuck = (state) =>
  !state.isWon &&
  getValidMoves(state).length === 0 &&
  !canComplete(state);

export const makeMove = (state, nextNode) => {
  if (!isValidMove(state, nextNode)) return state;
  const visitedNodes = new Set(state.visitedNodes);
  visitedNodes.add(nextNode);
  return {
    ...state,
    currentNode: nextNode,
    visitedNodes,
    path: [...state.path, nextNode],
  };
};

export const completeGame = (state) => {
  if (!canComplete(state)) return state;
  return { ...state, isWon: true };
};

export const resetGame = (state) =>
  createGameState({
    adjacency: state.adjacency,
    nodes: state.nodes,
    startNode: state.startNode,
  });
