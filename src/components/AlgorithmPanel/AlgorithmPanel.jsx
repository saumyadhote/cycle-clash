import styles from './AlgorithmPanel.module.css';

export default function AlgorithmPanel({ result, graphName, startNode }) {
  if (!result) return null;

  const { totalCount, allCycles } = result;

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Algorithm Results</h2>

      <div className={styles.summary}>
        <span className={styles.summaryLabel}>Unique Hamiltonian cycles in {graphName}</span>
        <span className={styles.summaryCount}>{totalCount}</span>
      </div>

      <div className={styles.complexity}>
        <span className={styles.complexityLabel}>Time complexity</span>
        <span className={styles.complexityValue}>O(n!)</span>
        <span className={styles.complexityLabel}>Space complexity</span>
        <span className={styles.complexityValue}>O(n)</span>
        <span className={styles.complexityLabel}>Algorithm</span>
        <span className={styles.complexityValue}>DFS + Backtracking</span>
      </div>

      <div className={styles.cycleList}>
        <span className={styles.cycleListLabel}>All cycles</span>
        {allCycles.map((cycle, i) => (
          <div key={i} className={styles.cycleItem}>
            <span className={styles.cycleIndex}>{i + 1}</span>
            <span className={styles.cyclePath}>
              {[...cycle, cycle[0]].map((node, j) => (
                <span key={j} className={styles.cyclePathItem}>
                  <span className={`${styles.cycleNode} ${node === startNode ? styles.cycleNodeStart : ''}`}>
                    {node}
                  </span>
                  {j < cycle.length && (
                    <span className={styles.cycleArrow}>→</span>
                  )}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
