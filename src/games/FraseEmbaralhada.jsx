import { useState } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "frase-embaralhada";
const ACCENT = "#3E86C9";

const BANKS = {
  superbeginner: [
    { en: "I am here", pt: "Eu estou aqui" }, { en: "She is my mom", pt: "Ela é minha mãe" }, { en: "This is fun", pt: "Isso é divertido" }, { en: "We are friends", pt: "Nós somos amigos" },
  ],
  beginner: [
    { en: "I like cats", pt: "Eu gosto de gatos" }, { en: "She is happy", pt: "Ela está feliz" }, { en: "We eat lunch", pt: "Nós almoçamos" },
    { en: "He can swim", pt: "Ele sabe nadar" }, { en: "They are here", pt: "Eles estão aqui" }, { en: "This is nice", pt: "Isso é legal" },
  ],
  intermediate: [
    { en: "I like to read books", pt: "Eu gosto de ler livros" }, { en: "She works at a hospital", pt: "Ela trabalha em um hospital" },
    { en: "We are going to the beach", pt: "Nós vamos para a praia" }, { en: "He never eats breakfast", pt: "Ele nunca toma café da manhã" },
    { en: "My brother plays the guitar", pt: "Meu irmão toca violão" }, { en: "The children are playing outside", pt: "As crianças estão brincando lá fora" },
  ],
  advanced: [
    { en: "Although it was raining we went outside", pt: "Embora estivesse chovendo, nós saímos" },
    { en: "She said that she would call me later", pt: "Ela disse que me ligaria mais tarde" },
    { en: "He works hard so that he can succeed", pt: "Ele trabalha duro para poder ter sucesso" },
    { en: "I wonder what time the movie starts tonight", pt: "Eu me pergunto que horas o filme começa hoje" },
  ],
  expert: [
    { en: "Had I known you were coming I would have cleaned the house", pt: "Se eu soubesse que você viria, eu teria limpado a casa" },
    { en: "The book that she recommended turned out to be excellent", pt: "O livro que ela recomendou acabou sendo excelente" },
    { en: "Not only did he arrive late but he also forgot the documents", pt: "Ele não só chegou atrasado como também esqueceu os documentos" },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function buildRound(sentence) {
  return shuffle(sentence.en.split(" ").map((w, i) => ({ id: `${i}-${w}`, text: w })));
}
function pickSentence(list, excludeEn) {
  const pool = list.filter((s) => s.en !== excludeEn);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function FraseEmbaralhada({ onExit }) {
  const [level, setLevel] = useState(null);
  const [current, setCurrent] = useState(null);
  const [pool, setPool] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [checked, setChecked] = useState(null);

  if (!level) {
    return (
      <LevelMenu accent={ACCENT} gameName="Frase Embaralhada" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)}
        onSelect={(l) => { const s = pickSentence(BANKS[l], null); setLevel(l); setCurrent(s); setPool(buildRound(s)); setAnswer([]); setChecked(null); }} />
    );
  }

  if (checked === true && level === "advanced") unlockExpert(GAME_ID);

  function addToAnswer(word) {
    if (checked) return;
    setAnswer((a) => [...a, word]); setPool((p) => p.filter((w) => w.id !== word.id)); setChecked(null);
  }
  function removeFromAnswer(word) {
    if (checked === true) return;
    setAnswer((a) => a.filter((w) => w.id !== word.id)); setPool((p) => [...p, word]); setChecked(null);
  }
  function verify() {
    const built = answer.map((w) => w.text).join(" ").toLowerCase();
    setChecked(built === current.en.toLowerCase());
  }
  function useHint() {
    if (checked === true) return;
    const correctWords = current.en.split(" ");
    const nextCorrect = correctWords[answer.length];
    if (!nextCorrect) return;
    const match = pool.find((w) => w.text.toLowerCase() === nextCorrect.toLowerCase());
    if (!match) return;
    setAnswer((a) => [...a, match]); setPool((p) => p.filter((w) => w.id !== match.id)); setChecked(null);
  }
  function nextSentence() {
    const s = pickSentence(BANKS[level], current.en);
    setCurrent(s); setPool(buildRound(s)); setAnswer([]); setChecked(null);
  }
  function changeLevel() { setLevel(null); }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}><button style={styles.backBtn} onClick={changeLevel}>← nível</button></div>
      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: ACCENT }}>FRASE EMBARALHADA</span>
        <p style={styles.intro}>Toque nas palavras na ordem certa para formar a frase. Dica: {current.pt}</p>
        <div style={styles.answerRow}>
          {answer.length === 0 && <span style={styles.placeholder}>toque nas palavras abaixo…</span>}
          {answer.map((w) => (
            <button key={w.id} onClick={() => removeFromAnswer(w)} style={{ ...styles.wordBtn, background: "#FFFFFF", borderColor: checked === true ? "#6B9080" : checked === false ? "#C65D57" : ACCENT, color: "#1B2735" }}>{w.text}</button>
          ))}
        </div>
        <div style={styles.poolRow}>
          {pool.map((w) => <button key={w.id} onClick={() => addToAnswer(w)} style={styles.wordBtnPool}>{w.text}</button>)}
        </div>
        {checked === false && <p style={styles.wrongText}>Ainda não é isso — reorganize e tente de novo.</p>}
        <div style={styles.actions}>
          {checked !== true && pool.length > 0 && (
            <button style={{ ...styles.ghostBtn, borderColor: ACCENT, color: ACCENT }} onClick={useHint}>💡 Próxima palavra certa</button>
          )}
          {pool.length === 0 && checked !== true && <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={verify}>Verificar</button>}
          {checked === true && (
            <>
              <span style={{ ...styles.doneText, color: ACCENT }}>Certinho! 🎉{level === "advanced" ? " Nível Mestre destravado!" : ""}</span>
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
  ghostBtn: { background: "none", border: "1.5px solid", borderRadius: 3, padding: "8px 12px", fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  wrongText: { fontSize: 12, color: "#C65D57", marginTop: 10 },
  actions: { marginTop: 16, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 16 },
  nextBtn: { color: "#F7F3E9", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
};
