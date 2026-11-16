-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PROFESSOR',
    "disciplina" TEXT,
    "campus" TEXT DEFAULT 'Jaraguá do Sul',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turmas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "curso" TEXT NOT NULL DEFAULT 'Engenharia de Software',
    "semestre" TEXT NOT NULL DEFAULT '2026/2',
    "codigoConvite" TEXT NOT NULL,
    "professorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alunos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ra" TEXT NOT NULL,
    "curso" TEXT NOT NULL DEFAULT 'Engenharia de Software',
    "turno" TEXT NOT NULL DEFAULT 'Noturno',
    "n1" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "n2" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "n3" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "contato" JSONB,
    "endereco" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "turmaId" TEXT NOT NULL,

    CONSTRAINT "alunos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questoes" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'objetiva',
    "enunciado" TEXT NOT NULL,
    "pontuacao" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "tags" TEXT[],
    "turmaId" TEXT,
    "professorId" TEXT,
    "avaliacao" TEXT DEFAULT 'N2',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alternativas" (
    "id" TEXT NOT NULL,
    "letraOriginal" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,
    "questaoId" TEXT NOT NULL,

    CONSTRAINT "alternativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provas_montadas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "disciplina" TEXT,
    "semestre" TEXT DEFAULT '2026/2',
    "ciclo" TEXT NOT NULL DEFAULT 'N2',
    "turmaId" TEXT NOT NULL,
    "professorId" TEXT,
    "questoesSnapshot" JSONB NOT NULL,
    "totalQuestoes" INTEGER NOT NULL DEFAULT 0,
    "pontuacaoTotal" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "shuffleQuestoes" BOOLEAN NOT NULL DEFAULT true,
    "shuffleAlternativas" BOOLEAN NOT NULL DEFAULT true,
    "nominalQrCode" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provas_montadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leituras_omr" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "alunoNome" TEXT NOT NULL,
    "ra" TEXT NOT NULL,
    "turmaId" TEXT,
    "professorId" TEXT,
    "provaMontadaId" TEXT,
    "turmaNome" TEXT NOT NULL,
    "materia" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "acertos" INTEGER NOT NULL,
    "totalQuestoes" INTEGER NOT NULL,
    "notaCalculada" DOUBLE PRECISION NOT NULL,
    "dataLeitura" TEXT NOT NULL,
    "respostasDetectadas" JSONB NOT NULL,
    "gabaritoOficial" JSONB,
    "detalhesQuestoes" JSONB,
    "fiduciaisDetectados" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leituras_omr_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "turmas_codigoConvite_key" ON "turmas"("codigoConvite");

-- CreateIndex
CREATE INDEX "turmas_professorId_idx" ON "turmas"("professorId");

-- CreateIndex
CREATE INDEX "turmas_semestre_idx" ON "turmas"("semestre");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_ra_key" ON "alunos"("ra");

-- CreateIndex
CREATE INDEX "alunos_turmaId_idx" ON "alunos"("turmaId");

-- CreateIndex
CREATE INDEX "questoes_turmaId_idx" ON "questoes"("turmaId");

-- CreateIndex
CREATE INDEX "questoes_professorId_idx" ON "questoes"("professorId");

-- CreateIndex
CREATE INDEX "questoes_avaliacao_idx" ON "questoes"("avaliacao");

-- CreateIndex
CREATE INDEX "alternativas_questaoId_idx" ON "alternativas"("questaoId");

-- CreateIndex
CREATE INDEX "provas_montadas_turmaId_idx" ON "provas_montadas"("turmaId");

-- CreateIndex
CREATE INDEX "provas_montadas_professorId_idx" ON "provas_montadas"("professorId");

-- CreateIndex
CREATE INDEX "provas_montadas_ciclo_idx" ON "provas_montadas"("ciclo");

-- CreateIndex
CREATE INDEX "leituras_omr_alunoId_idx" ON "leituras_omr"("alunoId");

-- CreateIndex
CREATE INDEX "leituras_omr_turmaId_idx" ON "leituras_omr"("turmaId");

-- CreateIndex
CREATE INDEX "leituras_omr_professorId_idx" ON "leituras_omr"("professorId");

-- CreateIndex
CREATE INDEX "leituras_omr_provaMontadaId_idx" ON "leituras_omr"("provaMontadaId");

-- CreateIndex
CREATE INDEX "leituras_omr_createdAt_idx" ON "leituras_omr"("createdAt");

-- AddForeignKey
ALTER TABLE "turmas" ADD CONSTRAINT "turmas_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questoes" ADD CONSTRAINT "questoes_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questoes" ADD CONSTRAINT "questoes_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternativas" ADD CONSTRAINT "alternativas_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "questoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provas_montadas" ADD CONSTRAINT "provas_montadas_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provas_montadas" ADD CONSTRAINT "provas_montadas_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leituras_omr" ADD CONSTRAINT "leituras_omr_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leituras_omr" ADD CONSTRAINT "leituras_omr_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leituras_omr" ADD CONSTRAINT "leituras_omr_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leituras_omr" ADD CONSTRAINT "leituras_omr_provaMontadaId_fkey" FOREIGN KEY ("provaMontadaId") REFERENCES "provas_montadas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
