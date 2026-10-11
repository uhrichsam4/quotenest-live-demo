(function () {
  "use strict";
  let config = window.QUOTENEST_CONFIG || {};
  const state = { bedrooms: 2, bathrooms: 1, scope: "full", kitchen: true, living: true, service: "standard", condition: "typical", frequency: "once", pets: false, largeHome: false, extras: [] };
  const $ = (id) => document.getElementById(id);
  let lastQuote;

  function validEmail(address) {
    return typeof address === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) && address.length < 255;
  }
  function validEndpoint(address) {
    if (!address || typeof address !== "string") return false;
    try {
      const url = new URL(address);
      return url.protocol === "https:" && url.hostname === "script.google.com"
        && /^\/macros\/s\/[^/]+\/exec$/.test(url.pathname);
    } catch (_) { return false; }
  }
  function hasRecipient() {
    return validEndpoint(config.leadEndpoint) || validEmail(config.ownerEmail);
  }
  function display() {
    const title = String(config.brand || "Your Cleaning Company").slice(0, 90);
    $("brand").textContent = title;
    $("tagline").textContent = String(config.tagline || "Fresh, simple and stress-free.").slice(0, 150);
    $("consentText").textContent = String(config.consentText || "I agree to be contacted about my quote.").slice(0, 300);
    document.documentElement.style.setProperty("--accent", /^#[0-9a-fA-F]{6}$/.test(config.accent || "") ? config.accent : "#c5b8ff");
    lastQuote = window.QuoteNestEngine.quote(config.prices, state);
    let currency = config.currency || "USD";
    if (!/^[A-Z]{3}$/.test(currency)) currency = "USD";
    $("currencyCode").textContent = currency;
    try {
      $("price").textContent = window.QuoteNestEngine.money(lastQuote.min, currency)
        + " – " + window.QuoteNestEngine.money(lastQuote.max, currency);
    } catch (_) { $("price").textContent = lastQuote.min + " – " + lastQuote.max; }
    $("quoteSummary").textContent = [
      state.bedrooms + (state.bedrooms === 1 ? " bedroom" : " bedrooms"),
      state.bathrooms + (state.bathrooms === 1 ? " bathroom" : " bathrooms"),
      { standard: "Standard", deep: "Deep", moving: "Move in/out" }[state.service] + " cleaning"
    ].join(" · ");
    $("estimateNote").textContent = hasRecipient()
      ? "Indicative range only. The cleaning business confirms its final quote after reviewing the property and service requirements."
      : "Illustrative demo rates only. Every business enters its own prices. The final price is confirmed by the cleaning provider.";
    $("bedrooms").textContent = state.bedrooms;
    $("bathrooms").textContent = state.bathrooms;
    $("request").textContent = hasRecipient() ? "Request a final quote →" : "How quote requests work →";
    $("partialOptions").hidden = state.scope !== "partial";
    $("largeHomeRow").hidden = state.scope === "partial";
    for (const item of document.querySelectorAll(".choice")) {
      item.setAttribute("aria-pressed", String(state[item.dataset.group] === item.dataset.value));
    }
  }
  function summary() {
    return [
      "Cleaning service: " + lastQuote.service,
      "Bedrooms: " + lastQuote.bedrooms,
      "Bathrooms: " + lastQuote.bathrooms,
      "Scope: " + lastQuote.scope,
      "Kitchen: " + (lastQuote.kitchen ? "yes" : "no"),
      "Living area: " + (lastQuote.living ? "yes" : "no"),
      "Large home: " + (lastQuote.largeHome ? "yes" : "no"),
      "Frequency: " + lastQuote.frequency,
      "Property condition: " + lastQuote.condition,
      "Pets in home: " + (lastQuote.pets ? "yes" : "no"),
      "Extras: " + (lastQuote.extras.join(", ") || "none"),
      "Indicative range: " + $("price").textContent,
      "Minimum job charge applied: " + (lastQuote.minimumApplied ? "yes" : "no"),
      "Final quote requires business confirmation."
    ].join("\n");
  }
  for (const item of document.querySelectorAll(".choice")) {
    item.addEventListener("click", function () {
      state[item.dataset.group] = item.dataset.value;
      display();
    });
  }
  for (const item of document.querySelectorAll("[data-room]")) {
    item.addEventListener("click", function () {
      const name = item.dataset.room;
      state[name] = Math.max(0, Math.min(12, state[name] + Number(item.dataset.step)));
      display();
    });
  }
  $("largeHome").addEventListener("change", function () {
    state.largeHome = this.checked;
    display();
  });
  $("pets").addEventListener("change", function () {
    state.pets = this.checked;
    display();
  });
  for (const name of ["kitchen", "living"]) {
    $(name).addEventListener("change", function () {
      state[name] = this.checked;
      display();
    });
  }
  for (const item of document.querySelectorAll("[data-extra]")) {
    item.addEventListener("change", function () {
      state.extras = Array.from(document.querySelectorAll("[data-extra]:checked")).map((element) => element.dataset.extra);
      display();
    });
  }
  $("request").addEventListener("click", function () {
    if (!hasRecipient()) {
      $("demoStatus").textContent =
        "This is a demonstration. There is no recipient connected, so quote requests are disabled. Businesses can connect their own email or Google Sheets in the Pricing Studio.";
      return;
    }
    const form = $("lead");
    form.hidden = false;
    $("request").hidden = true;
    form.elements.startedAt.value = String(Date.now());
    $("demoStatus").textContent = "";
    $("leadStatus").textContent = "";
  });
  $("lead").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = $("leadStatus");
    status.textContent = "";
    if (!form.reportValidity()) return;
    if (form.elements.website.value) { status.textContent = "Unable to process this request."; return; }
    const details = summary();
    form.elements.summary.value = details;
    if (validEndpoint(config.leadEndpoint)) {
      form.action = config.leadEndpoint;
      form.method = "post";
      form.target = "_blank";
      status.textContent = "The request will open in a new browser tab. Check for the confirmation page.";
      HTMLFormElement.prototype.submit.call(form);
    } else if (validEmail(config.ownerEmail)) {
      const subject = "Cleaning estimate request – " + String(form.elements.name.value).slice(0, 100);
      const body = "Name: " + form.elements.name.value + "\nEmail: " + form.elements.email.value
        + "\nPhone: " + form.elements.phone.value + "\nNotes: " + form.elements.notes.value
        + "\n\n" + details + "\n\nContact permission given for this request.";
      const link = document.createElement("a");
      link.href = "mailto:" + encodeURIComponent(config.ownerEmail) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      status.textContent = "Your email app should open. Please press Send there to complete the request.";
    } else {
      status.textContent = "Demo mode: this business has not connected its inbox yet. Nothing was submitted.";
    }
  });
  window.addEventListener("message", function (event) {
    // The editor can only control a same-origin preview.
    if (event.source !== window.parent) return;
    if (location.protocol !== "file:" && event.origin !== location.origin) return;
    if (!event.data || event.data.type !== "quotenest:preview" || !event.data.config) return;
    config = event.data.config;
    $("lead").hidden = true;
    $("request").hidden = false;
    $("demoStatus").textContent = "";
    display();
  });
  display();
})();
