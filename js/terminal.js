(function () {
  const responses = {
    help: [
      "Commandes disponibles :",
      "status",
      "kalyce",
      "deviance",
      "room1",
      "papa",
      "patiente001",
      "clear"
    ],

    status: [
      "Système : ancien",
      "Site : non référencé",
      "Accès : ciblé",
      "Observation : active",
      "ROOM1 : terminé",
      "Prochaine ouverture : 28/05/2026"
    ],

    kalyce: [
      "Aucune trace publique.",
      "KALYCE existe seulement dans les dossiers qui ne sortent pas.",
      "Origine supposée : 1963.",
      "Groupe clandestin dédié à une science sans limite morale.",
      "Ne confirmez jamais son existence."
    ],

    deviance: [
      "Protocole reconnu.",
      "DEVIANCE désigne ce qui dépasse les prévisions.",
      "Les réactions ne sont plus seulement expérimentales.",
      "Certains sujets ont été reclassés.",
      "Statut : instable."
    ],

    room1: [
      "ROOM1 : accord confidentiel KALYCE / ISEN.",
      "Début : 20/05/2024.",
      "Fin officielle : 20/05/2026.",
      "Objet déclaré : projet technologique.",
      "Objet réel : observation et altération de sujets humains.",
      "Anomalies signalées avant clôture."
    ],

    papa: [
      "Référence reconnue : Monsieur X.",
      "1963 : expérience sur sa propre fille.",
      "1965 : condamnation à mort.",
      "Son nom reste lié à la fondation de KALYCE.",
      "Ne pas employer hors contexte."
    ],

    patiente001: [
      "PATIENTE 001.",
      "Sujet médiatisé en 1963.",
      "Statut public : victime.",
      "Statut interne : point d'origine.",
      "Son dossier a inspiré ceux qui ont fondé KALYCE."
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
      "Certaines entrées n'existent que si vous savez déjà quoi chercher."
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
          "Aucune archive publique associée.",
          "Requête ignorée."
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
