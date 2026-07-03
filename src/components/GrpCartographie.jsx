// GrpCartographie.jsx — cartographie des 9 composantes GRP (Génération /
// Rémunération / Partage), projetées depuis les 7 axes socle.
import React from "react";
import { CERCLES, C } from "../lib/socle.js";
import { cartographieGrp } from "../lib/methode.js";
import { Card, Eyebrow, Bar, couleurNote, hexA } from "./ui.jsx";

export default function GrpCartographie({ collecte }) {
  const { parCercle } = cartographieGrp(collecte);

  return (
    <Card>
      <Eyebrow couleur={C.terreFonce}>Lecture business model — modèle GRP</Eyebrow>
      <h3 style={{ margin: "0 0 4px", fontSize: 20, color: C.encre }}>
        Des 7 axes aux 9 composantes du business model
      </h3>
      <p style={{ margin: "0 0 18px", fontSize: 13.5, color: C.gris, maxWidth: 620 }}>
        Chaque composante GRP (Verstraete) est alimentée par une combinaison pondérée des axes.
        Note sur 5.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
        {parCercle.map((cer) => (
          <div
            key={cer.id}
            style={{
              border: `1px solid ${hexA(cer.couleur, 0.35)}`,
              borderRadius: 14,
              overflow: "hidden",
              background: hexA(cer.couleur, 0.04),
            }}
          >
            <div style={{ background: hexA(cer.couleur, 0.12), padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: cer.couleur,
                    color: C.blanc,
                    fontWeight: 800,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                  }}
                >
                  {cer.lettre}
                </span>
                <strong style={{ fontSize: 15, color: C.encre }}>{cer.nom}</strong>
                <span style={{ marginLeft: "auto", fontWeight: 800, color: cer.couleur, fontSize: 15 }}>
                  {cer.moyenne != null ? cer.moyenne.toFixed(1) : "—"}
                </span>
              </div>
            </div>
            <div style={{ padding: "12px 14px", display: "grid", gap: 12 }}>
              {cer.items.map((comp) => (
                <div key={comp.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: C.encre }} title={comp.desc}>
                      {comp.nom}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: couleurNote(comp.note) }}>
                      {comp.note != null ? comp.note.toFixed(1) : "—"}
                    </span>
                  </div>
                  <Bar value={comp.note} max={5} couleur={couleurNote(comp.note)} height={7} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
