import { useState } from "react";

const ACCENT = "#B8962E";

const ITEMS = [
  { before: "She", blank: "___", after: "to school every day.", answer: "goes", options: ["go", "goes", "going", "gone"], pt: "Ela vai à escola todos os dias." },
  { before: "They", blank: "___", after: "watching a movie right now.", answer: "are", options: ["is", "are", "was", "be"], pt: "Eles estão assistindo a um filme agora." },
  { before: "I", blank: "___", after: "never been to Japan.", answer: "have", options: ["has", "have", "had", "having"], pt: "Eu nunca fui ao Japão." },
  { before: "This", blank: "___", after: "the best pizza I've ever had.", answer: "is", options: ["is", "are", "be", "was"], pt: "Esta é a melhor pizza que já comi." },
  { before: "We", blank: "___", after: "dinner when you called.", answer: "were having", options: ["have", "had", "were having", "has"], pt: "Nós estávamos jantando quando você ligou." },
  { before: "He", blank: "___", after: "harder than anyone else on the team.", answer: "works", options: ["work", "works", "working", "worked"], pt: "Ele trabalha mais duro do que qualquer um no time." },
  { before: "My parents", blank: "___", after: "married for twenty years.", answer: "have been", options: ["are", "were", "have been", "had"], pt: "Meus pais estão casados há vinte anos." },
  { before: "If it", blank: "___", after: "tomorrow, we'll stay home.", answer: "rains", options: ["rain", "rains", "rained", "raining"], pt: "Se chover amanhã, ficaremos em casa." },
  { before: "She", blank: "___", after: "the report before the meeting starts.", answer: "will finish", options: ["finish", "finished", "will finish", "finishing"], pt: "Ela vai terminar o relatório antes da reunião começar." },
  { before: "The keys", blank: "___", after: "on the table.", answer: "are", options: ["is", "are", "was", "be"], pt: "As chaves estão na mesa." },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CompleteFrase({ onExit }) {
  const [order] = useState(() => shuffle(ITEMS.map((_, i) => i)));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);

  const item = ITEMS[order[idx]];
  const finished = idx >= order.length;

  function choose(opt) {
    if (picked) return;
    setPicked(opt);
    if (opt === item.answer) setScore((s) => s + 1);
  }

  function next() {
    setPicked(null);
    setIdx((i) => i + 1);
  }

  function restart() {
    setIdx(0); setPicked(null); setScore(0);
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onExit}>← jogos</button>
        <span style={{ ...styles.hudItem, color: ACCENT }}>{score}/{ITEMS.length}</span>
      </div>

      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: ACCENT }}>COMPLETE A FRASE</span>

        {!finished ? (
          <>
            <p style={styles.sentence}>{item.before} <span style={styles.blank}>{picked || "___"}</span> {item.after}</p>
            <p style={styles.hint}>Dica: {item.pt}</p>
            <div style={styles.options}>
              {item.options.map((opt) => {
                const isCorrect = opt === item.answer;
                const isPicked = picked === opt;
                let bg = "#FFFFFF", border = "#D8D0BC", color = "#1B2735";
                if (picked) {
                  if (isCorrect) { bg = "#F5EFD9"; border = ACCENT; color = "#6B5A17"; }
                  else if (isPicked) { bg = "#F4E4E2"; border = "#C65D57"; color = "#8B3E38"; }
                }
                return (
                  <button key={opt} disabled={!!picked} onClick={() => choose(opt)} style={{ ...styles.optBtn, background: bg, borderColor: border, color }}>
                    {opt}
                  </button>
                );
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
            <span style={{ ...styles.doneText, color: ACCENT }}>{score}/{ITEMS.length} certas</span>
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
  sentence: { fontFamily: "'Fraunces', serif", fontSize: 19, color: "#1B2735", marginTop: 16, lineHeight: 1.5 },
  blank: { color: "#B08A3E", fontWeight: 700, borderBottom: "2px solid #B08A3E" },
  hint: { fontSize: 12.5, color: "#8B7F5F", fontStyle: "italic", marginTop: 4 },
  options: { display: "flex", flexDirection: "column", gap: 9, marginTop: 16 },
  optBtn: { textAlign: "left", padding: "12px 14px", borderRadius: 3, border: "1.5px solid", fontSize: 14.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  nextBtn: { color: "#FFFFFF", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overActions: { margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 32 },
};
