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
    const target = new Date(config.releaseDate).getTime();
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
      node.textContent = "Le service commence maintenant.";
      return;
    }
    node.textContent = `Début du service dans : ${parts.days} jours ${pad(parts.hours)} heures ${pad(parts.minutes)} minutes`;
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

  function initApplicationForm() {
    const form = $("[data-application-form]");
    const accepted = $("[data-accepted-screen]");
    const tempNode = $("[data-temp-id]");
    if (!form || !accepted) return;

    const existingId = localStorage.getItem(keys.tempId);
    if (localStorage.getItem(keys.applicationSubmitted) === "true" && existingId) {
      form.hidden = true;
      accepted.hidden = false;
      if (tempNode) tempNode.textContent = existingId;
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const generatedId = `KSD-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;
      localStorage.setItem(keys.applicationSubmitted, "true");
      localStorage.setItem(keys.access, "candidate");
      localStorage.setItem(keys.tempId, generatedId);
      form.hidden = true;
      accepted.hidden = false;
      if (tempNode) tempNode.textContent = generatedId;
      showSystemDialog("CANDIDATURE ACCEPTÉE", "Niveau d'accès : ATTENTE. Votre dossier a ete ajoute.");
    });
  }

  function renderArchiveLine(line) {
    return escapeHtml(line).replace(/(\u2588+)/g, '<span class="redacted">$1</span>');
  }

  function initArchives() {
    const listNode = $("[data-archive-list]");
    const modal = $("[data-archive-modal]");
    if (!listNode || !modal) return;

    fetchJson("data/archives.json")
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
          const archive = archives.find((item) => item.id === row.dataset.archiveId);
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

    fetchJson("data/entities.json")
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
                ${entity.failure ? `<li><strong>Echec :</strong> ${escapeHtml(entity.failure)}</li>` : ""}
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
      $$(".filter", filters).forEach((item) => item.classList.toggle("active", item === button));
      render();
    });

    fetchJson("data/incidents.json")
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
