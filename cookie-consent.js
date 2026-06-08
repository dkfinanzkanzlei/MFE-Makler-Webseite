/* ─────────────────────────────────────────────
   MFE Cookie-Consent · DSGVO/TDDDG-konform
   - First-Party-Consent-Cookie (technisch notwendig)
   - Opt-in für externe Dienste (z. B. Google-Kalender-Terminbuchung)
   - Gleichwertige Buttons (Akzeptieren / Ablehnen), granular, jederzeit widerrufbar
   - Externe Einbettungen mit [data-consent-src] laden erst nach Einwilligung
   ───────────────────────────────────────────── */
(function () {
  "use strict";
  var KEY = "mfe_consent", VERSION = 1, DAYS = 180;

  function readConsent() {
    try {
      var m = document.cookie.match(/(?:^|;\s*)mfe_consent=([^;]+)/);
      if (!m) return null;
      var o = JSON.parse(decodeURIComponent(m[1]));
      return (o && o.v === VERSION) ? o : null;
    } catch (e) { return null; }
  }
  function writeConsent(external) {
    var o = { v: VERSION, external: !!external, ts: Math.floor(Date.now() / 1000) };
    document.cookie = KEY + "=" + encodeURIComponent(JSON.stringify(o)) +
      ";Max-Age=" + (DAYS * 86400) + ";Path=/;SameSite=Lax";
    return o;
  }

  /* Externe Einbettungen freischalten / sperren */
  function applyConsent(external) {
    document.querySelectorAll("[data-consent-src]").forEach(function (el) {
      var ph = el.parentNode ? el.parentNode.querySelector(".cc-embed-ph") : null;
      if (external) {
        if (!el.getAttribute("src")) el.setAttribute("src", el.getAttribute("data-consent-src"));
        if (ph) ph.remove();
      }
    });
    document.documentElement.classList.toggle("cc-external-on", !!external);
  }

  var overlay, card, fab;

  function buildUI() {
    fab = document.createElement("button");
    fab.className = "cc-fab cc-hidden";
    fab.type = "button";
    fab.setAttribute("aria-label", "Cookie-Einstellungen öffnen");
    fab.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z"/><circle cx="9" cy="11" r="1"/><circle cx="14" cy="15" r="1"/><circle cx="16" cy="9" r="1"/></svg>';
    fab.addEventListener("click", function () { openBanner(true); });

    overlay = document.createElement("div");
    overlay.className = "cc-overlay";

    card = document.createElement("div");
    card.className = "cc-card cc-root";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.setAttribute("aria-label", "Cookie- und Datenschutz-Einstellungen");
    card.innerHTML =
      '<div class="cc-card-pad">' +
        '<span class="cc-eyebrow">Datenschutz</span>' +
        '<div class="cc-title">Cookies &amp; externe Dienste</div>' +
        '<p class="cc-text">Wir verwenden ausschließlich ein technisch notwendiges Cookie, um deine Auswahl zu speichern. ' +
        'Für externe Dienste – etwa die Online-Terminbuchung über Google – benötigen wir deine Einwilligung. ' +
        'Mehr dazu in der <a href="datenschutz.html">Datenschutzerklärung</a> und im <a href="impressum.html">Impressum</a>.</p>' +

        '<div class="cc-actions">' +
          '<button type="button" class="cc-btn cc-accept" data-cc="accept">Alle akzeptieren</button>' +
          '<button type="button" class="cc-btn cc-reject" data-cc="reject">Nur notwendige</button>' +
        '</div>' +
        '<button type="button" class="cc-settings-link" data-cc="toggle">Einstellungen anpassen</button>' +

        '<div class="cc-details cc-hidden" data-cc="details">' +
          '<div class="cc-row">' +
            '<div><h4>Notwendig</h4><p>Speichert deine Cookie-Auswahl. Ohne diese Funktion ist die Website nicht nutzbar.</p></div>' +
            '<span class="cc-locked">Immer aktiv</span>' +
          '</div>' +
          '<div class="cc-row">' +
            '<div><h4>Externe Dienste</h4><p>Online-Terminbuchung (Google&nbsp;Kalender) &amp; künftige eingebettete Inhalte. Überträgt Daten an den jeweiligen Anbieter.</p></div>' +
            '<label class="cc-switch"><input type="checkbox" data-cc="ext-toggle" aria-label="Externe Dienste erlauben"><span class="cc-slider"></span></label>' +
          '</div>' +
          '<button type="button" class="cc-btn cc-reject cc-save" data-cc="save">Auswahl speichern</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(card);
    document.body.appendChild(fab);

    card.addEventListener("click", function (e) {
      var t = e.target.closest("[data-cc]"); if (!t) return;
      var a = t.getAttribute("data-cc");
      if (a === "accept") decide(true);
      else if (a === "reject") decide(false);
      else if (a === "toggle") toggleDetails();
      else if (a === "save") decide(card.querySelector('[data-cc="ext-toggle"]').checked);
    });
  }

  function toggleDetails() {
    card.querySelector('[data-cc="details"]').classList.toggle("cc-hidden");
  }

  function openBanner(showDetails) {
    var existing = readConsent();
    card.querySelector('[data-cc="ext-toggle"]').checked = existing ? !!existing.external : false;
    card.querySelector('[data-cc="details"]').classList.toggle("cc-hidden", !showDetails);
    overlay.classList.add("cc-show");
    requestAnimationFrame(function () { card.classList.add("cc-show"); });
    fab.classList.add("cc-hidden");
  }

  function closeBanner() {
    card.classList.remove("cc-show");
    overlay.classList.remove("cc-show");
    fab.classList.remove("cc-hidden");
  }

  function decide(external) {
    writeConsent(external);
    applyConsent(external);
    closeBanner();
  }

  function init() {
    buildUI();
    var c = readConsent();
    if (c) { applyConsent(c.external); fab.classList.remove("cc-hidden"); }
    else { openBanner(false); }
    window.MFEConsent = {
      open: function () { openBanner(true); },
      get: readConsent
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
