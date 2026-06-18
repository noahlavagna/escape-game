// =====================================================================
//  Module partagé : connexion Firebase + état du jeu + compétences.
//  Importé par index.html (tableau) ET pilote.html (télécommande).
// =====================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase, ref, onValue, set, get, update, runTransaction, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import { firebaseConfig, ROOM as CONFIG_ROOM } from "./firebase-config.js";

// La salle : ?room=xxx dans l'URL sinon valeur du fichier de config.
export const ROOM =
  new URLSearchParams(location.search).get("room") || CONFIG_ROOM || "main";

export const configReady = Boolean(firebaseConfig.apiKey && firebaseConfig.databaseURL);

let db = null;
if (configReady) {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
}

const statePath = `rooms/${ROOM}/state`;
const eventPath = `rooms/${ROOM}/event`;
const scenePath = `rooms/${ROOM}/scene`;

// Décalage d'horloge avec le serveur Firebase : permet un compte à rebours
// identique sur le tableau et sur le téléphone, même si leurs horloges diffèrent.
let serverOffset = 0;
if (db) onValue(ref(db, ".info/serverTimeOffset"), (s) => { serverOffset = s.val() || 0; });
export const serverNow = () => Date.now() + serverOffset;

// ---------------------------------------------------------------------
//  Compétences (skills). Pour en ajouter une plus tard : copie un bloc.
// ---------------------------------------------------------------------
//  - id          : identifiant unique
//  - name        : titre affiché en grand sur le tableau
//  - tag         : petit libellé court dans la télécommande
//  - icon        : emoji/symbole
//  - desc        : sous-titre affiché pendant l'animation
//  - needsTarget : true => il faut choisir l'équipe qui lance la compétence
//  - amount      : montant par défaut (en % de parts de marché)
//  - anim        : style d'animation sur le tableau ("steal", "alert"...)
//  - effect(att) : modification d'état appliquée. att = "A" ou "B"
//                  (équipe qui lance). Renvoie une promesse.
// ---------------------------------------------------------------------
export const SKILLS = [
  {
    id: "vol",
    name: "VOL DE PARTS DE MARCHÉ",
    tag: "VOL",
    icon: "☣",
    desc: "Contamination hostile — la souche adverse dépérit, l'attaquant prolifère.",
    needsTarget: true,
    amount: 10,
    anim: "steal",
    // att = équipe qui LANCE (attaquant) : elle GAGNE, l'adversaire perd.
    effect: (att, amount) => transfer(other(att), att, amount)
  },
  {
    id: "confinement",
    name: "CONFINEMENT",
    tag: "GEL",
    icon: "⛔",
    desc: "La souche adverse est confinée — aucune action possible pendant 30 s.",
    needsTarget: true,        // on choisit l'équipe qui LANCE ; l'autre est gelée
    // pas d'« amount » : la télécommande masque le champ de montant.
    anim: "lock",
    freezeMs: 30000,
    effect: (att) => lockTeam(other(att), 30000)
  }
];

export const other = (t) => (t === "A" ? "B" : "A");
export const getSkill = (id) => SKILLS.find((s) => s.id === id);

const DEFAULT_STATE = {
  teamA: { name: "SOUCHE A", color: "#9bff3b", share: 0 },
  teamB: { name: "SOUCHE B", color: "#b14bff", share: 0 }
};

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

// ---------------------------------------------------------------------
//  Abonnements (utilisés par le tableau)
// ---------------------------------------------------------------------
export function subscribeState(cb) {
  if (!db) return;
  onValue(ref(db, statePath), (snap) => cb(snap.val() || DEFAULT_STATE));
}

export function subscribeEvent(cb) {
  if (!db) return;
  onValue(ref(db, eventPath), (snap) => cb(snap.val()));
}

export function subscribeConnection(cb) {
  if (!db) return;
  onValue(ref(db, ".info/connected"), (snap) => cb(Boolean(snap.val())));
}

// ---------------------------------------------------------------------
//  Scènes du tableau : "insta" -> "teaser" -> "go" -> "board"
//  (pilotées depuis la télécommande)
// ---------------------------------------------------------------------
export const SCENES = ["teaser", "go", "board"];

export function subscribeScene(cb) {
  if (!db) return;
  onValue(ref(db, scenePath), (snap) => cb(snap.val() || "teaser"));
}

export function setScene(name) {
  if (!db) return Promise.resolve();
  return set(ref(db, scenePath), name);
}

export async function ensureScene() {
  if (!db) return;
  const snap = await get(ref(db, scenePath));
  if (!snap.exists()) await set(ref(db, scenePath), "teaser");
}

export async function getState() {
  if (!db) return DEFAULT_STATE;
  const snap = await get(ref(db, statePath));
  return snap.val() || DEFAULT_STATE;
}

// Crée l'état par défaut si la salle est vide.
export async function ensureState() {
  if (!db) return;
  const snap = await get(ref(db, statePath));
  if (!snap.exists()) await set(ref(db, statePath), DEFAULT_STATE);
}

// ---------------------------------------------------------------------
//  Actions (utilisées par la télécommande)
// ---------------------------------------------------------------------
export function addShare(team, delta) {
  if (!db) return Promise.resolve();
  const key = team === "A" ? "teamA" : "teamB";
  return runTransaction(ref(db, `${statePath}/${key}/share`), (cur) =>
    clamp((cur ?? 50) + delta)
  );
}

export function setShare(team, value) {
  if (!db) return Promise.resolve();
  const key = team === "A" ? "teamA" : "teamB";
  return set(ref(db, `${statePath}/${key}/share`), clamp(value));
}

export async function transfer(fromTeam, toTeam, amount) {
  if (!db) return;
  const st = await getState();
  const fromKey = fromTeam === "A" ? "teamA" : "teamB";
  const toKey = toTeam === "A" ? "teamA" : "teamB";
  const real = Math.min(amount, st[fromKey].share); // on ne vole pas plus que dispo
  await update(ref(db, statePath), {
    [`${fromKey}/share`]: clamp(st[fromKey].share - real),
    [`${toKey}/share`]: clamp(st[toKey].share + real)
  });
  return real;
}

// Verrouille une équipe jusqu'à (maintenant + ms). Le tableau et la
// télécommande lisent ce timestamp pour afficher / appliquer le confinement.
export function lockTeam(team, ms) {
  if (!db) return Promise.resolve();
  const key = team === "A" ? "teamA" : "teamB";
  return set(ref(db, `${statePath}/${key}/lockUntil`), serverNow() + ms);
}

export function setName(team, name) {
  if (!db) return Promise.resolve();
  const key = team === "A" ? "teamA" : "teamB";
  return set(ref(db, `${statePath}/${key}/name`), name.slice(0, 22));
}

export function resetState() {
  if (!db) return Promise.resolve();
  return set(ref(db, statePath), DEFAULT_STATE);
}

// Déclenche une animation sur le tableau (id unique => rejoue à chaque fois).
export function fireEvent({ anim, title, sub, team, amount }) {
  if (!db) return Promise.resolve();
  return set(ref(db, eventPath), {
    id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    anim: anim || "alert",
    title: title || "",
    sub: sub || "",
    team: team || null,
    amount: amount ?? null,
    ts: serverTimestamp()
  });
}

// Lance une compétence : applique l'effet ET déclenche l'animation.
export async function launchSkill(skillId, attacker, amount) {
  const skill = getSkill(skillId);
  if (!skill) return;
  let real = amount;
  if (skill.effect) {
    const r = await skill.effect(attacker, amount);
    if (typeof r === "number") real = r;
  }
  await fireEvent({
    anim: skill.anim,
    title: skill.name,
    sub: skill.desc,
    team: skill.needsTarget ? attacker : null,
    amount: typeof real === "number" ? real : null
  });
}

// ---------------------------------------------------------------------
//  ÉVÉNEMENTS — déclenchés par le Game Master à tout moment (globaux,
//  non liés à une équipe). Même format que les compétences, sans cible.
//  Pour en ajouter / retirer : édite ce tableau.
// ---------------------------------------------------------------------
export const EVENTS = [
  {
    id: "epidemie", name: "ÉPIDÉMIE", tag: "ÉPIDÉMIE", icon: "☠", anim: "alert",
    desc: "Une souche au hasard est frappée : -10 % de parts de marché.",
    effect: () => addShare(Math.random() < 0.5 ? "A" : "B", -10)
  },
  {
    id: "cure", name: "CURE MIRACLE", tag: "CURE", icon: "✚", anim: "heal",
    desc: "Reprise du marché : les deux souches regagnent +5 %.",
    effect: async () => { await addShare("A", 5); await addShare("B", 5); }
  },
  {
    id: "tempete", name: "TEMPÊTE DE MUTATIONS", tag: "TEMPÊTE", icon: "🌀", anim: "alert",
    desc: "Chaos sur le marché : les deux souches perdent 8 %.",
    effect: async () => { await addShare("A", -8); await addShare("B", -8); }
  },
  {
    id: "blackout", name: "CONFINEMENT GÉNÉRAL", tag: "BLACKOUT", icon: "⛔", anim: "lock",
    desc: "Quarantaine totale : les deux souches sont gelées 15 s.",
    effect: async () => { await lockTeam("A", 15000); await lockTeam("B", 15000); }
  },
  {
    id: "panne", name: "PANNE RÉSEAU", tag: "GLITCH", icon: "▓", anim: "glitch",
    desc: "Interférences sur le réseau du marché…"
  },
  {
    id: "alerte", name: "ALERTE SANITAIRE", tag: "ALERTE", icon: "⚠", anim: "alert",
    desc: "Niveau de menace maximal. Tenez-vous prêts."
  }
];

export const getEventDef = (id) => EVENTS.find((e) => e.id === id);

// Lance un événement : applique son effet éventuel ET déclenche l'animation.
export async function launchEvent(id) {
  const ev = getEventDef(id);
  if (!ev) return;
  if (ev.effect) await ev.effect();
  await fireEvent({ anim: ev.anim, title: ev.name, sub: ev.desc });
}
