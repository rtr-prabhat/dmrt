const db = require('../../config/db');
const crypto = require('crypto');

async function findUserByEmail(email) {
  const [rows] = await db.execute(
    `SELECT id, email, password_hash, full_name, is_active
     FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
}

async function createRefreshToken({ userId, rawToken, expiresAt, userAgent, ipAddress }) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await db.execute(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, tokenHash, expiresAt, userAgent ?? null, ipAddress ?? null]
  );
  return tokenHash;
}

async function findRefreshToken(rawToken) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const [rows] = await db.execute(
    `SELECT id, user_id, expires_at, revoked_at
     FROM refresh_tokens
     WHERE token_hash = ? LIMIT 1`,
    [tokenHash]
  );
  return rows[0] ?? null;
}

async function revokeRefreshToken(rawToken) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await db.execute(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?`,
    [tokenHash]
  );
}

async function revokeAllUserTokens(userId) {
  await db.execute(
    `UPDATE refresh_tokens SET revoked_at = NOW()
     WHERE user_id = ? AND revoked_at IS NULL`,
    [userId]
  );
}

module.exports = {
  findUserByEmail,
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
