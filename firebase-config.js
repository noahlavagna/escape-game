// =====================================================================
//  CONFIG FIREBASE  —  À REMPLIR UNE SEULE FOIS
// =====================================================================
//
//  1. Va sur https://console.firebase.google.com  ->  "Créer un projet"
//     (donne-lui un nom, tu peux désactiver Google Analytics).
//
//  2. Dans le projet :  Créer  ->  "Realtime Database"
//        - choisis une zone (europe-west1 par ex.)
//        - mode :  "Démarrer en mode test"  (lecture/écriture ouvertes)
//          -> suffisant pour un escape game. Pour verrouiller plus tard,
//             voir la note en bas de ce fichier.
//
//  3. Dans  Paramètres du projet (roue crantée)  ->  "Vos applications"
//        - clique l'icône Web  </>
//        - enregistre l'app, Firebase te donne un objet "firebaseConfig"
//        - COPIE-COLLE ses valeurs ci-dessous.
//
//  ⚠ Vérifie bien d'avoir la ligne "databaseURL" (elle finit par
//     ...firebasedatabase.app ou ...firebaseio.com). Si Firebase ne te
//     l'affiche pas, va dans Realtime Database : l'URL est en haut.
//
// =====================================================================

export const firebaseConfig = {
  apiKey: "AIzaSyBls00TUj9YOF7J2Vgg53YdPlda_4osIbE",
  authDomain: "escape-game-fdeed.firebaseapp.com",
  databaseURL: "https://escape-game-fdeed-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "escape-game-fdeed",
  storageBucket: "escape-game-fdeed.firebasestorage.app",
  messagingSenderId: "385715148597",
  appId: "1:385715148597:web:495e695e548d42dd035e7c",
  measurementId: "G-XJB84J8Q02"
};

// Nom de la "salle". Laisse "main" si tu n'as qu'un seul tableau.
// (Tu peux aussi changer de salle à la volée avec ?room=xxx dans l'URL.)
export const ROOM = "main";

// =====================================================================
//  SCÈNE TEASER
// =====================================================================
// Identifiant de la vidéo teaser YouTube (la partie après "v=" dans l'URL).
// Pour https://www.youtube.com/watch?v=OTPyI3znRxg  ->  "OTPyI3znRxg"
export const TEASER_YT_ID = "OTPyI3znRxg";

// =====================================================================
//  VOIX (Morgan Freeman) — jouées par le TABLEAU en plus du bruitage.
// =====================================================================
//  Fichiers dans le dossier escape/voix/. Mets "" pour désactiver une voix
//  (seul le bruitage jouera alors pour ce déclencheur).
export const VOICES = {
  gainA:       "voix/gain-a.aac",        // la souche A gagne des parts
  gainB:       "voix/gain-b.aac",        // la souche B gagne des parts
  perte:       "voix/perte.aac",         // une souche perd des parts
  vol:         "voix/vol.aac",           // compétence : vol de parts
  confinement: "voix/confinement.aac",   // compétence : confinement
  epidemie:    "voix/epidemie.aac",      // événement : épidémie
  cure:        "voix/cure.aac",          // événement : cure miracle
  tempete:     "voix/tempete.aac",       // événement : tempête de mutations
  blackout:    "voix/blackout.aac",      // événement : confinement général
  panne:       "voix/panne.aac",         // événement : panne réseau
  alerte:      "voix/alerte.aac",        // événement : alerte sanitaire
  firstwinner: "voix/firstwinner-1.aac", // 1ère question gagnée (1ère partie)
  firstwinner2:"voix/firstwinner-2.aac", // 1ère question gagnée (enchaînée)
  lancement:   "voix/lancement.aac",     // « Partez ! »
  alarme:      "voix/alarme.aac"         // alarme déclenchée
};

// =====================================================================
//  Pour verrouiller la base après l'événement (optionnel) :
//  Realtime Database -> Règles -> remplace par {"rules":{".read":false,".write":false}}
//  La clé apiKey ci-dessus n'est PAS secrète (c'est normal côté web).
// =====================================================================
