import { useState } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "sinonimo-antonimo";
const ACCENT = "#C77D3E";

const BANKS = {
  superbeginner: [
    { word: "big", type: "antônimo", answer: "small", options: ["small", "happy", "run", "red"], pt: "big = grande" },
    { word: "hot", type: "antônimo", answer: "cold", options: ["cold", "fast", "book", "cat"] , pt: "hot = quente"},
    { word: "happy", type: "sinônimo", answer: "glad", options: ["glad", "sad", "angry", "tired"], pt: "happy = feliz" },
  ],
  beginner: [
    { word: "fast", type: "antônimo", answer: "slow", options: ["slow", "big", "kind", "quiet"], pt: "fast = rápido" },
    { word: "start", type: "antônimo", answer: "finish", options: ["finish", "begin", "open", "run"], pt: "start = começar" },
    { word: "happy", type: "sinônimo", answer: "glad", options: ["glad", "angry", "tired", "bored"], pt: "happy = feliz" },
    { word: "smart", type: "sinônimo", answer: "clever", options: ["clever", "lazy", "slow", "shy"], pt: "smart = inteligente" },
  ],
  intermediate: [
    { word: "brave", type: "sinônimo", answer: "courageous", options: ["courageous", "afraid", "weak", "quiet"], pt: "brave = corajoso" },
    { word: "generous", type: "antônimo", answer: "stingy", options: ["stingy", "kind", "rich", "polite"], pt: "generous = generoso" },
    { word: "ancient", type: "antônimo", answer: "modern", options: ["modern", "old", "wise", "distant"], pt: "ancient = antigo" },
    { word: "thrilled", type: "sinônimo", answer: "excited", options: ["excited", "bored", "tired", "calm"], pt: "thrilled = empolgado" },
  ],
  advanced: [
    { word: "meticulous", type: "sinônimo", answer: "careful", options: ["careful", "careless", "lazy", "rushed"], pt: "meticulous = meticuloso" },
    { word: "generous", type: "antônimo", answer: "greedy", options: ["greedy", "kind", "wealthy", "humble"], pt: "generous = generoso" },
    { word: "reluctant", type: "antônimo", answer: "eager", options: ["eager", "hesitant", "shy", "unsure"], pt: "reluctant = relutante" },
    { word: "candid", type: "sinônimo", answer: "honest", options: ["honest", "secretive", "vague", "evasive"], pt: "candid = franco" },
  ],
  expert: [
    { word: "ubiquitous", type: "sinônimo", answer: "omnipresent", options: ["omnipresent", "scarce", "hidden", "unusual"], pt: "ubiquitous = onipresente" },
    { word: "ephemeral", type: "antônimo", answer: "permanent", options: ["permanent", "brief", "fleeting", "temporary"], pt: "ephemeral = efêmero" },
    { word: "surreptitious", type: "antônimo", answer: "open", options: ["open", "hidden", "secret", "sneaky"], pt: "surreptitious = disfarçado" },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function SinonimoAntonimo({ onExit }) {
  const [level, setLevel] = useState(null);
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);

  if (!level) {
    return (
      <LevelMenu accent={ACCENT} gameName="Sinônimo e Antônimo" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)}
        onSelect={(l) => { setLevel(l); setOrder(shuffle(BANKS[l].map((_, i) => i))); setIdx(0); setPicked(null); setScore(0); }} />
    );
  }

  const items = BANKS[level];
  const item = items[order[idx]];
  const finished = idx >= order.length;
  if (finished && score === items.length && level === "advanced") unlockExpert(GAME_ID);

  function choose(opt) { if (picked) return; setPicked(opt); if (opt === item.answer) setScore((s) => s + 1); }
  function next() { setPicked(null); setIdx((i) => i + 1); }
  function restart() { setIdx(0); setPicked(null); setScore(0); setOrder(shuffle(items.map((_, i) => i))); }
  function changeLevel() { setLevel(null); }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={changeLevel}>← nível</button>
        <span style={{ ...styles.hudItem, color: ACCENT }}>{score}/{items.length}</span>
      </div>
      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: ACCENT }}>SINÔNIMO E ANTÔNIMO</span>
        {!finished ? (
          <>
            <p style={styles.prompt}>Qual é o <b>{item.type}</b> de:</p>
            <h1 style={styles.headword}>{item.word}</h1>
            <p style={styles.hint}>({item.pt})</p>
            <div style={styles.options}>
              {item.options.map((opt) => {
                const isCorrect = opt === item.answer, isPicked = picked === opt;
                let bg = "#FFFFFF", border = "#D8D0BC", color = "#1B2735";
                if (picked) { if (isCorrect) { bg = "#F6EBDD"; border = ACCENT; color = "#8A501F"; } else if (isPicked) { bg = "#F4E4E2"; border = "#C65D57"; color = "#8B3E38"; } }
                return <button key={opt} disabled={!!picked} onClick={() => choose(opt)} style={{ ...styles.optBtn, background: bg, borderColor: border, color }}>{opt}</button>;
              })}
            </div>
            {picked && (
              <button style={{ ...styles.nextBtn, background: ACCENT, marginTop: 16, alignSelf: "flex-start" }} onClick={next}>
                {idx + 1 >= order.length ? "Ver resultado →" : "Próxima →"}
              </button>
            )}
          </>
        ) : (
          <div style={styles.overActions}>
            <span style={{ ...styles.doneText, color: ACCENT }}>{score}/{items.length} certas{score === items.length && level === "advanced" ? " · Nível Mestre destravado!" : ""}</span>
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
  card: { background: "#F7F3E9", borderRadius: 4, padding: "20px 20px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column" },
  entryNo: { fontSize: 11, letterSpacing: 1, fontWeight: 700 },
  prompt: { fontSize: 13, color: "#5A6270", marginTop: 16 },
  headword: { fontFamily: "'Fraunces', serif", fontSize: 34, margin: "4px 0 0", color: "#1B2735", fontWeight: 700 },
  hint: { fontSize: 12, color: "#8B7F5F", fontStyle: "italic", marginTop: 2 },
  options: { display: "flex", flexDirection: "column", gap: 9, marginTop: 18 },
  optBtn: { textAlign: "left", padding: "12px 14px", borderRadius: 3, border: "1.5px solid", fontSize: 14.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  nextBtn: { color: "#FFFFFF", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overActions: { margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 22, textAlign: "center" },
};
