import { useRef, useEffect } from 'react';
import styles from './AlgorithmVisualizer.module.css';

const STEP_ICONS = {
  start:     '▶',
  visit:     '→',
  found:     '✓',
  dead_end:  '✗',
  backtrack: '↩',
  done:      '■',
};

const SPEED_LABELS = { slow: 'Slow', medium: 'Medium', fast: 'Fast' };

function StepDescription({ step }) {
  if (!step) return <span className={styles.descPlaceholder}>Press Play to watch the algorithm run.</span>;
  return (
    <span className={`${styles.descText} ${styles[`desc_${step.type}`]}`}>
      {step.description}
    </span>
  );
}

export default function AlgorithmVisualizer({ playback, stats }) {
  const {
    stepIndex, currentStep, isPlaying, isFinished, totalSteps,
    speed, play, pause, stepForward, stepBack, reset, setSpeed,
  } = playback;

  const logRef = useRef(null);

  // Keep the trace log scrolled to show the current step
  useEffect(() => {
    if (logRef.current) {
      const active = logRef.current.querySelector('[data-active="true"]');
      active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [stepIndex]);

  const progress = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;

  // Build log: show up to 120 most-recent steps around current index
  const windowStart = Math.max(0, stepIndex - 60);

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>Algorithm Trace</span>
        <span className={styles.counter}>Step {stepIndex + 1} / {totalSteps}</span>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {/* Current step description */}
      <div className={styles.descBox}>
        <StepDescription step={currentStep} />
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={reset} title="Reset">⏮</button>
        <button className={styles.ctrlBtn} onClick={stepBack} disabled={stepIndex === 0} title="Previous step">◀</button>
        <button
          className={`${styles.ctrlBtn} ${styles.playBtn}`}
          onClick={isPlaying ? pause : play}
          disabled={isFinished}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className={styles.ctrlBtn} onClick={stepForward} disabled={isFinished} title="Next step">▶</button>
        <button className={styles.ctrlBtn} onClick={() => { reset(); }} title="End" style={{ fontSize: 11 }}>⏭</button>
      </div>

      {/* Speed selector */}
      <div className={styles.speedRow}>
        <span className={styles.speedLabel}>Speed</span>
        {Object.keys(SPEED_LABELS).map(s => (
          <button
            key={s}
            className={`${styles.speedBtn} ${speed === s ? styles.speedBtnActive : ''}`}
            onClick={() => setSpeed(s)}
          >
            {SPEED_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <Stat label="Backtracks" value={stats.backtracks} />
        <Stat label="Dead ends" value={stats.deadEnds} />
        <Stat label="Cycles found" value={stats.cyclesFound} color="green" />
      </div>

      {/* Trace log */}
      <div className={styles.logHeader}>Trace log</div>
      <div className={styles.log} ref={logRef}>
        {playback.steps?.slice(windowStart, stepIndex + 1).map((step, i) => {
          const absIndex = windowStart + i;
          const isCurrent = absIndex === stepIndex;
          return (
            <div
              key={absIndex}
              data-active={isCurrent}
              className={`${styles.logRow} ${styles[`log_${step.type}`]} ${isCurrent ? styles.logRowActive : ''}`}
            >
              <span className={styles.logIcon}>{STEP_ICONS[step.type] ?? '·'}</span>
              <span className={styles.logText}>{step.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={`${styles.statValue} ${color === 'green' ? styles.statGreen : ''}`}>{value}</span>
    </div>
  );
}
