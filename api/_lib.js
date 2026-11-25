const crypto = require('crypto');
const SECRET = process.env.SESSION_SECRET || '';
exports.ctx = req => crypto.createHash('sha256')
  .update(((req.headers['x-forwarded-for'] || '').split(',')[0].trim()) + (req.headers['user-agent'] || ''))
  .digest('hex').slice(0, 16);
exports.sign = d => crypto.createHmac('sha256', SECRET).update(d).digest('base64url');
exports.rand = n => crypto.randomBytes(n).toString('base64url');
