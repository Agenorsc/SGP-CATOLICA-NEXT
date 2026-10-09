-- Remove contas e e-mails de alunos, preservando os dados acadêmicos.
-- Execute em uma base PostgreSQL existente antes de publicar a versão sem portal discente.

BEGIN;

ALTER TABLE alunos ADD COLUMN IF NOT EXISTS nome VARCHAR(150);

UPDATE alunos AS aluno
SET
    nome = COALESCE(aluno.nome, usuario.nome)
FROM usuarios AS usuario
WHERE aluno.usuario_id = usuario.id;

ALTER TABLE alunos ALTER COLUMN nome SET NOT NULL;
ALTER TABLE alunos DROP CONSTRAINT IF EXISTS alunos_usuario_id_fkey;
ALTER TABLE alunos DROP COLUMN IF EXISTS usuario_id;
DROP INDEX IF EXISTS idx_alunos_email_unique;
ALTER TABLE alunos DROP COLUMN IF EXISTS email;

DELETE FROM usuarios WHERE perfil = 'aluno';

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_perfil_check;
ALTER TABLE usuarios ALTER COLUMN perfil SET DEFAULT 'professor';
ALTER TABLE usuarios
    ADD CONSTRAINT usuarios_perfil_check CHECK (perfil = 'professor');

COMMIT;
