<div align="center">

# CENTRO UNIVERSITÁRIO CATÓLICA DE SANTA CATARINA
### CURSO DE BACHARELADO EM ENGENHARIA DE SOFTWARE
### DISCIPLINA DE ENGENHARIA DE SOFTWARE / ARQUITETURA DE SOFTWARE

---

# SISTEMA DE GERAÇÃO E CORREÇÃO DE PROVAS (SGP CATÓLICA)
### Relatório Técnico e Documentação Oficial — Avaliação N2 (Parte 1)

🌐 **Aplicação em Produção:** https://sgp-catolica-next.vercel.app/

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Jest](https://img.shields.io/badge/Jest_29-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_22_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_DDL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

![Status](https://img.shields.io/badge/status-entregue%20N2%20Parte%201-success?style=flat-square)
![Avaliação](https://img.shields.io/badge/cliente-Prof.%20Me.%20Samuel-blue?style=flat-square)
![Arquitetura](https://img.shields.io/badge/arquitetura-5%20Camadas%20Desacopladas-007ACC?style=flat-square)

**Jaraguá do Sul – SC | 2026**

</div>

---

## 👥 Equipe de Desenvolvimento e Matriz de Autores

| Integrante | Papel / Especialidade Principal |
|---|---|
| **Agenor Alvise** | Front-end das telas de aplicação, diagramação para impressão frente/verso, gabaritos OMR, testes unitários com Jest, pipeline de CI/CD e arquitetura em camadas |
| **Johnatan Vargas da Fonseca** | Front-end do módulo de turmas, banco de questões, manipulação de mocks e inspeção de espelho OMR |
| **Eric Ricardo Lange** | Modelagem das entidades de dados orientadas a objetos, regras de validação, consumo ViaCEP e componentes |
| **Erick Andreas Pontecelli** | Algoritmos determinísticos de embaralhamento com sementes, matrizes OMR e leitura óptica via câmera |
| **Edinei Junio Machado** | Levantamento de requisitos com o cliente Samuel, arquitetura em camadas, modelagem UML, DDL SQL e gestão do Git |

**Docente Avaliador / Cliente:** Prof. Me. Samuel  
**Orientação Docente:** Corpo Docente do Curso de Engenharia de Software – Católica SC

---

## 📖 Resumo

O presente relatório acadêmico documenta a análise técnica, os requisitos funcionais e não funcionais, a arquitetura de software em 5 camadas, o projeto de persistência relacional e a modelagem formal em Linguagem de Modelagem Unificada (UML) do **Sistema de Geração e Correção de Provas (SGP)**, desenvolvido sob a stack moderna **Next.js 16, React 19, TypeScript e Tailwind CSS** para o **Centro Universitário Católica de Santa Catarina (Católica SC)**. 

A solução visa sanar a sobrecarga operacional docente decorrente da correção manual de ciclos com 200 a 400 avaliações, viabilizando:
1. Composição dinâmica de avaliações em split-screen com até 20 questões;
2. Embaralhamento determinístico e independente de questões e alternativas por versão com sementes auditáveis;
3. Motor de diagramação inteligente frente e verso com folha de respostas OMR destacável e inserção automática de página em branco no verso (em caso de página ímpar);
4. Módulo de correção automatizada por visão computacional e leitura de QR Code em tempo real via câmera/webcam (`html5-qrcode`);
5. Cálculo proporcional e atualização automática imediata da nota avaliativa N2;
6. Painel de diagnóstico pedagógico com análise de distratores;
7. Consolidação de notas e histórico longitudinal da turma para o corpo docente com exportação de dados em planilhas CSV e Excel.

Este documento apresenta os **quatro diagramas UML basilares (Casos de Uso, Atividades com Raias, Classes de Domínio e Sequência)** com o detalhamento analítico passo a passo conforme as diretrizes pedagógicas institucionais, além da especificação DDL SQL (`schema-n2.sql`) para persistência relacional e a divisão de atribuições da equipe fundamentada em Pull Requests (PRs) rastreáveis para o Diário de Bordo acadêmico.

**Palavras-chave:** Engenharia de Software. Modelagem UML. Reconhecimento Óptico de Marcas (OMR). Next.js. Arquitetura em Camadas. Gestão Docente de Avaliações.

---

## 📑 Sumário

- [1. Introdução](#1-introdução)
  - [1.1 Contexto e Justificativa do Projeto](#11-contexto-e-justificativa-do-projeto)
  - [1.2 Delimitação do Problema](#12-delimitação-do-problema)
  - [1.3 Objetivos Geral e Específicos](#13-objetivos-geral-e-específicos)
- [2. Engenharia de Requisitos do Sistema](#2-engenharia-de-requisitos-do-sistema)
  - [2.1 Requisitos Funcionais (RF01 a RF16)](#21-requisitos-funcionais-rf)
  - [2.2 Requisitos Não Funcionais (RNF01 a RNF07)](#22-requisitos-não-funcionais-rnf)
- [3. Especificação de Telas Página por Página](#3-especificação-de-telas-página-por-página)
  - [3.1 Mapeamento Detalhado das Telas do Sistema](#31-mapeamento-detalhado-das-telas-do-sistema)
  - [3.2 Detalhamento Funcional das Telas (com Capturas)](#32-detalhamento-funcional-das-telas-com-capturas)
- [4. Modelagem UML Completa com Passo a Passo](#4-modelagem-uml-completa-com-passo-a-passo)
  - [4.1 Diagrama de Casos de Uso (Passo a Passo e Representação Gráfica)](#41-diagrama-de-casos-de-uso)
  - [4.2 Diagrama de Atividades com Raias (Passo a Passo e Representação Gráfica)](#42-diagrama-de-atividades-com-raias-swimlanes)
  - [4.3 Diagrama de Classes de Domínio (Passo a Passo e Representação Gráfica)](#43-diagrama-de-classes-de-domínio)
  - [4.4 Diagrama de Sequência UML (Passo a Passo e Representação Gráfica)](#44-diagrama-de-sequência-uml)
- [5. Projeto de Persistência em Banco de Dados Relacional (SQL)](#5-projeto-de-persistência-em-banco-de-dados-relacional-sql)
  - [5.1 Justificativa da Migração e Modelo de Dados Normalizado (3FN)](#51-justificativa-da-migração-e-modelo-de-dados-normalizado-3fn)
  - [5.2 Estrutura do Esquema Relacional (schema-n2.sql)](#52-estrutura-do-esquema-relacional-schema-n2sql)
- [6. Gestão da Equipe, Diário de Bordo e Registro de PRs](#6-gestão-da-equipe-diário-de-bordo-e-registro-de-prs)
  - [6.1 Divisão de Tarefas da Equipe (Tabela de PRs)](#61-divisão-de-tarefas-da-equipe)
  - [6.2 Fluxo Git e Rastreabilidade](#62-fluxo-git-e-rastreabilidade)
- [7. Arquitetura de Software em 5 Camadas](#7-arquitetura-de-software-em-5-camadas)
  - [7.1 Estrutura de Diretórios](#71-estrutura-de-diretórios)
  - [7.2 Como Executar o Projeto Localmente](#72-como-executar-o-projeto-localmente)
  - [7.3 Testes Automatizados e CI/CD](#73-testes-automatizados-e-cicd)
- [8. Considerações Finais](#8-considerações-finais)
- [9. Referências](#9-referências)

---

## 1. Introdução

### 1.1 Contexto e Justificativa do Projeto
No contexto universitário contemporâneo, a elaboração, a aplicação e a correção de avaliações somativas e formativas demandam um tempo substancial do corpo docente. No **Centro Universitário Católica de Santa Catarina (Católica SC)**, especificamente nos cursos das áreas de Tecnologia da Informação e Engenharias, o docente Samuel gerencia múltiplos módulos acadêmicos com contingentes que totalizam de **200 a 400 alunos por ciclo de provas**.

A operacionalização manual dessas avaliações acarreta gargalos críticos:
- **Elevado risco de fraudes ou "colas"** pela aplicação de provas com ordenação idêntica a turmas volumosas;
- **Desperdício de papel** decorrente da ausência de diagramação gráfica otimizada em formato frente e verso;
- **Inviabilidade pedagógica** de o estudante levar o caderno de questões para casa no dia da aplicação da avaliação;
- **Fadiga cognitiva e falhas humanas** na correção manual de centenas de cartões-resposta;
- **Morosidade na compilação estatística** das médias semestrais e na identificação pedagógica de distratores mais assinalados.

Para sanar tais deficiências, concebeu-se o **Sistema de Geração e Correção de Provas (SGP)**, uma plataforma web full-stack desenvolvida em Next.js 16, React 19, TypeScript e Tailwind CSS, orientada a componentes modulares e estruturada sob os pilares da Engenharia de Software como ferramenta de alta produtividade para o corpo docente.

### 1.2 Delimitação do Problema
O desafio central consiste em estruturar um fluxo integrado que une a elaboração de provas personalizadas, a diagramação gráfica inteligente para impressão física, o embaralhamento determinístico auditável, a leitura óptica rápida e de baixo custo via câmera ou webcam com QR Code, e a devolução imediata do diagnóstico ao docente (visão pedagógica de distratores, consolidação de notas N1, N2 e N3 e exportação estruturada).

### 1.3 Objetivos Geral e Específicos

#### 1.3.1 Objetivo Geral
Desenvolver e modelar arquiteturalmente um sistema full-stack componentizado para automação integral do ciclo de avaliação acadêmica da Católica SC, abrangendo desde a composição e impressão de cadernos e gabaritos OMR até a correção óptica por QR Code e consolidação de relatórios docentes de desempenho escolar.

#### 1.3.2 Objetivos Específicos
- Modelar formalmente o sistema utilizando **quatro diagramas UML padronizados (Casos de Uso, Atividades com raias, Classes e Sequência)**, expondo o raciocínio dedutivo de elaboração passo a passo;
- Catalogar e documentar os requisitos funcionais e não funcionais que sustentam a aplicação;
- Especificar funcionalmente cada tela do sistema, detalhando a interface administrativa e pedagógica do docente;
- Conceber o modelo relacional de banco de dados SQL (PostgreSQL), preparando a aplicação para substituir os mocks e estados locais por uma camada transacional robusta;
- Estabelecer uma divisão transparente de tarefas para os cinco integrantes do grupo, ancorada em Pull Requests (PRs) e evidências para o diário de bordo acadêmico.

---

## 2. Engenharia de Requisitos do Sistema

### 2.1 Requisitos Funcionais (RF)

| Código | Descrição do Requisito | Ator Principal | Prioridade |
|---|---|---|---|
| **RF01** | **Autenticação Docente:** O sistema deve autenticar o usuário docente (`@catolicasc.org.br`) garantindo acesso seguro ao painel administrativo. | Docente | Essencial |
| **RF02** | **Gestão do Banco de Questões:** Cadastro e manutenção de questões objetivas (2 a 5 alternativas) e discursivas com pontuações personalizadas e tags temáticas. | Docente | Essencial |
| **RF03** | **Gestão de Turmas:** Administração de turmas acadêmicas com auto-geração de código de convite institucional (`codigoConvite`). | Docente | Importante |
| **RF04** | **Cadastro Discente com Herança OO:** Cadastro de estudantes utilizando herança de classes (`PessoaModel` → `AlunoModel`), filiação e busca automática de endereço via CEP (ViaCEP). | Docente | Importante |
| **RF05** | **Montador Split-Screen:** Interface de montagem de avaliações em split-screen com limite estrito de até 20 questões por prova e cálculo de nota máxima em tempo real. | Docente | Essencial |
| **RF06** | **Embaralhamento Determinístico:** Aplicação de algoritmos determinísticos com sementes (`seeds`) para alternância independente da ordem de questões e alternativas por versão. | Docente | Essencial |
| **RF07** | **Materialização do Layout:** Materialização e persistência da matriz de layout de cada versão gerada (`ExamVersionLayout`). | Sistema | Essencial |
| **RF08** | **Separação Física de Folhas:** Separação física entre a folha de respostas OMR e o caderno descritivo de questões para o estudante levar para casa. | Sistema | Essencial |
| **RF09** | **Paginação Inteligente com Verso em Branco:** Inserção automática de página em branco no verso do gabarito em caso de número ímpar para viabilizar o destaque sem perda de questões. | Sistema | Essencial |
| **RF10** | **Folha OMR Padronizada:** Geração da folha OMR com 4 marcadores fiduciais nos cantos e QR Code identificador (nominal ou anônimo). | Sistema | Essencial |
| **RF11** | **Leitura e Correção Óptica:** Captura de quadros em tempo real via câmera/webcam (`html5-qrcode`) e simulador OMR para leitura óptica e decodificação do QR Code. | Docente / Scanner | Essencial |
| **RF12** | **Cálculo e Atualização da Nota N2:** Comparação automática com o gabarito oficial da versão lida, cálculo proporcional da nota e atualização atômica e imediata da nota N2 do aluno. | Sistema | Essencial |
| **RF13** | **Diagnóstico de Distratores:** Painel pedagógico identificando a alternativa incorreta mais assinalada por questão para subsidiar revisões docentes. | Docente / Sistema | Importante |
| **RF14** | **Consolidação Semestral de Notas:** Cálculo automatizado da média semestral `(N1 + N2 + N3) / 3` e definição do status acadêmico (`Aprovado`, `Exame`, `Reprovado`). | Docente | Importante |
| **RF15** | **Exportação de Relatórios:** Exportação de dados consolidados e histórico de avaliações em formatos `.csv` e planilha compatível com Excel. | Docente | Desejável |
| **RF16** | **Inspeção e Auditoria do Espelho OMR:** O professor deve poder abrir e inspecionar o espelho detalhado de respostas capturadas de qualquer aluno para auditoria e eventuais ajustes. | Docente | Essencial |

### 2.2 Requisitos Não Funcionais (RNF)

| Código | Categoria | Descrição Técnica |
|---|---|---|
| **RNF01** | **Padrão Arquitetural** | Arquitetura desacoplada em 5 camadas: `Rota (Route) → Controle (Controller) → Serviço (Service) → Repositório (Repository) → Modelo (Model)`, seguindo o padrão canônico da Católica SC. |
| **RNF02** | **Desempenho** | Tempo de resposta da API p95 < 300 ms para geração simultânea de até 50 versões de avaliações com compilação Next.js Turbopack. |
| **RNF03** | **Disponibilidade** | Disponibilidade mínima acordada de 99,5% durante ciclos de aplicação de provas, hospedado na infraestrutura Vercel. |
| **RNF04** | **Operação Offline** | Tolerância a desconexões de rede com fila de leitura idempotente baseada em identificador único (`clientCorrectionId`). |
| **RNF05** | **Confiabilidade OMR** | Taxa de erro de leitura óptica inferior a 1% sob condições regulares de contraste e iluminação utilizando marcadores de calibração. |
| **RNF06** | **Segurança e LGPD** | Isolamento rigoroso de acesso e garantia de opções de anonimização nominal sob demanda em conformidade com a LGPD. |
| **RNF07** | **Compatibilidade de Impressão** | Diagramação estrita em folha A4 com regras CSS `@media print` para ocultar barras de navegação e formatar quebras de página físicas. |

---

## 3. Especificação de Telas Página por Página

### 3.1 Mapeamento Detalhado das Telas do Sistema

| Identificador da Tela | Perfil | Componente / Arquivo Base | Principais Funcionalidades |
|---|---|---|---|
| **Tela 1: Login Docente** | Docente | `LoginScreen.tsx` | Entrada de e-mail institucional do professor (`@catolicasc.org.br`), validação e persistência de sessão em `localStorage`. |
| **Tela 2: Cadastros (Turmas)** | Docente | `CadastrosTab.tsx` / `TurmasGrid.tsx` | Criação de turma, curso, semestre letivo, geração de código de convite (`codigoConvite`) e listagem de matriculados. |
| **Tela 3: Cadastros (Alunos)** | Docente | `CadastrosTab.tsx` / `AlunosTable.tsx` | Cadastro com dados pessoais, endereço com busca via CEP (ViaCEP), filiação, notas (N1, N2, N3) e status acadêmico. |
| **Tela 4: Montador de Provas** | Docente | `MontadorTab.tsx` / `ModalQuestao.tsx` | Interface split-screen: banco de questões à esquerda e composição com até 20 itens à direita, tags e soma de pontos. |
| **Tela 5: Impressão e Caderno OMR** | Docente | `ImpressaoTab.tsx` / `OmrSheet.tsx` | Visualização da folha OMR com QR Code e calibração; caderno frente e verso; inserção de folha em branco; impressão via `@media print`. |
| **Tela 6: Leitura e Correção OMR** | Docente | `LeituraTab.tsx` | Câmera em tempo real (`html5-qrcode`) e simulador OMR; correção automática imediata e atualização da nota N2. |
| **Tela 7: Relatórios e Estatísticas** | Docente | `RelatoriosTab.tsx` | Indicadores de média da turma, análise de distratores, tabela de notas gerais N1/N2/N3 e exportação CSV/Excel. |
| **Tela 8: Inspeção do Espelho OMR** | Docente | `RelatoriosTab.tsx` / `LeituraTab.tsx` | Abertura do espelho de respostas de qualquer aluno da turma para auditoria do gabarito e conferência de notas. |

---

### 3.2 Detalhamento Funcional das Telas (com Capturas)

#### 3.2.1 Tela 1: Login e Autenticação do Professor
Fornece acesso autenticado exclusivo para o corpo docente com e-mail institucional (`@catolicasc.org.br`). Inclui validação de campos protegidos, feedback visual de erro e persistência da sessão local.

<div align="center">
  <img src="docs/telas/Tela-Login.png" alt="Tela de Login do Professor" width="750" />
  <p><em>Figura — Tela de Login Institucional Docente</em></p>
</div>

---

#### 3.2.2 Telas 2 e 3: Cadastros Gerais de Turmas e Estudantes
Estrutura a base acadêmica institucional. Na aba de turmas, permite criar matérias com código de convite exclusivo (ex: `CAT-8842`) e visualizar os matriculados. Na aba de alunos, implementa orientação a objetos com herança (`PessoaModel` → `AlunoModel`), consulta automática de endereço via CEP (ViaCEP), controle das etapas avaliativas (N1, N2, N3), cálculo de média semestral e definição do status (`Aprovado`, `Exame`, `Reprovado`).

<div align="center">
  <img src="docs/telas/tela-turmas.png" alt="Tela de Gestão de Turmas" width="750" />
  <p><em>Figura — Painel de Gestão de Turmas Acadêmicas e Códigos de Convite</em></p>
</div>

<div align="center">
  <img src="docs/telas/Tela-Aluno-Nota.png" alt="Tela de Gestão de Alunos e Notas" width="750" />
  <p><em>Figura — Listagem de Alunos com Notas N1, N2, N3, Médias e Status</em></p>
</div>

---

#### 3.2.3 Tela 4: Montador de Provas em Split-Screen
Permite selecionar questões no painel esquerdo com busca textual e filtros por tags temáticas (`#Arquitetura`, `#PostgreSQL`, `#OMR`), adicionando-as ao caderno de prova no painel direito. O sistema valida o teto estrito de 20 questões por prova, totaliza a pontuação máxima em tempo real e oferece controles de alternância independente para o embaralhamento de questões e alternativas.

<div align="center">
  <img src="docs/telas/tela-aplicacao.png" alt="Montador de Provas Split-Screen" width="750" />
  <p><em>Figura — Montador de Provas Split-Screen com Parâmetros de Embaralhamento</em></p>
</div>

<div align="center">
  <img src="docs/telas/tela-questoes.png" alt="Banco de Questões" width="750" />
  <p><em>Figura — Banco de Questões com Filtros Dinâmicos e Cadastro de Alternativas</em></p>
</div>

---

#### 3.2.4 Tela 5: Impressão, Paginação Inteligente e Caderno OMR
Gera as versões nominais da avaliação com QR Code individual e 4 marcadores fiduciais nos cantos para leitura óptica precisa. A paginação inteligente insere uma folha em branco após o gabarito caso o número de páginas seja ímpar, assegurando que o aluno possa destacar a folha OMR no dia da prova e levar o caderno de questões para casa sem rasuras.

<div align="center">
  <img src="docs/telas/tela-gabarito.png" alt="Folha de Gabarito OMR e Caderno" width="750" />
  <p><em>Figura — Folha de Respostas OMR com Marcadores Fiduciais e QR Code</em></p>
</div>

---

#### 3.2.5 Telas 6, 7 e 8: Leitura Óptica OMR, Relatórios Pedagógicos e Espelho de Respostas
Integra a câmera do dispositivo via biblioteca `html5-qrcode` para escanear instantaneamente a folha de respostas. O sistema decodifica o QR Code, identifica a versão da prova, compara as bolhas preenchidas com o gabarito oficial da versão, calcula a nota proporcional e atualiza imediatamente a nota N2 do aluno no sistema, consolidando indicadores de desempenho e diagnóstico de distratores.

<div align="center">
  <img src="docs/telas/tela-relatorios.png" alt="Relatórios e Diagnóstico de Distratores" width="750" />
  <p><em>Figura — Relatórios de Desempenho, Análise de Distratores e Exportação CSV</em></p>
</div>

---

## 4. Modelagem UML Completa com Passo a Passo

Conforme as diretrizes pedagógicas institucionais da Católica SC para a avaliação N2 Parte 1, detalha-se a concepção analítica e gráfica dos **quatro diagramas UML padronizados**, acompanhados do passo a passo dedutivo de elaboração.

---

### 4.1 Diagrama de Casos de Uso

#### 4.1.1 Passo 1A – Análise do Cenário ("Caça aos Atores e Ações")
A análise textual dos requisitos e do sistema permitiu isolar os atores que interagem diretamente com o software:

| Ator | Tipo de Ator | Papel e Responsabilidades no Sistema SGP |
|---|---|---|
| **Professor (Docente)** | Ator Principal (Humano) | Cadastra turmas, gerencia alunos e notas, compõe o banco de questões, monta e parametriza avaliações, dispara a impressão física, realiza a leitura dos cartões OMR via câmera, analisa distratores, inspeciona espelhos e exporta relatórios. |
| **Câmera / Scanner** | Ator Secundário (Hardware) | Captura os fluxos de vídeo da folha OMR e encaminha os quadros gráficos ao leitor de QR Code e marcas ópticas. |

> **Nota Metodológica:** O estudante participa como agente do processo físico da avaliação presencial (resolvendo a prova no papel e preenchendo as bolhas a caneta), não operando diretamente a plataforma de software.

**Ações extraídas:** Autenticar no Sistema, Gerenciar Turmas, Gerenciar Alunos e Notas (N1, N2, N3), Manter Banco de Questões, Montar Avaliação (Split-Screen), Configurar Embaralhamento, Gerar Caderno e Gabarito OMR, Imprimir Provas Frente/Verso, Escanear Cartão-Resposta OMR, Corrigir Prova e Atualizar N2, Consultar Relatórios e Distratores, Inspecionar Espelho OMR do Aluno e Exportar Notas e Relatório em CSV/Excel.

#### 4.1.2 Representação Gráfica Oficial (Figura 1)

<div align="center">
  <img src="docs/diagramas/figura1-casos-de-uso.png" alt="Figura 1 - Diagrama de Casos de Uso SGP Católica SC" width="800" />
  <p><strong>Figura 1 – Diagrama de Casos de Uso do Sistema SGP Católica SC</strong> (Auto: AGENOR ALVISE)</p>
</div>

---

### 4.2 Diagrama de Atividades com Raias (Swimlanes)

#### 4.2.1 Passo 2A – Análise do Fluxo Cronológico e Mapeamento de Raias
O fluxo do processo avaliativo envolve quatro raias com transferência contínua de responsabilidades:

| Raia (Swimlane) | Responsabilidades no Processo |
|---|---|
| **Professor** | Montar prova no split-screen, parametrizar regras, imprimir cadernos/OMR, aplicar avaliação presencial, acionar leitura via câmera, analisar confirmação de notas e consultar relatórios. |
| **Sistema SGP (Full-Stack)** | Embaralhar itens determinísticamente, diagramar frente/verso inserindo folha em branco se ímpar, decodificar QR Code, comparar com gabarito e calcular notas. |
| **Banco de Dados SQL** | Persistir layouts materializados, salvar logs OMR com idempotência e atualizar atomicamente a nota N2 no cadastro do aluno. |
| **Aluno (Agente Físico)** | Resolver prova no caderno descritivo, preencher gabarito a caneta, entregar folha OMR ao professor e levar o caderno para casa. |

**Decisão lógica central:** Ocorre na raia do Sistema SGP: caso a leitura óptica do cartão e do QR Code seja conclusiva, o sistema computa os acertos e atualiza a nota N2; caso ocorra falha de foco ou enquadramento, emite alerta e o professor reajusta o cartão.

#### 4.2.2 Representação Gráfica Oficial (Figura 2)

<div align="center">
  <img src="docs/diagramas/figura2-atividades.png" alt="Figura 2 - Diagrama de Atividades com Raias do Ciclo Avaliativo" width="850" />
  <p><strong>Figura 2 – Diagrama de Atividades com Raias (Swimlanes) do Ciclo Avaliativo</strong> (Autor: EDINEI JUNIO MACHADO )</p>
</div>

---

### 4.3 Diagrama de Classes de Domínio

#### 4.3.1 Passo 3A – Extração de Entidades ("Truque do Detetive")
Através da extração de substantivos do código-fonte e regras de negócio, catalogaram-se as classes fundamentais: `PessoaModel`, `AlunoModel` (herança), `TurmaModel`, `Question`, `Alternative`, `ExamVersionLayout`, `ExamService`, `LeituraOMRRegistro` e `RelatorioDesempenho`.

| Origem | Destino | Tipo de Relação | Multiplicidades | Significado Semântico |
|---|---|---|---|---|
| `TurmaModel` | `AlunoModel` | Associação Simples | `1` para `0..*` | Uma turma possui vários alunos matriculados. |
| `Question` | `Alternative` | Composição | `1` para `2..5` | Questão objetiva possui estritamente de 2 a 5 alternativas. |
| `ExamVersionLayout` | `Question` | Agregação | `1` para `1..20` | Versão de prova agrega de 1 até 20 questões do banco. |
| `AlunoModel` | `ExamVersionLayout` | Associação Simples | `1` para `0..1` | Aluno recebe uma versão nominal específica por prova. |
| `AlunoModel` | `LeituraOMRRegistro` | Associação Simples | `1` para `0..*` | Aluno possui histórico cronológico de provas corrigidas. |
| `ExamVersionLayout` | `LeituraOMRRegistro` | Associação Simples | `1` para `0..1` | Cada leitura é orientada pelo layout de uma versão. |
| `RelatorioDesempenho` | `LeituraOMRRegistro` | Agregação | `1` para `0..*` | Relatório agrega o conjunto de leituras de uma avaliação. |

#### 4.3.2 Representação Gráfica Oficial (Figura 3)

<div align="center">
  <img src="docs/diagramas/figura3-classes.png" alt="Figura 3 - Diagrama de Classes UML do Domínio do SGP" width="850" />
  <p><strong>Figura 3 – Diagrama de Classes UML do Domínio do SGP</strong> (Autor: ERIC RICARDO LANGE )</p>
</div>

---

### 4.4 Diagrama de Sequência UML

#### 4.4.1 Passo 4A – Análise do Cenário de Leitura OMR e Atualização N2
O cenário modela a dinâmica temporal entre o **Professor**, o componente **CameraScanner (`html5-qrcode`)**, o **ExamController**, o **ExamService** e o **Banco de Dados (SQL)**. No bloco alternativo (`alt`), verifica-se o sucesso na validação do QR Code e cálculo da nota, disparando a atualização da nota N2 no banco de dados e habilitando a consulta e visualização dos dados consolidados diretamente no painel do docente.

#### 4.4.2 Representação Gráfica Oficial (Figura 4)

<div align="center">
  <img src="docs/diagramas/figura4-sequencia.png" alt="Figura 4 - Diagrama de Sequência UML Leitura OMR e Atualização N2" width="850" />
  <p><strong>Figura 4 – Diagrama de Sequência UML: Leitura OMR, Correção Automatizada e Atualização da Nota N2</strong> (Autor: ERICK ANDREAS PONTECELLI  )</p>
</div>

---

## 5. Projeto de Persistência em Banco de Dados Relacional (SQL)

### 5.1 Justificativa da Migração e Modelo de Dados Normalizado (3FN)
Para suportar a escala real de centenas de estudantes e assegurar auditabilidade das avaliações, o SGP foi modelado para migrar de mocks em memória para um SGBD relacional (**PostgreSQL**). O modelo normalizado em Terceira Forma Normal (**3FN**) resolve:
- A **persistência determinística das versões de avaliação** (tabelas `questoes_versao` e `alternativas_versao`), materializando a ordem exata das questões e alternativas sorteadas;
- A **garantia de idempotência na correção offline** via chave `client_correction_id`, impedindo que uma mesma prova seja computada duas vezes caso o dispositivo reconecte à rede;
- A **integridade referencial estrita** com chaves primárias (`UUID` / `SERIAL`) e chaves estrangeiras (`FOREIGN KEY`) com deleção em cascata controlada.

### 5.2 Estrutura do Esquema Relacional (`schema-n2.sql`)
O esquema foi materializado em **11 tabelas interligadas** no script [`docs/schema-n2.sql`](docs/schema-n2.sql):

1. **`usuarios`**: Autenticação institucional do corpo docente (`@catolicasc.org.br`);
2. **`turmas`**: Gestão de turmas acadêmicas com código de convite autogerado (`invite_code`);
3. **`alunos`**: Herança de dados pessoais, filiação, endereço via CEP e histórico de notas N1, N2, N3;
4. **`questoes`**: Banco de questões objetivas e discursivas com pontuação e tags temáticas;
5. **`alternativas`**: Textos das opções de resposta (A a E) e indicação booleana da correta;
6. **`avaliacoes`**: Parametrização geral da prova e regras de embaralhamento;
7. **`versoes_avaliacao`**: Registro da versão de prova com QR Code e discente vinculado;
8. **`questoes_versao`**: Mapeamento da ordem física das questões em cada versão materializada;
9. **`alternativas_versao`**: Mapeamento da ordem embaralhada das alternativas por versão;
10. **`leituras_omr`**: Histórico de correções ópticas com timestamp, acertos e nota calculada;
11. **`respostas_leitura`**: Espelho detalhado das alternativas assinaladas pelo estudante no cartão para auditoria.

---

## 6. Gestão da Equipe, Diário de Bordo e Registro de PRs

### 6.1 Divisão de Tarefas da Equipe (Tabela de PRs)

Para cumprir a exigência docente de evidenciação clara de atividades individuais para o diário de bordo acadêmico, estruturou-se uma matriz de trabalho especializada por integrante, rastreada por Pull Requests (PRs):

| PR # | Branch de Trabalho | Integrante Responsável | Escopo Técnico da Entrega | Evidência de Validação para o Diário de Bordo |
|:---:|---|---|---|---|
| **PR #01** | `feature/ci-cd-and-omr-print` | **Agenor Alvise** | CI/CD no GitHub Actions, layout frente/verso e folha OMR A4 via CSS `@media print`. | Pipeline verde no Actions e impressão de gabarito sem quebras indevidas de página. |
| **PR #02** | `feature/turmas-e-questoes` | **Johnatan Vargas da Fonseca** | Gestão de turmas com código de convite e banco de questões com filtros dinâmicos. | Split-screen funcional e cadastro dinâmico de turmas. |
| **PR #03** | `feature/domain-models-viacep` | **Eric Ricardo Lange** | Modelagem OO (`PessoaModel` → `AlunoModel`), cálculo de média semestral e consumo da API ViaCEP. | Preenchimento automático por CEP e cálculo de status acadêmico (`Aprovado`/`Exame`). |
| **PR #04** | `feature/omr-scanner-camera` | **Erick Andreas Pontecelli** | Algoritmo determinístico de shuffle com seed e leitura óptica via câmera (`html5-qrcode`). | Reconhecimento óptico ao vivo e atualização da nota N2 do aluno. |
| **PR #05** | `feature/abnt-docs-and-sql-schema` | **Edinei Junio Machado** | Relatório acadêmico ABNT, modelagem UML formal e DDL SQL relacional (`schema-n2.sql`). | Documento acadêmico completo e integridade do script SQL PostgreSQL. |
| **PR #06** | `feature/inspecao-espelho-omr` | **Johnatan Vargas da Fonseca** | Módulo de inspeção do espelho OMR e ajuste manual de notas pelo professor. | Acesso do docente ao espelho detalhado com opções de auditoria. |

### 6.2 Fluxo Git e Rastreabilidade
O repositório adota o modelo de ramificação **Git Flow simplificado**, com proteção de branch na `main`. Todo código integrado passa obrigatoriamente pela esteira automatizada de CI/CD, que valida compilação, suíte de testes unitários Jest e linters antes da aprovação do merge.

---

## 7. Arquitetura de Software em 5 Camadas

Em conformidade estrita com o **Requisito Não Funcional RNF01**, o projeto implementa o padrão canônico da Católica SC de **Arquitetura em 5 Camadas Desacopladas**:

$$\text{Rota / UI} \longrightarrow \text{Controle (Controller)} \longrightarrow \text{Serviço (Service)} \longrightarrow \text{Repositório (Repository)} \longrightarrow \text{Modelo (Model)}$$

### 7.1 Estrutura de Diretórios

```text
C:\SGP-CATOLICA-NEXT\src/
├── models/                     # [Camada 1: Modelos de Domínio]
│   ├── PessoaModel.ts          # Classe base de pessoa (dados pessoais, contato, endereço)
│   ├── AlunoModel.ts           # Entidade Aluno (herança, cálculo de média e status)
│   ├── TurmaModel.ts           # Entidade Turma e gerador de códigos de convite
│   ├── ExamModel.ts            # Entidade de diagramação determinística de avaliações
│   └── index.ts                # Barrel export dos modelos
│
├── repositories/               # [Camada 2: Repositórios / Acesso a Dados]
│   ├── AlunoRepository.ts      # Repositório de estudantes (CRUD e filtros por turma/RA)
│   ├── TurmaRepository.ts      # Repositório de turmas acadêmicas
│   ├── QuestionRepository.ts   # Repositório do banco de questões
│   ├── OmrRepository.ts        # Repositório de registros de leituras ópticas OMR
│   ├── ExamRepository.ts       # Repositório de integração de exames
│   └── index.ts                # Barrel export dos repositórios
│
├── services/                   # [Camada 3: Serviços / Regras de Negócio]
│   ├── AlunoService.ts         # Regras de estudantes, médias e taxas de aprovação
│   ├── TurmaService.ts         # Regras de turmas e validação de convites
│   ├── QuestionService.ts      # Validação de teto (máx. 20 questões) e pontuação total
│   ├── OmrService.ts           # Decodificação de QR Code, correção OMR e nota N2
│   ├── ExportService.ts        # Geração e download de relatórios em formato CSV
│   ├── ExamService.ts          # Algoritmo determinístico de embaralhamento com seed
│   └── index.ts                # Barrel export dos serviços
│
├── controllers/                # [Camada 4: Controladores / Orquestração]
│   ├── AlunoController.ts      # Orquestrador de requisições de alunos
│   ├── TurmaController.ts      # Orquestrador de requisições de turmas
│   ├── QuestionController.ts   # Orquestrador de requisições de questões
│   ├── OmrController.ts        # Orquestrador de correções OMR
│   ├── ExamController.ts       # Orquestrador de geração de avaliações
│   └── index.ts                # Barrel export dos controladores
│
├── components/                 # [Camada 5: Apresentação Componentizada]
│   ├── cadastros/              # CadastrosTab, AlunosTable, TurmasGrid, ModalAluno, ModalTurma
│   ├── montador/               # MontadorTab, ModalQuestao
│   ├── impressao/              # ImpressaoTab, gabarito e caderno de questões
│   ├── leitura/                # LeituraTab (câmera Html5Qrcode e simulação)
│   ├── relatorios/             # RelatoriosTab (médias, distratores e CSV)
│   ├── layout/                 # Sidebar e Header institucionais
│   ├── common/                 # QRCodeWrapper seguro contra SSR
│   ├── auth/LoginScreen.tsx    # Tela de autenticação docente
│   └── omr/OmrSheet.tsx        # Folha de respostas avulsa
│
├── app/
│   ├── api/exams/generate/     # Endpoint REST para geração de exames
│   ├── globals.css             # Estilos Tailwind e regras @media print
│   ├── layout.tsx              # Layout raiz da aplicação
│   └── page.tsx                # Orquestrador enxuto e declarativo das abas
│
├── types/index.ts              # Contratos e interfaces TypeScript
└── docs/
    ├── diagramas/              # Imagens oficiais dos 4 diagramas UML
    ├── telas/                  # Capturas de tela comprobatórias da aplicação
    └── schema-n2.sql           # DDL SQL PostgreSQL completo

# 1. Clonar o repositório
git clone [https://github.com/Agenorsc/SGP-CATOLICA-NEXT.git](https://github.com/Agenorsc/SGP-CATOLICA-NEXT.git)
cd SGP-CATOLICA-NEXT

# 2. Instalar dependências (utiliza .npmrc configurado)
npm install

# 3. Executar o servidor de desenvolvimento
npm run dev

# Executar todos os testes
npm test

# Executar testes com relatório de cobertura
npm run test:coverage

PASS __tests__/services/ExamService.test.ts
  ExamService - Regras de Negócio e Embaralhamento
    √ deve instanciar o serviço com sucesso
    √ deve lançar erro quando o número de questões na prova exceder o limite de 20
    √ deve gerar uma versão para cada estudante matriculado
    √ deve gerar QR Code com matrícula e dados do aluno quando withStudentIdentification for verdadeiro
    √ deve gerar QR Code anônimo e student nulo quando withStudentIdentification for falso
    √ deve manter todas as alternativas e a resposta correta ao embaralhar alternativas
    √ deve embaralhar array de forma determinística usando seed

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total



