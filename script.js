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

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

/* ==================== SCROLL-TRIGGERED FADE-IN ANIMATIONS ==================== */
const fadeInElements = document.querySelectorAll(
  ".section-header, .location-card, .service-card, .why-card, .news-card, .team-card, .map-download-card, .contact-card, .consultation-feature, .stat-card, .hero__badge, .hero__image-card, .news-subscribe, .areas-showcase, .seo-content"
);

fadeInElements.forEach((el) => {
  el.classList.add("fade-in-element");
});

const fadeInObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeInObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  }
);

fadeInElements.forEach((el) => {
  fadeInObserver.observe(el);
});

/* ==================== STATS COUNTER ANIMATION ==================== */
function animateCounter(element, target, duration = 1000) {
  const startTime = performance.now();
  const startValue = 0;

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out function
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(startValue + (target - startValue) * easeOut);

    // Check if target contains "+" suffix
    const suffix = element.dataset.suffix || "";
    element.textContent = currentValue + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target + suffix;
    }
  }

  requestAnimationFrame(updateCounter);
}

const statCards = document.querySelectorAll(".stat-card h4");
const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent.trim();

        // Extract number and suffix
        const match = text.match(/^(\d+)(.*)$/);
        if (match) {
          const number = parseInt(match[1], 10);
          const suffix = match[2] || "";
          el.dataset.suffix = suffix;
          animateCounter(el, number, 1000);
        }

        statsObserver.unobserve(el);
      }
    });
  },
  {
    threshold: 0.5
  }
);

statCards.forEach((el) => {
  statsObserver.observe(el);
});

/* ==================== FLOATING WHATSAPP TOOLTIP ==================== */
const waFloat = document.querySelector(".waFloat");
if (waFloat) {
  // Create tooltip element
  const tooltip = document.createElement("span");
  tooltip.className = "wa-tooltip";
  tooltip.textContent = "Need help?";
  waFloat.appendChild(tooltip);

  // Mobile: Show tooltip for 3 seconds on page load
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    setTimeout(() => {
      tooltip.classList.add("mobile-show");
      setTimeout(() => {
        tooltip.classList.remove("mobile-show");
      }, 3000);
    }, 1500);
  }
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
