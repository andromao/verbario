import { useState } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "ouca-escreva";
const ACCENT = "#B23A48";

const BANKS = {
  superbeginner: [
    { en: "cat", pt: "gato" }, { en: "dog", pt: "cachorro" }, { en: "sun", pt: "sol" }, { en: "red", pt: "vermelho" }, { en: "yes", pt: "sim" },
  ],
  beginner: [
    { en: "book", pt: "livro" }, { en: "pen", pt: "caneta" }, { en: "run", pt: "correr" }, { en: "big", pt: "grande" },
    { en: "happy", pt: "feliz" }, { en: "green", pt: "verde" }, { en: "small", pt: "pequeno" }, { en: "chair", pt: "cadeira" },
  ],
  intermediate: [
    { en: "pumpkin", pt: "abóbora" }, { en: "volcano", pt: "vulcão" }, { en: "dolphin", pt: "golfinho" }, { en: "sandwich", pt: "sanduíche" },
    { en: "telephone", pt: "telefone" }, { en: "airport", pt: "aeroporto" }, { en: "balloon", pt: "balão" }, { en: "library", pt: "biblioteca" },
  ],
  advanced: [
    { en: "chocolate", pt: "chocolate" }, { en: "vocabulary", pt: "vocabulário" }, { en: "restaurant", pt: "restaurante" }, { en: "celebration", pt: "celebração" },
    { en: "imagination", pt: "imaginação" }, { en: "temperature", pt: "temperatura" }, { en: "unfortunately", pt: "infelizmente" }, { en: "extraordinary", pt: "extraordinário" },
  ],
  expert: [
    { en: "entrepreneur", pt: "empreendedor" }, { en: "consciousness", pt: "consciência" }, { en: "surveillance", pt: "vigilância" },
    { en: "misunderstanding", pt: "mal-entendido" }, { en: "sophisticated", pt: "sofisticado" },
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
function pickWord(list, excludeEn) {
  const pool = list.filter((w) => w.en !== excludeEn);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function OucaEscreva({ onExit }) {
  const [level, setLevel] = useState(null);
  const [current, setCurrent] = useState(null);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState(null);
  const [showHint, setShowHint] = useState(false);

  if (!level) {
    return (
      <LevelMenu accent={ACCENT} gameName="Ouça e Escreva" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)}
        onSelect={(l) => { setLevel(l); setCurrent(pickWord(BANKS[l], null)); setTyped(""); setChecked(null); setShowHint(false); }} />
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

  if (checked === true && level === "advanced") unlockExpert(GAME_ID);

  function verify() { setChecked(typed.trim().toLowerCase() === current.en); }
  function useHintLetter() {
    if (checked === true) return;
    const revealedSoFar = typed.length;
    if (revealedSoFar >= current.en.length) return;
    setTyped(current.en.slice(0, revealedSoFar + 1));
    setChecked(null);
  }
  function next() { setCurrent((c) => pickWord(BANKS[level], c.en)); setTyped(""); setChecked(null); setShowHint(false); }
  function changeLevel() { setLevel(null); }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}><button style={styles.backBtn} onClick={changeLevel}>← nível</button></div>
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
              <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={next}>Próxima palavra</button>
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
  card: { background: "#F7F3E9", borderRadius: 4, padding: "20px 20px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column" },
  entryNo: { fontSize: 11, letterSpacing: 1, fontWeight: 700 },
  intro: { fontSize: 12.5, color: "#5A6270", marginTop: 6, marginBottom: 20, lineHeight: 1.5 },
  speakBtn: { alignSelf: "center", background: "#FFFFFF", border: "2px solid", borderRadius: 40, padding: "14px 26px", fontSize: 15, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", fontWeight: 600 },
  input: { marginTop: 22, padding: "12px 14px", borderRadius: 3, border: "1.5px solid", fontSize: 15, fontFamily: "'IBM Plex Mono', monospace", background: "#FFFFFF", color: "#1B2735" },
  wrongText: { fontSize: 12, color: "#C65D57", marginTop: 8 },
  hintText: { fontSize: 12, color: "#8B7F5F", fontStyle: "italic", marginTop: 8 },
  actions: { marginTop: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 16 },
  nextBtn: { color: "#FFFFFF", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  ghostBtn: { background: "none", color: "#1B2735", border: "1.5px solid #D8D0BC", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
};
