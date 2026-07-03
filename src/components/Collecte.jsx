// Collecte.jsx — Étape 3 : 2 voix par axe (dirigeant / terrain), échelle 1–5.
// L'écart de perception qui en découle est la signature de la méthode.
import React from "react";
import { AXE_PAR_ID, VOIX, C } from "../lib/socle.js";
import { Card, Eyebrow, Btn, Echelle5, Bar, hexA } from "./ui.jsx";

export default function Collecte({ selection, collecte, setCollecte, onNext, onBack }) {
  const axes = selection?.axes || [];

  const setNote = (axeId, voix, v) => {
    setCollecte({
      ...collecte,
      [axeId]: { ...(collecte[axeId] || {}), [voix]: v },
    });
  };

  const nbNotes = axes.reduce((acc, a) => {
    const c = collecte[a.axeId] || {};
    return acc + (c.dirigeant ? 1 : 0) + (c.terrain ? 1 : 0);
  }, 0);
  const total = axes.length * 2;
  const complet = axes.every((a) => {
    const c = collecte[a.axeId] || {};
    return c.dirigeant && c.terrain;
  });

  return (
    <div>
      <Eyebrow>Étape 3 — Collecte multi-parties prenantes</Eyebrow>
      <h2 style={{ margin: "0 0 6px", fontSize: 26, color: C.encre }}>Deux voix par axe</h2>
      <p style={{ margin: "0 0 8px", color: C.gris, maxWidth: 640 }}>
        Chaque axe est noté par le <strong>dirigeant</strong> (vision) et par le{" "}
        <strong>terrain</strong> (réalité opérationnelle). L'écart entre les deux est riche
        d'enseignement — il ne s'agit pas de « la bonne note ».
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 20px" }}>
        <div style={{ flex: 1, maxWidth: 260 }}>
          <Bar value={nbNotes} max={total} couleur={C.terre} />
        </div>
        <span style={{ fontSize: 13, color: C.gris, fontWeight: 600 }}>
          {nbNotes}/{total} notes
        </span>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {axes.map((a) => {
          const axe = AXE_PAR_ID[a.axeId];
          const c = collecte[a.axeId] || {};
          const ecart = c.dirigeant && c.terrain ? Math.abs(c.dirigeant - c.terrain) : null;
          return (
            <Card key={a.axeId} pad={18}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 20 }}>{axe.icone}</span>
                <strong style={{ fontSize: 16.5, color: C.encre }}>{axe.nom}</strong>
                {ecart != null && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: ecart >= 2 ? C.brique : ecart >= 1 ? C.ambre : C.vert,
                      background: hexA(ecart >= 2 ? C.brique : ecart >= 1 ? C.ambre : C.vert, 0.12),
                      padding: "3px 9px",
                      borderRadius: 999,
                    }}
                  >
                    écart {ecart}
                  </span>
                )}
              </div>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: C.gris }}>{axe.desc}</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                {VOIX.map((v) => (
                  <div key={v.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                      <span>{v.icone}</span>
                      <span style={{ fontWeight: 600, fontSize: 14, color: C.encre }}>{v.nom}</span>
                      <span style={{ fontSize: 12, color: C.gris }}>· {v.desc}</span>
                    </div>
                    <Echelle5
                      value={c[v.id] || null}
                      onChange={(n) => setNote(a.axeId, v.id, n)}
                      couleur={v.id === "dirigeant" ? C.terre : C.terreFonce}
                    />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
        <Btn variant="secondary" onClick={onBack}>← Génération</Btn>
        <Btn onClick={onNext} disabled={!complet}>
          {complet ? "Voir la restitution →" : "Compléter les notes"}
        </Btn>
      </div>
    </div>
  );
}
