# AR FOR PULSE — Diagnostic adaptatif du capital immatériel

Contexte pour Claude Code. Lis ce fichier avant toute modification.

## Ce que fait ce projet

Outil de diagnostic du **capital immatériel** des PME (BTP, industrie, services, négoce),
conçu pour AR FOR PULSE (cabinet de transformation, Bordeaux). Il se distingue des
référentiels figés (CIME/IDESO, Thésaurus-Bercy) par trois partis pris :

1. **Référentiel adaptatif à deux couches** : 7 axes socle invariants (comparabilité)
   + une couche d'indicateurs contextualisés par IA selon secteur et phase.
2. **Articulation avec le modèle GRP** (Verstraete, Bordeaux) : les 7 axes alimentent
   les 9 composantes du business model (Génération / Rémunération / Partage).
3. **Collecte multi-parties prenantes** : chaque axe est noté par le dirigeant ET le
   terrain ; l'**écart de perception** est la signature de la méthode.

Deux couches finales : un **indice de performance immatérielle** /20 (systématique) et
une **valorisation goodwill** en euros (optionnelle, si données financières saisies).

## Parcours utilisateur (5 étapes + atelier)

1. **Cadrage** — secteur, taille, phase.
2. **Génération** — l'IA SÉLECTIONNE dans le catalogue (ne génère pas ex nihilo) et
   ajuste la pondération selon la phase. Fallback catalogue si pas d'IA.
3. **Collecte** — 2 voix par axe (dirigeant / terrain), échelle 1–5.
4. **Restitution** — note /20, cartographie 7 axes, écarts de perception, cartographie
   GRP (9 composantes), indice + valorisation, synthèse consultant rédigée par l'IA.
5. **Apprentissage** — le consultant valide/écarte les indicateurs, corrige les poids,
   propose des manquants. Chaque mission = un VOTE (lissé), pas un écrasement.
- **Atelier du référentiel** (permanent) — tableau de bord de santé du catalogue par
  secteur + arbitrage des propositions terrain + export d'une version enrichie.

## Architecture des fichiers

```
src/
  main.jsx                 point d'entrée
  App.jsx                  orchestration des étapes + atelier
  data/catalogue.json      LE référentiel propriétaire (4 secteurs × 7 axes)
  lib/
    socle.js               constantes invariantes : AXES, SECTEURS, palette C, CERCLES
    methode.js             logique pure : mapping GRP, valorisation goodwill, catalogueAjuste
    api.js                 callClaude (via proxy) + loadFeedback/saveFeedback (localStorage)
  components/
    ui.jsx                 atomes UI (Btn, Card, Eyebrow, Bar, MiniBtn)
    Cadrage / Generation / Collecte / Restitution / Apprentissage / Atelier
    GrpCartographie.jsx    cartographie des 9 composantes GRP
    IndiceEtValorisation.jsx  indice /20 + valorisation goodwill
server/proxy.js            backend Node qui détient la clé API Anthropic
```

## Règles métier à NE PAS casser

- **Les 7 axes socle sont invariants.** L'IA ne les modifie jamais. Voir `AXES` dans socle.js.
- **La valorisation est transparente et bornée.** Toujours une FOURCHETTE, jamais un point.
  Les hypothèses (taux, multiple, coefficient qualité) sont affichées à l'écran. Voir
  `valorisation()` dans methode.js. Ne jamais produire une valorisation opposable : c'est
  indicatif, à confirmer par un expert.
- **L'apprentissage lisse les votes.** Une mission ne doit pas réécrire brutalement un poids.
  Voir `catalogueAjuste()` — lissage 70% origine / 30% signal, pondéré par le nb de votes.
- **Le mapping GRP** (constante `GRP` dans methode.js) relie axes → composantes. Modifiable,
  mais documenter tout changement de pondération `w`.

## Comment lancer

```bash
npm install
cp .env.example .env    # puis renseigner ANTHROPIC_API_KEY (optionnel)
npm run dev:full        # lance le proxy API + le front ensemble
# ou séparément : npm run server  (terminal 1) et npm run dev (terminal 2)
```

Sans clé API : l'app fonctionne en **mode fallback** (sélection catalogue sans IA, pas de
synthèse rédigée). Utile pour développer l'UI sans consommer de tokens.

## Pistes de développement ouvertes (backlog)

- Export PDF de la restitution (livrable dirigeant) — voir jsPDF ou impression navigateur.
- Base de données partagée (remplacer localStorage) pour ouvrir l'outil à plusieurs
  consultants. Aujourd'hui la persistance est locale au navigateur.
- Affiner le mapping GRP et les coefficients de valorisation avec un expert-comptable.
- 5e/6e secteur dans catalogue.json (suivre la structure existante : 7 axes, poids_ref
  différencié, 3 indicateurs par axe minimum).
- Tests unitaires sur methode.js (valorisation, catalogueAjuste, noteComposante).

## Style

- Palette terracotta/crème (charte AR FOR PULSE) dans `C` (socle.js). Ne pas introduire
  d'autres couleurs sans raison.
- Français partout (UI et commentaires).
- Pas de librairie de composants : styles inline volontaires pour rester autonome.
