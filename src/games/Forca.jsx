import { useState } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "forca";
const ACCENT = "#D96C4F";
const MAX_WRONG = 6;
const ROUNDS = 10;

const BANKS = {
  superbeginner: [
    { en: "cat", pt: "gato" }, { en: "dog", pt: "cachorro" }, { en: "red", pt: "vermelho" }, { en: "sun", pt: "sol" }, { en: "hat", pt: "chapéu" },
    { en: "big", pt: "grande" }, { en: "run", pt: "correr" }, { en: "ten", pt: "dez" }, { en: "eat", pt: "comer" }, { en: "bed", pt: "cama" },
  ],
  beginner: [
    { en: "happy", pt: "feliz" }, { en: "angry", pt: "bravo" }, { en: "quiet", pt: "quieto" }, { en: "brave", pt: "corajoso" },
    { en: "quick", pt: "rápido" }, { en: "sweet", pt: "doce" }, { en: "funny", pt: "engraçado" }, { en: "lucky", pt: "sortudo" },
    { en: "sturdy", pt: "robusto" }, { en: "clutter", pt: "bagunça" },
  ],
  intermediate: [
    { en: "courage", pt: "coragem" }, { en: "wisdom", pt: "sabedoria" }, { en: "shadow", pt: "sombra" }, { en: "bridge", pt: "ponte" },
    { en: "forest", pt: "floresta" }, { en: "silence", pt: "silêncio" }, { en: "journey", pt: "jornada" }, { en: "mirror", pt: "espelho" },
    { en: "whisper", pt: "sussurro" }, { en: "harvest", pt: "colheita" },
  ],
  advanced: [
    { en: "wonderful", pt: "maravilhoso" }, { en: "dangerous", pt: "perigoso" }, { en: "beautiful", pt: "bonito" }, { en: "difficult", pt: "difícil" },
    { en: "important", pt: "importante" }, { en: "necessary", pt: "necessário" }, { en: "generous", pt: "generoso" }, { en: "ambitious", pt: "ambicioso" },
    { en: "meticulous", pt: "meticuloso" }, { en: "relentless", pt: "incessante" },
  ],
  expert: [
    { en: "unbelievable", pt: "inacreditável" }, { en: "extraordinary", pt: "extraordinário" }, { en: "sophisticated", pt: "sofisticado" },
    { en: "misunderstanding", pt: "mal-entendido" }, { en: "responsibility", pt: "responsabilidade" }, { en: "characteristic", pt: "característica" },
    { en: "entrepreneur", pt: "empreendedor" }, { en: "consciousness", pt: "consciência" }, { en: "surveillance", pt: "vigilância" }, { en: "accomplishment", pt: "realização" },
  ],
};

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function Forca({ onExit }) {
  const [level, setLevel] = useState(null);
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [guessed, setGuessed] = useState(new Set());
  const [wrong, setWrong] = useState(0);
  const [score, setScore] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  if (!level) {
    return (
      <LevelMenu accent={ACCENT} gameName="Forca" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)}
        onSelect={(l) => {
          setLevel(l);
          setDeck(shuffle(BANKS[l]).slice(0, Math.min(ROUNDS, BANKS[l].length)));
          setIdx(0); setGuessed(new Set()); setWrong(0); setScore(0); setHintUsed(false);
        }} />
    );
  }

  const current = deck[idx];
  const finished = idx >= deck.length;

  if (finished) {
    return (
      <div style={styles.wrap}>
        <div style={styles.topBar}><button style={styles.backBtn} onClick={() => setLevel(null)}>← nível</button></div>
        <div style={styles.card}>
          <div style={styles.overActions}>
            <span style={styles.overEyebrow}>Fim de rodada</span>
            <span style={{ ...styles.doneText, color: ACCENT, fontSize: 32 }}>{score} pts</span>
            <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={() => { setDeck(shuffle(BANKS[level]).slice(0, Math.min(ROUNDS, BANKS[level].length))); setIdx(0); setGuessed(new Set()); setWrong(0); setScore(0); setHintUsed(false); }}>Jogar de novo</button>
          </div>
        </div>
      </div>
    );
  }

  const letters = current.en.split("");
  const won = letters.every((l) => guessed.has(l));
  const lost = wrong >= MAX_WRONG;
  const over = won || lost;
  if (won && level === "advanced") unlockExpert(GAME_ID);

  function guess(letter) {
    if (over || guessed.has(letter)) return;
    const next = new Set(guessed).add(letter);
    setGuessed(next);
    if (!current.en.includes(letter)) setWrong((w) => w + 1);
  }
  function useHint() {
    if (over) return;
    const missing = [...new Set(letters)].filter((l) => !guessed.has(l));
    if (missing.length === 0) return;
    setGuessed((prev) => new Set(prev).add(missing[Math.floor(Math.random() * missing.length)]));
    setHintUsed(true);
  }
  function next() {
    if (won) setScore((s) => s + Math.max(20 - wrong * 3 - (hintUsed ? 10 : 0), 5));
    setIdx((i) => i + 1); setGuessed(new Set()); setWrong(0); setHintUsed(false);
  }
  function changeLevel() { setLevel(null); }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={changeLevel}>← nível</button>
        <span style={{ ...styles.hudItem, color: ACCENT }}>{idx + 1}/{deck.length} · {score} pts</span>
      </div>
      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: ACCENT, fontWeight: 700 }}>FORCA</span>
        <p style={styles.hint}>Dica: {current.pt}</p>
        <svg viewBox="0 0 120 120" style={styles.gallow}>
          <line x1="10" y1="110" x2="70" y2="110" stroke="#1B2735" strokeWidth="3" />
          <line x1="25" y1="110" x2="25" y2="15" stroke="#1B2735" strokeWidth="3" />
          <line x1="25" y1="15" x2="80" y2="15" stroke="#1B2735" strokeWidth="3" />
          <line x1="80" y1="15" x2="80" y2="30" stroke="#1B2735" strokeWidth="3" />
          {wrong > 0 && <circle cx="80" cy="42" r="12" stroke={ACCENT} strokeWidth="3" fill="none" />}
          {wrong > 1 && <line x1="80" y1="54" x2="80" y2="85" stroke={ACCENT} strokeWidth="3" />}
          {wrong > 2 && <line x1="80" y1="62" x2="65" y2="75" stroke={ACCENT} strokeWidth="3" />}
          {wrong > 3 && <line x1="80" y1="62" x2="95" y2="75" stroke={ACCENT} strokeWidth="3" />}
          {wrong > 4 && <line x1="80" y1="85" x2="68" y2="102" stroke={ACCENT} strokeWidth="3" />}
          {wrong > 5 && <line x1="80" y1="85" x2="92" y2="102" stroke={ACCENT} strokeWidth="3" />}
        </svg>
        <div style={styles.wordRow}>
          {letters.map((l, i) => <span key={i} style={styles.letterSlot}>{guessed.has(l) || lost ? l : ""}</span>)}
        </div>
        {!over && (
          <>
            <div style={styles.keyboard}>
              {ALPHABET.map((l) => {
                const used = guessed.has(l), correct = used && current.en.includes(l);
                return (
                  <button key={l} disabled={used} onClick={() => guess(l)} style={{ ...styles.key, background: used ? (correct ? "#E7EFE9" : "#F4E4E2") : "#FFFFFF", borderColor: used ? (correct ? "#6B9080" : "#C65D57") : "#D8D0BC", color: used ? (correct ? "#3E5C4C" : "#8B3E38") : "#1B2735" }}>{l}</button>
                );
              })}
            </div>
            <button style={{ ...styles.ghostBtn, marginTop: 14, borderColor: ACCENT, color: ACCENT }} onClick={useHint}>💡 Revelar uma letra</button>
          </>
        )}
        {over && (
          <div style={styles.overActions}>
            <span style={{ ...styles.doneText, color: won ? "#3E5C4C" : "#8B3E38" }}>{won ? `Acertou! 🎉${level === "advanced" ? " Nível Mestre destravado!" : ""}` : `A palavra era "${current.en}"`}</span>
            <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={next}>{idx + 1 >= deck.length ? "Ver resultado →" : "Próxima palavra →"}</button>
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
  card: { background: "#F7F3E9", borderRadius: 4, padding: "clamp(14px,4vw,20px) clamp(12px,4vw,20px) 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column", alignItems: "center" },
  entryNo: { fontSize: 11, letterSpacing: 1, alignSelf: "flex-start" },
  overEyebrow: { fontSize: 11, letterSpacing: 2, color: "#9A9280" },
  hint: { fontSize: 13, color: "#5A6270", marginTop: 6, marginBottom: 4, alignSelf: "flex-start" },
  gallow: { width: 110, height: 110, marginTop: 6 },
  wordRow: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 10, marginBottom: 16 },
  letterSlot: { width: 22, textAlign: "center", borderBottom: "2px solid #1B2735", fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "#1B2735", textTransform: "uppercase" },
  keyboard: { display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  key: { width: 28, height: 32, border: "1.5px solid", borderRadius: 3, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", textTransform: "uppercase" },
  ghostBtn: { background: "none", border: "1.5px solid", borderRadius: 3, padding: "8px 12px", fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overActions: { marginTop: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, margin: "auto" },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 16, textAlign: "center" },
  nextBtn: { color: "#F7F3E9", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
};
