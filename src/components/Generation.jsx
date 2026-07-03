// Generation.jsx — Étape 2 : l'IA SÉLECTIONNE dans le catalogue et ajuste la
// pondération selon la phase. Fallback catalogue si pas d'IA (voir CLAUDE.md).
import React, { useEffect, useState } from "react";
import { AXE_PAR_ID, SECTEURS, PHASES, C } from "../lib/socle.js";
import { selectionFallback } from "../lib/methode.js";
import { callClaude } from "../lib/api.js";
import { Card, Eyebrow, Btn, Tag, Bar, hexA } from "./ui.jsx";

export default function Generation({ cadre, catalogue, selection, setSelection, onNext, onBack }) {
  const [loading, setLoading] = useState(false);
  const [statut, setStatut] = useState(null); // 'ia' | 'fallback' | null

  useEffect(() => {
    if (!selection) generer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generer() {
    setLoading(true);
    // Socle : sélection catalogue + modulation de phase (toujours calculée).
    const base = selectionFallback(catalogue, cadre.secteur, cadre.phase);
    // Tentative d'affinage IA (facultatif).
    const ajuste = await ajusterParIA(cadre, base, catalogue);
    if (ajuste) {
      setSelection(ajuste);
      setStatut("ia");
    } else {
      setSelection(base);
      setStatut("fallback");
    }
    setLoading(false);
  }

  const secteur = SECTEURS.find((s) => s.id === cadre.secteur);
  const phase = PHASES.find((p) => p.id === cadre.phase);

  return (
    <div>
      <Eyebrow>Étape 2 — Génération du référentiel</Eyebrow>
      <h2 style={{ margin: "0 0 6px", fontSize: 26, color: C.encre }}>Référentiel adaptatif</h2>
      <p style={{ margin: "0 0 20px", color: C.gris, maxWidth: 640 }}>
        7 axes socle invariants, des indicateurs sélectionnés dans le catalogue{" "}
        <strong>{secteur?.nom}</strong> et pondérés pour la phase{" "}
        <strong>{phase?.nom.toLowerCase()}</strong>. L'IA affine la sélection ; sans clé, le
        catalogue seul fait foi.
      </p>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        {loading && <Tag couleur={C.ambre}>⏳ Sélection en cours…</Tag>}
        {!loading && statut === "ia" && <Tag couleur={C.vert}>✓ Sélection affinée par l'IA</Tag>}
        {!loading && statut === "fallback" && <Tag couleur={C.gris}>Mode catalogue (sans IA)</Tag>}
        {!loading && <Btn variant="ghost" onClick={generer} style={{ padding: "6px 12px", fontSize: 13 }}>↻ Régénérer</Btn>}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {(selection?.axes || []).map((a) => {
          const axe = AXE_PAR_ID[a.axeId];
          const retenus = a.indicateurs.filter((i) => i.retenu !== false);
          return (
            <Card key={a.axeId} pad={18}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{axe.icone}</span>
                  <strong style={{ fontSize: 16.5, color: C.encre }}>{axe.nom}</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12.5, color: C.gris }}>poids</span>
                  <div style={{ width: 90 }}>
                    <Bar value={a.poids} max={1.8} couleur={C.terre} height={7} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.terreFonce, minWidth: 34 }}>
                    ×{a.poids?.toFixed(2)}
                  </span>
                </div>
              </div>
              <ul style={{ margin: "12px 0 0", paddingLeft: 20, color: C.encre }}>
                {retenus.map((ind) => (
                  <li key={ind.id} style={{ marginBottom: 5, fontSize: 14.5 }}>
                    {ind.libelle}
                    {ind._ia && <Tag couleur={C.terre} style={{ marginLeft: 8, fontSize: 11 }}>priorisé IA</Tag>}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
        <Btn variant="secondary" onClick={onBack}>← Cadrage</Btn>
        <Btn onClick={onNext} disabled={loading || !selection}>Passer à la collecte →</Btn>
      </div>
    </div>
  );
}

// Demande à l'IA de PRIORISER (pas de générer ex nihilo). Renvoie une sélection
// enrichie, ou null en cas d'indisponibilité / réponse invalide.
async function ajusterParIA(cadre, base, catalogue) {
  const secteur = SECTEURS.find((s) => s.id === cadre.secteur)?.nom;
  const phase = PHASES.find((p) => p.id === cadre.phase)?.nom;
  const catalogueTexte = base.axes
    .map((a) => {
      const nom = AXE_PAR_ID[a.axeId].nom;
      const inds = a.indicateurs.map((i) => `${i.id}: ${i.libelle}`).join(" | ");
      return `AXE ${a.axeId} (${nom}) — ${inds}`;
    })
    .join("\n");

  const system =
    "Tu es le moteur de sélection d'un outil de diagnostic du capital immatériel des PME. " +
    "Tu ne crées JAMAIS d'indicateur : tu choisis parmi ceux fournis et tu signales les plus " +
    "pertinents pour le contexte. Tu réponds uniquement en JSON valide.";
  const prompt =
    `Contexte : entreprise du secteur « ${secteur} », phase « ${phase} ».\n\n` +
    `Catalogue d'indicateurs disponibles (par axe) :\n${catalogueTexte}\n\n` +
    `Pour CHAQUE axe, indique les identifiants d'indicateurs à mettre en avant en priorité ` +
    `pour ce contexte (2 à 3 par axe). Réponds en JSON strict de la forme :\n` +
    `{"prioritaires": {"humain": ["id1","id2"], "organisation": [...], ...}}`;

  const res = await callClaude(prompt, { system, json: true, maxTokens: 900 });
  if (!res || !res.prioritaires) return null;

  const axes = base.axes.map((a) => {
    const prio = res.prioritaires[a.axeId];
    if (!Array.isArray(prio)) return a;
    return {
      ...a,
      indicateurs: a.indicateurs.map((i) => ({ ...i, _ia: prio.includes(i.id) })),
    };
  });
  return { ...base, source: "ia", axes };
}
