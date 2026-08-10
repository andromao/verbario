import { useState } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "ordene-dialogo";
const ACCENT = "#B0629A";
const ROUNDS = 10;

const BANKS = {
  superbeginner: [
    { lines: ["Hi!", "Hi! How are you?", "I am fine, thanks."], pt: "Cumprimento simples" },
    { lines: ["What is your name?", "My name is Ana.", "Nice to meet you!"], pt: "Se apresentando" },
    { lines: ["Do you like pizza?", "Yes, I do!", "Me too!"], pt: "Falando sobre gostos" },
    { lines: ["Goodbye!", "Bye! See you soon.", "See you!"], pt: "Se despedindo" },
    { lines: ["Is this your bag?", "Yes, it is.", "Here you go."], pt: "Perguntando sobre objetos" },
    { lines: ["How old are you?", "I am ten.", "Wow, same age as me!"], pt: "Falando sobre idade" },
    { lines: ["Where are you from?", "I am from Brazil.", "Cool! I love Brazil."], pt: "Falando de onde é" },
    { lines: ["Thank you!", "You're welcome!", "Have a nice day."], pt: "Agradecendo" },
    { lines: ["What color is it?", "It is blue.", "I like blue too."], pt: "Falando sobre cores" },
    { lines: ["Can you help me?", "Sure, what do you need?", "Thank you so much!"], pt: "Pedindo ajuda" },
  ],
  beginner: [
    { lines: ["Excuse me, where is the bank?", "It's two blocks from here.", "Thank you very much!"], pt: "Pedindo direções" },
    { lines: ["Would you like some coffee?", "Yes, please.", "Here you go."], pt: "Oferecendo algo" },
    { lines: ["How was your weekend?", "It was great, thanks!", "Glad to hear that."], pt: "Perguntando sobre o final de semana" },
    { lines: ["Do you want to grab lunch?", "Sure, I'm starving.", "Let's go then!"], pt: "Convidando pra almoçar" },
    { lines: ["What time is it?", "It's three o'clock.", "Oh, I need to go!"], pt: "Perguntando as horas" },
    { lines: ["Sorry, I'm late!", "No worries, don't stress.", "Thanks for understanding."], pt: "Se desculpando por atraso" },
    { lines: ["How much does this cost?", "It's ten dollars.", "I'll take it."], pt: "Perguntando o preço" },
    { lines: ["Can I get your phone number?", "Sure, it's 555-0192.", "Great, I'll call you later."], pt: "Pedindo telefone" },
    { lines: ["Are you free tonight?", "Yes, I am.", "Let's meet up then."], pt: "Combinando um encontro" },
    { lines: ["What do you do for a living?", "I'm a teacher.", "That sounds rewarding!"], pt: "Perguntando profissão" },
  ],
  intermediate: [
    { lines: ["I'm thinking about switching careers.", "What's holding you back?", "I guess I'm just scared of change."], pt: "Falando sobre mudança de carreira" },
    { lines: ["I heard you got a promotion!", "Yeah, I'm really excited.", "You totally deserve it."], pt: "Comemorando uma promoção" },
    { lines: ["Do you mind if I open the window?", "Not at all, go ahead.", "Thanks, it's a bit stuffy in here."], pt: "Pedindo permissão" },
    { lines: ["The flight got delayed again.", "That's so frustrating.", "I know, we've been waiting for hours."], pt: "Reclamando de um atraso" },
    { lines: ["Have you tried the new restaurant downtown?", "Not yet, is it good?", "It's amazing, you should go."], pt: "Recomendando um restaurante" },
    { lines: ["I can't decide what to wear tonight.", "Just go with the blue shirt.", "Good idea, thanks!"], pt: "Pedindo ajuda pra escolher roupa" },
    { lines: ["Sorry to bother you, but do you have a minute?", "Of course, what's up?", "I need some advice."], pt: "Pedindo um minuto de atenção" },
    { lines: ["I'm not sure which route to take.", "Let's check the map.", "Good idea, one second."], pt: "Decidindo um caminho" },
    { lines: ["Would you rather eat in or order takeout?", "Let's just order takeout.", "Sounds good to me."], pt: "Decidindo o jantar" },
    { lines: ["I've been feeling really stressed lately.", "Do you want to talk about it?", "Yeah, actually, I do."], pt: "Falando sobre estresse" },
  ],
  advanced: [
    { lines: ["I've been meaning to bring this up, but I feel like we're not on the same page.", "I agree, let's set up a time to align on expectations.", "That would really help, thank you."], pt: "Alinhando expectativas no trabalho" },
    { lines: ["Honestly, I'm a bit overwhelmed with everything going on right now.", "That makes sense — is there anything I can take off your plate?", "Actually, yes, that would mean a lot."], pt: "Pedindo ajuda quando sobrecarregado" },
    { lines: ["I'm torn between accepting the job offer and staying where I am.", "What matters most to you in this decision?", "I think it's about long-term growth."], pt: "Decidindo sobre uma proposta de emprego" },
    { lines: ["To be fair, I don't think that criticism was entirely warranted.", "You might have a point — let's revisit it calmly.", "I appreciate you hearing me out."], pt: "Discutindo uma crítica" },
    { lines: ["I keep putting off this decision because I'm afraid of making the wrong call.", "It's okay, take your time — what's the worst that could happen?", "I guess it's not as bad as I think."], pt: "Superando o medo de decidir" },
    { lines: ["Between you and me, I don't think this plan is going to work out.", "What makes you say that?", "The timeline just seems unrealistic."], pt: "Compartilhando uma preocupação" },
    { lines: ["I really appreciate you being upfront with me about this.", "Of course — I'd rather be honest than comfortable.", "That means a lot, thank you."], pt: "Agradecendo por honestidade" },
    { lines: ["I've been putting off this conversation for weeks now.", "I'm glad we're finally having it.", "Me too, it feels like a relief."], pt: "Finalmente tendo uma conversa difícil" },
  ],
  expert: [
    { lines: ["I don't mean to second-guess your judgment, but have you weighed the long-term implications of this?", "That's a fair point — let's map out the potential outcomes together.", "I appreciate you being open to that."], pt: "Questionando uma decisão com cuidado" },
    { lines: ["There's an underlying tension here that I think we ought to address before it escalates.", "You're right — let's tackle it head-on rather than let it fester.", "I'm relieved you feel the same way."], pt: "Lidando com tensão em uma equipe" },
    { lines: ["Frankly, I'm skeptical that this compromise will satisfy either side.", "I share that concern — perhaps we need a third option.", "That might actually work better for everyone."], pt: "Discutindo um acordo" },
    { lines: ["I've come to terms with the fact that not everything is within my control.", "That's a healthy mindset to have.", "It took me a while to get there, honestly."], pt: "Refletindo sobre controle e aceitação" },
    { lines: ["In hindsight, we probably should have consulted the team earlier.", "Lesson learned — let's loop them in from now on.", "Agreed, it'll save us headaches later."], pt: "Aprendendo com um erro" },
    { lines: ["I'm not entirely convinced, but I'm willing to give it the benefit of the doubt.", "That's all I ask — let's see how it plays out.", "Fair enough, I'll keep an open mind."], pt: "Dando um voto de confiança" },
    { lines: ["It would be remiss of me not to mention the risks involved.", "I appreciate you being thorough about it.", "It's better to be safe than sorry."], pt: "Alertando sobre riscos" },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function OrdeneDialogo({ onExit }) {
  const [level, setLevel] = useState(null);
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [pool, setPool] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [checked, setChecked] = useState(null);
  const [score, setScore] = useState(0);

  function buildRound(dialog) {
    return shuffle(dialog.lines.map((line, i) => ({ id: `${i}-${line}`, text: line })));
  }

  if (!level) {
    return (
      <LevelMenu accent={ACCENT} gameName="Ordene o Diálogo" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)}
        onSelect={(l) => {
          const d = shuffle(BANKS[l]).slice(0, Math.min(ROUNDS, BANKS[l].length));
          setLevel(l); setDeck(d); setIdx(0); setPool(buildRound(d[0])); setAnswer([]); setChecked(null); setScore(0);
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
              setDeck(d); setIdx(0); setPool(buildRound(d[0])); setAnswer([]); setChecked(null); setScore(0);
            }}>Jogar de novo</button>
          </div>
        </div>
      </div>
    );
  }

  const current = deck[idx];
  if (checked === true && level === "advanced") unlockExpert(GAME_ID);

  function addToAnswer(line) {
    if (checked) return;
    setAnswer((a) => [...a, line]); setPool((p) => p.filter((w) => w.id !== line.id)); setChecked(null);
  }
  function removeFromAnswer(line) {
    if (checked === true) return;
    setAnswer((a) => a.filter((w) => w.id !== line.id)); setPool((p) => [...p, line]); setChecked(null);
  }
  function verify() {
    const built = answer.map((w) => w.text);
    const ok = JSON.stringify(built) === JSON.stringify(current.lines);
    setChecked(ok);
    if (ok) setScore((s) => s + 20);
  }
  function next() {
    const nextIdx = idx + 1;
    setIdx(nextIdx); setChecked(null);
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
        <span style={{ ...styles.entryNo, color: ACCENT }}>ORDENE O DIÁLOGO</span>
        <p style={styles.intro}>Toque nas falas na ordem certa pra montar a conversa. Tema: {current.pt}</p>
        <div style={styles.answerCol}>
          {answer.length === 0 && <span style={styles.placeholder}>toque nas falas abaixo…</span>}
          {answer.map((line, i) => (
            <button key={line.id} onClick={() => removeFromAnswer(line)} style={{ ...styles.bubble, alignSelf: i % 2 === 0 ? "flex-start" : "flex-end", borderColor: checked === true ? "#6B9080" : checked === false ? "#C65D57" : ACCENT }}>{line.text}</button>
          ))}
        </div>
        <div style={styles.poolCol}>
          {pool.map((line) => <button key={line.id} onClick={() => addToAnswer(line)} style={styles.poolBubble}>{line.text}</button>)}
        </div>
        {checked === false && <p style={styles.wrongText}>Ainda não é essa ordem — tenta de novo.</p>}
        <div style={styles.actions}>
          {pool.length === 0 && checked !== true && <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={verify}>Verificar</button>}
          {checked === true && (
            <>
              <span style={{ ...styles.doneText, color: ACCENT }}>Certinho! 🎉{level === "advanced" ? " Nível Mestre destravado!" : ""}</span>
              <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={next}>{idx + 1 >= deck.length ? "Ver resultado →" : "Próximo diálogo →"}</button>
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
  answerCol: { display: "flex", flexDirection: "column", gap: 8, minHeight: 60, padding: 10, background: "#FFFFFF", border: "1.5px dashed #D8D0BC", borderRadius: 4 },
  placeholder: { fontSize: 12, color: "#B0A990" },
  bubble: { border: "1.5px solid", borderRadius: "14px", padding: "8px 12px", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", background: "#FFFFFF", color: "#1B2735", maxWidth: "85%", textAlign: "left" },
  poolCol: { display: "flex", flexDirection: "column", gap: 8, marginTop: 16 },
  poolBubble: { border: "1.5px solid #D8D0BC", background: "#FFFFFF", borderRadius: "14px", padding: "8px 12px", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", color: "#1B2735", textAlign: "left" },
  wrongText: { fontSize: 12, color: "#C65D57", marginTop: 10 },
  actions: { marginTop: 16, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 16 },
  nextBtn: { color: "#FFFFFF", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overActions: { marginTop: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, margin: "auto" },
};
