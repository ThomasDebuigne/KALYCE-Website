(function () {
  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function updateCountdownPage() {
    const page = document.querySelector("[data-countdown-page]");
    if (!page || !window.KSD) return;
    const parts = window.KSD.releaseParts();
    const days = document.querySelector("[data-days]");
    const hours = document.querySelector("[data-hours]");
    const minutes = document.querySelector("[data-minutes]");
    const seconds = document.querySelector("[data-seconds]");
    const endCopy = document.querySelector("[data-countdown-end]");
    const nightButton = document.querySelector("[data-night-button]");

    if (days) days.textContent = String(parts.days);
    if (hours) hours.textContent = pad(parts.hours);
    if (minutes) minutes.textContent = pad(parts.minutes);
    if (seconds) seconds.textContent = pad(parts.seconds);

    if (parts.distance <= 0) {
      if (endCopy) endCopy.hidden = false;
      if (nightButton) nightButton.hidden = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateCountdownPage();
    setInterval(updateCountdownPage, 1000);
  });
})();
