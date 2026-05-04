# Cycle Clash

Cycle Clash is an interactive visualizer for the Hamiltonian Cycle Problem — watch a backtracking algorithm step-by-step or find cycles yourself.

---

## Problem
A Hamiltonian Cycle visits every node exactly once and returns to the start.  
- NP-Complete (Karp, 1972)  
- No known polynomial-time solution  
- Solved via exhaustive backtracking  

---

## Algorithm
DFS Backtracking:
- Commit → move to unvisited node  
- Explore → recurse  
- Backtrack → undo and try next  

Deduplication: normalize cycles (rotations + reverse → smallest form)  

Complexity:  
- Time: O(n!)  
- Space: O(n)

---

## Features
- Watch algorithm (dead ends, cycles)  
- Step controls (forward/back)  
- Trace log (decisions and actions)  
- Live stats (backtracks, cycles)  
- Play mode (solve manually)  
- Graphs: Triangle, K4, Pentagon  

---

## Why K4?
- 4 fully connected nodes  
- 3 unique cycles  
- Clear backtracking behavior  
- ~14s runtime (ideal demo)  

---
## Live Demo
👉 [View the Project](https://cycle-clash.vercel.app/)
---
## Demo Flow
1. Watch → K4 → Slow → Play  
2. Explain: current node, path, dead end, cycle  
3. Step mode → show commit/explore/backtrack  
4. Play mode → user solves with validation  

---

## Key Points
- O(n!) from n × (n-1) × ...  
- Each cycle counted 2n times (rotations + directions)  
- NP-Complete; counting is #P-hard  
- Set used for O(1) visited checks  

---

## Summary
A visual and interactive way to understand backtracking and Hamiltonian cycles.
