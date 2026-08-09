import { useState, useMemo } from "react";

const WORD_LIST = [
  { en: "courage", pt: "coragem" },
  { en: "wisdom", pt: "sabedoria" },
  { en: "shadow", pt: "sombra" },
  { en: "bridge", pt: "ponte" },
  { en: "forest", pt: "floresta" },
  { en: "silence", pt: "silêncio" },
  { en: "journey", pt: "jornada" },
  { en: "mirror", pt: "espelho" },
  { en: "whisper", pt: "sussurro" },
  { en: "harvest", pt: "colheita" },
];

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const MAX_WRONG = 6;
const ACCENT = "#D96C4F";

function pickWord(excludeEn) {
  const pool = WORD_LIST.filter((w) => w.en !== excludeEn);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Forca({ onExit }) {
  const [current, setCurrent] = useState(() => pickWord(null));
  const [guessed, setGuessed] = useState(new Set());
  const [wrong, setWrong] = useState(0);

  const letters = current.en.split("");
  const won = letters.every((l) => guessed.has(l));
  const lost = wrong >= MAX_WRONG;
  const over = won || lost;

  function guess(letter) {
    if (over || guessed.has(letter)) return;
    const next = new Set(guessed).add(letter);
    setGuessed(next);
    if (!current.en.includes(letter)) setWrong((w) => w + 1);
  }

  function nextWord() {
    setCurrent((c) => pickWord(c.en));
    setGuessed(new Set());
    setWrong(0);
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onExit}>← jogos</button>
        <span style={{ ...styles.hudItem, color: ACCENT, fontWeight: 700 }}>{MAX_WRONG - wrong} tentativas</span>
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
          {letters.map((l, i) => (
            <span key={i} style={styles.letterSlot}>{guessed.has(l) || lost ? l : ""}</span>
          ))}
        </div>

        {!over && (
          <div style={styles.keyboard}>
            {ALPHABET.map((l) => {
              const used = guessed.has(l);
              const correct = used && current.en.includes(l);
              return (
                <button
                  key={l}
                  disabled={used}
                  onClick={() => guess(l)}
                  style={{
                    ...styles.key,
                    background: used ? (correct ? "#E7EFE9" : "#F4E4E2") : "#FFFFFF",
                    borderColor: used ? (correct ? "#6B9080" : "#C65D57") : "#D8D0BC",
                    color: used ? (correct ? "#3E5C4C" : "#8B3E38") : "#1B2735",
                  }}
                >
                  {l}
                </button>
              );
            })}
          </div>
        )}

        {over && (
          <div style={styles.overActions}>
            <span style={{ ...styles.doneText, color: won ? "#3E5C4C" : "#8B3E38" }}>
              {won ? "Acertou! 🎉" : `A palavra era "${current.en}"`}
            </span>
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
  hudItem: { fontSize: 11 },
  card: { background: "#F7F3E9", borderRadius: 4, padding: "20px 20px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column", alignItems: "center" },
  entryNo: { fontSize: 11, color: "#9A9280", letterSpacing: 1, alignSelf: "flex-start" },
  hint: { fontSize: 13, color: "#5A6270", marginTop: 6, marginBottom: 4, alignSelf: "flex-start" },
  gallow: { width: 110, height: 110, marginTop: 6 },
  wordRow: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 10, marginBottom: 16 },
  letterSlot: { width: 22, textAlign: "center", borderBottom: "2px solid #1B2735", fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "#1B2735", textTransform: "uppercase" },
  keyboard: { display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  key: { width: 28, height: 32, border: "1.5px solid", borderRadius: 3, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", textTransform: "uppercase" },
  overActions: { marginTop: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 17 },
  nextBtn: { background: "#1B2735", color: "#F7F3E9", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
};
