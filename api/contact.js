const { Resend } = require("resend");

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "team.souvage@proton.me";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Souvage <contact@souvage.online>";

const OFFER_LABELS = {
  coaching: "1:1 Coaching",
  r3ta: "R3TA",
  halsning: "Personlig videohälsning",
  osaker: "Osäker — vill bli kontaktad",
};

const TIMELINE_LABELS = {
  asap: "Så snart som möjligt",
  "2weeks": "Inom 2 veckor",
  month: "Inom en månad",
  later: "Senare / bara info",
};

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || "*";
  
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    return res.status(204).end();
  }
  
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body || "{}"); } 
    catch { return res.status(400).json({ error: "Ogiltig JSON." }); }
  }
  if (!body || typeof body !== "object") body = {};

  if (body.company) return res.status(200).json({ ok: true });

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const phone = (body.phone || "").trim();
  const instagram = (body.instagram || "").trim();
  const offer = (body.offer || "").trim();
  const goal = (body.goal || "").trim();
  const timeline = (body.timeline || "").trim();

  if (!name || name.length > 120) return res.status(400).json({ error: "Ange ett giltigt namn." });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Ange en giltig e-postadress." });
  if (!offer || !OFFER_LABELS[offer]) return res.status(400).json({ error: "Välj ett erbjudande." });
  if (!goal || goal.length < 10) return res.status(400).json({ error: "Beskriv mål och situation (minst 10 tecken)." });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "RESEND_API_KEY saknas på servern." });

  const subject = `[Souvage] Ny ansökan: ${OFFER_LABELS[offer]} — ${name}`;
  const text = `Ny ansökan\n\nNamn: ${name}\nE-post: ${email}\nTelefon: ${phone || "—"}\nInstagram: ${instagram || "—"}\nErbjudande: ${OFFER_LABELS[offer]}\nStart: ${TIMELINE_LABELS[timeline] || "—"}\n\nMål:\n${goal}`;

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5">
      <h2>Ny ansökan från souvage.online</h2>
      <p><strong>Namn:</strong> ${escapeHtml(name)}<br/>
      <strong>E-post:</strong> ${escapeHtml(email)}<br/>
      <strong>Telefon:</strong> ${escapeHtml(phone || "—")}<br/>
      <strong>Instagram:</strong> ${escapeHtml(instagram || "—")}<br/>
      <strong>Erbjudande:</strong> ${escapeHtml(OFFER_LABELS[offer])}<br/>
      <strong>Start:</strong> ${escapeHtml(TIMELINE_LABELS[timeline] || "—")}</p>
      <h3>Mål och situation</h3>
      <p style="white-space:pre-wrap">${escapeHtml(goal)}</p>
    </div>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email,
      subject, text, html,
    });
    if (error) {
      console.error("Resend error", error);
      return res.status(502).json({ error: "Kunde inte skicka mejlet just nu." });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Serverfel. Försök igen." });
  }
};
