# InnovAction Scan — prototype

Outil de pilotage de la gouvernance fondé sur l'écoute **factuelle** des parties prenantes : il relie les signaux faibles du terrain à la stratégie de l'organisation (boucle fermée *voulue / réalisée / vécue*) et calcule un **Score de Divergence Stratégique (SDS)**.

## Lancer le prototype

Ouvrir `index.html` dans un navigateur. Aucun serveur, aucune dépendance, aucune installation.

## Ce que montre le prototype

| Vue | Contenu |
|---|---|
| **Vue Comex** | Synthèse lisible en 3 minutes : SDS global, signaux faibles émergents, et les 4 quadrants du cahier des charges (cartographie des faits, radar de vélocité, matrice de matérialité, alertes et registre d'actions). |
| **Boucle stratégique** | Pour chaque axe : stratégie voulue, KPI de gestion (modifiables), signaux terrain rattachés, SDS recalculé en direct et orientation proposée. La formule est affichée. |
| **Récits & clusters** | Flux narratif anonymisé (contexte / fait générateur / conséquence), jugements isolés, clusters avec vélocité et statut (confirmé ou en observation). |
| **Collecte narrative** | Les 3 invitations narratives ouvertes, puis la chaîne de traitement : anonymisation par cohorte, masquage RGPD (NER), isolation des jugements, extraction Qui/Quoi/Où/Quand/Impact, qualification, et décision (versé au tableau de bord ou orienté vers la médiation). |
| **Dispositif & BI** | Planificateur de cohortes tournantes, canaux par partie prenante, garde-fous, export CSV/JSON et API cible pour Power BI / Tableau. |

## Règles métier implémentées

- **Vélocité** d'un cluster : `(n 28 derniers jours − n 28 jours précédents) / (n précédents + 1)`.
- **Signal faible** : ≤ 10 récits sur 28 j, vélocité ≥ +150 %, au moins 3 cohortes indépendantes.
- **Double enregistrement** (anti-surréaction) : un signal n'est « confirmé » qu'avec des récits sur deux périodes et au moins 3 cohortes. Sinon il reste « en observation » et seule une mise en veille est proposée.
- **SDS** (1 à 10) : `1 + 9 × h × p`, où `h` est l'atteinte moyenne des KPI de l'axe et `p = 1 − e^(−P/20)` la pression terrain (récits pondérés par la gravité, le type et l'accélération). Le score est élevé quand les KPI sont au vert alors que le terrain les contredit.
- **Rejet** : une attaque personnelle sans fait vérifiable, ou un récit trop pauvre en faits, n'entre pas dans le tableau de bord.

## Limites du prototype

- Les données sont **fictives** (une ETI industrielle, environ 180 récits générés sur 12 semaines).
- Le « moteur NLP » est une **simulation à base de règles** dans le navigateur (lexiques, expressions régulières). En production, il serait remplacé par un vrai modèle de langage (extraction, clustering non supervisé, NER), hébergé sur un cloud souverain européen.
- Les récits saisis, les actions et les KPI modifiés sont conservés dans le `localStorage` du navigateur uniquement. Le bouton « Réinitialiser la démonstration » (vue Dispositif) les efface.

## Pistes pour la suite

1. Backend (API `/signals`, `/clusters`, `/strategy/divergence`) et base de données.
2. Moteur NLP réel (LLM + embeddings pour le clustering), saisie vocale.
3. Connecteurs de collecte (bouton ERP/CRM, QR codes, portail fournisseurs, veille RSS).
4. Connecteur Power BI et gestion multi-entités.
