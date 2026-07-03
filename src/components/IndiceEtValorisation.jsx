// IndiceEtValorisation.jsx — indice de performance /20 (systématique) +
// valorisation goodwill (optionnelle, transparente et BORNÉE : voir CLAUDE.md).
import React, { useState } from "react";
import { SECTEURS, C } from "../lib/socle.js";
import { valorisation } from "../lib/methode.js";
import { Card, Eyebrow, Bar, Btn, Field, Input, Tag, fmtEuro, hexA } from "./ui.jsx";

export default function IndiceEtValorisation({ cadre, indiceObj, fin, setFin }) {
  const [ouvert, setOuvert] = useState(false);
  const note20 = indiceObj?.note20;
  const val = valorisation(fin, note20, cadre.secteur);
  const secteur = SECTEURS.find((s) => s.id === cadre.secteur);

  return (
    <Card>
      <Eyebrow couleur={C.terreFonce}>Indice & valorisation</Eyebrow>

      {/* Indice /20 */}
      <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center", minWidth: 130 }}>
          <div style={{ fontSize: 52, fontWeight: 800, color: C.terre, lineHeight: 1 }}>
            {note20 != null ? note20.toFixed(1) : "—"}
            <span style={{ fontSize: 22, color: C.gris, fontWeight: 600 }}> /20</span>
          </div>
          <div style={{ fontSize: 12.5, color: C.gris, marginTop: 6 }}>Indice de performance immatérielle</div>
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <Bar value={note20} max={20} couleur={C.terre} height={13} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.gris, marginTop: 6 }}>
            <span>Fragile</span>
            <span>À consolider</span>
            <span>Solide</span>
            <span>Remarquable</span>
          </div>
          <p style={{ fontSize: 13, color: C.gris, margin: "10px 0 0" }}>{lecture(note20)}</p>
        </div>
      </div>

      <hr style={{ border: 0, borderTop: `1px solid ${C.sable}`, margin: "20px 0" }} />

      {/* Valorisation goodwill (optionnelle) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <strong style={{ fontSize: 16, color: C.encre }}>Valorisation goodwill</strong>
          <Tag couleur={C.gris} style={{ marginLeft: 10 }}>optionnelle</Tag>
          <p style={{ fontSize: 13, color: C.gris, margin: "4px 0 0", maxWidth: 560 }}>
            Estimation indicative de la part immatérielle de la valeur, à partir de quelques
            données financières. <strong>Fourchette</strong>, jamais un chiffre unique — et non
            opposable.
          </p>
        </div>
        <Btn variant="secondary" onClick={() => setOuvert((o) => !o)}>
          {ouvert ? "Masquer" : "Saisir les données financières"}
        </Btn>
      </div>

      {ouvert && (
        <div style={{ marginTop: 16, background: C.creme, borderRadius: 12, padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            <Field label="Chiffre d'affaires (€)" hint="Facultatif">
              <Input inputMode="numeric" value={fin.ca || ""} onChange={(e) => setFin({ ...fin, ca: e.target.value })} placeholder="Ex : 2 500 000" />
            </Field>
            <Field label="EBE (€)" hint="Excédent brut d'exploitation — priorité si saisi">
              <Input inputMode="numeric" value={fin.ebe || ""} onChange={(e) => setFin({ ...fin, ebe: e.target.value })} placeholder="Ex : 220 000" />
            </Field>
            <Field label="Résultat (€)" hint="Utilisé à défaut d'EBE">
              <Input inputMode="numeric" value={fin.resultat || ""} onChange={(e) => setFin({ ...fin, resultat: e.target.value })} placeholder="Ex : 150 000" />
            </Field>
          </div>

          {val ? (
            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  gap: 18,
                  padding: "14px 0",
                }}
              >
                <Borne label="Bas" val={val.bas} fort={false} />
                <Borne label="Central" val={val.centrale} fort />
                <Borne label="Haut" val={val.haut} fort={false} />
              </div>

              <details style={{ marginTop: 6 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.terreFonce }}>
                  Hypothèses de calcul (transparence)
                </summary>
                <ul style={{ fontSize: 13, color: C.gris, margin: "10px 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                  <li>Base normative retenue : <strong>{fmtEuro(val.hypotheses.base)}</strong> ({val.hypotheses.baseSource}).</li>
                  <li>Multiple sectoriel ({secteur?.nom}) : <strong>×{val.hypotheses.multiple}</strong> (années de rente immatérielle capitalisées).</li>
                  <li>Coefficient qualité (indice {val.hypotheses.note20}/20) : <strong>×{val.hypotheses.coefQualite}</strong>.</li>
                  <li>Fourchette d'incertitude appliquée : <strong>±{Math.round(val.hypotheses.margeIncertitude * 100)} %</strong>.</li>
                </ul>
                <p style={{ fontSize: 12.5, color: C.brique, marginTop: 10, background: hexA(C.brique, 0.08), padding: "8px 10px", borderRadius: 8 }}>
                  ⚠️ Estimation indicative destinée au dialogue, <strong>non opposable</strong>. À confirmer
                  par un expert-comptable ou un évaluateur.
                </p>
              </details>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: C.gris, marginTop: 12 }}>
              Renseignez au moins un montant (EBE, résultat ou CA) pour obtenir une fourchette.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function Borne({ label, val, fort }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 11.5, color: C.gris, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: fort ? 26 : 18, fontWeight: 800, color: fort ? C.terre : C.gris }}>
        {fmtEuro(val)}
      </div>
    </div>
  );
}

function lecture(n) {
  if (n == null) return "";
  if (n >= 15) return "Capital immatériel remarquable : un actif différenciant et transférable.";
  if (n >= 11) return "Capital immatériel solide, avec des leviers d'amélioration ciblés.";
  if (n >= 7) return "Base à consolider : des axes structurants restent à sécuriser.";
  return "Capital immatériel fragile : priorité à la structuration avant valorisation.";
}
