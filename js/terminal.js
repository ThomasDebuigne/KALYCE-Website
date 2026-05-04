(function () {
  const responses = {
    help: [
      "Commandes disponibles :",
      "status",
      "archives",
      "camera",
      "entity",
      "andy",
      "alice",
      "faceless",
      "chimera",
      "kalyce",
      "deviance",
      "clear"
    ],
    status: [
      "Syst\u00e8me : instable",
      "Flux cam\u00e9ra : partiellement corrompu",
      "Personnel : absent",
      "Observation : en cours"
    ],
    archives: [
      "/archives/origin_report_1979.txt",
      "/archives/patient_001_alice.txt",
      "/archives/faceless_camera_corruption.txt",
      "Acc\u00e8s complet refus\u00e9."
    ],
    camera: [
      "CAM_03 : mouvement non attribu\u00e9.",
      "CAM_06 : le mannequin n'\u00e9tait pas l\u00e0 hier.",
      "CAM_08 : signal interrompu."
    ],
    entity: [
      "Entr\u00e9es : andy, alice, faceless, chimera.",
      "Ne pas demander le dossier scell\u00e9."
    ],
    andy: [
      "ANDY r\u00e9pond \u00e0 la diffusion sonore.",
      "ANDY ne comprend pas la distance."
    ],
    alice: [
      "ALICE doit \u00eatre observ\u00e9e.",
      "ALICE observe aussi."
    ],
    faceless: [
      "Aucun visage d\u00e9tect\u00e9.",
      "Aucun visage requis."
    ],
    chimera: [
      "Mouvement principal interdit.",
      "La proximit\u00e9 annule la proc\u00e9dure."
    ],
    kalyce: [
      "KALYCE d\u00e9cline toute responsabilit\u00e9.",
      "Contrat suspendu. Archives maintenues."
    ],
    deviance: [
      "Nom de protocole reconnu.",
      "R\u00e9v\u00e9lation programm\u00e9e au JOUR J."
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
      "Connexion locale : KSD-OBS-06",
      "Tapez help."
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
      append(responses[command] || ["Commande inconnue.", "Le syst\u00e8me ne reconna\u00eet pas cette pr\u00e9sence."], responses[command] ? "system" : "error");
    });

    if (close) {
      close.addEventListener("click", () => {
        const overlay = root.closest("[data-terminal-overlay]");
        if (overlay) overlay.classList.remove("open");
      });
    }

    return { input };
  }

  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "terminal-overlay";
    overlay.dataset.terminalOverlay = "true";
    overlay.innerHTML = '<section class="terminal-window" data-terminal-root></section>';
    document.body.append(overlay);
    const terminal = bootTerminal(overlay.querySelector("[data-terminal-root]"), { closable: true });

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) overlay.classList.remove("open");
    });

    return {
      open() {
        overlay.classList.add("open");
        localStorage.setItem(window.KSD_CONFIG.storage.terminalFound, "true");
        setTimeout(() => terminal.input.focus(), 20);
      },
      close() {
        overlay.classList.remove("open");
      }
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const inline = document.querySelector("[data-terminal-screen]");
    if (inline) {
      bootTerminal(inline);
      localStorage.setItem(window.KSD_CONFIG.storage.terminalFound, "true");
    }

    const overlay = createOverlay();
    window.KSDTerminal = overlay;

    document.querySelectorAll("[data-open-terminal]").forEach((button) => {
      button.addEventListener("click", () => overlay.open());
    });

    document.addEventListener("keydown", (event) => {
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        overlay.open();
      }
      if (event.key === "Escape") {
        overlay.close();
      }
    });
  });
})();
