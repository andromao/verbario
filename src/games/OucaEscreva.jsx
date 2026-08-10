import { useState } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "ouca-escreva";
const ACCENT = "#B23A48";
const ROUNDS = 10;

const BANKS = {
  superbeginner: [
    { en: "cat", pt: "gato" }, { en: "dog", pt: "cachorro" }, { en: "sun", pt: "sol" }, { en: "red", pt: "vermelho" }, { en: "yes", pt: "sim" },
    { en: "big", pt: "grande" }, { en: "run", pt: "correr" }, { en: "hat", pt: "chapéu" }, { en: "ten", pt: "dez" }, { en: "bed", pt: "cama" },
  ],
  beginner: [
    { en: "book", pt: "livro" }, { en: "pen", pt: "caneta" }, { en: "run", pt: "correr" }, { en: "big", pt: "grande" },
    { en: "happy", pt: "feliz" }, { en: "green", pt: "verde" }, { en: "small", pt: "pequeno" }, { en: "chair", pt: "cadeira" },
    { en: "water", pt: "água" }, { en: "house", pt: "casa" },
  ],
  intermediate: [
    { en: "pumpkin", pt: "abóbora" }, { en: "volcano", pt: "vulcão" }, { en: "dolphin", pt: "golfinho" }, { en: "sandwich", pt: "sanduíche" },
    { en: "telephone", pt: "telefone" }, { en: "airport", pt: "aeroporto" }, { en: "balloon", pt: "balão" }, { en: "library", pt: "biblioteca" },
    { en: "journey", pt: "jornada" }, { en: "weather", pt: "clima" },
  ],
  advanced: [
    { en: "chocolate", pt: "chocolate" }, { en: "vocabulary", pt: "vocabulário" }, { en: "restaurant", pt: "restaurante" }, { en: "celebration", pt: "celebração" },
    { en: "imagination", pt: "imaginação" }, { en: "temperature", pt: "temperatura" }, { en: "unfortunately", pt: "infelizmente" }, { en: "extraordinary", pt: "extraordinário" },
    { en: "wonderful", pt: "maravilhoso" }, { en: "beautiful", pt: "bonito" },
  ],
  expert: [
    { en: "entrepreneur", pt: "empreendedor" }, { en: "consciousness", pt: "consciência" }, { en: "surveillance", pt: "vigilância" },
    { en: "misunderstanding", pt: "mal-entendido" }, { en: "sophisticated", pt: "sofisticado" }, { en: "characteristic", pt: "característica" },
    { en: "responsibility", pt: "responsabilidade" }, { en: "accomplishment", pt: "realização" }, { en: "unbelievable", pt: "inacreditável" }, { en: "photographer", pt: "fotógrafo" },
  ],
};

const supported = typeof window !== "undefined" && "speechSynthesis" in window;
function speak(word) {
  if (!supported) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = "en-US"; u.rate = 0.85;
  window.speechSynthesis.speak(u);
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function OucaEscreva({ onExit }) {
  const [level, setLevel] = useState(null);
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  if (!level) {
    return (
      <LevelMenu accent={ACCENT} gameName="Ouça e Escreva" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)}
        onSelect={(l) => {
          setLevel(l);
          setDeck(shuffle(BANKS[l]).slice(0, Math.min(ROUNDS, BANKS[l].length)));
          setIdx(0); setTyped(""); setChecked(null); setShowHint(false); setScore(0); setHintUsed(false);
        }} />
    );
  }

  if (!supported) {
    return (
      <div style={styles.wrap}>
        <div style={styles.topBar}><button style={styles.backBtn} onClick={onExit}>← jogos</button></div>
        <div style={styles.card}>
          <span style={{ ...styles.entryNo, color: ACCENT }}>OUÇA E ESCREVA</span>
          <p style={styles.intro}>Esse navegador não é compatível com leitura de voz. Tente em outro navegador (Chrome, Edge ou Safari costumam funcionar).</p>
        </div>
      </div>
    );
  }

  const finished = idx >= deck.length;
  if (finished) {
    return (
      <div style={styles.wrap}>
        <div style={styles.topBar}><button style={styles.backBtn} onClick={() => setLevel(null)}>← nível</button></div>
        <div style={styles.card}>
          <div style={styles.overActions}>
            <span style={styles.overEyebrow}>Fim de rodada</span>
            <span style={{ ...styles.doneText, color: ACCENT, fontSize: 32 }}>{score} pts</span>
            <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={() => { setDeck(shuffle(BANKS[level]).slice(0, Math.min(ROUNDS, BANKS[level].length))); setIdx(0); setTyped(""); setChecked(null); setShowHint(false); setScore(0); setHintUsed(false); }}>Jogar de novo</button>
          </div>
        </div>
      </div>
    );
  }

  const current = deck[idx];
  if (checked === true && level === "advanced") unlockExpert(GAME_ID);

  function verify() {
    const ok = typed.trim().toLowerCase() === current.en;
    setChecked(ok);
    if (ok) setScore((s) => s + (showHint || hintUsed ? 10 : 20));
  }
  function useHintLetter() {
    if (checked === true) return;
    const revealedSoFar = typed.length;
    if (revealedSoFar >= current.en.length) return;
    setTyped(current.en.slice(0, revealedSoFar + 1));
    setChecked(null);
    setHintUsed(true);
  }
  function next() {
    setIdx((i) => i + 1); setTyped(""); setChecked(null); setShowHint(false); setHintUsed(false);
  }
  function changeLevel() { setLevel(null); }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={changeLevel}>← nível</button>
        <span style={{ ...styles.hudItem, color: ACCENT }}>{idx + 1}/{deck.length} · {score} pts</span>
      </div>
      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: ACCENT }}>OUÇA E ESCREVA</span>
        <p style={styles.intro}>Toque em ouvir, e digite a palavra que você escutou em inglês.</p>
        <button style={{ ...styles.speakBtn, borderColor: ACCENT, color: ACCENT }} onClick={() => speak(current.en)}>🔊 Ouvir palavra</button>
        <input value={typed} onChange={(e) => { setTyped(e.target.value); setChecked(null); }} onKeyDown={(e) => e.key === "Enter" && verify()} placeholder="digite aqui…"
          style={{ ...styles.input, borderColor: checked === true ? "#6B9080" : checked === false ? "#C65D57" : "#D8D0BC" }} />
        {checked === false && <p style={styles.wrongText}>Não foi essa — ouça de novo e tente outra vez.</p>}
        {showHint && checked !== true && <p style={styles.hintText}>Dica: {current.pt}</p>}
        <div style={styles.actions}>
          {checked !== true && (
            <>
              <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={verify}>Verificar</button>
              <button style={styles.ghostBtn} onClick={() => setShowHint(true)}>Dica (tradução)</button>
              <button style={styles.ghostBtn} onClick={useHintLetter}>💡 Revelar uma letra</button>
            </>
          )}
          {checked === true && (
            <>
              <span style={{ ...styles.doneText, color: ACCENT }}>Acertou! 🎉{level === "advanced" ? " Nível Mestre destravado!" : ""}</span>
              <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={next}>{idx + 1 >= deck.length ? "Ver resultado →" : "Próxima palavra →"}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 14 },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", color: "#E7E2D3" },
  backBtn: { background: "none", border: "none", color: "#C9C2AC", fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", padding: 0 },
  hudItem: { fontSize: 11 },
  card: { background: "#F7F3E9", borderRadius: 4, padding: "clamp(14px,4vw,20px) clamp(12px,4vw,20px) 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column" },
  entryNo: { fontSize: 11, letterSpacing: 1, fontWeight: 700 },
  overEyebrow: { fontSize: 11, letterSpacing: 2, color: "#9A9280" },
  intro: { fontSize: 12.5, color: "#5A6270", marginTop: 6, marginBottom: 20, lineHeight: 1.5 },
  speakBtn: { alignSelf: "center", background: "#FFFFFF", border: "2px solid", borderRadius: 40, padding: "14px 26px", fontSize: 15, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", fontWeight: 600 },
  input: { marginTop: 22, padding: "12px 14px", borderRadius: 3, border: "1.5px solid", fontSize: 15, fontFamily: "'IBM Plex Mono', monospace", background: "#FFFFFF", color: "#1B2735" },
  wrongText: { fontSize: 12, color: "#C65D57", marginTop: 8 },
  hintText: { fontSize: 12, color: "#8B7F5F", fontStyle: "italic", marginTop: 8 },
  actions: { marginTop: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 16 },
  nextBtn: { color: "#FFFFFF", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  ghostBtn: { background: "none", color: "#1B2735", border: "1.5px solid #D8D0BC", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overActions: { marginTop: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, margin: "auto" },
};
