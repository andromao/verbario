import { useState } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "plural-singular";
const ACCENT = "#3F7D8C";

const BANKS = {
  superbeginner: [
    { word: "cat", type: "plural", answer: "cats", options: ["cats", "cates", "catss", "caties"], pt: "gato → gatos" },
    { word: "dog", type: "plural", answer: "dogs", options: ["dogs", "doges", "dogies", "dogen"], pt: "cachorro → cachorros" },
    { word: "book", type: "plural", answer: "books", options: ["books", "bookes", "bookies", "bookz"], pt: "livro → livros" },
    { word: "hats", type: "singular", answer: "hat", options: ["hat", "hate", "hatting", "hates"], pt: "chapéus → chapéu" },
    { word: "cars", type: "singular", answer: "car", options: ["car", "care", "carr", "cares"], pt: "carros → carro" },
    { word: "pen", type: "plural", answer: "pens", options: ["pens", "penes", "penies", "penz"], pt: "caneta → canetas" },
    { word: "toys", type: "singular", answer: "toy", options: ["toy", "toye", "toi", "toying"], pt: "brinquedos → brinquedo" },
    { word: "cup", type: "plural", answer: "cups", options: ["cups", "cupes", "cupies", "cupz"], pt: "xícara → xícaras" },
    { word: "eggs", type: "singular", answer: "egg", options: ["egg", "egge", "eg", "egges"], pt: "ovos → ovo" },
    { word: "star", type: "plural", answer: "stars", options: ["stars", "starres", "staries", "starz"], pt: "estrela → estrelas" },
  ],
  beginner: [
    { word: "box", type: "plural", answer: "boxes", options: ["boxes", "boxs", "boxies", "boxen"], pt: "caixa → caixas (termina em -x, adiciona -es)" },
    { word: "church", type: "plural", answer: "churches", options: ["churches", "churchs", "churchies", "churchen"], pt: "igreja → igrejas (termina em -ch, adiciona -es)" },
    { word: "baby", type: "plural", answer: "babies", options: ["babies", "babys", "babyes", "babyies"], pt: "bebê → bebês (y vira -ies)" },
    { word: "leaf", type: "plural", answer: "leaves", options: ["leaves", "leafs", "leafes", "leaveies"], pt: "folha → folhas (f vira -ves)" },
    { word: "man", type: "plural", answer: "men", options: ["men", "mans", "manes", "mens"], pt: "homem → homens (irregular)" },
    { word: "child", type: "plural", answer: "children", options: ["children", "childs", "childes", "childies"], pt: "criança → crianças (irregular)" },
    { word: "tomatoes", type: "singular", answer: "tomato", options: ["tomato", "tomatoe", "tomatos", "tomate"], pt: "tomates → tomate" },
    { word: "students", type: "singular", answer: "student", options: ["student", "studente", "studen", "studentie"], pt: "estudantes → estudante" },
    { word: "foot", type: "plural", answer: "feet", options: ["feet", "foots", "footes", "feets"], pt: "pé → pés (irregular)" },
    { word: "sister", type: "plural", answer: "sisters", options: ["sisters", "sisteres", "sistries", "sisterz"], pt: "irmã → irmãs" },
  ],
  intermediate: [
    { word: "mouse", type: "plural", answer: "mice", options: ["mice", "mouses", "mices", "mouse"], pt: "rato → ratos (irregular)" },
    { word: "tooth", type: "plural", answer: "teeth", options: ["teeth", "tooths", "toothes", "teeths"], pt: "dente → dentes (irregular)" },
    { word: "person", type: "plural", answer: "people", options: ["people", "persons", "peoples", "personies"], pt: "pessoa → pessoas (irregular)" },
    { word: "knife", type: "plural", answer: "knives", options: ["knives", "knifes", "knifs", "kniveies"], pt: "faca → facas (f vira -ves)" },
    { word: "class", type: "plural", answer: "classes", options: ["classes", "class's", "classies", "classen"], pt: "turma → turmas (termina em -ss, adiciona -es)" },
    { word: "wolf", type: "plural", answer: "wolves", options: ["wolves", "wolfs", "wolfes", "wolveies"], pt: "lobo → lobos (f vira -ves)" },
    { word: "series", type: "singular", answer: "series", options: ["series", "serie", "seriess", "serieses"], pt: "série(s) → série (invariável)" },
    { word: "sheep", type: "singular", answer: "sheep", options: ["sheep", "sheeps", "sheepe", "sheepies"], pt: "ovelha(s) → ovelha (invariável)" },
    { word: "half", type: "plural", answer: "halves", options: ["halves", "halfs", "halfes", "halveies"], pt: "metade → metades (f vira -ves)" },
    { word: "cactus", type: "plural", answer: "cacti", options: ["cacti", "cactuses", "cactus", "cactusi"], pt: "cacto → cactos (origem latina)" },
  ],
  advanced: [
    { word: "criterion", type: "plural", answer: "criteria", options: ["criteria", "criterions", "criterias", "criterion"], pt: "critério → critérios (origem grega)" },
    { word: "phenomenon", type: "plural", answer: "phenomena", options: ["phenomena", "phenomenons", "phenomenas", "phenomenon"], pt: "fenômeno → fenômenos (origem grega)" },
    { word: "analyses", type: "singular", answer: "analysis", options: ["analysis", "analysi", "analyse", "analysies"], pt: "análises → análise" },
    { word: "crisis", type: "plural", answer: "crises", options: ["crises", "crisises", "crisis's", "crisies"], pt: "crise → crises (origem grega)" },
    { word: "index", type: "plural", answer: "indices", options: ["indices", "indexes", "indicies", "index"], pt: "índice → índices (também aceito 'indexes')" },
    { word: "focus", type: "plural", answer: "foci", options: ["foci", "focuses", "focusi", "focus"], pt: "foco → focos (origem latina)" },
    { word: "syllabus", type: "plural", answer: "syllabi", options: ["syllabi", "syllabuses", "syllabusi", "syllabus"], pt: "ementa → ementas (origem grega)" },
    { word: "bacteria", type: "singular", answer: "bacterium", options: ["bacterium", "bacteria", "bacterius", "bacteriae"], pt: "bactérias → bactéria" },
    { word: "datum", type: "plural", answer: "data", options: ["data", "datums", "datas", "datum"], pt: "dado → dados (origem latina)" },
    { word: "thesis", type: "plural", answer: "theses", options: ["theses", "thesises", "thesis's", "thesies"], pt: "tese → teses (origem grega)" },
  ],
  expert: [
    { word: "appendix", type: "plural", answer: "appendices", options: ["appendices", "appendixes", "appendicies", "appendix"], pt: "apêndice → apêndices (também aceito 'appendixes')" },
    { word: "alumnus", type: "plural", answer: "alumni", options: ["alumni", "alumnuses", "alumnae", "alumnus"], pt: "ex-aluno → ex-alunos (origem latina, masculino)" },
    { word: "vertex", type: "plural", answer: "vertices", options: ["vertices", "vertexes", "verticies", "vertex"], pt: "vértice → vértices" },
    { word: "matrices", type: "singular", answer: "matrix", options: ["matrix", "matrice", "matricie", "matrixe"], pt: "matrizes → matriz" },
    { word: "millennium", type: "plural", answer: "millennia", options: ["millennia", "millenniums", "millennias", "millennium"], pt: "milênio → milênios" },
    { word: "hypothesis", type: "plural", answer: "hypotheses", options: ["hypotheses", "hypothesises", "hypothesis's", "hypothesies"], pt: "hipótese → hipóteses" },
    { word: "stimulus", type: "plural", answer: "stimuli", options: ["stimuli", "stimuluses", "stimulusi", "stimulus"], pt: "estímulo → estímulos" },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function PluralSingular({ onExit }) {
  const [level, setLevel] = useState(null);
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [eliminated, setEliminated] = useState(new Set());
  const [score, setScore] = useState(0);

  if (!level) {
    return (
      <LevelMenu accent={ACCENT} gameName="Plural e Singular" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)}
        onSelect={(l) => { setLevel(l); setOrder(shuffle(BANKS[l].map((_, i) => i))); setIdx(0); setPicked(null); setEliminated(new Set()); setScore(0); }} />
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
        <span style={{ ...styles.entryNo, color: ACCENT }}>PLURAL E SINGULAR</span>
        {!finished ? (
          <>
            <p style={styles.prompt}>Qual é o <b>{item.type === "plural" ? "plural" : "singular"}</b> de:</p>
            <h1 style={styles.headword}>{item.word}</h1>
            <p style={styles.hint}>{item.pt}</p>
            <div style={styles.options}>
              {item.options.map((opt) => {
                if (eliminated.has(opt)) return null;
                const isCorrect = opt === item.answer, isPicked = picked === opt;
                let bg = "#FFFFFF", border = "#D8D0BC", color = "#1B2735";
                if (picked) { if (isCorrect) { bg = "#E7EEF0"; border = ACCENT; color = "#234A54"; } else if (isPicked) { bg = "#F4E4E2"; border = "#C65D57"; color = "#8B3E38"; } }
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
  card: { background: "#F7F3E9", borderRadius: 4, padding: "clamp(14px,4vw,20px) clamp(12px,4vw,20px) 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", display: "flex", flexDirection: "column" },
  entryNo: { fontSize: 11, letterSpacing: 1, fontWeight: 700 },
  prompt: { fontSize: 13, color: "#5A6270", marginTop: 16 },
  headword: { fontFamily: "'Fraunces', serif", fontSize: 32, margin: "4px 0 0", color: "#1B2735", fontWeight: 700 },
  hint: { fontSize: 11.5, color: "#8B7F5F", fontStyle: "italic", marginTop: 4 },
  options: { display: "flex", flexDirection: "column", gap: 9, marginTop: 18 },
  optBtn: { textAlign: "left", padding: "12px 14px", borderRadius: 3, border: "1.5px solid", fontSize: 14.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  ghostBtn: { background: "none", border: "1.5px solid #D8D0BC", borderRadius: 3, padding: "8px 12px", fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", color: "#1B2735" },
  nextBtn: { color: "#FFFFFF", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overActions: { margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 22, textAlign: "center" },
};
