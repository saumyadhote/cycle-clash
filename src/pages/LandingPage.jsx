import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import styles from './LandingPage.module.css';

const NOTEBOOKS = [
  {
    id: 'foundation',
    label: 'Foundation',
    audience: 'undergrad',
    color: '#1C2B4A',
    spineColor: '#111B2E',
    rotation: -3,
    z: 1,
    desc: 'New to graph theory? Start here — watch the algorithm, build intuition, find your first cycle.',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    audience: 'grad',
    color: '#2B4A35',
    spineColor: '#1B3022',
    rotation: 2,
    z: 3,
    desc: 'Explore theorem conditions, compare step counts, and build custom graphs for research.',
  },
  {
    id: 'professional',
    label: 'Professional',
    audience: 'professor',
    color: '#5C1A2A',
    spineColor: '#3A0F1A',
    rotation: -1.5,
    z: 2,
    desc: 'Build lecture-ready graphs, share links with students, demonstrate NP-completeness live.',
  },
];

const TABS = ['Intro', 'Theory', 'Examples', 'Notes', 'Summary'];

const CONTENT = {
  foundation: {
    Intro: {
      heading: 'Begin Your Journey',
      body: 'Graph theory models relationships as nodes and edges. A Hamiltonian cycle visits every node exactly once and returns to its origin — elegant in description, profound in computational depth. This notebook guides you from first principles to your first cycle.',
    },
    Theory: {
      heading: 'The Hamiltonian Problem',
      body: 'A Hamiltonian cycle exists when you can traverse every vertex of a graph exactly once in a closed loop. Despite its intuitive definition, no polynomial-time algorithm is known — placing it firmly in NP-complete territory. Ore\'s and Dirac\'s theorems offer sufficient conditions, not guarantees.',
    },
    Examples: {
      heading: 'Graphs to Explore',
      body: 'Start with the Petersen graph — beautifully symmetric, yet it contains no Hamiltonian cycle. Compare with complete graph K₅ where every path exists. The contrast reveals how graph structure governs algorithmic difficulty.',
    },
    Notes: {
      heading: 'Things to Watch',
      body: 'Observe the backtracking algorithm navigate dead ends. Count the retreats. Notice how a single missing edge can collapse exponential search trees into dead ends within seconds. The path matters as much as the destination.',
    },
    Summary: {
      heading: 'Your First Steps',
      body: 'You now understand that Hamiltonian cycles sit at the heart of combinatorial optimization. The algorithm you will watch runs in O(n!) time — but for small graphs, cycles emerge with surprising clarity. Continue to the lab.',
    },
  },
  advanced: {
    Intro: {
      heading: 'Beyond the Basics',
      body: 'You already know graphs. You understand NP-completeness. This notebook is about depth: theorem conditions, step-count analysis, and the subtle structural properties that make some graphs computationally hard and others trivially easy.',
    },
    Theory: {
      heading: 'Ore & Dirac Conditions',
      body: 'Dirac\'s theorem: if every vertex in a graph with n ≥ 3 nodes has degree ≥ n/2, a Hamiltonian cycle is guaranteed. Ore\'s theorem generalizes: if deg(u) + deg(v) ≥ n for every non-adjacent pair, the cycle exists. HamiltonianLab checks these conditions live as you build.',
    },
    Examples: {
      heading: 'Custom Graph Analysis',
      body: 'Build graphs that satisfy Dirac\'s condition and verify cycle existence. Then systematically remove edges to find the threshold where the guarantee breaks. The build-and-verify loop makes abstract theorem conditions tangible.',
    },
    Notes: {
      heading: 'Step Count Patterns',
      body: 'Compare step counts across graph families: complete graphs, grid graphs, random graphs. Notice how degree sequence determines search depth. The algorithm\'s behavior is a fingerprint of graph structure.',
    },
    Summary: {
      heading: 'Research Applications',
      body: 'Hamiltonian cycle variants appear in VLSI design, genome assembly, logistics, and network routing. Every application inherits the core computational challenge. The intuition built here translates directly into research practice.',
    },
  },
  professional: {
    Intro: {
      heading: 'For the Classroom',
      body: 'HamiltonianLab was designed with the seminar in mind. Build any graph, share it with a single URL, and watch students follow the exact same backtracking trace you demonstrate. Every state is reproducible and shareable.',
    },
    Theory: {
      heading: 'Theorem Demonstrations',
      body: 'Construct a graph that satisfies Ore\'s condition. Verify the cycle. Then remove one edge to violate it — and show the algorithm\'s extended search. Live theorem demonstration with a graph the class helped build.',
    },
    Examples: {
      heading: 'Preset Graph Library',
      body: 'Petersen, complete graphs K₄–K₇, grid graphs, random sparse graphs — all loaded instantly. Academic presets let you move between examples without rebuilding. Perfect for pacing a fifty-minute lecture.',
    },
    Notes: {
      heading: 'Student Exercises',
      body: 'Share a graph URL before class. Ask students to find the Hamiltonian cycle manually, then reveal the algorithm\'s trace. The game mode adds competitive pressure — students race the algorithm. Engagement without gimmicks.',
    },
    Summary: {
      heading: 'Link-Shareable State',
      body: 'Every graph — preset or custom-built — encodes into the URL. Share graphs via email or LMS. Students open exactly what you built. No accounts, no installations, no friction. Just graph theory, immediately.',
    },
  },
};

/* ── Closed notebook (stack view) ────────────────────── */
function ClosedNotebook({ notebook, isFocused }) {
  return (
    <div
      className={`${styles.closedBook} ${isFocused ? styles.closedBookFocused : ''}`}
      style={{ '--cover': notebook.color, '--spine': notebook.spineColor }}
    >
      <div className={styles.cbSpine} />
      <div className={styles.cbCover}>
        <div className={styles.cbCloth} />
        <span className={styles.cbTitle}>{notebook.label}</span>
      </div>
      <div className={styles.cbPageEdge} />
      <div className={`${styles.cbTabs} ${isFocused ? styles.cbTabsOn : ''}`}>
        {TABS.map(tab => (
          <div key={tab} className={styles.cbTab}>
            <span>{tab}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Open notebook (reading view) ────────────────────── */
function ReadingNotebook({ notebook, activeTab, onTabChange, onClose, onSelect, reduced }) {
  const [coverOpen, setCoverOpen] = useState(false);
  const [contentOn, setContentOn] = useState(false);

  useEffect(() => {
    if (reduced) { setCoverOpen(true); setContentOn(true); return; }
    const t1 = setTimeout(() => setCoverOpen(true), 250);
    const t2 = setTimeout(() => setContentOn(true), 820);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reduced]);

  const content = CONTENT[notebook.id][activeTab];

  return (
    <div className={styles.readingOuter}>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close notebook">
        ← Back
      </button>

      <div className={styles.bookWrap} style={{ perspective: '2400px' }}>
        {/* Back cover — always behind everything */}
        <div
          className={styles.bookBackCover}
          style={{ '--cover': notebook.color }}
        />

        {/* Pages — revealed as cover opens */}
        <div className={styles.bookPages}>
          {/* Left page */}
          <div className={styles.leftPage}>
            <motion.div
              className={styles.leftContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: contentOn ? 1 : 0 }}
              transition={{ duration: 0.45 }}
            >
              <h2 className={styles.bookTitle} style={{ color: notebook.color }}>
                {notebook.label}
              </h2>
              <div className={styles.bookRule} style={{ background: notebook.color }} />
              <div className={styles.bookMeta}>
                <p>HamiltonianLab</p>
                <p>Graph Theory Explorer</p>
              </div>
            </motion.div>
          </div>

          {/* Center spine */}
          <div className={styles.pageSpine} style={{ '--spine': notebook.spineColor }} />

          {/* Right page */}
          <div className={styles.rightPage}>
            {/* Divider tabs */}
            <div className={styles.pageTabs} role="tablist" aria-label="Sections">
              {TABS.map(tab => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`${styles.pageTab} ${activeTab === tab ? styles.pageTabOn : ''}`}
                  style={activeTab === tab ? { '--tab': notebook.color } : {}}
                  onClick={() => onTabChange(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <motion.div
              className={styles.rightContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: contentOn ? 1 : 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: reduced ? 0 : 0.2 }}
                >
                  <h3 className={styles.sectionHead}>{content.heading}</h3>
                  <p className={styles.sectionBody}>{content.body}</p>
                </motion.div>
              </AnimatePresence>

              <button
                className={styles.enterBtn}
                style={{ '--btn': notebook.color }}
                onClick={() => onSelect(notebook.audience)}
              >
                Enter the Lab →
              </button>
            </motion.div>
          </div>
        </div>

        {/* Front cover — rotates open around spine (left edge) */}
        <motion.div
          className={styles.frontCover}
          style={{ '--cover': notebook.color, transformOrigin: 'left center' }}
          animate={{ rotateY: coverOpen ? -172 : 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: 'spring', stiffness: 52, damping: 17 }
          }
        >
          <div className={styles.coverFront}>
            <div className={styles.coverCloth} />
            <span className={styles.coverLabel}>{notebook.label}</span>
          </div>
          <div className={styles.coverInside} />
        </motion.div>
      </div>
    </div>
  );
}

/* ── About sticky note ───────────────────────────────── */
function AboutButton({ show, onToggle }) {
  return (
    <div className={styles.aboutArea}>
      <AnimatePresence>
        {show && (
          <motion.div
            className={styles.stickyNote}
            initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: -1.5 }}
            exit={{ scale: 0.6, opacity: 0, rotate: -8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            style={{ transformOrigin: 'bottom right' }}
            role="dialog"
            aria-label="About this project"
          >
            <button className={styles.stickyClose} onClick={onToggle} aria-label="Close">×</button>
            <h4 className={styles.stickyTitle}>About</h4>
            <p className={styles.stickyText}>
              HamiltonianLab makes NP-complete problems tangible. Watch a backtracking algorithm
              navigate every dead end, prove theorems with custom graphs, and share any state
              with a single link.
            </p>
            <p className={styles.stickyText}>Built with React, Vite, and a lot of graph theory.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={styles.aboutBtn}
        onClick={onToggle}
        aria-label="About this project"
        aria-expanded={show}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
      >
        ?
      </motion.button>
    </div>
  );
}

/* ── Main landing page ───────────────────────────────── */
export default function LandingPage({ onSelect }) {
  const [openedId, setOpenedId] = useState(null);
  const [activeTab, setActiveTab] = useState('Intro');
  const [showAbout, setShowAbout] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(1);
  const [isExiting, setIsExiting] = useState(false);
  const reduced = useReducedMotion();

  const handleOpen = useCallback((id) => {
    setOpenedId(id);
    setActiveTab('Intro');
  }, []);

  const handleClose = useCallback(() => setOpenedId(null), []);

  const handleSelect = useCallback((audienceId) => {
    setIsExiting(true);
    setTimeout(() => onSelect(audienceId), reduced ? 0 : 380);
  }, [onSelect, reduced]);

  useEffect(() => {
    const onKey = (e) => {
      if (openedId) {
        if (e.key === 'Escape') handleClose();
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
        setFocusedIdx(i => (i + 1) % NOTEBOOKS.length);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
        setFocusedIdx(i => (i - 1 + NOTEBOOKS.length) % NOTEBOOKS.length);
      else if (e.key === 'Enter' || e.key === ' ')
        handleOpen(NOTEBOOKS[focusedIdx].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openedId, focusedIdx, handleOpen, handleClose]);

  const openedNotebook = NOTEBOOKS.find(n => n.id === openedId);

  return (
    <div className={`${styles.page} ${isExiting ? styles.pageExit : ''}`}>
      <AnimatePresence mode="wait">
        {!openedId ? (
          <motion.div
            key="stack"
            className={styles.stackView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: reduced ? 0 : 0.28 }}
          >
            <header className={styles.stackHeader}>
              <h1 className={styles.heroTitle}>HamiltonianLab</h1>
              <p className={styles.heroSub}>Choose your path through graph theory</p>
            </header>

            <div className={styles.notebookRow} role="list" aria-label="Notebooks">
              {NOTEBOOKS.map((nb, idx) => (
                <motion.button
                  key={nb.id}
                  role="listitem"
                  className={styles.nbSlot}
                  aria-label={`Open ${nb.label} notebook`}
                  style={{ '--rot': `${nb.rotation}deg`, zIndex: focusedIdx === idx ? 10 : nb.z }}
                  animate={{
                    y: focusedIdx === idx ? -18 : 0,
                    scale: focusedIdx === idx ? 1.05 : 0.96,
                  }}
                  transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 28 }}
                  onHoverStart={() => setFocusedIdx(idx)}
                  onFocus={() => setFocusedIdx(idx)}
                  onClick={() => handleOpen(nb.id)}
                >
                  <ClosedNotebook notebook={nb} isFocused={focusedIdx === idx} />
                </motion.button>
              ))}
            </div>

            <p className={styles.stackHint} aria-live="polite">
              {NOTEBOOKS[focusedIdx].desc}
            </p>

            <p className={styles.stackCue}>click a notebook or press Enter</p>
          </motion.div>
        ) : (
          <motion.div
            key="reading"
            className={styles.readingView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.22 }}
          >
            <ReadingNotebook
              notebook={openedNotebook}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onClose={handleClose}
              onSelect={handleSelect}
              reduced={!!reduced}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AboutButton show={showAbout} onToggle={() => setShowAbout(v => !v)} />
    </div>
  );
}
