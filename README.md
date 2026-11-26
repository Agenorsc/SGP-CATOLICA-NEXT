<div align="center">

# CENTRO UNIVERSITÁRIO CATÓLICA DE SANTA CATARINA
### CURSO DE BACHARELADO EM ENGENHARIA DE SOFTWARE
### DISCIPLINA DE ENGENHARIA DE SOFTWARE / ARQUITETURA DE SOFTWARE

---

# SISTEMA DE GERAÇÃO E CORREÇÃO DE PROVAS (SGP CATÓLICA)
### Relatório Técnico, Documentação de Arquitetura e Engenharia de Software — Versão Final Homologada

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
[![Cliente Docente](https://img.shields.io/badge/Cliente%20Docente-Prof.%20Me.%20Samuel-blue?style=flat-square)](https://catolicasc.org.br/)
[![Arquitetura](https://img.shields.io/badge/Padr%C3%A3o-Rota%20%E2%86%92%20Controller%20%E2%86%92%20Service%20%E2%86%92%20Repository-007ACC?style=flat-square)](https://catolicasc.org.br/)
[![Testes Automatizados](https://img.shields.io/badge/Testes-303%2F303%20Aprovados%20(44%20Su%C3%ADtes)-brightgreen?style=flat-square)](https://jestjs.io/)
[![Performance SLA](https://img.shields.io/badge/SLA%20p95-%3C%20250ms%20(Conforme%20RNF03)-brightgreen?style=flat-square)](https://vercel.com/)
[![Acurácia OMR](https://img.shields.io/badge/Acur%C3%A1cia%20OMR-100.00%25%20(36%20Cen%C3%A1rios)-brightgreen?style=flat-square)](https://catolicasc.org.br/)
[![Regimento Acadêmico](https://img.shields.io/badge/Crit%C3%A9rio%20Aprova%C3%A7%C3%A3o-M%C3%A9dia%20%E2%89%A5%206.0%20(Cat%C3%B3lica%20SC)-informational?style=flat-square)](https://catolicasc.org.br/)

**Jaraguá do Sul – SC | 2026**

</div>

---

## 👥 Equipe de Desenvolvimento e Matriz de Autores

| Integrante | GitHub | Papel / Especialidade Principal | Escopo Técnico Central no Repositório |
|---|---|---|---|
| **Agenor Alvise** | [@Agenorsc](https://github.com/Agenorsc) | Front-end Lead & Arquitetura | Arquitetura Rota $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ Repository (TSK-44), persistência no Supabase via Prisma, blindagem anti-duplicação em 3 camadas (Alunos, Questões e Turmas), componente interativo `<DisciplinaCombobox />` com hover/filtro e vinculação automática, isolamento multi-tenant por docente (TSK-57), benchmark de latência p95 < 250ms (TSK-61), cockpit de distratores e histograma interativo (TSK-36), exportação Excel multi-abas (TSK-40), diagramação A4 duplex, motor OMR e gestão de notas com estorno automático. |
| **Johnatan Vargas da Fonseca** | [@FonsecaJohnatan](https://github.com/FonsecaJohnatan) | Engenheiro Full-Stack | Gestão de turmas com código institucional e fases curriculares (1ª a 10ª Fase), banco de questões individualizado por turma e ciclos (N1, N2, N3, N-1), endpoint de estatísticas por questão (PR #15), navegação responsiva e inspeção de espelhos OMR. |
| **Eric Ricardo Lange** | [@lange047](https://github.com/lange047) | Modelagem Orientada a Objetos | Entidades de domínio (`PessoaModel` $\rightarrow$ `AlunoModel`) com persistência integral de filiação (Mãe/Pai) e nascimento (`YYYY-MM-DD`), infraestrutura de sessão segura por cookies assinados no servidor (TSK-56 / PR #31), paginação A4 sem quebra de questões (TSK-54 / PR #24), suíte de regressão de impressão física (TSK-62 / PR #33) e integração ViaCEP. |
| **Erick Andreas Pontecelli** | [@Erick-Andreas-Ponticelli](https://github.com/Erick-Andreas-Ponticelli) | Algoritmos & Autenticação | Segurança criptográfica de credenciais com Hashing Bcrypt (PR #23), migração de seed eliminando senhas fracas, módulo de troca de senha com validação de força, visibilidade de senhas (`Eye`/`EyeOff`), algoritmos determinísticos de embaralhamento com sementes (*seeds*), matrizes OMR e decodificação QR Code. |
| **Edinei Junio Machado** | [@edineiJM](https://github.com/edineiJM) | Engenharia de Requisitos & Dados | Validação de acurácia OMR com 36 cenários e taxa de 100% (TSK-45 / RNF04 / PR #16), cabeçalho dinâmico por professor/turma e gabarito de até 30 questões (TSK-59 / PR #28), simplificação de UX de correção em lote (TSK-46 / PR #26), modelagem UML e DDL SQL. |

* **Docente Avaliador / Cliente:** Prof. Me. Samuel  
* **Orientação Pedagógica:** Centro Universitário Católica de Santa Catarina (Católica SC) — Câmpus Jaraguá do Sul

---

## 📖 Resumo Executivo

O **Sistema de Geração e Correção de Provas (SGP)** é uma plataforma web full-stack de alto desempenho desenvolvida para transformar a rotina avaliativa docente diante de ciclos com **200 a 400 estudantes simultâneos por semestre letivo** no Centro Universitário Católica de Santa Catarina.

A solução elimina a sobrecarga operacional, a lentidão no lançamento de notas, as inconsistências de dados e o risco de fraudes acadêmicas através dos seguintes pilares de engenharia de software:

1. **Padrão Arquitetural em 4 Camadas (TSK-44):** Rotas HTTP desacopladas operando estritamente no fluxo **Rota (`route.ts`) $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ Repository**, garantindo separação absoluta entre transporte de rede, regras de negócio e persistência relacional;
2. **Isolamento Completo por Docente no Backend (TSK-57):** Multi-tenancy rigoroso em nível de sessão. Professores acessam exclusivamente suas próprias turmas, estudantes, questões, leituras OMR, avaliações e relatórios. Turmas e questões sem professor atribuído (órfãs) são ocultadas e protegidas contra acesso docente, ficando restritas ao papel `ADMIN`. Qualquer tentativa de acesso cruzado resulta em `403 Forbidden`;
3. **Blindagem Anti-Duplicação em 3 Camadas:** Proteção completa contra duplicação de cadastros de alunos, questões e turmas:
   - *Camada 1 (UI / Double-Submit Lock):* Trava de estado (`isSubmitting`/`salvando`) com spinner animado e desativação imediata de botões de clique duplo;
   - *Camada 2 (Estado Reativo):* Deduplicação atômica nas funções de estado React (`setAlunos`, `setBancoQuestoes`, `setTurmas`), substituindo itens existentes por `id`/`ra` e impedindo a inserção de referências clonadas;
   - *Camada 3 (Renderização Defensiva):* Memos com indexação por `Set` de identificadores únicos (`alunosVisiveis`, `bancoQuestoesVisiveis`, `turmasVisiveis`), garantindo pureza visual mesmo sob condições de corrida de rede;
4. **Gestão Curricular de Fases (1ª Fase a 10ª Fase):** Suporte nativo ao cadastro e edição de turmas com seleção de fases acadêmicas (1ª até 10ª Fase), integrado ao Prisma ORM, DDL relacional e interfaces visuais;
5. **Componente `<DisciplinaCombobox />` Interativo:** Mecanismo avançado de busca e seleção de disciplinas com abertura suave por hover (`onMouseEnter`) e clique (`ChevronDown`), fechamento com delay de 150ms contra fechamentos acidentais, busca dinâmica em tempo real e vinculação automática no cadastro discente;
6. **Persistência Integral de Filiação e Dados do Estudante:** Registro completo de Data de Nascimento (formatada no padrão `YYYY-MM-DD` para compatibilidade estrita com inputs nativos), Filiação (Nome da Mãe e Nome do Pai), Naturalidade, Estado Natal e Endereço com integração ViaCEP;
7. **Critério Institucional de Aprovação Católica SC (Média $\ge$ 6.0):** Parametrização estrita das regras acadêmicas da instituição: Média $\ge$ 6.0 para aprovação direta, direcionamento automático ao exame semestral (N-1) para médias inferiores e recálculo dinâmico;
8. **Segurança de Credenciais com Bcrypt & Alternância de Visibilidade:** Hashing Bcrypt com custo 10, eliminação de senhas fracas no seed, modal de troca de senha com validação de complexidade e funcionalidade de alternância de visibilidade de senha (ícone `Eye`/`EyeOff`) no login e cadastros;
9. **Sessão Segura Server-Side com Cookies Assinados (TSK-56):** Autenticação protegida por cookies `httpOnly`, assinados com HMAC-SHA256 no servidor via `proxy.ts`, substituindo o armazenamento frágil em localStorage;
10. **Montador Flexível de Avaliações (1 a 30 questões):** Diagramação dinâmica em *split-screen*, admitindo desde provas rápidas até exames semestrais de 25 questões (com 0,4 pts cada) ou 30 questões, com validação matemática estrita da nota máxima de **10,0 pontos** e pontuações fracionadas a partir de 0,05 pts;
11. **Organização por Turma e Ciclos Avaliativos:** Banco de questões categorizado por Turma e Etapas: **N1** (1ª Etapa), **N2** (Prova Integrada OMR), **N3** (Projetos/Práticas) e **N-1** (Exame Semestral cumulativo que agrega questões de todas as etapas);
12. **Embaralhamento Determinístico Auditável:** Algoritmo Fisher-Yates com sementes numéricas (*seeds*) para permutação independente da ordem de questões e alternativas por versão de caderno;
13. **Folha de Respostas e Caderno no Modelo Oficial Católica SC:** Cabeçalho institucional dinâmico por professor/turma (TSK-59), orientações numeradas, paginação sem corte de questões no meio da folha A4 (TSK-54) e página duplex em branco no verso para destaque seguro do gabarito (TSK-62);
14. **Reconhecimento Óptico de Acurácia Máxima (100% nos 36 Cenários / TSK-45):** Leitura de marcas por câmera com marcadores fiduciais nos 4 cantos, decodificação instantânea do QR Code nominal com validação cruzada de turma e fluxo de conferência assistido por HUD em lote (TSK-46);
15. **Persistência Relacional com Supabase e Prisma ORM:** 9 entidades mapeadas com índices B-tree nos pontos de maior cardinalidade (`professorId`, `turmaId`, `alunoId`, `provaMontadaId`, `cadernoProvaId`), garantindo execução dinâmica server-side (`force-dynamic`) com **p95 < 250 ms** em produção (TSK-61);
16. **Cockpit Analítico, Análise de Distratores e Exportação Multi-Formato:** Histograma interativo com hover e clique para inspeção rápida de questões, cálculo de distratores, exportação em `.xlsx` multi-abas estruturada (Notas, Espelho OMR, Diagnóstico), exportação em Word (`.docx`) e botão "Salvar em PDF";
17. **Provas Montadas com Snapshots Imutáveis & Cadernos Embaralhados:** Congelamento integral das questões, alternativas e metadados no instante da geração da prova, persistência de `cadernos_prova` e pré-cálculo indexado do `gabarito_oficial_json` para conferência OMR ultrarrápida;
18. **Scanner OMR Mobile-First com QR Code Compacto:** Interface nativa para smartphones com viewfinder HUD em tela cheia, guias visuais em neon, feedback auditivo (Web Audio API) e tátil (`navigator.vibrate`), decodificação de QR Code compacto `{"p":"<prova_id>","c":"<caderno_id>"}`, busca automática do gabarito e bottom-sheet ágil;
19. **Gestão de Notas com Exclusão e Estorno Dinâmico de Estatísticas:** Tabela detalhada de estudantes avaliados via OMR na aba de Relatórios, botão de exclusão (`Trash2`) com modal de confirmação seguro, rota `DELETE /api/resultados/[id]` com validação multi-tenant, limpeza automática da nota no cadastro do aluno e recálculo instantâneo de médias e distratores.

---

## 📑 Sumário

- [1. Introdução](#1-introdução)
- [2. Engenharia de Requisitos do Sistema](#2-engenharia-de-requisitos-do-sistema)
  - [2.1 Requisitos Funcionais (RF01 a RF25)](#21-requisitos-funcionais-rf)
  - [2.2 Requisitos Não Funcionais (RNF01 a RNF10)](#22-requisitos-não-funcionais-rnf)
- [3. Especificação de Telas e Interfaces](#3-especificação-de-telas-e-interfaces)
- [4. Modelagem Formal UML](#4-modelagem-formal-uml)
  - [4.1 Diagrama de Casos de Uso](#41-diagrama-de-casos-de-uso)
  - [4.2 Diagrama de Atividades com Raias (Swimlanes)](#42-diagrama-de-atividades-com-raias-swimlanes)
  - [4.3 Diagrama de Classes de Domínio e Arquitetura](#43-diagrama-de-classes-de-domínio-e-arquitetura)
  - [4.4 Diagrama de Sequência UML (Fluxo OMR Desktop e Validação Cruzada)](#44-diagrama-de-sequência-uml-fluxo-omr-e-validação-cruzada)
  - [4.5 Diagrama de Sequência UML (Fluxo Mobile OMR, Snapshots e Estorno)](#45-diagrama-de-sequência-uml-fluxo-mobile-omr-snapshots-imutáveis-e-exclusãoestorno)
  - [4.6 Diagrama de Sequência UML (Blindagem Anti-Duplicação em 3 Camadas)](#46-diagrama-de-sequência-uml-blindagem-anti-duplicação-em-3-camadas)
- [5. Persistência de Dados em Nuvem (Supabase & PostgreSQL)](#5-persistência-de-dados-em-nuvem-supabase--postgresql)
  - [5.1 Arquitetura Relacional e Prisma ORM](#51-arquitetura-de-dados-relacional-e-prisma-orm)
  - [5.2 Catálogo Detalhado das Tabelas](#52-catálogo-detalhado-das-tabelas-e-relações-do-banco)
  - [5.3 Otimização de Consultas e Índices B-Tree](#53-otimização-de-consultas-e-índices-b-tree-no-postgresql-supabase)
  - [5.4 DDL Relacional em SQL Completo](#54-ddl-relacional-em-sql-postgresql-supabase)
- [6. Planner de Entregas e Matriz Geral de Pull Requests](#6-planner-de-entregas-e-matriz-geral-de-pull-requests)
  - [6.1 Tabela Consolidada de PRs e Contribuidores](#61-tabela-consolidada-de-todas-as-prs-e-contribuidores)
  - [6.2 Quadro de Evidências por Integrante da Equipe](#62-quadro-de-evidências-por-integrante-da-equipe)
- [7. Arquitetura em Camadas Desacopladas (TSK-44) & Qualidade](#7-arquitetura-em-camadas-desacopladas-tsk-44)
  - [7.1 Fluxo Rota → Controller → Service → Repository](#71-fluxo-rota--controller--service--repository)
  - [7.2 Estrutura Completa de Diretórios](#72-estrutura-de-diretórios)
  - [7.3 Execução Local e Suíte de Testes (303 Testes Verdes / 44 Suítes)](#73-execução-local-e-testes-automatizados-303-testes-verdes)
  - [7.4 Benchmark de Latência (p95 < 250 ms / TSK-61)](#74-benchmark-de-latência-p95--250-ms--tsk-61)
  - [7.5 Relatório de Acurácia OMR (100.00% / 36 Cenários)](#75-relatório-de-acurácia-do-leitor-omr-tsk-45--rnf04)
  - [7.6 Isolamento Multi-Tenancy por Docente no Backend (TSK-57)](#76-isolamento-multi-tenancy-por-docente-no-backend-tsk-57)
- [8. Configuração de Ambiente (.env) e Considerações Finais](#8-considerações-finais)

---

## 1. Introdução

O **SGP Católica** foi concebido e homologado para transformar a rotina acadêmica avaliativa no Centro Universitário Católica de Santa Catarina (Católica SC). Operando em conformidade com o regimento acadêmico institucional (aprovação direta com média $\ge 6.0$), o sistema automatiza de ponta a ponta a geração de cadernos de prova, o embaralhamento de questões e alternativas, a impressão sem corte de itens e o reconhecimento óptico via câmera em tempo real com acurácia comprovada de 100%.

---

## 2. Engenharia de Requisitos do Sistema

### 2.1 Requisitos Funcionais (RF)

| Código | Requisito Funcional | Ator Principal | Descrição Detalhada |
|---|---|---|---|
| **RF01** | **Autenticação Docente com Sessão Segura** | Docente / Admin | Login seguro com senhas criptografadas em Bcrypt (custo 10), controle de visualização de senha (`Eye`/`EyeOff`), busca tolerante de e-mail e sessão assinada via cookie HTTP-only (`proxy.ts`). |
| **RF02** | **Banco de Questões por Turma e Ciclo** | Docente | Cadastro de questões objetivas (2 a 5 alternativas) e discursivas, vinculadas à turma do professor e ao ciclo avaliativo (**N1, N2, N3 ou Geral**). |
| **RF03** | **Gestão de Turmas com Fases Curriculares** | Docente | Criação e edição de turmas acadêmicas com nome, curso, semestre letivo, código de convite único institucional e seleção de fases curriculares (**1ª Fase a 10ª Fase**). |
| **RF04** | **Cadastro Discente com Filiação e Herança OO** | Docente | Gestão de alunos aplicando herança (`PessoaModel` $\rightarrow$ `AlunoModel`), persistindo data de nascimento (`YYYY-MM-DD`), nome da mãe, nome do pai, naturalidade, estado natal, endereço com ViaCEP e notas N1/N2/N3. |
| **RF05** | **Blindagem Anti-Duplicação em 3 Camadas** | Sistema | Bloqueio de submissão dupla (*double-submit*) em modais com travas visuais/spinners, deduplicação reativa no estado React e memos defensivos com indexação estrita por `Set` para alunos, questões e turmas. |
| **RF06** | **Componente `<DisciplinaCombobox />` Interativo** | Docente | Seleção rápida de turmas/disciplinas do professor com abertura suave por hover e clique, delay de fechamento de 150ms, busca dinâmica em tempo real e auto-vinculação cadastral. |
| **RF07** | **Montador de Provas Flexível (1 a 30 questões)** | Docente | Interface *split-screen* permitindo selecionar de 1 a 30 questões, com pontuações fracionadas livres a partir de 0,05 pts (ex: 25 questões $\times$ 0,4 pts) e trava estrita de 10,0 pts no somatório final. |
| **RF08** | **Agrupamento Automático no Exame N-1** | Sistema | Ao selecionar o ciclo N-1 no montador, o sistema agrega automaticamente todas as questões já cadastradas nas etapas N1, N2 e N3 para compor a prova de recuperação semestral. |
| **RF09** | **Embaralhamento Determinístico Auditável** | Sistema | Permutação independente de questões e alternativas por versão de caderno (A, B, C, D) baseada no algoritmo Fisher-Yates com sementes (*seeds*) reproduzíveis. |
| **RF10** | **Diagramação Oficial Católica SC** | Sistema | Geração de gabarito e caderno de questões com cabeçalho institucional dinâmico por turma/professor, orientações da prova e identificação nominal. |
| **RF11** | **Paginação Duplex com Verso em Branco** | Sistema | Inserção automática de página em branco no verso da folha de respostas e prevenção de corte de questões entre folhas A4 (TSK-54 / TSK-62). |
| **RF12** | **Personalização de Cabeçalho e Orientações** | Docente | Painel de configuração para editar cabeçalho institucional, as orientações numeradas (com tags dinâmicas `{pontos}` e `{duracao}`), regras e links do portal. |
| **RF13** | **QR Code Nominal Estruturado em JSON** | Sistema | Cada folha de respostas possui no topo um QR Code contendo `examId`, `classId`, `className`, `teacherId`, `studentId`, `studentName`, `studentRa`, `stage` e versão da prova. |
| **RF14** | **Reconhecimento 100% Automático por Câmera** | Docente / Scanner | Leitura em tempo real via câmera/webcam sem necessidade de seleção manual de aluno ou ciclo: o sistema decodifica o QR Code e processa a folha instantaneamente. |
| **RF15** | **Validação Cruzada de Turma** | Sistema | Se o professor estiver com a aba de uma turma específica aberta e o cartão escaneado pertencer a outra turma, a leitura é pausada e um alerta visual de segurança é disparado. |
| **RF16** | **Painel HUD e Máquina de Estados de Correção** | Docente / Sistema | Exibição em tempo real do frame congelado, badge colorido do ciclo avaliativo, nota calculada, comparativo questão por questão e botões **"Validar Nota"** e **"Corrigir Novamente"**. |
| **RF17** | **Gravação Atômica de Notas** | Sistema | Ao acionar "Validar Nota", o sistema persiste o registro OMR no banco de dados e atualiza atomicamente a nota da respectiva etapa (**N1, N2, N3 ou N-1**) no cadastro do aluno. |
| **RF18** | **Cockpit Analítico Interativo & Distratores** | Docente | Dashboard com histograma interativo exibindo taxa de acerto por questão, inspeção de alternativas erradas mais marcadas (distratores) e filtros por etapa. |
| **RF19** | **Exportação Multi-Formato (.xlsx, .docx e PDF)** | Docente | Exportação de planilha Excel com 3 abas estruturadas (Notas, Espelho OMR e Diagnóstico Pedagógico), exportação do caderno de avaliação em documento Word (.docx) e botão direto de salvar em PDF. |
| **RF20** | **Isolamento de Dados por Docente no Backend** | Sistema | Professores acessam exclusivamente suas próprias turmas, alunos, avaliações e correções no backend Supabase, com bloqueio `403 Forbidden` a dados de terceiros ou turmas órfãs (TSK-57). |
| **RF21** | **Provas Montadas e Snapshots Imutáveis de Cadernos** | Docente / Sistema | Persistência de provas montadas congelando enunciados e alternativas, geração determinística de cadernos de prova embaralhados com pré-cálculo e armazenamento do `gabarito_oficial_json` por versão. |
| **RF22** | **Scanner OMR Mobile com QR Code Compacto** | Docente / Câmera | Interface mobile-first com câmera, feedback sonoro e tátil, decodificação de QR Code compacto `{"p":"<id>","c":"<id>"}`, busca automática do gabarito oficial e confirmação via bottom-sheet. |
| **RF23** | **Gestão e Exclusão de Notas com Estorno Estatístico** | Docente / Sistema | Tabela analítica de leituras OMR na aba de relatórios, exclusão de notas via `DELETE /api/resultados/[id]`, estorno imediato no cadastro do aluno e recálculo instantâneo de todas as médias da turma. |
| **RF24** | **Regra Acadêmica de Aprovação (Média $\ge$ 6.0)** | Sistema | Cálculo da média semestral aplicando rigorosamente o critério institucional da Católica SC: aprovação direta com média $\ge$ 6.0 e encaminhamento para exame semestral N-1 em notas inferiores. |
| **RF25** | **Importação em Lote de Estudantes** | Docente / Admin | Módulo dedicado de importação em lote (`AlunoImportService`) para cadastro acelerado de alunos via payloads estruturados. |

### 2.2 Requisitos Não Funcionais (RNF)

| Código | Categoria | Especificação Técnica |
|---|---|---|
| **RNF01** | **Arquitetura em Camadas Desacopladas** | Aplicação organizada estritamente em: `Rota (Route) → Controle (Controller) → Serviço (Service) → Repositório (Repository) → Modelo (Model)`. |
| **RNF02** | **Persistência em Nuvem Relacional** | Banco de dados PostgreSQL 16 hospedado no Supabase, gerenciado por Prisma ORM com schemas tipados, chaves estrangeiras com `ON DELETE CASCADE` e pooling transacional. |
| **RNF03** | **Performance e Tempo de Resposta (SLA)** | Execução Dinâmica Server-Side (`force-dynamic`) no Next.js 16 (Turbopack) com tempo de resposta **p95 < 250 ms** em produção comprovado em benchmark automatizado. |
| **RNF04** | **Confiabilidade da Visão Computacional** | Taxa global de acerto OMR comprovada de **100.00%** em suíte com 36 cenários de estresse e 185 questões (Caneta, Luz, Ângulo, Captura e Integridade). |
| **RNF05** | **Fidelidade de Impressão A4 Duplex** | Folhas e cadernos diagramados via regras CSS `@media print` com `page-break-inside: avoid` e verso em branco garantido para destaque seguro. |
| **RNF06** | **Segurança e Proteção de Dados (LGPD)** | Criptografia Bcrypt (custo 10) para senhas, sessão em cookie assinado via HMAC-SHA256 e validação rigorosa de payloads QR Code contra injeção. |
| **RNF07** | **Qualidade de Código e CI/CD** | Esteira automatizada no GitHub Actions com execução de linting TypeScript, compilação de produção e suíte de **303 testes automatizados (44 suítes)** em Jest 29. |
| **RNF08** | **Design Responsivo e Acessibilidade** | Interface moderna com Tailwind CSS e Lucide Icons, adaptável a computadores desktop, laptops e smartphones (mobile-first OMR). |
| **RNF09** | **Idempotência e Prevenção de Condições de Corrida** | Proteção contra double-submit em submissões de formulário e deduplicação de estado prevenindo registros duplicados na interface. |
| **RNF10** | **Compatibilidade e Exportação Multi-Plataforma** | Geração e download de arquivos em formatos padronizados do mercado (.xlsx via ExcelJS, .docx e PDF nativo). |

---

## 3. Especificação de Telas e Interfaces

| Identificador | Rota / Componente | Função Principal |
|---|---|---|
| **Tela 1: Autenticação & Troca de Senha** | `LoginScreen.tsx` / `ModalTrocarSenha.tsx` | Entrada institucional com credenciais de professor ou administrador, proteção por cookies assinados, alternância de visibilidade de senha (`Eye`/`EyeOff`) e modal de atualização de senha com validação de força. |
| **Tela 2: Gestão de Turmas & Fases** | `CadastrosTab.tsx` / `TurmasGrid.tsx` / `ModalTurma.tsx` | Cadastro e edição de turmas acadêmicas com atribuição de curso, semestre, seleção de fases curriculares (**1ª Fase a 10ª Fase**), código de convite único e proteção anti-duplicação. |
| **Tela 3: Gestão de Estudantes & Filiação** | `CadastrosTab.tsx` / `AlunosTable.tsx` / `ModalAluno.tsx` | Cadastro de alunos com herança OO, persistência de filiação (Mãe/Pai), data de nascimento (`YYYY-MM-DD`), endereço com ViaCEP, médias semestrais e situação acadêmica (Média $\ge$ 6.0). |
| **Tela 4: Montador de Provas & DisciplinaCombobox** | `MontadorTab.tsx` / `ModalQuestao.tsx` / `DisciplinaCombobox.tsx` | *Split-screen* com seletor interativo de disciplinas (hover com delay de 150ms), banco de questões por ciclo (N1/N2/N3/N-1), seleção de 1 a 30 questões e trava matemática estrita de 10,0 pts. |
| **Tela 5: Impressão & Caderno OMR** | `ImpressaoTab.tsx` / `OmrSheet.tsx` | Modelo oficial Católica SC com cabeçalho dinâmico por turma/professor, paginação frente/verso com folha em branco duplex, botão "Salvar em PDF" e exportação Word (.docx). |
| **Tela 6: Leitor Óptico Automático (Desktop)** | `CorrectionScanner.tsx` | Scanner OMR por câmera 100% automático com leitura de QR Code nominal, validação cruzada de turma, HUD de notas e fluxo de correção em lote simplificado. |
| **Tela 7: Relatórios Pedagógicos & Gestão de Notas** | `RelatoriosTab.tsx` | Cockpit interativo com histograma de acertos e distratores por questão, tabela analítica de leituras OMR, botão de exclusão de notas com modal seguro e estorno automático de médias. |
| **Tela 8: Provas Montadas** | `ProvasMontadasTab.tsx` / `ModalGabaritosEmbaralhados.tsx` | Visualização das provas congeladas, filtros por Turma/Etapa, consulta do gabarito oficial de cada caderno embaralhado, reimpressão A4 da prova/folha e botão "Abrir Scanner no Celular". |
| **Tela 9: Scanner OMR Mobile** | `MobileOmrScanner.tsx` | Viewport de câmera em tela cheia otimizado para celulares, feedback sonoro e de vibração, leitura de QR Code compacto `{"p","c"}`, conferência de acertos e bottom-sheet para salvar nota em `resultados_avaliacao`. |

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
        UC01(["UC01: Autenticar com Senha Segura e Visibilidade"])
        UC02(["UC02: Gerenciar Turmas com Fases Curriculares (1ª a 10ª)"])
        UC03(["UC03: Gerenciar Alunos, Filiação e Notas (Média ≥ 6.0)"])
        UC04(["UC04: Manter Banco de Questões e Fases"])
        UC05(["UC05: Selecionar Disciplinas via Combobox Interativo"])
        UC06(["UC06: Montar Avaliação (1 a 30 questões / 10.0 pts)"])
        UC07(["UC07: Configurar Embaralhamento Determinístico"])
        UC08(["UC08: Personalizar Cabeçalho e Orientações"])
        UC09(["UC09: Gerar Caderno e Gabarito Oficial A4 Duplex / PDF / Word"])
        UC10(["UC10: Escanear Cartão OMR via Câmera (Desktop / Mobile)"])
        UC11(["UC11: Validar QR Code e Identificar Turma/Aluno"])
        UC12(["UC12: Executar Validação Cruzada de Turma"])
        UC13(["UC13: Corrigir Prova e Validar Nota"])
        UC14(["UC14: Atualizar Nota da Etapa no Supabase"])
        UC15(["UC15: Consultar Cockpit Interativo e Análise de Distratores"])
        UC16(["UC16: Exportar Relatórios Multi-Abas em Excel (.xlsx)"])
        UC17(["UC17: Salvar Prova Montada com Cadernos Imutáveis"])
        UC18(["UC18: Excluir / Estornar Nota com Recálculo Imediato"])
    end

    Prof --> UC01
    Prof --> UC02
    Prof --> UC03
    Prof --> UC04
    Prof --> UC05
    Prof --> UC06
    Prof --> UC08
    Prof --> UC09
    Prof --> UC10
    Prof --> UC13
    Prof --> UC15
    Prof --> UC16
    Prof --> UC17
    Prof --> UC18

    Cam --> UC10

    UC06 -.->|include| UC07
    UC06 -.->|include| UC17
    UC10 -.->|include| UC11
    UC11 -.->|include| UC12
    UC13 -.->|include| UC14
    UC18 -.->|include| UC14
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
    P->>UI: Seleciona Turma via DisciplinaCombobox e Ciclo Avaliativo (N1, N2, N3 ou N-1)
    UI->>DB: Consulta banco de questões da turma e ciclo (com isolamento docente)
    DB-->>UI: Retorna questões do professor logado
    P->>UI: Seleciona de 1 a 30 questões (validação estrita de 10.0 pts)
    P->>UI: Personaliza cabeçalho institucional e clica em Imprimir / Salvar em PDF
    UI-->>P: Renderiza Folha OMR + Verso em Branco + Caderno A4 (TSK-54 / TSK-62)

    Note over P,DB: Fase 2: Aplicação Presencial e Reconhecimento Automático
    P->>UI: Posiciona o cartão-resposta na frente da câmera (Desktop ou Celular)
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
        +String fase
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
        +String dataNascimento
        +String mae
        +String pai
        +String naturalidade
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

### 4.6 Diagrama de Sequência UML (Blindagem Anti-Duplicação em 3 Camadas)

```mermaid
sequenceDiagram
    autonumber
    actor Docente as Professor
    participant Modal as Modal (Aluno / Questão / Turma)
    participant State as Estado React (setAlunos / setTurmas)
    participant Memo as Memo de Renderização (Visiveis)
    participant API as Backend Route & Controller
    participant DB as PostgreSQL (Supabase)

    Note over Docente,DB: Camada 1: Bloqueio de Double-Submit na UI
    Docente->>Modal: Clica em "Salvar" ou "Atualizar" (duplo-clique acidental)
    Modal->>Modal: Ativa estado salvando = true (desabilita botão + exibe spinner)
    Modal->>API: Dispara requisição HTTP única (POST/PUT)
    
    Note over Docente,DB: Camada 2: Deduplicação Atômica no Estado Reativo
    API->>DB: Persiste no banco de dados relacional
    DB-->>API: Retorna registro com id gerado
    API-->>Modal: Retorna HTTP 200/201 com item persistido
    Modal->>State: Executa setLista(prev => deduplicate(prev, item))
    State->>State: Verifica se id ou chave já existe na lista
    alt Registro já existia (Edição ou Retorno Concorrente)
        State->>State: Substitui item no mesmo índice (não duplica no array)
    else Novo Registro
        State->>State: Insere uma única vez no array de estado
    end

    Note over Docente,DB: Camada 3: Deduplicação Defensiva de Renderização
    State->>Memo: Notifica atualização de estado
    Memo->>Memo: Constrói Set de chaves únicas (Set<id>)
    Memo->>Memo: Filtra rigorosamente registros repetidos
    Memo-->>Docente: Renderiza tabela/grid sem nenhuma duplicidade visual
    Modal->>Modal: Restaura salvando = false e fecha modal com feedback
```

---

## 5. Persistência de Dados em Nuvem (Supabase & PostgreSQL)

### 5.1 Arquitetura de Dados Relacional e Prisma ORM
A persistência da aplicação é 100% realizada em banco de dados relacional **PostgreSQL 16 hospedado no Supabase**, gerenciado pelo **Prisma ORM (v5.22.0)**. O banco opera com isolamento rigoroso por docente (TSK-57), integridade referencial com chaves estrangeiras tipadas e remoção em cascata (`ON DELETE CASCADE`).

### 5.2 Catálogo Detalhado das Tabelas e Relações do Banco

1. **`usuarios`**: Entidade de autenticação docente e administrativa.
   - **Campos:** `id` (PK, UUID), `nome` (VARCHAR), `email` (VARCHAR, UNIQUE), `senha` (VARCHAR, Hash Bcrypt custo 10), `role` (ADMIN | PROFESSOR), `disciplina` (VARCHAR), `campus` (VARCHAR), `createdAt`, `updatedAt`.
   - **Relações:** 1:N com `turmas`, 1:N com `questoes`, 1:N com `provas_montadas`, 1:N com `leituras_omr`.

2. **`turmas`**: Turmas acadêmicas gerenciadas pelo professor, com fase curricular.
   - **Campos:** `id` (PK, UUID), `nome` (VARCHAR), `curso` (VARCHAR), `semestre` (VARCHAR), `fase` (VARCHAR: '1ª Fase' a '10ª Fase'), `codigoConvite` (VARCHAR, UNIQUE), `professorId` (FK $\rightarrow$ usuarios.id), `createdAt`, `updatedAt`.
   - **Relações:** 1:N com `alunos`, 1:N com `questoes`, 1:N com `provas_montadas`, 1:N com `leituras_omr`.

3. **`alunos`**: Estudantes matriculados com filiação, nascimento, notas e endereço.
   - **Campos:** `id` (PK, UUID), `nome` (VARCHAR), `ra` (VARCHAR, UNIQUE), `curso` (VARCHAR), `turno` (VARCHAR), `n1` (FLOAT), `n2` (FLOAT), `n3` (FLOAT), `contato` (JSONB com `celular`, `mae`, `pai`, `dataNascimento`, `naturalidade`, `estadoNatal`), `endereco` (JSONB), `turmaId` (FK $\rightarrow$ turmas.id), `createdAt`, `updatedAt`.
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

-- 2. Tabela de Turmas com Suporte a Fases Curriculares
CREATE TABLE IF NOT EXISTS "turmas" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(255) NOT NULL,
    "curso" VARCHAR(255) NOT NULL DEFAULT 'Engenharia de Software',
    "semestre" VARCHAR(50) NOT NULL DEFAULT '2026/2',
    "fase" VARCHAR(50) DEFAULT '1ª Fase',
    "codigoConvite" VARCHAR(50) UNIQUE NOT NULL,
    "professorId" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE RESTRICT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "turmas_professorId_idx" ON "turmas"("professorId");
CREATE INDEX IF NOT EXISTS "turmas_semestre_idx" ON "turmas"("semestre");

-- 3. Tabela de Alunos com Filiação e Dados Cadastrais
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

| PR # / Commit | Autor / Contribuidor | Branch / Escopo | Entregas e Impacto Técnico |
|:---:|:---:|:---:|:---|
| **36578c8** | **Agenor Alvise** (`@Agenorsc`) | `fix(turmas)` | **Compatibilidade e Blindagem de Repositório:** Restauração do contrato exato no `PrismaTurmaRepository.save` com garantia de aprovação de 100% dos testes de isolamento multi-tenant. |
| **177a6d3** | **Agenor Alvise** (`@Agenorsc`) | `fix(turmas)` | **Anti-Duplicação em Turmas:** Prevenção de double-submit em `ModalTurma`, deduplicação no estado React `setTurmas` e memo defensivo `turmasVisiveis` indexado por Set. |
| **cd0889f** | **Agenor Alvise** (`@Agenorsc`) | `fix(questoes)` | **Anti-Duplicação em Questões:** Bloqueio de duplo clique em `ModalQuestao`, deduplicação no banco de questões e indexação visual sem duplicidade. |
| **647b6eb** | **Agenor Alvise** (`@Agenorsc`) | `fix(cadastros)` | **Anti-Duplicação em Alunos:** Bloqueio de submissão dupla em `ModalAluno`, deduplicação por RA/ID em `setAlunos` e suíte de testes `AntiDuplicacaoAluno.test.tsx`. |
| **15907ba** | **Johnatan Vargas** (`@FonsecaJohnatan`) | `feat(turmas)` | **Fases Curriculares (1ª a 10ª Fase):** Campo `fase` no Prisma, DDL, `TurmaModel`, seleção visual em `ModalTurma`, exibição em grids e suíte `ModalTurmaFases.test.tsx`. |
| **022e6b8** | **Eric Ricardo Lange** (`@lange047`) | `fix(cadastros)` | **Filiação e Data de Nascimento:** Persistência integral de nome da mãe, nome do pai, naturalidade e data formatada `YYYY-MM-DD` em `PessoaModel`/`AlunoModel`. |
| **a1358f1** | **Agenor Alvise** (`@Agenorsc`) | `fix(cadastros)` | **Submissão Segura de Aluno:** Correção de execução de validações no browser e tratamento de escopo multi-tenant. |
| **171131b** | **Agenor Alvise** (`@Agenorsc`) | `feat(cadastros)` | **Componente `<DisciplinaCombobox />`:** Abertura suave por hover/clique, delay de 150ms contra fechamento acidental e auto-vinculação ao cadastro de discentes. |
| **63d8e11** | **Erick Andreas Pontecelli** (`@Erick-Andreas-Ponticelli`) | `fix(auth)` | **Visibilidade de Senha & Cadastro Docente:** Alternância de visualização (`Eye`/`EyeOff`), busca tolerante de e-mail e hashing Bcrypt no cadastro de professores. |
| **3431902** | **Agenor Alvise** (`@Agenorsc`) | `feat(relatorios)` | **Cockpit Analítico Interativo:** Unificação de taxa de acerto e distratores com histograma interativo e filtros por etapa. |
| **1e810c3** | **Edinei Junio Machado** (`@edineiJM`) | `feat(relatorios)` | **Status OMR nos Botões N1/N2/N3:** Exibição do status de conferência e abertura de modal de métricas detalhadas do aluno. |
| **073d8b6** | **Agenor Alvise** (`@Agenorsc`) | `feat(regras)` | **Critério Católica SC (Média $\ge$ 6.0) e PDF:** Parametrização regimental e botão direto "Salvar em PDF" na visualização de impressão A4. |
| [**PR #44**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/44) | **Agenor Alvise** (`@Agenorsc`) | `feat/tsk-44-refactor` | **TSK-44: Refatoração Arquitetural em 4 Camadas:** Desacoplamento integral de rotas HTTP em `Rota → Controller → Service → Repository` com `HttpError`. |
| [**PR #38**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/38) | **Agenor Alvise** (`@Agenorsc`) | `feat/tsk-57-isolamento` | **TSK-57: Isolamento por Docente no Backend:** Multi-tenancy estrito em nível de sessão, bloqueio `403 Forbidden` e ocultação de turmas órfãs. |
| [**PR #33**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/33) | **Eric Ricardo Lange** (`@lange047`) | `test/tsk-62-regressao-a4` | **TSK-62: Teste de Regressão de Impressão A4:** Roteiro formal de testes e evidências automatizadas de fidelidade de impressão duplex em folha A4. |
| [**PR #31**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/31) | **Eric Ricardo Lange** (`@lange047`) | `feat/tsk-56-sessao` | **TSK-56: Sessão Segura Server-Side:** Emissão de cookies `httpOnly` assinados com HMAC-SHA256 no login e validação perimetral no middleware `proxy.ts`. |
| [**PR #29**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/29) | **Eric Ricardo Lange** (`@lange047`) | `fix/tsk-62-impressao-a4` | **TSK-62: Preservação do Verso em Branco:** Correção CSS na folha de gabarito para destaque físico seguro sem vazamento no verso. |
| [**PR #28**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/28) | **Edinei Junio Machado** (`@edineiJM`) | `feat/tsk-59-cabecalho` | **TSK-59: Cabeçalho Dinâmico e 30 Questões:** Sincronização do cabeçalho da prova com professor/turma e suporte balanceado para até 30 questões. |
| [**PR #26**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/26) | **Edinei Junio Machado** (`@edineiJM`) | `tsk-46/omr-ux` | **TSK-46: OMR UX Minimalista:** Simplificação do fluxo de escaneamento em lote com transição ágil para o próximo estudante e feedback visual. |
| [**PR #24**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/24) | **Eric Ricardo Lange** (`@lange047`) | `feat/tsk-54-paginacao` | **TSK-54: Paginação sem Quebra de Questões:** Regras CSS `@media print` com `page-break-inside: avoid` impedindo itens partidos entre páginas A4. |
| [**PR #23**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/23) | **Erick Andreas Pontecelli** (`@Erick-Andreas-Ponticelli`) | `feat/seguranca-bcrypt` | **Segurança com Bcrypt:** Criptografia Bcrypt (custo 10), eliminação da senha legada 'admin', validação de força e modal de troca de senha. |
| [**PR #20**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/20) | **Agenor Alvise** (`@Agenorsc`) | `feat/tsk-61-latency` | **TSK-61: Benchmark de Latência e Índices B-Tree:** Comprovação de p95 < 250ms em todas as rotas dinâmicas e índices otimizados no Prisma. |
| [**PR #19**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/19) | **Agenor Alvise** (`@Agenorsc`) | `feat/tsk-36-relatorios` | **TSK-36: Dashboard de Relatórios & Distratores:** Gráficos interativos por turma e aluno, cálculo de distratores e descarte de dados mockados. |
| [**PR #17**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/17) | **Agenor Alvise** (`@Agenorsc`) | `feat/tsk-40-excel` | **TSK-40: Exportação Excel (.xlsx) Multi-Abas:** Geração de planilha institucional com 3 abas estruturadas (Notas, Espelho OMR e Distratores). |
| [**PR #16**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/16) | **Edinei Junio Machado** (`@edineiJM`) | `feat/tsk-45-acuracia` | **TSK-45 / RNF04: Teste de Acurácia OMR com 36 Cenários:** Calibração dos limiares da `GridOmrEngine` atingindo 100% de precisão nos testes de estresse. |
| [**PR #15**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/15) | **Johnatan Vargas** (`@FonsecaJohnatan`) | `feat/estatisticas` | **Estatísticas por Questão:** Endpoint `/api/estatisticas/questoes` para levantamento estatístico de acertos por item avaliativo. |
| [**PR #13**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/13) | **Johnatan Vargas** (`@FonsecaJohnatan`) | `feat/banco-ciclos` | **Banco por Turma e Ciclos:** Segmentação de questões por disciplina e agrupamento automático na etapa N-1. |
| [**PR #12**](https://github.com/Agenorsc/SGP-CATOLICA-NEXT/pull/12) | **Eric Ricardo Lange** (`@lange047`) | `feat/montador-ciclos` | **Montador por Ciclos:** Interface visual adaptada com contadores em tempo real para N1, N2, N3 e Exame. |

---

### 6.2 Quadro de Evidências por Integrante da Equipe

#### 🟢 Agenor Alvise (`@Agenorsc`)
- **Blindagem Anti-Duplicação em 3 Camadas:** Arquitetura defensiva completa impedindo a duplicação de alunos, questões e turmas através de travas visuais de double-submit, deduplicação atômica no estado React e memos de renderização com indexação por `Set`.
- **Componente `<DisciplinaCombobox />` Interativo:** Criação do componente com animação de hover, delay de 150ms no fechamento, busca em tempo real e auto-vinculação.
- **Provas Montadas, Scanner OMR Mobile & Gestão de Notas com Exclusão:** Módulo completo de snapshots de provas, geração determinística de cadernos embaralhados (`cadernos_prova`) com pré-cálculo de `gabarito_oficial_json`, scanner OMR mobile responsivo com retorno tátil/sonoro e bottom-sheet, exclusão segura de notas com estorno automático e recálculo instantâneo de estatísticas.
- **Arquitetura em Camadas (TSK-44):** Refatoração integral do backend estruturando as rotas em `Rota → Controller → Service → Repository` com tratamento de erro padronizado (`HttpError`, `ForbiddenError`, `NotFoundError`).
- **Isolamento de Docente no Backend (TSK-57):** Implementação de regras multi-tenancy protegendo turmas, estudantes, questões, leituras e exames, com bloqueio `403` a recursos alheios e ocultação de turmas órfãs.
- **SLA de Performance e Benchmarking (TSK-61 / RNF03):** Otimização de consultas com índices B-Tree e comprovação de `p95 < 250ms` em todas as rotas dinâmicas.
- **Cockpit de Distratores e Exportação Excel (TSK-36 / TSK-40):** Dashboard analítico de frequência de erros por alternativa, histograma interativo e exportador de planilhas `.xlsx` multi-abas.

#### 🔵 Johnatan Vargas da Fonseca (`@FonsecaJohnatan`)
- **Gestão de Turmas com Fases Curriculares:** Implementação do suporte a fases (1ª a 10ª Fase) na criação e edição de turmas, garantindo a integridade dos dados acadêmicos.
- **Banco de Questões por Ciclos:** Implementação da segmentação de questões por turma e ciclos avaliativos (N1, N2, N3 e N-1) no PR #13.
- **Estatísticas por Questão:** Criação do endpoint analítico de acertos e erros no PR #15.
- **Auditoria OMR e Governança:** Módulo de inspeção de espelhos OMR e governança documental de entregas no repositório.

#### 🟣 Eric Ricardo Lange (`@lange047`)
- **Persistência de Filiação e Dados do Estudante:** Estruturação e persistência de nome da mãe, pai, data de nascimento (`YYYY-MM-DD`), naturalidade e endereço nos modelos `PessoaModel` e `AlunoModel`.
- **Infraestrutura de Sessão Segura (TSK-56):** Substituição de sessão em localStorage por cookies `httpOnly` assinados com HMAC-SHA256 validados em `proxy.ts` (PR #31).
- **Engenharia de Impressão A4 (TSK-54 / TSK-62):** Regras de paginação física evitando corte de questões entre folhas e preservação do verso em branco para destaque do gabarito (PR #24, PR #29 e PR #33).
- **Modelagem Orientada a Objetos:** Entidades de domínio com herança (`PessoaModel` $\rightarrow$ `AlunoModel`), consumo ViaCEP e montador por ciclos (PR #12).

#### 🟠 Erick Andreas Pontecelli (`@Erick-Andreas-Ponticelli`)
- **Segurança Criptográfica Bcrypt & Visibilidade de Senha:** Hashing Bcrypt para credenciais, migração do seed eliminando a senha padrão fraca 'admin', funcionalidade de alternância de visibilidade (`Eye`/`EyeOff`) no login e cadastros e módulo de troca de senha com validação de força.
- **Controle de Acesso RBAC:** Proteção de rotas administrativas e docentes com validação de permissões.
- **Algoritmos Determinísticos:** Implementação do embaralhamento determinístico Fisher-Yates com sementes auditáveis de 64 bits por versão de prova.

#### 🔴 Edinei Junio Machado (`@edineiJM`)
- **Acurácia OMR de Alta Precisão (TSK-45 / RNF04):** Construção da suíte de teste de acurácia com 36 cenários em 5 categorias e taxa comprovada de 100.00% de acerto (PR #16).
- **Cabeçalho Dinâmico e 30 Questões (TSK-59):** Suporte completo para até 30 questões no gabarito e injeção dinâmica de professor e turma no cabeçalho institucional (PR #28).
- **OMR UX Minimalista (TSK-46):** Simplificação do fluxo de escaneamento em lote para agilizar a rotina de correção docente e status OMR nas etapas (PR #26).

---

## 7. Arquitetura em Camadas Desacopladas (TSK-44) & Qualidade

### 7.1 Fluxo Rota → Controller → Service → Repository

A aplicação implementa rigorosamente a separação de responsabilidades em camadas desacopladas:

$$\text{Cliente / HTTP} \longrightarrow \mathbf{Rota} \longrightarrow \mathbf{Controller} \longrightarrow \mathbf{Service} \longrightarrow \mathbf{Repository} \longrightarrow \mathbf{Banco\ PostgreSQL\ (Prisma)}$$

1. **Rota (`src/app/api/.../route.ts`):** Ponto de entrada do Next.js App Router. Não contém lógica de negócio nem chamadas de banco de dados; apenas despacha a chamada para o Controller.
2. **Controller (`src/controllers/...`):** Extrai parâmetros da requisição HTTP (`request`), cookies de sessão, query params e body JSON. Trata erros com status HTTP semânticos (`200`, `201`, `400`, `403`, `404`, `500`) usando a infraestrutura de `HttpError`.
3. **Service (`src/services/...`):** Contém todas as regras de domínio, validações acadêmicas, validação de limites (teto de 30 questões, soma de 10,0 pontos, média $\ge$ 6.0), algoritmos OMR e a aplicação estrita do isolamento multilocatário por docente da sessão.
4. **Repository (`src/repositories/...`):** Realiza a persistência relacional através do Prisma Client (`PrismaTurmaRepository`, `PrismaAlunoRepository`, `PrismaQuestionRepository`, `PrismaOmrRepository`, `PrismaCadernoRepository`, `PrismaResultadoRepository`) com interfaces abstratas tipadas.

### 7.2 Estrutura de Diretórios

```text
C:\SGP-CATOLICA-NEXT\src/
├── app/                        # [Camada 1: Rotas HTTP / Next.js 16 App Router]
│   ├── api/
│   │   ├── turmas/             # route.ts e [id]/route.ts (Delega para TurmaController)
│   │   ├── alunos/             # route.ts, [id]/route.ts e import/route.ts
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
│   ├── TurmaService.ts         # Regras de turmas, fases e isolamento docente
│   ├── AlunoService.ts         # Validações cadastrais, filiação e notas
│   ├── AlunoImportService.ts   # Importação em lote de estudantes
│   ├── QuestionService.ts      # Banco de questões, ciclos e pontuações
│   ├── OmrService.ts           # Reconhecimento óptico, validação cruzada e HUD
│   ├── ExamService.ts          # Embaralhamento determinístico e montagem de cadernos
│   ├── ResultadoService.ts     # Gravação de notas OMR e exclusão com estorno
│   ├── RelatoriosService.ts    # Agregação estatística e cockpit analítico
│   ├── QuestionStatisticsService.ts # Análise de distratores e acertos
│   ├── ProfessorService.ts     # Gestão docente e hashes de senha
│   ├── AuthService.ts          # Validação de credenciais e autenticação
│   ├── ExportService.ts        # Geração de planilhas Excel (.xlsx) multi-abas
│   ├── WordExportService.ts    # Geração de avaliações em Word (.docx)
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
│   ├── cadastros/              # CadastrosTab.tsx, ModalAluno.tsx, ModalTurma.tsx, DisciplinaCombobox.tsx
│   ├── provas/                 # ProvasMontadasTab.tsx e ModalGabaritosEmbaralhados.tsx
│   ├── leitura/                # MobileOmrScanner.tsx (Câmera mobile-first com QR Code)
│   ├── montador/               # MontadorTab.tsx, ModalQuestao.tsx
│   ├── impressao/              # ImpressaoTab.tsx (Geração de cadernos A4, QR compacto e PDF)
│   ├── relatorios/             # RelatoriosTab.tsx (Cockpit analítico e gestão de notas)
│   └── ...
│
├── models/                     # [Camada 5: Entidades de Domínio e Herança OO]
│   ├── PessoaModel.ts          # Entidade base (nome, filiação, contato, endereço)
│   ├── AlunoModel.ts           # Herança de PessoaModel com notas N1, N2, N3 e média
│   ├── TurmaModel.ts           # Turma com fase curricular e gerador de códigos
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

### 7.3 Execução Local e Testes Automatizados (303 Testes Verdes)

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

#### Cobertura Consolidada dos Testes Automatizados (44 Suítes de Teste):
```text
PASS __tests__/services/OmrAccuracyBenchmark.test.ts (44.659 s)
PASS __tests__/api/IsolamentoDocenteBackend.test.ts
PASS __tests__/frontend/AntiDuplicacaoAluno.test.tsx
PASS __tests__/frontend/AntiDuplicacaoQuestao.test.tsx
PASS __tests__/frontend/AntiDuplicacaoTurma.test.tsx
PASS __tests__/frontend/DisciplinaCombobox.test.tsx
PASS __tests__/frontend/ModalTurmaFases.test.tsx
PASS __tests__/frontend/CockpitAnaliseQuestoes.test.tsx
PASS __tests__/frontend/LeitorOmrFunctionalTSK47.test.tsx
PASS __tests__/frontend/ImpressaoTab.test.tsx
PASS __tests__/frontend/LoginScreen.test.tsx
PASS __tests__/frontend/MontadorTab.test.tsx
PASS __tests__/frontend/RelatoriosTab.test.tsx
PASS __tests__/frontend/LeituraTab.test.tsx
PASS __tests__/services/GridOmrEngine.test.ts
PASS __tests__/services/CartaoOmrEngine.test.ts
PASS __tests__/services/OmrQrDivergenceValidation.test.ts
PASS __tests__/services/OmrService.test.ts
PASS __tests__/services/LeitorOmrFunctionalTSK47.test.ts
PASS __tests__/services/AuthService.test.ts
PASS __tests__/services/ProfessorService.test.ts
PASS __tests__/services/AlunoService.test.ts
PASS __tests__/services/AlunoImportService.test.ts
PASS __tests__/services/AlunoImportIntegration.test.ts
PASS __tests__/services/QuestionService.test.ts
PASS __tests__/services/QuestionStatisticsService.test.ts
PASS __tests__/services/ExamService.test.ts
PASS __tests__/services/ExamServiceSnapshots.test.ts
PASS __tests__/services/MontadorCadernoGabaritoTSK60.test.ts
PASS __tests__/services/DistratoresEDashboardRelatorios.test.ts
PASS __tests__/services/RelatoriosService.test.ts
PASS __tests__/services/ExportService.test.ts
PASS __tests__/services/WordExportService.test.ts
PASS __tests__/services/Gabarito30Questoes.test.ts
PASS __tests__/models/AlunoModel.test.ts
PASS __tests__/print/TSK62PrintContract.test.ts
PASS __tests__/api/ApiLatencyBenchmark.test.ts
PASS __tests__/api/LoginRoute.test.ts
PASS __tests__/api/SessionRoutes.test.ts
PASS __tests__/api/TrocarSenhaRoute.test.ts
PASS __tests__/api/AlunoImportRoute.test.ts
PASS __tests__/api/ResultadosRoute.test.ts
PASS __tests__/api/estatisticasQuestoesRoute.test.ts
PASS __tests__/frontend/MontadorCadernoGabaritoTSK60.test.tsx

Test Suites: 44 passed, 44 total
Tests:       303 passed, 303 total
Snapshots:   0 total
Time:        ~48 s
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

### 7.5 Relatório de Acurácia do Leitor OMR (TSK-45 / RNF04)

```text
====================================================================================
RELATÓRIO CONSOLIDADO DE ACURÁCIA DO LEITOR OMR (TSK-45 / RNF04 - QUALIDADE N3)
====================================================================================
Total de Cenários Avaliados: 36 (Mínimo exigido: 30)
Total de Questões Avaliadas: 185
Total de Acertos:            185
Total de Falhas/Erros:       0
TAXA GLOBAL DE ACERTO:       100.00% (Meta RNF04: > 99.00%)
------------------------------------------------------------------------------------
DESEMPENHO POR CATEGORIA DE VARIAÇÃO:
  * CANETA      : 8 cenários | 40 questões | 40 acertos | Taxa: 100.00%
  * LUZ         : 8 cenários | 40 questões | 40 acertos | Taxa: 100.00%
  * ANGULO      : 8 cenários | 40 questões | 40 acertos | Taxa: 100.00%
  * CAPTURA     : 6 cenários | 36 questões | 36 acertos | Taxa: 100.00%
  * INTEGRIDADE : 6 cenários | 29 questões | 29 acertos | Taxa: 100.00%
====================================================================================
```

### 7.6 Isolamento Multi-Tenancy por Docente no Backend (TSK-57)

O sistema garante que docentes nunca acessem dados de colegas ou turmas sem professor (órfãs):
- `GET /api/turmas`: Professores recebem exclusivamente suas turmas (`professorId = session.id`).
- `GET /api/alunos`: Acesso filtrado pelos estudantes das turmas do docente.
- `GET /api/questoes`: Questões associadas ao docente ou às suas turmas.
- `GET /api/omr`: Leituras das turmas do professor.
- `GET /api/relatorios`: Agregação semestral consolidada restrita ao escopo do docente autenticado.
- Bloqueio com status `403 Forbidden` disparado imediatamente em qualquer tentativa de consulta, inserção ou exclusão de recursos de outros professores.

---

## 8. Considerações Finais

O desenvolvimento do **SGP Católica** cumpriu com rigor e excelência a totalidade dos requisitos didático-pedagógicos e de engenharia de software:

1. **Padrão Arquitetural em 4 Camadas:** Implementação autêntica de `Rota → Controller → Service → Repository`, garantindo clareza de responsabilidades, alta testabilidade e facilidade de manutenção;
2. **Blindagem e Integridade de Dados:** Proteção anti-duplicação em 3 camadas, persistência completa de dados de filiação discente e gestão de fases curriculares (1ª a 10ª Fase);
3. **Isolamento e Segurança Institucional:** Multi-tenancy no backend, senhas protegidas com Bcrypt, cookies assinados e restrição estrita de dados por professor;
4. **Desempenho Comprovado:** Latência p95 muito abaixo de 250ms com execução dinâmica server-side e índices B-Tree no PostgreSQL;
5. **Precisão de Reconhecimento Óptico:** Leitura OMR por câmera com acurácia de 100.00% nos 36 cenários de estresse e suporte mobile-first;
6. **Governança e Trabalho em Equipe:** Rastreabilidade completa com todas as entregas catalogadas, atribuídas nominalmente a cada membro e **100% dos 303 testes unitários aprovados em 44 suítes de teste**.

---

### Configuração do `.env` para usar o banco localmente

Para executar a aplicação local conectada ao PostgreSQL do Supabase, crie um arquivo chamado `.env` na raiz do projeto. Esse arquivo é ignorado pelo Git e não deve ser commitado, pois contém credenciais sensíveis.

No painel do Supabase, acesse **Project Settings → Database → Connect** e copie as strings de conexão do PostgreSQL:

```env
DATABASE_URL="postgresql://postgres.ubmhvuhbyiugrdykhcfe:[YOUR-PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ubmhvuhbyiugrdykhcfe:[YOUR-PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
```

Substitua os placeholders `[YOUR-PASSWORD]` pelos valores reais do projeto.

Valide a configuração com:

```bash
npx prisma validate
npx prisma migrate status
npx prisma generate
npm run dev
```

Em banco compartilhado ou de produção, não execute `prisma migrate dev` nem comandos de reset. Novas migrações devem passar pelo fluxo formal de PR do projeto.

---

<div align="center">
  <sub>Centro Universitário Católica de Santa Catarina — Engenharia de Software 2026</sub>
</div>
