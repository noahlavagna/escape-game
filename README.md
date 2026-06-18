# Escape Game — Guerre des parts de marché ☣

Tableau de bord temps réel pour escape game, thème post-apocalyptique / peste.
Deux écrans synchronisés via Firebase Realtime Database :

- **`index.html`** — le **tableau** affiché au mur (les % de parts de marché des 2 souches, animations de compétences).
- **`pilote.html`** — la **télécommande** (téléphone) pour tout piloter : ajouter/enlever des parts, transferts, compétences, animations.

## Mise en route

1. Configure Firebase dans **`firebase-config.js`** (projet Firebase gratuit + Realtime Database en mode test). Tout est expliqué en commentaire dans le fichier.
2. Sers les fichiers en **http(s)** (GitHub Pages, ou un serveur local). ⚠️ Ne pas ouvrir en `file://` — les modules JS seraient bloqués.
3. Ouvre `index.html` sur l'écran du tableau → **Armer** → scanne le QR avec le téléphone pour ouvrir `pilote.html`.

## Déploiement GitHub Pages

Settings → Pages → Branch `main` / `/ (root)`. Le tableau sera alors sur
`https://<user>.github.io/escape-game/`.

## Ajouter des compétences

Édite le tableau `SKILLS` en haut de **`firebase.js`** — copie le bloc existant
(`vol`), change nom / icône / effet. La télécommande et l'animation s'adaptent
automatiquement.
