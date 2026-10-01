/**
 * Cloudflare Pages Function  –  POST /api/enquiry
 * Anjani Real Heights website enquiry form (Buy / Sell)
 *
 * What it does:
 *   1. Checks the data (and blocks simple spam bots)
 *   2. Saves the lead in the D1 database   (binding name: DB)
 *   3. Emails the lead to updates@anjanirealheights.com via Brevo
 *      (secret: BREVO_API_KEY, optional vars: LEAD_TO, LEAD_FROM)
 *
 * It works even if only one of DB / BREVO_API_KEY is set up.
 * If neither works it returns an error, and the website falls back to EmailJS / WhatsApp.
 */

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const clean = (v, max = 200) => String(v ?? "").replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, max);

const esc = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  // Spam checks: hidden field filled, or form submitted in under 3 seconds
  if (body.website || Number(body.elapsedMs) < 3000) return json({ ok: true });

  const lead = {
    type: body.type === "sell" ? "sell" : "buy",
    name: clean(body.name, 80),
    phone: clean(body.phone, 15).replace(/\D/g, "").slice(-10),
    email: clean(body.email, 120),
    propertyType: clean(body.propertyType, 60),
    area: clean(body.area, 120),
    size: clean(body.size, 60),
    budget: clean(body.budget, 60),
    message: clean(body.message, 1000),
    page: clean(body.page, 200),
  };

  if (lead.name.length < 2 || !/^[6-9]\d{9}$/.test(lead.phone) || !lead.propertyType) {
    return json({ ok: false, error: "Please check name, phone and property type" }, 400);
  }

  const now = new Date();
  const ist = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const ip = request.headers.get("CF-Connecting-IP") || "";
  let saved = false;
  let emailed = false;

  // 1) Save to D1
  if (env.DB) {
    try {
      await env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL,
          type TEXT, name TEXT, phone TEXT, email TEXT,
          property_type TEXT, area TEXT, size TEXT, budget TEXT,
          message TEXT, page TEXT, ip TEXT,
          status TEXT DEFAULT 'new'
        )`
      ).run();
      await env.DB.prepare(
        `INSERT INTO leads (created_at, type, name, phone, email, property_type, area, size, budget, message, page, ip)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`
      )
        .bind(now.toISOString(), lead.type, lead.name, lead.phone, lead.email, lead.propertyType,
              lead.area, lead.size, lead.budget, lead.message, lead.page, ip)
        .run();
      saved = true;
    } catch (e) {
      console.log("D1 error", e && e.message);
    }
  }

  // 2) Email via Brevo
  if (env.BREVO_API_KEY) {
    const sell = lead.type === "sell";
    const rows = [
      ["Enquiry", sell ? "SELL" : "BUY"],
      ["Name", lead.name],
      ["Phone", lead.phone],
      ["Property type", lead.propertyType],
      [sell ? "Location / Plot" : "Preferred area", lead.area || "-"],
      ["Size", lead.size || "-"],
      [sell ? "Expected price" : "Budget", lead.budget || "-"],
      ["Email", lead.email || "-"],
      ["Message", lead.message || "-"],
      ["Received", ist],
    ];
    const html =
      `<h2 style="font-family:Arial;color:#0066B3">New ${sell ? "SELL" : "BUY"} enquiry from website</h2>` +
      `<table cellpadding="8" style="font-family:Arial;font-size:14px;border-collapse:collapse">` +
      rows.map(([k, v]) => `<tr><td style="border:1px solid #ddd;background:#f5f8fc"><b>${esc(k)}</b></td><td style="border:1px solid #ddd">${esc(v)}</td></tr>`).join("") +
      `</table>` +
      `<p style="font-family:Arial"><a href="tel:+91${lead.phone}">Call ${lead.phone}</a> &nbsp;|&nbsp; ` +
      `<a href="https://wa.me/91${lead.phone}">WhatsApp ${lead.phone}</a></p>`;

    const payload = {
      sender: { name: "ARH Website", email: env.LEAD_FROM || "updates@anjanirealheights.com" },
      to: [{ email: env.LEAD_TO || "updates@anjanirealheights.com", name: "Anjani Real Heights" }],
      subject: `New ${sell ? "SELL" : "BUY"} enquiry: ${lead.name} (${lead.phone}) – ${lead.propertyType}`,
      htmlContent: html,
    };
    if (lead.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      payload.replyTo = { email: lead.email, name: lead.name };
    }
    try {
      const r = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload),
      });
      emailed = r.ok;
      if (!r.ok) console.log("Brevo error", r.status, await r.text());
    } catch (e) {
      console.log("Brevo fetch error", e && e.message);
    }
  }

  if (!saved && !emailed) return json({ ok: false, error: "Not configured" }, 503);
  return json({ ok: true, saved, emailed });
}
