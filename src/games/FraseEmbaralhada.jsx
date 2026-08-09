import { useState, useMemo } from "react";

const ACCENT = "#3E86C9";

const SENTENCES = [
  { en: "I like to read books", pt: "Eu gosto de ler livros" },
  { en: "She works at a hospital", pt: "Ela trabalha em um hospital" },
  { en: "We are going to the beach", pt: "Nós vamos para a praia" },
  { en: "He never eats breakfast", pt: "Ele nunca toma café da manhã" },
  { en: "They live in a small house", pt: "Eles moram em uma casa pequena" },
  { en: "My brother plays the guitar", pt: "Meu irmão toca violão" },
  { en: "This coffee is too hot", pt: "Esse café está muito quente" },
  { en: "The children are playing outside", pt: "As crianças estão brincando lá fora" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(sentence) {
  const words = sentence.en.split(" ").map((w, i) => ({ id: `${i}-${w}`, text: w }));
  return shuffle(words);
}

function pickSentence(excludeEn) {
  const pool = SENTENCES.filter((s) => s.en !== excludeEn);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function FraseEmbaralhada({ onExit }) {
  const [current, setCurrent] = useState(() => pickSentence(null));
  const [pool, setPool] = useState(() => buildRound(current));
  const [answer, setAnswer] = useState([]);
  const [checked, setChecked] = useState(null); // null | true | false

  function addToAnswer(word) {
    if (checked) return;
    setAnswer((a) => [...a, word]);
    setPool((p) => p.filter((w) => w.id !== word.id));
    setChecked(null);
  }

  function removeFromAnswer(word) {
    if (checked === true) return;
    setAnswer((a) => a.filter((w) => w.id !== word.id));
    setPool((p) => [...p, word]);
    setChecked(null);
  }

  function verify() {
    const built = answer.map((w) => w.text).join(" ").toLowerCase();
    setChecked(built === current.en.toLowerCase());
  }

  function nextSentence() {
    const s = pickSentence(current.en);
    setCurrent(s);
    setPool(buildRound(s));
    setAnswer([]);
    setChecked(null);
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onExit}>← jogos</button>
      </div>

      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: ACCENT }}>FRASE EMBARALHADA</span>
        <p style={styles.intro}>Toque nas palavras na ordem certa para formar a frase. Dica: {current.pt}</p>

        <div style={styles.answerRow}>
          {answer.length === 0 && <span style={styles.placeholder}>toque nas palavras abaixo…</span>}
          {answer.map((w) => (
            <button key={w.id} onClick={() => removeFromAnswer(w)} style={{ ...styles.wordBtn, background: "#FFFFFF", borderColor: checked === true ? "#6B9080" : checked === false ? "#C65D57" : ACCENT, color: "#1B2735" }}>
              {w.text}
            </button>
          ))}
        </div>

        <div style={styles.poolRow}>
          {pool.map((w) => (
            <button key={w.id} onClick={() => addToAnswer(w)} style={styles.wordBtnPool}>
              {w.text}
            </button>
          ))}
        </div>

        {checked === false && <p style={styles.wrongText}>Ainda não é isso — reorganize e tente de novo.</p>}

        <div style={styles.actions}>
          {pool.length === 0 && checked !== true && (
            <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={verify}>Verificar</button>
          )}
          {checked === true && (
            <>
              <span style={{ ...styles.doneText, color: ACCENT }}>Certinho! 🎉</span>
              <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={nextSentence}>Próxima frase</button>
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
  card: { background: "#F7F3E9", borderRadius: 4, padding: "20px 18px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column" },
  entryNo: { fontSize: 11, letterSpacing: 1, fontWeight: 700 },
  intro: { fontSize: 12.5, color: "#5A6270", marginTop: 6, marginBottom: 16, lineHeight: 1.5 },
  answerRow: { display: "flex", flexWrap: "wrap", gap: 8, minHeight: 46, padding: 10, background: "#FFFFFF", border: "1.5px dashed #D8D0BC", borderRadius: 4, alignItems: "center" },
  placeholder: { fontSize: 12, color: "#B0A990" },
  poolRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 },
  wordBtn: { border: "1.5px solid", borderRadius: 20, padding: "7px 14px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  wordBtnPool: { border: "1.5px solid #D8D0BC", background: "#FFFFFF", borderRadius: 20, padding: "7px 14px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", color: "#1B2735" },
  wrongText: { fontSize: 12, color: "#C65D57", marginTop: 10 },
  actions: { marginTop: 16, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 17 },
  nextBtn: { color: "#F7F3E9", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
};
