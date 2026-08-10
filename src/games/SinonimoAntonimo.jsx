import { useState } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "sinonimo-antonimo";
const ACCENT = "#C77D3E";

const BANKS = {
  superbeginner: [
    { word: "big", type: "antônimo", answer: "small", options: ["small", "happy", "run", "red"], pt: "big = grande" },
    { word: "hot", type: "antônimo", answer: "cold", options: ["cold", "fast", "book", "cat"], pt: "hot = quente" },
    { word: "happy", type: "sinônimo", answer: "glad", options: ["glad", "sad", "angry", "tired"], pt: "happy = feliz" },
    { word: "small", type: "antônimo", answer: "big", options: ["big", "slow", "sad", "cold"], pt: "small = pequeno" },
    { word: "sad", type: "antônimo", answer: "happy", options: ["happy", "cold", "fast", "big"], pt: "sad = triste" },
    { word: "good", type: "antônimo", answer: "bad", options: ["bad", "kind", "big", "slow"], pt: "good = bom" },
    { word: "old", type: "antônimo", answer: "young", options: ["young", "happy", "cold", "fast"], pt: "old = velho" },
    { word: "clean", type: "antônimo", answer: "dirty", options: ["dirty", "small", "hot", "kind"], pt: "clean = limpo" },
    { word: "open", type: "antônimo", answer: "closed", options: ["closed", "happy", "big", "slow"], pt: "open = aberto" },
    { word: "fast", type: "antônimo", answer: "slow", options: ["slow", "big", "kind", "red"], pt: "fast = rápido" },
  ],
  beginner: [
    { word: "fast", type: "antônimo", answer: "slow", options: ["slow", "big", "kind", "quiet"], pt: "fast = rápido" },
    { word: "start", type: "antônimo", answer: "finish", options: ["finish", "begin", "open", "run"], pt: "start = começar" },
    { word: "happy", type: "sinônimo", answer: "glad", options: ["glad", "angry", "tired", "bored"], pt: "happy = feliz" },
    { word: "smart", type: "sinônimo", answer: "clever", options: ["clever", "lazy", "slow", "shy"], pt: "smart = inteligente" },
    { word: "clean", type: "sinônimo", answer: "tidy", options: ["tidy", "dirty", "messy", "loud"], pt: "clean = limpo" },
    { word: "strong", type: "antônimo", answer: "weak", options: ["weak", "tall", "kind", "short"], pt: "strong = forte" },
    { word: "difficult", type: "sinônimo", answer: "hard", options: ["hard", "easy", "soft", "simple"], pt: "difficult = difícil" },
    { word: "cheap", type: "antônimo", answer: "expensive", options: ["expensive", "cheap", "old", "new"], pt: "cheap = barato" },
    { word: "loud", type: "antônimo", answer: "quiet", options: ["quiet", "fast", "big", "old"], pt: "loud = barulhento" },
    { word: "easy", type: "antônimo", answer: "difficult", options: ["difficult", "simple", "fast", "small"], pt: "easy = fácil" },
  ],
  intermediate: [
    { word: "brave", type: "sinônimo", answer: "courageous", options: ["courageous", "afraid", "weak", "quiet"], pt: "brave = corajoso" },
    { word: "generous", type: "antônimo", answer: "stingy", options: ["stingy", "kind", "rich", "polite"], pt: "generous = generoso" },
    { word: "ancient", type: "antônimo", answer: "modern", options: ["modern", "old", "wise", "distant"], pt: "ancient = antigo" },
    { word: "thrilled", type: "sinônimo", answer: "excited", options: ["excited", "bored", "tired", "calm"], pt: "thrilled = empolgado" },
    { word: "furious", type: "sinônimo", answer: "angry", options: ["angry", "happy", "calm", "shy"], pt: "furious = furioso" },
    { word: "exhausted", type: "sinônimo", answer: "tired", options: ["tired", "excited", "hungry", "bored"], pt: "exhausted = exausto" },
    { word: "polite", type: "antônimo", answer: "rude", options: ["rude", "kind", "shy", "quiet"], pt: "polite = educado" },
    { word: "wealthy", type: "sinônimo", answer: "rich", options: ["rich", "poor", "generous", "humble"], pt: "wealthy = rico" },
    { word: "reliable", type: "antônimo", answer: "unpredictable", options: ["unpredictable", "honest", "steady", "loyal"], pt: "reliable = confiável" },
    { word: "cautious", type: "antônimo", answer: "reckless", options: ["reckless", "careful", "wise", "slow"], pt: "cautious = cauteloso" },
  ],
  advanced: [
    { word: "meticulous", type: "sinônimo", answer: "careful", options: ["careful", "careless", "lazy", "rushed"], pt: "meticulous = meticuloso" },
    { word: "generous", type: "antônimo", answer: "greedy", options: ["greedy", "kind", "wealthy", "humble"], pt: "generous = generoso" },
    { word: "reluctant", type: "antônimo", answer: "eager", options: ["eager", "hesitant", "shy", "unsure"], pt: "reluctant = relutante" },
    { word: "candid", type: "sinônimo", answer: "honest", options: ["honest", "secretive", "vague", "evasive"], pt: "candid = franco" },
    { word: "meticulous", type: "antônimo", answer: "careless", options: ["careless", "precise", "thorough", "detailed"], pt: "meticulous = meticuloso" },
    { word: "resilient", type: "sinônimo", answer: "tough", options: ["tough", "fragile", "weak", "delicate"], pt: "resilient = resiliente" },
    { word: "arrogant", type: "antônimo", answer: "humble", options: ["humble", "proud", "vain", "bold"], pt: "arrogant = arrogante" },
    { word: "ambiguous", type: "sinônimo", answer: "unclear", options: ["unclear", "obvious", "certain", "precise"], pt: "ambiguous = ambíguo" },
    { word: "genuine", type: "antônimo", answer: "fake", options: ["fake", "real", "honest", "sincere"], pt: "genuine = genuíno" },
    { word: "diligent", type: "sinônimo", answer: "hardworking", options: ["hardworking", "lazy", "careless", "slow"], pt: "diligent = diligente" },
  ],
  expert: [
    { word: "ubiquitous", type: "sinônimo", answer: "omnipresent", options: ["omnipresent", "scarce", "hidden", "unusual"], pt: "ubiquitous = onipresente" },
    { word: "ephemeral", type: "antônimo", answer: "permanent", options: ["permanent", "brief", "fleeting", "temporary"], pt: "ephemeral = efêmero" },
    { word: "surreptitious", type: "antônimo", answer: "open", options: ["open", "hidden", "secret", "sneaky"], pt: "surreptitious = disfarçado" },
    { word: "meticulous", type: "sinônimo", answer: "fastidious", options: ["fastidious", "careless", "hasty", "sloppy"], pt: "meticulous = meticuloso" },
    { word: "pragmatic", type: "antônimo", answer: "idealistic", options: ["idealistic", "practical", "realistic", "sensible"], pt: "pragmatic = pragmático" },
    { word: "benevolent", type: "antônimo", answer: "malicious", options: ["malicious", "kind", "generous", "gentle"], pt: "benevolent = benevolente" },
    { word: "cryptic", type: "sinônimo", answer: "obscure", options: ["obscure", "obvious", "clear", "simple"], pt: "cryptic = enigmático" },
    { word: "austere", type: "antônimo", answer: "lavish", options: ["lavish", "simple", "strict", "plain"], pt: "austere = austero" },
    { word: "candor", type: "sinônimo", answer: "frankness", options: ["frankness", "deceit", "secrecy", "vagueness"], pt: "candor = franqueza" },
    { word: "obstinate", type: "sinônimo", answer: "stubborn", options: ["stubborn", "flexible", "agreeable", "compliant"], pt: "obstinate = obstinado" },
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
  const [eliminated, setEliminated] = useState(new Set());
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
  function useHint() {
    if (picked) return;
    const wrongLeft = item.options.filter((o) => o !== item.answer && !eliminated.has(o));
    if (wrongLeft.length <= 1) return;
    setEliminated((prev) => new Set(prev).add(wrongLeft[Math.floor(Math.random() * wrongLeft.length)]));
  }
  function next() { setPicked(null); setEliminated(new Set()); setIdx((i) => i + 1); }
  function restart() { setIdx(0); setPicked(null); setEliminated(new Set()); setScore(0); setOrder(shuffle(items.map((_, i) => i))); }
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
                if (eliminated.has(opt)) return null;
                const isCorrect = opt === item.answer, isPicked = picked === opt;
                let bg = "#FFFFFF", border = "#D8D0BC", color = "#1B2735";
                if (picked) { if (isCorrect) { bg = "#F6EBDD"; border = ACCENT; color = "#8A501F"; } else if (isPicked) { bg = "#F4E4E2"; border = "#C65D57"; color = "#8B3E38"; } }
                return <button key={opt} disabled={!!picked} onClick={() => choose(opt)} style={{ ...styles.optBtn, background: bg, borderColor: border, color }}>{opt}</button>;
              })}
            </div>
            {!picked && (
              <button style={{ ...styles.ghostBtn, marginTop: 12, alignSelf: "flex-start" }} onClick={useHint}>💡 Eliminar uma opção</button>
            )}
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
  ghostBtn: { background: "none", border: "1.5px solid #D8D0BC", borderRadius: 3, padding: "8px 12px", fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", color: "#1B2735" },
  overActions: { margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 22, textAlign: "center" },
};
