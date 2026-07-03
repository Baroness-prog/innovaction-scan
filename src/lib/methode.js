// methode.js — LOGIQUE PURE de la méthode AR FOR PULSE.
// Aucune dépendance React ni I/O. Testable isolément (cf. backlog CLAUDE.md).

import { AXES, AXE_PAR_ID, PHASES, CERCLES } from "./socle.js";

// ═══════════════════════════════════════════════════════════════════════════
// 1. MAPPING GRP — relie les 7 axes socle aux 9 composantes du business model
//    (modèle GRP de Verstraete : Génération / Rémunération / Partage).
//    Chaque composante = combinaison pondérée d'axes. Les poids `w` d'une
//    composante somment à 1. Toute modification doit être documentée (CLAUDE.md).
// ═══════════════════════════════════════════════════════════════════════════
export const GRP = [
  // — Génération de la valeur —
  {
    id: "g-proposition",
    cercle: "generation",
    nom: "Proposition de valeur",
    desc: "L'offre et sa promesse : ce que l'entreprise apporte de différenciant.",
    axes: { client: 0.4, marque: 0.4, savoir: 0.2 },
  },
  {
    id: "g-fabrication",
    cercle: "generation",
    nom: "Fabrication de la valeur",
    desc: "Les compétences et l'organisation qui produisent concrètement la valeur.",
    axes: { humain: 0.4, organisation: 0.35, savoir: 0.25 },
  },
  {
    id: "g-reseau",
    cercle: "generation",
    nom: "Réseau amont",
    desc: "Les ressources et partenaires mobilisés pour générer la valeur.",
    axes: { partenaires: 0.6, organisation: 0.2, numerique: 0.2 },
  },
  // — Rémunération de la valeur —
  {
    id: "r-revenus",
    cercle: "remuneration",
    nom: "Sources de revenus",
    desc: "La capacité du marché et de la marque à transformer la valeur en chiffre.",
    axes: { client: 0.5, marque: 0.3, numerique: 0.2 },
  },
  {
    id: "r-performance",
    cercle: "remuneration",
    nom: "Performance économique",
    desc: "L'efficience organisationnelle et humaine au service de la rentabilité.",
    axes: { organisation: 0.4, humain: 0.3, savoir: 0.3 },
  },
  {
    id: "r-structure",
    cercle: "remuneration",
    nom: "Structure de coûts",
    desc: "La maîtrise des coûts via l'organisation, les partenaires et les outils.",
    axes: { organisation: 0.4, partenaires: 0.3, numerique: 0.3 },
  },
  // — Partage de la valeur —
  {
    id: "p-internes",
    cercle: "partage",
    nom: "Parties prenantes internes",
    desc: "Le partage de la valeur avec les équipes et la gouvernance.",
    axes: { humain: 0.6, organisation: 0.4 },
  },
  {
    id: "p-externes",
    cercle: "partage",
    nom: "Parties prenantes externes",
    desc: "Le lien de valeur avec clients, territoire et prescripteurs.",
    axes: { client: 0.5, marque: 0.3, partenaires: 0.2 },
  },
  {
    id: "p-perennite",
    cercle: "partage",
    nom: "Conventions & pérennité",
    desc: "Ce qui rend la valeur transférable et durable (contrats, écosystème, SI).",
    axes: { partenaires: 0.35, organisation: 0.35, numerique: 0.3 },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 2. NOTES PAR AXE — à partir de la collecte 2 voix (dirigeant / terrain), 1–5.
// ═══════════════════════════════════════════════════════════════════════════

// Renvoie { dirigeant, terrain, moyenne, ecart } pour un axe, ou null si non noté.
export function noteAxe(collecte, axeId) {
  const c = collecte?.[axeId];
  if (!c) return null;
  const d = num(c.dirigeant);
  const t = num(c.terrain);
  if (d == null && t == null) return null;
  if (d == null) return { dirigeant: null, terrain: t, moyenne: t, ecart: null };
  if (t == null) return { dirigeant: d, terrain: null, moyenne: d, ecart: null };
  return {
    dirigeant: d,
    terrain: t,
    moyenne: (d + t) / 2,
    ecart: Math.abs(d - t), // écart de perception : signature de la méthode
  };
}

// Poids effectif d'un axe = poids sectoriel × modulation de phase.
export function poidsEffectifs(catalogueSecteur, phaseId) {
  const phase = PHASES.find((p) => p.id === phaseId);
  const mod = phase?.modulation || {};
  const out = {};
  for (const axe of AXES) {
    const base = catalogueSecteur?.axes?.[axe.id]?.poids_ref ?? axe.poids_ref;
    out[axe.id] = base * (mod[axe.id] ?? 1);
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. INDICE DE PERFORMANCE IMMATÉRIELLE /20 — systématique.
//    Moyenne des axes (1–5) pondérée par les poids effectifs, ramenée sur 20.
// ═══════════════════════════════════════════════════════════════════════════
export function indice(collecte, poids) {
  let sommeP = 0;
  let sommePondere = 0;
  const detail = [];
  for (const axe of AXES) {
    const n = noteAxe(collecte, axe.id);
    if (!n) continue;
    const w = poids?.[axe.id] ?? axe.poids_ref;
    sommeP += w;
    sommePondere += n.moyenne * w;
    detail.push({ axeId: axe.id, moyenne: n.moyenne, poids: w });
  }
  if (sommeP === 0) return { note20: null, sur5: null, detail: [] };
  const sur5 = sommePondere / sommeP; // 1..5
  const note20 = ((sur5 - 1) / 4) * 20; // 0..20
  return { note20: round(note20, 1), sur5: round(sur5, 2), detail };
}

// Écarts de perception triés du plus fort au plus faible.
export function ecarts(collecte) {
  return AXES.map((axe) => {
    const n = noteAxe(collecte, axe.id);
    return n && n.ecart != null ? { axeId: axe.id, ecart: n.ecart, ...n } : null;
  })
    .filter(Boolean)
    .sort((a, b) => b.ecart - a.ecart);
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. NOTE PAR COMPOSANTE GRP — projection des notes d'axes sur le mapping.
// ═══════════════════════════════════════════════════════════════════════════
export function noteComposante(collecte, composante) {
  let sommeW = 0;
  let acc = 0;
  for (const [axeId, w] of Object.entries(composante.axes)) {
    const n = noteAxe(collecte, axeId);
    if (!n) continue;
    acc += n.moyenne * w;
    sommeW += w;
  }
  if (sommeW === 0) return null;
  return round(acc / sommeW, 2); // 1..5
}

export function cartographieGrp(collecte) {
  const composantes = GRP.map((comp) => ({
    ...comp,
    note: noteComposante(collecte, comp),
  }));
  const parCercle = CERCLES.map((cer) => {
    const items = composantes.filter((c) => c.cercle === cer.id);
    const notes = items.map((i) => i.note).filter((v) => v != null);
    const moyenne = notes.length
      ? round(notes.reduce((a, b) => a + b, 0) / notes.length, 2)
      : null;
    return { ...cer, items, moyenne };
  });
  return { composantes, parCercle };
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. VALORISATION GOODWILL — OPTIONNELLE, TRANSPARENTE et BORNÉE.
//    Toujours une FOURCHETTE, jamais un point. Hypothèses affichées.
//    ⚠️ Indicatif, non opposable, à confirmer par un expert (CLAUDE.md).
//
//    Méthode de la rente de goodwill (superprofit) simplifiée :
//      base normative      = EBE (ou résultat, ou CA × marge sectorielle)
//      coefficient qualité = f(indice/20) ∈ [0,6 ; 1,4]
//      multiple sectoriel  = années de rente capitalisées
//      valeur centrale     = base × multiple × coef_qualité
//      fourchette          = ± marge d'incertitude
// ═══════════════════════════════════════════════════════════════════════════

// Multiples sectoriels indicatifs (années de rente immatérielle capitalisées).
const MULTIPLE_SECTEUR = { btp: 2.5, industrie: 3.5, services: 3.0, negoce: 2.8 };
// Marge d'EBE indicative si l'EBE n'est pas saisi (fallback sur CA).
const MARGE_EBE_SECTEUR = { btp: 0.08, industrie: 0.1, services: 0.12, negoce: 0.06 };
const MARGE_INCERTITUDE = 0.2; // ±20 % autour de la valeur centrale

// fin : { ca, ebe, resultat } (euros, tous facultatifs). note20 : indice /20.
export function valorisation(fin, note20, secteurId) {
  if (!fin || note20 == null) return null;
  const ca = num(fin.ca);
  const ebe = num(fin.ebe);
  const resultat = num(fin.resultat);
  const margeEbe = MARGE_EBE_SECTEUR[secteurId] ?? 0.09;

  let base = null;
  let baseSource = null;
  if (ebe != null && ebe > 0) {
    base = ebe;
    baseSource = "EBE saisi";
  } else if (resultat != null && resultat > 0) {
    base = resultat;
    baseSource = "résultat saisi";
  } else if (ca != null && ca > 0) {
    base = ca * margeEbe;
    baseSource = `CA × marge EBE indicative (${pct(margeEbe)})`;
  }
  if (base == null || base <= 0) return null; // pas assez de données financières

  const multiple = MULTIPLE_SECTEUR[secteurId] ?? 3.0;
  // coefficient qualité : 0,6 (indice 0) → 1,0 (indice 10) → 1,4 (indice 20)
  const coefQualite = round(0.6 + (note20 / 20) * 0.8, 3);

  const centrale = base * multiple * coefQualite;
  const bas = centrale * (1 - MARGE_INCERTITUDE);
  const haut = centrale * (1 + MARGE_INCERTITUDE);

  return {
    bas: Math.round(bas),
    centrale: Math.round(centrale),
    haut: Math.round(haut),
    hypotheses: {
      base: Math.round(base),
      baseSource,
      multiple,
      coefQualite,
      margeIncertitude: MARGE_INCERTITUDE,
      note20,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. APPRENTISSAGE — catalogueAjuste : applique les votes (feedback) au
//    catalogue SANS écrasement brutal. Lissage : la cible est 70 % origine /
//    30 % signal, atteinte progressivement avec le nombre de votes.
//      confiance      = votes / (votes + K)          (saturation douce)
//      poids_ajuste   = origine·(1 − 0,3·confiance) + signal·0,3·confiance
//    → un seul vote déplace peu ; le régime 70/30 est l'asymptote.
// ═══════════════════════════════════════════════════════════════════════════
const K_VOTES = 5; // demi-saturation : il faut ~K votes pour peser réellement
const PART_SIGNAL = 0.3; // asymptote : 30 % de poids maximal donné au signal

// catalogue : le catalogue.json complet. feedback : voir shape ci-dessous.
// feedback[secteur][axe] = { poids: { somme, votes }, indicateurs: { [id]: {gardes, ecartes} }, propositions: [...] }
export function catalogueAjuste(catalogue, feedback) {
  const out = structuredCloneSafe(catalogue);
  if (!feedback) return out;
  for (const [secteurId, secteur] of Object.entries(out.secteurs || {})) {
    const fbSecteur = feedback[secteurId];
    if (!fbSecteur) continue;
    for (const [axeId, axe] of Object.entries(secteur.axes || {})) {
      const fbAxe = fbSecteur[axeId];
      if (!fbAxe) continue;
      // Lissage du poids
      if (fbAxe.poids && fbAxe.poids.votes > 0) {
        const votes = fbAxe.poids.votes;
        const signal = fbAxe.poids.somme / votes; // poids moyen voté
        const confiance = votes / (votes + K_VOTES);
        const part = PART_SIGNAL * confiance;
        axe.poids_ref = round(axe.poids_ref * (1 - part) + signal * part, 3);
        axe._votes = votes; // trace pour l'atelier
      }
      // Annotation des indicateurs (santé) + intégration des propositions retenues
      if (fbAxe.indicateurs) {
        for (const ind of axe.indicateurs) {
          const s = fbAxe.indicateurs[ind.id];
          if (s) {
            ind._gardes = s.gardes || 0;
            ind._ecartes = s.ecartes || 0;
            const tot = (s.gardes || 0) + (s.ecartes || 0);
            ind._sante = tot ? round((s.gardes || 0) / tot, 2) : null;
          }
        }
      }
      // Propositions terrain validées → intègrent le catalogue ajusté
      if (Array.isArray(fbAxe.propositions)) {
        for (const p of fbAxe.propositions) {
          if (p.statut === "valide" && !axe.indicateurs.some((i) => i.id === p.id)) {
            axe.indicateurs.push({ id: p.id, libelle: p.libelle, _propose: true });
          }
        }
      }
    }
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. SÉLECTION FALLBACK (sans IA) — choisit les indicateurs par axe dans le
//    catalogue et applique la modulation de phase aux poids. L'IA, si présente,
//    ne fait qu'affiner ce socle (voir Generation.jsx / api.js).
// ═══════════════════════════════════════════════════════════════════════════
export function selectionFallback(catalogue, secteurId, phaseId) {
  const secteur = catalogue?.secteurs?.[secteurId];
  if (!secteur) return null;
  const poids = poidsEffectifs(secteur, phaseId);
  const axes = AXES.map((axe) => ({
    axeId: axe.id,
    poids: round(poids[axe.id], 3),
    indicateurs: (secteur.axes?.[axe.id]?.indicateurs || []).map((i) => ({
      ...i,
      retenu: true,
    })),
  }));
  return { source: "catalogue", secteur: secteurId, phase: phaseId, axes };
}

// Statistiques de santé du catalogue par secteur (pour l'Atelier).
export function santeCatalogue(catalogue, feedback) {
  const out = {};
  for (const [secteurId, secteur] of Object.entries(catalogue?.secteurs || {})) {
    let nbInd = 0;
    let votesPoids = 0;
    let propositions = 0;
    for (const axe of Object.values(secteur.axes || {})) {
      nbInd += axe.indicateurs?.length || 0;
    }
    const fbS = feedback?.[secteurId];
    if (fbS) {
      for (const fbAxe of Object.values(fbS)) {
        votesPoids += fbAxe.poids?.votes || 0;
        propositions += (fbAxe.propositions || []).filter((p) => p.statut === "propose").length;
      }
    }
    out[secteurId] = { nbInd, votesPoids, propositionsEnAttente: propositions };
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers
function num(v) {
  if (v === "" || v == null) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
function round(v, d = 2) {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}
function pct(v) {
  return `${round(v * 100, 1)} %`;
}
function structuredCloneSafe(o) {
  if (typeof structuredClone === "function") return structuredClone(o);
  return JSON.parse(JSON.stringify(o));
}

export const _helpers = { num, round }; // exposés pour les tests
