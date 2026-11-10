import * as XLSX from 'xlsx';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { 
  LeituraOMRRegistro, 
  Question, 
  ProvaMontadaRegistro,
  AvaliacaoCiclo 
} from '@/types';
import { RelatoriosService } from './RelatoriosService';

export interface ExportarExcelParams {
  alunos: AlunoModel[];
  turmas: TurmaModel[];
  leiturasOMR: LeituraOMRRegistro[];
  provasMontadas?: ProvaMontadaRegistro[];
  bancoQuestoes?: Question[];
  turmaId?: string;
  filtroCiclo?: AvaliacaoCiclo | 'TODAS';
  filtroSemestre?: string;
  tituloProva?: string;
}

export class ExportService {
  /**
   * Constrói e retorna o objeto WorkBook XLSX com as 3 abas completas:
   *  1. "Notas" (Lançamento Acadêmico com N1, N2, N3, Média Final e Situação)
   *  2. "Espelho de Correção" (Linha a linha com alternativas marcadas x gabarito oficial)
   *  3. "Estatística por Questão" (Índice de acertos, erros, dificuldade e distratores)
   */
  static construirWorkbookRelatorio(params: ExportarExcelParams): XLSX.WorkBook {
    const {
      alunos,
      turmas,
      leiturasOMR,
      provasMontadas = [],
      bancoQuestoes = [],
      turmaId = 'TODAS',
      filtroCiclo = 'TODAS',
      filtroSemestre = '2026/2',
      tituloProva = 'Avaliação Acadêmica'
    } = params;

    const relatorioTurma = RelatoriosService.gerarRelatorioTurma({
      turmaId,
      alunos,
      turmas,
      leiturasOMR,
      provasMontadas,
      bancoQuestoes,
      filtroCiclo,
      filtroSemestre
    });

    const wb = XLSX.utils.book_new();

    // =========================================================================
    // ABA 1: NOTAS (Pronto para lançar no sistema acadêmico)
    // =========================================================================
    const cabecalhoNotas = [
      'Matrícula (RA)',
      'Nome do Estudante',
      'Turma',
      'Curso',
      'Semestre',
      'Nota N1',
      'Nota N2',
      'Nota N3',
      'Média Final',
      'Situação Acadêmica',
      'Total Provas OMR',
      'Taxa Acerto (%)'
    ];

    const linhasNotas: any[][] = [cabecalhoNotas];

    relatorioTurma.alunosConsolidado.forEach(aluno => {
      linhasNotas.push([
        aluno.ra || '-',
        aluno.alunoNome || '-',
        aluno.turmaNome || '-',
        aluno.curso || '-',
        relatorioTurma.semestre || '-',
        Number(aluno.n1.toFixed(1)),
        Number(aluno.n2.toFixed(1)),
        Number(aluno.n3.toFixed(1)),
        Number(aluno.mediaFinal.toFixed(1)),
        (aluno.statusAprovacao || 'Em Curso').toUpperCase(),
        aluno.totalProvasRealizadas || 0,
        Number((aluno.taxaAcertoIndividual || 0).toFixed(1))
      ]);
    });

    // Bloco de Resumo Estatístico da Turma no Rodapé da Aba de Notas
    linhasNotas.push([]);
    linhasNotas.push(['--- RESUMO CONSOLIDADO DA TURMA ---']);
    linhasNotas.push(['Disciplina / Avaliação:', relatorioTurma.disciplina || tituloProva]);
    linhasNotas.push(['Turma / Escopo:', relatorioTurma.turmaNome]);
    linhasNotas.push(['Média Geral da Turma:', relatorioTurma.metricas.mediaGeral]);
    linhasNotas.push(['Desvio Padrão:', relatorioTurma.metricas.desvioPadrao]);
    linhasNotas.push(['Taxa de Aprovação:', `${relatorioTurma.metricas.taxaAprovacao}%`]);
    linhasNotas.push(['Taxa em Exame / Recuperação:', `${relatorioTurma.metricas.taxaExame}%`]);
    linhasNotas.push(['Taxa de Reprovação:', `${relatorioTurma.metricas.taxaReprovacao}%`]);
    linhasNotas.push(['Total de Avaliações Corrigidas:', relatorioTurma.metricas.totalProvasCorrigidas]);

    const wsNotas = XLSX.utils.aoa_to_sheet(linhasNotas);

    // Auto-ajuste de largura de colunas
    wsNotas['!cols'] = [
      { wch: 16 }, // RA
      { wch: 34 }, // Nome
      { wch: 26 }, // Turma
      { wch: 22 }, // Curso
      { wch: 12 }, // Semestre
      { wch: 10 }, // N1
      { wch: 10 }, // N2
      { wch: 10 }, // N3
      { wch: 12 }, // Média
      { wch: 20 }, // Situação
      { wch: 16 }, // Provas
      { wch: 16 }  // Taxa
    ];

    XLSX.utils.book_append_sheet(wb, wsNotas, 'Notas');

    // =========================================================================
    // ABA 2: ESPELHO DE CORREÇÃO (Alternativa Marcada x Gabarito por Questão)
    // =========================================================================
    const leiturasFiltradas = leiturasOMR.filter(l => {
      if (turmaId !== 'TODAS' && l.turmaId && l.turmaId !== turmaId) return false;
      if (filtroCiclo !== 'TODAS' && l.stage && l.stage !== filtroCiclo) return false;
      return true;
    });

    // Determina o número máximo de questões entre as leituras
    let maxQuestoes = 8;
    leiturasFiltradas.forEach(l => {
      if (l.totalQuestoes && l.totalQuestoes > maxQuestoes) maxQuestoes = l.totalQuestoes;
      if (l.detalhesQuestoes && l.detalhesQuestoes.length > maxQuestoes) maxQuestoes = l.detalhesQuestoes.length;
      if (l.respostasDetectadas) {
        const chaves = Object.keys(l.respostasDetectadas).map(Number);
        const maior = Math.max(0, ...chaves);
        if (maior > maxQuestoes) maxQuestoes = maior;
      }
    });
    maxQuestoes = Math.min(30, Math.max(1, maxQuestoes));

    const cabecalhoEspelho = [
      'Matrícula (RA)',
      'Estudante',
      'Turma',
      'Ciclo',
      'Versão',
      'Data da Leitura',
      'Acertos',
      'Total Itens',
      'Nota OMR'
    ];

    for (let q = 1; q <= maxQuestoes; q++) {
      const qPrefix = `Q.${q < 10 ? '0' + q : q}`;
      cabecalhoEspelho.push(`${qPrefix} Marcada`, `${qPrefix} Gabarito`, `${qPrefix} Status`);
    }

    const linhasEspelho: any[][] = [cabecalhoEspelho];

    leiturasFiltradas.forEach(l => {
      const dataStr = l.dataLeitura 
        ? new Date(l.dataLeitura).toLocaleString('pt-BR') 
        : '-';

      const linha: any[] = [
        l.ra || '-',
        l.alunoNome || '-',
        l.turmaNome || '-',
        l.stage || 'N1',
        l.versao || 'A',
        dataStr,
        l.acertos || 0,
        l.totalQuestoes || maxQuestoes,
        Number((l.notaCalculada || 0).toFixed(1))
      ];

      for (let q = 1; q <= maxQuestoes; q++) {
        const det = l.detalhesQuestoes?.find(d => d.numero === q);
        let marcada = det?.respostaMarcada || l.respostasDetectadas?.[q] || null;
        let gabarito = det?.respostaCorreta || l.gabaritoOficial?.[q] || '-';
        let status = det?.status || ((l as any).statusCustom?.[q]) || '';

        if (!status) {
          if (!marcada) status = 'EM_BRANCO';
          else if (gabarito && String(marcada).toUpperCase() === String(gabarito).toUpperCase()) status = 'CORRETA';
          else status = 'INCORRETA';
        }

        linha.push(
          marcada ? String(marcada).toUpperCase() : 'EM BRANCO',
          gabarito ? String(gabarito).toUpperCase() : '-',
          status.replace('_', ' ')
        );
      }

      linhasEspelho.push(linha);
    });

    const wsEspelho = XLSX.utils.aoa_to_sheet(linhasEspelho);

    const colsEspelho = [
      { wch: 16 }, // RA
      { wch: 32 }, // Estudante
      { wch: 24 }, // Turma
      { wch: 10 }, // Ciclo
      { wch: 10 }, // Versão
      { wch: 20 }, // Data Leitura
      { wch: 10 }, // Acertos
      { wch: 12 }, // Total Itens
      { wch: 12 }  // Nota OMR
    ];
    for (let q = 1; q <= maxQuestoes; q++) {
      colsEspelho.push({ wch: 13 }, { wch: 13 }, { wch: 14 });
    }
    wsEspelho['!cols'] = colsEspelho;

    XLSX.utils.book_append_sheet(wb, wsEspelho, 'Espelho de Correção');

    // =========================================================================
    // ABA 3: ESTATÍSTICA POR QUESTÃO (Taxa de Acerto, Dificuldade e Distratores)
    // =========================================================================
    const cabecalhoEstatistica = [
      'Nº Questão',
      'Gabarito Oficial',
      'Total Respostas',
      'Acertos Absolutos',
      'Erros Absolutos',
      'Em Branco',
      'Anuladas / Duplas',
      'Taxa de Acerto (%)',
      'Nível de Dificuldade',
      'Distrator Mais Assinalado',
      'Enunciado / Tema'
    ];

    const linhasEstatistica: any[][] = [cabecalhoEstatistica];

    const questoesLista = relatorioTurma.rankingQuestoes || [];

    questoesLista.forEach(q => {
      const distratorDesc = q.distratorCritico
        ? `Opção ${q.distratorCritico.letra} (${q.distratorCritico.quantidade} votos • ${q.distratorCritico.percentual}%)`
        : 'Nenhum distrator relevante';

      const dificuldadeLabel = q.taxaAcerto >= 85
        ? 'Muito Fácil'
        : q.taxaAcerto >= 70
          ? 'Fácil'
          : q.taxaAcerto >= 50
            ? 'Média'
            : q.taxaAcerto >= 30
              ? 'Difícil'
              : 'Muito Difícil';

      linhasEstatistica.push([
        `Q.${q.numero < 10 ? '0' + q.numero : q.numero}`,
        q.gabaritoOficial || 'A',
        q.totalSubmissoes,
        q.totalAcertos,
        q.totalErros,
        q.totalEmBranco,
        q.totalAnuladas,
        Number(q.taxaAcerto.toFixed(1)),
        dificuldadeLabel,
        distratorDesc,
        q.enunciado || `Questão ${q.numero}`
      ]);
    });

    const wsEstatistica = XLSX.utils.aoa_to_sheet(linhasEstatistica);
    wsEstatistica['!cols'] = [
      { wch: 12 }, // Nº Questão
      { wch: 16 }, // Gabarito
      { wch: 16 }, // Total Respostas
      { wch: 16 }, // Acertos
      { wch: 16 }, // Erros
      { wch: 12 }, // Em Branco
      { wch: 16 }, // Anuladas
      { wch: 18 }, // Taxa de Acerto
      { wch: 22 }, // Dificuldade
      { wch: 36 }, // Distrator
      { wch: 50 }  // Enunciado
    ];

    XLSX.utils.book_append_sheet(wb, wsEstatistica, 'Estatística por Questão');

    return wb;
  }

  /**
   * Dispara o download imediato da planilha Excel (.xlsx) no navegador
   */
  static gerarRelatorioExcelCompleto(params: ExportarExcelParams): void {
    const wb = this.construirWorkbookRelatorio(params);

    const turmaNome = params.turmaId && params.turmaId !== 'TODAS'
      ? (params.turmas.find(t => t.id === params.turmaId)?.nome || params.turmaId)
      : 'Geral_Consolidado';

    const ciclo = params.filtroCiclo && params.filtroCiclo !== 'TODAS'
      ? `_${params.filtroCiclo}`
      : '';

    const sanitizedTurma = turmaNome.replace(/[^a-zA-Z0-9_-]/g, '_');
    const nomeArquivo = `Relatorio_Academico_${sanitizedTurma}${ciclo}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    try {
      XLSX.writeFile(wb, nomeArquivo);
    } catch (_) {
      // Fallback para ambientes em que writeFile com blob manual seja requerido
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nomeArquivo);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Exportação legada em CSV de notas (mantida para compatibilidade retroativa)
   */
  static gerarCsvNotas(alunos: AlunoModel[], turmas: TurmaModel[], tituloProva: string): void {
    let csv = 'Aluno;RA;Turma;Materia;N1;N2;N3;Media;Status\n';

    alunos.forEach(r => {
      const turmaObj = turmas.find(t => t.id === r.turmaId);
      csv += `${r.nome};${r.ra};${turmaObj?.nome || '-'};${tituloProva};${r.n1.toFixed(1)};${r.n2.toFixed(1)};${r.n3.toFixed(1)};${r.media.toFixed(1)};${r.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'relatorio_notas_historico_catolica.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
