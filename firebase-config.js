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
//  Pour verrouiller la base après l'événement (optionnel) :
//  Realtime Database -> Règles -> remplace par {"rules":{".read":false,".write":false}}
//  La clé apiKey ci-dessus n'est PAS secrète (c'est normal côté web).
// =====================================================================
