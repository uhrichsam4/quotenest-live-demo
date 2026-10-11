(function () {
  "use strict";
  const config = window.QUOTENEST_SALES || {};
  const email = (config.contactEmail || "").trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const primary = document.getElementById("contact-sales");
  const payment = document.getElementById("pay-link");
  const notice = document.getElementById("payment-status");
  if (primary && validEmail) {
    primary.href = "mailto:" + encodeURIComponent(email)
      + "?subject=" + encodeURIComponent("QuoteNest setup inquiry")
      + "&body=" + encodeURIComponent(
        "Hi QuoteNest team,\n\nOur company is: \nWebsite: \n"
        + "We provide: \nOur quote workflow currently: \n\n"
        + "I'd like to discuss the one-time setup package.\n");
    primary.textContent = "Request a tailored setup ↗";
    if (notice) notice.textContent =
      "Email us to confirm website compatibility and scope. You will receive a secure payment link when the project is agreed.";
  } else if (primary && typeof config.interestUrl === "string") {
    try {
      const url = new URL(config.interestUrl);
      if (url.protocol === "https:" && url.hostname === "github.com" &&
          url.pathname === "/uhrichsam4/quotenest-live-demo/issues/new") {
        primary.href = url.toString();
        primary.textContent = "Ask about a tailored setup ↗";
        primary.target = "_blank";
        primary.rel = "noopener noreferrer";
        if (notice) notice.textContent =
          "Opens a public inquiry form on GitHub (free GitHub sign-in required). Share only general business details — no contact or payment information. You can also reply directly to any QuoteNest email you received.";
      }
    } catch (_) { /* Ignore invalid public inquiry URLs. */ }
  }
  if (payment && typeof config.paymentUrl === "string") {
    try {
      const url = new URL(config.paymentUrl);
      if (url.protocol === "https:" &&
          (url.hostname === "buy.stripe.com" || url.hostname === "square.link" ||
           url.hostname === "checkout.stripe.com")) {
        payment.href = url.toString();
        payment.hidden = false;
      }
    } catch (_) { /* A blank or invalid link cannot become a checkout. */ }
  }
})();
