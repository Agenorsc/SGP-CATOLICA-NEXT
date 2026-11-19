import { WordExportService } from '@/services/WordExportService';
import type { ProvaMontadaRegistro } from '@/types';

const prova: ProvaMontadaRegistro = {
  id: 'prova-1', titulo: 'Avaliação & Revisão', turmaId: 'turma-1', turmaNome: 'Turma A',
  disciplina: 'Matemática', ciclo: 'N3', totalQuestoes: 2, pontuacaoTotal: 10,
  shuffleQuestoes: false, shuffleAlternativas: false, nominalQrCode: false,
  createdAt: '2026-11-17T10:00:00.000Z',
  questoesSnapshot: [
    { id: 'q1', tipo: 'objetiva', enunciado: 'Quanto é 2 < 3?', pontuacao: 5, tags: [], alternativas: [
      { id: 'a', letraOriginal: 'A', texto: 'Sim & certo', correta: true },
      { id: 'b', letraOriginal: 'B', texto: 'Não', correta: false }
    ] },
    { id: 'q2', tipo: 'discursiva', enunciado: 'Explique a resposta.', pontuacao: 5, tags: [] }
  ]
};

describe('TSK-53 - exportação de caderno Word', () => {
  it('gera um pacote DOCX ZIP com conteúdo editável e XML escapado', () => {
    const bytes = WordExportService.construirDocx(prova);
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    const text = Buffer.from(bytes).toString('utf8');
    expect(text).toContain('Avaliação &amp; Revisão');
    expect(text).toContain('2 &lt; 3?');
    expect(text).toContain('Sim &amp; certo');
    expect(text).toContain('Explique a resposta.');
    expect(text).not.toContain('Gabarito oficial');
  });

  it('não exporta uma prova sem questões', () => {
    expect(() => WordExportService.construirDocx({ ...prova, questoesSnapshot: [] })).toThrow('não possui questões');
  });
});
