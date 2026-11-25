const { ctx, sign, rand, hasSecret } = require('./_lib');
const SITE = 'https://getkey-phi.vercel.app';
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  if (!hasSecret) return res.status(500).json({ error: 'Missing environment variable: add LV_TOKEN (or SESSION_SECRET) in Vercel settings, then redeploy.' });
  try {
  const p = `${Date.now()}.${rand(24)}.${ctx(req)}`;
  const slug = Buffer.from(p).toString('base64url') + '.' + sign(p);
  const dest = `${SITE}/c/${slug}`;
  const url = `https://link-to.net/8287561/${Math.floor(Math.random() * 1000)}/dynamic?r=${encodeURIComponent(Buffer.from(dest).toString('base64'))}`;
  res.json({ url });
  } catch (e) { res.status(500).json({ error: 'Server error: ' + e.message }); }
};
