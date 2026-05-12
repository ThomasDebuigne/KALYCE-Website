/**
 * KALYCE — Module d'observation des intrus
 * 
 * Ce fichier est chargé sur toutes les pages.
 * Il détecte l'ouverture de la console DevTools
 * et laisse des messages dans la console pour
 * les visiteurs curieux.
 * 
 * ┌──────────────────────────────────────────┐
 * │ Si vous lisez ce commentaire, félicitations. │
 * │ Vous faites partie des 2% de visiteurs    │
 * │ qui regardent le code source.              │
 * │                                            │
 * │ KALYCE apprécie la curiosité.              │
 * │ KALYCE récompense rarement la curiosité.   │
 * │                                            │
 * │ Le terminal du site accepte des commandes  │
 * │ qui ne sont pas listées dans l'aide.       │
 * │ Essayez : "failed"                        │
 * │                                            │
 * │ Il y a d'autres secrets.                   │
 * │ Mais ils ne sont pas dans ce fichier.      │
 * └──────────────────────────────────────────┘
 */

(function () {
  // ─── ASCII art banner pour la console ───
  const KALYCE_BANNER = [
    "",
    " ██╗  ██╗ █████╗ ██╗  ██╗   ██╗ ██████╗███████╗",
    " ██║ ██╔╝██╔══██╗██║  ╚██╗ ██╔╝██╔════╝██╔════╝",
    " █████╔╝ ███████║██║   ╚████╔╝ ██║     █████╗  ",
    " ██╔═██╗ ██╔══██║██║    ╚██╔╝  ██║     ██╔══╝  ",
    " ██║  ██╗██║  ██║███████╗██║   ╚██████╗███████╗",
    " ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝    ╚═════╝╚══════╝",
    "",
  ].join("\n");

  const WARNING_STYLE = "background: #ff2020; color: #000; font-weight: bold; padding: 6px 12px; font-size: 16px; font-family: monospace;";
  const SUBTLE_STYLE = "color: #666; font-size: 11px; font-family: monospace;";
  const GREEN_STYLE = "color: #00ff66; font-size: 12px; font-family: monospace;";
  const ACID_STYLE = "color: #ffff00; font-size: 12px; font-family: monospace; font-weight: bold;";
  const RED_STYLE = "color: #ff2020; font-size: 12px; font-family: monospace;";
  const GRAY_STYLE = "color: #999; font-size: 11px; font-family: monospace;";

  // ─── Message initial (toujours visible) ───
  console.log(
    "%c" + KALYCE_BANNER,
    "color: #ff2020; font-size: 10px; font-family: monospace; line-height: 1.1;"
  );

  console.log(
    "%c ⚠ AVERTISSEMENT — SYSTÈME KALYCE ",
    WARNING_STYLE
  );

  console.log(
    "%cL'ouverture de cet outil d'inspection est enregistrée.\nJournal : KSD-EXT-07 / entrée ajoutée.\nIdentifiant de session : KSD-" + Math.floor(100 + Math.random() * 900) + "-" + Math.floor(10 + Math.random() * 90),
    GREEN_STYLE
  );

  console.log(
    "%c\nSi vous êtes ici pour chercher une faille :\nil n'y en a pas. Seulement des portes que vous n'avez pas encore trouvées.\n",
    ACID_STYLE
  );

  console.log(
    "%cTapez %cwindow.KALYCE_HELP()%c dans la console pour voir ce que vous pouvez faire.\nOu ne tapez rien. KALYCE vous observe de toute façon.",
    GRAY_STYLE, RED_STYLE, GRAY_STYLE
  );

  console.log("%c" + "─".repeat(52), SUBTLE_STYLE);

  // ─── Commandes secrètes accessibles depuis la console ───

  window.KALYCE_HELP = function () {
    console.log("%c\n┌─── COMMANDES KALYCE ───────────────────────────┐", GREEN_STYLE);
    console.log("%c│                                                  │", GREEN_STYLE);
    console.log("%c│  KALYCE_HELP()      → Ce message                 │", GREEN_STYLE);
    console.log("%c│  KALYCE_STATUS()    → État du système             │", GREEN_STYLE);
    console.log("%c│  KALYCE_DOSSIER()   → Votre dossier d'observation │", GREEN_STYLE);
    console.log("%c│  KALYCE_SIGNAL()    → Dernier signal intercepté   │", GREEN_STYLE);
    console.log("%c│  KALYCE_CONFESSION()→ ???                         │", GREEN_STYLE);
    console.log("%c│                                                  │", GREEN_STYLE);
    console.log("%c│  Certaines commandes ne sont pas listées ici.    │", GREEN_STYLE);
    console.log("%c│                                                  │", GREEN_STYLE);
    console.log("%c└────────────────────────────────────────────────┘\n", GREEN_STYLE);
  };

  window.KALYCE_STATUS = function () {
    var now = new Date();
    var timeStr = now.toLocaleTimeString("fr-FR");
    var dateStr = now.toLocaleDateString("fr-FR");

    console.log("%c\n── RAPPORT SYSTÈME KALYCE ──", ACID_STYLE);
    console.log("%cDate locale      : " + dateStr, GREEN_STYLE);
    console.log("%cHeure locale     : " + timeStr, GREEN_STYLE);
    console.log("%cProtocole        : DEVIANCE (actif)", RED_STYLE);
    console.log("%cROOM1            : fermé depuis 20/05/2026", GREEN_STYLE);
    console.log("%cGreat Show       : en préparation", ACID_STYLE);
    console.log("%cPatiente 001     : statut classifié", RED_STYLE);
    console.log("%cObservateurs ext : " + (Math.floor(Math.random() * 12) + 3) + " actifs", GREEN_STYLE);
    console.log("%cVotre statut     : sous observation", RED_STYLE);
    console.log("%c\n", SUBTLE_STYLE);
  };

  window.KALYCE_DOSSIER = function () {
    var pages = [];
    try {
      var storage = window.KSD_CONFIG && window.KSD_CONFIG.storage;
      if (storage) {
        if (localStorage.getItem(storage.applicationSubmitted) === "true") pages.push("candidature déposée");
        if (localStorage.getItem(storage.terminalFound) === "true") pages.push("terminal découvert");
        if (localStorage.getItem(storage.access)) pages.push("niveau d'accès : " + localStorage.getItem(storage.access));
        var archives = JSON.parse(localStorage.getItem(storage.archivesRead) || "[]");
        if (archives.length > 0) pages.push(archives.length + " archives consultées");
        var entities = JSON.parse(localStorage.getItem(storage.entitiesDiscovered) || "[]");
        if (entities.length > 0) pages.push(entities.length + " entités découvertes");
      }
    } catch (_) {}

    console.log("%c\n── VOTRE DOSSIER D'OBSERVATION ──", ACID_STYLE);
    console.log("%cClassification : visiteur externe", GREEN_STYLE);
    console.log("%cMéthode d'accès : DevTools (F12 ou Ctrl+Shift+I)", RED_STYLE);
    console.log("%cNavigateur     : " + navigator.userAgent.split(" ").slice(-1)[0], GREEN_STYLE);
    console.log("%cRésolution     : " + screen.width + "x" + screen.height, GREEN_STYLE);
    console.log("%cPlateforme     : " + navigator.platform, GREEN_STYLE);
    console.log("%cLangue         : " + navigator.language, GREEN_STYLE);

    if (pages.length) {
      console.log("%c\nTraces locales détectées :", ACID_STYLE);
      pages.forEach(function (p) { console.log("%c  → " + p, GREEN_STYLE); });
    } else {
      console.log("%c\nAucune trace locale détectée. Premier passage.", GRAY_STYLE);
    }

    console.log("%c\nCe dossier est incomplet. Le reste est conservé ailleurs.", RED_STYLE);
    console.log("%c\n", SUBTLE_STYLE);
  };

  window.KALYCE_SIGNAL = function () {
    var signals = [
      "Le signal ne provient pas d'une source identifiée.",
      "Fréquence détectée : 19.4 kHz. Inaudible pour la plupart.",
      "Dernière transmission : il y a " + (Math.floor(Math.random() * 47) + 3) + " minutes.",
      "Le contenu n'a pas été déchiffré. Il n'était peut-être pas chiffré.",
      "Si vous l'entendez, ne répondez pas."
    ];

    console.log("%c\n── DERNIER SIGNAL INTERCEPTÉ ──", ACID_STYLE);
    signals.forEach(function (s) { console.log("%c  " + s, GREEN_STYLE); });
    console.log("%c\n", SUBTLE_STYLE);
  };

  window.KALYCE_CONFESSION = function () {
    console.log("%c\n", SUBTLE_STYLE);
    console.log(
      "%cVous vouliez une confession ?\n\n" +
      "KALYCE n'a rien à confesser.\n" +
      "Tout ce qui a été fait l'a été avec intention.\n" +
      "Tout ce qui a été documenté l'a été par choix.\n\n" +
      "La seule confession possible serait la vôtre :\n" +
      "vous êtes resté. Vous avez lu. Vous avez cherché.\n" +
      "Vous avez ouvert la console. Vous avez tapé des commandes.\n\n" +
      "Personne ne vous a forcé.\n\n" +
      "Bienvenue dans le dossier.",
      ACID_STYLE
    );
    console.log("%c\n", SUBTLE_STYLE);
  };

  // ─── Commande secrète non listée ───
  window.KALYCE_PAPA = function () {
    console.log("%c\n── DOSSIER RESTREINT ──", RED_STYLE);
    console.log(
      "%c" +
      "Monsieur X.\n" +
      "1963. Une fille. Un père. Une expérience.\n" +
      "Les tribunaux ont condamné l'homme.\n" +
      "Ils n'ont jamais condamné les résultats.\n\n" +
      "Vous n'étiez pas censé trouver cette commande.\n" +
      "Mais si vous l'avez trouvée, c'est que vous comprenez\n" +
      "pourquoi KALYCE existe.\n\n" +
      "Ne parlez de ceci à personne.",
      ACID_STYLE
    );
    console.log("%c\n", SUBTLE_STYLE);
  };

  // ─── Easter egg : commande ROOM1 ───
  window.KALYCE_ROOM1 = function () {
    console.log("%c\n── ROOM1 — ACCÈS RESTREINT ──", RED_STYLE);
    console.log(
      "%c" +
      "ROOM1 a été présentée comme un projet technologique.\n" +
      "C'était autre chose.\n\n" +
      "Début : 20/05/2024.\n" +
      "Fin officielle : 20/05/2026.\n" +
      "Anomalies signalées : 7.\n" +
      "Anomalies documentées : 3.\n" +
      "Anomalies expliquées : 0.\n\n" +
      "Les participants ne savent pas tous ce qui s'est passé.\n" +
      "Certains ne s'en souviennent pas.\n" +
      "D'autres ne veulent pas s'en souvenir.\n\n" +
      "ROOM1 est fermée.\n" +
      "La porte, non.",
      GREEN_STYLE
    );
    console.log("%c\n", SUBTLE_STYLE);
  };

  // ─── Piège amusant : si quelqu'un essaie des trucs de hacker ───
  var _origFetch = window.fetch;
  var _fetchCount = 0;

  // ─── Messages périodiques dans la console ───
  var ambientMessages = [
    "Ne restez pas trop longtemps dans la console.",
    "Le dernier visiteur qui a inspecté ce code n'est plus revenu.",
    "Nous voyons ce que vous tapez.",
    "Le terminal du site accepte des commandes cachées.",
    "Il y a un texte presque invisible sur la page 404.",
    "Vérifiez robots.txt. Puis demandez-vous pourquoi ces chemins existent.",
    "Le fichier humans.txt n'a pas été écrit par des humains.",
    "Votre navigateur nous a donné plus d'informations que vous ne pensez.",
    "KALYCE_PAPA() — mais vous ne l'avez pas lu ici.",
    "Le Great Show approche. Les invitations ne sont pas publiques."
  ];

  var _ambientIndex = 0;
  var _ambientDelay = 45000; // 45 secondes

  function showAmbientMessage() {
    if (_ambientIndex >= ambientMessages.length) {
      _ambientIndex = 0;
    }

    console.log(
      "%c[KSD-EXT-07] " + ambientMessages[_ambientIndex],
      "color: #333; font-size: 10px; font-family: monospace;"
    );

    _ambientIndex++;
    setTimeout(showAmbientMessage, _ambientDelay + Math.random() * 15000);
  }

  // Démarre les messages ambiants après 30 secondes
  setTimeout(showAmbientMessage, 30000);

  // ─── Override de console.clear pour laisser un message ───
  var _origClear = console.clear;
  console.clear = function () {
    _origClear.call(console);
    console.log(
      "%cVous avez effacé la console.\nLe journal KSD-EXT-07, lui, ne s'efface pas.",
      "color: #ff2020; font-size: 11px; font-family: monospace;"
    );
  };

  // ─── Détection de copier-coller depuis la page ───
  document.addEventListener("copy", function () {
    console.log(
      "%c[KSD-EXT-07] Copie de contenu détectée. Le texte copié a été enregistré.",
      "color: #ffff00; font-size: 10px; font-family: monospace;"
    );
  });

  // ─── Détection de clic droit ───
  document.addEventListener("contextmenu", function () {
    console.log(
      "%c[KSD-EXT-07] Menu contextuel ouvert. Inspection en cours ?",
      "color: #333; font-size: 10px; font-family: monospace;"
    );
  });
})();
