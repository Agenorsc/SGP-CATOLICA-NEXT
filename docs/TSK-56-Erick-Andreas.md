# TSK-56 — Sessão segura e proteção de APIs

Implementação: cookie assinado HMAC-SHA256, HttpOnly, SameSite=Lax, Secure em produção, validade de 8h; middleware bloqueia todas as rotas /api exceto /api/auth/login; logout invalida cookie.

## Configuração obrigatória
Definir SESSION_SECRET no ambiente local e na Vercel, com valor aleatório de no mínimo 32 caracteres (recomendado 64+), nunca versionar o segredo. Reiniciar a aplicação após configurar.

## Validação manual
1. Sem cookie, GET /api/turmas deve retornar 401.
2. Login incorreto retorna 401 sem Set-Cookie de sessão.
3. Login válido retorna cookie HttpOnly e Secure em produção.
4. GET /api/auth/me com cookie válido retorna perfil.
5. POST /api/auth/logout com cookie válido remove cookie.
6. Após logout, GET /api/turmas deve retornar 401.
7. Cookie adulterado ou expirado retorna 401.

## Limitações
A autenticação do middleware não substitui autorização por turma/papel (TSK-57). A migração para hash de senhas (TSK-55) deve ser concluída antes de implantar. Tokens são stateless; logout remove cookie no navegador, mas não revoga cópias previamente capturadas. Revisar CSRF para endpoints mutáveis e aplicar verificação de origem.
