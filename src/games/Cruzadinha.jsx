import { useState, useMemo } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "cruzadinha";
const ACCENT = "#4C9A6A";

const BANKS = {
  superbeginner: [
    { en: "CAT", pt: "Gato" }, { en: "DOG", pt: "Cachorro" }, { en: "SUN", pt: "Sol" }, { en: "RED", pt: "Vermelho" }, { en: "TEN", pt: "Dez" },
  ],
  beginner: [
    { en: "STAR", pt: "Estrela" }, { en: "RAIN", pt: "Chuva" }, { en: "TREE", pt: "Árvore" }, { en: "BOOK", pt: "Livro" },
    { en: "DOOR", pt: "Porta" }, { en: "MOON", pt: "Lua" }, { en: "FISH", pt: "Peixe" }, { en: "BIRD", pt: "Pássaro" },
  ],
  intermediate: [
    { en: "WATER", pt: "Água" }, { en: "EARTH", pt: "Terra" }, { en: "HEART", pt: "Coração" }, { en: "TABLE", pt: "Mesa" },
    { en: "APPLE", pt: "Maçã" }, { en: "LIGHT", pt: "Luz" }, { en: "NIGHT", pt: "Noite" }, { en: "RIVER", pt: "Rio" }, { en: "STORM", pt: "Tempestade" }, { en: "PLANT", pt: "Planta" },
  ],
  advanced: [
    { en: "BUILDING", pt: "Prédio" }, { en: "HOSPITAL", pt: "Hospital" }, { en: "TRIANGLE", pt: "Triângulo" }, { en: "UMBRELLA", pt: "Guarda-chuva" },
    { en: "MOUNTAIN", pt: "Montanha" }, { en: "ELEPHANT", pt: "Elefante" }, { en: "DISTANCE", pt: "Distância" }, { en: "FAVORITE", pt: "Favorito" },
  ],
  expert: [
    { en: "CONSCIOUSNESS", pt: "Consciência" }, { en: "ENTREPRENEUR", pt: "Empreendedor" }, { en: "SURVEILLANCE", pt: "Vigilância" },
    { en: "PHOTOGRAPHER", pt: "Fotógrafo" }, { en: "REFRIGERATOR", pt: "Geladeira" },
  ],
};

function tryGenerate(words) {
  const placed = []; const grid = {};
  function keyOf(r, c) { return `${r},${c}`; }
  function canPlace(word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
      const r = dir === "V" ? row + i : row, c = dir === "H" ? col + i : col;
      const existing = grid[keyOf(r, c)];
      if (existing && existing !== word[i]) return false;
    }
    return true;
  }
  function place(word, pt, row, col, dir) {
    const cells = [];
    for (let i = 0; i < word.length; i++) {
      const r = dir === "V" ? row + i : row, c = dir === "H" ? col + i : col;
      grid[keyOf(r, c)] = word[i]; cells.push([r, c]);
    }
    placed.push({ en: word, pt, row, col, dir, cells });
  }
  const sorted = [...words].sort((a, b) => b.en.length - a.en.length);
  place(sorted[0].en, sorted[0].pt, 0, 0, "H");
  for (let idx = 1; idx < sorted.length; idx++) {
    const { en, pt } = sorted[idx];
    let done = false;
    for (let li = 0; li < en.length && !done; li++) {
      for (const p of placed) {
        if (done) break;
        for (let pj = 0; pj < p.en.length; pj++) {
          if (p.en[pj] !== en[li]) continue;
          const dir = p.dir === "H" ? "V" : "H";
          const row = dir === "V" ? p.row - li : p.row + pj;
          const col = dir === "H" ? p.col - li : p.col + pj;
          if (canPlace(en, row, col, dir)) { place(en, pt, row, col, dir); done = true; break; }
        }
      }
    }
  }
  return { placed, grid };
}

function buildPuzzle(words) {
  let best = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const result = tryGenerate(shuffled);
    if (!best || result.placed.length > best.placed.length) best = result;
  }
  const { placed } = best;
  let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
  placed.forEach((p) => p.cells.forEach(([r, c]) => { minRow = Math.min(minRow, r); maxRow = Math.max(maxRow, r); minCol = Math.min(minCol, c); maxCol = Math.max(maxCol, c); }));
  const norm = placed.map((p) => ({ ...p, row: p.row - minRow, col: p.col - minCol, cells: p.cells.map(([r, c]) => [r - minRow, c - minCol]) }));
  const starts = [...new Map(norm.map((p) => [`${p.row},${p.col}`, p])).keys()].sort((a, b) => {
    const [ar, ac] = a.split(",").map(Number), [br, bc] = b.split(",").map(Number);
    return ar - br || ac - bc;
  });
  const numberOf = {};
  starts.forEach((key, i) => { numberOf[key] = i + 1; });
  norm.forEach((p) => { p.number = numberOf[`${p.row},${p.col}`]; });
  const cellLetters = {};
  norm.forEach((p) => p.cells.forEach(([r, c], i) => { cellLetters[`${r},${c}`] = p.en[i]; }));
  return { placements: norm, rows: maxRow - minRow + 1, cols: maxCol - minCol + 1, cellLetters };
}

export default function Cruzadinha({ onExit }) {
  const [level, setLevel] = useState(null);
  const [round, setRound] = useState(0);
  const puzzle = useMemo(() => (level ? buildPuzzle(BANKS[level]) : null), [round, level]);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  if (!level) return <LevelMenu accent={ACCENT} gameName="Cruzadinha" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)} onSelect={(l) => { setLevel(l); setAnswers({}); setChecked(false); }} />;

  const across = puzzle.placements.filter((p) => p.dir === "H").sort((a, b) => a.number - b.number);
  const down = puzzle.placements.filter((p) => p.dir === "V").sort((a, b) => a.number - b.number);
  const allFilled = Object.keys(puzzle.cellLetters).every((k) => (answers[k] || "").toUpperCase() === puzzle.cellLetters[k]);
  if (checked && allFilled && level === "advanced") unlockExpert(GAME_ID);

  function handleInput(key, value) {
    const letter = value.slice(-1).toUpperCase().replace(/[^A-Z]/g, "");
    setAnswers((prev) => ({ ...prev, [key]: letter }));
    setChecked(false);
  }
  function restart() { setAnswers({}); setChecked(false); setRound((r) => r + 1); }
  function changeLevel() { setLevel(null); }

  const startNumbers = {};
  puzzle.placements.forEach((p) => { startNumbers[`${p.row},${p.col}`] = p.number; });

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}><button style={styles.backBtn} onClick={changeLevel}>← nível</button></div>
      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: ACCENT, fontWeight: 700 }}>CRUZADINHA</span>
        <p style={styles.intro}>Preencha com as palavras em inglês a partir das dicas em português.</p>
        <div style={{ ...styles.grid, gridTemplateColumns: `repeat(${puzzle.cols}, 1fr)` }}>
          {Array.from({ length: puzzle.rows }).map((_, r) => Array.from({ length: puzzle.cols }).map((_, c) => {
            const key = `${r},${c}`, letter = puzzle.cellLetters[key];
            if (!letter) return <div key={key} style={styles.emptyCell} />;
            const guess = answers[key] || "", isCorrect = guess === letter, number = startNumbers[key];
            return (
              <div key={key} style={styles.cellWrap}>
                {number && <span style={styles.cellNumber}>{number}</span>}
                <input value={guess} onChange={(e) => handleInput(key, e.target.value)} maxLength={1}
                  style={{ ...styles.cellInput, borderColor: checked ? (isCorrect ? "#6B9080" : guess ? "#C65D57" : "#D8D0BC") : "#D8D0BC", color: checked && isCorrect ? "#3E5C4C" : "#1B2735" }} />
              </div>
            );
          }))}
        </div>
        <div style={styles.cluesRow}>
          <div style={styles.clueCol}><span style={styles.clueHeader}>Horizontais</span>{across.map((p) => <p key={p.en} style={styles.clueItem}>{p.number}. {p.pt}</p>)}</div>
          <div style={styles.clueCol}><span style={styles.clueHeader}>Verticais</span>{down.map((p) => <p key={p.en} style={styles.clueItem}>{p.number}. {p.pt}</p>)}</div>
        </div>
        {!allFilled || !checked ? (
          <button style={{ ...styles.nextBtn, marginTop: 16, alignSelf: "flex-start", background: ACCENT }} onClick={() => setChecked(true)}>Verificar</button>
        ) : null}
        {checked && allFilled && (
          <div style={styles.overActions}>
            <span style={{ ...styles.doneText, color: ACCENT }}>Completou! 🎉{level === "advanced" ? " Nível Mestre destravado!" : ""}</span>
            <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={restart}>Jogar de novo</button>
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
  card: { background: "#F7F3E9", borderRadius: 4, padding: "20px 16px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column" },
  entryNo: { fontSize: 11, letterSpacing: 1 },
  intro: { fontSize: 12.5, color: "#5A6270", marginTop: 6, marginBottom: 14, lineHeight: 1.5 },
  grid: { display: "grid", gap: 2, background: "#D8D0BC", padding: 2, borderRadius: 3 },
  emptyCell: { aspectRatio: "1", background: "transparent" },
  cellWrap: { position: "relative", aspectRatio: "1" },
  cellNumber: { position: "absolute", top: 1, left: 2, fontSize: 8, color: "#B08A3E", zIndex: 1 },
  cellInput: { width: "100%", height: "100%", textAlign: "center", border: "1.5px solid", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, textTransform: "uppercase", background: "#FFFFFF", padding: 0 },
  cluesRow: { display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" },
  clueCol: { flex: 1, minWidth: 140 },
  clueHeader: { fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 700, color: "#1B2735" },
  clueItem: { fontSize: 11.5, color: "#5A6270", margin: "4px 0" },
  nextBtn: { color: "#F7F3E9", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overActions: { marginTop: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 16, textAlign: "center" },
};
