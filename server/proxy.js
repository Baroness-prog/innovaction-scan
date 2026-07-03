// proxy.js — petit backend Node (sans dépendance) qui détient la clé API
// Anthropic et parle à api.anthropic.com. Le front n'appelle que /api/claude.
//
// Sans ANTHROPIC_API_KEY : /api/health renvoie { ia:false } et /api/claude
// répond 503 → l'application bascule proprement en mode fallback.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Chargement minimal du .env (pas de dépendance dotenv).
loadEnv(path.resolve(__dirname, "..", ".env"));

const PORT = process.env.PORT || 8787;
const API_KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return end(res, 204);

  if (req.url === "/api/health") {
    return json(res, 200, { ok: true, ia: !!API_KEY, model: API_KEY ? MODEL : null });
  }

  if (req.url === "/api/claude" && req.method === "POST") {
    if (!API_KEY) {
      return json(res, 503, { error: "Aucune clé API configurée (mode fallback)." });
    }
    let body;
    try {
      body = await readJson(req);
    } catch {
      return json(res, 400, { error: "Corps de requête invalide." });
    }
    const { prompt, system, maxTokens } = body || {};
    if (!prompt) return json(res, 400, { error: "Champ 'prompt' manquant." });

    try {
      const upstream = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: Math.min(Number(maxTokens) || 1500, 4096),
          system: system || undefined,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!upstream.ok) {
        const detail = await upstream.text();
        return json(res, 502, { error: "Erreur API Anthropic", detail });
      }
      const data = await upstream.json();
      const text = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return json(res, 200, { text });
    } catch (e) {
      return json(res, 502, { error: "Appel API échoué", detail: String(e) });
    }
  }

  return json(res, 404, { error: "Route inconnue." });
});

server.listen(PORT, () => {
  const mode = API_KEY ? `IA active (${MODEL})` : "mode fallback (pas de clé)";
  console.log(`[proxy] AR FOR PULSE — écoute :${PORT} — ${mode}`);
});

// ─────────────────────────────────────────────────────────────────────────
function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
function json(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}
function end(res, code) {
  res.writeHead(code);
  res.end();
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}
function loadEnv(file) {
  try {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      const key = m[1];
      let val = m[2];
      if (/^".*"$/.test(val) || /^'.*'$/.test(val)) val = val.slice(1, -1);
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    /* silencieux */
  }
}
