(function () {
  const config = window.KSD_CONFIG;
  const keys = config.storage;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function forceScrollTop() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  function readList(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (_error) {
      return [];
    }
  }

  function writeList(key, value) {
    localStorage.setItem(key, JSON.stringify(Array.from(new Set(value))));
  }

  function markInList(key, value) {
    const list = readList(key);
    if (!list.includes(value)) {
      list.push(value);
      writeList(key, list);
    }
  }

  function hasCameraAccess() {
    return localStorage.getItem(keys.access) === "surveillance";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function fetchJson(path) {
    return fetch(path).then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load ${path}`);
      }
      return response.json();
    });
  }

  function releaseParts() {
    const currentYear = new Date().getFullYear();
    let targetDate = new Date(currentYear, 4, 28, 0, 0, 0);

    if (Date.now() > targetDate.getTime()) {
      targetDate = new Date(currentYear + 1, 4, 28, 0, 0, 0);
    }

    const target = targetDate.getTime();
    const distance = Math.max(0, target - Date.now());
    const totalSeconds = Math.floor(distance / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds, distance };
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function updateClocks() {
    const now = new Date();
    const stamp = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    $$("[data-live-clock]").forEach((node) => {
      node.textContent = stamp;
    });
  }

  function updateCompactCountdown() {
    const node = $("[data-countdown-inline]");
    if (!node) return;

    const parts = releaseParts();

    if (parts.distance <= 0) {
      node.textContent = "CANAL OUVERT";
      return;
    }

    node.textContent = `${parts.days} jours / ${pad(parts.hours)} heures / ${pad(parts.minutes)} minutes / ${pad(parts.seconds)} secondes`;
  }

  function showSystemDialog(title, message) {
    const dialog = document.createElement("dialog");
    dialog.className = "archive-modal";
    dialog.innerHTML = `
      <button class="modal-close" type="button">FERMER</button>
      <div class="system-label">${escapeHtml(title)}</div>
      <p>${escapeHtml(message)}</p>
    `;

    document.body.append(dialog);

    $(".modal-close", dialog).addEventListener("click", () => {
      dialog.close();
      dialog.remove();
    });

    dialog.addEventListener("close", () => dialog.remove());
    dialog.showModal();
  }

  function initNavigation() {
    const page = document.body.dataset.page;

    $$(`[data-nav="${page}"]`).forEach((item) => item.classList.add("active"));

    $$("[data-build-number]").forEach((item) => {
      item.textContent = config.build;
    });

    $$("[data-camera-link]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (hasCameraAccess()) return;

        event.preventDefault();
        showSystemDialog("ACCÈS REFUSÉ", "Candidature incomplète. Niveau d'accès insuffisant.");
      });
    });
  }

  function initHomeWarnings() {
    const node = $("[data-home-random-warning]");
    if (!node) return;

    const warnings = [
      "Le contact visuel doit être maintenu.",
      "Le mannequin n'était pas là hier.",
      "Le signal ne vient pas de la caméra.",
      "Si vous l'entendez, ne répondez pas.",
      "KALYCE décline toute responsabilité."
    ];

    let index = 0;

    setInterval(() => {
      index = (index + 1) % warnings.length;
      node.textContent = warnings[index];
    }, 5200);
  }

  function initRecruitmentPopups() {
    if (document.body.dataset.page !== "home") return;

    const container = $(".recruitment-popups");
    if (!container) return;

    const messages = [
      {
        title: "KALYCE RECRUTE",
        strong: "Votre profil a été remarqué.",
        text: "Vous lisez encore. C'est déjà une forme de consentement opérationnel."
      },
      {
        title: "TRANSMISSION PRIORITAIRE",
        strong: "Accès civil encore ouvert.",
        text: "La forme actuelle fatigue. Les sujets lucides sont invités à se présenter."
      },
      {
        title: "DOSSIER EN ATTENTE",
        strong: "Une main discrète manque.",
        text: "KALYCE ne cherche pas des employés. KALYCE reconnaît les témoins utiles."
      },
      {
        title: "CORRECTION HUMAINE",
        strong: "Ne détournez pas le regard.",
        text: "Si l'ancien monde vous paraît déjà dépassé, l'ouverture vous concerne."
      },
      {
        title: "APPEL DE CELLULE",
        strong: "Votre hésitation est enregistrée.",
        text: "Les esprits capables de participer à la reprise seront contactés en priorité."
      },
      {
        title: "NIVEAU D'ACCÈS : CANDIDAT",
        strong: "Vous êtes encore à l'extérieur.",
        text: "Déposez une candidature avant fermeture du canal civil."
      },
      {
        title: "SIGNAL PERSISTANT",
        strong: "La fenêtre revient toujours.",
        text: "Fermer le message ne ferme pas le besoin. KALYCE continue d'observer."
      },
      {
        title: "RECRUTEMENT ACTIF",
        strong: "Canal civil instable.",
        text: "Les candidatures silencieuses seront traitées avant les autres."
      }
    ];

    const desktopPositions = [
      { top: "72px", left: "22px" },
      { top: "96px", right: "26px" },
      { bottom: "26px", left: "32px" },
      { bottom: "34px", right: "28px" },

      { top: "24%", left: "12%" },
      { top: "28%", right: "13%" },
      { top: "40%", left: "34%" },
      { top: "46%", right: "31%" },
      { top: "55%", left: "18%" },
      { top: "58%", right: "16%" },

      { top: "36%", left: "50%", transform: "translateX(-50%)" },
      { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
      { top: "66%", left: "50%", transform: "translateX(-50%)" }
    ];

    const mobilePositions = [
      { top: "92px", left: "9px" },
      { bottom: "22px", left: "9px" },
      { top: "42%", left: "9px" }
    ];

    let messageIndex = 0;
    let popupCount = 0;
    let popupTimer = null;

    function isMobile() {
      return window.matchMedia("(max-width: 700px)").matches;
    }

    function getMaxVisiblePopups() {
      return isMobile() ? 2 : 12;
    }

    function getPopupInterval() {
      return isMobile() ? 30000 : 30000;
    }

    function getPopupLifetime() {
      return isMobile() ? 30000 : 30000;
    }

    function getPositions() {
      return isMobile() ? mobilePositions : desktopPositions;
    }

    function removePopup(popup) {
      if (!popup || popup.classList.contains("exiting")) return;

      popup.classList.add("exiting");

      setTimeout(() => {
        popup.remove();
      }, 220);
    }

    function limitVisiblePopups() {
      const visiblePopups = $$(".recruitment-popup", container).filter((item) => !item.classList.contains("exiting"));
      const maxVisiblePopups = getMaxVisiblePopups();

      while (visiblePopups.length > maxVisiblePopups) {
        removePopup(visiblePopups.shift());
      }
    }

    function applyPosition(popup, position) {
      popup.style.top = "";
      popup.style.right = "";
      popup.style.bottom = "";
      popup.style.left = "";
      popup.style.transform = "";

      Object.entries(position).forEach(([key, value]) => {
        popup.style[key] = value;
      });
    }

    function createRecruitmentPopup() {
      const message = messages[messageIndex % messages.length];
      const positions = getPositions();
      const position = positions[popupCount % positions.length];

      messageIndex += 1;
      popupCount += 1;

      const popup = document.createElement("aside");
      popup.className = "recruitment-popup";
      popup.setAttribute("role", "status");

      applyPosition(popup, position);

      popup.innerHTML = `
        <div class="recruitment-popup-titlebar">
          <span>${escapeHtml(message.title)}</span>
          <button class="recruitment-popup-close" type="button" aria-label="Fermer">X</button>
        </div>

        <div class="recruitment-popup-body">
          <strong>${escapeHtml(message.strong)}</strong>
          <p>${escapeHtml(message.text)}</p>

          <div class="recruitment-popup-actions">
            <a href="/xrz9qwv2">Candidature</a>
            <button type="button" data-popup-dismiss>Ignorer</button>
          </div>
        </div>
      `;

      container.append(popup);
      limitVisiblePopups();

      $(".recruitment-popup-close", popup).addEventListener("click", () => removePopup(popup));
      $("[data-popup-dismiss]", popup).addEventListener("click", () => removePopup(popup));

      setTimeout(() => {
        removePopup(popup);
      }, getPopupLifetime());
    }

    function restartPopupTimer() {
      if (popupTimer) {
        clearInterval(popupTimer);
      }

      popupTimer = setInterval(createRecruitmentPopup, getPopupInterval());
      limitVisiblePopups();
    }

    setTimeout(createRecruitmentPopup, 20000);
    restartPopupTimer();

    window.addEventListener("resize", () => {
      limitVisiblePopups();
      restartPopupTimer();
    });
  }

  function getFormValue(form, name) {
    const field = form.elements[name];
    return field ? String(field.value || "").trim() : "";
  }

  function getCheckedQuestions(form) {
    return $$(".question-list input[type='checkbox']", form)
      .filter((input) => input.checked)
      .map((input) => {
        const label = input.closest("label");
        return label ? label.textContent.replace(/\s+/g, " ").trim() : "Question validée";
      });
  }

  function limitDiscordText(value, maxLength = 1024) {
    const text = String(value || "").trim();

    if (!text) return "Non renseigné";
    if (text.length <= maxLength) return text;

    return `${text.slice(0, maxLength - 3)}...`;
  }

  function buildApplicationWebhookPayload(form, generatedId) {
    const firstName = getFormValue(form, "firstName");
    const lastName = getFormValue(form, "lastName");
    const checkedQuestions = getCheckedQuestions(form);

    return {
      username: "KALYCE Recrutement",
      content: `Nouvelle candidature reçue : ${generatedId}`,
      allowed_mentions: {
        parse: []
      },
      embeds: [
        {
          title: "Nouvelle candidature KALYCE",
          color: 0xff2020,
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "Identifiant",
              value: generatedId,
              inline: true
            },
            {
              name: "Nom",
              value: limitDiscordText(lastName, 256),
              inline: true
            },
            {
              name: "Prénom",
              value: limitDiscordText(firstName, 256),
              inline: true
            },
            {
              name: "Âge",
              value: limitDiscordText(getFormValue(form, "age"), 256),
              inline: true
            },
            {
              name: "Email",
              value: limitDiscordText(getFormValue(form, "email"), 256),
              inline: true
            },
            {
              name: "Disponibilité nocturne",
              value: limitDiscordText(getFormValue(form, "availability"), 256),
              inline: true
            },
            {
              name: "Tests validés",
              value: limitDiscordText(checkedQuestions.map((question) => `- ${question}`).join("\n")),
              inline: false
            },
            {
              name: "Origine",
              value: limitDiscordText(window.location.href),
              inline: false
            }
          ]
        }
      ]
    };
  }

  async function sendApplicationWebhook(form, generatedId) {
    const webhookUrl = config.webhooks && config.webhooks.application;

    if (!webhookUrl) return;

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildApplicationWebhookPayload(form, generatedId))
    });

    if (!response.ok) {
      throw new Error(`Webhook Discord indisponible (${response.status})`);
    }
  }

  function openScreamerFlow() {
    window.location.assign(config.links.screamer || "/xyzxyzyxzyyxzyz");
  }

  function initOptionalQuestionnaire() {
    $$(".question-list input[type='checkbox']").forEach((checkbox) => {
      checkbox.required = false;
      checkbox.removeAttribute("required");
    });
  }

  function initApplicationForm() {
    const form = $("[data-application-form]");
    const accepted = $("[data-accepted-screen]");
    const tempNode = $("[data-temp-id]");
    const statusNode = $("[data-application-status]");
    const submitButton = form ? $("button[type='submit']", form) : null;

    if (!form || !accepted) return;

    const existingId = localStorage.getItem(keys.tempId);

    if (localStorage.getItem(keys.applicationSubmitted) === "true" && existingId) {
      form.hidden = true;
      accepted.hidden = false;

      if (tempNode) tempNode.textContent = existingId;

      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const generatedId = `KSD-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;
      const initialButtonText = submitButton ? submitButton.textContent : "";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "TRANSMISSION EN COURS";
      }

      if (statusNode) {
        statusNode.textContent = "Transmission du dossier vers le canal de recrutement...";
        statusNode.classList.remove("error");
      }

      try {
        await sendApplicationWebhook(form, generatedId);
      } catch (_error) {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = initialButtonText;
        }

        if (statusNode) {
          statusNode.textContent = "Transmission impossible. Vérifiez le canal webhook puis réessayez.";
          statusNode.classList.add("error");
        }

        showSystemDialog("TRANSMISSION REFUSÉE", "Le canal webhook n'a pas répondu. Le dossier n'a pas été ajouté.");
        return;
      }

      localStorage.setItem(keys.applicationSubmitted, "true");
      localStorage.setItem(keys.access, "candidate");
      localStorage.setItem(keys.tempId, generatedId);

      if (statusNode) {
        statusNode.textContent = "Transmission acceptee. Ouverture du canal cache...";
      }

      setTimeout(openScreamerFlow, 650);
    });
  }

  function renderArchiveLine(line) {
    return escapeHtml(line).replace(/(\u2588+)/g, '<span class="redacted">$1</span>');
  }

  function initArchives() {
    const listNode = $("[data-archive-list]");
    const modal = $("[data-archive-modal]");

    if (!listNode || !modal) return;

    fetchJson("/data/archives.json")
      .then((archives) => {
        const read = readList(keys.archivesRead);

        listNode.innerHTML = archives.map((archive) => `
          <button class="archive-row" type="button" data-archive-id="${archive.id}">
            <span>${escapeHtml(archive.path)}</span>
            <span class="archive-state">${read.includes(archive.id) ? "CONSULTÉ" : archive.clearance}</span>
          </button>
        `).join("");

        listNode.addEventListener("click", (event) => {
          const row = event.target.closest("[data-archive-id]");

          if (!row) return;

          const archive = archives.find((item) => item.id === row.datasetArchiveId);

          if (!archive) return;

          markInList(keys.archivesRead, archive.id);

          $("[data-archive-title]", modal).textContent = archive.title;
          $("[data-archive-path]", modal).textContent = archive.path;
          $("[data-archive-clearance]", modal).textContent = archive.clearance;
          $("[data-archive-body]", modal).innerHTML = archive.body.map((line) => `<p>${renderArchiveLine(line)}</p>`).join("");

          modal.showModal();

          const state = $(".archive-state", row);
          if (state) state.textContent = "CONSULTÉ";
        });
      })
      .catch(() => {
        listNode.innerHTML = '<p>ERREUR : index archives indisponible.</p>';
      });

    $("[data-close-archive]", modal).addEventListener("click", () => modal.close());
  }

  function initEntities() {
    const listNode = $("[data-entity-list]");

    if (!listNode) return;

    fetchJson("/data/entities.json")
      .then((entities) => {
        listNode.innerHTML = entities.map((entity) => `
          <article class="entity-card" data-entity="${escapeHtml(entity.id)}">
            <div class="entity-visual" aria-hidden="true"></div>
            <div>
              <div class="system-label">ENTITÉ : ${escapeHtml(entity.name)}</div>
              <h2>${escapeHtml(entity.name)}</h2>
              <ul class="entity-facts">
                <li><strong>Classe :</strong> ${escapeHtml(entity.classification)}</li>
                <li><strong>Morphologie :</strong> ${escapeHtml(entity.morphology)}</li>
                <li><strong>Zone :</strong> ${escapeHtml(entity.zone)}</li>
                <li><strong>Comportement :</strong> ${escapeHtml(entity.behavior)}</li>
                ${entity.failure ? `<li><strong>Échec :</strong> ${escapeHtml(entity.failure)}</li>` : ""}
                ${entity.lastSeen ? `<li><strong>Dernière preuve :</strong> ${escapeHtml(entity.lastSeen)}</li>` : ""}
                <li><strong>Contre-mesure :</strong> ${escapeHtml(entity.countermeasure)}</li>
                <li><strong>Instruction :</strong> ${escapeHtml(entity.instruction || entity.note)}</li>
              </ul>
            </div>
          </article>
        `).join("");

        entities.forEach((entity) => markInList(keys.entitiesDiscovered, entity.id));
      })
      .catch(() => {
        listNode.innerHTML = '<p>ERREUR : dossiers indisponibles.</p>';
      });
  }

  function initIncidents() {
    const listNode = $("[data-incident-list]");
    const filters = $("[data-incident-filters]");

    if (!listNode || !filters) return;

    let incidents = [];
    let activeFilter = "all";

    function isLocked(item) {
      return item.lockedUntil && new Date(item.lockedUntil).getTime() > Date.now();
    }

    function render() {
      const visible = incidents.filter((item) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "unresolved") return item.unresolved;
        return item.category === activeFilter;
      });

      listNode.innerHTML = visible.map((item) => {
        const locked = isLocked(item);
        const copy = locked ? "ENTRÉE VERROUILLÉE / DÉCLASSIFICATION DIFFÉRÉE" : item.copy;
        const meta = locked ? `LOCK ${item.lockedUntil.slice(0, 10)}` : item.status;

        return `
          <article class="incident-row ${locked ? "locked" : ""}">
            <div class="incident-time">${escapeHtml(item.time)}</div>
            <p class="incident-copy">${escapeHtml(copy)}</p>
            <div class="incident-meta">${escapeHtml(meta)}</div>
          </article>
        `;
      }).join("");
    }

    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");

      if (!button) return;

      activeFilter = button.dataset.filter;

      $$(".filter", filters).forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      render();
    });

    fetchJson("/data/incidents.json")
      .then((items) => {
        incidents = items;
        render();
      })
      .catch(() => {
        listNode.innerHTML = '<p>ERREUR : journal incidents indisponible.</p>';
      });
  }

  function initFinalLinks() {
    const download = $("[data-final-download]");
    const trailer = $("[data-final-trailer]");
    const cameras = $("[data-final-cameras]");

    if (download) download.href = config.links.download;
    if (trailer) trailer.href = config.links.trailer;
    if (cameras) cameras.href = config.links.cameras;
  }

  function initAudioToggle() {
    const buttons = $$("[data-audio-toggle]");

    if (!buttons.length) return;

    const setState = (enabled) => {
      localStorage.setItem(keys.audioEnabled, enabled ? "true" : "false");

      buttons.forEach((button) => {
        button.classList.toggle("enabled", enabled);
        button.textContent = enabled ? "AUDIO ACTIVÉ" : "ACTIVER L'AUDIO";
      });
    };

    setState(localStorage.getItem(keys.audioEnabled) === "true");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const enabled = localStorage.getItem(keys.audioEnabled) !== "true";
        setState(enabled);
      });
    });
  }

  window.KSD = {
    hasCameraAccess,
    keys,
    markInList,
    readList,
    releaseParts,
    showSystemDialog
  };

  document.addEventListener("DOMContentLoaded", () => {
    forceScrollTop();

    initNavigation();
    initHomeWarnings();
    initRecruitmentPopups();
    initOptionalQuestionnaire();
    initApplicationForm();
    initArchives();
    initEntities();
    initIncidents();
    initFinalLinks();
    initAudioToggle();

    updateClocks();
    updateCompactCountdown();

    setInterval(updateClocks, 1000);
    setInterval(updateCompactCountdown, 1000);
  });

  window.addEventListener("load", () => {
    forceScrollTop();

    setTimeout(forceScrollTop, 50);
    setTimeout(forceScrollTop, 150);
  });
})();
