const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;
class PasswordInputError extends Error {}
/** @param {unknown} value */
function validatePassword(value) {
  if (typeof value !== 'string' || value.length < 12 || Buffer.byteLength(value, 'utf8') > 72) {
    throw new PasswordInputError('A senha deve ter no mínimo 12 caracteres e no máximo 72 bytes.');
  }
  if (!value.trim()) throw new PasswordInputError('Informe uma senha válida.');
}
/** @param {unknown} value */
function isPasswordHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}
/** @param {string} password */
async function hashPassword(password) {
  validatePassword(password);
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}
/** @param {unknown} password @param {unknown} hash */
async function verifyPassword(password, hash) {
  if (typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 72 || !isPasswordHash(hash)) return false;
  return bcrypt.compare(password, hash);
}
module.exports = { PasswordInputError, hashPassword, verifyPassword, validatePassword, isPasswordHash };
