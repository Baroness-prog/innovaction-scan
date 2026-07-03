// socle.js — CONSTANTES INVARIANTES de la méthode AR FOR PULSE.
//
// ⚠️ Les 7 AXES sont le socle comparable de toutes les missions. L'IA ne les
// modifie JAMAIS (voir CLAUDE.md). Seuls les indicateurs (catalogue.json) et
// les pondérations sont contextualisés / appris.

// ─────────────────────────────────────────────────────────────────────────
// Palette AR FOR PULSE (terracotta / crème). Ne pas introduire d'autres
// couleurs sans raison métier.
export const C = {
  terre: "#B85C38", // terracotta principal
  terreFonce: "#8C4426", // terracotta profond (accents, titres)
  terreClair: "#D98B6A", // terracotta clair (survols)
  creme: "#FAF5EC", // fond général
  cremeFonce: "#F0E6D6", // cartes secondaires, séparateurs
  sable: "#E4D5BE", // bordures douces
  encre: "#3A2E28", // texte principal
  gris: "#8A7E74", // texte secondaire
  blanc: "#FFFFFF",
  vert: "#6B8E5A", // signal positif (force)
  ambre: "#D99A4E", // vigilance
  brique: "#A63D40", // alerte / écart de perception fort
};

// ─────────────────────────────────────────────────────────────────────────
// 7 AXES SOCLE — invariants, ordonnés. `poids_ref` ici = pondération neutre ;
// le catalogue par secteur peut différencier, la phase module (voir methode.js).
export const AXES = [
  {
    id: "humain",
    nom: "Capital humain",
    court: "Humain",
    desc: "Compétences, savoir-faire, fidélisation et engagement des équipes.",
    icone: "👥",
    poids_ref: 1.2,
  },
  {
    id: "organisation",
    nom: "Capital organisationnel",
    court: "Organisation",
    desc: "Processus, méthodes, systèmes de gestion, qualité et transmission interne.",
    icone: "⚙️",
    poids_ref: 1.1,
  },
  {
    id: "client",
    nom: "Capital client & marché",
    court: "Client",
    desc: "Portefeuille, fidélité, récurrence, connaissance et proximité marché.",
    icone: "🤝",
    poids_ref: 1.2,
  },
  {
    id: "savoir",
    nom: "Capital savoir & innovation",
    court: "Savoir",
    desc: "Connaissances propriétaires, R&D, capacité d'innovation et d'adaptation.",
    icone: "💡",
    poids_ref: 1.0,
  },
  {
    id: "partenaires",
    nom: "Capital partenarial",
    court: "Partenaires",
    desc: "Fournisseurs, sous-traitants, réseau, alliances et écosystème amont.",
    icone: "🔗",
    poids_ref: 0.9,
  },
  {
    id: "marque",
    nom: "Capital marque & réputation",
    court: "Marque",
    desc: "Notoriété, image, réputation locale, recommandation et différenciation.",
    icone: "✦",
    poids_ref: 1.0,
  },
  {
    id: "numerique",
    nom: "Capital numérique & données",
    court: "Numérique",
    desc: "Outils digitaux, système d'information, données et capital technologique.",
    icone: "🖧",
    poids_ref: 0.9,
  },
];

export const AXE_PAR_ID = Object.fromEntries(AXES.map((a) => [a.id, a]));

// ─────────────────────────────────────────────────────────────────────────
// 4 SECTEURS couverts par le catalogue propriétaire.
export const SECTEURS = [
  { id: "btp", nom: "BTP & construction", icone: "🏗️" },
  { id: "industrie", nom: "Industrie & production", icone: "🏭" },
  { id: "services", nom: "Services", icone: "🛎️" },
  { id: "negoce", nom: "Négoce & distribution", icone: "📦" },
];

// ─────────────────────────────────────────────────────────────────────────
// PHASES de vie de l'entreprise. Chaque phase module les poids des axes
// (facteur multiplicatif appliqué au poids_ref — voir methode.js).
export const PHASES = [
  {
    id: "amorcage",
    nom: "Amorçage / lancement",
    desc: "L'entreprise se structure, cherche ses premiers relais de croissance.",
    // met l'accent sur l'offre, la marque naissante et le savoir
    modulation: { savoir: 1.25, marque: 1.2, client: 1.15, organisation: 0.85 },
  },
  {
    id: "croissance",
    nom: "Croissance",
    desc: "Montée en charge : les process et les équipes doivent suivre le marché.",
    modulation: { organisation: 1.25, humain: 1.2, numerique: 1.15, partenaires: 1.1 },
  },
  {
    id: "maturite",
    nom: "Maturité",
    desc: "Position établie : enjeux de fidélité, d'efficience et de différenciation.",
    modulation: { client: 1.2, marque: 1.15, organisation: 1.1, savoir: 1.05 },
  },
  {
    id: "transmission",
    nom: "Transmission / cession",
    desc: "Préparation d'une cession : la valeur immatérielle doit être lisible et transférable.",
    modulation: { organisation: 1.3, client: 1.2, humain: 1.15, savoir: 1.1 },
  },
];

export const TAILLES = [
  { id: "tpe", nom: "TPE (< 10 salariés)" },
  { id: "petite", nom: "Petite PME (10–49)" },
  { id: "moyenne", nom: "Moyenne PME (50–249)" },
];

// ─────────────────────────────────────────────────────────────────────────
// Les 3 CERCLES du modèle GRP (Verstraete) — Génération / Rémunération /
// Partage de la valeur. Chaque cercle regroupe 3 composantes (voir GRP dans
// methode.js).
export const CERCLES = [
  {
    id: "generation",
    nom: "Génération de la valeur",
    lettre: "G",
    couleur: C.terre,
    desc: "Comment l'entreprise conçoit et fabrique sa proposition de valeur.",
  },
  {
    id: "remuneration",
    nom: "Rémunération de la valeur",
    lettre: "R",
    couleur: C.ambre,
    desc: "Comment cette valeur se transforme en revenus et en performance.",
  },
  {
    id: "partage",
    nom: "Partage de la valeur",
    lettre: "P",
    couleur: C.vert,
    desc: "Comment la valeur est répartie et pérennisée entre les parties prenantes.",
  },
];

// Les 2 voix de la collecte multi-parties prenantes.
export const VOIX = [
  { id: "dirigeant", nom: "Dirigeant", icone: "🎯", desc: "Vision stratégique" },
  { id: "terrain", nom: "Terrain", icone: "🛠️", desc: "Réalité opérationnelle" },
];

// Échelle de notation commune (1 → 5).
export const ECHELLE = [
  { v: 1, label: "Très faible" },
  { v: 2, label: "Faible" },
  { v: 3, label: "Moyen" },
  { v: 4, label: "Solide" },
  { v: 5, label: "Excellent" },
];
