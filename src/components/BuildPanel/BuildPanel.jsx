import styles from './BuildPanel.module.css';

export default function BuildPanel({ graph, selectedNode, onClear, onShare, shareMsg }) {
  const nodeCount = graph.nodes.length;
  const edgeCount = Object.values(graph.adjacency).reduce((s, ns) => s + ns.length, 0) / 2;

  const getInstruction = () => {
    if (nodeCount === 0) return 'Click anywhere on the canvas to place your first node.';
    if (selectedNode) return `Node ${selectedNode} selected — click another node to connect, or click empty space to deselect.`;
    return 'Click a node to select it, then click another node to add or remove an edge. Right-click a node to delete it.';
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Build Graph</h3>

      <div className={styles.hint}>{getInstruction()}</div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statVal}>{nodeCount}</span>
          <span className={styles.statLabel}>nodes</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statVal}>{edgeCount}</span>
          <span className={styles.statLabel}>edges</span>
        </div>
      </div>

      {nodeCount > 0 && (
        <div className={styles.tip}>
          Switch to <strong>Watch Algorithm</strong> or <strong>Play Game</strong> to use this graph.
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.btnShare} onClick={onShare}>
          {shareMsg || 'Copy Share Link'}
        </button>
        <button className={styles.btnClear} onClick={onClear}>
          Clear All
        </button>
      </div>

      <div className={styles.guide}>
        <div className={styles.guideTitle}>Quick Guide</div>
        <ul className={styles.guideList}>
          <li>Click canvas → add node</li>
          <li>Click node → select it</li>
          <li>Click 2nd node → add/remove edge</li>
          <li>Right-click node → delete node</li>
          <li>Preset in selector → load as starting point</li>
        </ul>
      </div>
    </div>
  );
}
