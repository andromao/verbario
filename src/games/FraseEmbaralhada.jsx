import { useState } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "frase-embaralhada";
const ACCENT = "#3E86C9";
const ROUNDS = 10;

const BANKS = {
  superbeginner: [
    { en: "I am here", pt: "Eu estou aqui" }, { en: "She is my mom", pt: "Ela é minha mãe" }, { en: "This is fun", pt: "Isso é divertido" },
    { en: "We are friends", pt: "Nós somos amigos" }, { en: "He is my dad", pt: "Ele é meu pai" }, { en: "I like dogs", pt: "Eu gosto de cachorros" },
    { en: "It is red", pt: "É vermelho" }, { en: "You are kind", pt: "Você é gentil" }, { en: "I am ten", pt: "Eu tenho dez anos" },
    { en: "This is big", pt: "Isso é grande" },
  ],
  beginner: [
    { en: "I like cats", pt: "Eu gosto de gatos" }, { en: "She is happy", pt: "Ela está feliz" }, { en: "We eat lunch", pt: "Nós almoçamos" },
    { en: "He can swim", pt: "Ele sabe nadar" }, { en: "They are here", pt: "Eles estão aqui" }, { en: "This is nice", pt: "Isso é legal" },
    { en: "I love music", pt: "Eu amo música" }, { en: "She has a dog", pt: "Ela tem um cachorro" }, { en: "We go to school", pt: "Nós vamos à escola" },
    { en: "He drinks water", pt: "Ele bebe água" },
  ],
  intermediate: [
    { en: "I like to read books", pt: "Eu gosto de ler livros" }, { en: "She works at a hospital", pt: "Ela trabalha em um hospital" },
    { en: "We are going to the beach", pt: "Nós vamos para a praia" }, { en: "He never eats breakfast", pt: "Ele nunca toma café da manhã" },
    { en: "My brother plays the guitar", pt: "Meu irmão toca violão" }, { en: "The children are playing outside", pt: "As crianças estão brincando lá fora" },
    { en: "She always arrives on time", pt: "Ela sempre chega na hora" }, { en: "We watched a movie last night", pt: "Nós assistimos a um filme ontem à noite" },
    { en: "He is learning English quickly", pt: "Ele está aprendendo inglês rapidamente" }, { en: "They live in a small house", pt: "Eles moram em uma casa pequena" },
  ],
  advanced: [
    { en: "Although it was raining we went outside", pt: "Embora estivesse chovendo, nós saímos" },
    { en: "She said that she would call me later", pt: "Ela disse que me ligaria mais tarde" },
    { en: "He works hard so that he can succeed", pt: "Ele trabalha duro para poder ter sucesso" },
    { en: "I wonder what time the movie starts tonight", pt: "Eu me pergunto que horas o filme começa hoje" },
    { en: "We should leave before the traffic gets worse", pt: "Devíamos sair antes que o trânsito piore" },
    { en: "She has been studying English for two years", pt: "Ela estuda inglês há dois anos" },
    { en: "If I had more time I would travel more", pt: "Se eu tivesse mais tempo eu viajaria mais" },
    { en: "The meeting was postponed until next week", pt: "A reunião foi adiada para a semana que vem" },
    { en: "He apologized for arriving so late", pt: "Ele se desculpou por chegar tão tarde" },
    { en: "They decided to move to another city", pt: "Eles decidiram se mudar para outra cidade" },
  ],
  expert: [
    { en: "Had I known you were coming I would have cleaned the house", pt: "Se eu soubesse que você viria, eu teria limpado a casa" },
    { en: "The book that she recommended turned out to be excellent", pt: "O livro que ela recomendou acabou sendo excelente" },
    { en: "Not only did he arrive late but he also forgot the documents", pt: "Ele não só chegou atrasado como também esqueceu os documentos" },
    { en: "Scarcely had we left when it started to rain heavily", pt: "Mal tínhamos saído quando começou a chover forte" },
    { en: "Were it not for her support I would have given up", pt: "Se não fosse pelo apoio dela, eu teria desistido" },
    { en: "It was such a difficult decision that she asked for more time", pt: "Foi uma decisão tão difícil que ela pediu mais tempo" },
    { en: "By the time you read this I will already be gone", pt: "Quando você ler isso, eu já terei ido embora" },
    { en: "Little did they know that the plan would eventually fail", pt: "Eles mal sabiam que o plano acabaria falhando" },
    { en: "She would have finished sooner had she not been interrupted", pt: "Ela teria terminado mais cedo se não tivesse sido interrompida" },
    { en: "Whatever decision you make will have long lasting consequences", pt: "Qualquer decisão que você tomar terá consequências duradouras" },
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

export default function FraseEmbaralhada({ onExit }) {
  const [level, setLevel] = useState(null);
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [pool, setPool] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [checked, setChecked] = useState(null);
  const [score, setScore] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  if (!level) {
    return (
      <LevelMenu accent={ACCENT} gameName="Frase Embaralhada" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)}
        onSelect={(l) => {
          const d = shuffle(BANKS[l]).slice(0, Math.min(ROUNDS, BANKS[l].length));
          setLevel(l); setDeck(d); setIdx(0); setPool(buildRound(d[0])); setAnswer([]); setChecked(null); setScore(0); setHintUsed(false);
        }} />
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
            <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={() => {
              const d = shuffle(BANKS[level]).slice(0, Math.min(ROUNDS, BANKS[level].length));
              setDeck(d); setIdx(0); setPool(buildRound(d[0])); setAnswer([]); setChecked(null); setScore(0); setHintUsed(false);
            }}>Jogar de novo</button>
          </div>
        </div>
      </div>
    );
  }

  const current = deck[idx];
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
    const ok = built === current.en.toLowerCase();
    setChecked(ok);
    if (ok) setScore((s) => s + (hintUsed ? 10 : 20));
  }
  function useHint() {
    if (checked === true) return;
    const correctWords = current.en.split(" ");
    const nextCorrect = correctWords[answer.length];
    if (!nextCorrect) return;
    const match = pool.find((w) => w.text.toLowerCase() === nextCorrect.toLowerCase());
    if (!match) return;
    setAnswer((a) => [...a, match]); setPool((p) => p.filter((w) => w.id !== match.id)); setChecked(null);
    setHintUsed(true);
  }
  function next() {
    const nextIdx = idx + 1;
    setIdx(nextIdx); setChecked(null); setHintUsed(false);
    if (nextIdx < deck.length) { setPool(buildRound(deck[nextIdx])); setAnswer([]); }
  }
  function changeLevel() { setLevel(null); }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={changeLevel}>← nível</button>
        <span style={{ ...styles.hudItem, color: ACCENT }}>{idx + 1}/{deck.length} · {score} pts</span>
      </div>
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
              <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={next}>{idx + 1 >= deck.length ? "Ver resultado →" : "Próxima frase →"}</button>
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
  hudItem: { fontSize: 11, fontWeight: 700 },
  card: { background: "#F7F3E9", borderRadius: 4, padding: "clamp(14px,4vw,20px) clamp(12px,4vw,18px) 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column" },
  entryNo: { fontSize: 11, letterSpacing: 1, fontWeight: 700 },
  overEyebrow: { fontSize: 11, letterSpacing: 2, color: "#9A9280" },
  intro: { fontSize: 12.5, color: "#5A6270", marginTop: 6, marginBottom: 16, lineHeight: 1.5 },
  answerRow: { display: "flex", flexWrap: "wrap", gap: 8, minHeight: 46, padding: 10, background: "#FFFFFF", border: "1.5px dashed #D8D0BC", borderRadius: 4, alignItems: "center" },
  placeholder: { fontSize: 12, color: "#B0A990" },
  poolRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 },
  wordBtn: { border: "1.5px solid", borderRadius: 20, padding: "7px 14px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  wordBtnPool: { border: "1.5px solid #D8D0BC", background: "#FFFFFF", borderRadius: 20, padding: "7px 14px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", color: "#1B2735" },
  wrongText: { fontSize: 12, color: "#C65D57", marginTop: 10 },
  actions: { marginTop: 16, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 16 },
  nextBtn: { color: "#F7F3E9", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  ghostBtn: { background: "none", border: "1.5px solid", borderRadius: 3, padding: "8px 12px", fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overActions: { marginTop: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, margin: "auto" },
};
