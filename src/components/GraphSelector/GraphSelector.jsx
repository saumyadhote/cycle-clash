import styles from './GraphSelector.module.css';
import { GRAPHS, GRAPH_KEYS } from '../../data/graphs';

export default function GraphSelector({ selected, onChange }) {
  return (
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
    </div>
  );
}
