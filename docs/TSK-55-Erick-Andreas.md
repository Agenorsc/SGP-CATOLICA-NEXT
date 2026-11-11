# TSK-55 — Erick Andreas — 09/11 a 10/11

Implementação: hash bcrypt (custo 12), migração de credenciais legadas, remoção da senha padrão `admin` e troca de senha mediante confirmação da senha atual.

## Alterações

- Login compara o hash no servidor. Senhas em texto puro deixam de autenticar até a migração.
- Cadastro exige senha inicial de pelo menos 12 caracteres e até 72 bytes UTF-8. Não há senha automática.
- Cadastro/edição e consultas não devolvem senha nem hash ao navegador.
- Editar dados de professor preserva a senha existente. Para trocar a senha, use o botão **Trocar senha**, disponível na entrada e após login. Informe e-mail, senha atual, nova senha e confirmação.
- O endpoint `POST /api/auth/change-password` exige `email`, `senhaAtual`, `novaSenha`. Só atualiza após verificar a senha atual; a atualização condicional impede duas trocas simultâneas com a mesma credencial.
- Removidos os atalhos de demonstração e o fallback local de autenticação/cadastro de professores. Falhas da API não simulam sucesso.

## Aplicar no projeto

1. Copie os arquivos da pasta `arquivos-alterados` sobre uma cópia atualizada do repositório (ou aplique `TSK-55.patch` com `git apply`). O pacote foi preparado a partir do commit indicado em `BASE.txt`.
2. Execute `npm ci`.
3. Configure `DATABASE_URL` e `DIRECT_URL` no ambiente local, usando os valores do seu banco.
4. Faça backup do banco e migre as credenciais antes de liberar a nova versão.
5. Execute `npm test` e `npm run build`. Inicie com `npm run dev` para testar no navegador.

## Migrar banco existente

Execute `npm run passwords:migrate` após configurar `PASSWORD_MIGRATION_JSON` no ambiente. O valor é um objeto JSON que associa cada e-mail que precisa de redefinição a uma senha nova exclusiva, com pelo menos 12 caracteres. Defina esse valor localmente, sem adicionar senhas ao Git.

O script preserva hashes bcrypt existentes, converte as senhas legadas válidas em hashes e exige substituição explícita de `admin`. Senhas antigas muito curtas também precisam ser substituídas. Todas as credenciais são pré-validadas e o lote é gravado em uma transação. A execução repetida não aplica hash sobre hash. As novas senhas devem ser informadas aos respectivos usuários por um canal apropriado.

## Seed

Para banco de demonstração, configure separadamente:

- `SEED_ADMIN_PASSWORD`: administrador (`admin@admin.com`).
- `SEED_AGENOR_PASSWORD`: professor Agenor.
- `SEED_MARCOS_PASSWORD`: professor Marcos.

Execute `npx prisma db seed`. O seed migra as contas demonstrativas legadas para os novos hashes e preserva contas que já possuem hash, sem redefinir suas senhas a cada execução. Ele também popula dados de demonstração; use `npm run passwords:migrate` para migrar somente senhas de um banco existente.

## Escopo e validação

Não foram alteradas sessão, logout, isolamento por professor, QR Code nem ESLint/CI. Esses itens pertencem às outras tarefas da planilha. As rotas preexistentes ainda dependem da proteção de sessão prevista na TSK-56. Esta entrega trata a senha atual como prova de identidade para trocar senha.

A migração e o seed não foram executados em banco real: não foram fornecidas credenciais de banco. Os testes automatizados cobrem hash, limites UTF-8, ausência de autenticação local, migração, senha atual incorreta, alteração válida e concorrência.
