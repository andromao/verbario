import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const BANK = [
  { word: "stubborn", pos: "adj.", pt: "teimoso", level: "beginner", options: ["teimoso", "tímido", "cansado", "curioso"] },
  { word: "wander", pos: "v.", pt: "vagar / perambular", level: "beginner", options: ["correr", "vagar / perambular", "esconder", "gritar"] },
  { word: "grudge", pos: "n.", pt: "rancor", level: "beginner", options: ["orgulho", "dívida", "rancor", "surpresa"] },
  { word: "flimsy", pos: "adj.", pt: "frágil", level: "beginner", options: ["pesado", "frágil", "afiado", "macio"] },
  { word: "reckless", pos: "adj.", pt: "imprudente", level: "beginner", options: ["cuidadoso", "imprudente", "silencioso", "generoso"] },
  { word: "sturdy", pos: "adj.", pt: "robusto", level: "beginner", options: ["frágil", "robusto", "leve", "raso"] },
  { word: "clutter", pos: "n.", pt: "bagunça", level: "beginner", options: ["ordem", "bagunça", "silêncio", "vazio"] },
  { word: "shrug", pos: "v.", pt: "dar de ombros", level: "beginner", options: ["dar de ombros", "acenar", "aplaudir", "apontar"] },
  { word: "outdated", pos: "adj.", pt: "desatualizado", level: "beginner", options: ["moderno", "desatualizado", "raro", "urgente"] },
  { word: "soothe", pos: "v.", pt: "acalmar", level: "beginner", options: ["irritar", "acalmar", "assustar", "acelerar"] },
  { word: "blur", pos: "v./n.", pt: "borrão / turvar", level: "intermediate", options: ["brilho", "borrão / turvar", "cheiro", "eco"] },
  { word: "linger", pos: "v.", pt: "demorar-se", level: "intermediate", options: ["fugir", "demorar-se", "cair", "brilhar"] },
  { word: "thrive", pos: "v.", pt: "prosperar", level: "intermediate", options: ["desistir", "prosperar", "duvidar", "esperar"] },
  { word: "brittle", pos: "adj.", pt: "quebradiço", level: "intermediate", options: ["elástico", "quebradiço", "molhado", "denso"] },
  { word: "grasp", pos: "v.", pt: "compreender / agarrar", level: "intermediate", options: ["ignorar", "compreender / agarrar", "perder", "adiar"] },
  { word: "yearn", pos: "v.", pt: "ansiar", level: "intermediate", options: ["temer", "ansiar", "negar", "adiar"] },
  { word: "blunt", pos: "adj.", pt: "direto / sem rodeios", level: "intermediate", options: ["educado", "direto / sem rodeios", "confuso", "tímido"] },
  { word: "murky", pos: "adj.", pt: "turvo / obscuro", level: "intermediate", options: ["claro", "turvo / obscuro", "quente", "raso"] },
  { word: "dwell", pos: "v.", pt: "habitar / se ater a", level: "intermediate", options: ["voar", "habitar / se ater a", "esquecer", "vender"] },
  { word: "haggle", pos: "v.", pt: "pechinchar / regatear", level: "intermediate", options: ["pechinchar / regatear", "elogiar", "adiar", "confessar"] },
  { word: "eavesdrop", pos: "v.", pt: "escutar às escondidas", level: "advanced", options: ["cochichar", "escutar às escondidas", "discutir", "cantar"] },
  { word: "capricious", pos: "adj.", pt: "caprichoso / instável", level: "advanced", options: ["previsível", "caprichoso / instável", "gentil", "lento"] },
  { word: "vindicate", pos: "v.", pt: "justificar / inocentar", level: "advanced", options: ["condenar", "justificar / inocentar", "duvidar", "ignorar"] },
  { word: "squander", pos: "v.", pt: "esbanjar / desperdiçar", level: "advanced", options: ["economizar", "esbanjar / desperdiçar", "investir", "esconder"] },
  { word: "placate", pos: "v.", pt: "apaziguar", level: "advanced", options: ["provocar", "apaziguar", "confundir", "adiar"] },
  { word: "ambivalent", pos: "adj.", pt: "ambivalente / indeciso", level: "advanced", options: ["decidido", "ambivalente / indeciso", "confiante", "curioso"] },
  { word: "relentless", pos: "adj.", pt: "implacável / incessante", level: "advanced", options: ["hesitante", "implacável / incessante", "gentil", "raro"] },
  { word: "meticulous", pos: "adj.", pt: "meticuloso", level: "advanced", options: ["descuidado", "meticuloso", "apressado", "distraído"] },
  { word: "disparage", pos: "v.", pt: "depreciar / menosprezar", level: "advanced", options: ["elogiar", "depreciar / menosprezar", "ignorar", "corrigir"] },
  { word: "candid", pos: "adj.", pt: "franco / sincero", level: "advanced", options: ["evasivo", "franco / sincero", "confuso", "distante"] },
];

const LEVELS = [
  { id: "beginner", label: "Iniciante", vol: "I", desc: "Palavras do dia a dia" },
  { id: "intermediate", label: "Intermediário", vol: "II", desc: "Vocabulário mais rico" },
  { id: "advanced", label: "Avançado", vol: "III", desc: "Termos formais e sofisticados" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Verbario({ profile, firebaseUser, onExit }) {
  const [screen, setScreen] = useState("menu"); // menu | game | over | board
  const [level, setLevel] = useState(null);
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(3);
  const [picked, setPicked] = useState(null);
  const [stamp, setStamp] = useState(null);
  const [choices, setChoices] = useState([]);
  const [timeLeft, setTimeLeft] = useState(12);
  const timerRef = useRef(null);
  const savedThisRound = useRef(false);
  const [board, setBoard] = useState([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [savingScore, setSavingScore] = useState(false);
  const [personalBest, setPersonalBest] = useState(null);

  const current = deck[idx];

  function startLevel(lvl) {
    const pool = shuffle(BANK.filter((w) => w.level === lvl));
    setLevel(lvl);
    setDeck(pool);
    setIdx(0);
    setScore(0);
    setStreak(0);
    setBest(0);
    setLives(3);
    setPicked(null);
    setStamp(null);
    savedThisRound.current = false;
    setScreen("game");
  }

  useEffect(() => {
    if (screen !== "game" || !current) return;
    setChoices(shuffle(current.options));
    setPicked(null);
    setStamp(null);
    setTimeLeft(12);
  }, [idx, deck, screen]);

  useEffect(() => {
    if (screen !== "game" || picked) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx, picked, screen]);

  function handleAnswer(choice) {
    if (picked) return;
    clearInterval(timerRef.current);
    setPicked(choice);
    const correct = choice === current.pt;
    if (correct) {
      const gained = 10 + streak * 2;
      setScore((s) => s + gained);
      setStreak((s) => {
        const ns = s + 1;
        setBest((b) => Math.max(b, ns));
        return ns;
      });
      setStamp("CERTO");
    } else {
      setStreak(0);
      setLives((l) => l - 1);
      setStamp("ERRADO");
    }
  }

  function next() {
    if (lives <= 0) {
      setScreen("over");
      return;
    }
    if (idx + 1 >= deck.length) {
      setDeck(shuffle(BANK.filter((w) => w.level === level)));
      setIdx(0);
    } else {
      setIdx((i) => i + 1);
    }
  }

  useEffect(() => {
    if (lives <= 0 && picked) {
      const t = setTimeout(() => setScreen("over"), 900);
      return () => clearTimeout(t);
    }
  }, [lives, picked]);

  useEffect(() => {
    if (screen !== "over" || savedThisRound.current || !profile || !firebaseUser) return;
    savedThisRound.current = true;
    (async () => {
      setSavingScore(true);
      try {
        const ref = doc(db, "leaderboard", firebaseUser.uid);
        let prevBest = 0;
        try {
          const snap = await getDoc(ref);
          if (snap.exists()) prevBest = snap.data().score || 0;
        } catch {}
        setPersonalBest(Math.max(prevBest, score));
        if (score > prevBest) {
          await setDoc(ref, { name: profile.name, score, level, date: new Date().toISOString() });
        }
      } catch {
      } finally {
        setSavingScore(false);
      }
    })();
  }, [screen]);

  function restart() { startLevel(level); }
  function backToMenu() { clearInterval(timerRef.current); setScreen("menu"); }

  async function openBoard() {
    setScreen("board");
    setBoardLoading(true);
    try {
      const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(15));
      const snap = await getDocs(q);
      setBoard(snap.docs.map((d) => d.data()));
    } catch {
      setBoard([]);
    } finally {
      setBoardLoading(false);
    }
  }

  const levelLabel = (id) => LEVELS.find((l) => l.id === id)?.label || id;

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={screen === "menu" ? onExit : backToMenu}>
          ← {screen === "menu" ? "jogos" : "nível"}
        </button>
        {screen === "game" && (
          <div style={styles.hud}>
            <span style={styles.hudItem}>PTS {score}</span>
            <span style={styles.hudItem}>SEQ {streak}</span>
            <span style={styles.hudItem}>{"●".repeat(Math.max(lives, 0)) + "○".repeat(3 - Math.max(lives, 0))}</span>
          </div>
        )}
      </div>

      {screen === "menu" && (
        <div style={styles.card}>
          <span style={styles.entryNo}>ESCOLHA O VOLUME</span>
          <p style={styles.intro}>Cada nível é um volume do dicionário.</p>
          <div style={styles.levelList}>
            {LEVELS.map((l) => (
              <button key={l.id} style={styles.levelBtn} onClick={() => startLevel(l.id)}>
                <span style={styles.levelVol}>Vol. {l.vol}</span>
                <span style={styles.levelLabel}>{l.label}</span>
                <span style={styles.levelDesc}>{l.desc}</span>
              </button>
            ))}
          </div>
          <button style={{ ...styles.ghostBtn, marginTop: 16 }} onClick={openBoard}>Ver placar geral</button>
        </div>
      )}

      {screen === "game" && current && (
        <div style={styles.card}>
          <div style={styles.entryTop}>
            <span style={styles.entryNo}>{String(idx + 1).padStart(2, "0")}/{deck.length}</span>
            <div style={styles.timerWrap}>
              <div style={{ ...styles.timerBar, width: `${(timeLeft / 12) * 100}%`, background: timeLeft <= 4 ? "#C65D57" : "#E8A33D" }} />
            </div>
          </div>
          <div style={styles.entry}>
            <h1 style={styles.headword}>{current.word}</h1>
            <span style={styles.pos}>{current.pos}</span>
            <p style={styles.prompt}>Qual é o significado em português?</p>
          </div>
          <div style={styles.options}>
            {choices.map((opt) => {
              const isCorrect = opt === current.pt;
              const isPicked = picked === opt;
              let bg = "#F7F3E9", border = "#D8D0BC", color = "#1B2735";
              if (picked) {
                if (isCorrect) { bg = "#E7EFE9"; border = "#6B9080"; color = "#3E5C4C"; }
                else if (isPicked) { bg = "#F4E4E2"; border = "#C65D57"; color = "#8B3E38"; }
              }
              return (
                <button key={opt} disabled={!!picked} onClick={() => handleAnswer(opt)} style={{ ...styles.optBtn, background: bg, borderColor: border, color }}>
                  {opt}
                </button>
              );
            })}
          </div>
          {stamp && (
            <div style={styles.stampRow}>
              <span style={{ ...styles.stampText, color: stamp === "CERTO" ? "#6B9080" : "#C65D57", borderColor: stamp === "CERTO" ? "#6B9080" : "#C65D57" }}>{stamp}</span>
              <button style={styles.nextBtn} onClick={next}>{lives <= 0 ? "Ver resultado →" : "Próxima →"}</button>
            </div>
          )}
        </div>
      )}

      {screen === "over" && (
        <div style={styles.card}>
          <div style={styles.overWrap}>
            <span style={styles.entryNo}>Fim de rodada · {levelLabel(level)}</span>
            <h2 style={styles.overScore}>{score} pts</h2>
            <p style={styles.overSub}>Melhor sequência: {best}</p>
            <p style={styles.overSub}>{savingScore ? "salvando…" : personalBest != null ? `Recorde: ${personalBest} pts` : ""}</p>
            <div style={styles.overActions}>
              <button style={styles.nextBtn} onClick={restart}>Jogar novamente</button>
              <button style={styles.ghostBtn} onClick={backToMenu}>Trocar nível</button>
            </div>
          </div>
        </div>
      )}

      {screen === "board" && (
        <div style={styles.card}>
          <span style={styles.entryNo}>PLACAR GERAL</span>
          {boardLoading ? (
            <p style={styles.intro}>carregando…</p>
          ) : board.length === 0 ? (
            <p style={styles.intro}>Ninguém pontuou ainda.</p>
          ) : (
            <div style={styles.boardList}>
              {board.map((e, i) => (
                <div key={e.name + i} style={styles.boardRow}>
                  <span style={styles.boardRank}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={styles.boardName}>{e.name}{profile && e.name === profile.name ? " (você)" : ""}</span>
                  <span style={styles.boardScore}>{e.score}</span>
                </div>
              ))}
            </div>
          )}
          <button style={{ ...styles.ghostBtn, marginTop: 16, alignSelf: "flex-start" }} onClick={backToMenu}>← voltar</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 14 },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  backBtn: { background: "none", border: "none", color: "#C9C2AC", fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", padding: 0 },
  hud: { display: "flex", gap: 12, fontSize: 11, color: "#E7E2D3" },
  hudItem: {},
  card: { background: "#F7F3E9", borderRadius: 4, padding: "22px 22px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", minHeight: 380, display: "flex", flexDirection: "column" },
  intro: { fontSize: 13, color: "#5A6270", marginTop: 8, lineHeight: 1.5 },
  levelList: { display: "flex", flexDirection: "column", gap: 10, marginTop: 18 },
  levelBtn: { textAlign: "left", background: "#FFFFFF", border: "1.5px solid #D8D0BC", borderRadius: 3, padding: "14px 16px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 2 },
  levelVol: { fontSize: 10, letterSpacing: 1.5, color: "#B08A3E" },
  levelLabel: { fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "#1B2735" },
  levelDesc: { fontSize: 12, color: "#8B96A6" },
  entryTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  entryNo: { fontSize: 11, color: "#9A9280", letterSpacing: 1 },
  timerWrap: { flex: 1, height: 3, background: "#E5DDC8", borderRadius: 2, overflow: "hidden" },
  timerBar: { height: "100%", transition: "width 1s linear" },
  entry: { marginTop: 18, marginBottom: 6, borderBottom: "1px solid #D8D0BC", paddingBottom: 16 },
  headword: { fontFamily: "'Fraunces', serif", fontSize: 40, margin: 0, color: "#1B2735", fontWeight: 700, lineHeight: 1.05 },
  pos: { fontSize: 12, color: "#8B7F5F", fontStyle: "italic" },
  prompt: { fontSize: 13, color: "#5A6270", marginTop: 10 },
  options: { display: "flex", flexDirection: "column", gap: 9, marginTop: 14 },
  optBtn: { textAlign: "left", padding: "12px 14px", borderRadius: 3, border: "1.5px solid #D8D0BC", fontSize: 14.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  stampRow: { marginTop: "auto", paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  stampText: { fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, letterSpacing: 2, border: "3px solid", padding: "3px 10px", transform: "rotate(-6deg)", display: "inline-block" },
  nextBtn: { background: "#1B2735", color: "#F7F3E9", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  ghostBtn: { background: "none", color: "#1B2735", border: "1.5px solid #D8D0BC", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  overWrap: { margin: "auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  overScore: { fontFamily: "'Fraunces', serif", fontSize: 44, margin: "4px 0", color: "#1B2735" },
  overSub: { fontSize: 13, color: "#5A6270" },
  overActions: { display: "flex", gap: 10, marginTop: 10 },
  boardList: { display: "flex", flexDirection: "column", gap: 2, marginTop: 16 },
  boardRow: { display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 10, alignItems: "center", padding: "8px 4px", borderBottom: "1px solid #E5DDC8", fontSize: 13 },
  boardRank: { color: "#B08A3E", fontWeight: 600 },
  boardName: { color: "#1B2735" },
  boardScore: { color: "#1B2735", fontWeight: 600 },
};
