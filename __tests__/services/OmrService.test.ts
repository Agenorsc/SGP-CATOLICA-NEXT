import { OmrService } from '../../src/services/OmrService';
import { AlunoModel } from '../../src/models/AlunoModel';
import { TurmaModel } from '../../src/models/TurmaModel';
import { Question } from '../../src/types';

describe('OmrService - Leitura e Correção Automatizada em Dois Estágios', () => {
  let omrService: OmrService;

  const mockAlunosTurma: AlunoModel[] = [
    new AlunoModel({
      id: 'alu-01',
      nome: 'AGENOR ALVISE',
      ra: '1328834',
      turmaId: 't1',
      n1: 8.0,
      n2: 0.0
    }),
    new AlunoModel({
      id: 'alu-02',
      nome: 'BEATRIZ RAMOS',
      ra: '1328835',
      turmaId: 't1',
      n1: 7.5,
      n2: 0.0
    })
  ];

  const mockTurma = new TurmaModel({
    id: 't1',
    nome: 'Engenharia de Software - 6º Semestre',
    curso: 'Engenharia de Software',
    semestre: '2026/2'
  });

  const mockQuestoes: Question[] = Array.from({ length: 20 }, (_, i) => ({
    id: `q_${i + 1}`,
    tipo: 'objetiva',
    enunciado: `Questão de Arquitetura ${i + 1}`,
    pontuacao: 0.5,
    tags: ['N2'],
    alternativas: [
      { id: `alt_${i}_1`, letraOriginal: 'A', texto: 'Alternativa A', correta: i % 4 === 0 },
      { id: `alt_${i}_2`, letraOriginal: 'B', texto: 'Alternativa B', correta: i % 4 === 1 },
      { id: `alt_${i}_3`, letraOriginal: 'C', texto: 'Alternativa C', correta: i % 4 === 2 },
      { id: `alt_${i}_4`, letraOriginal: 'D', texto: 'Alternativa D', correta: i % 4 === 3 }
    ]
  }));

  beforeEach(() => {
    omrService = new OmrService();
  });

  describe('Etapa 1: Filtro Anti-Fantasma (JSON Seguro) e Autenticação de Aluno', () => {
    it('deve rejeitar string arbitrária que não é formato JSON válido', () => {
      const res = omrService.validarPayloadQrCode('https://site-aleatorio.com/teste', mockAlunosTurma, 't1');
      expect(res.sucesso).toBe(false);
      expect(res.erro).toContain('JSON válido');
    });

    it('deve rejeitar QR Code cujo sistema não seja estritamente "SGP-CATOLICA"', () => {
      const payloadInvalido = JSON.stringify({
        system: 'OUTRO_SISTEMA',
        examId: 'EXAM-t1',
        studentId: 'alu-01',
        ra: '1328834',
        name: 'AGENOR ALVISE',
        turmaId: 't1',
        examVersion: 'A'
      });

      const res = omrService.validarPayloadQrCode(payloadInvalido, mockAlunosTurma, 't1');
      expect(res.sucesso).toBe(false);
      expect(res.erro).toContain('SGP-CATOLICA');
    });

    it('deve rejeitar payload com campos obrigatórios ausentes', () => {
      const payloadIncompleto = JSON.stringify({
        system: 'SGP-CATOLICA',
        examId: 'EXAM-t1',
        studentId: 'alu-01'
        // ra, name, turmaId, examVersion ausentes
      });

      const res = omrService.validarPayloadQrCode(payloadIncompleto, mockAlunosTurma, 't1');
      expect(res.sucesso).toBe(false);
      expect(res.erro).toContain('Campo obrigatório');
    });

    it('deve rejeitar aluno que não pertence à turma ativa selecionada', () => {
      const payloadOutraTurma = JSON.stringify({
        system: 'SGP-CATOLICA',
        examId: 'EXAM-t2',
        studentId: 'alu-999',
        ra: '9999999',
        name: 'ALUNO DE OUTRA TURMA',
        turmaId: 't2',
        examVersion: 'A'
      });

      const res = omrService.validarPayloadQrCode(payloadOutraTurma, mockAlunosTurma, 't1');
      expect(res.sucesso).toBe(false);
      expect(res.erro).toContain('Inconsistência de Turma');
    });

    it('deve autenticar com sucesso payload válido pertencente à turma ativa', () => {
      const payloadValido = JSON.stringify({
        system: 'SGP-CATOLICA',
        examId: 'EXAM-t1',
        studentId: 'alu-01',
        ra: '1328834',
        name: 'AGENOR ALVISE',
        turmaId: 't1',
        examVersion: 'A'
      });

      const res = omrService.validarPayloadQrCode(payloadValido, mockAlunosTurma, 't1');
      expect(res.sucesso).toBe(true);
      expect(res.aluno).toBeDefined();
      expect(res.aluno?.nome).toBe('AGENOR ALVISE');
      expect(res.payload?.examVersion).toBe('A');
    });
  });

  describe('Etapa 2: Recuperação de Gabarito e Correção Óptica OMR', () => {
    it('deve gerar gabarito oficial determinístico para a versão da prova', () => {
      const gabaritoA = omrService.gerarGabaritoOficialVersao(mockQuestoes, 'A', true, true);
      const gabaritoA_repetido = omrService.gerarGabaritoOficialVersao(mockQuestoes, 'A', true, true);
      const gabaritoB = omrService.gerarGabaritoOficialVersao(mockQuestoes, 'B', true, true);

      expect(gabaritoA).toEqual(gabaritoA_repetido);
      expect(Object.keys(gabaritoA)).toHaveLength(20);
      expect(gabaritoA).toBeDefined();
      expect(gabaritoB).toBeDefined();
    });

    it('deve calcular a Nota N2 proporcional baseada na fórmula (acertos / total) * 10', () => {
      const aluno = mockAlunosTurma[0];
      const gabaritoOficial = omrService.gerarGabaritoOficialVersao(mockQuestoes, 'A', false, false);

      // Simula 16 acertos de 20 questões -> Nota deve ser exatamente 8.0
      const respostasDetectadas: Record<number, string | null> = {};
      for (let i = 1; i <= 20; i++) {
        if (i <= 16) {
          respostasDetectadas[i] = gabaritoOficial[i]; // Acerto
        } else {
          // Erro intencional
          respostasDetectadas[i] = gabaritoOficial[i] === 'A' ? 'B' : 'A';
        }
      }

      const registro = omrService.processarCorrecaoAutomatica({
        aluno,
        turma: mockTurma,
        materia: 'Arquitetura de Software',
        versaoLetra: 'A',
        questoesBase: mockQuestoes,
        shuffleQ: false,
        shuffleAlt: false,
        respostasDetectadas,
        fiduciaisValidados: true
      });

      expect(registro.acertos).toBe(16);
      expect(registro.totalQuestoes).toBe(20);
      expect(registro.notaCalculada).toBe(8.0);
      expect(registro.detalhesQuestoes).toHaveLength(20);
      expect(registro.detalhesQuestoes?.filter(d => d.correta)).toHaveLength(16);
    });

    it('deve interpretar rasuras e marcações nulas como resposta anulada sem pontuar', () => {
      const aluno = mockAlunosTurma[0];
      const gabaritoOficial = omrService.gerarGabaritoOficialVersao(mockQuestoes, 'A', false, false);

      const respostasDetectadas: Record<number, string | null> = {};
      for (let i = 1; i <= 20; i++) {
        if (i === 1) {
          respostasDetectadas[i] = null; // Rasura / dupla marcação
        } else {
          respostasDetectadas[i] = gabaritoOficial[i];
        }
      }

      const registro = omrService.processarCorrecaoAutomatica({
        aluno,
        turma: mockTurma,
        materia: 'Arquitetura de Software',
        versaoLetra: 'A',
        questoesBase: mockQuestoes,
        shuffleQ: false,
        shuffleAlt: false,
        respostasDetectadas,
        fiduciaisValidados: true
      });

      expect(registro.acertos).toBe(19);
      expect(registro.detalhesQuestoes?.[0].correta).toBe(false);
      expect(registro.detalhesQuestoes?.[0].respostaMarcada).toBeNull();
      expect(registro.notaCalculada).toBe(9.5);
    });

    it('deve realizar a leitura óptica real dos pixels via processarGradeOMRFromImageData anulando questão com dupla marcação', () => {
      const width = 958;
      const height = 622;
      const data = new Uint8ClampedArray(width * height * 4);
      data.fill(255); // Fundo branco

      const paintBubble = (cx: number, cy: number, radius = 7) => {
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (dx * dx + dy * dy <= radius * radius) {
              const idx = ((cy + dy) * width + (cx + dx)) * 4;
              data[idx] = 20;
              data[idx + 1] = 20;
              data[idx + 2] = 20;
              data[idx + 3] = 255;
            }
          }
        }
      };

      // Q1 (y ~ 482): Pinta B (x ~ 222) e D (x ~ 298) -> Dupla marcação
      paintBubble(222, 482);
      paintBubble(298, 482);

      // Q2 (y ~ 519): Pinta B (x ~ 222) -> B
      paintBubble(222, 519);

      // Q3 (y ~ 556): Pinta D (x ~ 298) -> D
      paintBubble(298, 556);

      const res = omrService.processarGradeOMRFromImageData({ width, height, data }, 3);

      expect(res.respostas[1]).toBeNull();
      expect(res.statusQuestoes[1]).toBe('ANULADA');
      expect(res.respostas[2]).toBe('B');
      expect(res.respostas[3]).toBe('D');
    });

    it('deve realizar a leitura óptica ancorada dinamicamente pelo QR Code (layout impresso real)', () => {
      // Simula uma imagem de câmera 1280x720 onde a folha está posicionada arbitrariamente
      const width = 1280;
      const height = 720;
      const data = new Uint8ClampedArray(width * height * 4);
      data.fill(255);

      const qrAnchor = {
        x: 520,
        y: 180,
        width: 140,
        height: 140,
        location: {
          topLeftCorner: { x: 520, y: 180 },
          topRightCorner: { x: 660, y: 180 },
          bottomRightCorner: { x: 660, y: 320 },
          bottomLeftCorner: { x: 520, y: 320 }
        }
      };

      const paintBox = (cx: number, cy: number, half = 11) => {
        for (let dy = -half; dy <= half; dy++) {
          for (let dx = -half; dx <= half; dx++) {
            const px = Math.round(cx + dx);
            const py = Math.round(cy + dy);
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const idx = (py * width + px) * 4;
              data[idx] = 15;
              data[idx + 1] = 15;
              data[idx + 2] = 15;
              data[idx + 3] = 255;
            }
          }
        }
      };

      // Posicionamento relativo ao QR Code:
      // Q1: B (relX: -1.492) e D (relX: -0.908), relY: 2.477 -> Dupla marcação
      const yQ1 = 180 + 2.477 * 140;
      paintBox(520 - 1.492 * 140, yQ1);
      paintBox(520 - 0.908 * 140, yQ1);

      // Q2: B (relX: -1.492), relY: 2.762 -> B
      const yQ2 = 180 + 2.762 * 140;
      paintBox(520 - 1.492 * 140, yQ2);

      // Q3: D (relX: -0.908), relY: 3.046 -> D
      const yQ3 = 180 + 3.046 * 140;
      paintBox(520 - 0.908 * 140, yQ3);

      const res = omrService.processarGradeOMRFromImageData({ width, height, data }, 3, qrAnchor);

      expect(res.respostas[1]).toBeNull();
      expect(res.statusQuestoes[1]).toBe('ANULADA');
      expect(res.respostas[2]).toBe('B');
      expect(res.respostas[3]).toBe('D');
      expect(res.fillRates[1]).toBeGreaterThanOrEqual(80);
      expect(res.fillRates[2]).toBeGreaterThanOrEqual(80);
      expect(res.fillRates[3]).toBeGreaterThanOrEqual(80);
    });

    it('deve anular a questão Q.4 com duas alternativas marcadas assimetricamente (ex: 64% e 41%) e manter as demais corretas', () => {
      const width = 1280;
      const height = 720;
      const data = new Uint8ClampedArray(width * height * 4);
      data.fill(255);

      const qrAnchor = {
        x: 520,
        y: 180,
        width: 140,
        height: 140,
        location: {
          topLeftCorner: { x: 520, y: 180 },
          topRightCorner: { x: 660, y: 180 },
          bottomRightCorner: { x: 660, y: 320 },
          bottomLeftCorner: { x: 520, y: 320 }
        }
      };

      // Função para pintar caixa com densidade de preenchimento configurável
      const paintBoxWithFill = (cx: number, cy: number, fillPercent: number, half = 11) => {
        let painted = 0;
        const total = (half * 2 + 1) * (half * 2 + 1);
        const target = Math.round((fillPercent / 100) * total);

        for (let dy = -half; dy <= half; dy++) {
          for (let dx = -half; dx <= half; dx++) {
            if (painted >= target) break;
            const px = Math.round(cx + dx);
            const py = Math.round(cy + dy);
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const idx = (py * width + px) * 4;
              data[idx] = 15;
              data[idx + 1] = 15;
              data[idx + 2] = 15;
              data[idx + 3] = 255;
              painted++;
            }
          }
        }
      };

      // Q1: A marcado (~65%)
      const yQ1 = 180 + 2.477 * 140;
      paintBoxWithFill(520 - 1.785 * 140, yQ1, 65);

      // Q2: D marcado (~48%)
      const yQ2 = 180 + 2.762 * 140;
      paintBoxWithFill(520 - 0.908 * 140, yQ2, 48);

      // Q3: E marcado (~72%)
      const yQ3 = 180 + 3.046 * 140;
      paintBoxWithFill(520 - 0.615 * 140, yQ3, 72);

      // Q4: B marcado (~64%) E C marcado (~41%) -> Dupla marcação / rasura
      const yQ4 = 180 + 3.331 * 140;
      paintBoxWithFill(520 - 1.492 * 140, yQ4, 64);
      paintBoxWithFill(520 - 1.200 * 140, yQ4, 41);

      const res = omrService.processarGradeOMRFromImageData({ width, height, data }, 4, qrAnchor);

      expect(res.respostas[1]).toBe('A');
      expect(res.statusQuestoes[1]).toBe('CORRETA');

      expect(res.respostas[2]).toBe('D');
      expect(res.statusQuestoes[2]).toBe('CORRETA');

      expect(res.respostas[3]).toBe('E');
      expect(res.statusQuestoes[3]).toBe('CORRETA');

      // Q4 DEVE SER ANULADA!
      expect(res.respostas[4]).toBeNull();
      expect(res.statusQuestoes[4]).toBe('ANULADA');
    });

    it('deve classificar corretamente questões em branco quando o fill rate de fundo oscila em torno de 38% sem marcação a caneta', () => {
      const width = 1280;
      const height = 720;
      const data = new Uint8ClampedArray(width * height * 4);
      data.fill(255);

      const qrAnchor = {
        x: 520,
        y: 180,
        width: 140,
        height: 140,
        location: {
          topLeftCorner: { x: 520, y: 180 },
          topRightCorner: { x: 660, y: 180 },
          bottomRightCorner: { x: 660, y: 320 },
          bottomLeftCorner: { x: 520, y: 320 }
        }
      };

      // Desenha caixa vazia com borda e letra fina no centro
      const drawEmptyBox = (cx: number, cy: number, half = 11) => {
        for (let d = -half; d <= half; d++) {
          const p1 = (Math.round(cy - half) * width + Math.round(cx + d)) * 4;
          const p2 = (Math.round(cy + half) * width + Math.round(cx + d)) * 4;
          const p3 = (Math.round(cy + d) * width + Math.round(cx - half)) * 4;
          const p4 = (Math.round(cy + d) * width + Math.round(cx + half)) * 4;
          [p1, p2, p3, p4].forEach(p => {
            if (p >= 0 && p < data.length) {
              data[p] = 20; data[p + 1] = 20; data[p + 2] = 20; data[p + 3] = 255;
            }
          });
        }
        for (let dy = -3; dy <= 3; dy++) {
          const p = (Math.round(cy + dy) * width + Math.round(cx)) * 4;
          if (p >= 0 && p < data.length) {
            data[p] = 20; data[p + 1] = 20; data[p + 2] = 20; data[p + 3] = 255;
          }
        }
      };

      // Desenha caixa preenchida a caneta
      const drawFilledBox = (cx: number, cy: number, half = 11) => {
        for (let dy = -half; dy <= half; dy++) {
          for (let dx = -half; dx <= half; dx++) {
            const px = Math.round(cx + dx);
            const py = Math.round(cy + dy);
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const idx = (py * width + px) * 4;
              data[idx] = 15; data[idx + 1] = 15; data[idx + 2] = 15; data[idx + 3] = 255;
            }
          }
        }
      };

      // Desenha todas as caixas base como vazias com bordas
      const cols = [-1.80, -1.492, -1.20, -0.908, -0.608];
      for (let q = 0; q < 4; q++) {
        const yRow = 180 + (2.477 + q * 0.285) * 140;
        cols.forEach(cRel => {
          drawEmptyBox(520 + cRel * 140, yRow);
        });
      }

      // Q1: E preenchido a caneta
      const yQ1 = 180 + 2.477 * 140;
      drawFilledBox(520 - 0.608 * 140, yQ1);

      // Q2: C preenchido a caneta
      const yQ2 = 180 + (2.477 + 0.285) * 140;
      drawFilledBox(520 - 1.200 * 140, yQ2);

      // Q3: Totalmente em branco (apenas caixas vazias desenhadas)
      // Q4: Totalmente em branco (apenas caixas vazias desenhadas)

      const res = omrService.processarGradeOMRFromImageData({ width, height, data }, 4, qrAnchor);
      expect(res.respostas[1]).toBe('E');
      expect(res.statusQuestoes[1]).toBe('CORRETA');

      expect(res.respostas[2]).toBe('C');
      expect(res.statusQuestoes[2]).toBe('CORRETA');

      // Q3 e Q4 DEVEM ser EM_BRANCO, não ANULADA nem falsamente marcadas!
      expect(res.respostas[3]).toBeNull();
      expect(res.statusQuestoes[3]).toBe('EM_BRANCO');

      expect(res.respostas[4]).toBeNull();
      expect(res.statusQuestoes[4]).toBe('EM_BRANCO');
    });
  });
});
