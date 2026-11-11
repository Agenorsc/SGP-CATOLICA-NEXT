const { PrismaClient } = require('@prisma/client');
const { hashPassword, isPasswordHash } = require('../src/lib/password');

// Executado pelo operador, nunca durante login ou importação da aplicação.
async function migratePasswords(prisma, replacements = {}) {
  const users = await prisma.usuario.findMany({ select: { id: true, email: true, senha: true } });
  // Pré-valida todo o lote antes de escrever. Contas com senha padrão exigem redefinição explícita.
  const updates = [];
  for (const user of users) {
    if (isPasswordHash(user.senha)) continue;
    const password = replacements[user.email] || user.senha;
    if (password === 'admin') throw new Error(`Defina uma nova senha exclusiva para ${user.email} em PASSWORD_MIGRATION_JSON.`);
    updates.push({ id: user.id, oldHash: user.senha, hash: await hashPassword(password) });
  }
  await prisma.$transaction(async (tx) => {
    for (const update of updates) {
      const result = await tx.usuario.updateMany({ where: { id: update.id, senha: update.oldHash }, data: { senha: update.hash } });
      if (result.count !== 1) throw new Error('Credencial alterada durante a migração. Execute novamente.');
    }
  });
  return updates.length;
}
if (require.main === module) {
  const prisma = new PrismaClient();
  Promise.resolve().then(() => migratePasswords(prisma, JSON.parse(process.env.PASSWORD_MIGRATION_JSON || '{}')))
    .then(count => console.log(`Credenciais migradas: ${count}`))
    .catch(error => { console.error(error.message); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
module.exports = { migratePasswords };
