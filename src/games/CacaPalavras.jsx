import { useState, useMemo } from "react";

const WORD_LIST = [
  { en: "APPLE", pt: "maçã" },
  { en: "HOUSE", pt: "casa" },
  { en: "WATER", pt: "água" },
  { en: "MUSIC", pt: "música" },
  { en: "LIGHT", pt: "luz" },
  { en: "HAPPY", pt: "feliz" },
  { en: "DREAM", pt: "sonho" },
  { en: "SMILE", pt: "sorriso" },
  { en: "BEACH", pt: "praia" },
  { en: "CLOUD", pt: "nuvem" },
];

const SIZE = 10;
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function buildGrid(words) {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  const placements = [];

  for (const { en } of words) {
    let placed = false;
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
      const maxRow = dr === 0 ? SIZE : SIZE - en.length * Math.sign(dr || 1) * Math.sign(dr) + (dr > 0 ? SIZE - en.length : 0);
      let row, col;
      if (dr === 1) row = Math.floor(Math.random() * (SIZE - en.length + 1));
      else if (dr === -1) row = Math.floor(Math.random() * (SIZE - en.length + 1)) + en.length - 1;
      else row = Math.floor(Math.random() * SIZE);
      if (dc === 1) col = Math.floor(Math.random() * (SIZE - en.length + 1));
      else if (dc === -1) col = Math.floor(Math.random() * (SIZE - en.length + 1)) + en.length - 1;
      else col = Math.floor(Math.random() * SIZE);

      const cells = [];
      let ok = true;
      for (let i = 0; i < en.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) { ok = false; break; }
        const existing = grid[r][c];
        if (existing && existing !== en[i]) { ok = false; break; }
        cells.push([r, c]);
      }
      if (ok) {
        cells.forEach(([r, c], i) => { grid[r][c] = en[i]; });
        placements.push({ en, cells });
        placed = true;
      }
    }
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) grid[r][c] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    }
  }

  return { grid, placements };
}

function keyOf(r, c) { return `${r}-${c}`; }

export default function CacaPalavras({ onExit }) {
  const [round, setRound] = useState(0);
  const { grid, placements } = useMemo(() => buildGrid(WORD_LIST), [round]);
  const [start, setStart] = useState(null);
  const [foundCells, setFoundCells] = useState(new Set());
  const [foundWords, setFoundWords] = useState(new Set());

  const allFound = foundWords.size === WORD_LIST.length;

  function handleCellClick(r, c) {
    if (allFound) return;
    if (!start) {
      setStart([r, c]);
      return;
    }
    const [sr, sc] = start;
    if (sr === r && sc === c) { setStart(null); return; }

    let cells = [];
    if (sr === r) {
      const [c1, c2] = sc < c ? [sc, c] : [c, sc];
      for (let cc = c1; cc <= c2; cc++) cells.push([r, cc]);
    } else if (sc === c) {
      const [r1, r2] = sr < r ? [sr, r] : [r, sr];
      for (let rr = r1; rr <= r2; rr++) cells.push([rr, c]);
    } else {
      setStart([r, c]);
      return;
    }

    const word = cells.map(([rr, cc]) => grid[rr][cc]).join("");
    const wordRev = [...word].reverse().join("");
    const match = placements.find((p) => p.en === word || p.en === wordRev);

    if (match && !foundWords.has(match.en)) {
      setFoundWords((prev) => new Set(prev).add(match.en));
      setFoundCells((prev) => {
        const next = new Set(prev);
        match.cells.forEach(([rr, cc]) => next.add(keyOf(rr, cc)));
        return next;
      });
    }
    setStart(null);
  }

  function restart() {
    setStart(null);
    setFoundCells(new Set());
    setFoundWords(new Set());
    setRound((r) => r + 1);
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onExit}>← jogos</button>
        <span style={styles.hudItem}>{foundWords.size}/{WORD_LIST.length}</span>
      </div>

      <div style={styles.card}>
        <span style={styles.entryNo}>CAÇA-PALAVRAS</span>
        <p style={styles.intro}>Toque na primeira e na última letra de cada palavra escondida.</p>

        <div style={styles.grid}>
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const k = keyOf(r, c);
              const isFound = foundCells.has(k);
              const isStart = start && start[0] === r && start[1] === c;
              return (
                <button
                  key={k}
                  onClick={() => handleCellClick(r, c)}
                  style={{
                    ...styles.cell,
                    background: isFound ? "#E7EFE9" : isStart ? "#FCEFD9" : "#FFFFFF",
                    borderColor: isFound ? "#6B9080" : isStart ? "#E8A33D" : "#D8D0BC",
                    color: isFound ? "#3E5C4C" : "#1B2735",
                  }}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>

        <div style={styles.wordList}>
          {WORD_LIST.map((w) => (
            <span key={w.en} style={{ ...styles.wordChip, textDecoration: foundWords.has(w.en) ? "line-through" : "none", opacity: foundWords.has(w.en) ? 0.5 : 1 }}>
              {w.pt}
            </span>
          ))}
        </div>

        {allFound && (
          <div style={styles.overActions}>
            <span style={styles.doneText}>Encontrou todas! 🎉</span>
            <button style={styles.nextBtn} onClick={restart}>Jogar de novo</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 14 },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", color: "#E7E2D3" },
  backBtn: { background: "none", border: "none", color: "#C9C2AC", fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", padding: 0 },
  hudItem: { fontSize: 11 },
  card: { background: "#F7F3E9", borderRadius: 4, padding: "20px 16px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column" },
  entryNo: { fontSize: 11, color: "#9A9280", letterSpacing: 1 },
  intro: { fontSize: 12.5, color: "#5A6270", marginTop: 6, marginBottom: 14, lineHeight: 1.5 },
  grid: { display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 2, background: "#D8D0BC", padding: 2, borderRadius: 3 },
  cell: { aspectRatio: "1", border: "1.5px solid", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, cursor: "pointer", padding: 0 },
  wordList: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 },
  wordChip: { fontSize: 11.5, background: "#FFFFFF", border: "1px solid #D8D0BC", borderRadius: 20, padding: "4px 10px", color: "#1B2735" },
  overActions: { marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 18, color: "#3E5C4C" },
  nextBtn: { background: "#1B2735", color: "#F7F3E9", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
};
