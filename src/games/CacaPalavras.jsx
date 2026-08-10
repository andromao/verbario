import { useState, useMemo, useCallback } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "caca-palavras";
const ACCENT = "#3F9C93";
const ACCENT_BG = "#E4F2F0";
const PHASES = 3;

const BANKS = {
  superbeginner: { size: 8, words: [
    { en: "CAT", pt: "gato" }, { en: "DOG", pt: "cachorro" }, { en: "SUN", pt: "sol" }, { en: "RED", pt: "vermelho" },
    { en: "BIG", pt: "grande" }, { en: "HAT", pt: "chapéu" }, { en: "TEN", pt: "dez" }, { en: "RUN", pt: "correr" },
  ]},
  beginner: { size: 10, words: [
    { en: "APPLE", pt: "maçã" }, { en: "HOUSE", pt: "casa" }, { en: "WATER", pt: "água" }, { en: "MUSIC", pt: "música" },
    { en: "LIGHT", pt: "luz" }, { en: "HAPPY", pt: "feliz" }, { en: "DREAM", pt: "sonho" }, { en: "SMILE", pt: "sorriso" },
    { en: "BEACH", pt: "praia" }, { en: "CLOUD", pt: "nuvem" },
  ]},
  intermediate: { size: 12, words: [
    { en: "GARDEN", pt: "jardim" }, { en: "PEOPLE", pt: "pessoas" }, { en: "KITCHEN", pt: "cozinha" }, { en: "JOURNEY", pt: "jornada" },
    { en: "PICTURE", pt: "figura" }, { en: "WEATHER", pt: "clima" }, { en: "ANIMAL", pt: "animal" }, { en: "MORNING", pt: "manhã" },
    { en: "FRIEND", pt: "amigo" }, { en: "STREET", pt: "rua" },
  ]},
  advanced: { size: 14, words: [
    { en: "MOUNTAIN", pt: "montanha" }, { en: "ELEPHANT", pt: "elefante" }, { en: "BUILDING", pt: "prédio" }, { en: "HOSPITAL", pt: "hospital" },
    { en: "UMBRELLA", pt: "guarda-chuva" }, { en: "KNOWLEDGE", pt: "conhecimento" }, { en: "CHALLENGE", pt: "desafio" }, { en: "ADVENTURE", pt: "aventura" },
    { en: "TRIANGLE", pt: "triângulo" }, { en: "CALENDAR", pt: "calendário" },
  ]},
  expert: { size: 16, words: [
    { en: "CONSCIOUSNESS", pt: "consciência" }, { en: "ACCOMPLISHMENT", pt: "realização" }, { en: "SURVEILLANCE", pt: "vigilância" },
    { en: "REFRIGERATOR", pt: "geladeira" }, { en: "PHOTOGRAPH", pt: "fotografia" }, { en: "ENTREPRENEUR", pt: "empreendedor" },
    { en: "MISUNDERSTANDING", pt: "mal-entendido" }, { en: "SOPHISTICATED", pt: "sofisticado" },
  ]},
};

const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function buildGrid(words, size) {
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const placements = [];
  for (const { en } of words) {
    let placed = false;
    for (let attempt = 0; attempt < 300 && !placed; attempt++) {
      const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
      let row, col;
      if (dr === 1) row = Math.floor(Math.random() * (size - en.length + 1));
      else if (dr === -1) row = Math.floor(Math.random() * (size - en.length + 1)) + en.length - 1;
      else row = Math.floor(Math.random() * size);
      if (dc === 1) col = Math.floor(Math.random() * (size - en.length + 1));
      else if (dc === -1) col = Math.floor(Math.random() * (size - en.length + 1)) + en.length - 1;
      else col = Math.floor(Math.random() * size);
      const cells = [];
      let ok = true;
      for (let i = 0; i < en.length; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size) { ok = false; break; }
        const existing = grid[r][c];
        if (existing && existing !== en[i]) { ok = false; break; }
        cells.push([r, c]);
      }
      if (ok) { cells.forEach(([r, c], i) => { grid[r][c] = en[i]; }); placements.push({ en, cells }); placed = true; }
    }
  }
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!grid[r][c]) grid[r][c] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return { grid, placements };
}

function keyOf(r, c) { return `${r}-${c}`; }
function lineBetween(sr, sc, r, c) {
  if (sr === r) { const [c1, c2] = sc < c ? [sc, c] : [c, sc]; const out = []; for (let cc = c1; cc <= c2; cc++) out.push([r, cc]); return out; }
  if (sc === c) { const [r1, r2] = sr < r ? [sr, r] : [r, sr]; const out = []; for (let rr = r1; rr <= r2; rr++) out.push([rr, c]); return out; }
  return null;
}

export default function CacaPalavras({ onExit }) {
  const [level, setLevel] = useState(null);
  const [round, setRound] = useState(0);
  const bank = level ? BANKS[level] : null;
  const { grid, placements } = useMemo(() => (bank ? buildGrid(bank.words, bank.size) : { grid: [], placements: [] }), [round, level]);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState(null);
  const [path, setPath] = useState([]);
  const [foundCells, setFoundCells] = useState(new Set());
  const [foundWords, setFoundWords] = useState(new Set());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [phase, setPhase] = useState(1);
  const [totalScore, setTotalScore] = useState(0);

  const cellFromPoint = useCallback((x, y) => {
    const el = document.elementFromPoint(x, y);
    if (!el || !el.dataset || el.dataset.r === undefined) return null;
    return [Number(el.dataset.r), Number(el.dataset.c)];
  }, []);

  if (!level) return <LevelMenu accent={ACCENT} gameName="Caça-palavras" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)} onSelect={(l) => { setLevel(l); setPhase(1); setTotalScore(0); }} />;

  const allFound = foundWords.size === bank.words.length;
  const score = Math.max(foundWords.size * 10 - hintsUsed * 5, 0);
  if (allFound && level === "advanced") unlockExpert(GAME_ID);

  function markWordFound(match) {
    setFoundWords((prev) => new Set(prev).add(match.en));
    setFoundCells((prev) => { const next = new Set(prev); match.cells.forEach(([r, c]) => next.add(keyOf(r, c))); return next; });
  }

  function finishSelection(cells) {
    if (cells && cells.length > 1) {
      const word = cells.map(([r, c]) => grid[r][c]).join("");
      const wordRev = [...word].reverse().join("");
      const match = placements.find((p) => p.en === word || p.en === wordRev);
      if (match && !foundWords.has(match.en)) markWordFound(match);
    }
    setDragging(false); setStart(null); setPath([]);
  }

  function useHint() {
    const remaining = placements.filter((p) => !foundWords.has(p.en));
    if (remaining.length === 0) return;
    markWordFound(remaining[Math.floor(Math.random() * remaining.length)]);
    setHintsUsed((h) => h + 1);
  }

  function handlePointerDown(r, c, e) {
    if (allFound) return;
    e.preventDefault();
    setDragging(true); setStart([r, c]); setPath([[r, c]]);
  }
  function handlePointerMove(e) {
    if (!dragging || !start) return;
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    const line = lineBetween(start[0], start[1], cell[0], cell[1]);
    if (line) setPath(line);
  }
  function handlePointerUp() { if (dragging) finishSelection(path); }

  function nextPhase() {
    setTotalScore((s) => s + score);
    setStart(null); setPath([]); setDragging(false);
    setFoundCells(new Set()); setFoundWords(new Set()); setHintsUsed(0);
    setPhase((p) => p + 1);
    setRound((r) => r + 1);
  }
  function restartSession() {
    setStart(null); setPath([]); setDragging(false);
    setFoundCells(new Set()); setFoundWords(new Set()); setHintsUsed(0);
    setPhase(1); setTotalScore(0);
    setRound((r) => r + 1);
  }
  function changeLevel() { setLevel(null); setFoundCells(new Set()); setFoundWords(new Set()); }

  const pathSet = new Set(path.map(([r, c]) => keyOf(r, c)));

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={changeLevel}>← nível</button>
        <span style={{ ...styles.hudItem, color: ACCENT }}>Fase {phase}/{PHASES} · {foundWords.size}/{bank.words.length} · {totalScore + score} pts</span>
      </div>
      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: ACCENT }}>CAÇA-PALAVRAS</span>
        <p style={styles.intro}>Arraste o dedo (ou o mouse) da primeira até a última letra da palavra.</p>
        <div style={{ ...styles.grid, gridTemplateColumns: `repeat(${bank.size}, 1fr)`, touchAction: "none" }} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
          {grid.map((row, r) => row.map((letter, c) => {
            const k = keyOf(r, c);
            const isFound = foundCells.has(k), isPath = pathSet.has(k);
            return (
              <button key={k} data-r={r} data-c={c} onPointerDown={(e) => handlePointerDown(r, c, e)}
                style={{ ...styles.cell, touchAction: "none", background: isFound ? ACCENT_BG : isPath ? "#FCEFD9" : "#FFFFFF", borderColor: isFound ? ACCENT : isPath ? "#E8A33D" : "#D8D0BC", color: isFound ? "#1F6058" : "#1B2735" }}>
                {letter}
              </button>
            );
          }))}
        </div>
        <div style={styles.wordList}>
          {bank.words.map((w) => (
            <span key={w.en} style={{ ...styles.wordChip, textDecoration: foundWords.has(w.en) ? "line-through" : "none", opacity: foundWords.has(w.en) ? 0.5 : 1, borderColor: foundWords.has(w.en) ? ACCENT : "#D8D0BC" }}>{w.pt}</span>
          ))}
        </div>
        {!allFound && (
          <button style={{ ...styles.ghostBtn, marginTop: 16, alignSelf: "flex-start", borderColor: ACCENT, color: ACCENT }} onClick={useHint}>💡 Revelar uma palavra</button>
        )}
        {allFound && phase < PHASES && (
          <div style={styles.overActions}>
            <span style={{ ...styles.doneText, color: ACCENT }}>Fase {phase} completa! 🎉 {score} pts{level === "advanced" ? " · Nível Mestre destravado!" : ""}</span>
            <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={nextPhase}>Próxima fase →</button>
          </div>
        )}
        {allFound && phase >= PHASES && (
          <div style={styles.overActions}>
            <span style={styles.overEyebrow}>Rodada completa · {PHASES} fases</span>
            <span style={{ ...styles.doneText, color: ACCENT, fontSize: 24 }}>{totalScore + score} pts</span>
            <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={restartSession}>Jogar de novo</button>
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
  hudItem: { fontSize: 11, fontWeight: 700 },
  card: { background: "#F7F3E9", borderRadius: 4, padding: "clamp(14px,4vw,20px) clamp(10px,3vw,16px) 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column" },
  entryNo: { fontSize: 11, letterSpacing: 1, fontWeight: 700 },
  intro: { fontSize: 12.5, color: "#5A6270", marginTop: 6, marginBottom: 14, lineHeight: 1.5 },
  grid: { display: "grid", gap: 2, background: "#D8D0BC", padding: 2, borderRadius: 3, userSelect: "none" },
  cell: { aspectRatio: "1", border: "1.5px solid", fontSize: "clamp(8px,2.4vw,11px)", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, cursor: "pointer", padding: 0 },
  wordList: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 },
  wordChip: { fontSize: 11.5, background: "#FFFFFF", border: "1px solid", borderRadius: 20, padding: "4px 10px", color: "#1B2735" },
  ghostBtn: { background: "none", border: "1.5px solid", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overActions: { marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 16, textAlign: "center" },
  overEyebrow: { fontSize: 11, letterSpacing: 2, color: "#9A9280" },
  nextBtn: { color: "#F7F3E9", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
};
