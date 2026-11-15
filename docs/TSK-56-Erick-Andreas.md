# TSK-56 — Sessão segura e proteção das APIs

O login continua aceitando os hashes bcrypt da TSK-55 e migrando senhas legadas para bcrypt. Depois de validar as credenciais, o servidor emite um cookie assinado com HMAC-SHA256, com validade de 8 horas, HttpOnly, SameSite=Lax e Secure em produção.

O proxy do Next.js 16 exige uma sessão válida para as rotas sob `/api`, com exceção de `/api/auth/login`. A interface consulta `/api/auth/me` ao carregar a página e só monta o painel após restaurar a sessão ou concluir o login. O logout expira o cookie no navegador.

## Configuração e conferência

1. Defina `SESSION_SECRET` com pelo menos 32 bytes aleatórios no ambiente local e no ambiente de preview da Vercel. Use um segredo distinto em produção.
2. Sem login, acesse `/api/turmas` e confirme HTTP 401.
3. Tente entrar com senha incorreta e confirme HTTP 401 sem emissão de cookie.
4. Entre com credenciais válidas, confira os atributos do cookie e recarregue a página. O painel e a disciplina do professor devem continuar disponíveis.
5. Saia pelo menu. A resposta do logout deve expirar o cookie e uma nova consulta a `/api/turmas` deve retornar HTTP 401.
6. Para o benchmark HTTP da TSK-61, configure `API_SESSION_COOKIE` com um par `sgp_session=…` de uma sessão de teste válida para o ambiente avaliado.

O logout elimina a sessão deste navegador. O token é assinado e tem prazo fixo. A revogação antecipada de cópias do token exigiria armazenamento no servidor. A autorização por turma e papel pertence à TSK-57.
