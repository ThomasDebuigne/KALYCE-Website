(function () {
  const responses = {
    help: [
      "Commandes disponibles :",
      "status",
      "kalyce",
      "application",
      "failed",
      "sealed",
      "deviance",
      "67",
      "clear"
    ],

    status: [
      "Système : ancien",
      "Interface publique : volontairement limitée",
      "Accès profond : verrouillé",
      "Archives : incomplètes",
      "Observation : active",
      "Dernière synchronisation : inconnue"
    ],

    kalyce: [
      "KALYCE n'est pas née d'une promesse.",
      "Elle est apparue dans les marges d'un dossier judiciaire.",
      "Recherche privée. Financement discret. Résultats présentés avant vérification.",
      "Les rapports publics parlent de progrès.",
      "Les rapports internes parlent moins."
    ],

    application: [
      "Formulaire actif : /xrz9qwv2",
      "Transmission réseau : active",
      "Les candidatures sont enregistrées.",
      "Poste proposé : surveillance nocturne, 00:00-06:00.",
      "Expérience requise : rester calme lorsque les consignes changent seules."
    ],

    failed: [
      "Dossiers incomplets détectés.",
      "Nombre exact : non affiché",
      "Index local : /qzv8n4l2",
      "Statut : archive non référencée",
      "Certaines erreurs ont continué après leur clôture."
    ],

    sealed: [
      "DOSSIER SCELLÉ",
      "Nom : [SUPPRIMÉ]",
      "Origine : incohérente",
      "Classement : erreur persistante",
      "Accès refusé.",
      "Instruction : ne pas compléter ce qui manque."
    ],

    deviance: [
      "Protocole reconnu.",
      "DEVIANCE n'est pas un surnom.",
      "DEVIANCE n'est pas un projet public.",
      "DEVIANCE commence quand l'observation cesse d'être passive.",
      "État : dormant / instable / attendu"
    ],

    entity: [
      "Terme invalide dans cette interface.",
      "Les entrées individuelles ne sont pas disponibles.",
      "Utilisez les archives autorisées.",
      "Ou n'utilisez rien."
    ],

    andy: [
      "Entrée retrouvée : ANDY.",
      "Petite silhouette. Trop immobile hors champ.",
      "Elle suit ce qui fait du bruit.",
      "Ne laissez pas le silence choisir à votre place."
    ],

    alice: [
      "Entrée retrouvée : ALICE.",
      "Posture de mannequin. Distance instable.",
      "Elle bouge surtout quand personne ne confirme sa position.",
      "Les contrôles trop espacés aggravent les erreurs."
    ],

    faceless: [
      "Entrée retrouvée : FACELESS.",
      "Taille humaine. Aucun visage exploitable.",
      "L'image se dégrade quand on insiste.",
      "Certaines présences doivent seulement être évitées."
    ],

    chimera: [
      "Entrée retrouvée : CHIMERA.",
      "Assemblage massif. Forme incohérente.",
      "L'écran principal semble l'attirer.",
      "Trop de lumière facilite son approche."
    ],

    daughter: [
      "Entrée protégée.",
      "Patiente initiale : non nommée",
      "Statut public : victime",
      "Statut interne : contradiction",
      "Aucune désignation personnelle ne sera affichée."
    ],

    67: [
      "67.",
      "six... seven...",
      "Commande acceptée trop vite.",
      "Analyse annulée : le système a reconnu la référence.",
      "Aucune donnée utile. Seulement un écho internet.",
      "Rapport interne : le technicien a soufflé du nez.",
      "Ne recommence pas.",
      "Ou recommence. Le terminal juge, mais il comprend."
    ]
  };

  function bootTerminal(root, options = {}) {
    root.innerHTML = `
      ${options.closable ? '<button class="terminal-close" type="button" data-terminal-close>FERMER</button>' : ""}
      <div class="system-label">KSD MAINTENANCE TERMINAL / SESSION INSTABLE</div>
      <div class="terminal-log" data-terminal-log></div>
      <form class="terminal-input-row" data-terminal-form>
        <span>&gt;</span>
        <input class="terminal-input" data-terminal-input autocomplete="off" spellcheck="false" autofocus>
      </form>
    `;

    const log = root.querySelector("[data-terminal-log]");
    const form = root.querySelector("[data-terminal-form]");
    const input = root.querySelector("[data-terminal-input]");
    const close = root.querySelector("[data-terminal-close]");

    function append(lines, type = "") {
      lines.forEach((line) => {
        const item = document.createElement("p");
        item.className = `terminal-line ${type}`.trim();
        item.textContent = line;
        log.append(item);
      });

      log.scrollTop = log.scrollHeight;
    }

    append([
      "Connexion locale : KSD-LOCAL-51",
      "Session limitée.",
      "Tapez help.",
      "Les noms ne sont pas des commandes."
    ], "system");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const command = input.value.trim().toLowerCase();
      if (!command) return;

      append([`> ${command}`]);
      input.value = "";

      if (command === "clear") {
        log.innerHTML = "";
        return;
      }

      append(
        responses[command] || [
          "Commande inconnue.",
          "Cette requête ne correspond à aucune archive publique.",
          "Ou elle a été retirée avant votre arrivée."
        ],
        responses[command] ? "system" : "error"
      );
    });

    if (close) {
      close.addEventListener("click", () => {
        const overlay = root.closest("[data-terminal-overlay]");
        if (overlay) overlay.classList.remove("open");
      });
    }

    return { input };
  }

  document.addEventListener("DOMContentLoaded", () => {
    /*
      On garde uniquement le terminal intégré dans ton interface,
      celui qui utilise :
      data-terminal-screen

      L'overlay automatique reste supprimé.
    */

    const inline = document.querySelector("[data-terminal-screen]");

    if (inline) {
      bootTerminal(inline);

      if (
        window.KSD_CONFIG &&
        window.KSD_CONFIG.storage &&
        window.KSD_CONFIG.storage.terminalFound
      ) {
        localStorage.setItem(window.KSD_CONFIG.storage.terminalFound, "true");
      }
    }

    // Nettoyage de sécurité : supprime un éventuel overlay déjà présent.
    document.querySelectorAll(".terminal-overlay, [data-terminal-overlay]").forEach((element) => {
      element.remove();
    });

    // Empêche les boutons cachés d'ouvrir un terminal overlay.
    document.querySelectorAll("[data-open-terminal]").forEach((button) => {
      button.removeAttribute("data-open-terminal");
    });

    if (window.KSDTerminal) {
      delete window.KSDTerminal;
    }
  });
})();
