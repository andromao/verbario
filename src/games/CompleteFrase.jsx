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
    { before: "He", after: "a dog.", answer: "has", options: ["has", "have", "is", "am"], pt: "Ele tem um cachorro." },
    { before: "You", after: "my brother.", answer: "are", options: ["is", "am", "are", "be"], pt: "Você é meu irmão." },
    { before: "It", after: "a red car.", answer: "is", options: ["am", "is", "are", "be"], pt: "É um carro vermelho." },
    { before: "They", after: "hungry.", answer: "are", options: ["is", "am", "are", "be"], pt: "Eles estão com fome." },
    { before: "I", after: "ten years old.", answer: "am", options: ["am", "is", "are", "be"], pt: "Eu tenho dez anos." },
    { before: "The sun", after: "hot.", answer: "is", options: ["am", "is", "are", "be"], pt: "O sol é quente." },
  ],
  beginner: [
    { before: "I", after: "a student.", answer: "am", options: ["am", "is", "are", "be"], pt: "Eu sou estudante." },
    { before: "She", after: "happy.", answer: "is", options: ["am", "is", "are", "be"], pt: "Ela está feliz." },
    { before: "They", after: "from Brazil.", answer: "are", options: ["is", "am", "are", "be"], pt: "Eles são do Brasil." },
    { before: "He", after: "a doctor.", answer: "is", options: ["am", "is", "are", "be"], pt: "Ele é médico." },
    { before: "We", after: "to the park every Sunday.", answer: "go", options: ["go", "goes", "going", "went"], pt: "Nós vamos ao parque todo domingo." },
    { before: "My mother", after: "dinner right now.", answer: "is cooking", options: ["cook", "cooks", "is cooking", "cooked"], pt: "Minha mãe está cozinhando o jantar agora." },
    { before: "I", after: "coffee every morning.", answer: "drink", options: ["drink", "drinks", "drinking", "drank"], pt: "Eu bebo café toda manhã." },
    { before: "The dog", after: "in the garden.", answer: "is playing", options: ["play", "plays", "is playing", "played"], pt: "O cachorro está brincando no jardim." },
    { before: "She", after: "two brothers.", answer: "has", options: ["has", "have", "is", "am"], pt: "Ela tem dois irmãos." },
    { before: "We", after: "very tired yesterday.", answer: "were", options: ["are", "were", "was", "be"], pt: "Nós estávamos muito cansados ontem." },
  ],
  intermediate: [
    { before: "She", after: "to school every day.", answer: "goes", options: ["go", "goes", "going", "gone"], pt: "Ela vai à escola todos os dias." },
    { before: "They", after: "watching a movie right now.", answer: "are", options: ["is", "are", "was", "be"], pt: "Eles estão assistindo a um filme agora." },
    { before: "He", after: "harder than anyone else on the team.", answer: "works", options: ["work", "works", "working", "worked"], pt: "Ele trabalha mais duro do que qualquer um no time." },
    { before: "The keys", after: "on the table.", answer: "are", options: ["is", "are", "was", "be"], pt: "As chaves estão na mesa." },
    { before: "Yesterday, I", after: "a great movie.", answer: "watched", options: ["watch", "watches", "watching", "watched"], pt: "Ontem eu assisti a um filme ótimo." },
    { before: "She", after: "in London for three years.", answer: "has lived", options: ["lives", "lived", "has lived", "is living"], pt: "Ela mora em Londres há três anos." },
    { before: "By next year, he", after: "his degree.", answer: "will finish", options: ["finishes", "will finish", "finished", "is finishing"], pt: "No próximo ano, ele terá terminado a faculdade." },
    { before: "While I", after: "dinner, the phone rang.", answer: "was cooking", options: ["cook", "cooked", "was cooking", "cooks"], pt: "Enquanto eu cozinhava o jantar, o telefone tocou." },
    { before: "This is the book", after: "I told you about.", answer: "that", options: ["who", "that", "whose", "which one"], pt: "Este é o livro que eu te falei." },
    { before: "You", after: "study harder if you want to pass.", answer: "should", options: ["should", "would", "could", "must not"], pt: "Você deveria estudar mais se quiser passar." },
  ],
  advanced: [
    { before: "I", after: "never been to Japan.", answer: "have", options: ["has", "have", "had", "having"], pt: "Eu nunca fui ao Japão." },
    { before: "We", after: "dinner when you called.", answer: "were having", options: ["have", "had", "were having", "has"], pt: "Nós estávamos jantando quando você ligou." },
    { before: "My parents", after: "married for twenty years.", answer: "have been", options: ["are", "were", "have been", "had"], pt: "Meus pais estão casados há vinte anos." },
    { before: "If it", after: "tomorrow, we'll stay home.", answer: "rains", options: ["rain", "rains", "rained", "raining"], pt: "Se chover amanhã, ficaremos em casa." },
    { before: "She", after: "the report by the time you arrive.", answer: "will have finished", options: ["finishes", "will finish", "will have finished", "had finished"], pt: "Ela terá terminado o relatório quando você chegar." },
    { before: "I wish I", after: "more time to study.", answer: "had", options: ["have", "had", "has", "having"], pt: "Eu gostaria de ter mais tempo pra estudar." },
    { before: "The bridge", after: "by workers last year.", answer: "was built", options: ["built", "was built", "has built", "is building"], pt: "A ponte foi construída por trabalhadores no ano passado." },
    { before: "Had I known earlier, I", after: "differently.", answer: "would have acted", options: ["act", "would act", "would have acted", "acted"], pt: "Se eu tivesse sabido antes, eu teria agido diferente." },
    { before: "She insisted that he", after: "the meeting.", answer: "attend", options: ["attends", "attend", "attended", "attending"], pt: "Ela insistiu que ele comparecesse à reunião." },
    { before: "Not until she apologized", after: "he forgive her.", answer: "did", options: ["did", "does", "had", "would"], pt: "Só depois que ela pediu desculpas ele a perdoou." },
  ],
  expert: [
    { before: "If I", after: "known, I would have told you.", answer: "had", options: ["have", "had", "has", "having"], pt: "Se eu tivesse sabido, eu teria te contado." },
    { before: "By the time we arrive, the show", after: "already started.", answer: "will have", options: ["will", "will have", "would have", "has"], pt: "Quando chegarmos, o show já terá começado." },
    { before: "Not only was she late, but she", after: "forgotten her keys.", answer: "had also", options: ["also had", "had also", "also has", "has also"], pt: "Ela não só se atrasou como também esqueceu as chaves." },
    { before: "Were it not for your help, I", after: "have finished this.", answer: "wouldn't", options: ["wouldn't", "couldn't have", "don't", "hadn't"], pt: "Se não fosse pela sua ajuda, eu não teria terminado isso." },
    { before: "Scarcely had she arrived", after: "the phone started ringing.", answer: "when", options: ["when", "than", "then", "before"], pt: "Mal ela havia chegado quando o telefone começou a tocar." },
    { before: "It is essential that he", after: "on time.", answer: "be", options: ["is", "be", "was", "being"], pt: "É essencial que ele esteja pontual." },
    { before: "She would rather I", after: "her tomorrow.", answer: "called", options: ["call", "called", "calls", "calling"], pt: "Ela prefere que eu ligue pra ela amanhã." },
    { before: "The project, ___ deadline was extended, is finally complete.", after: "", answer: "whose", options: ["which", "whose", "that", "who's"], pt: "O projeto, cujo prazo foi estendido, está finalmente completo." },
    { before: "Little did they know", after: "trouble awaited them.", answer: "what", options: ["that", "what", "how", "which"], pt: "Eles mal sabiam que problemas os aguardavam." },
    { before: "So exhausted", after: "she fell asleep instantly.", answer: "was she that", options: ["she was that", "was she that", "that she was", "she was so"], pt: "Ela estava tão exausta que adormeceu na hora." },
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
