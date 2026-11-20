/**
 * @jest-environment node
 */

import { ProvaMontadaRegistro } from '@/types';

describe('Validação de Divergência de Prova no Leitor OMR (UUID vs Formato de Impressão EXAM-turma-etapa)', () => {
  const provaAlvo: ProvaMontadaRegistro = {
    id: '73fa1502-4087-4785-8cad-c7541104103c',
    titulo: 'Direito Civil - Avaliação Escrita 01',
    turmaId: 'turma_1792624613270',
    turmaNome: 'Direito Civil',
    disciplina: 'Direito Civil',
    semestre: '2026/2',
    ciclo: 'N1',
    questoesSnapshot: [],
    totalQuestoes: 7,
    pontuacaoTotal: 10,
    shuffleQuestoes: true,
    shuffleAlternativas: true,
    nominalQrCode: true,
    createdAt: new Date().toISOString()
  };

  const provasDisponiveis = [provaAlvo];

  function validarCorrespondenciaProva(
    provaMontadaId: string | undefined,
    parsed: { p?: string; examId?: string; t?: string; turmaId?: string; s?: string; stage?: string; ciclo?: string; r?: string; c?: string }
  ) {
    const pId = String(parsed.p || parsed.examId || '').trim();
    const turmaQr = String(parsed.t || parsed.turmaId || '').trim();
    const etapaQr = String(parsed.s || parsed.stage || parsed.ciclo || '').trim().toUpperCase();
    const ra = String(parsed.r || '').trim();
    const cId = String(parsed.c || '').trim();

    const alvo = provaMontadaId ? (provasDisponiveis.find(p => p.id === provaMontadaId) || null) : null;
    const provaLocal = provasDisponiveis.find(p => {
      if (p.id === pId) return true;
      if (p.turmaId && (pId === `EXAM-${p.turmaId}-${p.ciclo}` || pId === `EXAM-${p.turmaId}`)) return true;
      if (turmaQr && p.turmaId === turmaQr && (!etapaQr || !p.ciclo || p.ciclo.toUpperCase() === etapaQr)) return true;
      if (cId && p.cadernos?.some(c => c.id === cId || c.codigoVersao === cId)) return true;
      if (ra && ra !== 'ANONIMO' && p.cadernos?.some(c => c.alunoRa === ra)) return true;
      return false;
    }) || null;

    let ehMesmaProva = true;
    if (provaMontadaId) {
      ehMesmaProva =
        pId === provaMontadaId ||
        (provaLocal !== null && provaLocal.id === provaMontadaId) ||
        (alvo !== null && (
          pId === `EXAM-${alvo.turmaId}-${alvo.ciclo}` ||
          pId === `EXAM-${alvo.turmaId}` ||
          pId.includes(alvo.turmaId) ||
          (turmaQr !== '' && alvo.turmaId !== '' && turmaQr === alvo.turmaId && (!etapaQr || !alvo.ciclo || etapaQr === String(alvo.ciclo).toUpperCase())) ||
          (cId !== '' && (alvo.cadernos?.some(c => c.id === cId || c.codigoVersao === cId) ?? false)) ||
          (ra !== '' && ra !== 'ANONIMO' && (alvo.cadernos?.some(c => c.alunoRa === ra) ?? false))
        ));
    }

    const idResolvido = provaLocal?.id || provaMontadaId || pId;
    return { ehMesmaProva, idResolvido, titulo: provaLocal?.titulo };
  }

  it('deve aceitar a folha impressa com EXAM-turma_xxx-N1 quando o leitor foi aberto para o UUID daquela prova', () => {
    const qrScaneado = {
      p: 'EXAM-turma_1792624613270-N1',
      t: 'turma_1792624613270',
      s: 'N1',
      r: '102678'
    };

    const resultado = validarCorrespondenciaProva('73fa1502-4087-4785-8cad-c7541104103c', qrScaneado);
    expect(resultado.ehMesmaProva).toBe(true);
    expect(resultado.idResolvido).toBe('73fa1502-4087-4785-8cad-c7541104103c');
    expect(resultado.titulo).toBe('Direito Civil - Avaliação Escrita 01');
  });

  it('deve rejeitar uma folha que pertença genuinamente a outra turma/etapa', () => {
    const qrOutraTurma = {
      p: 'EXAM-turma_outra_99999-N2',
      t: 'turma_outra_99999',
      s: 'N2',
      r: '999999'
    };

    const resultado = validarCorrespondenciaProva('73fa1502-4087-4785-8cad-c7541104103c', qrOutraTurma);
    expect(resultado.ehMesmaProva).toBe(false);
  });

  it('deve aceitar leitura geral quando nenhum provaMontadaId específico for fixado', () => {
    const qrScaneado = {
      p: 'EXAM-turma_1792624613270-N1',
      t: 'turma_1792624613270',
      s: 'N1',
      r: '102678'
    };

    const resultado = validarCorrespondenciaProva(undefined, qrScaneado);
    expect(resultado.ehMesmaProva).toBe(true);
    expect(resultado.idResolvido).toBe('73fa1502-4087-4785-8cad-c7541104103c');
  });
});
