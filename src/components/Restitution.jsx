// Restitution.jsx — Étape 4 : note /20, cartographie 7 axes, écarts de
// perception, cartographie GRP, indice + valorisation, synthèse consultant IA.
import React, { useEffect, useState } from "react";
import { AXES, AXE_PAR_ID, SECTEURS, PHASES, C } from "../lib/socle.js";
import { indice, ecarts, noteAxe, poidsEffectifs, cartographieGrp } from "../lib/methode.js";
import { callClaude } from "../lib/api.js";
import { Card, Eyebrow, Btn, Tag, Bar, couleurNote, hexA } from "./ui.jsx";
import GrpCartographie from "./GrpCartographie.jsx";
import IndiceEtValorisation from "./IndiceEtValorisation.jsx";

export default function Restitution({ cadre, catalogue, collecte, fin, setFin, onNext, onBack }) {
  const secteur = catalogue.secteurs[cadre.secteur];
  const poids = poidsEffectifs(secteur, cadre.phase);
  const indiceObj = indice(collecte, poids);
  const lesEcarts = ecarts(collecte);
  const secteurNom = SECTEURS.find((s) => s.id === cadre.secteur)?.nom;
  const phaseNom = PHASES.find((p) => p.id === cadre.phase)?.nom;

  return (
    <div>
      <Eyebrow>Étape 4 — Restitution</Eyebrow>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 26, color: C.encre }}>
          {cadre.entreprise || "Diagnostic"}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Tag couleur={C.terre}>{secteurNom}</Tag>
          <Tag couleur={C.terreFonce}>{phaseNom}</Tag>
        </div>
      </div>
      <p style={{ margin: "0 0 22px", color: C.gris }}>Livrable de synthèse du diagnostic du capital immatériel.</p>

      <div style={{ display: "grid", gap: 16 }}>
        <IndiceEtValorisation cadre={cadre} indiceObj={indiceObj} fin={fin} setFin={setFin} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <CartographieAxes collecte={collecte} />
          <EcartsPerception ecarts={lesEcarts} />
        </div>

        <GrpCartographie collecte={collecte} />

        <SyntheseConsultant
          cadre={cadre}
          indiceObj={indiceObj}
          collecte={collecte}
          ecarts={lesEcarts}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
        <Btn variant="secondary" onClick={onBack}>← Collecte</Btn>
        <Btn onClick={onNext}>Atelier d'apprentissage →</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Cartographie radar des 7 axes, 2 voix superposées (dirigeant / terrain).
function CartographieAxes({ collecte }) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 46;
  const n = AXES.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];

  const serie = (voix) =>
    AXES.map((axe, i) => {
      const c = collecte[axe.id] || {};
      const v = c[voix] || 0;
      return point(i, (v / 5) * R);
    });
  const path = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";

  const dir = serie("dirigeant");
  const ter = serie("terrain");

  return (
    <Card>
      <Eyebrow couleur={C.terreFonce}>Cartographie des 7 axes socle</Eyebrow>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* toile */}
          {[1, 2, 3, 4, 5].map((k) => (
            <polygon
              key={k}
              points={AXES.map((_, i) => point(i, (k / 5) * R).join(",")).join(" ")}
              fill="none"
              stroke={C.sable}
              strokeWidth={0.8}
            />
          ))}
          {AXES.map((_, i) => {
            const [x, y] = point(i, R);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.sable} strokeWidth={0.8} />;
          })}
          {/* terrain */}
          <path d={path(ter)} fill={hexA(C.terreFonce, 0.14)} stroke={C.terreFonce} strokeWidth={1.6} />
          {/* dirigeant */}
          <path d={path(dir)} fill={hexA(C.terre, 0.14)} stroke={C.terre} strokeWidth={1.6} />
          {/* labels */}
          {AXES.map((axe, i) => {
            const [x, y] = point(i, R + 22);
            return (
              <text
                key={axe.id}
                x={x}
                y={y}
                fontSize={11}
                fontWeight={600}
                fill={C.gris}
                textAnchor={Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end"}
                dominantBaseline="middle"
              >
                {axe.court}
              </text>
            );
          })}
        </svg>
      </div>
      <div style={{ display: "flex", gap: 18, justifyContent: "center", fontSize: 13, marginTop: 4 }}>
        <Legende couleur={C.terre} label="Dirigeant" />
        <Legende couleur={C.terreFonce} label="Terrain" />
      </div>
    </Card>
  );
}

function Legende({ couleur, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 14, height: 3, background: couleur, borderRadius: 2, display: "inline-block" }} />
      <span style={{ color: C.gris, fontWeight: 600 }}>{label}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function EcartsPerception({ ecarts }) {
  return (
    <Card>
      <Eyebrow couleur={C.brique}>Écarts de perception — la signature</Eyebrow>
      <p style={{ fontSize: 13, color: C.gris, margin: "0 0 14px" }}>
        Là où dirigeant et terrain divergent le plus : ni « bon » ni « mauvais », mais des points
        de dialogue prioritaires.
      </p>
      <div style={{ display: "grid", gap: 11 }}>
        {ecarts.length === 0 && <span style={{ color: C.gris, fontSize: 14 }}>Aucun axe noté par les deux voix.</span>}
        {ecarts.map((e) => {
          const axe = AXE_PAR_ID[e.axeId];
          const coul = e.ecart >= 2 ? C.brique : e.ecart >= 1 ? C.ambre : C.vert;
          return (
            <div key={e.axeId}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: C.encre }}>
                  {axe.icone} {axe.court}
                </span>
                <span style={{ color: C.gris, fontSize: 13 }}>
                  dir. {e.dirigeant} · ter. {e.terrain}{" "}
                  <strong style={{ color: coul }}>· écart {e.ecart}</strong>
                </span>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <div style={{ flex: 1 }}><Bar value={e.dirigeant} couleur={C.terre} height={6} /></div>
                <div style={{ flex: 1 }}><Bar value={e.terrain} couleur={C.terreFonce} height={6} /></div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Synthèse rédigée par l'IA (facultatif). Fallback : synthèse structurée locale.
function SyntheseConsultant({ cadre, indiceObj, collecte, ecarts }) {
  const [texte, setTexte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(null);

  async function generer() {
    setLoading(true);
    const t = await syntheseIA(cadre, indiceObj, collecte, ecarts);
    if (t) {
      setTexte(t);
      setSource("ia");
    } else {
      setTexte(syntheseLocale(cadre, indiceObj, ecarts));
      setSource("local");
    }
    setLoading(false);
  }

  useEffect(() => {
    generer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <Eyebrow couleur={C.terreFonce}>Synthèse consultant</Eyebrow>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {source === "ia" && <Tag couleur={C.vert}>rédigée par l'IA</Tag>}
          {source === "local" && <Tag couleur={C.gris}>synthèse structurée (sans IA)</Tag>}
          <Btn variant="ghost" onClick={generer} disabled={loading} style={{ padding: "5px 10px", fontSize: 13 }}>
            {loading ? "…" : "↻"}
          </Btn>
        </div>
      </div>
      <div style={{ fontSize: 14.5, color: C.encre, lineHeight: 1.65, whiteSpace: "pre-wrap", marginTop: 8 }}>
        {loading && !texte ? "Rédaction en cours…" : texte}
      </div>
    </Card>
  );
}

async function syntheseIA(cadre, indiceObj, collecte, ecarts) {
  const secteur = SECTEURS.find((s) => s.id === cadre.secteur)?.nom;
  const phase = PHASES.find((p) => p.id === cadre.phase)?.nom;
  const notes = AXES.map((a) => {
    const n = noteAxe(collecte, a.id);
    return n ? `${a.nom}: dirigeant ${n.dirigeant}, terrain ${n.terrain} (écart ${n.ecart})` : null;
  })
    .filter(Boolean)
    .join("\n");

  const system =
    "Tu es consultant senior en transformation d'entreprise (cabinet AR FOR PULSE, Bordeaux). " +
    "Tu rédiges des synthèses de diagnostic du capital immatériel, en français, avec sobriété et " +
    "précision. Pas de langue de bois, pas de superlatifs creux. Tu t'appuies sur les écarts de " +
    "perception comme matière de dialogue. 180 mots maximum.";
  const prompt =
    `Entreprise : ${cadre.entreprise || "PME"} — secteur ${secteur}, phase ${phase}.\n` +
    `Indice de performance immatérielle : ${indiceObj.note20}/20.\n\n` +
    `Notes par axe (dirigeant / terrain) :\n${notes}\n\n` +
    `Rédige une synthèse en 3 courts paragraphes : (1) lecture d'ensemble, (2) le principal ` +
    `écart de perception et ce qu'il révèle, (3) 2 leviers prioritaires concrets. Sans titre.`;

  return await callClaude(prompt, { system, maxTokens: 600 });
}

function syntheseLocale(cadre, indiceObj, ecarts) {
  const note = indiceObj.note20;
  const fort = ecarts[0];
  const niveau =
    note >= 15 ? "remarquable" : note >= 11 ? "solide" : note >= 7 ? "à consolider" : "fragile";
  const l1 = `Avec un indice de performance immatérielle de ${note}/20, le capital immatériel de ${
    cadre.entreprise || "l'entreprise"
  } apparaît ${niveau}. Cette lecture agrège les 7 axes socle pondérés pour la phase de l'entreprise.`;
  const l2 = fort
    ? `Le principal écart de perception porte sur « ${AXE_PAR_ID[fort.axeId].nom} » (dirigeant ${
        fort.dirigeant
      }, terrain ${fort.terrain}). Un écart de ${fort.ecart} point${fort.ecart > 1 ? "s" : ""} signale ${
        fort.dirigeant > fort.terrain
          ? "une confiance de la direction que le terrain ne partage pas encore"
          : "une ressource sous-estimée par la direction"
      } : c'est un point de dialogue prioritaire.`
    : "Les perceptions dirigeant / terrain sont globalement alignées.";
  const l3 =
    "Leviers prioritaires : sécuriser les axes les plus faibles avant d'envisager toute valorisation, et " +
    "traiter en atelier l'écart de perception le plus marqué pour transformer la divergence en plan d'action partagé.";
  return `${l1}\n\n${l2}\n\n${l3}`;
}
