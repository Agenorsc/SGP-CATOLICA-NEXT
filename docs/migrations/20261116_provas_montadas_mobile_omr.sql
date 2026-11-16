-- ====================================================================================
-- MIGRAÇÃO POSTGRESQL / SUPABASE: PROVAS MONTADAS, CADERNOS EMBARALHADOS E RESULTADOS
-- Data: 16/11/2026
-- Objetivo: Garantir snapshots imutáveis, integridade referencial e auditoria multi-tenant
-- ====================================================================================

-- 1. Assegurar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Atualizar tabela de Provas Montadas (se colunas ainda não existirem)
ALTER TABLE IF EXISTS "provas_montadas" 
    ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) NOT NULL DEFAULT 'PRONTA_PARA_APLICAR';

CREATE INDEX IF NOT EXISTS "provas_montadas_professor_idx" 
    ON "provas_montadas"("professorId");

CREATE INDEX IF NOT EXISTS "provas_montadas_turma_idx" 
    ON "provas_montadas"("turmaId");

-- 3. Criar tabela de Cadernos de Prova (Snapshots de Versões Embaralhadas e Gabaritos)
CREATE TABLE IF NOT EXISTS "cadernos_prova" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "prova_montada_id" UUID NOT NULL,
    "codigo_versao" VARCHAR(50) NOT NULL, -- Ex: 'CADERNO-A', 'CADERNO-B' ou RA/Nome
    "aluno_nome" VARCHAR(255),
    "aluno_ra" VARCHAR(50),
    "mapa_questoes_json" JSONB NOT NULL,
    "gabarito_oficial_json" JSONB NOT NULL, -- { "1": "C", "2": "A", ... }
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fk_caderno_prova_montada"
        FOREIGN KEY ("prova_montada_id")
        REFERENCES "provas_montadas"("id")
        ON DELETE CASCADE
);

-- Índices para alta velocidade na decodificação do QR Code no OMR Mobile
CREATE INDEX IF NOT EXISTS "cadernos_prova_prova_montada_idx" 
    ON "cadernos_prova"("prova_montada_id");

CREATE INDEX IF NOT EXISTS "cadernos_prova_codigo_versao_idx" 
    ON "cadernos_prova"("codigo_versao");

CREATE INDEX IF NOT EXISTS "cadernos_prova_aluno_ra_idx" 
    ON "cadernos_prova"("aluno_ra");

-- 4. Criar tabela de Resultados de Avaliação (Lançamentos OMR com Histórico Auditável)
CREATE TABLE IF NOT EXISTS "resultados_avaliacao" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "professor_id" UUID NOT NULL,
    "prova_montada_id" UUID NOT NULL,
    "caderno_prova_id" UUID,
    "aluno_nome" VARCHAR(255) NOT NULL,
    "aluno_ra" VARCHAR(50),
    "respostas_marcadas_json" JSONB NOT NULL, -- { "1": "C", "2": "B", ... }
    "acertos" INTEGER NOT NULL,
    "total_questoes" INTEGER NOT NULL,
    "nota_final" NUMERIC(5,2) NOT NULL,
    "lido_via_mobile" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fk_resultado_professor"
        FOREIGN KEY ("professor_id")
        REFERENCES "usuarios"("id")
        ON DELETE CASCADE,

    CONSTRAINT "fk_resultado_prova_montada"
        FOREIGN KEY ("prova_montada_id")
        REFERENCES "provas_montadas"("id")
        ON DELETE CASCADE,

    CONSTRAINT "fk_resultado_caderno_prova"
        FOREIGN KEY ("caderno_prova_id")
        REFERENCES "cadernos_prova"("id")
        ON DELETE SET NULL
);

-- Índices B-Tree para consulta e recálculo instantâneo de estatísticas e notas
CREATE INDEX IF NOT EXISTS "resultados_avaliacao_professor_idx" 
    ON "resultados_avaliacao"("professor_id");

CREATE INDEX IF NOT EXISTS "resultados_avaliacao_prova_montada_idx" 
    ON "resultados_avaliacao"("prova_montada_id");

CREATE INDEX IF NOT EXISTS "resultados_avaliacao_caderno_prova_idx" 
    ON "resultados_avaliacao"("caderno_prova_id");

CREATE INDEX IF NOT EXISTS "resultados_avaliacao_aluno_ra_idx" 
    ON "resultados_avaliacao"("aluno_ra");

CREATE INDEX IF NOT EXISTS "resultados_avaliacao_created_at_idx" 
    ON "resultados_avaliacao"("created_at" DESC);

-- 5. Row Level Security (RLS) para Isolamento Multi-Tenant no Supabase
ALTER TABLE "cadernos_prova" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "resultados_avaliacao" ENABLE ROW LEVEL SECURITY;

-- Política de RLS: Apenas o professor dono da prova ou ADMIN pode consultar cadernos
CREATE POLICY "cadernos_prova_professor_policy" ON "cadernos_prova"
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM "provas_montadas" p
            WHERE p."id" = "cadernos_prova"."prova_montada_id"
              AND (p."professorId" = auth.uid()::text OR p."professorId" IS NULL)
        )
    );

-- Política de RLS: Professor só visualiza, insere e exclui seus próprios resultados
CREATE POLICY "resultados_avaliacao_professor_policy" ON "resultados_avaliacao"
    FOR ALL
    USING ("professor_id" = auth.uid()::uuid);
