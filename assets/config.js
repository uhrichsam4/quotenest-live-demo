/* Illustrative premium Canadian demo rates, NOT market averages or a client price list.
   Edit this file or use studio.html for the business's verified rate card. */
window.QUOTENEST_CONFIG = {
  brand: "Northline Cleaning",
  tagline: "A cleaner home starts here.",
  ownerEmail: "",
  currency: "CAD",
  accent: "#c5b8ff",
  prices: {
    base: 110,
    partialBase: 60,
    minimumJob: 165,
    bedroom: 45,
    bathroom: 35,
    kitchen: 65,
    living: 45,
    largeHome: 65,
    pets: 25,
    service: { standard: 1, deep: 1.55, moving: 1.9 },
    condition: { light: 0.95, typical: 1, heavy: 1.3 },
    frequency: { once: 1, biweekly: 0.94, weekly: 0.88 },
    extras: { oven: 45, fridge: 40, windows: 60 }
  },
  // Optional Google Apps Script /exec web-app URL. Blank means email-only request.
  leadEndpoint: "",
  consentText: "I agree to be contacted about this estimate."
};
