import { useState } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "complete-dialogo";
const ACCENT = "#5B8A72";
const ROUNDS = 10;

const BANKS = {
  superbeginner: [
    { a: "Hi! How are you?", options: ["I am fine, thanks.", "It is a table.", "Goodbye."], answer: "I am fine, thanks.", pt: "Oi! Como você está?" },
    { a: "What is your name?", options: ["My name is Ana.", "I am ten.", "It is red."], answer: "My name is Ana.", pt: "Qual é o seu nome?" },
    { a: "How old are you?", options: ["I am ten.", "I am fine.", "It is blue."], answer: "I am ten.", pt: "Quantos anos você tem?" },
    { a: "Do you like cats?", options: ["Yes, I do.", "It is a dog.", "I am happy."], answer: "Yes, I do.", pt: "Você gosta de gatos?" },
    { a: "Where are you from?", options: ["I am from Brazil.", "I am ten.", "It is nice."], answer: "I am from Brazil.", pt: "De onde você é?" },
    { a: "Goodbye!", options: ["Bye! See you later.", "I am fine.", "It is red."], answer: "Bye! See you later.", pt: "Tchau!" },
    { a: "Thank you!", options: ["You're welcome.", "I am ten.", "It is a book."], answer: "You're welcome.", pt: "Obrigado!" },
    { a: "Is this your bag?", options: ["Yes, it is.", "I am happy.", "It is blue."], answer: "Yes, it is.", pt: "Essa é a sua bolsa?" },
    { a: "What color is the car?", options: ["It is red.", "I am ten.", "Yes, I do."], answer: "It is red.", pt: "De que cor é o carro?" },
    { a: "Nice to meet you!", options: ["Nice to meet you too!", "It is a table.", "I am from Brazil."], answer: "Nice to meet you too!", pt: "Prazer em conhecê-lo!" },
  ],
  beginner: [
    { a: "What do you do for a living?", options: ["I'm a teacher.", "I like pizza.", "It's raining."], answer: "I'm a teacher.", pt: "O que você faz da vida?" },
    { a: "Would you like some coffee?", options: ["Yes, please.", "I'm ten.", "It's Monday."], answer: "Yes, please.", pt: "Você gostaria de um café?" },
    { a: "Can you help me carry this?", options: ["Sure, no problem.", "I like blue.", "It's over there."], answer: "Sure, no problem.", pt: "Você pode me ajudar a carregar isso?" },
    { a: "What time is it?", options: ["It's three o'clock.", "It's raining.", "I'm hungry."], answer: "It's three o'clock.", pt: "Que horas são?" },
    { a: "How was your weekend?", options: ["It was great, thanks!", "It's Monday.", "I'm from Brazil."], answer: "It was great, thanks!", pt: "Como foi seu final de semana?" },
    { a: "Excuse me, where is the bathroom?", options: ["It's down the hall.", "I'm fine.", "Yes, please."], answer: "It's down the hall.", pt: "Com licença, onde fica o banheiro?" },
    { a: "Do you want to grab lunch?", options: ["Sure, I'm starving.", "It's blue.", "I'm ten."], answer: "Sure, I'm starving.", pt: "Quer almoçar junto?" },
    { a: "How much does this cost?", options: ["It's ten dollars.", "I'm happy.", "It's Monday."], answer: "It's ten dollars.", pt: "Quanto custa isso?" },
    { a: "Sorry, I'm late!", options: ["No worries, don't stress.", "It's ten dollars.", "I'm from Brazil."], answer: "No worries, don't stress.", pt: "Desculpa, estou atrasado!" },
    { a: "Can I get your phone number?", options: ["Sure, it's 555-0192.", "It's raining.", "I'm a teacher."], answer: "Sure, it's 555-0192.", pt: "Posso pegar seu telefone?" },
  ],
  intermediate: [
    { a: "I'm thinking about switching careers.", options: ["What's holding you back?", "It's raining outside.", "I had pasta for lunch."], answer: "What's holding you back?", pt: "Estou pensando em mudar de carreira." },
    { a: "Could you pass me the salt, please?", options: ["Here you go.", "I'm allergic to peanuts.", "It's on sale."], answer: "Here you go.", pt: "Você pode me passar o sal, por favor?" },
    { a: "I heard you got a promotion!", options: ["Yeah, I'm really excited.", "It's raining today.", "I forgot my keys."], answer: "Yeah, I'm really excited.", pt: "Soube que você foi promovido!" },
    { a: "Do you mind if I open the window?", options: ["Not at all, go ahead.", "It's expensive.", "I'm from Brazil."], answer: "Not at all, go ahead.", pt: "Você se importa se eu abrir a janela?" },
    { a: "I'm not sure which route to take.", options: ["Let's check the map.", "It's my birthday.", "I like tea."], answer: "Let's check the map.", pt: "Não sei qual caminho pegar." },
    { a: "Sorry to bother you, but do you have a minute?", options: ["Of course, what's up?", "It's on the table.", "I'm allergic to that."], answer: "Of course, what's up?", pt: "Desculpe incomodar, mas você tem um minuto?" },
    { a: "The flight got delayed again.", options: ["That's so frustrating.", "It's my favorite color.", "I love that song."], answer: "That's so frustrating.", pt: "O voo atrasou de novo." },
    { a: "Would you rather eat in or order takeout?", options: ["Let's just order takeout.", "It's next to the bank.", "I'm turning thirty."], answer: "Let's just order takeout.", pt: "Você prefere comer em casa ou pedir comida?" },
    { a: "I can't decide what to wear tonight.", options: ["Just go with the blue shirt.", "It's on the third floor.", "I already ate."], answer: "Just go with the blue shirt.", pt: "Não consigo decidir o que vestir hoje." },
    { a: "Have you tried the new restaurant downtown?", options: ["Not yet, is it good?", "It's raining hard.", "I lost my wallet."], answer: "Not yet, is it good?", pt: "Você já experimentou o restaurante novo no centro?" },
  ],
  advanced: [
    { a: "I've been meaning to bring this up, but I feel like we're not on the same page about the project.", options: ["I agree, let's set up a time to align on expectations.", "The weather has been lovely lately.", "I already had lunch, thanks."], answer: "I agree, let's set up a time to align on expectations.", pt: "Queria falar sobre isso, mas acho que não estamos alinhados sobre o projeto." },
    { a: "Honestly, I'm a bit overwhelmed with everything going on right now.", options: ["That makes sense — is there anything I can take off your plate?", "It's supposed to rain tomorrow.", "I just bought a new car."], answer: "That makes sense — is there anything I can take off your plate?", pt: "Sinceramente, estou meio sobrecarregado com tudo agora." },
    { a: "I'm torn between accepting the job offer and staying where I am.", options: ["What matters most to you in this decision?", "The bus was late again today.", "I prefer coffee over tea."], answer: "What matters most to you in this decision?", pt: "Estou dividido entre aceitar a proposta de emprego e ficar onde estou." },
    { a: "To be fair, I don't think that criticism was entirely warranted.", options: ["You might have a point — let's revisit it calmly.", "The store closes at nine.", "I forgot my umbrella."], answer: "You might have a point — let's revisit it calmly.", pt: "Sinceramente, acho que essa crítica não foi totalmente justa." },
    { a: "I keep putting off this decision because I'm afraid of making the wrong call.", options: ["It's okay, take your time — what's the worst that could happen?", "The train leaves at noon.", "I like his new haircut."], answer: "It's okay, take your time — what's the worst that could happen?", pt: "Eu continuo adiando essa decisão porque tenho medo de errar." },
    { a: "Between you and me, I don't think this plan is going to work out.", options: ["What makes you say that?", "I'll have the same as you.", "It's a five-minute walk."], answer: "What makes you say that?", pt: "Só entre nós, acho que esse plano não vai dar certo." },
    { a: "I really appreciate you being upfront with me about this.", options: ["Of course — I'd rather be honest than comfortable.", "The meeting starts at three.", "I just moved to a new apartment."], answer: "Of course — I'd rather be honest than comfortable.", pt: "Eu agradeço por ser sincero comigo sobre isso." },
    { a: "I've been putting off this conversation for weeks now.", options: ["I'm glad we're finally having it.", "The wifi has been down all day.", "I like your new shoes."], answer: "I'm glad we're finally having it.", pt: "Eu venho adiando essa conversa há semanas." },
    { a: "I can see both sides of the argument, honestly.", options: ["Same here — it's not a clear-cut issue.", "The bakery opens at seven.", "I prefer window seats."], answer: "Same here — it's not a clear-cut issue.", pt: "Sinceramente, eu entendo os dois lados do argumento." },
    { a: "Let's just say things didn't go as planned.", options: ["What happened?", "It's a beautiful evening.", "I already finished the book."], answer: "What happened?", pt: "Vamos dizer que as coisas não saíram como planejado." },
  ],
  expert: [
    { a: "I don't mean to second-guess your judgment, but have you weighed the long-term implications of this?", options: ["That's a fair point — let's map out the potential outcomes together.", "The traffic was unusually light this morning.", "I've never been fond of seafood."], answer: "That's a fair point — let's map out the potential outcomes together.", pt: "Não quero duvidar do seu julgamento, mas você considerou as implicações a longo prazo?" },
    { a: "There's an underlying tension here that I think we ought to address before it escalates.", options: ["You're right — let's tackle it head-on rather than let it fester.", "The conference has been rescheduled.", "I switched to decaf recently."], answer: "You're right — let's tackle it head-on rather than let it fester.", pt: "Há uma tensão de fundo aqui que acho que devemos resolver antes que piore." },
    { a: "I'm inclined to believe this setback is actually a blessing in disguise.", options: ["It might force us to rethink our approach for the better.", "The elevator is out of service.", "I'll grab my coat."], answer: "It might force us to rethink our approach for the better.", pt: "Eu tendo a acreditar que esse contratempo é, na verdade, uma bênção disfarçada." },
    { a: "Frankly, I'm skeptical that this compromise will satisfy either side.", options: ["I share that concern — perhaps we need a third option.", "The museum is closed on Mondays.", "I prefer tea in the mornings."], answer: "I share that concern — perhaps we need a third option.", pt: "Sinceramente, sou cético que esse acordo vá satisfazer nenhum dos dois lados." },
    { a: "I've come to terms with the fact that not everything is within my control.", options: ["That's a healthy mindset to have.", "The library extended its hours.", "I forgot to water the plants."], answer: "That's a healthy mindset to have.", pt: "Eu me conformei com o fato de que nem tudo está sob meu controle." },
    { a: "It would be remiss of me not to mention the risks involved.", options: ["I appreciate you being thorough about it.", "The parking lot is full today.", "I usually walk to work."], answer: "I appreciate you being thorough about it.", pt: "Seria uma falha minha não mencionar os riscos envolvidos." },
    { a: "I'm not entirely convinced, but I'm willing to give it the benefit of the doubt.", options: ["That's all I ask — let's see how it plays out.", "The printer is out of ink again.", "I usually skip breakfast."], answer: "That's all I ask — let's see how it plays out.", pt: "Não estou totalmente convencido, mas estou disposto a dar um voto de confiança." },
    { a: "In hindsight, we probably should have consulted the team earlier.", options: ["Lesson learned — let's loop them in from now on.", "The building has a new elevator.", "I like my coffee black."], answer: "Lesson learned — let's loop them in from now on.", pt: "Em retrospecto, provavelmente deveríamos ter consultado o time antes." },
    { a: "I hate to be the bearer of bad news, but the deal fell through.", options: ["That's disappointing, but let's regroup and figure out next steps.", "The bakery down the street is new.", "I usually take the stairs."], answer: "That's disappointing, but let's regroup and figure out next steps.", pt: "Odeio ser o portador de más notícias, mas o negócio não se concretizou." },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function CompleteDialogo({ onExit }) {
  const [level, setLevel] = useState(null);
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [order, setOrder] = useState([]);
  const [score, setScore] = useState(0);

  if (!level) {
    return (
      <LevelMenu accent={ACCENT} gameName="Complete o Diálogo" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)}
        onSelect={(l) => {
          const d = shuffle(BANKS[l]).slice(0, Math.min(ROUNDS, BANKS[l].length));
          setLevel(l); setDeck(d); setIdx(0); setPicked(null); setOrder(shuffle(d[0].options)); setScore(0);
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
            <span style={{ ...styles.doneText, color: ACCENT, fontSize: 32 }}>{score}/{deck.length}</span>
            <button style={{ ...styles.nextBtn, background: ACCENT }} onClick={() => {
              const d = shuffle(BANKS[level]).slice(0, Math.min(ROUNDS, BANKS[level].length));
              setDeck(d); setIdx(0); setPicked(null); setOrder(shuffle(d[0].options)); setScore(0);
            }}>Jogar de novo</button>
          </div>
        </div>
      </div>
    );
  }

  const item = deck[idx];
  if (picked === item.answer && level === "advanced") unlockExpert(GAME_ID);

  function choose(opt) { if (picked) return; setPicked(opt); if (opt === item.answer) setScore((s) => s + 1); }
  function next() {
    const nextIdx = idx + 1;
    setIdx(nextIdx); setPicked(null);
    if (nextIdx < deck.length) setOrder(shuffle(deck[nextIdx].options));
  }
  function changeLevel() { setLevel(null); }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={changeLevel}>← nível</button>
        <span style={{ ...styles.hudItem, color: ACCENT }}>{idx + 1}/{deck.length} · {score} pts</span>
      </div>
      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: ACCENT }}>COMPLETE O DIÁLOGO</span>
        <div style={styles.bubbleA}>
          <span style={styles.bubbleText}>{item.a}</span>
        </div>
        <p style={styles.hint}>({item.pt})</p>
        <p style={styles.prompt}>Qual é a resposta que faz mais sentido?</p>
        <div style={styles.options}>
          {order.map((opt) => {
            const isCorrect = opt === item.answer, isPicked = picked === opt;
            let bg = "#FFFFFF", border = "#D8D0BC", color = "#1B2735";
            if (picked) { if (isCorrect) { bg = "#EAF1EC"; border = ACCENT; color = "#2E4C3B"; } else if (isPicked) { bg = "#F4E4E2"; border = "#C65D57"; color = "#8B3E38"; } }
            return <button key={opt} disabled={!!picked} onClick={() => choose(opt)} style={{ ...styles.optBtn, background: bg, borderColor: border, color }}>{opt}</button>;
          })}
        </div>
        {picked && (
          <button style={{ ...styles.nextBtn, background: ACCENT, marginTop: 16, alignSelf: "flex-start" }} onClick={next}>
            {idx + 1 >= deck.length ? "Ver resultado →" : "Próximo diálogo →"}
          </button>
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
  overEyebrow: { fontSize: 11, letterSpacing: 2, color: "#9A9280" },
  bubbleA: { background: "#FFFFFF", border: "1.5px solid #D8D0BC", borderRadius: "14px 14px 14px 2px", padding: "12px 14px", marginTop: 16, alignSelf: "flex-start", maxWidth: "90%" },
  bubbleText: { fontSize: 14, color: "#1B2735", lineHeight: 1.5 },
  hint: { fontSize: 11.5, color: "#8B7F5F", fontStyle: "italic", marginTop: 6 },
  prompt: { fontSize: 12.5, color: "#5A6270", marginTop: 14, marginBottom: 4 },
  options: { display: "flex", flexDirection: "column", gap: 9, marginTop: 10 },
  optBtn: { textAlign: "left", padding: "12px 14px", borderRadius: "2px 14px 14px 14px", border: "1.5px solid", fontSize: 13.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  nextBtn: { color: "#FFFFFF", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overActions: { marginTop: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, margin: "auto" },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 16, textAlign: "center" },
};
