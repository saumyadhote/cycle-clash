import { useState, useEffect, useMemo } from 'react';
import styles from './App.module.css';
import { GRAPHS, DEFAULT_GRAPH_KEY } from './data/graphs';
import HamiltonianSolver from './algorithms/HamiltonianSolver';
import {
  createGameState, makeMove, completeGame, resetGame,
  getValidMoves, canComplete,
} from './game/gameState';
import useAlgorithmPlayback from './hooks/useAlgorithmPlayback';
import GraphCanvas from './components/GraphCanvas/GraphCanvas';
import InfoPanel from './components/InfoPanel/InfoPanel';
import AlgorithmPanel from './components/AlgorithmPanel/AlgorithmPanel';
import AlgorithmVisualizer from './components/AlgorithmVisualizer/AlgorithmVisualizer';
import GraphSelector from './components/GraphSelector/GraphSelector';

export default function App() {
  const [selectedKey, setSelectedKey] = useState(DEFAULT_GRAPH_KEY);
  const [mode, setMode] = useState('algo'); // 'play' | 'algo'
  const [gameState, setGameState] = useState(null);

  const graph = GRAPHS[selectedKey];

  // Algorithm results (cycle count, list)
  const algorithmResult = useMemo(() => {
    const solver = new HamiltonianSolver(graph.adjacency, graph.nodes);
    return solver.countCycles();
  }, [graph]);

  // Step-by-step trace for the visualizer — always start from node A
  const algoSteps = useMemo(() => {
    const solver = new HamiltonianSolver(graph.adjacency, graph.nodes);
    return solver.recordSteps(graph.startNode);
  }, [graph]);

  const playback = useAlgorithmPlayback(algoSteps);
  // Expose steps on the playback object so AlgorithmVisualizer can render the log
  playback.steps = algoSteps;

  // Compute cumulative stats up to the current step
  const stats = useMemo(() => {
    const slice = algoSteps.slice(0, playback.stepIndex + 1);
    return {
      backtracks:  slice.filter(s => s.type === 'backtrack').length,
      deadEnds:    slice.filter(s => s.type === 'dead_end').length,
      cyclesFound: slice.filter(s => s.type === 'found').length,
    };
  }, [algoSteps, playback.stepIndex]);

  // Reset game whenever the graph changes
  useEffect(() => {
    setGameState(createGameState(graph));
  }, [graph]);

  const handleNodeClick = (nodeId) => setGameState(prev => makeMove(prev, nodeId));
  const handleComplete  = ()       => setGameState(prev => completeGame(prev));
  const handleReset     = ()       => setGameState(prev => resetGame(prev));

  const handleGraphChange = (key) => {
    setSelectedKey(key);
    playback.reset();
  };

  if (!gameState) return null;

  const validMoves = getValidMoves(gameState);
  const canReturnToStart = canComplete(gameState);
  const algoStep = mode === 'algo' ? (playback.currentStep ?? null) : null;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>Cycle Clash</span>
          <span className={styles.subtitle}>Hamiltonian Cycle · NP-Complete · O(n!)</span>
        </div>
        <GraphSelector selected={selectedKey} onChange={handleGraphChange} />
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === 'algo' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('algo')}
          >
            Watch Algorithm
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'play' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('play')}
          >
            Play Game
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Graph canvas */}
        <section className={styles.graphSection}>
          <div className={styles.graphWrapper}>
            <GraphCanvas
              graph={graph}
              gameState={mode === 'play' ? gameState : null}
              validMoves={mode === 'play' ? validMoves : []}
              canReturnToStart={mode === 'play' ? canReturnToStart : false}
              onNodeClick={handleNodeClick}
              onComplete={handleComplete}
              algoStep={algoStep}
            />
          </div>

          {mode === 'play' ? (
            <div className={styles.legend}>
              <LegendItem cls="dotCurrent" label="Current position" />
              <LegendItem cls="dotValid"   label="Valid move" />
              <LegendItem cls="dotVisited" label="Visited" />
              <LegendItem cls="dotStart"   label="Start / End" />
            </div>
          ) : (
            <div className={styles.legend}>
              <LegendItem cls="dotAlgoCurrent"  label="Current node" />
              <LegendItem cls="dotAlgoInPath"   label="In active path" />
              <LegendItem cls="dotAlgoFound"    label="Cycle found" />
              <LegendItem cls="dotAlgoDeadEnd"  label="Dead end" />
            </div>
          )}
        </section>

        {/* Right sidebar */}
        <aside className={styles.sidebar}>
          {mode === 'algo' ? (
            <AlgorithmVisualizer playback={playback} stats={stats} />
          ) : (
            <>
              <InfoPanel gameState={gameState} onReset={handleReset} />
              <AlgorithmPanel
                result={algorithmResult}
                graphName={graph.name}
                startNode={graph.startNode}
              />
            </>
          )}
        </aside>
      </main>
    </div>
  );
}

function LegendItem({ cls, label }) {
  return (
    <div className={styles.legendItem}>
      <span className={`${styles.legendDot} ${styles[cls]}`} />
      <span className={styles.legendLabel}>{label}</span>
    </div>
  );
}
