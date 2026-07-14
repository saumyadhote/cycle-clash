# Cycle Clash

An interactive visualizer for the **Hamiltonian Cycle Problem** — watch a backtracking algorithm solve it step-by-step, prove theorems, build custom graphs, and share them with a single link.

**Live demo → [cycle-clash.vercel.app](https://cycle-clash.vercel.app)**

---

## Who is this for?

Select your path on the landing page, or jump to the section below that fits you.

- [For Undergraduates](#-for-undergraduates)
- [For Graduate & Research Students](#-for-graduate--research-students)
- [For Professors](#-for-professors)
- [Technical Reference](#technical-reference)

---

## 🎒 For Undergraduates

### What is the Hamiltonian Cycle Problem?

Given a graph (nodes connected by edges), a **Hamiltonian Cycle** is a path that visits every node exactly once and returns to the starting node. Finding one — or proving none exists — is NP-Complete. That means no fast algorithm is known, and the only way to be certain is to check all possibilities.

### How to use Cycle Clash

**Start with Watch Algorithm mode.**

1. Open the app and select **K₄** (the default — 4 nodes, all connected).
2. Press **Play** and watch the algorithm in action:
   - **Orange node** = where the algorithm is right now
   - **Blue nodes** = nodes already in the current path
   - **Red node** = dead end (no valid moves forward)
   - **Green nodes** = a complete Hamiltonian cycle was found
3. Use **Slow** speed so you can follow each decision.
4. Read the **Trace Log** on the right — every move is explained in plain English.

**Then try Play Game mode.**

Switch to **Play Game** and try to find a Hamiltonian cycle yourself. Click valid (green) nodes to move. When you've visited all nodes, return to the start. It's harder than it looks on larger graphs.

**Suggested progression:**

| Graph | What to learn |
|---|---|
| Triangle (K₃) | Simplest possible cycle — one solution, two if you count direction |
| Complete K₄ | 3 unique cycles, algorithm explores and backtracks visibly |
| Pentagon (C₅) | Sparse graph — only one way around |
| Wheel W₄ | Hub-and-spoke structure, shows how degree affects options |
| Complete K₅ | 12 cycles — watch the step count climb |

### What you will understand after this

- Why backtracking works (commit → explore → undo)
- What "NP-Complete" means in practice (try K₆ and see the step count)
- Why cycles are deduplicated (rotations and reversals are the same cycle)
- The difference between a graph that *has* a cycle and one that *doesn't*

---

## 🔬 For Graduate & Research Students

### Built-in academic graphs

The graph selector includes several graphs with known theoretical properties:

| Graph | Nodes | Property |
|---|---|---|
| Complete K₄ | 4 | 3 unique Hamiltonian cycles |
| Complete K₅ | 5 | 12 unique cycles, Dirac's theorem satisfied |
| Complete K₆ | 6 | 60 unique cycles — O(n!) growth visible |
| Bipartite K₃,₃ | 6 | Complete bipartite, 3 unique cycles |
| Wheel W₄ | 5 | Hub-and-spoke, interesting degree structure |
| Petersen Graph | 10 | 3-regular, **famously non-Hamiltonian** — proves that the algorithm must exhaust all paths to confirm no cycle exists |

### Theorem Checker

The **Theory** panel (visible in both Watch and Play modes) checks two classical sufficient conditions for every graph:

**Dirac's Theorem (1952):** If every vertex has degree ≥ n/2, a Hamiltonian cycle is guaranteed.

**Ore's Theorem (1960):** If for every pair of non-adjacent vertices u, v: deg(u) + deg(v) ≥ n, a Hamiltonian cycle is guaranteed.

Both are *sufficient but not necessary*. The Pentagon satisfies neither yet has a Hamiltonian cycle. The Petersen graph satisfies neither and has none. These distinctions make the theorem checker a useful teaching and exploration tool.

### Complexity Analysis

The Theory panel also shows a **step count chart** comparing backtracking trace lengths across K₃, K₄, K₅, and K₆. This shows empirical O(n!) growth alongside the current graph's step count — useful for distinguishing worst-case theory from observed behavior on sparse or structured graphs.

### Custom Graph Builder

Switch to **Build Graph** mode to construct any graph:

- Click empty canvas → place a node (auto-labeled A, B, C…)
- Click a node → select it; click another → toggle edge
- Right-click a node → delete it and its edges
- Switch to **Watch Algorithm** → the backtracking solver runs on your graph

This allows you to quickly test edge cases, construct counterexamples, or explore graph classes not in the preset list.

### URL Sharing

Every graph state — preset or custom — is encoded in the URL. After building a graph, click **Copy Share Link** in the Build panel. Anyone opening that URL sees the exact same graph, ready to run. Useful for sharing examples in papers, lab meetings, or course assignments.

---

## 🖊️ For Professors

### Lecture workflows

**Demonstrating backtracking (intro algorithms course)**

1. Open the app, select **K₄**, set speed to **Slow**.
2. Press Play. Narrate what the algorithm is doing at each step using the trace log.
3. Pause at a dead end — explain why the algorithm backtracks.
4. Fast-forward to a found cycle — show how deduplication works (each cycle appears 2n times raw due to rotations and direction).

**Demonstrating NP-Completeness (theory course)**

1. Open the **Theory** panel. Show the complexity chart: K₃ → K₄ → K₅ → K₆ step counts.
2. Run K₆ on Fast speed — let students count the steps climbing.
3. Explain: this is why we can't solve it in polynomial time.

**Demonstrating why sufficient conditions matter (graph theory course)**

1. Load the **Petersen Graph**.
2. Show the Theory panel: neither Dirac's nor Ore's theorem is satisfied.
3. Run the algorithm — it finds **zero cycles** and terminates, having exhausted every path.
4. Contrast with **K₅**: both theorems satisfied, 12 cycles found.
5. Contrast with **Pentagon**: neither theorem satisfied, but one cycle exists anyway — showing the theorems are sufficient, not necessary.

### Building custom lecture graphs

In **Build Graph** mode, construct any graph live during a lecture:

1. Click to place nodes (labeled automatically)
2. Click two nodes to connect them
3. Switch to **Watch Algorithm** to run the solver
4. Switch to **Play Game** to have a student try it

Each custom graph generates a shareable URL. Build graphs before class, paste the links into your slides, and students open the exact graph you prepared.

### Sharing with students

Send students a direct link to any graph. When they open it:
- The graph is loaded automatically
- They can watch the algorithm or play the game
- No account, no install — browser only

---

## Technical Reference

### The Algorithm

**DFS Backtracking** from a fixed start node:

```
function backtrack(current, path, visited):
  if all nodes visited:
    if edge exists from current to start → cycle found
    else → dead end
    return

  for each neighbor of current:
    if neighbor not visited:
      visit neighbor
      backtrack(neighbor, path + [neighbor], visited + {neighbor})
      unvisit neighbor  ← backtrack
```

**Complexity:**
- Time: O(n!) — each permutation of nodes is a candidate path
- Space: O(n) — path and visited set grow with depth

**Cycle deduplication:** Each unique undirected cycle is counted 2n times in a raw traversal (n rotations × 2 directions). The solver normalizes each cycle to its lexicographically smallest rotation, then deduplicates by canonical form.

### Preset Graphs

| Key | Name | Nodes | Edges | Unique Cycles |
|---|---|---|---|---|
| `triangle` | Triangle (K₃) | 3 | 3 | 1 |
| `k4` | Complete K₄ | 4 | 6 | 3 |
| `pentagon` | Pentagon (C₅) | 5 | 5 | 1 |
| `k5` | Complete K₅ | 5 | 10 | 12 |
| `k6` | Complete K₆ | 6 | 15 | 60 |
| `wheel` | Wheel W₄ | 5 | 8 | 6 |
| `k33` | Bipartite K₃,₃ | 6 | 9 | 3 |
| `petersen` | Petersen Graph | 10 | 15 | 0 |

### Tech Stack

- **React 19** + Vite 8
- **CSS Modules** — scoped styles, no UI library
- **SVG** — graph canvas (viewBox 400×400)
- No external runtime dependencies

### URL State

Graphs are encoded in the URL query string:
- Presets: `?g=k4`, `?g=petersen`, etc.
- Custom graphs: `?g=custom&d=<base64-encoded-json>`

The base64 payload contains `{ n: nodes[], a: adjacency{}, p: positions{}, s: startNode }`.

---

## Running Locally

```bash
git clone https://github.com/saumyadhote/cycle-clash.git
cd cycle-clash
npm install
npm run dev
```

Open `http://localhost:5173`.
