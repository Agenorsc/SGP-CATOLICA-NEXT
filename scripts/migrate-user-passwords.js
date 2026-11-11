/**
 * Script de Migração de Senhas Seguras (SGP Católica SC)
 * 
 * Converte senhas legadas em texto plano para hashes criptográficos Bcrypt.
 * Substitui a antiga senha padrão fraca 'admin' por senhas fortes e seguras.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const BCRYPT_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

function isBcrypt(hash) {
  return typeof hash === 'string' && BCRYPT_REGEX.test(hash.trim());
}

async function run() {
  console.log('===============================================================');
  console.log('Iniciando migração de senhas dos usuários para Bcrypt...');
  console.log('===============================================================');

  try {
    const usuarios = await prisma.usuario.findMany();
    console.log(`Total de usuários encontrados no banco: ${usuarios.length}`);

    let migrados = 0;
    let jaCriptografados = 0;

    for (const u of usuarios) {
      const senhaAtual = (u.senha || '').trim();

      if (isBcrypt(senhaAtual)) {
        jaCriptografados++;
        continue;
      }

      let novaSenhaTexto;
      if (!senhaAtual || senhaAtual.toLowerCase() === 'admin') {
        // Substituição da senha padrão fraca 'admin' por senhas fortes padronizadas
        novaSenhaTexto = u.role === 'ADMIN' ? 'Admin@Catolica2026!' : 'Prof@Catolica2026!';
        console.log(`- Usuário ${u.email} possuía senha padrão/vazia. Migrando para senha forte inicial.`);
      } else {
        // Senha personalizada existente em texto plano: aplica hash preservando a senha escolhida
        novaSenhaTexto = senhaAtual;
        console.log(`- Usuário ${u.email} possuía senha em texto plano. Criptografando com Bcrypt.`);
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(novaSenhaTexto, salt);

      await prisma.usuario.update({
        where: { id: u.id },
        data: { senha: hash }
      });

      migrados++;
    }

    console.log('---------------------------------------------------------------');
    console.log(`Migração concluída com sucesso!`);
    console.log(`- Usuários com hash atualizado: ${migrados}`);
    console.log(`- Usuários já protegidos com Bcrypt: ${jaCriptografados}`);
    console.log('===============================================================');
  } catch (error) {
    console.error('Erro durante a execução da migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
