import { useState, useEffect, useMemo } from 'react';
import styles from './App.module.css';
import { GRAPHS, DEFAULT_GRAPH_KEY } from './data/graphs';
import HamiltonianSolver from './algorithms/HamiltonianSolver';
import {
  createGameState, makeMove, completeGame, resetGame,
  getValidMoves, canComplete,
} from './game/gameState';
import useAlgorithmPlayback from './hooks/useAlgorithmPlayback';
import { useGraphBuilder } from './hooks/useGraphBuilder';
import { pushURLState, copyShareLink, decodeState } from './utils/urlState';
import GraphCanvas from './components/GraphCanvas/GraphCanvas';
import InfoPanel from './components/InfoPanel/InfoPanel';
import AlgorithmPanel from './components/AlgorithmPanel/AlgorithmPanel';
import AlgorithmVisualizer from './components/AlgorithmVisualizer/AlgorithmVisualizer';
import GraphSelector from './components/GraphSelector/GraphSelector';
import BuildPanel from './components/BuildPanel/BuildPanel';
import TheoryPanel from './components/TheoryPanel/TheoryPanel';

function resolveInitialState() {
  const { graphKey, customGraph } = decodeState();
  const validPreset = graphKey && graphKey !== 'custom' && GRAPHS[graphKey];
  return {
    initialKey: validPreset ? graphKey : (graphKey === 'custom' ? 'custom' : DEFAULT_GRAPH_KEY),
    initialCustomGraph: customGraph,
    initialMode: graphKey === 'custom' ? 'build' : 'algo',
  };
}

const { initialKey, initialCustomGraph, initialMode } = resolveInitialState();

export default function App() {
  const [selectedKey, setSelectedKey] = useState(initialKey);
  const [mode, setMode] = useState(initialMode);
  const [gameState, setGameState] = useState(null);
  const [shareMsg, setShareMsg] = useState('');

  const builder = useGraphBuilder(initialCustomGraph);

  const graph = useMemo(() => {
    if (selectedKey === 'custom') {
      return {
        ...builder.graph,
        name: 'Custom',
        description: `Custom — ${builder.graph.nodes.length} nodes`,
        startNode: builder.graph.startNode,
      };
    }
    return GRAPHS[selectedKey];
  }, [selectedKey, builder.graph]);

  useEffect(() => {
    pushURLState(selectedKey, builder.graph);
  }, [selectedKey, builder.graph]);

  const algorithmResult = useMemo(() => {
    if (!graph || graph.nodes.length < 3) return { totalCount: 0, allCycles: [] };
    const solver = new HamiltonianSolver(graph.adjacency, graph.nodes);
    return solver.countCycles();
  }, [graph]);

  const algoSteps = useMemo(() => {
    if (!graph || graph.nodes.length < 3 || !graph.startNode) return [];
    const solver = new HamiltonianSolver(graph.adjacency, graph.nodes);
    return solver.recordSteps(graph.startNode);
  }, [graph]);

  const playback = useAlgorithmPlayback(algoSteps);
  playback.steps = algoSteps;

  const stats = useMemo(() => {
    const slice = algoSteps.slice(0, playback.stepIndex + 1);
    return {
      backtracks:  slice.filter(s => s.type === 'backtrack').length,
      deadEnds:    slice.filter(s => s.type === 'dead_end').length,
      cyclesFound: slice.filter(s => s.type === 'found').length,
    };
  }, [algoSteps, playback.stepIndex]);

  useEffect(() => {
    if (graph && graph.nodes.length > 0) setGameState(createGameState(graph));
    else setGameState(null);
  }, [graph]);

  const handleNodeClick = (nodeId) => setGameState(prev => makeMove(prev, nodeId));
  const handleComplete  = ()       => setGameState(prev => completeGame(prev));
  const handleReset     = ()       => setGameState(prev => resetGame(prev));

  const handleGraphChange = (key) => {
    if (key === 'custom') {
      setSelectedKey('custom');
      setMode('build');
      return;
    }
    setSelectedKey(key);
    if (mode === 'build') setMode('algo');
    playback.reset();
  };

  const handleShare = async () => {
    try {
      await copyShareLink(selectedKey, builder.graph);
      setShareMsg('Copied!');
      setTimeout(() => setShareMsg(''), 2000);
    } catch {
      setShareMsg('Failed');
      setTimeout(() => setShareMsg(''), 2000);
    }
  };

  if (!gameState && mode !== 'build') return null;

  const validMoves = gameState ? getValidMoves(gameState) : [];
  const canReturnToStart = gameState ? canComplete(gameState) : false;
  const algoStep = mode === 'algo' ? (playback.currentStep ?? null) : null;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>Cycle Clash</span>
          <span className={styles.subtitle}>Hamiltonian Cycle · NP-Complete · O(n!)</span>
        </div>
        <GraphSelector
          selected={selectedKey}
          onChange={handleGraphChange}
          customGraph={builder.graph}
        />
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
          <button
            className={`${styles.modeBtn} ${mode === 'build' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setMode('build');
              setSelectedKey('custom');
            }}
          >
            Build Graph
          </button>
        </div>
      </header>

      <main className={styles.main}>
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
              buildMode={mode === 'build'}
              builderSelectedNode={builder.selectedNode}
              onBuildCanvasClick={builder.addNode}
              onBuildNodeClick={builder.handleNodeClick}
              onRemoveBuildNode={builder.removeNode}
            />
          </div>

          {mode === 'play' && (
            <div className={styles.legend}>
              <LegendItem cls="dotCurrent" label="Current position" />
              <LegendItem cls="dotValid"   label="Valid move" />
              <LegendItem cls="dotVisited" label="Visited" />
              <LegendItem cls="dotStart"   label="Start / End" />
            </div>
          )}
          {mode === 'algo' && (
            <div className={styles.legend}>
              <LegendItem cls="dotAlgoCurrent"  label="Current node" />
              <LegendItem cls="dotAlgoInPath"   label="In active path" />
              <LegendItem cls="dotAlgoFound"    label="Cycle found" />
              <LegendItem cls="dotAlgoDeadEnd"  label="Dead end" />
            </div>
          )}
          {mode === 'build' && (
            <div className={styles.legend}>
              <LegendItem cls="dotBuildDefault"  label="Node" />
              <LegendItem cls="dotBuildSelected" label="Selected" />
              <LegendItem cls="dotStart"         label="Start node (first placed)" />
            </div>
          )}
        </section>

        <aside className={styles.sidebar}>
          {mode === 'algo' && (
            <>
              <AlgorithmVisualizer playback={playback} stats={stats} />
              <TheoryPanel graph={graph} totalSteps={algoSteps.length} />
            </>
          )}
          {mode === 'play' && (
            <>
              <InfoPanel gameState={gameState} onReset={handleReset} />
              <AlgorithmPanel
                result={algorithmResult}
                graphName={graph.name}
                startNode={graph.startNode}
              />
              <TheoryPanel graph={graph} totalSteps={algoSteps.length} />
            </>
          )}
          {mode === 'build' && (
            <BuildPanel
              graph={builder.graph}
              selectedNode={builder.selectedNode}
              onClear={builder.clearGraph}
              onShare={handleShare}
              shareMsg={shareMsg}
            />
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
