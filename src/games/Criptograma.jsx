import { useState, useMemo, useRef } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "criptograma";
const ACCENT = "#8B7FD9";

const BANKS = {
  superbeginner: [
    { en: "CAT", pt: "gato" }, { en: "DOG", pt: "cachorro" }, { en: "SUN", pt: "sol" }, { en: "RED", pt: "vermelho" }, { en: "BIG", pt: "grande" },
    { en: "RUN", pt: "correr" }, { en: "HAT", pt: "chapéu" }, { en: "TEN", pt: "dez" }, { en: "EAT", pt: "comer" }, { en: "YES", pt: "sim" },
  ],
  beginner: [
    { en: "APPLE", pt: "maçã" }, { en: "HOUSE", pt: "casa" }, { en: "WATER", pt: "água" }, { en: "LIGHT", pt: "luz" }, { en: "HAPPY", pt: "feliz" },
    { en: "MUSIC", pt: "música" }, { en: "DREAM", pt: "sonho" }, { en: "SMILE", pt: "sorriso" }, { en: "BEACH", pt: "praia" }, { en: "CLOUD", pt: "nuvem" },
  ],
  intermediate: [
    { en: "GARDEN", pt: "jardim" }, { en: "PICTURE", pt: "figura" }, { en: "WEATHER", pt: "clima" }, { en: "JOURNEY", pt: "jornada" }, { en: "MORNING", pt: "manhã" },
    { en: "KITCHEN", pt: "cozinha" }, { en: "ANIMAL", pt: "animal" }, { en: "PEOPLE", pt: "pessoas" }, { en: "FRIEND", pt: "amigo" }, { en: "STREET", pt: "rua" },
  ],
  advanced: [
    { en: "WONDERFUL", pt: "maravilhoso" }, { en: "DISTANCE", pt: "distância" }, { en: "CALENDAR", pt: "calendário" }, { en: "FAVORITE", pt: "favorito" },
    { en: "BUILDING", pt: "prédio / construção" }, { en: "HOSPITAL", pt: "hospital" }, { en: "TRIANGLE", pt: "triângulo" }, { en: "UMBRELLA", pt: "guarda-chuva" },
    { en: "MOUNTAIN", pt: "montanha" }, { en: "ELEPHANT", pt: "elefante" },
  ],
  expert: [
    { en: "CONSCIOUSNESS", pt: "consciência" }, { en: "ENTREPRENEUR", pt: "empreendedor" }, { en: "SURVEILLANCE", pt: "vigilância" }, { en: "PHOTOGRAPHER", pt: "fotógrafo" },
    { en: "REFRIGERATOR", pt: "geladeira" }, { en: "ACCOMPLISHMENT", pt: "realização" }, { en: "SOPHISTICATED", pt: "sofisticado" }, { en: "CHARACTERISTIC", pt: "característica" },
    { en: "RESPONSIBILITY", pt: "responsabilidade" }, { en: "EXTRAORDINARY", pt: "extraordinário" },
  ],
};

function buildSharedCipher(words) {
  const uniqueLetters = [...new Set(words.join("").split(""))];
  const codes = [...Array(26).keys()].map((n) => n + 1);
  for (let i = codes.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [codes[i], codes[j]] = [codes[j], codes[i]]; }
  const letterToCode = {};
  uniqueLetters.forEach((l, i) => { letterToCode[l] = codes[i]; });
  return letterToCode;
}

export default function Criptograma({ onExit }) {
  const [level, setLevel] = useState(null);
  const [round, setRound] = useState(0);
  const words = level ? BANKS[level] : [];
  const letterToCode = useMemo(() => (level ? buildSharedCipher(words.map((w) => w.en)) : {}), [level, round]);
  const codeToLetter = useMemo(() => {
    const map = {};
    Object.entries(letterToCode).forEach(([l, c]) => { map[c] = l; });
    return map;
  }, [letterToCode]);
  const [guesses, setGuesses] = useState({});
  const [revealed, setRevealed] = useState(new Set());
  const inputRefs = useRef({});

  if (!level) {
    return (
      <LevelMenu accent={ACCENT} gameName="Criptograma" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)}
        onSelect={(l) => { setLevel(l); setGuesses({}); setRevealed(new Set()); }} />
    );
  }

  const allCodes = [...new Set(words.join("").split("").map((l) => letterToCode[l]))];
  const solved = allCodes.every((c) => (guesses[c] || "").toUpperCase() === codeToLetter[c]);
  if (solved && level === "advanced") unlockExpert(GAME_ID);

  function handleGuess(code, value, refKey) {
    const letter = value.slice(-1).toUpperCase().replace(/[^A-Z]/g, "");
    setGuesses((prev) => ({ ...prev, [code]: letter }));
    if (letter) {
      const idx = allOccurrences.findIndex((o) => o.refKey === refKey);
      const next = allOccurrences.slice(idx + 1).find((o) => !guesses[o.code] && !revealed.has(o.code));
      if (next && inputRefs.current[next.refKey]) setTimeout(() => inputRefs.current[next.refKey]?.focus(), 0);
    }
  }
  function revealLetter() {
    const unsolved = allCodes.filter((c) => (guesses[c] || "").toUpperCase() !== codeToLetter[c]);
    if (unsolved.length === 0) return;
    const code = unsolved[Math.floor(Math.random() * unsolved.length)];
    setGuesses((prev) => ({ ...prev, [code]: codeToLetter[code] }));
    setRevealed((prev) => new Set(prev).add(code));
  }
  function revealWord() {
    const incomplete = words.filter((w) => [...w.en].some((l) => (guesses[letterToCode[l]] || "").toUpperCase() !== l));
    if (incomplete.length === 0) return;
    const w = incomplete[Math.floor(Math.random() * incomplete.length)];
    setGuesses((prev) => {
      const next = { ...prev };
      [...w.en].forEach((l) => { next[letterToCode[l]] = l; });
      return next;
    });
    setRevealed((prev) => {
      const next = new Set(prev);
      [...w.en].forEach((l) => next.add(letterToCode[l]));
      return next;
    });
  }
  function restart() { setGuesses({}); setRevealed(new Set()); setRound((r) => r + 1); }
  function changeLevel() { setLevel(null); }

  // lista linear de todas as ocorrências de letra, pra saber qual input focar em seguida
  const allOccurrences = [];
  words.forEach((w, wi) => [...w.en].forEach((l, li) => allOccurrences.push({ refKey: `${wi}-${li}`, code: letterToCode[l] })));

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}><button style={styles.backBtn} onClick={changeLevel}>← nível</button></div>
      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: ACCENT, fontWeight: 700 }}>CRIPTOGRAMA</span>
        <p style={styles.hint}>Todas as palavras usam o mesmo código: cada número é sempre a mesma letra.</p>
        <div style={styles.wordsList}>
          {words.map((w, wi) => (
            <div key={w.en} style={styles.wordRow}>
              <div style={styles.puzzleRow}>
                {[...w.en].map((letter, li) => {
                  const code = letterToCode[letter];
                  const guess = guesses[code] || "";
                  const isRevealed = revealed.has(code);
                  const isCorrect = guess.toUpperCase() === letter;
                  const refKey = `${wi}-${li}`;
                  return (
                    <div key={li} style={styles.letterCol}>
                      <input ref={(el) => (inputRefs.current[refKey] = el)} value={guess} onChange={(e) => handleGuess(code, e.target.value, refKey)} maxLength={1} disabled={isRevealed}
                        style={{ ...styles.letterInput, borderColor: isRevealed ? "#B08A3E" : guess ? (isCorrect ? "#6B9080" : "#C65D57") : "#D8D0BC", color: isRevealed ? "#B08A3E" : isCorrect ? ACCENT : "#1B2735", background: isRevealed ? "#FCEFD9" : "#FFFFFF" }} />
                      <span style={styles.codeLabel}>{code}</span>
                    </div>
                  );
                })}
              </div>
              <span style={styles.wordHint}>{w.pt}</span>
            </div>
          ))}
        </div>
        {!solved ? (
          <div style={styles.hintRow}>
            <button style={{ ...styles.ghostBtn, borderColor: ACCENT, color: ACCENT }} onClick={revealLetter}>💡 Revelar uma letra</button>
            <button style={{ ...styles.ghostBtn, borderColor: ACCENT, color: ACCENT }} onClick={revealWord}>💡 Revelar uma palavra</button>
          </div>
        ) : (
          <div style={styles.overActions}>
            <span style={{ ...styles.doneText, color: ACCENT }}>Decifrou tudo! 🎉{level === "advanced" ? " Nível Mestre destravado!" : ""}</span>
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
  card: { background: "#F7F3E9", borderRadius: 4, padding: "clamp(14px,4vw,20px) clamp(12px,4vw,20px) 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column" },
  entryNo: { fontSize: 11, letterSpacing: 1 },
  hint: { fontSize: 12.5, color: "#5A6270", marginTop: 6, marginBottom: 16, lineHeight: 1.5 },
  wordsList: { display: "flex", flexDirection: "column", gap: 14 },
  wordRow: { display: "flex", flexDirection: "column", gap: 4, borderBottom: "1px solid #E5DDC8", paddingBottom: 10 },
  puzzleRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  letterCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  letterInput: { width: "clamp(20px,7vw,28px)", height: "clamp(24px,8vw,32px)", textAlign: "center", border: "2px solid", borderRadius: 3, fontSize: "clamp(12px,4vw,16px)", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, textTransform: "uppercase" },
  codeLabel: { fontSize: 9, color: "#8B96A6" },
  wordHint: { fontSize: 11.5, color: "#8B7F5F", fontStyle: "italic" },
  hintRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 },
  ghostBtn: { background: "none", border: "1.5px solid", borderRadius: 3, padding: "8px 12px", fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overActions: { marginTop: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 16, textAlign: "center" },
  nextBtn: { color: "#F7F3E9", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
};
