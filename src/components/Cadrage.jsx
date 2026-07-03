// Cadrage.jsx — Étape 1 : secteur, taille, phase de l'entreprise.
import React from "react";
import { SECTEURS, TAILLES, PHASES, C } from "../lib/socle.js";
import { Card, Eyebrow, Btn, Field, Input, hexA } from "./ui.jsx";

export default function Cadrage({ cadre, setCadre, onNext }) {
  const set = (k, v) => setCadre({ ...cadre, [k]: v });
  const pret = cadre.secteur && cadre.taille && cadre.phase && cadre.entreprise?.trim();

  return (
    <div>
      <Eyebrow>Étape 1 — Cadrage</Eyebrow>
      <h2 style={{ margin: "0 0 6px", fontSize: 26, color: C.encre }}>À qui parle-t-on ?</h2>
      <p style={{ margin: "0 0 24px", color: C.gris, maxWidth: 620 }}>
        Le cadrage détermine quels indicateurs le moteur va sélectionner et comment les 7 axes
        socle sont pondérés. Rien n'est figé : la phase module l'importance des axes.
      </p>

      <Card>
        <Field label="Nom de l'entreprise (mission)">
          <Input
            value={cadre.entreprise || ""}
            onChange={(e) => set("entreprise", e.target.value)}
            placeholder="Ex : Constructions Martin & Fils"
          />
        </Field>

        <Field label="Secteur d'activité">
          <Grille>
            {SECTEURS.map((s) => (
              <Choix key={s.id} on={cadre.secteur === s.id} onClick={() => set("secteur", s.id)}>
                <span style={{ fontSize: 22 }}>{s.icone}</span>
                <span style={{ fontWeight: 600 }}>{s.nom}</span>
              </Choix>
            ))}
          </Grille>
        </Field>

        <Field label="Taille">
          <Grille min={200}>
            {TAILLES.map((t) => (
              <Choix key={t.id} on={cadre.taille === t.id} onClick={() => set("taille", t.id)}>
                <span style={{ fontWeight: 600 }}>{t.nom}</span>
              </Choix>
            ))}
          </Grille>
        </Field>

        <Field label="Phase de vie" hint="Module la pondération des axes (ex : en transmission, l'organisation et le portefeuille client pèsent davantage).">
          <div style={{ display: "grid", gap: 10 }}>
            {PHASES.map((p) => (
              <Choix key={p.id} on={cadre.phase === p.id} onClick={() => set("phase", p.id)} align="flex-start" col>
                <span style={{ fontWeight: 700, color: cadre.phase === p.id ? C.terreFonce : C.encre }}>{p.nom}</span>
                <span style={{ fontSize: 13, color: C.gris }}>{p.desc}</span>
              </Choix>
            ))}
          </div>
        </Field>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <Btn onClick={onNext} disabled={!pret}>Générer le référentiel →</Btn>
        </div>
      </Card>
    </div>
  );
}

function Grille({ children, min = 220 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 10 }}>
      {children}
    </div>
  );
}

function Choix({ children, on, onClick, align = "center", col }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: col ? "column" : "row",
        alignItems: align,
        gap: col ? 3 : 10,
        textAlign: "left",
        fontFamily: "inherit",
        padding: "13px 15px",
        borderRadius: 11,
        cursor: "pointer",
        border: `1.5px solid ${on ? C.terre : C.sable}`,
        background: on ? hexA(C.terre, 0.08) : C.blanc,
        color: C.encre,
        transition: "all .12s",
      }}
    >
      {children}
    </button>
  );
}
