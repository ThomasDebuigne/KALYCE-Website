// Vercel Serverless Function — Discord webhook proxy
// The real webhook URL is stored in DISCORD_WEBHOOK_URL env var on Vercel.

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 3; // max 3 submissions per IP per window

// In-memory rate limit store (resets on cold start, good enough for serverless)
const rateLimitStore = new Map();

function getRateLimitKey(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    "unknown"
  );
}

function isRateLimited(key) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { windowStart: now, count: 1 });
    return false;
  }

  entry.count += 1;

  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

function escapeDiscordText(value) {
  return String(value || "")
    .replace(/@everyone/gi, "@\u200Beveryone")
    .replace(/@here/gi, "@\u200Bhere")
    .replace(/<@[!&]?\d+>/g, "[mention bloquée]")
    .trim();
}

function limitText(value, maxLength = 1024) {
  const text = escapeDiscordText(value);
  if (!text) return "Non renseigné";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async function handler(req, res) {
  // ── CORS preflight ──
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ── Method check ──
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  // ── Webhook URL from environment ──
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL is not configured.");
    return res
      .status(500)
      .json({ error: "Configuration serveur manquante." });
  }

  // ── Rate limiting ──
  const clientKey = getRateLimitKey(req);

  if (isRateLimited(clientKey)) {
    return res
      .status(429)
      .json({ error: "Trop de soumissions. Réessayez dans quelques minutes." });
  }

  // ── Parse body ──
  const body = req.body;

  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Corps de requête invalide." });
  }

  // ── Honeypot check (bot trap) ──
  if (body.website) {
    // A real user won't fill the hidden "website" field
    return res.status(200).json({ ok: true }); // silent success for bots
  }

  // ── Input validation ──
  const { firstName, lastName, age, email, availability, questions, generatedId, origin } = body;

  if (!firstName || !lastName || !email || !generatedId) {
    return res.status(400).json({ error: "Champs obligatoires manquants." });
  }

  if (typeof firstName !== "string" || firstName.length > 100) {
    return res.status(400).json({ error: "Prénom invalide." });
  }

  if (typeof lastName !== "string" || lastName.length > 100) {
    return res.status(400).json({ error: "Nom invalide." });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Email invalide." });
  }

  const parsedAge = parseInt(age, 10);
  if (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 120) {
    return res.status(400).json({ error: "Âge invalide." });
  }

  // ── Build Discord embed ──
  const checkedList = Array.isArray(questions)
    ? questions.map((q) => `- ${escapeDiscordText(q)}`).join("\n")
    : "Aucun";

  const payload = {
    username: "KALYCE Recrutement",
    content: `Nouvelle candidature reçue : ${escapeDiscordText(generatedId)}`,
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: "Nouvelle candidature KALYCE",
        color: 0xff2020,
        timestamp: new Date().toISOString(),
        fields: [
          { name: "Identifiant", value: limitText(generatedId, 256), inline: true },
          { name: "Nom", value: limitText(lastName, 256), inline: true },
          { name: "Prénom", value: limitText(firstName, 256), inline: true },
          { name: "Âge", value: limitText(String(parsedAge), 256), inline: true },
          { name: "Email", value: limitText(email, 256), inline: true },
          { name: "Disponibilité nocturne", value: limitText(availability, 256), inline: true },
          { name: "Tests validés", value: limitText(checkedList), inline: false },
          { name: "Origine", value: limitText(origin || "Inconnue"), inline: false },
          { name: "IP", value: clientKey, inline: true },
        ],
      },
    ],
  };

  // ── Send to Discord ──
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(`Discord webhook error: ${response.status} — ${text}`);
      return res
        .status(502)
        .json({ error: "Le canal de recrutement n'a pas répondu." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook fetch error:", err);
    return res
      .status(502)
      .json({ error: "Erreur de transmission vers le canal." });
  }
};
