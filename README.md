<div align="center">

# 📝 SGP - Sistema de Geração e Correção de Provas

**Plataforma web componentizada para criação flexível de avaliações, embaralhamento dinâmico de versões, impressão de caderno frente e verso com folha de respostas OMR destacável e correção automatizada via leitura de QR Code.**

🌐 **Link do sistema hospedado:** https://sgp-catolica-next.vercel.app/

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_22_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-F5A623?style=flat-square)
![Entrega](https://img.shields.io/badge/entrega%20atual-N2-3D348B?style=flat-square)
![Arquitetura](https://img.shields.io/badge/arquitetura-5%20camadas-007ACC?style=flat-square)
![Licença](https://img.shields.io/badge/licença-uso%20acadêmico-7B4FA6?style=flat-square)

</div>

---

## 👥 Equipe

| Nome completo | Papel / Principais frentes no projeto |
|---|---|
| **Agenor Alvise** | Front-end das telas de aplicação, diagramação para impressão frente/verso, gabaritos OMR, testes unitários com Jest, pipeline de CI/CD e arquitetura em camadas |
| **Johnatan Vargas da Fonseca** | Front-end do módulo de turmas, banco de questões e manipulação de mocks de dados |
| **Eric Ricardo Lange** | Modelagem das entidades de dados, regras de validação de formulários e mapeamento de componentes |
| **Erick Andreas Pontecelli** | Estruturação dos algoritmos de embaralhamento determinístico e matrizes de resposta OMR |
| **Edinei Junio Machado** | Levantamento de requisitos com o cliente Samuel, arquitetura em camadas, documentação e gestão do Git |

---

## 📑 Sumário

- [1. Visão Geral e Objetivo](#1-visão-geral-e-objetivo)
- [2. Escopo do Projeto](#2-escopo-do-projeto)
- [3. Requisitos do Sistema](#3-requisitos-do-sistema)
  - [3.1 Requisitos Funcionais (RF)](#31-requisitos-funcionais-rf)
  - [3.2 Requisitos Não Funcionais (RNF)](#32-requisitos-não-funcionais-rnf)
- [4. Telas do Sistema](#4-telas-do-sistema)
- [5. Stack Tecnológica](#5-stack-tecnológica)
- [6. Arquitetura em Camadas e Estrutura de Pastas](#6-arquitetura-em-camadas-e-estrutura-de-pastas)
- [7. Como Executar o Projeto](#7-como-executar-o-projeto)
- [8. Testes e CI/CD](#8-testes-e-cicd)
- [9. Equipe e Contribuições](#9-equipe-e-contribuições)

---

## 1. Visão Geral e Objetivo

### Contexto e Cliente
O **SGP (Sistema de Geração e Correção de Provas)** foi concebido para atender às demandas do docente **Samuel** e do corpo acadêmico do Centro Universitário Católica SC, eliminando a sobrecarga de trabalho manual na aplicação e correção de grandes volumes de avaliações (200 a 400 provas por ciclo).

### Objetivo
Automatizar integralmente o fluxo avaliativo institucional:
1. **Montagem Flexível:** Composição de provas com banco de até 20 questões e pontuações personalizadas.
2. **Diagramação e Impressão Inteligente:** Geração de cadernos de questões em formato **frente e verso** acompanhados de folha de respostas/gabarito OMR destacável com inserção de página em branco no verso (em caso de página ímpar), permitindo que o aluno entregue apenas o gabarito e leve o caderno para casa.
3. **Embaralhamento Determinístico:** Alternância independente da ordem de questões e alternativas por versão gerada.
4. **Correção e Diagnóstico Pedagógico:** Leitura automatizada via QR Code e processamento no backend de estatísticas de erros/acertos, diagnóstico de distratores e acompanhamento contínuo de notas (N1, N2 e N3).

---

## 2. Escopo do Projeto

### O que está no escopo:
* **Banco de Questões e Provas:** Cadastro e manutenção de questões objetivas (2 a 5 alternativas) e discursivas.
* **Gestão de Turmas e Matrículas:** Administração de turmas ativas com auto-matrícula por código de convite (`inviteCode`).
* **Motor de Impressão e Paginação:**
  * Diagramação do caderno de questões frente e verso para o aluno levar para casa.
  * Folha de respostas/gabarito OMR gerada separadamente do caderno.
  * Inserção automática de página em branco no verso do gabarito caso o número de páginas seja ímpar.
* **Embaralhamento e QR Code:** Embaralhamento independente de questões e alternativas por versão com persistência da matriz de layout e QR Code nominal ou anônimo.
* **Módulo Estatístico e Relatórios:**
  * Métricas de acertos e erros gerais calculadas no backend por questão.
  * Diagnóstico pedagógico das alternativas incorretas mais marcadas (análise de distratores).
  * Histórico contínuo de notas por aluno discriminado por avaliação e etapas (N1, N2 e N3).
  * Exportação de notas e dados em arquivo `.csv`.

---

## 3. Requisitos do Sistema

### 3.1 Requisitos Funcionais (RF)

| Código | Requisito |
|---|---|
| **RF01** | O sistema deve autenticar usuários separando domínios institucionais: docentes (`@catolicasc.org.br`) e estudantes (`@catolicasc.edu.br`). |
| **RF02** | O sistema deve permitir o gerenciamento de questões objetivas (2 a 5 alternativas) e discursivas com pontuações personalizadas. |
| **RF03** | O sistema deve permitir a criação de turmas com código de convite (`inviteCode`) auto-regenerável para auto-matrícula. |
| **RF04** | O sistema deve permitir a composição de provas com até 20 questões. |
| **RF05** | O sistema deve aplicar embaralhamento determinístico e independente para questões e alternativas por versão gerada. |
| **RF06** | O sistema deve materializar e persistir no banco de dados a matriz de layout de cada versão (`ExamVersion.layout`). |
| **RF07** | O sistema deve gerar a folha de respostas/gabarito OMR separada do caderno descritivo de questões. |
| **RF08** | O sistema deve diagramar o caderno de questões em formato frente e verso para que o estudante possa levá-lo após a prova. |
| **RF09** | O motor de impressão deve inserir automaticamente uma página em branco após o gabarito se este ocupar página ímpar. |
| **RF10** | A folha de respostas deve conter marcadores de calibração nos cantos e QR Code identificador (nominal ou anônimo). |
| **RF11** | O backend deve processar e calcular estatísticas gerais de acertos e erros por questão. |
| **RF12** | O sistema deve identificar o distrator mais assinalado em cada questão para diagnóstico pedagógico docente. |
| **RF13** | O sistema deve manter o histórico evolutivo de notas do aluno por prova e por etapa avaliativa (N1, N2 e N3). |
| **RF14** | O sistema deve suportar exportação de notas e relatórios em arquivo `.csv`. |
| **RF15** | O sistema deve garantir a anonimização de dados sob demanda em conformidade com a LGPD. |

### 3.2 Requisitos Não Funcionais (RNF)

| Código | Requisito |
|---|---|
| **RNF01** | **Arquitetura em 5 Camadas:** O sistema segue estritamente o fluxo arquitetural padronizado pela Católica SC: `Rota / UI → Controle → Serviço → Repositório → Model`. |
| **RNF02** | **Desempenho:** Tempo de resposta da API p95 < 300ms e build otimizado com Next.js Turbopack. |
| **RNF03** | **Disponibilidade:** Mínimo de 99,5% de disponibilidade mensal hospedado na Vercel. |
| **RNF04** | **Operação Offline:** Suporte a cache de gabarito e sincronização idempotente via `clientCorrectionId`. |
| **RNF05** | **Confiabilidade OMR:** Leitura óptica de QR Code via biblioteca `Html5Qrcode` integrada à câmera do dispositivo. |
| **RNF06** | **Segurança:** Isolamento estrito de acesso e visualização de notas entre estudantes e professores. |

---

## 4. Telas do Sistema

### 4.1 Banco de Questões
![Banco de Questões](docs/telas/tela-questoes.png)
*Listagem de questões cadastradas com filtros por enunciado/tags, badges e pontuações individuais.*

### 4.2 Gestão de Turmas
![Gestão de Turmas](docs/telas/tela-turmas.png)
*Administração de turmas ativas, estudantes matriculados e código de convite institucional.*

### 4.3 Configuração da Prova & Montador Split-Screen
![Configuração de Aplicação](docs/telas/tela-aplicacao.png)
*Painel de parametrização de versões, regras de embaralhamento, paginação e cálculo de nota em tempo real.*

### 4.4 Folha de Resposta & Gabarito OMR
![Folha de Resposta](docs/telas/tela-gabarito.png)
*Layout de impressão com marcadores de calibração, QR Code nominal e caderno descritivo frente/verso.*

### 4.5 Relatório de Notas, Distratores e Histórico N1/N2/N3
![Relatórios e Análise](docs/telas/tela-relatorios.png)
*Consolidação de notas corrigidas, exportação em `.csv`, diagnóstico de distratores e evolução semestral.*

### 4.6 Tela de Login
![Tela de Login](docs/telas/Tela-Login.png)
*Acesso demonstrativo com perfis de professor e aluno.*

---

## 5. Stack Tecnológica

* **Next.js 16 (App Router com Turbopack):** Framework full-stack moderno com suporte a rotas server-side e compilação em alta performance.
* **React 19 & React DOM 19:** Biblioteca base de interfaces reativas com componentes client-side e SSR seguros.
* **TypeScript 5.x:** Tipagem estática rigorosa cobrindo contratos, DTOs, modelos e serviços.
* **Tailwind CSS 3.4:** Design system utilitário com suporte nativo a regras de impressão física (`@media print`).
* **Jest 29 & Testing Library:** Suíte automatizada de testes unitários para serviços e algoritmos centrais.
* **Node.js v22.x LTS:** Ambiente de execução em conformidade com as diretrizes mais recentes de suporte e CI/CD.
* **Lucide React 0.475+:** Ícones utilitários minimalistas com compatibilidade oficial ao React 19.
* **Html5-QRCode & QRCode.react:** Leitura óptica de gabaritos via câmera e renderização vetorial de QR Codes.

---

## 6. Arquitetura em Camadas e Estrutura de Pastas

O projeto adota a **Arquitetura em Camadas (Layered Architecture)**, seguindo as diretrizes e boas práticas ensinadas no Centro Universitário Católica SC (referência nos padrões da disciplina de Arquitetura de Software):

```text
sgp-catolica-next/
├── .github/
│   └── workflows/
│       └── ci-cd.yml              # Pipeline de CI/CD (Node 22 LTS, Jest, Next Build)
├── docs/
│   ├── migrations/                # Scripts de migração de banco de dados
│   ├── schema-n2.sql              # Modelagem relacional PostgreSQL
│   └── telas/                     # Capturas de tela comprobatórias da aplicação
├── src/
│   ├── app/
│   │   ├── api/exams/generate/
│   │   │   └── route.ts           # [Camada Rota] Endpoint HTTP para geração de versões
│   │   ├── globals.css            # Folha de estilos globais e regras de impressão (@media print)
│   │   ├── layout.tsx             # Layout raiz da aplicação
│   │   └── page.tsx               # [Camada UI] Orquestrador enxuto e declarativo das abas
│   │
│   ├── models/                    # [Camada 1: Modelos / Domínio]
│   │   ├── PessoaModel.ts         # Entidade base (filiação, contato, endereço)
│   │   ├── AlunoModel.ts          # Entidade Aluno com cálculo de média e status acadêmico
│   │   ├── TurmaModel.ts          # Entidade Turma com código de convite institucional
│   │   ├── ExamModel.ts           # Entidade de diagramação determinística de avaliações
│   │   └── index.ts               # Barrel export dos modelos
│   │
│   ├── repositories/              # [Camada 2: Repositórios / Acesso a Dados]
│   │   ├── AlunoRepository.ts     # Abstração de persistência e consultas de estudantes
│   │   ├── TurmaRepository.ts     # Abstração de persistência de turmas acadêmicas
│   │   ├── QuestionRepository.ts  # Abstração de persistência do banco de questões
│   │   ├── OmrRepository.ts       # Abstração de persistência de leituras ópticas
│   │   ├── ExamRepository.ts      # Repositório de integração de exames
│   │   └── index.ts               # Barrel export dos repositórios
│   │
│   ├── services/                  # [Camada 3: Serviços / Regras de Negócio]
│   │   ├── AlunoService.ts        # Regras de estudantes, médias e taxas de aprovação
│   │   ├── TurmaService.ts        # Regras de turmas e geração de convites
│   │   ├── QuestionService.ts     # Validação de limites (máx. 20 questões) e pontuações
│   │   ├── OmrService.ts          # Processamento óptico, correção OMR e nota N2
│   │   ├── ExportService.ts       # Regra de geração e download de arquivos CSV
│   │   ├── ExamService.ts         # Algoritmo determinístico de embaralhamento com seed
│   │   └── index.ts               # Barrel export dos serviços
│   │
│   ├── controllers/               # [Camada 4: Controladores / Orquestração]
│   │   ├── AlunoController.ts     # Orquestrador de requisições de estudantes
│   │   ├── TurmaController.ts     # Orquestrador de requisições de turmas
│   │   ├── QuestionController.ts  # Orquestrador de requisições de questões
│   │   ├── OmrController.ts       # Orquestrador de requisições de leituras OMR
│   │   ├── ExamController.ts      # Orquestrador de geração de avaliações
│   │   └── index.ts               # Barrel export dos controladores
│   │
│   ├── components/                # [Camada 5: Apresentação Componentizada]
│   │   ├── cadastros/             # Componentes de gestão de Alunos e Turmas
│   │   │   ├── CadastrosTab.tsx   # Painel com alternância Alunos / Turmas
│   │   │   ├── AlunosTable.tsx    # Tabela com listagem, edição e exclusão
│   │   │   ├── TurmasGrid.tsx     # Cards de turmas e alunos matriculados
│   │   │   ├── ModalAluno.tsx     # Modal de cadastro/edição de estudante
│   │   │   └── ModalTurma.tsx     # Modal de cadastro/edição de turma
│   │   ├── montador/              # Módulo do Montador Split-Screen
│   │   │   ├── MontadorTab.tsx    # Banco de questões à esquerda, resumo à direita
│   │   │   └── ModalQuestao.tsx   # Modal de criação/edição de questão
│   │   ├── impressao/             # Módulo de Diagramação Física
│   │   │   └── ImpressaoTab.tsx   # Gabarito OMR frente, folha em branco e caderno verso
│   │   ├── leitura/               # Módulo de Leitura e Correção
│   │   │   └── LeituraTab.tsx     # Leitor de câmera ativa e simulação direta
│   │   ├── relatorios/            # Módulo de Análise e Diagnóstico
│   │   │   └── RelatoriosTab.tsx  # Estatísticas gerais, busca e exportação CSV
│   │   ├── layout/                # Moldura e Navegação
│   │   │   ├── Sidebar.tsx        # Menu lateral responsivo com dados docentes
│   │   │   └── Header.tsx         # Cabeçalho da aplicação
│   │   ├── common/                # Componentes Compartilhados
│   │   │   └── QRCodeWrapper.tsx  # Renderizador de QR Code SSR-safe
│   │   ├── auth/LoginScreen.tsx   # Tela de autenticação institucional
│   │   └── omr/OmrSheet.tsx       # Folha de gabarito avulsa
│   │
│   └── types/index.ts             # Interfaces e contratos TypeScript do sistema
│
├── __tests__/
│   └── services/
│       └── ExamService.test.ts    # Testes unitários com Jest
├── .npmrc                         # Configuração de compatibilidade de dependências (legacy-peer-deps)
├── vercel.json                    # Configuração de build e deploy contínuo na Vercel
├── jest.config.js                 # Configurações do framework de testes Jest
├── package.json                   # Dependências e scripts do projeto
└── README.md                      # Documentação completa do projeto
```

---

## 7. Como Executar o Projeto

### Pré-requisitos
* **Node.js v22.x LTS** ou superior instalado.
* **NPM** (gerenciador de pacotes padrão do Node).

### Passos de Instalação e Execução

1. Clone o repositório ou acesse a pasta raiz do projeto:
   ```bash
   git clone https://github.com/Agenorsc/SGP-CATOLICA-NEXT.git
   cd SGP-CATOLICA-NEXT
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse a aplicação no seu navegador:
   👉 **http://localhost:3000**

---

## 8. Testes e CI/CD

O projeto conta com uma suíte abrangente de testes unitários automatizados cobrindo as regras centrais de negócio do `ExamService`: limite de 20 questões por prova, integridade do payload de identificação do QR Code (nominal e anônimo) e integridade determinística do embaralhamento de questões e alternativas.

```bash
# Executar todos os testes unitários
npm test

# Executar testes com relatório detalhado de cobertura de código
npm run test:coverage
```

### Esteira de Integração Contínua (GitHub Actions & Vercel)
A esteira configurada em `.github/workflows/ci-cd.yml` é disparada automaticamente a cada *push* ou *pull request* na branch `main`:
1. Checkout do repositório em container Ubuntu;
2. Configuração do ambiente com **Node.js v22.x LTS**;
3. Resolução segura de dependências com `npm install --legacy-peer-deps`;
4. Execução automatizada da suíte de testes com Jest;
5. Validação rigorosa da compilação de produção com **Next.js Turbopack** (`npm run build`).

---

## 9. Equipe e Contribuições

As contribuições e atribuições de cada integrante na modelagem, arquitetura, testes e desenvolvimento do sistema estão registradas na seção [Equipe](#equipe).
