import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;
const BCRYPT_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/**
 * Gera o hash seguro de uma senha em texto claro usando bcrypt.
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  return bcrypt.hash(plainText, salt);
}

/**
 * Versão síncrona para geração de hash (ideal para scripts de seed e inicialização).
 */
export function hashPasswordSync(plainText: string): string {
  const salt = bcrypt.genSaltSync(BCRYPT_ROUNDS);
  return bcrypt.hashSync(plainText, salt);
}

/**
 * Verifica se uma string já é um hash no formato bcrypt.
 */
export function isBcryptHash(value?: string | null): boolean {
  if (!value || typeof value !== 'string') return false;
  return BCRYPT_REGEX.test(value.trim());
}

/**
 * Compara uma senha informada contra a senha armazenada (com suporte a hash bcrypt
 * e fallback seguro para senhas legadas em texto plano para não derrubar produção).
 */
export async function comparePassword(plainText: string, storedPassword?: string | null): Promise<boolean> {
  if (!plainText || !storedPassword) return false;

  const trimmedStored = storedPassword.trim();
  const trimmedPlain = plainText.trim();

  if (isBcryptHash(trimmedStored)) {
    return bcrypt.compare(trimmedPlain, trimmedStored);
  }

  // Fallback de retrocompatibilidade para produção: comparação direta
  return trimmedPlain === trimmedStored;
}

export interface PasswordValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Valida a força e conformidade da senha com as políticas de segurança:
 * - Mínimo de 6 caracteres
 * - Proibição explícita da senha padrão fraca 'admin'
 */
export function validatePasswordStrength(password?: string | null): PasswordValidationResult {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'A senha é obrigatória.' };
  }

  const clean = password.trim();

  if (clean.toLowerCase() === 'admin') {
    return {
      isValid: false,
      message: 'A senha padrão "admin" foi descontinuada por segurança. Escolha uma senha segura.'
    };
  }

  if (clean.length < 6) {
    return {
      isValid: false,
      message: 'A senha deve conter no mínimo 6 caracteres.'
    };
  }

  return { isValid: true };
}
