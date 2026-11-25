const crypto = require('crypto');
const { ctx, sign } = require('./_lib');
const KEY_URL = 'https://raw.githubusercontent.com/johnscriptzz/Repo/refs/heads/main/Test';
const MIN_MS = 10 * 1000, MAX_MS = 30 * 60 * 1000;
const bad = (res, error) => res.status(400).json({ ok: false, error });
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  const { slug, hash } = req.body || {};
  if (typeof slug !== 'string' || typeof hash !== 'string') return bad(res, 'Bad request.');
  const i = slug.lastIndexOf('.');
  let p;
  try { p = Buffer.from(slug.slice(0, i), 'base64url').toString(); } catch { return bad(res, 'Invalid link.'); }
  const sig = Buffer.from(slug.slice(i + 1)), exp = Buffer.from(sign(p));
  if (sig.length !== exp.length || !crypto.timingSafeEqual(sig, exp)) return bad(res, 'Invalid link.');
  const [ts, , c] = p.split('.');
  const age = Date.now() - Number(ts);
  if (age < MIN_MS) return bad(res, 'Task completed too fast. Start again.');
  if (age > MAX_MS) return bad(res, 'Link expired. Start again.');
  if (c !== ctx(req)) return bad(res, 'Open the link on the same device and network you started on.');
  try {
    const v = await (await fetch(`https://publisher.linkvertise.com/api/v1/anti_bypassing?token=${encodeURIComponent(process.env.LV_TOKEN)}&hash=${encodeURIComponent(hash)}`)).text();
    if (!/true/i.test(v) || /false/i.test(v)) return bad(res, 'Task not completed.');
    const key = (await (await fetch(KEY_URL, { cache: 'no-store' })).text()).trim();
    res.json({ ok: true, key });
  } catch { res.status(500).json({ ok: false, error: 'Server error. Try again.' }); }
};
