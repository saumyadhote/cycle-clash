import { useMemo } from 'react';
import { GRAPHS } from '../../data/graphs';
import HamiltonianSolver from '../../algorithms/HamiltonianSolver';
import { checkOre, checkDirac } from '../../algorithms/theorems';
import styles from './TheoryPanel.module.css';

// Pre-computed once at module load — these are fixed reference benchmarks
const BENCHMARKS = ['triangle', 'k4', 'k5', 'k6'].map(key => {
  const g = GRAPHS[key];
  const steps = new HamiltonianSolver(g.adjacency, g.nodes).recordSteps(g.startNode).length;
  return { label: g.name, n: g.nodes.length, steps };
});

export default function TheoryPanel({ graph, totalSteps }) {
  const { nodes, adjacency } = graph;
  const n = nodes.length;

  const ore   = useMemo(() => checkOre(nodes, adjacency),   [nodes, adjacency]);
  const dirac = useMemo(() => checkDirac(nodes, adjacency), [nodes, adjacency]);

  const maxSteps = Math.max(...BENCHMARKS.map(b => b.steps));

  if (n < 3) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelTitle}>Graph Theory</div>
        <div className={styles.empty}>Add at least 3 connected nodes to see theorem analysis.</div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>Graph Theory</div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Sufficient Conditions for Hamiltonian Cycle</div>
        <TheoremRow
          name="Dirac's Theorem"
          badge={dirac.satisfied ? 'SATISFIED' : 'NOT MET'}
          pass={dirac.satisfied}
          detail={
            dirac.satisfied
              ? `min degree ${dirac.minDegree} ≥ n/2 = ${dirac.threshold.toFixed(1)}`
              : `min degree ${dirac.minDegree} < n/2 = ${dirac.threshold.toFixed(1)}`
          }
          implication={dirac.satisfied ? 'A Hamiltonian cycle is guaranteed to exist.' : null}
        />
        <TheoremRow
          name="Ore's Theorem"
          badge={ore.satisfied ? 'SATISFIED' : 'NOT MET'}
          pass={ore.satisfied}
          detail={
            ore.satisfied
              ? `All non-adjacent pairs satisfy deg(u) + deg(v) ≥ ${n}`
              : `deg(${ore.witness?.u}) + deg(${ore.witness?.v}) = ${ore.witness?.degSum} < ${n}`
          }
          implication={ore.satisfied ? 'A Hamiltonian cycle is guaranteed to exist.' : null}
        />
        {!ore.satisfied && !dirac.satisfied && (
          <div className={styles.caveat}>
            Neither condition met — a cycle may still exist, but is not guaranteed.
            The backtracking algorithm will determine the true answer.
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Backtracking Steps — O(n!) Growth</div>
        <div className={styles.chart}>
          {BENCHMARKS.map(({ label, steps }) => (
            <div key={label} className={styles.chartRow}>
              <span className={styles.chartLabel}>{label}</span>
              <div className={styles.chartBarWrap}>
                <div className={styles.chartBar} style={{ width: `${(steps / maxSteps) * 100}%` }} />
              </div>
              <span className={styles.chartCount}>{steps}</span>
            </div>
          ))}
        </div>
        <div className={styles.currentSteps}>
          <span className={styles.currentLabel}>This graph</span>
          <span className={styles.currentValue}>{totalSteps} steps</span>
        </div>
        <div className={styles.note}>
          Doubling n multiplies steps by ~n — the core of NP-completeness.
        </div>
      </div>
    </div>
  );
}

function TheoremRow({ name, badge, pass, detail, implication }) {
  return (
    <div className={styles.theorem}>
      <div className={styles.theoremHeader}>
        <span className={styles.theoremName}>{name}</span>
        <span className={`${styles.badge} ${pass ? styles.badgePass : styles.badgeFail}`}>
          {badge}
        </span>
      </div>
      <div className={styles.theoremDetail}>{detail}</div>
      {implication && <div className={styles.theoremImplication}>{implication}</div>}
    </div>
  );
}
