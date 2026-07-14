import { useState, useEffect, useCallback } from 'react';
import styles from './LandingPage.module.css';

const AUDIENCES = [
  {
    id: 'undergrad',
    num: '01',
    label: '/Undergrad*',
    title: 'Undergraduate',
    desc: 'New to graph theory? Start here — watch the algorithm, play the game, and build intuition.',
  },
  {
    id: 'grad',
    num: '02',
    label: '/Graduate*',
    title: 'Graduate / Research',
    desc: 'Explore theorem conditions, compare step counts, and build custom graphs for your research.',
  },
  {
    id: 'professor',
    num: '03',
    label: '/Professor*',
    title: 'Professor',
    desc: 'Build lecture-ready graphs, share links with students, and demonstrate NP-completeness live.',
  },
];

export default function LandingPage({ onSelect }) {
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [isExiting, setIsExiting]   = useState(false);

  const handleSelect = useCallback((audience) => {
    setIsExiting(true);
    setTimeout(() => onSelect(audience), 480);
  }, [onSelect]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setFocusedIdx(i => (i + 1) % AUDIENCES.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setFocusedIdx(i => (i - 1 + AUDIENCES.length) % AUDIENCES.length);
      } else if (e.key === 'Enter' || e.key === ' ') {
        handleSelect(AUDIENCES[focusedIdx].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusedIdx, handleSelect]);

  return (
    <div className={`${styles.page} ${isExiting ? styles.pageExit : ''}`}>
      <div className={styles.layout}>

        {/* ── Left: description ──────────────────────────────── */}
        <div className={styles.left}>
          <div className={styles.leftContent}>
            <div className={styles.appTitle}>
              <span className={styles.appTitleWord}>Cycle</span>
              <span className={styles.appTitleWord}>Clash</span>
              <span className={styles.appTitleSub}>Hamiltonian Cycle · NP-Complete · O(n!)</span>
            </div>
            <p className={styles.descParagraph}>
              Cycle Clash is more than a visualizer — it is a hands-on lens
              into one of computer science's hardest open problems.
            </p>
            <p className={styles.descParagraph}>
              Watch a backtracking algorithm navigate every dead end and
              retreat. Prove theorems with a graph you drew yourself.
              Race a friend to find the cycle they never learned existed.
            </p>
            <p className={styles.descParagraph}>
              Built for the classroom and the lab, from first-year
              introduction to graduate seminar. Every mode, every graph,
              every step is shareable with a single link.
            </p>
            <div className={styles.hint}>
              ← select a notebook to continue
            </div>
          </div>
        </div>

        {/* ── Right: folder ──────────────────────────────────── */}
        <div className={styles.right}>
          {/* Graph paper peeking behind folder */}
          <div className={styles.paperPeek} />

          <div className={styles.folder}>
            {/* Cards grid */}
            <div className={styles.cardGrid}>
              {AUDIENCES.map((aud, idx) => {
                const isFocused = focusedIdx === idx;
                return (
                  <div
                    key={aud.id}
                    className={`${styles.cardSlot} ${isFocused ? styles.cardSlotFocused : ''}`}
                    onMouseEnter={() => setFocusedIdx(idx)}
                    onClick={() => handleSelect(aud.id)}
                  >
                    <div className={`${styles.illustration} ${styles[`illus_${aud.id}`]}`}>
                      <IllustrationContent id={aud.id} />
                    </div>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardNum}>{aud.num}</span>
                      <span className={styles.cardLabel}>{aud.label}</span>
                      <span className={styles.cardTitle}>{aud.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected audience description */}
            <div className={styles.selectedInfo}>
              <span className={styles.selectedDesc}>
                {AUDIENCES[focusedIdx].desc}
              </span>
              <span className={styles.selectCta}>click or press Enter →</span>
            </div>

            {/* Focus hint */}
            <div className={styles.folderFooter}>
              <span className={styles.keyHint}>↑ ↓ ← → navigate · Enter select</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page footer ──────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.brandScript}>@CycleClash</span>
        </div>
        <div className={styles.footerContents}>
          <span>CHOOSE YOUR NOTEBOOK</span>
        </div>
      </footer>
    </div>
  );
}

function IllustrationContent({ id }) {
  if (id === 'undergrad') {
    return (
      <div className={styles.illusUndergrad}>
        <div className={styles.spiral}>
          {[...Array(5)].map((_, i) => <div key={i} className={styles.spiralDot} />)}
        </div>
        <div className={styles.lines}>
          {[...Array(5)].map((_, i) => <div key={i} className={styles.line} />)}
        </div>
        <div className={styles.marginLine} />
      </div>
    );
  }
  if (id === 'grad') {
    return (
      <div className={styles.illusGrad}>
        <div className={styles.gridPaper} />
        <div className={styles.graphDot} />
      </div>
    );
  }
  return (
    <div className={styles.illusProf}>
      <div className={styles.profTitle}>LECTURE<br/>NOTES</div>
      <div className={styles.profLines}>
        {[...Array(3)].map((_, i) => <div key={i} className={styles.profLine} />)}
      </div>
    </div>
  );
}
