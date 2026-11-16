<div align="center">

# CENTRO UNIVERSITÁRIO CATÓLICA DE SANTA CATARINA
### CURSO DE BACHARELADO EM ENGENHARIA DE SOFTWARE
### DISCIPLINA DE ENGENHARIA DE SOFTWARE / ARQUITETURA DE SOFTWARE

---

# SISTEMA DE GERAÇÃO E CORREÇÃO DE PROVAS (SGP CATÓLICA)
### Relatório Técnico, Documentação de Arquitetura e Engenharia de Software — Avaliação N2

🌐 **Aplicação em Produção (Vercel):** [https://sgp-catolica-next.vercel.app/](https://sgp-catolica-next.vercel.app/)  
📁 **Repositório Oficial:** [https://github.com/Agenorsc/SGP-CATOLICA-NEXT](https://github.com/Agenorsc/SGP-CATOLICA-NEXT)  
🗄️ **Banco de Dados em Produção:** PostgreSQL 16 (Hospedado no Supabase via Prisma ORM)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.x-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.x-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS 3.4](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Jest 29](https://img.shields.io/badge/Jest-29.x-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

[![CI/CD Status](https://img.shields.io/badge/CI%2FCD-Sucesso%20Total%20(Green%20Build)-success?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/actions)
[![Avaliação](https://img.shields.io/badge/Cliente%20Docente-Prof.%20Me.%20Samuel-blue?style=flat-square)](https://catolicasc.org.br/)
[![Arquitetura](https://img.shields.io/badge/Padr%C3%A3o-Rota%20%E2%86%92%20Controller%20%E2%86%92%20Service%20%E2%86%92%20Repository-007ACC?style=flat-square)](https://catolicasc.org.br/)
[![Testes Automatizados](https://img.shields.io/badge/Testes-178%2F178%20Aprovados%20(100%25)-brightgreen?style=flat-square)](https://jestjs.io/)
[![Performance SLA](https://img.shields.io/badge/SLA%20p95-%3C%20250ms%20(Conforme%20RNF03)-brightgreen?style=flat-square)](https://vercel.com/)

**Jaraguá do Sul – SC | 2026**

</div>

---

## 👥 Equipe de Desenvolvimento e Matriz de Autores

| Integrante | GitHub | Papel / Especialidade Principal | Escopo Técnico Central no Repositório |
|---|---|---|---|
| **Agenor Alvise** | [@Agenorsc](https://github.com/Agenorsc) | Front-end Lead & Arquitetura | Arquitetura Rota $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ Repository, persistência no Supabase via Prisma, isolamento por docente no backend (TSK-57), benchmark de latência p95 < 250ms (TSK-61), dashboard de distratores (TSK-36), exportação Excel multi-abas (TSK-40), diagramação A4 duplex e motor OMR. |
| **Johnatan Vargas da Fonseca** | [@FonsecaJohnatan](https://github.com/FonsecaJohnatan) | Engenheiro Full-Stack | Gestão de turmas com código institucional, banco de questões individualizado por turma e ciclos (N1, N2, N3, N-1), endpoint de estatísticas por questão (PR #15), navegação responsiva e inspeção de espelhos OMR. |
| **Eric Ricardo Lange** | [@lange047](https://github.com/lange047) | Modelagem Orientada a Objetos | Entidades de domínio (`PessoaModel` $\rightarrow$ `AlunoModel`), infraestrutura de sessão segura por cookies assinados no servidor (TSK-56 / PR #31), paginação A4 sem quebra de questões (TSK-54 / PR #24), suíte de regressão de impressão física (TSK-62 / PR #33) e integração ViaCEP. |
| **Erick Andreas Pontecelli** | [@Erick-Andreas-Ponticelli](https://github.com/Erick-Andreas-Ponticelli) | Algoritmos & Autenticação | Segurança criptográfica de credenciais com Hashing Bcrypt (PR #23), migração de seed eliminando senhas fracas, módulo de troca de senha com validação de força, algoritmos determinísticos de embaralhamento com sementes (*seeds*), matrizes OMR e decodificação QR Code. |
| **Edinei Junio Machado** | [@edineiJM](https://github.com/edineiJM) | Engenharia de Requisitos & Dados | Validação de acurácia OMR com 36 cenários e taxa > 99% (TSK-45 / RNF04 / PR #16), cabeçalho dinâmico por professor/turma e gabarito de até 30 questões (TSK-59 / PR #28), simplificação de UX de correção em lote (TSK-46 / PR #26), modelagem UML e DDL SQL. |

* **Docente Avaliador / Cliente:** Prof. Me. Samuel  
* **Orientação Pedagógica:** Centro Universitário Católica de Santa Catarina (Católica SC) — Câmpus Jaraguá do Sul

---

## 📖 Resumo Executivo

O **Sistema de Geração e Correção de Provas (SGP)** é uma plataforma web full-stack de alto desempenho desenvolvida para transformar a rotina avaliativa docente diante de ciclos com **200 a 400 estudantes simultâneos por semestre letivo** no Centro Universitário Católica de Santa Catarina.

A solução elimina a sobrecarga operacional, a lentidão no lançamento de notas e o risco de fraudes acadêmicas através dos seguintes pilares:
1. **Padrão Arquitetural em 4 Camadas (TSK-44):** Rotas HTTP desacopladas operando estritamente no fluxo **Rota (`route.ts`) $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ Repository**, garantindo separação absoluta entre transporte de rede, regras de negócio e persistência relacional;
2. **Isolamento Completo por Docente no Backend (TSK-57):** Multi-tenancy rigoroso em nível de sessão. Professores acessam exclusivamente suas próprias turmas, estudantes, questões, leituras OMR, avaliações e relatórios. Turmas e questões sem professor atribuído (órfãs) são ocultadas e protegidas contra acesso docente, ficando restritas ao papel `ADMIN`. Qualquer tentativa de acesso cruzado resulta em `403 Forbidden`;
3. **Sessão Segura Server-Side com Cookies Assinados (TSK-56):** Autenticação protegida por cookies `httpOnly`, assinados com HMAC-SHA256 no servidor via `proxy.ts`, substituindo o armazenamento frágil em localStorage;
4. **Segurança de Credenciais com Bcrypt (PR #23):** Hashes criptográficos com fator de custo 10, eliminação da senha padrão legada `admin`, validação de complexidade e endpoint autenticado `/api/auth/trocar-senha`;
5. **Montador Flexível de Avaliações (1 a 30 questões):** Diagramação dinâmica em *split-screen*, admitindo desde provas rápidas até exames semestrais de 25 questões (com 0,4 pts cada) ou 30 questões, com validação matemática estrita da nota máxima de **10,0 pontos** e pontuações fracionadas a partir de 0,05 pts;
6. **Organização por Turma e Ciclos Avaliativos:** Banco de questões categorizado por Turma e Etapas: **N1** (1ª Etapa), **N2** (Prova Integrada OMR), **N3** (Projetos/Práticas) e **N-1** (Exame Semestral cumulativo que agrega questões de todas as etapas);
7. **Embaralhamento Determinístico Auditável:** Algoritmo Fisher-Yates com sementes numéricas (*seeds*) para permutação independente da ordem de questões e alternativas por versão de caderno;
8. **Folha de Respostas e Caderno no Modelo Oficial Católica SC:** Cabeçalho institucional dinâmico por professor/turma (TSK-59), orientações numeradas, paginação sem corte de questões no meio da folha A4 (TSK-54) e página duplex em branco no verso para destaque seguro do gabarito (TSK-62);
9. **Reconhecimento Óptico de Alta Acurácia (> 99% / TSK-45):** Leitura de marcas por câmera com marcadores fiduciais nos 4 cantos, decodificação instantânea do QR Code nominal com validação cruzada de turma e fluxo de conferência assistido por HUD em lote (TSK-46);
10. **Persistência Relacional com Supabase e Prisma ORM:** 8 entidades mapeadas (`usuarios`, `turmas`, `alunos`, `questoes`, `alternativas`, `provas_montadas`, `cadernos_prova`, `resultados_avaliacao` e `leituras_omr`) com índices B-tree nos pontos de maior cardinalidade (`professorId`, `turmaId`, `alunoId`, `provaMontadaId`, `cadernoProvaId`), garantindo execução dinâmica server-side (`force-dynamic`) com **p95 < 250 ms** em produção (TSK-61);
11. **Relatórios Pedagógicos, Análise de Distratores e Exportação Excel (TSK-36 / TSK-40):** Dashboard analítico consolidado por turma, cálculo de alternativas erradas mais assinaladas (distratores) e exportação em `.xlsx` com 3 abas estruturadas (Notas da Turma, Espelho OMR e Diagnóstico Pedagógico);
12. **Provas Montadas com Snapshots Imutáveis & Cadernos Embaralhados:** Congelamento integral das questões, alternativas e metadados no instante da geração da prova, com persistência relacional dos cadernos de prova (`cadernos_prova`), geração determinística de cadernos (A, B, C, D ou nominais por aluno) e pré-cálculo indexado do `gabarito_oficial_json` para conferência OMR ultrarrápida sem depender de inversões client-side;
13. **Scanner OMR Mobile-First com QR Code Compacto:** Interface nativa para smartphones com viewfinder HUD em tela cheia, guias visuais em neon, feedback auditivo (Web Audio API) e tátil (`navigator.vibrate`), decodificação de QR Code compacto com payload `{"p":"<prova_id>","c":"<caderno_id>"}`, busca automática do gabarito oficial daquela versão no backend e modal bottom-sheet de conferência ágil com nota calculada em tempo real;
14. **Gestão de Notas com Exclusão e Estorno Dinâmico de Estatísticas:** Tabela detalhada de estudantes avaliados via OMR na aba de Estatísticas/Relatórios, botão de exclusão (`Trash2`) com modal de confirmação seguro, rota `DELETE /api/resultados/[id]` com validação multi-tenant por docente, limpeza automática da nota da etapa no cadastro do aluno e recálculo instantâneo de médias, notas extremas e distratores, liberando a folha para ser reescaneada sem duplicidade.

---

## 📑 Sumário

- [1. Introdução](#1-introdução)
- [2. Engenharia de Requisitos do Sistema](#2-engenharia-de-requisitos-do-sistema)
- [3. Especificação de Telas e Interfaces](#3-especificação-de-telas-e-interfaces)
- [4. Modelagem Formal UML](#4-modelagem-formal-uml)
- [5. Persistência de Dados em Nuvem (Supabase & PostgreSQL)](#5-persistência-de-dados-em-nuvem-supabase--postgresql)
- [6. Planner de Entregas e Matriz Geral de Pull Requests](#6-planner-de-entregas-e-matriz-geral-de-pull-requests)
  - [6.1 Tabela Consolidada de Todas as PRs e Contribuidores](#61-tabela-consolidada-de-todas-as-prs-e-contribuidores)
  - [6.2 Quadro de Evidências por Integrante da Equipe](#62-quadro-de-evidências-por-integrante-da-equipe)
- [7. Arquitetura em Camadas Desacopladas (TSK-44)](#7-arquitetura-em-camadas-desacopladas-tsk-44)
  - [7.1 Fluxo Rota → Controller → Service → Repository](#71-fluxo-rota--controller--service--repository)
  - [7.2 Estrutura de Diretórios](#72-estrutura-de-diretórios)
  - [7.3 Execução Local e Testes Automatizados (171 Testes Verdes)](#73-execução-local-e-testes-automatizados-171-testes-verdes)
  - [7.4 Benchmark de Latência (p95 < 250 ms / TSK-61)](#74-benchmark-de-latência-p95--250-ms--tsk-61)
  - [7.5 Isolamento Multi-Tenancy por Docente no Backend (TSK-57)](#75-isolamento-multi-tenancy-por-docente-no-backend-tsk-57)
- [8. Considerações Finais](#8-considerações-finais)

---

## 1. Introdução

O **SGP Católica** foi desenvolvido para transformar o processo avaliativo docente do Centro Universitário Católica de Santa Catarina (Católica SC), eliminando retrabalhos manuais e conferindo segurança, auditabilidade matemática e agilidade sem precedentes ao corpo docente diante de centenas de estudantes por semestre letivo.

---

## 2. Engenharia de Requisitos do Sistema

### 2.1 Requisitos Funcionais (RF)

| Código | Requisito Funcional | Ator Principal | Descrição Detalhada |
|---|---|---|---|
| **RF01** | **Autenticação Docente com Sessão Segura** | Docente / Admin | Login seguro com senhas Bcrypt (custo 10), sessão assinada via cookie HTTP-only (`proxy.ts`), controle RBAC e endpoint de troca de senha. |
| **RF02** | **Banco de Questões por Turma e Ciclo** | Docente | Cadastro de questões objetivas (2 a 5 alternativas) e discursivas, vinculadas à turma do professor e ao ciclo avaliativo (**N1, N2, N3 ou Geral**). |
| **RF03** | **Gestão de Turmas Acadêmicas** | Docente | Criação e administração de turmas com nome, curso, semestre letivo e código de convite único institucional. |
| **RF04** | **Cadastro Discente com Herança OO** | Docente | Gestão de alunos aplicando herança (`PessoaModel` $\rightarrow$ `AlunoModel`), filiação, busca automática de endereço via CEP (ViaCEP) e acompanhamento de notas N1/N2/N3. |
| **RF05** | **Montador de Provas Flexível (1 a 30 questões)** | Docente | Interface *split-screen* permitindo selecionar de 1 a 30 questões, com pontuações fracionadas livres a partir de 0,05 pts (ex: 25 questões $\times$ 0,4 pts) e trava estrita de 10,0 pts no somatório final. |
| **RF06** | **Agrupamento Automático no Exame N-1** | Sistema | Ao selecionar o ciclo N-1 no montador, o sistema agrega automaticamente todas as questões já cadastradas nas etapas N1, N2 e N3 para compor a prova de recuperação semestral. |
| **RF07** | **Embaralhamento Determinístico Auditável** | Sistema | Permutação independente de questões e alternativas por versão de caderno (A, B, C, D) baseada no algoritmo Fisher-Yates com sementes (*seeds*) reproduzíveis. |
| **RF08** | **Diagramação Oficial Católica SC** | Sistema | Geração de gabarito e caderno de questões com cabeçalho institucional dinâmico por turma/professor, orientações da prova e identificação nominal. |
| **RF09** | **Paginação Duplex com Verso em Branco** | Sistema | Inserção automática de página em branco no verso da folha de respostas e prevenção de corte de questões entre folhas A4 (TSK-54 / TSK-62). |
| **RF10** | **Personalização de Cabeçalho e Orientações** | Docente | Painel de configuração para editar cabeçalho institucional, as orientações numeradas (com tags dinâmicas `{pontos}` e `{duracao}`), regras e links do portal. |
| **RF11** | **QR Code Nominal Estruturado em JSON** | Sistema | Cada folha de respostas possui no topo um QR Code contendo `examId`, `classId`, `className`, `teacherId`, `studentId`, `studentName`, `studentRa`, `stage` e versão da prova. |
| **RF12** | **Reconhecimento 100% Automático por Câmera** | Docente / Scanner | Leitura em tempo real via câmera/webcam sem necessidade de seleção manual de aluno ou ciclo: o sistema decodifica o QR Code e processa a folha instantaneamente. |
| **RF13** | **Validação Cruzada de Turma** | Sistema | Se o professor estiver com a aba de uma turma específica aberta e o cartão escaneado pertencer a outra turma, a leitura é pausada e um alerta visual de segurança é disparado. |
| **RF14** | **Painel HUD e Máquina de Estados de Correção** | Docente / Sistema | Exibição em tempo real do frame congelado, badge colorido do ciclo avaliativo, nota calculada, comparativo questão por questão e botões **"Validar Nota"** e **"Corrigir Novamente"**. |
| **RF15** | **Gravação Atômica de Notas** | Sistema | Ao acionar "Validar Nota", o sistema persiste o registro OMR no banco de dados e atualiza atomicamente a nota da respectiva etapa (**N1, N2, N3 ou N-1**) no cadastro do aluno. |
| **RF16** | **Análise Pedagógica de Distratores** | Docente | Painel estatístico demonstrando a frequência de acertos, erros e as alternativas incorretas mais marcadas pelos alunos por questão (TSK-36). |
| **RF17** | **Exportação de Relatórios Multi-Abas (.xlsx)** | Docente | Exportação de dados consolidados de turmas, notas semestrais e espelho de correções em planilha Excel estruturada em 3 abas (TSK-40). |
| **RF18** | **Isolamento de Dados por Docente no Backend** | Sistema | Professores acessam exclusivamente suas próprias turmas, alunos, avaliações e correções no backend Supabase, com bloqueio `403 Forbidden` a dados de terceiros ou turmas órfãs (TSK-57). |
| **RF19** | **Provas Montadas e Snapshots Imutáveis de Cadernos** | Docente / Sistema | Persistência de provas montadas congelando o enunciado e alternativas, geração determinística de cadernos de prova embaralhados com pré-cálculo e armazenamento do `gabarito_oficial_json` por versão. |
| **RF20** | **Scanner OMR Mobile com QR Code Compacto** | Docente / Câmera | Interface mobile-first com câmera, feedback sonoro e tátil, decodificação de QR Code compacto `{"p":"<id>","c":"<id>"}`, busca automática do gabarito oficial e confirmação via bottom-sheet. |
| **RF21** | **Gestão e Exclusão de Notas com Estorno Estatístico** | Docente / Sistema | Tabela analítica de leituras OMR na aba de relatórios, exclusão de notas via `DELETE /api/resultados/[id]`, estorno imediato no cadastro do aluno e recálculo instantâneo de todas as médias da turma. |

### 2.2 Requisitos Não Funcionais (RNF)

| Código | Categoria | Especificação Técnica |
|---|---|---|
| **RNF01** | **Arquitetura em Camadas Desacopladas** | Aplicação organizada estritamente em: `Rota (Route) → Controle (Controller) → Serviço (Service) → Repositório (Repository) → Modelo (Model)`. |
| **RNF02** | **Persistência em Nuvem** | Banco de dados relacional PostgreSQL hospedado no Supabase, gerenciado por Prisma ORM com schemas tipados e pooling de conexões transacionais. |
| **RNF03** | **Performance e Tempo de Resposta** | Execução Dinâmica Server-Side (`force-dynamic`) no Next.js 16 (Turbopack) com tempo de resposta p95 < 250 ms em produção comprovado em benchmark. |
| **RNF04** | **Confiabilidade da Visão Computacional** | Taxa de acerto OMR > 99% comprovada em suíte com 36 cenários de estresse (caneta, luz, ângulo, resolução e integridade). |
| **RNF05** | **Fidelidade de Impressão A4** | Folhas e cadernos diagramados via regras CSS `@media print`, eliminando barras de navegação e garantindo verso em branco para destaque físico seguro. |
| **RNF06** | **Segurança e Proteção de Dados (LGPD)** | Criptografia Bcrypt para senhas, sessão em cookie assinado via HMAC-SHA256 e validação rigorosa de payloads QR Code contra injeção. |
| **RNF07** | **Qualidade de Código e CI/CD** | Esteira automatizada no GitHub Actions com execução de linting TypeScript, compilação de produção e suíte de 171 testes automatizados em Jest. |
| **RNF08** | **Design Responsivo e Acessibilidade** | Interface intuitiva construída com Tailwind CSS e Lucide Icons, adaptável a computadores de mesa, laptops e bancadas de correção docente. |

---

## 3. Especificação de Telas e Interfaces

| Identificador | Rota / Componente | Função Principal |
|---|---|---|
| **Tela 1: Autenticação & Troca de Senha** | `LoginScreen.tsx` / `ModalTrocarSenha.tsx` | Entrada institucional com credenciais de professor ou administrador, proteção por cookies assinados e modal de atualização de senha com validação de força. |
| **Tela 2: Gestão de Turmas** | `CadastrosTab.tsx` / `TurmasGrid.tsx` | Cadastro de turmas, atribuição de curso/semestre, geração de código de convite e contagem de discentes com isolamento por docente autenticado. |
| **Tela 3: Gestão de Estudantes** | `CadastrosTab.tsx` / `AlunosTable.tsx` | Cadastro de alunos com herança OO, consumo de CEP via ViaCEP, notas parciais N1/N2/N3, cálculo de média e situação acadêmica. |
| **Tela 4: Montador de Provas** | `MontadorTab.tsx` / `ModalQuestao.tsx` | *Split-screen* com banco de questões categorizado por turma e ciclo (N1/N2/N3/N-1), seleção de 1 a 30 questões e trava matemática de 10,0 pts. |
| **Tela 5: Impressão & Caderno OMR** | `ImpressaoTab.tsx` / `OmrSheet.tsx` | Modelo oficial Católica SC com cabeçalho dinâmico por turma/professor, paginação frente/verso com folha em branco duplex e impressão A4 sem quebra de questões. |
| **Tela 6: Leitor Óptico Automático (Desktop)** | `CorrectionScanner.tsx` | Scanner OMR por câmera 100% automático com leitura de QR Code nominal, validação cruzada de turma, HUD de notas e fluxo de correção em lote simplificado. |
| **Tela 7: Relatórios Pedagógicos & Gestão de Notas** | `RelatoriosTab.tsx` | Médias da turma por ciclo, dashboard analítico interativo, gráfico de distratores, tabela detalhada de leituras OMR e botão de exclusão de notas com modal seguro e estorno automático. |
| **Tela 8: Provas Montadas** | `ProvasMontadasTab.tsx` / `ModalGabaritosEmbaralhados.tsx` | Visualização das provas congeladas, filtros por Turma/Etapa, consulta do gabarito oficial de cada caderno embaralhado, reimpressão A4 da prova/folha e botão "Abrir Scanner no Celular". |
| **Tela 9: Scanner OMR Mobile** | `MobileOmrScanner.tsx` | Viewport de câmera em tela cheia otimizado para celulares, feedback sonoro e de vibração, leitura de QR Code `{ p, c }`, conferência de acertos e bottom-sheet para salvar nota em `resultados_avaliacao`. |

---

## 4. Modelagem Formal UML

### 4.1 Diagrama de Casos de Uso

```mermaid
flowchart LR
    subgraph Atores["Atores do Sistema"]
        Prof["👨‍🏫 Professor (Docente)"]
        Cam["📷 Câmera / Scanner"]
    end

    subgraph SGP["Sistema de Geração e Correção de Provas (SGP Católica)"]
        UC01(["UC01: Autenticar e Gerenciar Senha"])
        UC02(["UC02: Gerenciar Turmas (Isolamento por Docente)"])
        UC03(["UC03: Gerenciar Alunos e Notas (N1, N2, N3)"])
        UC04(["UC04: Manter Banco de Questões por Ciclo"])
        UC05(["UC05: Montar Avaliação (1 a 30 questões)"])
        UC06(["UC06: Configurar Embaralhamento Determinístico"])
        UC07(["UC07: Personalizar Cabeçalho e Orientações"])
        UC08(["UC08: Gerar Caderno e Gabarito Oficial A4 Duplex"])
        UC09(["UC09: Escanear Cartão OMR via Câmera"])
        UC10(["UC10: Validar QR Code e Identificar Turma/Aluno"])
        UC11(["UC11: Executar Validação Cruzada de Turma"])
        UC12(["UC12: Corrigir Prova e Validar Nota"])
        UC13(["UC13: Atualizar Nota da Etapa no Supabase"])
        UC14(["UC14: Consultar Dashboard e Análise de Distratores"])
        UC15(["UC15: Exportar Relatórios Multi-Abas em Excel (.xlsx)"])
        UC16(["UC16: Salvar Prova Montada com Cadernos Imutáveis"])
        UC17(["UC17: Escanear Folha via Scanner OMR Mobile"])
        UC18(["UC18: Excluir / Estornar Nota com Recálculo Imediato"])
    end

    Prof --> UC01
    Prof --> UC02
    Prof --> UC03
    Prof --> UC04
    Prof --> UC05
    Prof --> UC07
    Prof --> UC08
    Prof --> UC09
    Prof --> UC12
    Prof --> UC14
    Prof --> UC15
    Prof --> UC16
    Prof --> UC17
    Prof --> UC18

    Cam --> UC09
    Cam --> UC17

    UC05 -.->|include| UC06
    UC05 -.->|include| UC16
    UC09 -.->|include| UC10
    UC10 -.->|include| UC11
    UC12 -.->|include| UC13
    UC17 -.->|include| UC12
    UC18 -.->|include| UC13
```

---

### 4.2 Diagrama de Atividades com Raias (Swimlanes)

```mermaid
sequenceDiagram
    autonumber
    actor P as Professor
    participant UI as Interface SGP (Next.js 16)
    participant OMR as Motor OMR & Visão (GridOmrEngine)
    participant DB as Banco PostgreSQL (Supabase / Prisma)

    Note over P,DB: Fase 1: Composição e Impressão da Avaliação
    P->>UI: Seleciona Turma e Ciclo Avaliativo (N1, N2, N3 ou N-1)
    UI->>DB: Consulta banco de questões da turma e ciclo (com isolamento docente)
    DB-->>UI: Retorna questões do professor logado
    P->>UI: Seleciona de 1 a 30 questões (validação estrita de 10.0 pts)
    P->>UI: Personaliza cabeçalho institucional, orientações e clica em Imprimir
    UI-->>P: Renderiza Folha OMR + Verso em Branco + Caderno A4 (TSK-54 / TSK-62)

    Note over P,DB: Fase 2: Aplicação Presencial e Reconhecimento Automático
    P->>UI: Posiciona o cartão-resposta na frente da câmera
    UI->>OMR: Captura quadros do fluxo de vídeo em tempo real
    OMR->>OMR: Decodifica QR Code nominal (Turma, Ciclo, Aluno, Versão)
    OMR->>UI: Executa Validação Cruzada com a aba de turma ativa
    
    alt Cartão de Turma Inconsistente com a Aba Ativa
        UI-->>P: Alerta de Inconsistência de Turma (Pausa Leitura e previne erro)
    else Cartão Válido e Compatível
        OMR->>OMR: Localiza gabarito oficial da versão e afere marcações das bolhas
        OMR->>UI: Retorna cálculo da nota, acertos e distratores questão por questão
        UI-->>P: Exibe HUD de Conferência (Estado ANALYZED)
        P->>UI: Confere o resultado e clica em "Validar Nota"
        UI->>DB: Persiste LeituraOMR e atualiza nota da etapa do aluno atomicamente
        DB-->>UI: Confirmação de persistência realizada com sucesso
        UI-->>P: Exibe feedback visual (Estado VALIDATED) e libera próximo estudante
    end
```

---

### 4.3 Diagrama de Classes de Domínio e Arquitetura

```mermaid
classDiagram
    direction TB

    class Usuario {
        +String id
        +String nome
        +String email
        +String senha
        +String role
        +String disciplina
        +String campus
        +DateTime createdAt
        +autenticar(email, senha) bool
    }

    class Turma {
        +String id
        +String nome
        +String curso
        +String semestre
        +String codigoConvite
        +String professorId
        +gerarCodigoConvite() String
    }

    class PessoaModel {
        <<abstract>>
        +String id
        +String nome
        +Object contato
        +Object endereco
    }

    class Aluno {
        +String ra
        +String curso
        +String turno
        +Float n1
        +Float n2
        +Float n3
        +String turmaId
        +calcularMedia() Float
        +obterStatus() String
        +atualizarNotaEtapa(etapa, nota) void
    }

    class Questao {
        +String id
        +String tipo
        +String enunciado
        +Float pontuacao
        +String[] tags
        +String turmaId
        +String professorId
        +String avaliacao
        +validarPontuacao() bool
    }

    class Alternativa {
        +String id
        +String letraOriginal
        +String texto
        +Boolean correta
        +String questaoId
    }

    class ProvaMontada {
        +String id
        +String titulo
        +String disciplina
        +String turma
        +String etapa
        +Float valorTotal
        +Boolean embaralharQuestoes
        +Boolean embaralharAlternativas
        +String status
        +String professorId
        +Json questoesSnapshot
        +DateTime createdAt
    }

    class CadernoProva {
        +String id
        +String provaMontadaId
        +String codigoVersao
        +String alunoNome
        +String alunoRa
        +Json mapaQuestoesJson
        +Json gabaritoOficialJson
        +DateTime createdAt
    }

    class ResultadoAvaliacao {
        +String id
        +String professorId
        +String provaMontadaId
        +String cadernoProvaId
        +String alunoNome
        +String alunoRa
        +Json respostasMarcadasJson
        +Int acertos
        +Int totalQuestoes
        +Float notaFinal
        +Boolean lidoViaMobile
        +DateTime createdAt
    }

    class LeituraOMR {
        +String id
        +String alunoId
        +String alunoNome
        +String ra
        +String turmaId
        +String professorId
        +String materia
        +String versao
        +Int acertos
        +Int totalQuestoes
        +Float notaCalculada
        +String dataLeitura
        +Json respostasDetectadas
        +Json gabaritoOficial
        +Json detalhesQuestoes
    }

    class GridOmrEngine {
        +scan(imageData, options) ScanResult
        -detectFiducials() Point[]
        -alignGrid() Matrix
        -sampleBubbles() BubbleScore[]
    }

    PessoaModel <|-- Aluno
    Usuario "1" --> "0..*" Turma : administra
    Usuario "1" --> "0..*" Questao : elabora
    Usuario "1" --> "0..*" LeituraOMR : audita
    Usuario "1" --> "0..*" ProvaMontada : compõe
    Usuario "1" --> "0..*" ResultadoAvaliacao : avalia
    Turma "1" --> "0..*" Aluno : matricula
    Turma "1" --> "0..*" Questao : destina
    Turma "1" --> "0..*" LeituraOMR : agrupa
    Turma "1" --> "0..*" ProvaMontada : vincula
    Questao "1" *-- "2..5" Alternativa : compõe
    ProvaMontada "1" *-- "1..*" CadernoProva : gera cadernos
    ProvaMontada "1" --> "0..*" ResultadoAvaliacao : consolida
    CadernoProva "1" --> "0..*" ResultadoAvaliacao : valida respostas
    Aluno "1" --> "0..*" LeituraOMR : realiza
    LeituraOMR ..> GridOmrEngine : processado por
    ResultadoAvaliacao ..> GridOmrEngine : gerado por
```

---

### 4.4 Diagrama de Sequência UML (Fluxo OMR e Validação Cruzada)

```mermaid
sequenceDiagram
    autonumber
    actor Docente as Professor
    participant Scanner as CorrectionScanner (UI)
    participant Controller as OmrController
    participant Service as OmrService (GridOmrEngine)
    participant Repo as PrismaOmrRepository
    participant DB as Supabase PostgreSQL

    Docente->>Scanner: Inicia câmera do dispositivo
    Scanner->>Scanner: Inicializa MediaStream (HTMLVideoElement)
    loop Varredura Contínua (RequestAnimationFrame)
        Scanner->>Service: Captura frame e tenta decodificar QR Code
        Service-->>Scanner: Retorna payload do QR Code ou nulo
    end
    Scanner->>Scanner: Validação cruzada do QR Code com a aba de turma ativa
    alt Turma do cartão diferente da aba ativa
        Scanner->>Docente: Dispara alerta visual de proteção cruzada e pausa
    else Turma válida e compatível
        Scanner->>Service: Processa grade de bolhas (GridOmrEngine)
        Service-->>Scanner: Retorna gabarito, acertos e nota calculada
        Scanner->>Docente: Congela vídeo e projeta Painel HUD (Estado ANALYZED)
        alt Docente clica em "Corrigir Novamente"
            Docente->>Scanner: Clica no botão secundário
            Scanner->>Scanner: Descarta resultado e reativa a câmera
        else Docente clica em "Validar Nota"
            Docente->>Scanner: Confirma nota
            Scanner->>Controller: POST /api/omr (Payload com leitura e escopo)
            Controller->>Service: salvarLeituraComTransacao(dados, session)
            Service->>Repo: create(leitura) e atualizarNotaEtapa(alunoId, etapa, nota)
            Repo->>DB: Transação atômica no PostgreSQL
            DB-->>Repo: Sucesso na transação
            Repo-->>Service: Leitura persistida
            Service-->>Controller: DTO de confirmação
            Controller-->>Scanner: HTTP 201 Created
            Scanner->>Docente: Estado VALIDATED com feedback e libera próximo aluno
        end
    end
```

---

### 4.5 Diagrama de Sequência UML (Fluxo Mobile OMR, Snapshots Imutáveis e Exclusão/Estorno)

```mermaid
sequenceDiagram
    autonumber
    actor Docente as Professor (Celular)
    participant Mobile as MobileOmrScanner (UI Mobile)
    participant CController as CadernoController
    participant RController as ResultadoController
    participant RService as ResultadoService
    participant RRepo as PrismaResultadoRepository
    participant DB as PostgreSQL (Supabase)

    Note over Docente,DB: Fase 1: Leitura do Cartão Embaralhado no Celular
    Docente->>Mobile: Aponta a câmera para a folha de respostas
    Mobile->>Mobile: Decodifica QR Code compacto: {"p": "<provaId>", "c": "<cadernoId>"}
    Mobile->>Mobile: Dispara beep sonoro e vibração tátil (navigator.vibrate)
    Mobile->>CController: GET /api/cadernos/[cadernoId]
    CController->>DB: Busca gabarito_oficial_json do caderno embaralhado
    DB-->>CController: Retorna gabarito pre-computado daquela versão
    CController-->>Mobile: { id, gabaritoOficialJson: { "1": "C", "2": "A", ... } }
    Mobile->>Mobile: Compara marcações OMR com o gabarito embaralhado
    Mobile->>Docente: Abre Bottom-Sheet com Aluno, RA, Acertos e Nota Calculada
    
    Docente->>Mobile: Clica em "Confirmar e Salvar Nota"
    Mobile->>RController: POST /api/resultados (alunoNome, alunoRa, acertos, notaFinal, etc.)
    RController->>RService: salvarResultadoComEscopo(dados, session)
    RService->>RRepo: create(resultado) + atualizarNotaEtapa(alunoId, etapa, nota)
    RRepo->>DB: Persiste em resultados_avaliacao e atualiza alunos.n2
    DB-->>RRepo: OK
    RRepo-->>RService: Registro criado
    RService-->>RController: Sucesso
    RController-->>Mobile: HTTP 201 Created
    Mobile->>Docente: Exibe badge de sucesso e câmera fica pronta para a próxima prova

    Note over Docente,DB: Fase 2: Gestão de Notas com Exclusão e Estorno Imediato
    Docente->>Mobile: Na aba de Estatísticas/Relatórios, clica na Lixeira vermelha de um aluno
    Mobile->>Docente: Abre modal de confirmação de exclusão
    Docente->>Mobile: Confirma remoção
    Mobile->>RController: DELETE /api/resultados/[resultadoId]
    RController->>RService: excluirResultadoComEscopo(resultadoId, session)
    RService->>RRepo: findById(resultadoId) (valida professorId = session.id)
    RService->>RRepo: delete(resultadoId)
    RService->>DB: Limpa nota da etapa em alunos (n1/n2/n3 = null)
    DB-->>RRepo: OK
    RRepo-->>RService: Exclusão concluída
    RService-->>RController: { success: true }
    RController-->>Mobile: HTTP 200 OK
    Mobile->>Docente: Recalcula estatísticas (médias, distratores) na hora e libera aluno para releitura
```

---

## 5. Persistência de Dados em Nuvem (Supabase & PostgreSQL)

### 5.1 Arquitetura de Dados Relacional e Prisma ORM
A persistência da aplicação é 100% realizada em banco de dados relacional **PostgreSQL 16 hospedado no Supabase**, gerenciado pelo **Prisma ORM (v5.22.0)**. O banco opera com isolamento rigoroso por docente (TSK-57), integridade referencial com chaves estrangeiras tipadas e remoção em cascata (`ON DELETE CASCADE`).

### 5.2 Catálogo Detalhado das Tabelas e Relações do Banco

1. **`usuarios`**: Entidade de autenticação docente e administrativa.
   - **Campos:** `id` (PK, UUID), `nome` (VARCHAR), `email` (VARCHAR, UNIQUE), `senha` (VARCHAR, Hash Bcrypt custo 10), `role` (ADMIN | PROFESSOR), `disciplina` (VARCHAR), `campus` (VARCHAR), `createdAt`, `updatedAt`.
   - **Relações:** 1:N com `turmas`, 1:N com `questoes`, 1:N com `provas_montadas`, 1:N com `leituras_omr`.

2. **`turmas`**: Turmas acadêmicas gerenciadas pelo professor.
   - **Campos:** `id` (PK, UUID), `nome` (VARCHAR), `curso` (VARCHAR), `semestre` (VARCHAR), `codigoConvite` (VARCHAR, UNIQUE), `professorId` (FK $\rightarrow$ usuarios.id), `createdAt`, `updatedAt`.
   - **Relações:** 1:N com `alunos`, 1:N com `questoes`, 1:N com `provas_montadas`, 1:N com `leituras_omr`.

3. **`alunos`**: Estudantes matriculados com notas parciais e endereço.
   - **Campos:** `id` (PK, UUID), `nome` (VARCHAR), `ra` (VARCHAR, UNIQUE), `curso` (VARCHAR), `turno` (VARCHAR), `n1` (FLOAT), `n2` (FLOAT), `n3` (FLOAT), `contato` (JSONB), `endereco` (JSONB), `turmaId` (FK $\rightarrow$ turmas.id), `createdAt`, `updatedAt`.
   - **Relações:** 1:N com `leituras_omr`.

4. **`questoes`**: Banco de questões individualizado por turma e ciclo avaliativo.
   - **Campos:** `id` (PK, UUID), `tipo` (objetiva | discursiva), `enunciado` (TEXT), `pontuacao` (FLOAT), `tags` (TEXT[]), `avaliacao` (N1 | N2 | N3 | N-1 | GERAL), `turmaId` (FK $\rightarrow$ turmas.id), `professorId` (FK $\rightarrow$ usuarios.id), `createdAt`, `updatedAt`.
   - **Relações:** 1:N com `alternativas` (`ON DELETE CASCADE`).

5. **`alternativas`**: Alternativas de cada questão objetiva (A até E).
   - **Campos:** `id` (PK, UUID), `letraOriginal` (A, B, C, D, E), `texto` (TEXT), `correta` (BOOLEAN), `questaoId` (FK $\rightarrow$ questoes.id com `ON DELETE CASCADE`).

6. **`provas_montadas`**: Espelho estruturado e snapshots imutáveis das avaliações compostas.
   - **Campos:** `id` (PK, UUID), `titulo` (VARCHAR), `disciplina` (VARCHAR), `turma` (VARCHAR, nullable), `etapa` (VARCHAR, nullable), `semestre` (VARCHAR, nullable), `ciclo` (VARCHAR, nullable), `valorTotal` (DOUBLE PRECISION, default 10.0), `embaralharQuestoes` (BOOLEAN), `embaralharAlternativas` (BOOLEAN), `status` (VARCHAR: 'RASCUNHO', 'PRONTA_PARA_APLICAR', 'FINALIZADA'), `turmaId` (FK $\rightarrow$ turmas.id, opcional), `professorId` (FK $\rightarrow$ usuarios.id), `questoesSnapshot` (JSONB), `totalQuestoes` (INT), `pontuacaoTotal` (DOUBLE PRECISION), `createdAt`.
   - **Relações:** 1:N com `cadernos_prova` (`ON DELETE CASCADE`), 1:N com `resultados_avaliacao`, 1:N com `leituras_omr`.

7. **`cadernos_prova`**: Mapeamento do embaralhamento determinístico e gabarito oficial congelado por versão ou nominal por aluno.
   - **Campos:** `id` (PK, UUID), `provaMontadaId` (FK $\rightarrow$ provas_montadas.id com `ON DELETE CASCADE`), `codigoVersao` (VARCHAR - ex: 'CADERNO-A', 'CADERNO-B'), `alunoNome` (VARCHAR, nullable), `alunoRa` (VARCHAR, nullable), `mapaQuestoesJson` (JSONB - ordem das questões e alternativas traduzidas), `gabaritoOficialJson` (JSONB - `{ "1": "C", "2": "A", ... }` para conferência instantânea), `createdAt`.
   - **Relações:** 1:N com `resultados_avaliacao`.

8. **`resultados_avaliacao`**: Registro oficial de notas e avaliações corrigidas via OMR (mobile ou desktop).
   - **Campos:** `id` (PK, UUID), `professorId` (FK $\rightarrow$ usuarios.id), `provaMontadaId` (FK $\rightarrow$ provas_montadas.id), `cadernoProvaId` (FK $\rightarrow$ cadernos_prova.id), `alunoNome` (VARCHAR), `alunoRa` (VARCHAR), `respostasMarcadasJson` (JSONB), `acertos` (INT), `totalQuestoes` (INT), `notaFinal` (DOUBLE PRECISION), `lidoViaMobile` (BOOLEAN, default true), `createdAt`.

9. **`leituras_omr`**: Registros detalhados legados e avançados das correções ópticas via câmera.
   - **Campos:** `id` (PK, UUID), `alunoId` (FK $\rightarrow$ alunos.id), `turmaId` (FK $\rightarrow$ turmas.id), `professorId` (FK $\rightarrow$ usuarios.id), `provaMontadaId` (FK $\rightarrow$ provas_montadas.id, opcional), `alunoNome` (VARCHAR), `ra` (VARCHAR), `turmaNome` (VARCHAR), `materia` (VARCHAR), `versao` (VARCHAR), `acertos` (INT), `totalQuestoes` (INT), `notaCalculada` (FLOAT), `dataLeitura` (VARCHAR), `respostasDetectadas` (JSONB), `gabaritoOficial` (JSONB), `detalhesQuestoes` (JSONB), `fiduciaisDetectados` (BOOLEAN), `createdAt`.

### 5.3 Otimização de Consultas e Índices B-Tree no PostgreSQL (Supabase)

Para garantir o SLA de **p95 < 250 ms** exigido no **RNF03** em execução dinâmica server-side, foram implementados índices B-tree nos pontos de maior cardinalidade (`prisma/schema.prisma`):

| Modelo Prisma | Campos Indexados (B-Tree) | Finalidade Técnica e Impacto de Performance |
|---|---|---|
| `Turma` | `@@index([professorId])`, `@@index([semestre])` | Isolamento imediato das turmas do docente logado (TSK-57) sem *full table scan*. |
| `Aluno` | `@@index([turmaId])` | Busca instantânea de estudantes por turma em `/api/alunos?turmaId=...`. |
| `Questao` | `@@index([turmaId])`, `@@index([professorId])`, `@@index([avaliacao])` | Agilidade na composição de provas por ciclo ($N1, N2, N3, N-1$) e disciplina. |
| `Alternativa` | `@@index([questaoId])` | Resolução imediata de opções $A, B, C, D, E$ com busca indexada no `include`. |
| `ProvaMontada` | `@@index([turmaId])`, `@@index([professorId])`, `@@index([ciclo])` | Consulta ultra-rápida do espelho de avaliação e histórico de provas. |
| `CadernoProva` | `@@index([provaMontadaId])`, `@@index([codigoVersao])` | Resolução em < 5ms do gabarito embaralhado por QR Code compacto `{"p","c"}`. |
| `ResultadoAvaliacao` | `@@index([professorId])`, `@@index([provaMontadaId])`, `@@index([cadernoProvaId])`, `@@index([alunoRa])` | Busca indexada para exclusão/estorno atômico e agregação de médias sem degradação. |
| `LeituraOMR` | `@@index([alunoId])`, `@@index([turmaId])`, `@@index([professorId])`, `@@index([createdAt])` | Ordenação temporal decrescente e cálculo em tempo real de médias e distratores. |

### 5.4 DDL Relacional em SQL (PostgreSQL Supabase)

```sql
-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Usuários (Docentes e Administradores)
CREATE TABLE IF NOT EXISTS "usuarios" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'PROFESSOR',
    "disciplina" VARCHAR(255),
    "campus" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Turmas
CREATE TABLE IF NOT EXISTS "turmas" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(255) NOT NULL,
    "curso" VARCHAR(255) NOT NULL,
    "semestre" VARCHAR(50) NOT NULL,
    "codigoConvite" VARCHAR(50) UNIQUE NOT NULL,
    "professorId" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE RESTRICT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "turmas_professorId_idx" ON "turmas"("professorId");
CREATE INDEX IF NOT EXISTS "turmas_semestre_idx" ON "turmas"("semestre");

-- 3. Tabela de Alunos
CREATE TABLE IF NOT EXISTS "alunos" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(255) NOT NULL,
    "ra" VARCHAR(50) UNIQUE NOT NULL,
    "curso" VARCHAR(255) NOT NULL,
    "turno" VARCHAR(50) NOT NULL,
    "n1" DOUBLE PRECISION,
    "n2" DOUBLE PRECISION,
    "n3" DOUBLE PRECISION,
    "contato" JSONB,
    "endereco" JSONB,
    "turmaId" UUID NOT NULL REFERENCES "turmas"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "alunos_turmaId_idx" ON "alunos"("turmaId");

-- 4. Tabela de Questões
CREATE TABLE IF NOT EXISTS "questoes" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tipo" VARCHAR(50) NOT NULL,
    "enunciado" TEXT NOT NULL,
    "pontuacao" DOUBLE PRECISION NOT NULL,
    "tags" TEXT[],
    "avaliacao" VARCHAR(50) NOT NULL,
    "turmaId" UUID NOT NULL REFERENCES "turmas"("id") ON DELETE CASCADE,
    "professorId" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE RESTRICT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "questoes_turmaId_idx" ON "questoes"("turmaId");
CREATE INDEX IF NOT EXISTS "questoes_professorId_idx" ON "questoes"("professorId");
CREATE INDEX IF NOT EXISTS "questoes_avaliacao_idx" ON "questoes"("avaliacao");

-- 5. Tabela de Alternativas
CREATE TABLE IF NOT EXISTS "alternativas" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "letraOriginal" VARCHAR(5) NOT NULL,
    "texto" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,
    "questaoId" UUID NOT NULL REFERENCES "questoes"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "alternativas_questaoId_idx" ON "alternativas"("questaoId");

-- 6. Tabela de Provas Montadas (Snapshots Imutáveis)
CREATE TABLE IF NOT EXISTS "provas_montadas" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "titulo" VARCHAR(255) NOT NULL,
    "disciplina" VARCHAR(255) NOT NULL,
    "turma" VARCHAR(255),
    "etapa" VARCHAR(50),
    "semestre" VARCHAR(50),
    "ciclo" VARCHAR(50),
    "valor_total" NUMERIC(5,2) DEFAULT 10.00,
    "embaralhar_questoes" BOOLEAN DEFAULT false,
    "embaralhar_alternativas" BOOLEAN DEFAULT false,
    "status" VARCHAR(50) DEFAULT 'PRONTA_PARA_APLICAR',
    "turmaId" UUID REFERENCES "turmas"("id") ON DELETE SET NULL,
    "professorId" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE RESTRICT,
    "questoesSnapshot" JSONB NOT NULL,
    "totalQuestoes" INTEGER NOT NULL DEFAULT 0,
    "pontuacaoTotal" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "provas_montadas_turmaId_idx" ON "provas_montadas"("turmaId");
CREATE INDEX IF NOT EXISTS "provas_montadas_professorId_idx" ON "provas_montadas"("professorId");

-- 7. Tabela de Cadernos de Prova (Gabaritos Embaralhados Imutáveis)
CREATE TABLE IF NOT EXISTS "cadernos_prova" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "prova_montada_id" UUID NOT NULL REFERENCES "provas_montadas"("id") ON DELETE CASCADE,
    "codigo_versao" VARCHAR(50) NOT NULL,
    "aluno_nome" VARCHAR(255),
    "aluno_ra" VARCHAR(50),
    "mapa_questoes_json" JSONB NOT NULL,
    "gabarito_oficial_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "cadernos_prova_prova_montada_id_idx" ON "cadernos_prova"("prova_montada_id");
CREATE INDEX IF NOT EXISTS "cadernos_prova_codigo_versao_idx" ON "cadernos_prova"("codigo_versao");

-- 8. Tabela de Resultados de Avaliação (Mobile OMR & Estorno Seguro)
CREATE TABLE IF NOT EXISTS "resultados_avaliacao" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "professor_id" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE RESTRICT,
    "prova_montada_id" UUID NOT NULL REFERENCES "provas_montadas"("id") ON DELETE CASCADE,
    "caderno_prova_id" UUID NOT NULL REFERENCES "cadernos_prova"("id") ON DELETE CASCADE,
    "aluno_nome" VARCHAR(255) NOT NULL,
    "aluno_ra" VARCHAR(50) NOT NULL,
    "respostas_marcadas_json" JSONB NOT NULL,
    "acertos" INTEGER NOT NULL,
    "total_questoes" INTEGER NOT NULL,
    "nota_final" NUMERIC(5,2) NOT NULL,
    "lido_via_mobile" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "resultados_avaliacao_professor_id_idx" ON "resultados_avaliacao"("professor_id");
CREATE INDEX IF NOT EXISTS "resultados_avaliacao_prova_montada_id_idx" ON "resultados_avaliacao"("prova_montada_id");
CREATE INDEX IF NOT EXISTS "resultados_avaliacao_caderno_prova_id_idx" ON "resultados_avaliacao"("caderno_prova_id");
CREATE INDEX IF NOT EXISTS "resultados_avaliacao_aluno_ra_idx" ON "resultados_avaliacao"("aluno_ra");

-- 9. Tabela de Leituras OMR
CREATE TABLE IF NOT EXISTS "leituras_omr" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "alunoId" UUID NOT NULL REFERENCES "alunos"("id") ON DELETE CASCADE,
    "turmaId" UUID NOT NULL REFERENCES "turmas"("id") ON DELETE CASCADE,
    "professorId" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE RESTRICT,
    "provaMontadaId" UUID REFERENCES "provas_montadas"("id") ON DELETE SET NULL,
    "alunoNome" VARCHAR(255) NOT NULL,
    "ra" VARCHAR(50) NOT NULL,
    "turmaNome" VARCHAR(255) NOT NULL,
    "materia" VARCHAR(255) NOT NULL,
    "versao" VARCHAR(10) NOT NULL,
    "acertos" INTEGER NOT NULL,
    "totalQuestoes" INTEGER NOT NULL,
    "notaCalculada" DOUBLE PRECISION NOT NULL,
    "dataLeitura" VARCHAR(50) NOT NULL,
    "respostasDetectadas" JSONB NOT NULL,
    "gabaritoOficial" JSONB NOT NULL,
    "detalhesQuestoes" JSONB NOT NULL,
    "fiduciaisDetectados" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "leituras_omr_alunoId_idx" ON "leituras_omr"("alunoId");
CREATE INDEX IF NOT EXISTS "leituras_omr_turmaId_idx" ON "leituras_omr"("turmaId");
CREATE INDEX IF NOT EXISTS "leituras_omr_professorId_idx" ON "leituras_omr"("professorId");
CREATE INDEX IF NOT EXISTS "leituras_omr_createdAt_idx" ON "leituras_omr"("createdAt");
```

---

## 6. Planner de Entregas e Matriz Geral de Pull Requests

### 6.1 Tabela Consolidada de Todas as PRs e Contribuidores

A esteira de integração contínua do repositório registra **todas as entregas homologadas com 100% de sucesso (Green Build)**:

| PR # / Commit | Autor / Contribuidor | Branch de Origem | Escopo Técnico e Entregas Realizadas |
|:---:|:---:|:---:|:---|
| **Branch Ativa** | **Agenor Alvise** (`@Agenorsc`) | `feat/provas-montadas-omr-mobile-estatisticas` | **Provas Montadas, Scanner OMR Mobile e Gestão de Notas com Exclusão:** Módulo completo de snapshots imutáveis (`provas_montadas`), cadernos de prova embaralhados determinísticos (`cadernos_prova`) com pré-cálculo de `gabarito_oficial_json`, scanner OMR mobile-first com detecção de QR Code `{ p, c }`, bottom-sheet de conferência, rota `DELETE /api/resultados/[id]` com validação de posse pelo professor e recálculo instantâneo das estatísticas da turma com estorno na tabela de alunos. |
| [**PR #44**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/44) | **Agenor Alvise** (`@Agenorsc`) | `feat/tsk-44-refactor-controller-service-repository` | **TSK-44: Refatoração Arquitetural Rota $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ Repository:** Desacoplamento integral de todas as rotas da API em controladores dedicados com tratamento padronizado de erros e serviços isolados. |
| [**PR #38**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/38) | **Agenor Alvise** (`@Agenorsc`) | `feat/tsk-57-isolamento-docente-backend` | **TSK-57: Isolamento por Docente no Backend (Multi-Tenancy):** Filtro estrito nas rotas pelo professor da sessão, bloqueio `403 Forbidden` a acessos de terceiros e ocultação definitiva de turmas órfãs para docentes. |
| [**PR #33**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/33) | **Eric Ricardo Lange** (`@lange047`) | `test/tsk-62-regressao-a4` | **TSK-62: Teste de Regressão de Impressão A4:** Roteiro formal de testes e evidências automatizadas de fidelidade de impressão duplex em folha A4. |
| [**PR #31**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/31) | **Eric Ricardo Lange** (`@lange047`) | `feat/tsk-56-sessao-segura` | **TSK-56: Sessão Segura Server-Side:** Emissão de cookies `httpOnly` assinados com HMAC-SHA256 no login, validação em `proxy.ts` e substituição de localStorage. |
| [**PR #29**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/29) | **Eric Ricardo Lange** (`@lange047`) | `fix/tsk-62-impressao-a4` | **TSK-62: Preservação do Verso em Branco:** Correção CSS na folha de gabarito para destaque físico seguro sem vazamento no caderno de questões. |
| [**PR #28**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/28) | **Edinei Junio Machado** (`@edineiJM`) | `feat/tsk-59-cabecalho-dinamico-gabarito-30q` | **TSK-59: Cabeçalho Dinâmico e Validação de 30 Questões:** Sincronização do cabeçalho da prova com professor/turma e suporte balanceado para até 30 questões. |
| [**PR #26**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/26) | **Edinei Junio Machado** (`@edineiJM`) | `tsk-46/omr-ux-minimalista` | **TSK-46: OMR UX Minimalista:** Simplificação do fluxo de escaneamento em lote com transição ágil para o próximo estudante e feedback visual. |
| [**PR #24**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/24) | **Eric Ricardo Lange** (`@lange047`) | `feat/tsk-54-paginacao` | **TSK-54: Paginação Física sem Quebra de Questões:** Regras CSS `@media print` com `page-break-inside: avoid` impedindo que questões fiquem partidas entre páginas. |
| [**PR #23**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/23) | **Erick Andreas Pontecelli** (`@Erick-Andreas-Ponticelli`) | `feat/seguranca-hash-senhas-troca-senha` | **Segurança de Senhas com Bcrypt:** Criptografia com algoritmo Bcrypt (custo 10), migração de seed eliminando a senha padrão 'admin', validação de força e modal de troca de senha. |
| [**PR #20**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/20) | **Agenor Alvise** (`@Agenorsc`) | `feat/tsk-61-api-latency-p95-indices-docs` | **TSK-61: Benchmark de Latência e Índices B-Tree:** Medição de p95 < 250ms em todas as rotas, otimização de índices no Prisma e documentação da execução em `force-dynamic`. |
| [**PR #19**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/19) | **Agenor Alvise** (`@Agenorsc`) | `feat/tsk-36-relatorios-dashboard-distratores` | **TSK-36: Dashboard de Relatórios e Análise de Distratores:** Gráficos interativos por turma e aluno, cálculo de alternativas erradas mais assinaladas e limpeza de valores estáticos. |
| [**PR #18**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/18) | **Agenor Alvise** (`@Agenorsc`) | `feat/tsk-45-omr-acuracia-grid` | **Ajustes de Grade OMR:** Eliminação de falsos deslocamentos em gabaritos de 4 e 5 alternativas e máscara de padding de 20%. |
| [**PR #17**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/17) | **Agenor Alvise** (`@Agenorsc`) | `feat/tsk-40-exportar-relatorio-excel` | **TSK-40: Exportação Excel (.xlsx) Multi-Abas:** Geração de planilha institucional com 3 abas estruturadas (Notas, Espelho OMR e Distratores). |
| [**PR #16**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/16) | **Edinei Junio Machado** (`@edineiJM`) | `feat/tsk-45-omr-acuracia-grid` | **TSK-45 / RNF04: Teste de Acurácia OMR com 36 Cenários:** Calibração dos limiares da `GridOmrEngine` atingindo 100% de precisão nos testes de estresse. |
| [**PR #15**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/15) | **Johnatan Vargas da Fonseca** (`@FonsecaJohnatan`) | `feat/estatisticas-por-questao` | **Estatísticas por Questão:** Endpoint `/api/estatisticas/questoes` para levantamento estatístico de acertos por item avaliativo. |
| [**PR #14**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/14) | **Edinei Junio Machado** (`@edineiJM`) | `feat/remocao-simulacao-omr` | **Remoção de Simulação:** Limpeza de código legada e foco exclusivo no reconhecimento por câmera real. |
| [**PR #13**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/13) | **Johnatan Vargas da Fonseca** (`@FonsecaJohnatan`) | `feat/banco-questoes-por-turma-ciclos` | **Banco por Turma e Ciclos:** Segmentação de questões por disciplina e agrupamento automático na etapa N-1. |
| [**PR #12**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/12) | **Eric Ricardo Lange** (`@lange047`) | `feat/montador-turma-ciclos` | **Montador por Ciclos:** Interface visual adaptada com contadores em tempo real para N1, N2, N3 e Exame. |
| [**PR #10**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/10) | **Eric Ricardo Lange** (`@lange047`) | `lange047-patch-1` | **Ajuste de Duplex A4:** Folha de gabarito destacável física com verso em branco. |
| [**PR #9**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/9) | **Johnatan Vargas da Fonseca** (`@FonsecaJohnatan`) | `docs/readme1-atualizacao` | **Documentação Institucional:** Atualização técnica do README e instruções de instalação. |
| [**PR #8**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/8) | **Johnatan Vargas da Fonseca** (`@FonsecaJohnatan`) | `docs/complementa-prs-readme` | **Rastreabilidade de PRs:** Mapeamento das entregas e governança do time no repositório. |
| [**PR #7**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/7) | **Johnatan Vargas da Fonseca** (`@FonsecaJohnatan`) | `feat/portal-aluno` | **Foco no Painel Docente:** Centralização operacional exclusiva no fluxo do professor. |
| [**PR #5**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/5) | **Johnatan Vargas da Fonseca** (`@FonsecaJohnatan`) | `feat/portal-aluno` | **Evidências Visuais:** Documentação comprobatória das telas e componentes do sistema. |
| [**PR #4**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/4) | **Johnatan Vargas da Fonseca** (`@FonsecaJohnatan`) | `feat/portal-aluno` | **Consultas e Relatórios:** Estruturação das consultas de notas por etapa avaliativa. |
| [**PR #3**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/3) | **Agenor Alvise** (`@Agenorsc`) | `feat/mobile-sidebar-navigation` | **Navegação Responsiva:** Menu lateral e cabeçalho institucional adaptável a múltiplos dispositivos. |
| [**PR #2**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/2) | **Agenor Alvise** (`@Agenorsc`) | `docs/readme-corrections` | **Revisão Documental:** Alinhamento dos termos institucionais e correções de referências. |
| [**PR #1**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/1) | **Agenor Alvise** (`@Agenorsc`) | `feat/login-e-perfis-de-acesso` | **Login Inicial e Perfis:** Infraestrutura básica de autenticação e papéis no sistema. |

---

### 6.2 Quadro de Evidências por Integrante da Equipe

#### 🟢 Agenor Alvise (`@Agenorsc`)
- **Provas Montadas, Scanner OMR Mobile & Gestão de Notas com Exclusão:** Módulo completo de snapshots de provas, geração determinística de cadernos embaralhados (`cadernos_prova`) com pré-cálculo de `gabarito_oficial_json`, scanner OMR mobile responsivo com retorno tátil/sonoro e bottom-sheet, exclusão segura de notas com estorno automático e recálculo instantâneo de estatísticas sem duplicidade de lançamentos.
- **Arquitetura em Camadas (TSK-44):** Refatoração integral do backend estruturando as rotas em `Rota → Controller → Service → Repository` com tratamento de erro padronizado (`HttpError`, `ForbiddenError`, `NotFoundError`).
- **Isolamento de Docente no Backend (TSK-57):** Implementação de regras multi-tenancy protegendo turmas, estudantes, questões, leituras e exames, com bloqueio `403` a recursos alheios e ocultação de turmas órfãs.
- **SLA de Performance e Benchmarking (TSK-61 / RNF03):** Otimização de consultas com índices B-Tree e comprovação de `p95 < 250ms` em todas as rotas dinâmicas.
- **Painel de Distratores e Exportação Excel (TSK-36 / TSK-40):** Dashboard analítico de frequência de erros por alternativa e exportador de planilhas `.xlsx` multi-abas.
- **Engenharia de Dados e OMR:** Persistência no PostgreSQL Supabase via Prisma e motor de visão computacional em tempo real com validação cruzada.

#### 🔵 Johnatan Vargas da Fonseca (`@FonsecaJohnatan`)
- **Gestão de Turmas e Banco por Ciclos:** Implementação da segmentação de questões por turma e ciclos avaliativos (N1, N2, N3 e N-1) no PR #13.
- **Estatísticas por Questão:** Criação do endpoint analítico de acertos e erros no PR #15.
- **Auditoria OMR e Governança:** Módulo de inspeção de espelhos OMR e complementação da rastreabilidade das PRs no README (PR #8 e PR #9).

#### 🟣 Eric Ricardo Lange (`@lange047`)
- **Infraestrutura de Sessão Segura (TSK-56):** Substituição de sessão em localStorage por cookies `httpOnly` assinados com HMAC-SHA256 validados em `proxy.ts` (PR #31).
- **Engenharia de Impressão A4 (TSK-54 / TSK-62):** Regras de paginação física evitando corte de questões entre folhas e preservação do verso em branco para destaque do gabarito (PR #24, PR #29 e PR #33).
- **Modelagem Orientada a Objetos:** Entidades de domínio com herança (`PessoaModel` $\rightarrow$ `AlunoModel`), consumo ViaCEP e montador por ciclos (PR #12).

#### 🟠 Erick Andreas Pontecelli (`@Erick-Andreas-Ponticelli`)
- **Segurança Criptográfica Bcrypt (PR #23):** Implementação de hashing Bcrypt para senhas de usuários, migração do seed institucional eliminando a senha fraca 'admin' e módulo de troca de senha com validação de força.
- **Controle de Acesso RBAC:** Proteção de rotas administrativas e docentes.
- **Algoritmos Determinísticos:** Implementação do embaralhamento determinístico Fisher-Yates com sementes auditáveis de 64 bits por versão de prova.

#### 🔴 Edinei Junio Machado (`@edineiJM`)
- **Acurácia OMR de Alta Precisão (TSK-45 / RNF04):** Construção da suíte de teste de acurácia com 36 cenários e calibração dos limiares da `GridOmrEngine` (PR #16).
- **Cabeçalho Dinâmico e 30 Questões (TSK-59):** Suporte completo para até 30 questões no gabarito e injeção dinâmica de professor e turma no cabeçalho institucional (PR #28).
- **OMR UX Minimalista (TSK-46):** Simplificação do fluxo de escaneamento em lote para agilizar a rotina de correção docente (PR #26).

---

## 7. Arquitetura em Camadas Desacopladas (TSK-44)

### 7.1 Fluxo Rota → Controller → Service → Repository

A aplicação implementa rigorosamente a separação de responsabilidades em camadas desacopladas:

$$\text{Cliente / HTTP} \longrightarrow \mathbf{Rota} \longrightarrow \mathbf{Controller} \longrightarrow \mathbf{Service} \longrightarrow \mathbf{Repository} \longrightarrow \mathbf{Banco\ PostgreSQL\ (Prisma)}$$

1. **Rota (`src/app/api/.../route.ts`):** Ponto de entrada do Next.js App Router. Não contém lógica de negócio nem chamadas de banco de dados; apenas despacha a chamada para o Controller.
2. **Controller (`src/controllers/...`):** Extrai parâmetros da requisição HTTP (`request`), cookies de sessão, query params e body JSON. Trata erros com status HTTP semânticos (`200`, `201`, `400`, `403`, `404`, `500`) usando a infraestrutura de `HttpError`.
3. **Service (`src/services/...`):** Contém todas as regras de domínio, validações acadêmicas, validação de limites (teto de 30 questões, soma de 10,0 pontos), algoritmos OMR e a aplicação estrita do isolamento multilocatário por docente da sessão.
4. **Repository (`src/repositories/...`):** Realiza a persistência relacional através do Prisma Client (`PrismaTurmaRepository`, `PrismaAlunoRepository`, `PrismaQuestionRepository`, `PrismaOmrRepository`) e provê fallbacks tipados para execução em testes.

### 7.2 Estrutura de Diretórios

```text
C:\SGP-CATOLICA-NEXT\src/
├── app/                        # [Camada 1: Rotas HTTP / Next.js 16 App Router]
│   ├── api/
│   │   ├── turmas/             # route.ts e [id]/route.ts (Delega para TurmaController)
│   │   ├── alunos/             # route.ts e [id]/route.ts (Delega para AlunoController)
│   │   ├── questoes/           # route.ts e [id]/route.ts (Delega para QuestionController)
│   │   ├── omr/                # route.ts (Delega para OmrController)
│   │   ├── exams/              # route.ts e generate/route.ts (Delega para ExamController)
│   │   ├── cadernos/           # route.ts e [id]/route.ts (Delega para CadernoController)
│   │   ├── resultados/         # route.ts e [id]/route.ts (Delega para ResultadoController)
│   │   ├── relatorios/         # route.ts (Delega para RelatorioController)
│   │   ├── estatisticas/       # questoes/route.ts (Delega para QuestionStatisticsController)
│   │   └── auth/               # login, logout, me, trocar-senha
│   └── page.tsx                # Interface Principal SPA (React 19)
│
├── controllers/                # [Camada 2: Controladores HTTP e Orquestração]
│   ├── TurmaController.ts
│   ├── AlunoController.ts
│   ├── QuestionController.ts
│   ├── OmrController.ts
│   ├── ExamController.ts
│   ├── CadernoController.ts
│   ├── ResultadoController.ts
│   ├── RelatorioController.ts
│   ├── QuestionStatisticsController.ts
│   └── index.ts
│
├── services/                   # [Camada 3: Regras de Negócio e Serviços de Domínio]
│   ├── TurmaService.ts         # Regras de turmas e isolamento docente
│   ├── AlunoService.ts         # Validações cadastrais de alunos e notas
│   ├── QuestionService.ts      # Banco de questões, ciclos e pontuações
│   ├── OmrService.ts           # Reconhecimento óptico, validação cruzada e HUD
│   ├── ExamService.ts          # Embaralhamento determinístico e montagem de cadernos
│   ├── ResultadoService.ts     # Gravação de notas OMR e exclusão com estorno
│   ├── RelatoriosService.ts    # Agregação estatística e pipeline analítico
│   ├── QuestionStatisticsService.ts # Análise de distratores e acertos
│   ├── ProfessorService.ts     # Gestão docente e hashes de senha
│   ├── AuthService.ts          # Validação de credenciais e autenticação
│   ├── ExportService.ts        # Geração de planilhas Excel (.xlsx) multi-abas
│   └── omr/GridOmrEngine.ts    # Motor de visão computacional em grade
│
├── repositories/               # [Camada 4: Repositórios e Persistência de Dados]
│   ├── prisma/                 # Implementações reais conectadas ao Supabase PostgreSQL
│   │   ├── PrismaTurmaRepository.ts
│   │   ├── PrismaAlunoRepository.ts
│   │   ├── PrismaQuestionRepository.ts
│   │   ├── PrismaOmrRepository.ts
│   │   ├── PrismaCadernoRepository.ts
│   │   ├── PrismaResultadoRepository.ts
│   │   └── PrismaUsuarioRepository.ts
│   ├── base/IBaseRepository.ts # Contratos de interface dos repositórios
│   └── ...                     # Implementações de fallback em memória para testes
│
├── components/                 # Componentes React (Client & Server Components)
│   ├── provas/                 # ProvasMontadasTab.tsx e ModalGabaritosEmbaralhados.tsx
│   ├── leitura/                # MobileOmrScanner.tsx (Câmera mobile-first com QR Code)
│   ├── montador/               # MontadorTab.tsx (Composição e embaralhamento)
│   ├── impressao/              # ImpressaoTab.tsx (Geração de cadernos A4 e QR compacto)
│   ├── relatorios/             # RelatoriosTab.tsx (Dashboard e gestão com exclusão)
│   └── ...
│
├── models/                     # [Camada 5: Entidades de Domínio e Herança OO]
│   ├── PessoaModel.ts          # Entidade base (nome, filiação, contato, endereço)
│   ├── AlunoModel.ts           # Herança de PessoaModel com notas N1, N2, N3 e média
│   ├── TurmaModel.ts           # Turma e gerador de códigos de convite
│   ├── UsuarioModel.ts         # Usuário com controle RBAC e sanitização de senha
│   └── ExamModel.ts            # Layouts de versão de prova e cabeçalhos
│
├── lib/                        # Infraestrutura compartilhada
│   ├── errors.ts               # Classes customizadas: HttpError, ForbiddenError, NotFoundError, etc.
│   ├── prisma.ts               # Singleton do PrismaClient com pooling de conexão
│   ├── session.ts              # Utilitários de sessão com assinatura HMAC-SHA256 e cookies
│   ├── password.ts             # Funções de hash Bcrypt e validação de força
│   └── shuffle.ts              # Algoritmo Fisher-Yates com sementes reproduzíveis
│
└── proxy.ts                    # Middleware do Next.js para proteção perimetral de rotas API
```

### 7.3 Execução Local e Testes Automatizados (178 Testes Verdes)

```bash
# 1. Clonar o repositório oficial
git clone https://github.com/Agenorsc/SGP-CATOLICA-NEXT.git
cd SGP-CATOLICA-NEXT

# 2. Instalar dependências
npm install

# 3. Gerar clientes tipados do Prisma ORM
npx prisma generate

# 4. Executar em modo desenvolvimento
npm run dev

# 5. Executar a suíte completa de testes automatizados (Jest)
npm test

# 6. Executar build de produção otimizado com TypeScript
npm run build
```

#### Cobertura Consolidada dos Testes Automatizados:
```text
PASS __tests__/services/GridOmrEngine.test.ts
PASS __tests__/services/OmrAccuracyBenchmark.test.ts
PASS __tests__/services/AuthService.test.ts
PASS __tests__/services/ProfessorService.test.ts
PASS __tests__/services/OmrService.test.ts
PASS __tests__/api/ApiLatencyBenchmark.test.ts
PASS __tests__/api/IsolamentoDocenteBackend.test.ts
PASS __tests__/api/TrocarSenhaRoute.test.ts
PASS __tests__/services/Gabarito30Questoes.test.ts
PASS __tests__/api/LoginRoute.test.ts
PASS __tests__/api/SessionRoutes.test.ts
PASS __tests__/services/ExportService.test.ts
PASS __tests__/api/estatisticasQuestoesRoute.test.ts
PASS __tests__/print/TSK62PrintContract.test.ts
PASS __tests__/services/QuestionStatisticsService.test.ts
PASS __tests__/services/ExamService.test.ts
PASS __tests__/services/QuestionService.test.ts
PASS __tests__/services/DistratoresEDashboardRelatorios.test.ts
PASS __tests__/services/AlunoService.test.ts
PASS __tests__/services/RelatoriosService.test.ts
PASS __tests__/services/ExamServiceSnapshots.test.ts
PASS __tests__/api/ResultadosRoute.test.ts

Test Suites: 22 passed, 22 total
Tests:       178 passed, 178 total
Snapshots:   0 total
Time:        39.215 s
Status:      100% dos testes aprovados com sucesso.
```

### 7.4 Benchmark de Latência (p95 < 250 ms / TSK-61)

Todas as rotas da API operam em execução dinâmica no servidor (`force-dynamic`, `revalidate = 0` e `Cache-Control: no-store`), atendendo com folga ao requisito **RNF03**:

| Rota / Endpoint | Amostras | Min (ms) | Média (ms) | p50 (ms) | p90 (ms) | p95 (ms) | p99 (ms) | Max (ms) | Meta SLA | Status RNF03 |
|---|---|---|---|---|---|---|---|---|---|---|
| **`GET /api/alunos`** | 25 | 0.04 | 0.08 | 0.06 | 0.14 | **0.18** | 0.19 | 0.19 | < 250 ms | ✅ CONFORME |
| **`GET /api/alunos?turmaId=...`** | 25 | 0.03 | 0.04 | 0.04 | 0.06 | **0.07** | 0.10 | 0.10 | < 250 ms | ✅ CONFORME |
| **`GET /api/turmas`** | 25 | 0.01 | 0.01 | 0.01 | 0.02 | **0.02** | 0.03 | 0.03 | < 250 ms | ✅ CONFORME |
| **`GET /api/questoes`** | 25 | 0.05 | 0.07 | 0.07 | 0.08 | **0.09** | 0.10 | 0.10 | < 250 ms | ✅ CONFORME |
| **`GET /api/exams`** | 25 | 0.04 | 0.05 | 0.05 | 0.06 | **0.07** | 0.07 | 0.07 | < 250 ms | ✅ CONFORME |
| **`GET /api/omr`** | 25 | 0.07 | 0.10 | 0.09 | 0.11 | **0.13** | 0.18 | 0.18 | < 250 ms | ✅ CONFORME |
| **`GET /api/omr?alunoId=...`** | 25 | 0.02 | 0.03 | 0.03 | 0.04 | **0.05** | 0.13 | 0.13 | < 250 ms | ✅ CONFORME |
| **`GET /api/relatorios?turmaId=TODAS`** | 25 | 0.21 | 0.32 | 0.28 | 0.38 | **0.42** | 0.95 | 0.95 | < 250 ms | ✅ CONFORME |
| **`GET /api/relatorios?turmaId=...`** | 25 | 0.15 | 0.20 | 0.20 | 0.22 | **0.22** | 0.25 | 0.25 | < 250 ms | ✅ CONFORME |
| **`GET /api/estatisticas/questoes`** | 25 | 0.04 | 0.06 | 0.05 | 0.08 | **0.10** | 0.12 | 0.12 | < 250 ms | ✅ CONFORME |

### 7.5 Isolamento Multi-Tenancy por Docente no Backend (TSK-57)

O sistema garante que docentes nunca acessem dados de colegas ou turmas sem professor (órfãs):
- `GET /api/turmas`: Professores recebem exclusivamente suas turmas (`professorId = session.id`).
- `GET /api/alunos`: Acesso filtrado pelos estudantes das turmas do docente.
- `GET /api/questoes`: Questões associadas ao docente ou às suas turmas.
- `GET /api/omr`: Leituras das turmas do professor.
- `GET /api/relatorios`: Agregação semestral consolidada restrita ao escopo do docente autenticado.
- Bloqueio com status `403 Forbidden` disparado imediatamente em qualquer tentativa de consulta, inserção ou exclusão de recursos de outros professores.

---


## 8. Considerações Finais

O desenvolvimento do **SGP Católica** cumpriu com rigor a totalidade dos requisitos didático-pedagógicos e arquiteturais estabelecidos para o projeto:
1. **Padrão Arquitetural em 4 Camadas:** Implementação autêntica de `Rota → Controller → Service → Repository`, garantindo clareza de responsabilidades, alta testabilidade e manutenibilidade;
2. **Isolamento e Segurança Institucional:** Multi-tenancy no backend, senhas protegidas com Bcrypt, cookies assinados e restrição estrita de dados por professor;
3. **Desempenho Comprovado:** Latência p95 muito abaixo de 250ms com execução dinâmica server-side e índices B-Tree no PostgreSQL;
4. **Precisão de Reconhecimento Óptico:** Leitura OMR por câmera com acurácia superior a 99% e fluxo ágil em lote;
5. **Governança e Trabalho em Equipe:** Diário de bordo detalhado com todas as PRs catalogadas, atribuídas nominalmente a cada membro e 100% dos 178 testes unitários aprovados (22 suítes de teste).

---

### Configuração do `.env` para usar o banco localmente

Para executar a aplicação local conectada ao PostgreSQL do Supabase, crie um arquivo chamado `.env` na raiz do projeto. Esse arquivo é ignorado pelo Git e não deve ser commitado, pois contém credenciais.

No painel do Supabase, acesse **Project Settings → Database → Connect** e copie as strings de conexão do PostgreSQL:

```env
DATABASE_URL="postgresql://postgres.ubmhvuhbyiugrdykhcfe:[YOUR-PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ubmhvuhbyiugrdykhcfe:[YOUR-PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
```

Substitua os placeholders ([YOUR-PASSWORD]) pelos valores reais do projeto. Não compartilhe o arquivo `.env`.

Valide a configuração com:

```bash
npx prisma validate
npx prisma migrate status
npx prisma generate
npm run dev
```

Em banco compartilhado ou de produção, não execute `prisma migrate dev` nem comandos de reset. Novas migrações devem passar pelo fluxo de PR do projeto.

---

<div align="center">
  <sub>Centro Universitário Católica de Santa Catarina — Engenharia de Software 2026</sub>
</div>
