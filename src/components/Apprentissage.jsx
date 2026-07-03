// Apprentissage.jsx — Étape 5 : le consultant valide/écarte les indicateurs,
// corrige les poids, propose des manquants. Chaque action = un VOTE (lissé),
// jamais un écrasement (voir catalogueAjuste dans methode.js).
import React, { useState } from "react";
import { AXE_PAR_ID, C } from "../lib/socle.js";
import { voterIndicateur, voterPoids, proposerIndicateur } from "../lib/api.js";
import { Card, Eyebrow, Btn, MiniBtn, Input, Bar, Tag, hexA } from "./ui.jsx";

export default function Apprentissage({ cadre, selection, feedback, setFeedback, onFinish, onBack }) {
  const [propos, setPropos] = useState({}); // axeId -> texte en cours
  const [dejaVote, setDejaVote] = useState({}); // trace visuelle locale
  const secteurId = cadre.secteur;

  const noteInd = (axeId, indId, garde) => {
    setFeedback(voterIndicateur(feedback, secteurId, axeId, indId, garde));
    setDejaVote((d) => ({ ...d, [`${axeId}.${indId}`]: garde ? "garde" : "ecarte" }));
  };
  const votePoids = (axeId, poids) => {
    setFeedback(voterPoids(feedback, secteurId, axeId, poids));
    setDejaVote((d) => ({ ...d, [`${axeId}.poids`]: poids }));
  };
  const envoyerPropo = (axeId) => {
    const t = (propos[axeId] || "").trim();
    if (!t) return;
    setFeedback(proposerIndicateur(feedback, secteurId, axeId, t));
    setPropos((p) => ({ ...p, [axeId]: "" }));
  };

  return (
    <div>
      <Eyebrow>Étape 5 — Apprentissage</Eyebrow>
      <h2 style={{ margin: "0 0 6px", fontSize: 26, color: C.encre }}>Cette mission fait progresser le référentiel</h2>
      <p style={{ margin: "0 0 22px", color: C.gris, maxWidth: 660 }}>
        Chaque validation est un <strong>vote lissé</strong> : une mission n'écrase jamais le
        catalogue, elle l'infléchit (70 % origine / 30 % signal, à mesure des votes). Vos retours
        alimentent l'Atelier du référentiel.
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {(selection?.axes || []).map((a) => {
          const axe = AXE_PAR_ID[a.axeId];
          const poidsVote = dejaVote[`${a.axeId}.poids`];
          return (
            <Card key={a.axeId} pad={18}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{axe.icone}</span>
                <strong style={{ fontSize: 16.5, color: C.encre }}>{axe.nom}</strong>
              </div>

              {/* Indicateurs : garder / écarter */}
              <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
                {a.indicateurs.map((ind) => {
                  const etat = dejaVote[`${a.axeId}.${ind.id}`];
                  return (
                    <div
                      key={ind.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: 9,
                        background: etat === "garde" ? hexA(C.vert, 0.08) : etat === "ecarte" ? hexA(C.brique, 0.06) : C.creme,
                        opacity: etat === "ecarte" ? 0.6 : 1,
                      }}
                    >
                      <span style={{ flex: 1, fontSize: 14, color: C.encre }}>{ind.libelle}</span>
                      <MiniBtn active={etat === "garde"} onClick={() => noteInd(a.axeId, ind.id, true)} title="Pertinent">
                        ✓ Garder
                      </MiniBtn>
                      <MiniBtn active={etat === "ecarte"} onClick={() => noteInd(a.axeId, ind.id, false)} title="Peu pertinent">
                        ✕ Écarter
                      </MiniBtn>
                    </div>
                  );
                })}
              </div>

              {/* Correction du poids (vote) */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.gris }}>Poids de l'axe ressenti :</span>
                {[0.7, 0.9, 1.1, 1.3, 1.5].map((p) => (
                  <MiniBtn key={p} active={poidsVote === p} onClick={() => votePoids(a.axeId, p)}>
                    ×{p}
                  </MiniBtn>
                ))}
                <span style={{ fontSize: 12.5, color: C.gris }}>(référence catalogue : ×{a.poids?.toFixed(2)})</span>
              </div>

              {/* Proposition d'indicateur manquant */}
              <div style={{ display: "flex", gap: 8 }}>
                <Input
                  value={propos[a.axeId] || ""}
                  onChange={(e) => setPropos((p) => ({ ...p, [a.axeId]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && envoyerPropo(a.axeId)}
                  placeholder="Proposer un indicateur manquant pour cet axe…"
                  style={{ fontSize: 14 }}
                />
                <Btn variant="secondary" onClick={() => envoyerPropo(a.axeId)} style={{ whiteSpace: "nowrap" }}>
                  + Proposer
                </Btn>
              </div>

              {/* Propositions déjà faites pour cet axe/secteur */}
              <PropositionsAxe feedback={feedback} secteurId={secteurId} axeId={a.axeId} />
            </Card>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
        <Btn variant="secondary" onClick={onBack}>← Restitution</Btn>
        <Btn onClick={onFinish}>Terminer la mission ✓</Btn>
      </div>
    </div>
  );
}

function PropositionsAxe({ feedback, secteurId, axeId }) {
  const props = feedback?.[secteurId]?.[axeId]?.propositions || [];
  if (!props.length) return null;
  return (
    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
      {props.map((p) => (
        <Tag key={p.id} couleur={p.statut === "valide" ? C.vert : p.statut === "rejete" ? C.gris : C.ambre}>
          {p.statut === "valide" ? "✓ " : p.statut === "rejete" ? "✕ " : "⏳ "}
          {p.libelle}
        </Tag>
      ))}
    </div>
  );
}
