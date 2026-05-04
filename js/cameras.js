(function () {
  const cameras = [
    { id: "CAM_01", name: "Atrium", status: "SIGNAL STABLE", x: "62%", w: "18px", h: "58px" },
    { id: "CAM_02", name: "Biblioth\u00e8que", status: "FAIBLE LUMINOSIT\u00c9", x: "38%", w: "16px", h: "44px" },
    { id: "CAM_03", name: "Couloir Nord", status: "MOUVEMENT NON ATTRIBU\u00c9", x: "70%", w: "12px", h: "78px" },
    { id: "CAM_04", name: "Toilettes", status: "SIGNAL INSTABLE", x: "48%", w: "22px", h: "50px" },
    { id: "CAM_05", name: "Salle MI", status: "AUDIO COUP\u00c9", x: "27%", w: "28px", h: "46px" },
    { id: "CAM_06", name: "Bureau de s\u00e9curit\u00e9", status: "OBSERVATION REQUISE", x: "58%", w: "26px", h: "76px" },
    { id: "CAM_07", name: "Salle serveur", status: "TEMP\u00c9RATURE ANORMALE", x: "42%", w: "14px", h: "52px" },
    { id: "CAM_08", name: "Zone condamn\u00e9e", status: "ACC\u00c8S VISUEL PARTIEL", x: "78%", w: "34px", h: "92px" }
  ];

  const reportMessages = [
    "Anomalie enregistr\u00e9e.",
    "ERREUR : anomalie non reconnue par le syst\u00e8me.",
    "Cette pr\u00e9sence ne doit pas \u00eatre signal\u00e9e.",
    "Le syst\u00e8me ne reconna\u00eet pas cette pr\u00e9sence."
  ];

  const apparitionMessages = [
    "Aucun visage d\u00e9tect\u00e9.",
    "Le mannequin n'\u00e9tait pas l\u00e0 hier.",
    "Signal sonore diffus\u00e9 sans commande.",
    "Ne quittez pas les cam\u00e9ras.",
    "Observation prolong\u00e9e non recommand\u00e9e."
  ];

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $$(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function renderTile(camera, index) {
    return `
      <button class="camera-tile ${index === 0 ? "active" : ""}" type="button" data-camera-id="${camera.id}">
        <div class="camera-visual">
          <span class="tiny-presence" style="--x:${camera.x};--w:${camera.w};--h:${camera.h}"></span>
        </div>
        <span class="camera-label">
          <strong>${camera.id} / ${camera.name}</strong>
          <span>${camera.status}</span>
        </span>
      </button>
    `;
  }

  function initCameraConsole() {
    const locked = $("[data-camera-locked]");
    const unlocked = $("[data-camera-unlocked]");
    if (!locked || !unlocked || !window.KSD) return;

    if (!window.KSD.hasCameraAccess()) {
      locked.hidden = false;
      unlocked.hidden = true;
      return;
    }

    locked.hidden = true;
    unlocked.hidden = false;

    const grid = $("[data-camera-grid]");
    const selected = $("[data-selected-camera]");
    const signal = $("[data-camera-signal]");
    const message = $("[data-camera-message]");
    const report = $("[data-report-anomaly]");
    const integrityText = $("[data-camera-integrity]");
    const integrityBar = $("[data-camera-integrity-bar]");
    const mainFeed = $(".main-feed-visual");
    let activeId = cameras[0].id;
    let integrity = 100;

    grid.innerHTML = cameras.map(renderTile).join("");

    function setIntegrity(value) {
      integrity = Math.max(12, Math.min(100, value));
      integrityText.textContent = `${Math.round(integrity)}%`;
      integrityBar.style.width = `${integrity}%`;
    }

    function selectCamera(id) {
      activeId = id;
      const camera = cameras.find((item) => item.id === id) || cameras[0];
      selected.textContent = `${camera.id} / ${camera.name.toUpperCase()}`;
      signal.textContent = camera.status;
      mainFeed.classList.remove("is-anomaly");
      $$(".camera-tile", grid).forEach((tile) => tile.classList.toggle("active", tile.dataset.cameraId === id));
    }

    grid.addEventListener("click", (event) => {
      const tile = event.target.closest("[data-camera-id]");
      if (!tile) return;
      selectCamera(tile.dataset.cameraId);
    });

    report.addEventListener("click", () => {
      const response = reportMessages[Math.floor(Math.random() * reportMessages.length)];
      message.textContent = response;
      if (response.includes("ERREUR") || response.includes("pr\u00e9sence")) {
        setIntegrity(integrity - 4);
      }
    });

    setInterval(() => {
      const tile = $$(".camera-tile", grid)[Math.floor(Math.random() * cameras.length)];
      if (!tile) return;
      tile.classList.add("is-anomaly");
      const text = apparitionMessages[Math.floor(Math.random() * apparitionMessages.length)];
      message.textContent = text;
      if (tile.dataset.cameraId === activeId) {
        mainFeed.classList.add("is-anomaly");
      }
      if (text.includes("visage") || tile.dataset.cameraId === "CAM_08") {
        setIntegrity(integrity - 3);
      }
      setTimeout(() => {
        tile.classList.remove("is-anomaly");
        mainFeed.classList.remove("is-anomaly");
      }, 900);
    }, 4800);

    selectCamera(activeId);
    setIntegrity(100);
  }

  document.addEventListener("DOMContentLoaded", initCameraConsole);
})();
