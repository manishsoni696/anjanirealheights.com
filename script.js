/* =========================
FILE: script.js
========================= */
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

/* WhatsApp fallback builder */
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

/* EmailJS config - Updated with New Key & Service */
const EMAILJS_CONFIG = {
  SERVICE_ID: "service_3bwp5a8",
  TEMPLATE_ID: "template_794vzd3",
  PUBLIC_KEY: "XhBKoKaRw3FZ02AeW"
};

function setStatus(el, text, ok=true) {
  if (!el) return;
  el.textContent = text;
  el.style.color = ok ? "rgba(255,255,255,.92)" : "#ffb4b4";
}
function emailJsNotConfigured() {
  return (
    !EMAILJS_CONFIG.SERVICE_ID || EMAILJS_CONFIG.SERVICE_ID.includes("PASTE_") ||
    !EMAILJS_CONFIG.TEMPLATE_ID || EMAILJS_CONFIG.TEMPLATE_ID.includes("PASTE_") ||
    !EMAILJS_CONFIG.PUBLIC_KEY || EMAILJS_CONFIG.PUBLIC_KEY.includes("PASTE_")
  );
}

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

    if (emailJsNotConfigured()) {
      setStatus(formStatus, "Email not configured yet. Opening WhatsApp…", true);
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

      setStatus(formStatus, "✅ Thank you! We received your enquiry.", true);
      enquiryForm.reset();
    } catch (err) {
      setStatus(formStatus, "❌ Email failed. Opening WhatsApp…", false);
      window.open(buildWAFromForm(), "_blank", "noopener");
    }
  });
}






