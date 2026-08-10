import { useState } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "preposicao-certa";
const ACCENT = "#A0692F";

const BANKS = {
  superbeginner: [
    { before: "The cat is", after: "the table.", answer: "on", options: ["on", "in", "at", "under"], pt: "O gato está na mesa." },
    { before: "I live", after: "Brazil.", answer: "in", options: ["in", "on", "at", "to"], pt: "Eu moro no Brasil." },
    { before: "She is", after: "home.", answer: "at", options: ["at", "in", "on", "to"], pt: "Ela está em casa." },
    { before: "The book is", after: "the bag.", answer: "in", options: ["in", "on", "at", "under"], pt: "O livro está na bolsa." },
    { before: "We go", after: "school.", answer: "to", options: ["to", "at", "in", "on"], pt: "Nós vamos à escola." },
    { before: "The ball is", after: "the box.", answer: "under", options: ["under", "on", "at", "to"], pt: "A bola está embaixo da caixa." },
    { before: "I wake up", after: "7am.", answer: "at", options: ["at", "in", "on", "to"], pt: "Eu acordo às 7h." },
    { before: "My birthday is", after: "May.", answer: "in", options: ["in", "on", "at", "to"], pt: "Meu aniversário é em maio." },
    { before: "The dog is", after: "the door.", answer: "behind", options: ["behind", "in", "at", "to"], pt: "O cachorro está atrás da porta." },
    { before: "She sits", after: "me.", answer: "next to", options: ["next to", "in", "at", "on"], pt: "Ela senta ao meu lado." },
  ],
  beginner: [
    { before: "The meeting is", after: "Monday.", answer: "on", options: ["on", "in", "at", "to"], pt: "A reunião é na segunda." },
    { before: "We arrived", after: "the airport.", answer: "at", options: ["at", "in", "on", "to"], pt: "Nós chegamos no aeroporto." },
    { before: "She's been waiting", after: "an hour.", answer: "for", options: ["for", "since", "during", "at"], pt: "Ela está esperando há uma hora." },
    { before: "He's good", after: "math.", answer: "at", options: ["at", "in", "on", "for"], pt: "Ele é bom em matemática." },
    { before: "I'm afraid", after: "spiders.", answer: "of", options: ["of", "from", "at", "for"], pt: "Eu tenho medo de aranhas." },
    { before: "The store closes", after: "9pm.", answer: "at", options: ["at", "in", "on", "to"], pt: "A loja fecha às 21h." },
    { before: "She's married", after: "a doctor.", answer: "to", options: ["to", "with", "at", "for"], pt: "Ela é casada com um médico." },
    { before: "I'm looking", after: "my keys.", answer: "for", options: ["for", "at", "to", "of"], pt: "Estou procurando minhas chaves." },
    { before: "We walked", after: "the park.", answer: "through", options: ["through", "at", "on", "for"], pt: "Nós caminhamos pelo parque." },
    { before: "He apologized", after: "being late.", answer: "for", options: ["for", "of", "at", "to"], pt: "Ele se desculpou por chegar atrasado." },
  ],
  intermediate: [
    { before: "She's responsible", after: "the whole project.", answer: "for", options: ["for", "of", "with", "at"], pt: "Ela é responsável pelo projeto todo." },
    { before: "He's not interested", after: "sports.", answer: "in", options: ["in", "at", "for", "on"], pt: "Ele não tem interesse em esportes." },
    { before: "This is similar", after: "what we discussed.", answer: "to", options: ["to", "with", "as", "for"], pt: "Isso é parecido com o que discutimos." },
    { before: "They've been together", after: "five years.", answer: "for", options: ["for", "since", "during", "at"], pt: "Eles estão juntos há cinco anos." },
    { before: "I disagree", after: "your point.", answer: "with", options: ["with", "of", "for", "to"], pt: "Eu discordo do seu ponto." },
    { before: "She's proud", after: "her achievements.", answer: "of", options: ["of", "with", "for", "at"], pt: "Ela tem orgulho das conquistas dela." },
    { before: "He apologized", after: "his mistake.", answer: "for", options: ["for", "of", "with", "about"], pt: "Ele se desculpou pelo erro." },
    { before: "We depend", after: "each other.", answer: "on", options: ["on", "of", "for", "with"], pt: "Nós dependemos um do outro." },
    { before: "This differs", after: "the previous version.", answer: "from", options: ["from", "of", "with", "to"], pt: "Isso difere da versão anterior." },
    { before: "She insisted", after: "paying the bill.", answer: "on", options: ["on", "in", "for", "at"], pt: "Ela insistiu em pagar a conta." },
  ],
  advanced: [
    { before: "The committee is composed", after: "twelve members.", answer: "of", options: ["of", "from", "by", "with"], pt: "O comitê é composto por doze membros." },
    { before: "She was accused", after: "lying.", answer: "of", options: ["of", "for", "with", "about"], pt: "Ela foi acusada de mentir." },
    { before: "He's known", after: "his honesty.", answer: "for", options: ["for", "of", "by", "with"], pt: "Ele é conhecido pela sua honestidade." },
    { before: "The results are consistent", after: "our hypothesis.", answer: "with", options: ["with", "to", "for", "of"], pt: "Os resultados são consistentes com nossa hipótese." },
    { before: "She's determined to succeed, regardless", after: "the obstacles.", answer: "of", options: ["of", "from", "with", "for"], pt: "Ela está determinada a ter sucesso, independente dos obstáculos." },
    { before: "The decision was based", after: "solid evidence.", answer: "on", options: ["on", "in", "for", "of"], pt: "A decisão foi baseada em evidências sólidas." },
    { before: "He's oblivious", after: "the risks involved.", answer: "to", options: ["to", "of", "for", "about"], pt: "Ele está alheio aos riscos envolvidos." },
    { before: "This approach is superior", after: "the old one.", answer: "to", options: ["to", "than", "of", "over"], pt: "Essa abordagem é superior à antiga." },
    { before: "The findings are subject", after: "further review.", answer: "to", options: ["to", "of", "for", "with"], pt: "Os resultados estão sujeitos a mais revisão." },
    { before: "She's committed", after: "improving the process.", answer: "to", options: ["to", "for", "of", "with"], pt: "Ela está comprometida em melhorar o processo." },
  ],
  expert: [
    { before: "The report is contingent", after: "the data being accurate.", answer: "on", options: ["on", "of", "to", "with"], pt: "O relatório depende dos dados serem precisos." },
    { before: "His argument is at odds", after: "the evidence presented.", answer: "with", options: ["with", "to", "of", "against"], pt: "O argumento dele contradiz as evidências apresentadas." },
    { before: "She's adept", after: "handling difficult clients.", answer: "at", options: ["at", "in", "with", "for"], pt: "Ela é habilidosa em lidar com clientes difíceis." },
    { before: "The policy is aimed", after: "reducing waste.", answer: "at", options: ["at", "to", "for", "on"], pt: "A política visa reduzir o desperdício." },
    { before: "This theory is grounded", after: "empirical research.", answer: "in", options: ["in", "on", "with", "by"], pt: "Essa teoria é fundamentada em pesquisa empírica." },
    { before: "He's indifferent", after: "the outcome.", answer: "to", options: ["to", "of", "about", "for"], pt: "Ele é indiferente ao resultado." },
    { before: "The proposal was met", after: "resistance.", answer: "with", options: ["with", "by", "of", "for"], pt: "A proposta foi recebida com resistência." },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function PreposicaoCerta({ onExit }) {
  const [level, setLevel] = useState(null);
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [eliminated, setEliminated] = useState(new Set());
  const [score, setScore] = useState(0);

  if (!level) {
    return (
      <LevelMenu accent={ACCENT} gameName="Preposição Certa" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)}
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
        <span style={{ ...styles.entryNo, color: ACCENT }}>PREPOSIÇÃO CERTA</span>
        {!finished ? (
          <>
            <p style={styles.sentence}>{item.before} <span style={styles.blank}>{picked || "___"}</span> {item.after}</p>
            <p style={styles.hint}>Dica: {item.pt}</p>
            <div style={styles.options}>
              {item.options.map((opt) => {
                if (eliminated.has(opt)) return null;
                const isCorrect = opt === item.answer, isPicked = picked === opt;
                let bg = "#FFFFFF", border = "#D8D0BC", color = "#1B2735";
                if (picked) { if (isCorrect) { bg = "#F3EBDF"; border = ACCENT; color = "#6B4A1F"; } else if (isPicked) { bg = "#F4E4E2"; border = "#C65D57"; color = "#8B3E38"; } }
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
  sentence: { fontFamily: "'Fraunces', serif", fontSize: 18, color: "#1B2735", marginTop: 16, lineHeight: 1.5 },
  blank: { color: "#A0692F", fontWeight: 700, borderBottom: "2px solid #A0692F" },
  hint: { fontSize: 12.5, color: "#8B7F5F", fontStyle: "italic", marginTop: 4 },
  options: { display: "flex", flexDirection: "column", gap: 9, marginTop: 16 },
  optBtn: { textAlign: "left", padding: "12px 14px", borderRadius: 3, border: "1.5px solid", fontSize: 14.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  ghostBtn: { background: "none", border: "1.5px solid #D8D0BC", borderRadius: 3, padding: "8px 12px", fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", color: "#1B2735" },
  nextBtn: { color: "#FFFFFF", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overActions: { margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 22, textAlign: "center" },
};
