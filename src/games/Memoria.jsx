import { useState, useMemo } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "memoria";
const ACCENT = "#D9578F";

const BANKS = {
  superbeginner: [
    { en: "cat", pt: "gato" }, { en: "dog", pt: "cachorro" }, { en: "sun", pt: "sol" }, { en: "red", pt: "vermelho" }, { en: "hat", pt: "chapéu" }, { en: "ten", pt: "dez" },
  ],
  beginner: [
    { en: "book", pt: "livro" }, { en: "pen", pt: "caneta" }, { en: "cup", pt: "xícara" }, { en: "moon", pt: "lua" },
    { en: "star", pt: "estrela" }, { en: "fish", pt: "peixe" }, { en: "bird", pt: "pássaro" }, { en: "tree", pt: "árvore" },
  ],
  intermediate: [
    { en: "chair", pt: "cadeira" }, { en: "window", pt: "janela" }, { en: "friend", pt: "amigo" }, { en: "school", pt: "escola" },
    { en: "garden", pt: "jardim" }, { en: "kitchen", pt: "cozinha" }, { en: "street", pt: "rua" }, { en: "family", pt: "família" },
  ],
  advanced: [
    { en: "knowledge", pt: "conhecimento" }, { en: "opportunity", pt: "oportunidade" }, { en: "environment", pt: "meio ambiente" }, { en: "experience", pt: "experiência" },
    { en: "imagination", pt: "imaginação" }, { en: "responsibility", pt: "responsabilidade" }, { en: "communication", pt: "comunicação" }, { en: "government", pt: "governo" },
  ],
  expert: [
    { en: "consciousness", pt: "consciência" }, { en: "entrepreneur", pt: "empreendedor" }, { en: "surveillance", pt: "vigilância" }, { en: "accomplishment", pt: "realização" },
    { en: "sophisticated", pt: "sofisticado" }, { en: "misunderstanding", pt: "mal-entendido" },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function buildDeck(pairs) {
  const cards = [];
  pairs.forEach((p, i) => { cards.push({ key: `${i}-en`, pairId: i, text: p.en }); cards.push({ key: `${i}-pt`, pairId: i, text: p.pt }); });
  return shuffle(cards);
}

export default function Memoria({ onExit }) {
  const [level, setLevel] = useState(null);
  const [round, setRound] = useState(0);
  const pairs = level ? BANKS[level] : [];
  const deck = useMemo(() => (level ? buildDeck(pairs) : []), [round, level]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState(0);

  if (!level) return <LevelMenu accent={ACCENT} gameName="Memória" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)} onSelect={(l) => { setLevel(l); setFlipped([]); setMatched(new Set()); setMoves(0); }} />;

  const won = matched.size === pairs.length;
  const perfectMoves = pairs.length;
  const score = won ? Math.max(100 - Math.max(moves - perfectMoves, 0) * 8, 10) : 0;
  if (won && level === "advanced") unlockExpert(GAME_ID);

  function useHint() {
    if (busy) return;
    const remaining = pairs.map((_, i) => i).filter((i) => !matched.has(i));
    if (remaining.length === 0) return;
    setMatched((prev) => new Set(prev).add(remaining[Math.floor(Math.random() * remaining.length)]));
  }

  function handleClick(idx) {
    if (busy || flipped.includes(idx) || matched.has(deck[idx].pairId)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1); setBusy(true);
      const [a, b] = next;
      if (deck[a].pairId === deck[b].pairId) {
        setTimeout(() => { setMatched((prev) => new Set(prev).add(deck[a].pairId)); setFlipped([]); setBusy(false); }, 500);
      } else {
        setTimeout(() => { setFlipped([]); setBusy(false); }, 800);
      }
    }
  }
  function restart() { setFlipped([]); setMatched(new Set()); setBusy(false); setMoves(0); setRound((r) => r + 1); }
  function changeLevel() { setLevel(null); }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={changeLevel}>← nível</button>
        <span style={{ ...styles.hudItem, color: ACCENT }}>{moves} jogadas</span>
      </div>
      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: ACCENT }}>MEMÓRIA</span>
        <p style={styles.intro}>Encontre os pares: palavra em inglês + significado em português.</p>
        <div style={styles.grid}>
          {deck.map((c, i) => {
            const isMatched = matched.has(c.pairId), isFlipped = flipped.includes(i) || isMatched;
            return (
              <button key={c.key} onClick={() => handleClick(i)} style={{ ...styles.card2, background: isMatched ? "#FBE9F0" : isFlipped ? "#FFFFFF" : ACCENT, borderColor: isMatched ? ACCENT : "#D8D0BC", color: isFlipped ? "#1B2735" : "#FFFFFF" }}>
                {isFlipped ? c.text : "?"}
              </button>
            );
          })}
        </div>
        {!won && (
          <button style={{ ...styles.ghostBtn, marginTop: 14, alignSelf: "flex-start", borderColor: ACCENT, color: ACCENT }} onClick={useHint}>💡 Casar um par</button>
        )}
        {won && (
          <div style={styles.overActions}>
            <span style={{ ...styles.doneText, color: ACCENT }}>Todos os pares! 🎉 {score} pts ({moves} jogadas){level === "advanced" ? " · Nível Mestre destravado!" : ""}</span>
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
  hudItem: { fontSize: 11, fontWeight: 700 },
  card: { background: "#F7F3E9", borderRadius: 4, padding: "20px 16px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column" },
  entryNo: { fontSize: 11, letterSpacing: 1, fontWeight: 700 },
  intro: { fontSize: 12.5, color: "#5A6270", marginTop: 6, marginBottom: 14, lineHeight: 1.5 },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 },
  card2: { aspectRatio: "1", border: "1.5px solid", borderRadius: 4, fontSize: 9.5, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, cursor: "pointer", padding: 4, textTransform: "lowercase" },
  overActions: { marginTop: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 14, textAlign: "center" },
  nextBtn: { color: "#F7F3E9", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  ghostBtn: { background: "none", border: "1.5px solid", borderRadius: 3, padding: "8px 12px", fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
};
