import { useState, useEffect } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import Verbario from "./games/Verbario";
import CacaPalavras from "./games/CacaPalavras";
import Forca from "./games/Forca";
import Criptograma from "./games/Criptograma";

const GAMES = [
  { id: "verbario", title: "Verbário", desc: "Vocabulário por níveis, em forma de dicionário", available: true },
  { id: "caca-palavras", title: "Caça-palavras", desc: "Ache as palavras escondidas na grade", available: true },
  { id: "forca", title: "Forca", desc: "Adivinhe a palavra em inglês letra por letra", available: true },
  { id: "criptograma", title: "Criptograma", desc: "Decifre a palavra trocando números por letras", available: true },
  { id: "cruzadinha", title: "Cruzadinha", desc: "Palavras cruzadas com dicas em português", available: false },
];

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [regError, setRegError] = useState("");
  const [activeGame, setActiveGame] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try { await signInAnonymously(auth); } catch { setScreen("register"); }
        return;
      }
      setFirebaseUser(user);
      try {
        const snap = await getDoc(doc(db, "profiles", user.uid));
        if (snap.exists()) {
          setProfile(snap.data());
          setScreen("hub");
        } else {
          setScreen("register");
        }
      } catch {
        setScreen("register");
      }
    });
    return () => unsub();
  }, []);

  async function handleRegister() {
    const trimmed = nameInput.trim();
    if (!trimmed) { setRegError("Digite um nome para continuar."); return; }
    if (trimmed.length > 24) { setRegError("Nome muito longo (máx. 24 caracteres)."); return; }
    if (!firebaseUser) { setRegError("Ainda conectando… tente de novo em instantes."); return; }
    setRegError("");
    const p = { name: trimmed };
    try {
      await setDoc(doc(db, "profiles", firebaseUser.uid), p);
      setProfile(p);
      setScreen("hub");
    } catch {
      setRegError("Não deu para salvar agora. Tente de novo.");
    }
  }

  function openGame(id) {
    setActiveGame(id);
    setScreen("game");
  }

  function exitGame() {
    setActiveGame(null);
    setScreen("hub");
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .game-card { transition: transform .12s ease, border-color .12s ease, box-shadow .12s ease; }
        .game-card:hover:not(:disabled) { transform: translateY(-2px); border-color: #E8A33D; box-shadow: 0 8px 18px rgba(0,0,0,0.18); }
        .reg-input:focus { outline: 2px solid #E8A33D; outline-offset: 1px; }
        @media (prefers-reduced-motion: reduce) { .game-card { transition: none !important; } }
      `}</style>

      <div style={styles.frame}>
        <header style={styles.header}>
          <div style={styles.brand}><span style={styles.brandMark}>§</span> Verbário</div>
          {profile && screen !== "game" && <span style={styles.whoami}>{profile.name}</span>}
        </header>

        {screen === "loading" && (
          <main style={styles.card}><div style={styles.centered}><span style={styles.eyebrow}>carregando…</span></div></main>
        )}

        {screen === "register" && (
          <main style={styles.card}>
            <span style={styles.eyebrow}>CADASTRO</span>
            <h1 style={styles.h1}>Como podemos te chamar?</h1>
            <p style={styles.intro}>Seu nome guarda seu recorde e aparece no placar geral.</p>
            <input
              className="reg-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="seu nome"
              style={styles.input}
              maxLength={24}
            />
            {regError && <span style={styles.errorText}>{regError}</span>}
            <button style={{ ...styles.nextBtn, marginTop: 14, alignSelf: "flex-start" }} onClick={handleRegister}>Salvar e continuar →</button>
          </main>
        )}

        {screen === "hub" && (
          <main style={styles.card}>
            <span style={styles.eyebrow}>ESCOLHA UM JOGO</span>
            <p style={styles.intro}>Vários jeitos de estudar inglês. Escolha um pra começar.</p>
            <div style={styles.gameList}>
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  className="game-card"
                  disabled={!g.available}
                  onClick={() => g.available && openGame(g.id)}
                  style={{ ...styles.gameCard, opacity: g.available ? 1 : 0.5, cursor: g.available ? "pointer" : "default" }}
                >
                  <span style={styles.gameTitle}>{g.title}</span>
                  <span style={styles.gameDesc}>{g.desc}</span>
                  {!g.available && <span style={styles.soonTag}>Em breve</span>}
                </button>
              ))}
            </div>
          </main>
        )}

        {screen === "game" && activeGame === "verbario" && (
          <Verbario profile={profile} firebaseUser={firebaseUser} onExit={exitGame} />
        )}
        {screen === "game" && activeGame === "caca-palavras" && <CacaPalavras onExit={exitGame} />}
        {screen === "game" && activeGame === "forca" && <Forca onExit={exitGame} />}
        {screen === "game" && activeGame === "criptograma" && <Criptograma onExit={exitGame} />}

        <div style={styles.adSlot}><span style={styles.adLabel}>espaço reservado para anúncio (banner)</span></div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", width: "100%", background: "#1B2735", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'IBM Plex Mono', ui-monospace, monospace" },
  frame: { width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 14 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", color: "#E7E2D3" },
  brand: { fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 20, letterSpacing: 0.2, display: "flex", alignItems: "center", gap: 6 },
  brandMark: { color: "#E8A33D", fontSize: 22 },
  whoami: { fontSize: 12, color: "#C9C2AC" },
  card: { background: "#F7F3E9", borderRadius: 4, padding: "22px 22px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", border: "1px solid #D8D0BC", minHeight: 380, display: "flex", flexDirection: "column" },
  centered: { margin: "auto" },
  eyebrow: { fontSize: 11, color: "#9A9280", letterSpacing: 1 },
  h1: { fontFamily: "'Fraunces', serif", fontSize: 30, margin: "10px 0 0", color: "#1B2735" },
  intro: { fontSize: 13, color: "#5A6270", marginTop: 8, lineHeight: 1.5 },
  input: { marginTop: 16, padding: "12px 14px", borderRadius: 3, border: "1.5px solid #D8D0BC", fontSize: 15, fontFamily: "'IBM Plex Mono', monospace", background: "#FFFFFF", color: "#1B2735" },
  errorText: { color: "#C65D57", fontSize: 12, marginTop: 6 },
  nextBtn: { background: "#1B2735", color: "#F7F3E9", border: "none", borderRadius: 3, padding: "10px 16px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
  gameList: { display: "flex", flexDirection: "column", gap: 10, marginTop: 18 },
  gameCard: { textAlign: "left", background: "#FFFFFF", border: "1.5px solid #D8D0BC", borderRadius: 3, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 2, position: "relative" },
  gameTitle: { fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 700, color: "#1B2735" },
  gameDesc: { fontSize: 12, color: "#8B96A6" },
  soonTag: { position: "absolute", top: 12, right: 14, fontSize: 9, letterSpacing: 1, color: "#B08A3E", border: "1px solid #B08A3E", borderRadius: 20, padding: "2px 8px" },
  adSlot: { border: "1px dashed #4A5568", borderRadius: 4, padding: "10px 14px", textAlign: "center" },
  adLabel: { fontSize: 10, color: "#6B7688", letterSpacing: 0.5 },
};
