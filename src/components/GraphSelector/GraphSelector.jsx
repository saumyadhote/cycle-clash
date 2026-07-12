import styles from './GraphSelector.module.css';
import { GRAPHS, GRAPH_KEYS } from '../../data/graphs';

export default function GraphSelector({ selected, onChange, customGraph }) {
  const customEdgeCount = customGraph
    ? Object.values(customGraph.adjacency).reduce((s, ns) => s + ns.length, 0) / 2
    : 0;

  return (
    <div className={styles.selectorWrapper}>
      <div className={styles.selector}>
        {GRAPH_KEYS.map(key => (
          <button
            key={key}
            className={`${styles.btn} ${selected === key ? styles.btnActive : ''}`}
            onClick={() => onChange(key)}
          >
            {GRAPHS[key].name}
            <span className={styles.nodeCount}>{GRAPHS[key].nodes.length}n</span>
          </button>
        ))}
        <button
          className={`${styles.btn} ${styles.btnCustom} ${selected === 'custom' ? styles.btnActive : ''}`}
          onClick={() => onChange('custom')}
        >
          Custom
          <span className={styles.nodeCount}>
            {customGraph && customGraph.nodes.length > 0 ? `${customGraph.nodes.length}n ${customEdgeCount}e` : '+'}
          </span>
        </button>
      </div>
    </div>
  );
}
