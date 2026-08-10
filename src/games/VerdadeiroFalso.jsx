import { useState } from "react";
import LevelMenu from "../components/LevelMenu";
import { isExpertUnlocked, unlockExpert } from "../utils/progress";

const GAME_ID = "verdadeiro-falso";
const ACCENT = "#2E9B8F";

const BANKS = {
  superbeginner: [
    { text: '"Cat" significa gato.', answer: true }, { text: '"Dog" significa gato.', answer: false },
    { text: '"Red" é uma cor.', answer: true }, { text: '"Run" significa dormir.', answer: false },
    { text: '"Big" significa grande.', answer: true },
  ],
  beginner: [
    { text: '"Happy" significa feliz.', answer: true }, { text: '"Angry" significa calmo.', answer: false },
    { text: '"Fast" é o oposto de "slow".', answer: true }, { text: '"Soothe" significa irritar.', answer: false },
    { text: '"Sturdy" significa robusto.', answer: true }, { text: '"Clutter" significa ordem.', answer: false },
  ],
  intermediate: [
    { text: '"Linger" significa demorar-se.', answer: true }, { text: '"Thrive" significa desistir.', answer: false },
    { text: '"Blunt" significa educado.', answer: false }, { text: '"Yearn" significa ansiar.', answer: true },
    { text: '"Murky" significa claro.', answer: false }, { text: '"Haggle" significa pechinchar.', answer: true },
  ],
  advanced: [
    { text: '"Vindicate" significa condenar.', answer: false }, { text: '"Meticulous" significa cuidadoso nos detalhes.', answer: true },
    { text: '"Squander" significa economizar.', answer: false }, { text: '"Relentless" significa incessante.', answer: true },
    { text: '"Disparage" significa elogiar.', answer: false }, { text: '"Candid" significa sincero.', answer: true },
  ],
  expert: [
    { text: '"Ubiquitous" significa raro.', answer: false }, { text: '"Ephemeral" significa passageiro.', answer: true },
    { text: '"Surreptitious" significa óbvio.', answer: false }, { text: '"Cacophony" significa uma barulheira desagradável.', answer: true },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function VerdadeiroFalso({ onExit }) {
  const [level, setLevel] = useState(null);
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);

  if (!level) {
    return (
      <LevelMenu accent={ACCENT} gameName="Verdadeiro ou Falso" onExit={onExit} expertUnlocked={isExpertUnlocked(GAME_ID)}
        onSelect={(l) => { setLevel(l); setOrder(shuffle(BANKS[l].map((_, i) => i))); setIdx(0); setPicked(null); setScore(0); }} />
    );
  }

  const items = BANKS[level];
  const item = items[order[idx]];
  const finished = idx >= order.length;
  if (finished && score === items.length && level === "advanced") unlockExpert(GAME_ID);

  function choose(val) { if (picked !== null) return; setPicked(val); if (val === item.answer) setScore((s) => s + 1); }
  function skip() { if (picked !== null) return; setIdx((i) => i + 1); }
  function next() { setPicked(null); setIdx((i) => i + 1); }
  function restart() { setIdx(0); setPicked(null); setScore(0); setOrder(shuffle(items.map((_, i) => i))); }
  function changeLevel() { setLevel(null); }

  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={changeLevel}>← nível</button>
        <span style={{ ...styles.hudItem, color: ACCENT }}>{score}/{items.length}</span>
      </div>
      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: ACCENT }}>VERDADEIRO OU FALSO</span>
        {!finished ? (
          <>
            <p style={styles.sentence}>{item.text}</p>
            <div style={styles.options}>
              {[true, false].map((val) => {
                const label = val ? "Verdadeiro" : "Falso";
                const isCorrect = val === item.answer, isPicked = picked === val;
                let bg = "#FFFFFF", border = "#D8D0BC", color = "#1B2735";
                if (picked !== null) { if (isCorrect) { bg = "#E7F2F0"; border = ACCENT; color = "#1F5F58"; } else if (isPicked) { bg = "#F4E4E2"; border = "#C65D57"; color = "#8B3E38"; } }
                return <button key={label} disabled={picked !== null} onClick={() => choose(val)} style={{ ...styles.optBtn, background: bg, borderColor: border, color }}>{label}</button>;
              })}
            </div>
            {picked === null && (
              <button style={{ ...styles.ghostBtn, marginTop: 12, alignSelf: "flex-start" }} onClick={skip}>Pular esta</button>
            )}
            {picked !== null && (
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
  sentence: { fontFamily: "'Fraunces', serif", fontSize: 19, color: "#1B2735", marginTop: 18, lineHeight: 1.5 },
  options: { display: "flex", gap: 10, marginTop: 20 },
  optBtn: { flex: 1, padding: "14px 10px", borderRadius: 3, border: "1.5px solid", fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", fontWeight: 600 },
  nextBtn: { color: "#FFFFFF", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  ghostBtn: { background: "none", border: "1.5px solid #D8D0BC", borderRadius: 3, padding: "8px 12px", fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", color: "#1B2735" },
  overActions: { margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  doneText: { fontFamily: "'Fraunces', serif", fontSize: 22, textAlign: "center" },
};
