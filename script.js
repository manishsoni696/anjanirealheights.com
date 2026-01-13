/* =========================
FILE: script.js - Anjani Real Heights
========================= */
const PHONE_WA = "919050040129";
const EMAIL_TO = "contact@anjanirealheights.com";

// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

/* ==================== MOBILE MENU ==================== */
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const nav = document.querySelector(".nav");

if (mobileMenuToggle && nav) {
  mobileMenuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    const isOpen = nav.classList.contains("active");
    mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));

    // Change icon
    const icon = mobileMenuToggle.querySelector("i");
    if (icon) {
      icon.className = isOpen ? "fas fa-times" : "fas fa-bars";
    }
  });

  // Close menu when clicking nav links
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
      mobileMenuToggle.setAttribute("aria-expanded", "false");
      const icon = mobileMenuToggle.querySelector("i");
      if (icon) {
        icon.className = "fas fa-bars";
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
      nav.classList.remove("active");
      mobileMenuToggle.setAttribute("aria-expanded", "false");
      const icon = mobileMenuToggle.querySelector("i");
      if (icon) {
        icon.className = "fas fa-bars";
      }
    }
  });
}

/* ==================== HEADER SCROLL EFFECT ==================== */
const header = document.querySelector(".header");
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 100) {
    header.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
  } else {
    header.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
  }

  lastScroll = currentScroll;
});

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
    const email = document.getElementById("email") ? document.getElementById("email").value.trim() : "";
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
        email: email || "Not provided",
        requirement,
        message: message || "-",
        source: "Website Lead (anjanirealheights.com)",
        timestamp: new Date().toLocaleString("en-IN")
      };

      // 1. Lead Notification (Aapke liye)
      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, payload);

      // 2. Auto Reply (Customer ke liye) - Template ID: template_tlucta5
      if (email && email !== "") {
        const replyPayload = {
          name: name,
          requirement: requirement,
          phone: phone,
          email: email
        };
        await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, "template_tlucta5", replyPayload);
      }

      setStatus(formStatus, "✅ Shukriya! Aapki enquiry humein mil gayi hai. Anjani Real Heights ki team jald hi aapse sampark karegi.", true);
      enquiryForm.reset();

    } catch (err) {
      console.error("EmailJS Error:", err);
      setStatus(formStatus, "❌ Email failed. Opening WhatsApp…", false);
      window.open(buildWAFromForm(), "_blank", "noopener");
    }
  });
}
