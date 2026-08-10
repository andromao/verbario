import { useState } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "complete-frase";
const ACCENT = "#B8962E";

const BANKS = {
  superbeginner: [
    { before: "I", after: "a cat.", answer: "have", options: ["have", "has", "am", "is"], pt: "Eu tenho um gato." },
    { before: "This", after: "a book.", answer: "is", options: ["am", "is", "are", "be"], pt: "Isto é um livro." },
    { before: "She", after: "my friend.", answer: "is", options: ["am", "is", "are", "be"], pt: "Ela é minha amiga." },
    { before: "We", after: "happy.", answer: "are", options: ["is", "am", "are", "be"], pt: "Nós estamos felizes." },
  ],
  beginner: [
    { before: "I", after: "a student.", answer: "am", options: ["am", "is", "are", "be"], pt: "Eu sou estudante." },
    { before: "She", after: "happy.", answer: "is", options: ["am", "is", "are", "be"], pt: "Ela está feliz." },
    { before: "They", after: "from Brazil.", answer: "are", options: ["is", "am", "are", "be"], pt: "Eles são do Brasil." },
    { before: "He", after: "a doctor.", answer: "is", options: ["am", "is", "are", "be"], pt: "Ele é médico." },
  ],
  intermediate: [
    { before: "She", after: "to school every day.", answer: "goes", options: ["go", "goes", "going", "gone"], pt: "Ela vai à escola todos os dias." },
    { before: "They", after: "watching a movie right now.", answer: "are", options: ["is", "are", "was", "be"], pt: "Eles estão assistindo a um filme agora." },
    { before: "He", after: "harder than anyone else on the team.", answer: "works", options: ["work", "works", "working", "worked"], pt: "Ele trabalha mais duro do que qualquer um no time." },
    { before: "The keys", after: "on the table.", answer: "are", options: ["is", "are", "was", "be"], pt: "As chaves estão na mesa." },
  ],
  advanced: [
    { before: "I", after: "never been to Japan.", answer: "have", options: ["has", "have", "had", "having"], pt: "Eu nunca fui ao Japão." },
    { before: "We", after: "dinner when you called.", answer: "were having", options: ["have", "had", "were having", "has"], pt: "Nós estávamos jantando quando você ligou." },
    { before: "My parents", after: "married for twenty years.", answer: "have been", options: ["are", "were", "have been", "had"], pt: "Meus pais estão casados há vinte anos." },
    { before: "If it", after: "tomorrow, we'll stay home.", answer: "rains", options: ["rain", "rains", "rained", "raining"], pt: "Se chover amanhã, ficaremos em casa." },
  ],
  expert: [
    { before: "If I", after: "known, I would have told you.", answer: "had", options: ["have", "had", "has", "having"], pt: "Se eu tivesse sabido, eu teria te contado." },
    { before: "By the time we arrive, the show", after: "already started.", answer: "will have", options: ["will", "will have", "would have", "has"], pt: "Quando chegarmos, o show já terá começado." },
    { before: "Not only was she late, but she", after: "forgotten her keys.", answer: "had also", options: ["also had", "had also", "also has", "has also"], pt: "Ela não só se atrasou como também esqueceu as chaves." },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function CompleteFrase({ onExit }) {
  const [level, setLevel] = useState(null);
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [eliminated, setEliminated] = useState(new Set());
  const [score, setScore] = useState(0);

  if (!level) {
    return (
      <LevelMenu accent={ACCENT} gameName="Complete a Frase" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)}
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
        <span style={{ ...styles.entryNo, color: ACCENT }}>COMPLETE A FRASE</span>
        {!finished ? (
          <>
            <p style={styles.sentence}>{item.before} <span style={styles.blank}>{picked || "___"}</span> {item.after}</p>
            <p style={styles.hint}>Dica: {item.pt}</p>
            <div style={styles.options}>
              {item.options.map((opt) => {
                if (eliminated.has(opt)) return null;
                const isCorrect = opt === item.answer, isPicked = picked === opt;
                let bg = "#FFFFFF", border = "#D8D0BC", color = "#1B2735";
                if (picked) { if (isCorrect) { bg = "#F5EFD9"; border = ACCENT; color = "#6B5A17"; } else if (isPicked) { bg = "#F4E4E2"; border = "#C65D57"; color = "#8B3E38"; } }
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
  sentence: { fontFamily: "'Fraunces', serif", fontSize: 18, color: "#1B2735", marginTop: 16, lineHeight: 1.5 },
  blank: { color: "#B08A3E", fontWeight: 700, borderBottom: "2px solid #B08A3E" },
  hint: { fontSize: 12.5, color: "#8B7F5F", fontStyle: "italic", marginTop: 4 },
  options: { display: "flex", flexDirection: "column", gap: 9, marginTop: 16 },
  optBtn: { textAlign: "left", padding: "12px 14px", borderRadius: 3, border: "1.5px solid", fontSize: 14.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  nextBtn: { color: "#FFFFFF", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  ghostBtn: { background: "none", border: "1.5px solid #D8D0BC", borderRadius: 3, padding: "8px 12px", fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", color: "#1B2735" },
  overActions: { margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 24, textAlign: "center" },
};
