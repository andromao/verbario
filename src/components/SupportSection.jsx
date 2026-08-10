import { useState } from "react";

const PIX_KEY = "andromao@gmail.com";
const AUTHOR = "André Romão Quinhoneiro";

export default function SupportSection() {
  const [copied, setCopied] = useState(false);

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // navegador sem suporte a clipboard — a pessoa pode selecionar manualmente
    }
  }

  return (
    <div style={styles.card}>
      <span style={styles.heart}>♥</span>
      <p style={styles.text}>
        O Verbário é feito e mantido por <strong>{AUTHOR}</strong>. Se o app está te ajudando a estudar inglês, considere apoiar o desenvolvimento com um PIX.
      </p>
      <div style={styles.pixRow}>
        <span style={styles.pixKey}>{PIX_KEY}</span>
        <button style={styles.copyBtn} onClick={copyPix}>{copied ? "Copiado!" : "Copiar chave"}</button>
      </div>
    </div>
  );
}

const styles = {
  card: { border: "1px solid #3A4657", borderRadius: 4, padding: "14px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  heart: { color: "#D96C6C", fontSize: 14 },
  text: { fontSize: 11.5, color: "#B8C0CC", lineHeight: 1.6, margin: 0, maxWidth: 320 },
  pixRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 2 },
  pixKey: { fontSize: 12, color: "#E7E2D3", fontFamily: "'IBM Plex Mono', monospace", background: "#1B2735", border: "1px solid #3A4657", borderRadius: 3, padding: "4px 10px" },
  copyBtn: { background: "none", border: "1px solid #E8A33D", color: "#E8A33D", borderRadius: 3, padding: "5px 10px", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" },
};
