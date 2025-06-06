const crypto = require('crypto');

function checkTelegramAuth(data) {
  const { hash, ...rest } = data;
  const secret = crypto.createHash('sha256').update(process.env.BOT_TOKEN).digest();
  const checkString = Object.keys(rest).sort().map(key => \`\${key}=\${rest[key]}\`).join('\n');
  const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');

  return hmac === hash;
}

module.exports = checkTelegramAuth;