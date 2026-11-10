import { 
  AlunoModel, 
  TurmaModel 
} from '@/models';
import { 
  LeituraOMRRegistro, 
  Question, 
  ProvaMontadaRegistro,
  RelatorioGeralTurma,
  RelatorioIndividualAluno,
  ItemEstatisticaQuestao,
  DistratorFrequencia,
  EvolucaoEtapaAluno,
  QuestaoHistoricoAluno,
  AvaliacaoCiclo
} from '@/types';

export class RelatoriosService {
  /**
   * Pipeline de Agregação Estatística Completo para a Turma
   */
  static gerarRelatorioTurma(params: {
    turmaId: string;
    alunos: AlunoModel[];
    turmas: TurmaModel[];
    leiturasOMR: LeituraOMRRegistro[];
    provasMontadas?: ProvaMontadaRegistro[];
    bancoQuestoes?: Question[];
    filtroCiclo?: AvaliacaoCiclo | 'TODAS';
    filtroSemestre?: string;
  }): RelatorioGeralTurma {
    const { 
      turmaId, 
      alunos, 
      turmas, 
      leiturasOMR, 
      provasMontadas = [], 
      bancoQuestoes = [],
      filtroCiclo = 'TODAS',
      filtroSemestre
    } = params;

    // 1. Filtragem de Turmas e Alunos
    const turmaObj = turmas.find(t => t.id === turmaId);
    const turmaNome = turmaId === 'TODAS' 
      ? 'Todas as Turmas (Visão Consolidada)' 
      : (turmaObj?.nome || 'Turma Selecionada');
    const semestre = turmaObj?.semestre || filtroSemestre || '2026/2';
    const disciplina = turmaObj 
      ? (turmaObj.curso ? `${turmaObj.nome} (${turmaObj.curso})` : turmaObj.nome)
      : (filtroSemestre ? `Todas as Turmas - Semestre ${filtroSemestre}` : 'Consolidado Geral');

    // Alunos pertencentes ao escopo selecionado
    const alunosFiltrados = turmaId === 'TODAS'
      ? alunos
      : alunos.filter(a => a.turmaId === turmaId);

    // Leituras OMR associadas
    const leiturasFiltradas = leiturasOMR.filter(l => {
      if (turmaId !== 'TODAS' && l.turmaId && l.turmaId !== turmaId) return false;
      if (filtroCiclo !== 'TODAS' && l.stage && l.stage !== filtroCiclo) return false;
      return true;
    });

    // 2. Mapeamento de Médias Coletivas por Etapa para Evolução Temporal
    const mediasPorEtapa: Record<'N1' | 'N2' | 'N3', number> = {
      N1: 0,
      N2: 0,
      N3: 0
    };

    if (alunosFiltrados.length > 0) {
      const somaN1 = alunosFiltrados.reduce((acc, a) => acc + (a.n1 || 0), 0);
      const somaN2 = alunosFiltrados.reduce((acc, a) => acc + (a.n2 || 0), 0);
      const somaN3 = alunosFiltrados.reduce((acc, a) => acc + (a.n3 || 0), 0);

      mediasPorEtapa.N1 = Number((somaN1 / alunosFiltrados.length).toFixed(1));
      mediasPorEtapa.N2 = Number((somaN2 / alunosFiltrados.length).toFixed(1));
      mediasPorEtapa.N3 = Number((somaN3 / alunosFiltrados.length).toFixed(1));
    }

    // 3. Taxa média de acertos da turma (%)
    let totalAcertosTurma = 0;
    let totalItensAvaliadosTurma = 0;
    leiturasFiltradas.forEach(l => {
      totalAcertosTurma += (l.acertos || 0);
      totalItensAvaliadosTurma += (l.totalQuestoes || 0);
    });
    const taxaAcertoMediaTurma = totalItensAvaliadosTurma > 0
      ? Number(((totalAcertosTurma / totalItensAvaliadosTurma) * 100).toFixed(1))
      : 70.0;

    // 4. Construção da Visão Individual por Aluno (Drilldown)
    const alunosConsolidado: RelatorioIndividualAluno[] = alunosFiltrados.map(aluno => {
      // Leituras deste estudante
      const leiturasDoAluno = leiturasFiltradas.filter(
        l => l.alunoId === aluno.id || (l.ra && aluno.ra && l.ra.trim() === aluno.ra.trim())
      );

      let acertosAluno = 0;
      let totalItensAluno = 0;
      const mapaDeQuestoes: QuestaoHistoricoAluno[] = [];

      leiturasDoAluno.forEach(leitura => {
        acertosAluno += (leitura.acertos || 0);
        totalItensAluno += (leitura.totalQuestoes || 0);

        if (Array.isArray(leitura.detalhesQuestoes) && leitura.detalhesQuestoes.length > 0) {
          leitura.detalhesQuestoes.forEach(det => {
            // Tenta localizar enunciado no banco ou no snapshot
            const questaoOrig = bancoQuestoes.find(q => q.id === (det as any).questionId) ||
              provasMontadas.flatMap(p => p.questoesSnapshot).find(q => q.enunciado);

            mapaDeQuestoes.push({
              numero: det.numero,
              enunciado: questaoOrig?.enunciado || `Questão ${det.numero < 10 ? '0' : ''}${det.numero}`,
              respostaAluno: det.respostaMarcada,
              respostaCorreta: det.respostaCorreta,
              status: det.status,
              pontuacaoObtida: det.score ?? (det.correta ? (det.maxScore ?? 1.25) : 0),
              pontuacaoMaxima: det.maxScore ?? 1.25,
              tags: questaoOrig?.tags || ['Geral'],
              provaTitulo: leitura.materia || (turmaObj?.nome ? `Avaliação - ${turmaObj.nome}` : 'Avaliação Acadêmica'),
              etapa: (leitura.stage as any) || (filtroCiclo !== 'TODAS' ? filtroCiclo : 'N1')
            });
          });
        } else if (leitura.respostasDetectadas) {
          // Reconstrução a partir das respostas brutas se detalhesQuestoes não estiver preenchido
          Object.entries(leitura.respostasDetectadas).forEach(([qStr, respostaMarcada]) => {
            const qNum = parseInt(qStr, 10);
            const correta = leitura.gabaritoOficial?.[qNum] || 'A';
            const status: 'CORRETA' | 'INCORRETA' | 'EM_BRANCO' = !respostaMarcada 
              ? 'EM_BRANCO' 
              : (String(respostaMarcada).toUpperCase() === String(correta).toUpperCase() ? 'CORRETA' : 'INCORRETA');

            mapaDeQuestoes.push({
              numero: qNum,
              enunciado: `Questão ${qNum < 10 ? '0' : ''}${qNum}`,
              respostaAluno: respostaMarcada,
              respostaCorreta: correta,
              status,
              pontuacaoObtida: status === 'CORRETA' ? 1.25 : 0,
              pontuacaoMaxima: 1.25,
              tags: ['Avaliação'],
              provaTitulo: leitura.materia || (turmaObj?.nome ? `Avaliação - ${turmaObj.nome}` : 'Avaliação Acadêmica'),
              etapa: (leitura.stage as any) || (filtroCiclo !== 'TODAS' ? filtroCiclo : 'N1')
            });
          });
        }
      });

      const taxaAcertoIndividual = totalItensAluno > 0
        ? Number(((acertosAluno / totalItensAluno) * 100).toFixed(1))
        : Number((aluno.media * 10).toFixed(1));

      const deltaRelativoTurma = Number((taxaAcertoIndividual - taxaAcertoMediaTurma).toFixed(1));

      const evolucaoTemporal: EvolucaoEtapaAluno[] = [
        {
          etapa: 'N1',
          notaAluno: aluno.n1,
          mediaTurma: mediasPorEtapa.N1,
          realizada: aluno.n1 > 0
        },
        {
          etapa: 'N2',
          notaAluno: aluno.n2,
          mediaTurma: mediasPorEtapa.N2,
          realizada: aluno.n2 > 0
        },
        {
          etapa: 'N3',
          notaAluno: aluno.n3,
          mediaTurma: mediasPorEtapa.N3,
          realizada: aluno.n3 > 0
        }
      ];

      return {
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        ra: aluno.ra,
        turmaId: aluno.turmaId,
        turmaNome: turmas.find(t => t.id === aluno.turmaId)?.nome || turmaNome,
        curso: aluno.curso,
        n1: aluno.n1,
        n2: aluno.n2,
        n3: aluno.n3,
        mediaFinal: aluno.media,
        statusAprovacao: aluno.status,
        totalProvasRealizadas: leiturasDoAluno.length,
        taxaAcertoIndividual,
        taxaAcertoMediaTurma,
        deltaRelativoTurma,
        evolucaoTemporal,
        mapaDeQuestoes
      };
    });

    // 5. Agregações Granulares por Questão (Taxa de Acerto e Dificuldade com Distribuição Completa)
    const acumuladorQuestoes: Record<number, {
      total: number;
      acertos: number;
      erros: number;
      emBranco: number;
      anuladas: number;
      gabarito: string;
      distratores: Record<string, number>;
      escolhasPorOpcao: Record<string, number>;
      enunciado?: string;
      tags?: string[];
      pontuacao?: number;
      alternativas?: any[];
    }> = {};

    leiturasFiltradas.forEach(leitura => {
      if (Array.isArray(leitura.detalhesQuestoes) && leitura.detalhesQuestoes.length > 0) {
        leitura.detalhesQuestoes.forEach(det => {
          if (!acumuladorQuestoes[det.numero]) {
            acumuladorQuestoes[det.numero] = {
              total: 0,
              acertos: 0,
              erros: 0,
              emBranco: 0,
              anuladas: 0,
              gabarito: det.respostaCorreta || 'A',
              distratores: {},
              escolhasPorOpcao: {}
            };
          }
          const item = acumuladorQuestoes[det.numero];
          item.total++;
          
          if (det.respostaMarcada) {
            const letraMarcada = det.respostaMarcada.toUpperCase();
            item.escolhasPorOpcao[letraMarcada] = (item.escolhasPorOpcao[letraMarcada] || 0) + 1;
          }

          if (det.status === 'CORRETA') item.acertos++;
          else if (det.status === 'EM_BRANCO') item.emBranco++;
          else if (det.status === 'ANULADA') item.anuladas++;
          else {
            item.erros++;
            if (det.respostaMarcada) {
              const letraErrada = det.respostaMarcada.toUpperCase();
              item.distratores[letraErrada] = (item.distratores[letraErrada] || 0) + 1;
            }
          }
        });
      } else if (leitura.respostasDetectadas) {
        Object.entries(leitura.respostasDetectadas).forEach(([qStr, respostaMarcada]) => {
          const qNum = parseInt(qStr, 10);
          const gab = leitura.gabaritoOficial?.[qNum] || 'A';
          if (!acumuladorQuestoes[qNum]) {
            acumuladorQuestoes[qNum] = {
              total: 0,
              acertos: 0,
              erros: 0,
              emBranco: 0,
              anuladas: 0,
              gabarito: gab,
              distratores: {},
              escolhasPorOpcao: {}
            };
          }
          const item = acumuladorQuestoes[qNum];
          item.total++;

          if (respostaMarcada) {
            const letraMarcada = String(respostaMarcada).toUpperCase();
            item.escolhasPorOpcao[letraMarcada] = (item.escolhasPorOpcao[letraMarcada] || 0) + 1;
          }

          if (!respostaMarcada) {
            item.emBranco++;
          } else if (String(respostaMarcada).toUpperCase() === String(gab).toUpperCase()) {
            item.acertos++;
          } else {
            item.erros++;
            const l = String(respostaMarcada).toUpperCase();
            item.distratores[l] = (item.distratores[l] || 0) + 1;
          }
        });
      }
    });

    // Se nenhuma leitura foi feita ainda, preenche mock coerente a partir das questões cadastradas
    const questaoNumeros = Object.keys(acumuladorQuestoes).map(Number);
    if (questaoNumeros.length === 0 && bancoQuestoes.length > 0) {
      bancoQuestoes.slice(0, 8).forEach((q, idx) => {
        const qNum = idx + 1;
        const correta = q.alternativas?.find(a => a.correta)?.letraOriginal || 
          q.options?.find(o => o.isCorrect)?.letter || 'A';
        const totalSimulado = alunosFiltrados.length || 10;
        const acertosSimulado = Math.round(totalSimulado * 0.75);
        const errosSimulado = totalSimulado - acertosSimulado;
        
        const distratoresSimulados: Record<string, number> = {};
        if (correta === 'A') { distratoresSimulados.B = Math.ceil(errosSimulado * 0.6); distratoresSimulados.C = errosSimulado - distratoresSimulados.B; }
        else { distratoresSimulados.A = errosSimulado; }

        const escolhasSimuladas: Record<string, number> = {
          [correta]: acertosSimulado,
          ...distratoresSimulados
        };

        acumuladorQuestoes[qNum] = {
          total: totalSimulado,
          acertos: acertosSimulado,
          erros: errosSimulado,
          emBranco: 0,
          anuladas: 0,
          gabarito: correta,
          distratores: distratoresSimulados,
          escolhasPorOpcao: escolhasSimuladas,
          enunciado: q.enunciado || q.statement,
          tags: q.tags,
          pontuacao: q.pontuacao ?? q.points ?? 1.25,
          alternativas: q.alternativas || q.options
        };
      });
    }

    const rankingQuestoes: ItemEstatisticaQuestao[] = Object.entries(acumuladorQuestoes).map(([qStr, dados]) => {
      const numero = parseInt(qStr, 10);
      const total = dados.total || 1;
      const taxaAcerto = Number(((dados.acertos / total) * 100).toFixed(1));
      const taxaErro = Number((((dados.erros + dados.emBranco + dados.anuladas) / total) * 100).toFixed(1));

      // Calcula frequências dos distratores
      const distratores: DistratorFrequencia[] = Object.entries(dados.distratores).map(([letra, qtd]) => ({
        letra,
        quantidade: qtd,
        percentual: Number(((qtd / (dados.erros || 1)) * 100).toFixed(1))
      })).sort((a, b) => b.quantidade - a.quantidade);

      const distratorCritico = distratores[0];

      // Busca dados semânticos da questão
      const questaoOrig = bancoQuestoes.find((_, idx) => idx + 1 === numero) ||
        provasMontadas.flatMap(p => p.questoesSnapshot)[numero - 1];

      // Determina quais alternativas a questão possui (ex: A-D ou A-E)
      const letrasDisponiveis = ['A', 'B', 'C', 'D'];
      if (
        dados.escolhasPorOpcao?.['E'] !== undefined || 
        dados.gabarito === 'E' || 
        (dados.alternativas && dados.alternativas.length >= 5) ||
        (questaoOrig?.alternativas && questaoOrig.alternativas.length >= 5) ||
        (questaoOrig?.options && questaoOrig.options.length >= 5)
      ) {
        letrasDisponiveis.push('E');
      }

      // Distribuição completa de todas as alternativas para o Painel de Distratores
      const distribuicaoOpcoes: Record<string, { quantidade: number; percentual: number }> = {};
      letrasDisponiveis.forEach(letra => {
        let qtd = dados.escolhasPorOpcao?.[letra];
        if (qtd === undefined) {
          qtd = letra === dados.gabarito ? dados.acertos : (dados.distratores[letra] || 0);
        }
        const pct = total > 0 ? Number(((qtd / total) * 100).toFixed(1)) : 0;
        distribuicaoOpcoes[letra] = {
          quantidade: qtd,
          percentual: pct
        };
      });

      return {
        numero,
        enunciado: dados.enunciado || questaoOrig?.enunciado || questaoOrig?.statement || `Questão ${numero < 10 ? '0' : ''}${numero}`,
        tags: dados.tags || questaoOrig?.tags || ['Conteúdo Programático'],
        pontuacao: dados.pontuacao || questaoOrig?.pontuacao || questaoOrig?.points || 1.25,
        totalSubmissoes: dados.total,
        totalAcertos: dados.acertos,
        totalErros: dados.erros,
        totalEmBranco: dados.emBranco,
        totalAnuladas: dados.anuladas,
        taxaAcerto,
        taxaErro,
        gabaritoOficial: dados.gabarito,
        distratores,
        distratorCritico,
        distribuicaoOpcoes,
        alternativas: dados.alternativas || questaoOrig?.alternativas || questaoOrig?.options
      };
    });

    // Ordenação estrita da especificação: da questão mais acertada até a mais errada
    rankingQuestoes.sort((a, b) => b.taxaAcerto - a.taxaAcerto);

    // Identificação da Questão Crítica (maior índice de erro)
    const questaoCriticaItem = [...rankingQuestoes].sort((a, b) => b.taxaErro - a.taxaErro)[0];
    const questaoCritica = questaoCriticaItem ? {
      numero: questaoCriticaItem.numero,
      enunciado: questaoCriticaItem.enunciado,
      taxaErro: questaoCriticaItem.taxaErro,
      distratorCritico: questaoCriticaItem.distratorCritico ? `Alternativa ${questaoCriticaItem.distratorCritico.letra} (${questaoCriticaItem.distratorCritico.percentual}%)` : undefined
    } : undefined;

    // 6. Métricas Globais da Turma
    const mediasFinais = alunosConsolidado.map(a => a.mediaFinal);
    const mediaGeral = mediasFinais.length > 0
      ? Number((mediasFinais.reduce((acc, m) => acc + m, 0) / mediasFinais.length).toFixed(1))
      : 0;

    // Cálculo do Desvio Padrão populacional das médias
    const variancia = mediasFinais.length > 0
      ? mediasFinais.reduce((acc, m) => acc + Math.pow(m - mediaGeral, 2), 0) / mediasFinais.length
      : 0;
    const desvioPadrao = Number(Math.sqrt(variancia).toFixed(2));

    const totalAprovados = alunosConsolidado.filter(a => a.statusAprovacao === 'Aprovado').length;
    const totalExame = alunosConsolidado.filter(a => a.statusAprovacao === 'Exame').length;
    const totalReprovados = alunosConsolidado.filter(a => a.statusAprovacao === 'Reprovado').length;
    const divisor = alunosConsolidado.length || 1;

    const taxaAprovacao = Math.round((totalAprovados / divisor) * 100);
    const taxaExame = Math.round((totalExame / divisor) * 100);
    const taxaReprovacao = Math.round((totalReprovados / divisor) * 100);

    const maiorNota = mediasFinais.length > 0 ? Math.max(...mediasFinais) : 0;
    const menorNota = mediasFinais.length > 0 ? Math.min(...mediasFinais) : 0;

    return {
      turmaId,
      turmaNome,
      semestre,
      disciplina,
      metricas: {
        mediaGeral,
        desvioPadrao,
        taxaAprovacao,
        taxaExame,
        taxaReprovacao,
        maiorNota,
        menorNota,
        totalAlunos: alunosConsolidado.length,
        totalProvasCorrigidas: leiturasFiltradas.length,
        questaoCritica
      },
      rankingQuestoes,
      alunosConsolidado
    };
  }
}
