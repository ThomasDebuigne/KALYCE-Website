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
      "Systeme : ancien",
      "Interface publique : volontairement limitee",
      "Acces profond : verrouille",
      "Archives : incompletes",
      "Observation : active",
      "Derniere synchronisation : inconnue"
    ],

    kalyce: [
      "KALYCE n'est pas nee d'une promesse.",
      "Elle est apparue dans les marges d'un dossier judiciaire.",
      "Recherche privee. Financement discret. Resultats presentes avant verification.",
      "Les rapports publics parlent de progres.",
      "Les rapports internes parlent moins."
    ],

    application: [
      "Formulaire actif : apply.html",
      "Transmission reseau : aucune",
      "Les candidatures sont enregistrees localement.",
      "Poste propose : surveillance nocturne, 00:00-06:00.",
      "Experience requise : rester calme lorsque les consignes changent seules."
    ],

    failed: [
      "Dossiers incomplets detectes.",
      "Nombre exact : non affiche",
      "Index local : /entities.html",
      "Statut : archive non referencee",
      "Certaines erreurs ont continue apres leur cloture."
    ],

    sealed: [
      "DOSSIER SCELLE",
      "Nom : [SUPPRIME]",
      "Origine : incoherente",
      "Classement : erreur persistante",
      "Acces refuse.",
      "Instruction : ne pas completer ce qui manque."
    ],

    deviance: [
      "Protocole reconnu.",
      "DEVIANCE n'est pas un surnom.",
      "DEVIANCE n'est pas un projet public.",
      "DEVIANCE commence quand l'observation cesse d'etre passive.",
      "Etat : dormant / instable / attendu"
    ],

    entity: [
      "Terme invalide dans cette interface.",
      "Les entrees individuelles ne sont pas disponibles.",
      "Utilisez les archives autorisees.",
      "Ou n'utilisez rien."
    ],

    andy: [
      "Entree retrouvee : ANDY.",
      "Petite silhouette. Trop immobile hors champ.",
      "Elle suit ce qui fait du bruit.",
      "Ne laissez pas le silence choisir a votre place."
    ],

    alice: [
      "Entree retrouvee : ALICE.",
      "Posture de mannequin. Distance instable.",
      "Elle bouge surtout quand personne ne confirme sa position.",
      "Les controles trop espacés aggravent les erreurs."
    ],

    faceless: [
      "Entree retrouvee : FACELESS.",
      "Taille humaine. Aucun visage exploitable.",
      "L'image se degrade quand on insiste.",
      "Certaines presences doivent seulement etre evitees."
    ],

    chimera: [
      "Entree retrouvee : CHIMERA.",
      "Assemblage massif. Forme incoherente.",
      "L'ecran principal semble l'attirer.",
      "Trop de lumiere facilite son approche."
    ],

    daughter: [
      "Entree protegee.",
      "Patiente initiale : non nommee",
      "Statut public : victime",
      "Statut interne : contradiction",
      "Aucune designation personnelle ne sera affichee."
    ],

    67: [
      "67.",
      "six... seven...",
      "Commande acceptee trop vite.",
      "Analyse annulee : le systeme a reconnu la reference.",
      "Aucune donnee utile. Seulement un echo internet.",
      "Rapport interne : le technicien a souffle du nez.",
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
      "Connexion locale : KSD-MIRROR-51",
      "Session limitee.",
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
          "Cette requete ne correspond a aucune archive publique.",
          "Ou elle a ete retiree avant votre arrivee."
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
