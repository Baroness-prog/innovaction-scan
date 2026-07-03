// Atelier.jsx — Atelier du référentiel (permanent). Tableau de bord de santé du
// catalogue par secteur, arbitrage des propositions terrain, export d'une
// version enrichie (catalogue ajusté par les votes).
import React, { useMemo } from "react";
import { SECTEURS, AXES, AXE_PAR_ID, C } from "../lib/socle.js";
import { catalogueAjuste, santeCatalogue } from "../lib/methode.js";
import { arbitrerProposition, saveFeedback } from "../lib/api.js";
import { Card, Eyebrow, Btn, MiniBtn, Bar, Tag, hexA } from "./ui.jsx";

export default function Atelier({ catalogue, feedback, setFeedback, onFermer }) {
  const ajuste = useMemo(() => catalogueAjuste(catalogue, feedback), [catalogue, feedback]);
  const sante = useMemo(() => santeCatalogue(catalogue, feedback), [catalogue, feedback]);

  const arbitrer = (secteurId, axeId, propId, statut) => {
    const fb = arbitrerProposition(feedback, secteurId, axeId, propId, statut);
    setFeedback(fb);
    saveFeedback(fb);
  };

  const exporter = () => {
    const blob = new Blob([JSON.stringify(ajuste, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "catalogue-enrichi.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Toutes les propositions en attente, tous secteurs.
  const enAttente = [];
  for (const [secteurId, sec] of Object.entries(feedback || {})) {
    for (const [axeId, axe] of Object.entries(sec || {})) {
      for (const p of axe.propositions || []) {
        if (p.statut === "propose") enAttente.push({ secteurId, axeId, p });
      }
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <Eyebrow couleur={C.terreFonce}>Atelier du référentiel</Eyebrow>
          <h2 style={{ margin: "0 0 4px", fontSize: 26, color: C.encre }}>Santé du catalogue propriétaire</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="secondary" onClick={exporter}>⬇ Exporter le catalogue enrichi</Btn>
          <Btn variant="ghost" onClick={onFermer}>Fermer</Btn>
        </div>
      </div>
      <p style={{ margin: "6px 0 22px", color: C.gris, maxWidth: 680 }}>
        Vue transverse alimentée par les missions. L'export produit une version du catalogue avec
        les poids lissés par les votes et les propositions validées intégrées.
      </p>

      {/* Tableau de bord par secteur */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12, marginBottom: 22 }}>
        {SECTEURS.map((s) => {
          const st = sante[s.id] || {};
          return (
            <Card key={s.id} pad={16}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{s.icone}</span>
                <strong style={{ fontSize: 15, color: C.encre }}>{s.nom}</strong>
              </div>
              <Ligne label="Indicateurs" val={st.nbInd ?? 0} />
              <Ligne label="Votes de poids" val={st.votesPoids ?? 0} />
              <Ligne label="Propositions en attente" val={st.propositionsEnAttente ?? 0} couleur={st.propositionsEnAttente ? C.ambre : C.gris} />
            </Card>
          );
        })}
      </div>

      {/* Poids ajustés vs référence, par secteur */}
      <Card style={{ marginBottom: 22 }}>
        <Eyebrow couleur={C.terreFonce}>Poids des axes — origine vs lissé</Eyebrow>
        <div style={{ display: "grid", gap: 18, marginTop: 10 }}>
          {SECTEURS.map((s) => (
            <div key={s.id}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.encre, marginBottom: 8 }}>
                {s.icone} {s.nom}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                {AXES.map((axe) => {
                  const orig = catalogue.secteurs[s.id]?.axes?.[axe.id]?.poids_ref ?? axe.poids_ref;
                  const now = ajuste.secteurs[s.id]?.axes?.[axe.id]?.poids_ref ?? orig;
                  const votes = ajuste.secteurs[s.id]?.axes?.[axe.id]?._votes || 0;
                  const bouge = Math.abs(now - orig) > 0.001;
                  return (
                    <div key={axe.id} style={{ fontSize: 12.5 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ color: C.gris }}>{axe.court}</span>
                        <span style={{ fontWeight: 700, color: bouge ? C.terre : C.gris }}>
                          ×{now.toFixed(2)}
                          {bouge && <span style={{ color: C.gris, fontWeight: 400 }}> (était {orig.toFixed(2)})</span>}
                        </span>
                      </div>
                      <Bar value={now} max={1.8} couleur={bouge ? C.terre : C.sable} height={5} />
                      {votes > 0 && <span style={{ fontSize: 11, color: C.gris }}>{votes} vote{votes > 1 ? "s" : ""}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Arbitrage des propositions terrain */}
      <Card>
        <Eyebrow couleur={C.ambre}>Arbitrage des propositions terrain</Eyebrow>
        {enAttente.length === 0 ? (
          <p style={{ color: C.gris, fontSize: 14, margin: "8px 0 0" }}>Aucune proposition en attente.</p>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
            {enAttente.map(({ secteurId, axeId, p }) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: C.creme,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: C.encre }}>{p.libelle}</div>
                  <div style={{ fontSize: 12, color: C.gris, marginTop: 2 }}>
                    <Tag couleur={C.terre}>{SECTEURS.find((s) => s.id === secteurId)?.nom}</Tag>{" "}
                    <Tag couleur={C.terreFonce}>{AXE_PAR_ID[axeId]?.nom}</Tag>
                  </div>
                </div>
                <MiniBtn onClick={() => arbitrer(secteurId, axeId, p.id, "valide")} title="Intégrer au catalogue">
                  ✓ Valider
                </MiniBtn>
                <MiniBtn onClick={() => arbitrer(secteurId, axeId, p.id, "rejete")} title="Écarter">
                  ✕ Rejeter
                </MiniBtn>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Ligne({ label, val, couleur = C.encre }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "3px 0" }}>
      <span style={{ color: C.gris }}>{label}</span>
      <span style={{ fontWeight: 700, color: couleur }}>{val}</span>
    </div>
  );
}
