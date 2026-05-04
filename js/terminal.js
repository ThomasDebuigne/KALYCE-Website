(function () {
  const responses = {
    help: [
      "Commandes disponibles :",
      "status",
      "kalyce",
      "isen",
      "daughter",
      "application",
      "failed",
      "sealed",
      "andy",
      "alice",
      "faceless",
      "chimera",
      "clear"
    ],
    status: [
      "Systeme : ancien",
      "Site public : incomplet volontairement",
      "Candidatures : ouvertes",
      "Dossiers rates : non lies",
      "Observation : reciproque"
    ],
    kalyce: [
      "KALYCE commence apres un proces et avant son acte de naissance.",
      "Elite medicale privee. Financement non public. Ethique consideree comme obstacle.",
      "Les succes sont publics parce qu'ils mentent bien.",
      "Les echecs sont caches parce qu'ils repondent."
    ],
    isen: [
      "Contrat presente : medecine cellulaire, mini-robots, guerison.",
      "Contrat reel : locaux disponibles la nuit, rumeurs deja neutralisees.",
      "Collaboration suspendue apres incidents. KALYCE quitte les lieux sans explication."
    ],
    daughter: [
      "Patiente 001 : fille du medecin.",
      "Statut tribunal : victime.",
      "Statut KALYCE : premier succes.",
      "Statut interne : deesse / terme non valide / entree raturee."
    ],
    application: [
      "Formulaire actif : apply.html",
      "Aucun envoi reseau.",
      "Les candidats sont retenus localement, puis oublies officiellement.",
      "Poste : surveillance nocturne ISEN, 00:00-06:00."
    ],
    failed: [
      "4 experiences ratees conservees.",
      "Chemin local : /entities.html",
      "Source : carnet oublie apres depart de KALYCE.",
      "La page ne figure pas dans la navigation. C'est intentionnel."
    ],
    sealed: [
      "THE SEALED ONE",
      "Entree : [REDACTED]",
      "Origine : apres les quatre / avant la fille / erreur de classement",
      "Contre-mesure : [REDACTED]",
      "Instruction : ne pas completer le dossier."
    ],
    entity: [
      "Entrees ratees : andy, alice, faceless, chimera.",
      "Index cache : entities.html",
      "Ne pas ouvrir seul."
    ],
    andy: [
      "ANDY : diffusion sonore immediate.",
      "Sonnerie d'ecole acceptee.",
      "Ne pas remplacer la sonnerie par une voix humaine."
    ],
    alice: [
      "ALICE doit etre observee toutes les 120 secondes.",
      "ALICE observe aussi.",
      "Si elle est trop proche, replacez le mannequin. Ne lui tournez pas le dos."
    ],
    faceless: [
      "Aucun visage detecte.",
      "Changer de camera immediatement.",
      "Regard prolonge : corruption du flux et redemarrage requis."
    ],
    chimera: [
      "CHIMERA approche depuis l'ecran principal.",
      "Eteindre PC. Couper lumieres. Se cacher sous le bureau.",
      "Aucun mouvement ne doit etre detecte."
    ],
    deviance: [
      "Nom de protocole reconnu.",
      "DEVIANCE n'est pas un titre. C'est un protocole."
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
      "Connexion locale : KSD-MIRROR-51",
      "Tapez help.",
      "Les commandes visibles ne sont pas les seules commandes."
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
      append(responses[command] || ["Commande inconnue.", "Le systeme ne reconnait pas cette presence."], responses[command] ? "system" : "error");
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
