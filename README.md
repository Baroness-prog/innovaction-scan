# AR FOR PULSE — Diagnostic adaptatif du capital immatériel

Outil de diagnostic du capital immatériel des PME, à référentiel évolutif, IA embarquée,
lecture business model (modèle GRP de Verstraete) et valorisation goodwill.

## Démarrage rapide

```bash
npm install
cp .env.example .env          # renseigner ANTHROPIC_API_KEY (facultatif)
npm run dev:full              # proxy API + front, http://localhost:5173
```

Sans clé API, l'application tourne en **mode fallback** : le moteur sélectionne les
indicateurs directement dans le catalogue (sans ajustement IA), et les synthèses rédigées
ne sont pas générées. Tout le reste fonctionne.

## Parcours (5 étapes + atelier)

1. **Cadrage** — secteur, taille, phase de l'entreprise.
2. **Génération** — l'IA priorise les indicateurs du catalogue et la phase module la
   pondération des 7 axes. Fallback catalogue si pas d'IA.
3. **Collecte** — 2 voix par axe (dirigeant / terrain), échelle 1–5. L'écart de perception
   est la signature de la méthode.
4. **Restitution** — indice /20, cartographie radar des 7 axes, écarts de perception,
   cartographie GRP (9 composantes), valorisation goodwill bornée, synthèse consultant.
5. **Apprentissage** — le consultant valide/écarte les indicateurs, corrige les poids,
   propose des manquants. Chaque mission est un **vote lissé**, jamais un écrasement.

**Atelier du référentiel** (permanent) — santé du catalogue par secteur, arbitrage des
propositions terrain, export du catalogue enrichi.

## Scripts

| Commande            | Effet                                              |
|---------------------|----------------------------------------------------|
| `npm run dev`       | front seul (Vite, port 5173)                       |
| `npm run server`    | backend proxy API (port 8787)                      |
| `npm run dev:full`  | les deux ensemble                                  |
| `npm run build`     | build de production dans `dist/`                   |
| `npm run preview`   | prévisualise le build                              |

## Poursuivre avec Claude Code

Ouvre le dossier et lance `claude`. Le fichier **CLAUDE.md** donne tout le contexte de la
méthode et les règles métier à respecter (axes socle invariants, valorisation transparente
bornée, lissage des votes).

## Structure

Voir `CLAUDE.md` pour l'architecture détaillée. En résumé :

```
src/
  main.jsx · App.jsx                 point d'entrée + orchestration
  data/catalogue.json                référentiel propriétaire (4 secteurs × 7 axes)
  lib/socle.js                       constantes invariantes (AXES, SECTEURS, palette C…)
  lib/methode.js                     logique pure (GRP, valorisation, catalogueAjuste, indice)
  lib/api.js                         pont IA + persistance localStorage du feedback
  components/…                       UI des 5 étapes + Atelier + cartographies
server/proxy.js                      backend Node qui détient la clé API Anthropic
```

## Références méthodologiques

CIME / IDESO · Thésaurus-Bercy (Goodwill-management) · modèle GRP (Verstraete &
Jouison-Laffitte, Université de Bordeaux). La méthode décrite ici en est une proposition
originale et distincte.
