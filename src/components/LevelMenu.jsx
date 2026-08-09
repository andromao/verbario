const LEVELS = [
  { id: "superbeginner", label: "Muito Iniciante", vol: "0" },
  { id: "beginner", label: "Iniciante", vol: "I" },
  { id: "intermediate", label: "Intermediário", vol: "II" },
  { id: "advanced", label: "Avançado", vol: "III" },
  { id: "expert", label: "Mestre", vol: "IV", locked: true },
];

export default function LevelMenu({ accent, gameName, onSelect, onExit, expertUnlocked }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onExit}>← jogos</button>
      </div>
      <div style={styles.card}>
        <span style={{ ...styles.entryNo, color: accent }}>{gameName.toUpperCase()}</span>
        <p style={styles.intro}>Escolha a dificuldade pra começar.</p>
        <div style={styles.levelList}>
          {LEVELS.map((l) => {
            const isLocked = l.locked && !expertUnlocked;
            return (
              <button
                key={l.id}
                className="game-card"
                disabled={isLocked}
                style={{ ...styles.levelBtn, borderLeft: `5px solid ${accent}`, opacity: isLocked ? 0.5 : 1, cursor: isLocked ? "default" : "pointer" }}
                onClick={() => !isLocked && onSelect(l.id)}
              >
                <span style={{ ...styles.levelVol, color: accent }}>Vol. {l.vol}</span>
                <span style={styles.levelLabel}>{l.label} {isLocked && "🔒"}</span>
                {isLocked && <span style={styles.lockNote}>complete o Avançado pra destravar</span>}
              </button>
            );
          })}
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
  levelList: { display: "flex", flexDirection: "column", gap: 10 },
  levelBtn: { textAlign: "left", background: "#FFFFFF", border: "1.5px solid #D8D0BC", borderRadius: 3, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 2 },
  levelVol: { fontSize: 10, letterSpacing: 1.5, fontWeight: 700 },
  levelLabel: { fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 700, color: "#1B2735" },
  lockNote: { fontSize: 10.5, color: "#B0A990" },
};
