<div align="center">

#  SGP - Sistema de Geração e Correção de Provas

**Plataforma web componentizada para criação flexível de avaliações, embaralhamento dinâmico de versões, impressão com gabarito OMR integrado e correção automatizada via leitura de QR Code.**

 **Link do sistema que vai ser hospedado:** https://sgp-catolica.vercel.app

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-F5A623?style=flat-square)
![Entrega](https://img.shields.io/badge/entrega%20atual-N1-3D348B?style=flat-square)
![Licença](https://img.shields.io/badge/licença-uso%20acadêmico-7B4FA6?style=flat-square)

</div>

---

##  Equipe

| Nome completo | Papel / principais frentes no projeto |
|---|---|
| Agenor Alvise| Front-end das telas de aplicação, geração de layout OMR, Jest e CI/CD |
| JOHNATAN VARGAS DA FONSECA | Front-end de autenticação, banco de questões, turmas e manipulação de mocks |
| Eric Ricardo lang:
| Erick Andreas Pontecelli:
| Edinei Junio Machado: Levantamento de requisitos, arquitetura em camadas, documentação e Git |

---

##  Sumário

- 1. Visão Geral
- 2. Requisitos
- 2.1 Funcionais (RF)
- 2.2 Não Funcionais (RNF)
- 3. Telas do Sistema
- 4. Stack Tecnológica
- 5. Estrutura de Pastas
- 6. Como Executar o Projeto
- 7. Testes e CI/CD
- 8. Equipe e Contribuições

---

## 1. Visão Geral

O **SGP (Sistema de Geração e Correção de Provas)** foi concebido para eliminar o trabalho repetitivo de correção manual enfrentado pelo corpo docente do Centro Universitário Católica SC[cite: 1, 2]. 

A plataforma viabiliza a criação de avaliações com até 20 questões e pontuações personalizadas, gera versões embaralhadas aleatoriamente (na ordem de questões e na disposição das alternativas de A a E)[cite: 1, 2], emite folhas de resposta com marcadores ópticos e QR Code exclusivo para identificação nominal ou anônima[cite: 1, 3], além de produzir relatórios estatísticos e diagnósticos pedagógicos de distratores[cite: 1, 2].

---

## 2. Requisitos

### 2.1 Funcionais (RF)

| Código | Requisito |
|---|---|
| **RF01** | O sistema deve autenticar usuários separando docentes (`@catolicasc.org.br`) e estudantes (`@catolicasc.edu.br`)[cite: 1]. |
| **RF02** | O sistema deve permitir ao professor gerenciar questões objetivas (2 a 5 alternativas com uma correta) e discursivas[cite: 1]. |
| **RF03** | O sistema deve permitir a criação de turmas com código de convite (`inviteCode`) auto-regenerável[cite: 1]. |
| **RF04** | O sistema deve permitir a composição de provas com até 20 questões e pontuação individual livre[cite: 1]. |
| **RF05** | O sistema deve associar uma prova a uma turma criando instâncias de aplicação independentes[cite: 1]. |
| **RF06** | O sistema deve permitir a geração de caderno consolidado com múltiplas versões em layout pronto para impressão[cite: 1]. |
| **RF07** | O sistema deve aplicar embaralhamento independente para questões e alternativas por versão[cite: 1, 2]. |
| **RF08** | O sistema deve materializar e persistir a matriz de layout embaralhado de cada versão[cite: 1]. |
| **RF09** | O sistema deve suportar geração com identificação prévia do aluno (QR Code nominal) ou anônima[cite: 1]. |
| **RF10** | O sistema deve gerar cartões-resposta padronizados com marcadores de calibração para leitura óptica (OMR)[cite: 1, 3]. |
| **RF11** | O sistema deve permitir publicação de gabarito e cálculo automático de notas objetivas[cite: 1]. |
| **RF12** | O sistema deve suportar exportação de relatórios de notas em arquivo `.csv`[cite: 1, 2]. |
| **RF13** | O sistema deve gerar análise pedagógica identificando as alternativas incorretas mais assinaladas pela turma[cite: 2]. |
| **RF14** | O sistema deve garantir a anonimização de dados sob demanda em conformidade com a LGPD[cite: 1]. |

### 2.2 Não Funcionais (RNF)

| Código | Requisito |
|---|---|
| **RNF01** | **Arquitetura em 5 Camadas:** O backend segue o fluxo estrutural `Rota → Controle → Serviço → Repositório → Model`[cite: 4]. |
| **RNF02** | **Desempenho:** Resposta da API p95 < 300ms[cite: 1]. |
| **RNF03** | **Disponibilidade:** Disponibilidade de 99,5%[cite: 1]. |
| **RNF04** | **Operação Offline:** Suporte a cache de gabarito e fila de sincronização com deduplicação via `clientCorrectionId`[cite: 1]. |
| **RNF05** | **Confiabilidade OMR:** Taxa de erro na leitura óptica inferior a 1% em condições normais[cite: 1]. |
| **RNF06** | **Segurança:** Isolamento restrito de acesso a dados entre estudantes[cite: 1, 5]. |

---

## 3. Telas do Sistema

### 3.1 Banco de Questões
![Banco de Questões](docs/telas/tela-questoes.png)
*Listagem de questões cadastradas com filtros, badges de tags e pontuações individuais.*

### 3.2 Gestão de Turmas
![Gestão de Turmas](docs/telas/tela-turmas.png)
*Administração de turmas ativas, alunos matriculados e código de convite para auto-matrícula.*

### 3.3 Configuração da Prova & Embaralhamento
![Configuração de Aplicação](docs/telas/tela-aplicacao.png)
*Painel de parametrização de versões, embaralhamento de alternativas e identificação nominal.*

### 3.4 Folha de Resposta & Gabarito OMR
![Folha de Resposta](docs/telas/tela-gabarito.png)
*Layout de impressão com marcadores de calibração, QR Code exclusivo e grade de respostas.*

### 3.5 Relatório de Notas e Análise Pedagógica
![Relatórios e Análise](docs/telas/tela-relatorios.png)
*Consolidação de notas corrigidas, exportação em planilha CSV e diagnóstico de distratores[cite: 3].*

---

## 4. Stack Tecnológica

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)

* **Next.js 14 (App Router):** Framework React para interface e rotas de API server-side[cite: 3].
* **TypeScript:** Tipagem estática para entidades, layouts e serviços[cite: 3].
* **Tailwind CSS:** Estilização com design system adaptado às regras de impressão (`@media print`)[cite: 3].
* **Jest & Testing Library:** Execução de testes unitários automatizados[cite: 3].
* **Lucide React:** Biblioteca de ícones utilitários[cite: 3].

---

## 5. Estrutura de Pastas

sgp-catolica-next/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # Pipeline automatizado de CI/CD no GitHub Actions
├── docs/
│   ├── adr/                   # Decisões Arquiteturais (N2/N3)
│   ├── api/                   # Especificação dos endpoints
│   ├── arquitetura/           # Diagramas de camadas
│   ├── modelo-dados/          # Modelagem MER/DER
│   ├── telas/                 # Capturas de tela para validação e documentação
│   └── uml/                   # Diagramas UML (Casos de Uso e Classes)
├── src/
│   ├── app/
│   │   ├── api/exams/generate/# Rota de API Next.js para geração de versões
│   │   ├── globals.css        # Estilos globais Tailwind
│   │   ├── layout.tsx         # Root Layout da aplicação
│   │   └── page.tsx           # Aplicação SPA componentizada com todas as abas
│   ├── components/
│   │   ├── layout/            # Cabeçalho e navegação
│   │   └── omr/               # Componente de renderização do gabarito OMR
│   ├── controllers/           # Camada de controle e validação de entrada
│   ├── models/                # Entidades e estruturação de layouts
│   ├── repositories/          # Isolamento de dados
│   ├── services/              # Regras de negócio e embaralhamento determinístico
│   └── types/                 # Interfaces e tipos TypeScript
├── tests/
│   └── services/
│       └── ExamService.test.ts # Testes unitários com Jest
├── jest.config.js             # Configurações do ambiente de testes
├── package.json
└── README.md


## 6. Como Executar o Projeto

### Pré-requisitos
* Node.js v20.x ou superior instalado[cite: 3].
* NPM (gerenciador de pacotes).

### Passos

1. Clone o repositório ou acesse a pasta do projeto:
   ```bash
   cd sgp-catolica-next


    1.  Instale as dependências:

Bash
npm install

    2. Inicie o servidor de desenvolvimento:

Bash
npm run dev

    3. Acesse no navegador:

http://localhost:3000
7. Testes e CI/CD
O projeto conta com suíte de testes unitários cobrindo as regras centrais de negócio do serviço ExamService (limite de 20 questões, formato do payload do QR Code e embaralhamento de alternativas)[cite: 1]:

Bash
# Executar todos os testes
npm test

# Executar com relatório de cobertura
npm run test:coverage
A esteira de integração contínua (CI/CD) via GitHub Actions valida a cada push ou pull request na branch main:

Instalação limpa de dependências (npm ci).

Execução e aprovação da suíte de testes unitários com Jest.

Compilação da build de produção do Next.js (npm run build).

8. Equipe e Contribuições
Agenor Alvise: Construção das interfaces de montagem de prova, visualização do gabarito para impressão, testes com Jest e CI/CD[cite: 3].

JOHNATAN VARGAS DA FONSECA: Desenvolvimento da tela de gestão de turmas, banco de questões e estrutura de dados mockados[cite: 3].

Eric Ricardo lang:
Erick Andreas Pontecelli:
Edinei Junio Machado: Levantamento de requisitos, arquitetura em camadas, elaboração do README.md e organização do Git[cite: 3].