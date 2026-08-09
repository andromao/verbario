import { useState, useMemo, useRef } from "react";

const ACCENT = "#8B7FD9";

const WORD_LIST = [
  { en: "WONDERFUL", pt: "maravilhoso" },
  { en: "DISTANCE", pt: "distância" },
  { en: "CALENDAR", pt: "calendário" },
  { en: "FAVORITE", pt: "favorito" },
  { en: "BUILDING", pt: "prédio / construção" },
  { en: "HOSPITAL", pt: "hospital" },
  { en: "TRIANGLE", pt: "triângulo" },
  { en: "UMBRELLA", pt: "guarda-chuva" },
  { en: "MOUNTAIN", pt: "montanha" },
  { en: "ELEPHANT", pt: "elefante" },
];

function buildPuzzle(word) {
  const uniqueLetters = [...new Set(word.split(""))];
  const codes = [...Array(26).keys()].map((n) => n + 1);
  for (let i = codes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [codes[i], codes[j]] = [codes[j], codes[i]];
  }
  const letterToCode = {};
  uniqueLetters.forEach((l, i) => { letterToCode[l] = codes[i]; });
  return letterToCode;
}

function pickWord(excludeEn) {
  const pool = WORD_LIST.filter((w) => w.en !== excludeEn);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Criptograma({ onExit }) {
  const [current, setCurrent] = useState(() => pickWord(null));
  const letterToCode = useMemo(() => buildPuzzle(current.en), [current]);
  const codeToLetter = useMemo(() => {
    const map = {};
    Object.entries(letterToCode).forEach(([l, c]) => { map[c] = l; });
    return map;
  }, [letterToCode]);

  const [guesses, setGuesses] = useState({}); // code -> guessed letter
  const [revealed, setRevealed] = useState(new Set());
  const inputRefs = useRef({});

  const codesInWord = current.en.split("").map((l) => letterToCode[l]);
  const uniqueCodes = [...new Set(codesInWord)];

  const solved = uniqueCodes.every((c) => (guesses[c] || "").toUpperCase() === codeToLetter[c]);

  function handleGuess(code, value) {
    const letter = value.slice(-1).toUpperCase().replace(/[^A-Z]/g, "");
    setGuesses((prev) => ({ ...prev, [code]: letter }));
    if (letter) {
      const nextCode = uniqueCodes.find((c) => c !== code && !guesses[c] && !revealed.has(c));
      if (nextCode && inputRefs.current[nextCode]) {
        setTimeout(() => inputRefs.current[nextCode]?.focus(), 0);
      }
    }
  }

  function revealLetter() {
    const unsolved = uniqueCodes.filter((c) => (guesses[c] || "").toUpperCase() !== codeToLetter[c]);
    if (unsolved.length === 0) return;
    const code = unsolved[Math.floor(Math.random() * unsolved.length)];
    setGuesses((prev) => ({ ...prev, [code]: codeToLetter[code] }));
    setRevealed((prev) => new Set(prev).add(code));
  }

  function nextWord() {
    setCurrent((c) => pickWord(c.en));
    setGuesses({});
    setRevealed(new Set());
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onExit}>← jogos</button>
      </div>

      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: ACCENT, fontWeight: 700 }}>CRIPTOGRAMA</span>
        <p style={styles.hint}>Dica: {current.pt}. Cada número é sempre a mesma letra.</p>

        <div style={styles.puzzleRow}>
          {current.en.split("").map((letter, i) => {
            const code = letterToCode[letter];
            const guess = guesses[code] || "";
            const isRevealed = revealed.has(code);
            const isCorrect = guess.toUpperCase() === letter;
            return (
              <div key={i} style={styles.letterCol}>
                <input
                  ref={(el) => (inputRefs.current[code] = el)}
                  value={guess}
                  onChange={(e) => handleGuess(code, e.target.value)}
                  maxLength={1}
                  disabled={isRevealed}
                  style={{
                    ...styles.letterInput,
                    borderColor: isRevealed ? "#B08A3E" : guess ? (isCorrect ? "#6B9080" : "#C65D57") : "#D8D0BC",
                    color: isRevealed ? "#B08A3E" : isCorrect ? ACCENT : "#1B2735",
                    background: isRevealed ? "#FCEFD9" : "#FFFFFF",
                  }}
                />
                <span style={styles.codeLabel}>{code}</span>
              </div>
            );
          })}
        </div>

        {!solved ? (
          <button style={{ ...styles.ghostBtn, marginTop: 18, alignSelf: "flex-start", borderColor: ACCENT, color: ACCENT }} onClick={revealLetter}>
            Revelar uma letra
          </button>
        ) : (
          <div style={styles.overActions}>
            <span style={{ ...styles.doneText, color: ACCENT }}>Decifrou! 🎉</span>
            <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={nextWord}>Próxima palavra</button>
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
  card: { background: "#F7F3E9", borderRadius: 4, padding: "20px 20px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column" },
  entryNo: { fontSize: 11, color: "#9A9280", letterSpacing: 1 },
  hint: { fontSize: 12.5, color: "#5A6270", marginTop: 6, marginBottom: 20, lineHeight: 1.5 },
  puzzleRow: { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  letterCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  letterInput: { width: 30, height: 34, textAlign: "center", border: "2px solid", borderRadius: 3, fontSize: 17, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, textTransform: "uppercase" },
  codeLabel: { fontSize: 10, color: "#8B96A6" },
  ghostBtn: { background: "none", color: "#1B2735", border: "1.5px solid #D8D0BC", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overActions: { marginTop: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 18, color: "#3E5C4C" },
  nextBtn: { background: "#1B2735", color: "#F7F3E9", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
};
