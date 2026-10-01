/* =========================
FILE: script.js - Anjani Real Heights
========================= */
const PHONE_WA = "919306766244";

/* EmailJS is loaded only when someone submits the form (keeps page fast) */
function loadEmailJS() {
  if (window.emailjs) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const sc = document.createElement("script");
    sc.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    sc.onload = resolve;
    sc.onerror = reject;
    document.head.appendChild(sc);
  });
}
const EMAIL_TO = "contact@anjanirealheights.com";

// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

/* ==================== MOBILE MENU ==================== */
function setMenuIcon(icon, isOpen) {
  const use = icon.querySelector("use");
  if (use) use.setAttribute("href", isOpen ? "#i-times" : "#i-bars");
}
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
      setMenuIcon(icon, isOpen);
    }
  });

  // Close menu when clicking nav links
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
      mobileMenuToggle.setAttribute("aria-expanded", "false");
      const icon = mobileMenuToggle.querySelector("i");
      if (icon) {
        setMenuIcon(icon, false);
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
        setMenuIcon(icon, false);
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

/* ==================== PHASE 2: SECTION DIVIDERS ==================== */
(function() {
  // Add section dividers between major sections
  const sections = document.querySelectorAll('.hsvp-section, .services-section, .why-section, .news-section, .team-section, .maps-section');

  sections.forEach(section => {
    const divider = document.createElement('div');
    divider.className = 'section-divider fade-in-element';
    section.insertBefore(divider, section.firstChild);
  });

  // Observe dividers for animation
  const dividers = document.querySelectorAll('.section-divider');
  const dividerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          dividerObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  dividers.forEach(d => dividerObserver.observe(d));
})();

/* ==================== OFFICE PHOTO SLIDER ==================== */
(function () {
  const slider = document.getElementById("officeSlider");
  if (!slider) return;
  const slides = slider.querySelectorAll(".office-slide");
  const dots = slider.querySelectorAll(".office-dot");
  if (slides.length < 2) return;
  let i = 0, timer = null;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(n) {
    slides[i].classList.remove("is-active"); dots[i] && dots[i].classList.remove("is-active");
    i = (n + slides.length) % slides.length;
    slides[i].classList.add("is-active"); dots[i] && dots[i].classList.add("is-active");
  }
  function start() { if (!reduce && !timer) timer = setInterval(() => show(i + 1), 4500); }
  function stop() { clearInterval(timer); timer = null; }

  dots.forEach((d, n) => d.addEventListener("click", () => { stop(); show(n); start(); }));
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  // start after the page has finished loading so the first photo shows fast
  if (document.readyState === "complete") start(); else window.addEventListener("load", start);
})();

/* ==================== ENQUIRY FORM (Buy / Sell) ====================
   1) Sends to our Cloudflare function  /api/enquiry  (saves lead + emails us)
   2) If that is not available, falls back to EmailJS
   3) If that also fails, opens WhatsApp with the details filled in        */
const EMAILJS_CONFIG = {
  SERVICE_ID: "service_3bwp5a8",
  TEMPLATE_ID: "template_794vzd3",
  PUBLIC_KEY: "XhBKoKaRw3FZ02AeW"
};

const enquiryForm = document.getElementById("enquiryForm");
const formStatus = document.getElementById("formStatus");
const formLoadedAt = Date.now();

function setStatus(text, ok) {
  if (!formStatus) return;
  formStatus.textContent = text;
  formStatus.classList.toggle("is-ok", !!ok);
  formStatus.classList.toggle("is-err", !ok);
}

function getLead() {
  const f = enquiryForm;
  const v = (name) => (f.elements[name] ? String(f.elements[name].value || "").trim() : "");
  return {
    type: v("leadType") || "buy",
    name: v("name"),
    phone: v("phone").replace(/\D/g, "").slice(-10),
    email: v("email"),
    propertyType: v("propertyType"),
    area: v("area"),
    size: v("size"),
    budget: v("budget"),
    message: v("message"),
    website: v("website"),
    elapsedMs: Date.now() - formLoadedAt,
    page: location.href
  };
}

function leadText(l) {
  const sell = l.type === "sell";
  return [
    sell ? "SELL enquiry – Anjani Real Heights website" : "BUY enquiry – Anjani Real Heights website",
    "Name: " + l.name,
    "Phone: " + l.phone,
    "Property type: " + (l.propertyType || "-"),
    (sell ? "Location / Plot: " : "Preferred area: ") + (l.area || "-"),
    "Size: " + (l.size || "-"),
    (sell ? "Expected price: " : "Budget: ") + (l.budget || "-"),
    "Email: " + (l.email || "-"),
    "Message: " + (l.message || "-")
  ].join("\n");
}

function waLink(l) {
  return "https://wa.me/" + PHONE_WA + "?text=" + encodeURIComponent(leadText(l));
}

async function sendViaEmailJS(l) {
  await loadEmailJS();
  emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
  await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
    to_email: EMAIL_TO,
    name: l.name,
    phone: l.phone,
    email: l.email || "Not provided",
    requirement: (l.type === "sell" ? "SELL – " : "BUY – ") + (l.propertyType || ""),
    message: leadText(l),
    source: "Website Lead (anjanirealheights.com)",
    timestamp: new Date().toLocaleString("en-IN")
  });
}

if (enquiryForm) {
  // Change labels when switching Buy / Sell
  enquiryForm.querySelectorAll('input[name="leadType"]').forEach((r) =>
    r.addEventListener("change", () => {
      const mode = enquiryForm.elements.leadType.value === "sell" ? "sell" : "buy";
      enquiryForm.querySelectorAll("[data-buy]").forEach((el) => {
        const t = el.getAttribute("data-" + mode);
        if (el.tagName === "INPUT") el.placeholder = t; else el.textContent = t;
      });
    })
  );

  enquiryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const l = getLead();
    const btn = enquiryForm.querySelector('button[type="submit"]');
    enquiryForm.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));

    const bad = [];
    if (l.name.length < 2) bad.push("name");
    if (!/^[6-9]\d{9}$/.test(l.phone)) bad.push("phone");
    if (!l.propertyType) bad.push("ptype");
    if (bad.length) {
      bad.forEach((id) => document.getElementById(id) && document.getElementById(id).classList.add("is-invalid"));
      setStatus("Please fill your name, a valid 10-digit mobile number and the property type.", false);
      return;
    }
    if (l.website) return; // spam bot

    btn.disabled = true;
    btn.classList.add("loading");
    setStatus("Sending your enquiry…", true);

    let sent = false;
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(l)
      });
      sent = res.ok;
    } catch (err) { sent = false; }

    if (!sent) {
      try { await sendViaEmailJS(l); sent = true; } catch (err) { sent = false; }
    }

    btn.disabled = false;
    btn.classList.remove("loading");

    if (sent) {
      setStatus("✅ Thank you, " + l.name.split(" ")[0] + "! We have received your enquiry and will call you soon.", true);
      enquiryForm.reset();
      enquiryForm.elements.leadType[0].dispatchEvent(new Event("change"));
    } else {
      setStatus("Almost done! WhatsApp is opening with your details – just tap Send to complete your enquiry.", true);
      window.open(waLink(l), "_blank", "noopener");
    }
  });
}
