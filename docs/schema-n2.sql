-- ============================================================================
-- SGP - SISTEMA DE GERAÇÃO E CORREÇÃO DE PROVAS (CATÓLICA SC)
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS RELACIONAL (POSTGRESQL / MYSQL COMPATÍVEL)
-- ============================================================================

-- 1. TABELA DE USUÁRIOS E AUTENTICAÇÃO (PROFESSORES)
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL DEFAULT 'professor' CHECK (perfil = 'professor'),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE TURMAS
CREATE TABLE IF NOT EXISTS turmas (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    curso VARCHAR(100) NOT NULL,
    semestre VARCHAR(20) NOT NULL,
    codigo_convite VARCHAR(20) UNIQUE NOT NULL,
    professor_id VARCHAR(36) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 3. TABELA DE ALUNOS (DADOS PESSOAIS E ACADÊMICOS)
CREATE TABLE IF NOT EXISTS alunos (
    id VARCHAR(36) PRIMARY KEY,
    ra VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(150) NOT NULL,
    turma_id VARCHAR(36) NOT NULL,
    turno VARCHAR(30) DEFAULT 'Noturno',
    data_nascimento DATE,
    naturalidade VARCHAR(80),
    estado_natal VARCHAR(2),
    filiacao_mae VARCHAR(150),
    filiacao_pai VARCHAR(150),
    celular VARCHAR(25),
    cep VARCHAR(10),
    logradouro VARCHAR(150),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(80),
    cidade VARCHAR(80),
    estado VARCHAR(2),
    n1 DECIMAL(4, 2) DEFAULT 0.00,
    n2 DECIMAL(4, 2) DEFAULT 0.00,
    n3 DECIMAL(4, 2) DEFAULT 0.00,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE RESTRICT
);

-- 4. TABELA DE QUESTÕES
CREATE TABLE IF NOT EXISTS questoes (
    id VARCHAR(36) PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('objetiva', 'discursiva')),
    enunciado TEXT NOT NULL,
    pontuacao DECIMAL(4, 2) NOT NULL DEFAULT 2.50,
    tags VARCHAR(255),
    professor_id VARCHAR(36) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 5. TABELA DE ALTERNATIVAS (PARA QUESTÕES OBJETIVAS)
CREATE TABLE IF NOT EXISTS alternativas (
    id VARCHAR(36) PRIMARY KEY,
    questao_id VARCHAR(36) NOT NULL,
    letra_original CHAR(1) NOT NULL,
    texto TEXT NOT NULL,
    correta BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (questao_id) REFERENCES questoes(id) ON DELETE CASCADE
);

-- 6. TABELA DE AVALIAÇÕES (CONFIGURAÇÃO GERAL DA PROVA)
CREATE TABLE IF NOT EXISTS avaliacoes (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    turma_id VARCHAR(36) NOT NULL,
    professor_id VARCHAR(36) NOT NULL,
    shuffle_questoes BOOLEAN DEFAULT TRUE,
    shuffle_alternativas BOOLEAN DEFAULT TRUE,
    identificacao_nominal BOOLEAN DEFAULT TRUE,
    nota_maxima DECIMAL(4, 2) DEFAULT 10.00,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 7. TABELA DE VERSÕES DA AVALIAÇÃO (MATERIALIZAÇÃO DO LAYOUT)
CREATE TABLE IF NOT EXISTS versoes_avaliacao (
    id VARCHAR(36) PRIMARY KEY,
    avaliacao_id VARCHAR(36) NOT NULL,
    versao_numero INT NOT NULL,
    versao_letra CHAR(1) NOT NULL,
    aluno_id VARCHAR(36),
    qr_payload VARCHAR(150) NOT NULL,
    FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE SET NULL
);

-- 8. ORDEM MATERIALIZADA DAS QUESTÕES NA VERSÃO
CREATE TABLE IF NOT EXISTS questoes_versao (
    id VARCHAR(36) PRIMARY KEY,
    versao_id VARCHAR(36) NOT NULL,
    questao_id VARCHAR(36) NOT NULL,
    ordem_apresentada INT NOT NULL,
    FOREIGN KEY (versao_id) REFERENCES versoes_avaliacao(id) ON DELETE CASCADE,
    FOREIGN KEY (questao_id) REFERENCES questoes(id) ON DELETE RESTRICT
);

-- 9. ORDEM MATERIALIZADA DAS ALTERNATIVAS NA VERSÃO
CREATE TABLE IF NOT EXISTS alternativas_versao (
    id VARCHAR(36) PRIMARY KEY,
    questao_versao_id VARCHAR(36) NOT NULL,
    alternativa_id VARCHAR(36) NOT NULL,
    letra_apresentada CHAR(1) NOT NULL,
    FOREIGN KEY (questao_versao_id) REFERENCES questoes_versao(id) ON DELETE CASCADE,
    FOREIGN KEY (alternativa_id) REFERENCES alternativas(id) ON DELETE RESTRICT
);

-- 10. TABELA DE LEITURAS E CORREÇÕES OMR
CREATE TABLE IF NOT EXISTS leituras_omr (
    id VARCHAR(36) PRIMARY KEY,
    versao_id VARCHAR(36) NOT NULL,
    aluno_id VARCHAR(36) NOT NULL,
    acertos INT NOT NULL,
    total_questoes INT NOT NULL,
    nota_calculada DECIMAL(4, 2) NOT NULL,
    data_leitura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_correction_id VARCHAR(64) UNIQUE,
    FOREIGN KEY (versao_id) REFERENCES versoes_avaliacao(id) ON DELETE RESTRICT,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- 11. TABELA DE RESPOSTAS DETECTADAS POR QUESTÃO NA LEITURA OMR
CREATE TABLE IF NOT EXISTS respostas_leitura (
    id VARCHAR(36) PRIMARY KEY,
    leitura_id VARCHAR(36) NOT NULL,
    questao_numero INT NOT NULL,
    letra_marcada CHAR(1) NOT NULL,
    acertou BOOLEAN NOT NULL,
    FOREIGN KEY (leitura_id) REFERENCES leituras_omr(id) ON DELETE CASCADE
);

-- ÍNDICES PARA CONSULTAS RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_alunos_turma ON alunos(turma_id);
CREATE INDEX IF NOT EXISTS idx_versoes_avaliacao ON versoes_avaliacao(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_leituras_aluno ON leituras_omr(aluno_id);
CREATE INDEX IF NOT EXISTS idx_respostas_leitura ON respostas_leitura(leitura_id);
