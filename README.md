# Mecatron Sim

Simulateur 3D de robots installable en PWA — rover 4WD, bras 6-DOF, drone quadrirotor et bipède humanoïde, avec cinématique, dynamique et équations en temps réel.

## Contenu

```
mecatronsim/
├── index.html              application complète (autonome)
├── manifest.json           manifeste PWA
├── sw.js                   service worker (cache hors-ligne)
├── icon-192.png            icône
├── icon-512.png            icône
├── icon-180.png            icône Apple Touch
├── icon-maskable-512.png   icône adaptative Android
└── favicon.png
```

## Déploiement

**Prérequis : HTTPS.** Une PWA ne s'installe pas en HTTP (sauf `localhost`).

### Vercel
```bash
cd mecatronsim
vercel --prod
```

### Netlify
Glisser le dossier sur netlify.com/drop.

### GitHub Pages
Pousser le dossier dans un dépôt, puis Settings → Pages → activer sur la branche `main`.

### Test local
```bash
cd mecatronsim
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

## Installation sur l'appareil

- **Android / Chrome** — un bouton ⬇ apparaît dans la barre du haut, ou menu ⋮ → « Installer l'application ».
- **iOS / Safari** — Partager → « Sur l'écran d'accueil ». (iOS n'expose pas de bouton d'installation automatique.)
- **Desktop / Chrome, Edge** — icône d'installation dans la barre d'adresse.

Une fois installée, l'application se lance en plein écran sans barre de navigateur, et fonctionne hors-ligne après la première visite.

## Raccourcis

Un appui long sur l'icône installée propose d'ouvrir directement un robot. Accessible aussi par URL : `index.html?robot=drone`.

## Mise à jour

Le service worker sert le cache en priorité. Après modification des fichiers, **incrémenter la version** dans `sw.js` :

```js
const CACHE = 'mecatron-sim-v2';   // v1 → v2
```

Sans cela les utilisateurs conserveront l'ancienne version.

## Fonctionnement hors-ligne

Three.js et les polices sont chargés depuis des CDN et mis en cache à la première visite (stratégie *stale-while-revalidate*). L'application est donc pleinement utilisable hors connexion ensuite.

## Contrôles

| | Souris / Clavier | Tactile |
|---|---|---|
| Orbiter | clic droit glissé | 1 doigt |
| Zoom | molette | 2 doigts (écarter) |
| Déplacer | Alt + clic glissé | 2 doigts (glisser) |
| Piloter | flèches | joystick à l'écran |
| Simuler | Espace | bouton ▶ |
| Réinitialiser | R | bouton ↺ |
| Changer de robot | 1 · 2 · 3 · 4 | onglets |

## Pile technique

HTML/CSS/JS sans dépendance de build. Three.js r128 (CDN) pour le rendu WebGL, environnement studio procédural pour les réflexions PBR.
