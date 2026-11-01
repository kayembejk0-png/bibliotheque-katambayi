const crypto = require("crypto");
const same = (a, b) => {
  const x = Buffer.from(String(a || "")), y = Buffer.from(process.env.ADMIN_PASSWORD || "");
  return y.length > 0 && x.length === y.length && crypto.timingSafeEqual(x, y);
};
const s = (v) => String(v || "").trim().slice(0, 300);
const IMG = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/;
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non permise" });
  const { password, books, check } = req.body || {};
  if (!same(password, process.env.ADMIN_PASSWORD)) return res.status(401).json({ error: "Mot de passe incorrect" });
  if (check) return res.json({ ok: true });
  if (!Array.isArray(books) || books.length > 5000) return res.status(400).json({ error: "Données invalides" });
  const { GITHUB_TOKEN, GITHUB_REPO } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_REPO) return res.status(500).json({ error: "GITHUB_TOKEN ou GITHUB_REPO manquant sur Vercel" });
  const branch = process.env.GITHUB_BRANCH || "main", path = process.env.DATA_PATH || "books.json";
  const api = `https://api.github.com/repos/${GITHUB_REPO}/contents/`;
  const h = { Authorization: `Bearer ${GITHUB_TOKEN}`, "User-Agent": "bibliotheque", Accept: "application/vnd.github+json" };
  const clean = books.map((b, i) => ({ id: s(b.id).replace(/[^\w-]/g, "_") || "x" + i, t: s(b.t), a: s(b.a), l: s(b.l), n: s(b.n), p: typeof b.p === "string" ? b.p.slice(0, 400000) : "" })).filter((b) => b.t);
  try {
    let up = 0;
    for (const b of clean) {
      const m = IMG.exec(b.p);
      if (m) {
        if (++up > 60) return res.status(400).json({ error: "Maximum 60 nouvelles photos par publication" });
        const file = `photos/${b.id}-${Date.now().toString(36)}.jpg`;
        const r = await fetch(api + file, { method: "PUT", headers: h, body: JSON.stringify({ message: "Photo : " + b.t, branch, content: m[1] }) });
        if (!r.ok) return res.status(502).json({ error: "GitHub a refusé une photo (" + r.status + ")" });
        b.p = file;
      } else if (!/^photos\/[\w.-]+\.jpg$/.test(b.p)) b.p = "";
    }
    const cur = await fetch(`${api}${path}?ref=${branch}`, { headers: h });
    const sha = cur.ok ? (await cur.json()).sha : undefined;
    const put = await fetch(api + path, { method: "PUT", headers: h, body: JSON.stringify({ message: "Mise à jour de la bibliothèque", branch, sha, content: Buffer.from(JSON.stringify(clean)).toString("base64") }) });
    if (!put.ok) return res.status(502).json({ error: "GitHub a refusé l’écriture (" + put.status + ")" });
    return res.json({ ok: true, count: clean.length, books: clean });
  } catch (e) { return res.status(502).json({ error: "Erreur réseau vers GitHub" }); }
};
