import styles from './InfoPanel.module.css';
import { canComplete, getValidMoves, isStuck } from '../../game/gameState';

const STATUS = {
  won: { label: 'Hamiltonian cycle found!', cls: 'won' },
  canReturn: { label: 'Return to start to complete the cycle!', cls: 'canReturn' },
  stuck: { label: 'Dead end — no valid moves left.', cls: 'stuck' },
  playing: { label: 'Click a highlighted node to move.', cls: 'playing' },
  start: { label: 'Click a green node to begin.', cls: 'playing' },
};

function getStatus(gameState) {
  if (gameState.isWon) return STATUS.won;
  if (canComplete(gameState)) return STATUS.canReturn;
  if (isStuck(gameState)) return STATUS.stuck;
  if (gameState.path.length === 1) return STATUS.start;
  return STATUS.playing;
}

export default function InfoPanel({ gameState, onReset }) {
  const { path, startNode, nodes, isWon } = gameState;
  const status = getStatus(gameState);
  const progress = gameState.visitedNodes.size;
  const total = nodes.length;

  const displayPath = isWon
    ? [...path, startNode]
    : path;

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Your Journey</h2>

      <div className={styles.progress}>
        <span className={styles.progressLabel}>Nodes visited</span>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${isWon ? styles.progressWon : ''}`}
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
        <span className={styles.progressCount}>{progress} / {total}</span>
      </div>

      <div className={`${styles.statusBadge} ${styles[`status_${status.cls}`]}`}>
        {status.label}
      </div>

      <div className={styles.pathSection}>
        <span className={styles.pathLabel}>Path</span>
        <div className={styles.pathDisplay}>
          {displayPath.map((node, i) => (
            <span key={i} className={styles.pathItem}>
              <span className={`${styles.pathNode} ${node === startNode ? styles.pathNodeStart : ''}`}>
                {node}
              </span>
              {i < displayPath.length - 1 && (
                <span className={styles.pathArrow}>→</span>
              )}
            </span>
          ))}
          {!isWon && (
            <span className={styles.pathCursor}>_</span>
          )}
        </div>
      </div>

      <button
        className={styles.resetBtn}
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}
