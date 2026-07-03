// api.js — pont vers l'IA (via le proxy backend) + persistance locale du
// feedback d'apprentissage. Aucune clé API ne transite par le front.

// ─────────────────────────────────────────────────────────────────────────
// callClaude — envoie un prompt au proxy /api/claude. Renvoie le texte de la
// réponse, ou null si l'IA est indisponible (→ l'app bascule en fallback).
//
// opts : { system?, json?: bool, maxTokens? }
export async function callClaude(prompt, opts = {}) {
  try {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        system: opts.system,
        json: !!opts.json,
        maxTokens: opts.maxTokens || 1500,
      }),
    });
    if (!res.ok) {
      // 503 = pas de clé configurée côté serveur → mode fallback attendu.
      return null;
    }
    const data = await res.json();
    if (!data || !data.text) return null;
    if (opts.json) {
      try {
        return JSON.parse(extractJson(data.text));
      } catch {
        return null;
      }
    }
    return data.text;
  } catch {
    // Proxy éteint / réseau : fallback silencieux.
    return null;
  }
}

// Indique si l'IA est disponible (le proxy répond et une clé est configurée).
export async function iaDisponible() {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.ia;
  } catch {
    return false;
  }
}

function extractJson(text) {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  const first = text.indexOf("{");
  const firstArr = text.indexOf("[");
  const start =
    first === -1 ? firstArr : firstArr === -1 ? first : Math.min(first, firstArr);
  if (start === -1) return text;
  const lastObj = text.lastIndexOf("}");
  const lastArr = text.lastIndexOf("]");
  const end = Math.max(lastObj, lastArr);
  return text.slice(start, end + 1);
}

// ─────────────────────────────────────────────────────────────────────────
// Persistance du feedback d'apprentissage (localStorage). Structure décrite
// dans methode.js (catalogueAjuste).
const CLE = "arfp.feedback.v1";

export function loadFeedback() {
  try {
    const raw = localStorage.getItem(CLE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveFeedback(feedback) {
  try {
    localStorage.setItem(CLE, JSON.stringify(feedback));
    return true;
  } catch {
    return false;
  }
}

// Enregistre un vote de poids pour un axe (accumulé, jamais écrasé).
export function voterPoids(feedback, secteurId, axeId, poidsVote) {
  const fb = { ...feedback };
  fb[secteurId] = fb[secteurId] || {};
  fb[secteurId][axeId] = fb[secteurId][axeId] || {};
  const cur = fb[secteurId][axeId].poids || { somme: 0, votes: 0 };
  fb[secteurId][axeId].poids = {
    somme: cur.somme + poidsVote,
    votes: cur.votes + 1,
  };
  return fb;
}

// Enregistre un vote « gardé / écarté » sur un indicateur.
export function voterIndicateur(feedback, secteurId, axeId, indId, garde) {
  const fb = { ...feedback };
  fb[secteurId] = fb[secteurId] || {};
  fb[secteurId][axeId] = fb[secteurId][axeId] || {};
  fb[secteurId][axeId].indicateurs = fb[secteurId][axeId].indicateurs || {};
  const cur = fb[secteurId][axeId].indicateurs[indId] || { gardes: 0, ecartes: 0 };
  if (garde) cur.gardes += 1;
  else cur.ecartes += 1;
  fb[secteurId][axeId].indicateurs[indId] = cur;
  return fb;
}

// Ajoute une proposition d'indicateur venue du terrain (statut « propose »).
export function proposerIndicateur(feedback, secteurId, axeId, libelle) {
  const fb = { ...feedback };
  fb[secteurId] = fb[secteurId] || {};
  fb[secteurId][axeId] = fb[secteurId][axeId] || {};
  fb[secteurId][axeId].propositions = fb[secteurId][axeId].propositions || [];
  fb[secteurId][axeId].propositions.push({
    id: `prop-${secteurId}-${axeId}-${fb[secteurId][axeId].propositions.length + 1}`,
    libelle,
    statut: "propose",
  });
  return fb;
}

// Arbitre une proposition (valide / rejette) — utilisé dans l'Atelier.
export function arbitrerProposition(feedback, secteurId, axeId, propId, statut) {
  const fb = { ...feedback };
  const props = fb?.[secteurId]?.[axeId]?.propositions;
  if (!props) return fb;
  fb[secteurId][axeId].propositions = props.map((p) =>
    p.id === propId ? { ...p, statut } : p
  );
  return fb;
}
