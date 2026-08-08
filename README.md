# Mecatron Sim

Simulateur 3D de robots — rover 4WD, bras 6-DOF, drone quadrirotor, bipède humanoïde.
Application BV Store, protégée par le système de licences du CRM.

## Structure

```
mecatron-sim/
├── vercel.json           configuration Vercel (outputDirectory: public)
├── README.md
└── public/
    ├── index.html        l'application
    ├── manifest.json     manifeste PWA
    ├── sw.js             service worker
    └── *.png             icônes
```

**Ne pas déplacer `index.html` à la racine.** Vercel ignore la racine dès qu'un dossier `public/` est déclaré comme `outputDirectory`.

## Avant le premier déploiement

### 1. Déclarer l'app dans le CRM

Catalogue d'apps → nouvelle app avec le slug exact :

```
mecatron-sim
```

Le slug est vérifié côté serveur : une clé émise pour une autre app sera refusée.

### 2. Renseigner l'URL du CRM

Dans `public/index.html`, ligne 22 environ, deux endroits à modifier :

```html
<script>window.BV_CRM_URL = 'https://bv-crm-ten.vercel.app';</script>
<script src="https://bv-crm-ten.vercel.app/bv-license.js"></script>
```

### 3. Autoriser l'origine côté CRM

`api/license.js` doit accepter les requêtes venant du domaine de Mecatron Sim
(en-tête `Access-Control-Allow-Origin`).

## Déploiement

```bash
vercel --prod
```

Ou via GitHub : pousser le dépôt, puis l'importer dans Vercel.
Vercel lit `vercel.json` automatiquement.

## Fonctionnement de la licence

Au premier lancement, un écran demande la clé. Une fois validée, elle est mémorisée
et l'app démarre directement aux lancements suivants.

| Situation | Comportement |
|---|---|
| Clé valide | Accès normal |
| Clé inconnue | Blocage, ressaisie possible |
| Licence suspendue | Blocage sous 12 h maximum |
| Échéance dépassée | Blocage, même si le statut est resté « active » |
| CRM injoignable | Accès maintenu 3 jours, puis blocage |

Réglages dans `index.html` : `cacheHeures` (défaut 12) et `toleranceJours` (défaut 3).
Baisser `cacheHeures` accélère la prise en compte d'une suspension, au prix de plus
d'appels réseau.

### Point d'attention

Le service worker **n'intercepte jamais** `/api/` ni `bv-license.js`. C'est délibéré :
mettre en cache une réponse de licence rendrait toute suspension inopérante.
Si vous modifiez `sw.js`, conservez cette exclusion.

## Mise à jour

Incrémenter le numéro de cache dans `public/sw.js` à chaque déploiement :

```js
const CACHE = 'mecatron-sim-v5';   // v5 → v6
```

Sans cela, les utilisateurs conservent l'ancienne version.

## Limite connue

La vérification s'exécute dans le navigateur. Un utilisateur techniquement averti peut
la contourner en lisant le source. Le système sert au suivi et à la révocation, pas à
l'inviolabilité. Pour une protection réelle, il faudrait servir l'application depuis le
serveur après validation.

## Contrôles

| | Souris / Clavier | Tactile |
|---|---|---|
| Orbiter | clic droit glissé | 1 doigt |
| Zoom | molette | 2 doigts (écarter) |
| Déplacer | Alt + clic glissé | 2 doigts (glisser) |
| Piloter | flèches | joystick |
| Simuler | Espace | bouton ▶ |
| Changer de robot | 1 · 2 · 3 · 4 | onglets |
