/* =========================
FILE: script.js
EmailJS lead capture + WhatsApp fallback
========================= */

const PHONE_E164 = "+919050040129";
const PHONE_WA = "919050040129";
const EMAIL_TO = "contact@anjanirealheights.com";

document.getElementById("year").textContent = new Date().getFullYear();

/* Mobile nav toggle */
const navToggle = document.querySelector(".navToggle");
const mobileNav = document.querySelector(".mobileNav");

if (navToggle && mobileNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    mobileNav.style.display = isOpen ? "none" : "block";
    mobileNav.setAttribute("aria-hidden", String(isOpen));
  });

  mobileNav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      mobileNav.style.display = "none";
      mobileNav.setAttribute("aria-hidden", "true");
    });
  });
}

/* WhatsApp fallback link */
const waFallback = document.getElementById("waFallback");
function buildWAFromForm() {
  const name = (document.getElementById("name")?.value || "").trim();
  const phone = (document.getElementById("phone")?.value || "").trim();
  const req = (document.getElementById("req")?.value || "").trim();
  const msg = (document.getElementById("msg")?.value || "").trim();

  const text =
`Hello Anjani Real Heights,
Name: ${name}
Phone: ${phone}
Requirement: ${req}
Message: ${msg || "-"}`;

  return `https://wa.me/${PHONE_WA}?text=${encodeURIComponent(text)}`;
}
if (waFallback) {
  waFallback.addEventListener("click", (e) => {
    e.preventDefault();
    window.open(buildWAFromForm(), "_blank", "noopener");
  });
}

/* =========================
EmailJS Setup (RECOMMENDED)
1) https://www.emailjs.com/ -> Create account
2) Add Email Service (Gmail/Zoho/SMTP)
3) Create Email Template
4) Paste your IDs below:
   SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY
========================= */

const EMAILJS_CONFIG = {
  SERVICE_ID: "YOUR_SERVICE_ID",
  TEMPLATE_ID: "YOUR_TEMPLATE_ID",
  PUBLIC_KEY: "YOUR_PUBLIC_KEY"
};

function setStatus(el, text, ok=true) {
  if (!el) return;
  el.textContent = text;
  el.style.color = ok ? "rgba(255,255,255,.92)" : "#ffb4b4";
}

/* Enquiry Form */
const enquiryForm = document.getElementById("enquiryForm");
const formStatus = document.getElementById("formStatus");

if (enquiryForm) {
  enquiryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const requirement = document.getElementById("req").value;
    const message = document.getElementById("msg").value.trim();

    if (!/^\d{10}$/.test(phone)) {
      setStatus(formStatus, "Please enter a valid 10-digit phone number.", false);
      return;
    }

    // If EmailJS not configured, fallback to WhatsApp
    if (
      EMAILJS_CONFIG.SERVICE_ID.startsWith("YOUR_") ||
      EMAILJS_CONFIG.TEMPLATE_ID.startsWith("YOUR_") ||
      EMAILJS_CONFIG.PUBLIC_KEY.startsWith("YOUR_")
    ) {
      setStatus(formStatus, "Email service not configured yet. Opening WhatsApp…", true);
      window.open(buildWAFromForm(), "_blank", "noopener");
      return;
    }

    try {
      emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });

      setStatus(formStatus, "Sending enquiry…", true);

      const payload = {
        to_email: EMAIL_TO,
        name,
        phone,
        requirement,
        message: message || "-",
        source: "Website Lead (anjanirealheights.com)",
        timestamp: new Date().toLocaleString("en-IN")
      };

      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, payload);

      setStatus(formStatus, "✅ Thank you! We received your enquiry. We will contact you shortly.", true);
      enquiryForm.reset();
    } catch (err) {
      setStatus(formStatus, "❌ Failed to send email. Opening WhatsApp as backup…", false);
      window.open(buildWAFromForm(), "_blank", "noopener");
    }
  });
}

/* Map Request Form (EmailJS / WhatsApp fallback) */
const mapRequestForm = document.getElementById("mapRequestForm");
const mapStatus = document.getElementById("mapStatus");

if (mapRequestForm) {
  mapRequestForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mapName = mapRequestForm.querySelector('input[name="map_name"]').value.trim();
    const phone = mapRequestForm.querySelector('input[name="phone"]').value.trim();

    if (!/^\d{10}$/.test(phone)) {
      if (mapStatus) { mapStatus.textContent = "Please enter a valid 10-digit phone number."; }
      return;
    }

    const waText =
`Hello Anjani Real Heights,
Map Request: ${mapName}
Phone: ${phone}`;

    const waLink = `https://wa.me/${PHONE_WA}?text=${encodeURIComponent(waText)}`;

    // EmailJS not configured => WhatsApp fallback
    if (
      EMAILJS_CONFIG.SERVICE_ID.startsWith("YOUR_") ||
      EMAILJS_CONFIG.TEMPLATE_ID.startsWith("YOUR_") ||
      EMAILJS_CONFIG.PUBLIC_KEY.startsWith("YOUR_")
    ) {
      if (mapStatus) { mapStatus.textContent = "Opening WhatsApp to request the map…"; }
      window.open(waLink, "_blank", "noopener");
      mapRequestForm.reset();
      return;
    }

    try {
      emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });

      if (mapStatus) { mapStatus.textContent = "Sending request…"; }

      const payload = {
        to_email: EMAIL_TO,
        name: "Map Request",
        phone,
        requirement: "Map Request",
        message: `Requested map: ${mapName}`,
        source: "Website Map Request (anjanirealheights.com)",
        timestamp: new Date().toLocaleString("en-IN")
      };

      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, payload);

      if (mapStatus) { mapStatus.textContent = "✅ Request received! We’ll share the map soon."; }
      mapRequestForm.reset();
    } catch (err) {
      if (mapStatus) { mapStatus.textContent = "Email failed. Opening WhatsApp…"; }
      window.open(waLink, "_blank", "noopener");
    }
  });
}
