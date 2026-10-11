/* Pure pricing logic, portable to Node tests or any front end. */
(function (root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) module.exports = engine;
  root.QuoteNestEngine = engine;
})(typeof window !== "undefined" ? window : globalThis, function () {
  const defaults = {
    base: 65, partialBase: 35, minimumJob: 95, bedroom: 30, bathroom: 23,
    kitchen: 50, living: 35, largeHome: 48, pets: 20,
    service: { standard: 1, deep: 1.55, moving: 1.9 },
    condition: { light: 0.95, typical: 1, heavy: 1.3 },
    frequency: { once: 1, biweekly: 0.94, weekly: 0.88 },
    extras: { oven: 35, fridge: 30, windows: 45 }
  };
  function bounded(value, lower, upper) {
    const number = Number(value);
    if (!Number.isFinite(number)) return lower;
    return Math.max(lower, Math.min(upper, Math.floor(number)));
  }
  function safePrice(value, fallback) {
    return Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100000
      ? Number(value) : fallback;
  }
  function quote(prices, answers) {
    prices = prices || defaults;
    answers = answers || {};
    const bedrooms = bounded(answers.bedrooms, 0, 12);
    const bathrooms = bounded(answers.bathrooms, 0, 12);
    const scope = answers.scope === "partial" ? "partial" : "full";
    const kitchen = scope === "partial" && Boolean(answers.kitchen);
    const living = scope === "partial" && Boolean(answers.living);
    const service = ["standard", "deep", "moving"].includes(answers.service) ? answers.service : "standard";
    const condition = ["light", "typical", "heavy"].includes(answers.condition) ? answers.condition : "typical";
    const frequency = ["once", "biweekly", "weekly"].includes(answers.frequency) ? answers.frequency : "once";
    const largeHome = Boolean(answers.largeHome);
    const pets = Boolean(answers.pets);
    const extras = ["oven", "fridge", "windows"].filter((name) => Array.isArray(answers.extras) && answers.extras.includes(name));
    const base = scope === "partial" ? safePrice(prices.partialBase, defaults.partialBase) : safePrice(prices.base, defaults.base);
    const roomTotal = bedrooms * safePrice(prices.bedroom, defaults.bedroom)
      + bathrooms * safePrice(prices.bathroom, defaults.bathroom)
      + (largeHome && scope === "full" ? safePrice(prices.largeHome, defaults.largeHome) : 0)
      + (kitchen ? safePrice(prices.kitchen, defaults.kitchen) : 0)
      + (living ? safePrice(prices.living, defaults.living) : 0);
    const serviceFactor = safePrice(prices.service && prices.service[service], defaults.service[service]);
    const conditionFactor = safePrice(prices.condition && prices.condition[condition], defaults.condition[condition]);
    const frequencyFactor = safePrice(prices.frequency && prices.frequency[frequency], defaults.frequency[frequency]);
    const extrasTotal = extras.reduce((total, extra) =>
      total + safePrice(prices.extras && prices.extras[extra], defaults.extras[extra]), 0);
    const petsTotal = pets ? safePrice(prices.pets, defaults.pets) : 0;
    const rawEstimate = Math.round(((base + roomTotal) * serviceFactor * conditionFactor + extrasTotal + petsTotal) * frequencyFactor);
    const minimumJob = safePrice(prices.minimumJob, defaults.minimumJob);
    const estimate = Math.max(rawEstimate, minimumJob);
    const min = Math.max(0, Math.floor(estimate * 0.92));
    const max = Math.ceil(estimate * 1.08);
    return { estimate, min, max, minimumApplied: estimate > rawEstimate, bedrooms, bathrooms, scope, kitchen, living, service, condition, frequency, pets, largeHome: scope === "full" && largeHome, extras };
  }
  function money(amount, currency) {
    return new Intl.NumberFormat("en", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(amount);
  }
  return { quote, money, defaults };
});
