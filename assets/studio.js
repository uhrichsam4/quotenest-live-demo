(function () {
  "use strict";
  const form = document.getElementById("settings");
  const frame = document.getElementById("preview");
  const base = JSON.parse(JSON.stringify(window.QUOTENEST_CONFIG));
  const get = (name) => form.elements.namedItem(name);
  const fields = {
    base: base.prices.base, partialBase: base.prices.partialBase,
    minimumJob: base.prices.minimumJob,
    bedroom: base.prices.bedroom, bathroom: base.prices.bathroom,
    kitchen: base.prices.kitchen, living: base.prices.living,
    largeHome: base.prices.largeHome, pets: base.prices.pets, deep: base.prices.service.deep,
    light: base.prices.condition.light, heavy: base.prices.condition.heavy,
    moving: base.prices.service.moving, oven: base.prices.extras.oven,
    fridge: base.prices.extras.fridge, windows: base.prices.extras.windows,
    weekly: base.prices.frequency.weekly, biweekly: base.prices.frequency.biweekly
  };
  ["brand", "tagline", "ownerEmail", "leadEndpoint", "currency", "accent"].forEach((key) => { get(key).value = base[key] || ""; });
  Object.entries(fields).forEach(([key, value]) => { get(key).value = value; });
  function currentConfig() {
    const config = JSON.parse(JSON.stringify(base));
    ["brand", "tagline", "ownerEmail", "leadEndpoint", "currency", "accent"].forEach((name) => { config[name] = get(name).value; });
    function n(field, min, max) {
      const value = Number(get(field).value);
      return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fields[field];
    }
    config.prices.base = n("base", 0, 100000);
    config.prices.partialBase = n("partialBase", 0, 100000);
    config.prices.minimumJob = n("minimumJob", 0, 100000);
    config.prices.bedroom = n("bedroom", 0, 100000);
    config.prices.bathroom = n("bathroom", 0, 100000);
    config.prices.kitchen = n("kitchen", 0, 100000);
    config.prices.living = n("living", 0, 100000);
    config.prices.largeHome = n("largeHome", 0, 100000);
    config.prices.pets = n("pets", 0, 100000);
    config.prices.service.deep = n("deep", 1, 5);
    config.prices.service.moving = n("moving", 1, 5);
    config.prices.condition.light = n("light", .5, 2);
    config.prices.condition.heavy = n("heavy", 1, 5);
    config.prices.extras.oven = n("oven", 0, 100000);
    config.prices.extras.fridge = n("fridge", 0, 100000);
    config.prices.extras.windows = n("windows", 0, 100000);
    config.prices.frequency.weekly = n("weekly", .5, 1);
    config.prices.frequency.biweekly = n("biweekly", .5, 1);
    return config;
  }
  function updatePreview() {
    if (frame.contentWindow) frame.contentWindow.postMessage({ type: "quotenest:preview", config: currentConfig() }, location.protocol === "file:" ? "*" : location.origin);
  }
  frame.addEventListener("load", updatePreview);
  form.addEventListener("input", updatePreview);
  document.getElementById("download").addEventListener("click", function () {
    const data = "/* Customized QuoteNest rates. */\nwindow.QUOTENEST_CONFIG = " + JSON.stringify(currentConfig(), null, 2) + ";\n";
    const url = URL.createObjectURL(new Blob([data], { type: "application/javascript;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "config.js";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  });
})();
