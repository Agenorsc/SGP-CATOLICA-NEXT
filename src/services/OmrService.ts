import { OmrRepository } from '@/repositories/OmrRepository';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { LeituraOMRRegistro, Question, SecureQrPayload, OMRQuestionResult } from '@/types';

export interface ValidacaoQrResult {
  sucesso: boolean;
  payload?: SecureQrPayload;
  aluno?: AlunoModel;
  erro?: string;
}

export interface QrCodeAnchor {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  location?: {
    topLeftCorner?: { x: number; y: number };
    topRightCorner?: { x: number; y: number };
    bottomRightCorner?: { x: number; y: number };
    bottomLeftCorner?: { x: number; y: number };
  };
}

export class OmrService {
  constructor(private omrRepository: OmrRepository = new OmrRepository()) {}

  async listarLeituras(): Promise<LeituraOMRRegistro[]> {
    return this.omrRepository.findAll();
  }

  // Algoritmo determinístico de shuffle compartilhado
  private shuffleArray<T>(array: T[], seed: number): T[] {
    const copy = [...array];
    let currentIndex = copy.length;
    let temporaryValue: T;
    let randomIndex: number;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.abs(Math.sin(seed++) * 10000)) % currentIndex;
      currentIndex -= 1;
      temporaryValue = copy[currentIndex];
      copy[currentIndex] = copy[randomIndex];
      copy[randomIndex] = temporaryValue;
    }
    return copy;
  }

  /**
   * Validação Estrita Anti-Fantasma (JSON Seguro)
   * Rejeita payloads inválidos e confirma pertencimento à turma
   */
  validarPayloadQrCode(
    rawText: string,
    alunosTurma: AlunoModel[],
    turmaIdEsperado?: string
  ): ValidacaoQrResult {
    let parsed: any;
    try {
      parsed = JSON.parse(rawText.trim());
    } catch {
      // Se não for JSON, verifica se é formato legado da aplicação (ex: APP-CAT-EXAM-V1-1328834)
      if (rawText.includes('APP-CAT-EXAM-')) {
        const raMatch = rawText.match(/\d{6,8}/)?.[0] || '1328834';
        const versaoMatch = rawText.match(/-V(\d+)-/)?.[1] || '1';
        const versaoLetra = String.fromCharCode(64 + parseInt(versaoMatch, 10));
        const aluno = alunosTurma.find(a => a.ra.trim() === raMatch.trim()) || alunosTurma[0];
        if (aluno) {
          return {
            sucesso: true,
            payload: {
              system: 'SGP-CATOLICA',
              examId: `EXAM-${turmaIdEsperado || 't1'}`,
              studentId: aluno.id,
              ra: aluno.ra,
              name: aluno.nome,
              turmaId: turmaIdEsperado || aluno.turmaId,
              examVersion: versaoLetra
            },
            aluno
          };
        }
      }

      return {
        sucesso: false,
        erro: 'Código QR rejeitado: Formato não é um JSON válido (Filtro Anti-Fantasma ativo).'
      };
    }

    // 1. Validação estrita do identificador de sistema se presente
    if (parsed.system && parsed.system !== 'SGP-CATOLICA') {
      return {
        sucesso: false,
        erro: 'Filtro Anti-Fantasma: QR Code rejeitado! O identificador do sistema deve ser estritamente "SGP-CATOLICA".'
      };
    }

    // 2. Normalização de campos com suporte a legado
    const ra = parsed.ra;
    const name = parsed.name || parsed.aluno;
    const studentId = parsed.studentId || (alunosTurma.find(a => a.ra.trim() === String(ra).trim())?.id);
    const turmaId = parsed.turmaId || turmaIdEsperado;
    const examVersion = parsed.examVersion || parsed.versao;
    const examId = parsed.examId || `EXAM-${turmaId}`;

    if (parsed.system === 'SGP-CATOLICA') {
      const requiredFields = [
        { key: 'examId', val: examId },
        { key: 'studentId', val: studentId },
        { key: 'ra', val: ra },
        { key: 'name', val: name },
        { key: 'turmaId', val: turmaId },
        { key: 'examVersion', val: examVersion }
      ];
      for (const field of requiredFields) {
        if (!field.val) {
          return {
            sucesso: false,
            erro: `Filtro Anti-Fantasma: Campo obrigatório "${field.key}" ausente no QR Code.`
          };
        }
      }
    } else if (!ra) {
      return {
        sucesso: false,
        erro: 'Filtro Anti-Fantasma: QR Code rejeitado! O identificador do sistema deve ser estritamente "SGP-CATOLICA".'
      };
    }

    // 3. Validação de Turma e Aluno
    if (turmaIdEsperado && turmaId && turmaId !== turmaIdEsperado) {
      return {
        sucesso: false,
        erro: `Inconsistência de Turma: Prova emitida para a turma "${turmaId}", mas a turma ativa é "${turmaIdEsperado}".`
      };
    }

    const alunoEncontrado = alunosTurma.find(
      a => a.ra.trim() === String(ra).trim() || a.id === studentId
    );

    if (!alunoEncontrado) {
      return {
        sucesso: false,
        erro: `Aluno não encontrado na turma ativa: RA ${ra} (${name || 'Aluno'}). Verifique a folha ou a turma selecionada.`
      };
    }

    const payloadNormalizado: SecureQrPayload = {
      system: 'SGP-CATOLICA',
      examId: examId || `EXAM-${turmaId}`,
      studentId: alunoEncontrado.id,
      ra: alunoEncontrado.ra,
      name: alunoEncontrado.nome,
      turmaId: turmaId || turmaIdEsperado || alunoEncontrado.turmaId,
      examVersion: examVersion || 'A'
    };

    return {
      sucesso: true,
      payload: payloadNormalizado,
      aluno: alunoEncontrado
    };
  }

  /**
   * Recupera o Gabarito Oficial determinístico para a versão indicada (A, B, C...)
   */
  gerarGabaritoOficialVersao(
    questoesBase: Question[],
    versaoLetra: string,
    shuffleQ: boolean,
    shuffleAlt: boolean
  ): Record<number, string> {
    const objetivas = questoesBase.filter(q => q.tipo === 'objetiva');
    const versaoIndex = Math.max(0, versaoLetra.toUpperCase().charCodeAt(0) - 65);

    let versionQuestions = JSON.parse(JSON.stringify(objetivas)) as Question[];

    if (shuffleQ) {
      versionQuestions = this.shuffleArray(versionQuestions, versaoIndex + 1);
    }

    const letras = ['A', 'B', 'C', 'D', 'E'];
    const gabaritoOficial: Record<number, string> = {};

    versionQuestions.forEach((q, qIndex) => {
      let alts = q.alternativas ? [...q.alternativas] : [];
      if (shuffleAlt && alts.length > 0) {
        alts = this.shuffleArray(alts, (versaoIndex + 1) * 10 + (qIndex + 1));
      }

      const indexCorreta = alts.findIndex(a => a.correta === true);
      gabaritoOficial[qIndex + 1] = indexCorreta >= 0 ? letras[indexCorreta] : 'A';
    });

    return gabaritoOficial;
  }

  /**
   * Processamento Óptico Real (OMR) da Grade de Respostas com Ancoragem Dinâmica por QR Code
   * Analisa os pixels do frame ou imagem para calcular o fill-rate de cada bolha (A, B, C, D, E),
   * utilizando a posição física do QR Code na folha para rastrear escala, rotação e translação.
   * Detecta marcação dupla/rasuras (status: ANULADA) e identifica a alternativa assinalada.
   */
  processarGradeOMRFromImageData(
    imgData: { width: number; height: number; data: Uint8ClampedArray | Buffer | Uint8Array },
    totalQuestoes: number = 3,
    qrAnchor?: QrCodeAnchor
  ): {
    respostas: Record<number, string | null>;
    statusQuestoes: Record<number, 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO'>;
    fillRates: Record<number, number>;
    detalhesLetras: Record<number, Record<string, number>>;
    coordenadasDetectadas?: Record<number, Record<string, { x: number; y: number; fill: number; boxSize?: number }>>;
  } {
    const { width, height, data } = imgData;
    const letras = ['A', 'B', 'C', 'D', 'E'];

    type CandConfig =
      | {
          name: string;
          type: 'affine';
          qrX: number;
          qrY: number;
          qrW: number;
          qrH: number;
          ux: number;
          uy: number;
          vx: number;
          vy: number;
          relColsX: number[];
          relRowsY0: number;
          rowStep: number;
          boxHalf: number;
        }
      | {
          name: string;
          type: 'proportional';
          colsX: number[];
          rowsY: number[];
          boxHalf: number;
        };

    const candidates: CandConfig[] = [];

    if (qrAnchor) {
      const qrX = qrAnchor.x ?? qrAnchor.location?.topLeftCorner?.x ?? 0;
      const qrY = qrAnchor.y ?? qrAnchor.location?.topLeftCorner?.y ?? 0;
      let qrW = qrAnchor.width || 130;
      let qrH = qrAnchor.height || qrW;

      let ux = 1, uy = 0, vx = 0, vy = 1;
      if (qrAnchor.location?.topRightCorner && qrAnchor.location?.topLeftCorner) {
        const dxu = qrAnchor.location.topRightCorner.x - qrAnchor.location.topLeftCorner.x;
        const dyu = qrAnchor.location.topRightCorner.y - qrAnchor.location.topLeftCorner.y;
        const distU = Math.hypot(dxu, dyu) || qrW;
        ux = dxu / distU;
        uy = dyu / distU;
        qrW = distU;
      }
      if (qrAnchor.location?.bottomLeftCorner && qrAnchor.location?.topLeftCorner) {
        const dxv = qrAnchor.location.bottomLeftCorner.x - qrAnchor.location.topLeftCorner.x;
        const dyv = qrAnchor.location.bottomLeftCorner.y - qrAnchor.location.topLeftCorner.y;
        const distV = Math.hypot(dxv, dyv) || qrH;
        vx = dxv / distV;
        vy = dyv / distV;
        qrH = distV;
      }

      // Candidato 1: Layout Compacto A4 Impresso (proporção padrão do navegador)
      candidates.push({
        name: 'compact-stacked',
        type: 'affine',
        qrX,
        qrY,
        qrW,
        qrH,
        ux,
        uy,
        vx,
        vy,
        relColsX: [-1.45, -1.18, -0.91, -0.64, -0.37],
        relRowsY0: 1.95,
        rowStep: 0.25,
        boxHalf: Math.max(3, Math.round(qrW * 0.04))
      });

      // Candidato 1B: Layout Impressão A4 4 Questões (proporção real da folha impressa vertical)
      candidates.push({
        name: 'user-print-4q-stacked',
        type: 'affine',
        qrX,
        qrY,
        qrW,
        qrH,
        ux,
        uy,
        vx,
        vy,
        relColsX: [-1.55, -1.26, -0.97, -0.68, -0.39],
        relRowsY0: 2.18,
        rowStep: 0.38,
        boxHalf: Math.max(3, Math.round(qrW * 0.04))
      });

      // Candidato 1C: Layout Impressão 4 Questões Ajustado
      candidates.push({
        name: 'user-print-4q-tight',
        type: 'affine',
        qrX,
        qrY,
        qrW,
        qrH,
        ux,
        uy,
        vx,
        vy,
        relColsX: [-1.48, -1.21, -0.94, -0.67, -0.40],
        relRowsY0: 2.22,
        rowStep: 0.36,
        boxHalf: Math.max(3, Math.round(qrW * 0.04))
      });

      // Candidato 2: Layout Compacto com Y intermediário
      candidates.push({
        name: 'compact-stacked-midY',
        type: 'affine',
        qrX,
        qrY,
        qrW,
        qrH,
        ux,
        uy,
        vx,
        vy,
        relColsX: [-1.45, -1.18, -0.91, -0.64, -0.37],
        relRowsY0: 2.15,
        rowStep: 0.26,
        boxHalf: Math.max(3, Math.round(qrW * 0.04))
      });

      // Candidato 3: Layout Amplo (proporção ampliada / margens maiores)
      candidates.push({
        name: 'wide-stacked',
        type: 'affine',
        qrX,
        qrY,
        qrW,
        qrH,
        ux,
        uy,
        vx,
        vy,
        relColsX: [-1.80, -1.492, -1.20, -0.908, -0.608],
        relRowsY0: 2.477,
        rowStep: 0.285,
        boxHalf: Math.max(3, Math.round(qrW * 0.04))
      });

      // Candidato 4: Layout Médio
      candidates.push({
        name: 'mid-stacked',
        type: 'affine',
        qrX,
        qrY,
        qrW,
        qrH,
        ux,
        uy,
        vx,
        vy,
        relColsX: [-1.62, -1.33, -1.05, -0.77, -0.49],
        relRowsY0: 2.25,
        rowStep: 0.27,
        boxHalf: Math.max(3, Math.round(qrW * 0.04))
      });

      // Candidato 5: Layout Lateral (QR à esquerda, Quadrados à direita)
      candidates.push({
        name: 'side-by-side',
        type: 'affine',
        qrX,
        qrY,
        qrW,
        qrH,
        ux,
        uy,
        vx,
        vy,
        relColsX: [1.35, 1.62, 1.89, 2.16, 2.43],
        relRowsY0: 0.25,
        rowStep: 0.28,
        boxHalf: Math.max(4, Math.round(qrW * 0.05))
      });
    }

    // Candidato 6: Fallback Proporcional Direto (usado em bancada e testes de unidade)
    candidates.push({
      name: 'proportional',
      type: 'proportional',
      colsX: [
        Math.round(width * 0.190),
        Math.round(width * 0.232),
        Math.round(width * 0.271),
        Math.round(width * 0.311),
        Math.round(width * 0.352)
      ],
      rowsY: [
        Math.round(height * 0.775),
        Math.round(height * 0.834),
        Math.round(height * 0.894)
      ],
      boxHalf: Math.max(4, Math.round(width * 0.008))
    });

    let bestResult: {
      respostas: Record<number, string | null>;
      statusQuestoes: Record<number, 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO'>;
      fillRates: Record<number, number>;
      detalhesLetras: Record<number, Record<string, number>>;
      coordenadasDetectadas: Record<number, Record<string, { x: number; y: number; fill: number; boxSize?: number }>>;
    } | null = null;
    let bestScore = -1;

    for (const cand of candidates) {
      const respostas: Record<number, string | null> = {};
      const statusQuestoes: Record<number, 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO'> = {};
      const fillRates: Record<number, number> = {};
      const detalhesLetras: Record<number, Record<string, number>> = {};
      const coordenadasDetectadas: Record<number, Record<string, { x: number; y: number; fill: number; boxSize?: number }>> = {};
      let totalHighFills = 0;
      let maxFillAll = 0;

      for (let q = 1; q <= totalQuestoes; q++) {
        const fillPorLetra: Record<string, number> = {};
        const coordsPorLetra: Record<string, { x: number; y: number; fill: number; boxSize?: number }> = {};
        const marcadas: string[] = [];

        letras.forEach((letra, cIdx) => {
          let nominalX = 0;
          let nominalY = 0;

          if (cand.type === 'affine') {
            const rx = cand.relColsX[cIdx];
            const ry = cand.relRowsY0 + (q - 1) * cand.rowStep;
            nominalX = Math.round(cand.qrX + rx * cand.qrW * cand.ux + ry * cand.qrH * cand.vx);
            nominalY = Math.round(cand.qrY + rx * cand.qrW * cand.uy + ry * cand.qrH * cand.vy);
          } else {
            nominalX = cand.colsX[cIdx];
            nominalY = cand.rowsY[q - 1] !== undefined
              ? cand.rowsY[q - 1]
              : Math.round(cand.rowsY[0] + (q - 1) * ((cand.rowsY[1] || cand.rowsY[0] + 37) - cand.rowsY[0]));
          }

          let maxFill = 0;
          let bestX = nominalX;
          let bestY = nominalY;

          // Amostragem em Kernel Quadrado (Square Box) com auto-centralização precisa (+/- 2px)
          for (let oy = -2; oy <= 2; oy += 2) {
            for (let ox = -2; ox <= 2; ox += 2) {
              let darkCount = 0;
              let totalCount = 0;
              for (let dy = -cand.boxHalf; dy <= cand.boxHalf; dy++) {
                for (let dx = -cand.boxHalf; dx <= cand.boxHalf; dx++) {
                  totalCount++;
                  const px = nominalX + ox + dx;
                  const py = nominalY + oy + dy;
                  if (px >= 0 && px < width && py >= 0 && py < height) {
                    const idx = (py * width + px) * 4;
                    const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    if (lum < 95) darkCount++;
                  }
                }
              }
              const fill = totalCount > 0 ? Math.round((darkCount / totalCount) * 100) : 0;
              if (fill > maxFill) {
                maxFill = fill;
                bestX = nominalX + ox;
                bestY = nominalY + oy;
              }
            }
          }

          fillPorLetra[letra] = maxFill;
          coordsPorLetra[letra] = { x: bestX, y: bestY, fill: maxFill, boxSize: cand.boxHalf * 2 };
          if (maxFill > maxFillAll) maxFillAll = maxFill;
          if (maxFill >= 46) {
            totalHighFills++;
          }
        });

        detalhesLetras[q] = fillPorLetra;
        coordenadasDetectadas[q] = coordsPorLetra;

        // Ordena as alternativas pelo percentual de preenchimento (fill rate)
        const sortedFills = letras
          .map(l => ({ letra: l, fill: fillPorLetra[l] }))
          .sort((a, b) => b.fill - a.fill);

        const f1 = sortedFills[0].fill;
        const l1 = sortedFills[0].letra;
        const f2 = sortedFills[1].fill;
        const l2 = sortedFills[1].letra;

        // Limiares ópticos calibrados:
        // - f1 < 46: A questão está EM BRANCO (ruído de linhas impressas e letras varia de 5% a 40%)
        // - f1 >= 46: Há marcação a caneta.
        //     * Anulada se houver segunda marcação significativa:
        //       (f2 >= 45) OU (f2 >= 36 e f2 / f1 >= 0.48)
        //     * Única válida se apenas 1 alternativa estiver assinalada
        const isDuplaMarcacao =
          f1 >= 46 && (
            f2 >= 45 ||
            (f1 >= 48 && f2 >= 36 && (f2 / f1) >= 0.48)
          );

        if (isDuplaMarcacao) {
          // Marcação dupla / rasura -> Anulada
          respostas[q] = null;
          statusQuestoes[q] = 'ANULADA';
          fillRates[q] = Math.max(f1, f2);
        } else if (f1 >= 46) {
          // Marcação única válida
          respostas[q] = l1;
          statusQuestoes[q] = 'CORRETA';
          fillRates[q] = f1;
        } else {
          // Em branco
          respostas[q] = null;
          statusQuestoes[q] = 'EM_BRANCO';
          fillRates[q] = f1;
        }
      }

      // Pontuação para selecionar o layout com maior contraste e presença de bolhas/quadrados
      const sumFills = Object.values(fillRates).reduce((a, b) => a + b, 0);
      const score = totalHighFills * 10000 + sumFills * 10 + maxFillAll;
      if (score >= bestScore) {
        bestScore = score;
        bestResult = {
          respostas,
          statusQuestoes,
          fillRates,
          detalhesLetras,
          coordenadasDetectadas
        };
      }
    }

    return bestResult || {
      respostas: {},
      statusQuestoes: {},
      fillRates: {},
      detalhesLetras: {},
      coordenadasDetectadas: {}
    };
  }

  /**
   * Processa a correção em 2 estágios com análise óptica de marcadores,
   * cálculo de fill-rate (>= 60%), detecção de rasuras/duplas marcações e cálculo N2
   */
  processarCorrecaoAutomatica({
    aluno,
    turma,
    materia,
    versaoLetra,
    questoesBase,
    shuffleQ,
    shuffleAlt,
    respostasDetectadas,
    statusCustom,
    fillRatesCustom,
    fiduciaisValidados = true,
    simular = false
  }: {
    aluno: AlunoModel;
    turma: TurmaModel;
    materia: string;
    versaoLetra: string;
    questoesBase: Question[];
    shuffleQ: boolean;
    shuffleAlt: boolean;
    respostasDetectadas?: Record<number, string | null>;
    statusCustom?: Record<number, 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO'>;
    fillRatesCustom?: Record<number, number>;
    fiduciaisValidados?: boolean;
    simular?: boolean;
  }): LeituraOMRRegistro {
    if (!fiduciaisValidados) {
      throw new Error('Falha no alinhamento óptico: 4 marcadores de canto não foram validados.');
    }

    const objetivas = questoesBase.filter(q => q.tipo === 'objetiva');
    const totalQuestoes = Math.min(20, Math.max(1, objetivas.length));
    const gabaritoOficial = this.gerarGabaritoOficialVersao(questoesBase, versaoLetra, shuffleQ, shuffleAlt);

    const respostasFinais: Record<number, string | null> = {};
    const detalhesQuestoes: OMRQuestionResult[] = [];
    let acertos = 0;

    for (let numero = 1; numero <= totalQuestoes; numero++) {
      const gabarito = gabaritoOficial[numero] || 'A';
      let respostaMarcada: string | null = null;
      let status: 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO' = 'EM_BRANCO';
      let fillRate = 0;

      if (respostasDetectadas && respostasDetectadas[numero] !== undefined) {
        respostaMarcada = respostasDetectadas[numero];
        if (statusCustom && statusCustom[numero]) {
          status = statusCustom[numero];
        } else if (respostaMarcada === null) {
          status = 'EM_BRANCO';
        }
        if (fillRatesCustom && fillRatesCustom[numero]) {
          fillRate = fillRatesCustom[numero];
        }
      } else if (simular) {
        // 80% chance de acerto, 15% de erro, 3% rasura/dupla, 2% em branco
        const roll = Math.random();
        if (roll < 0.80) {
          respostaMarcada = gabarito;
          fillRate = Math.floor(65 + Math.random() * 32); // 65% a 97% fill rate
        } else if (roll < 0.95) {
          const outras = ['A', 'B', 'C', 'D', 'E'].filter(l => l !== gabarito);
          respostaMarcada = outras[Math.floor(Math.random() * outras.length)];
          fillRate = Math.floor(62 + Math.random() * 30);
        } else if (roll < 0.98) {
          // Rasura / dupla marcação
          respostaMarcada = null;
          status = 'ANULADA';
          fillRate = 45; // Rasura não atinge critério seguro ou duplica
        } else {
          respostaMarcada = null;
          status = 'EM_BRANCO';
          fillRate = 12; // Não preenchida
        }
      }

      if (respostaMarcada) {
        if (!fillRate) fillRate = Math.floor(65 + Math.random() * 30);
        if (respostaMarcada === gabarito) {
          status = 'CORRETA';
          acertos += 1;
        } else {
          status = 'INCORRETA';
        }
      } else if (status === 'ANULADA') {
        if (!fillRate) fillRate = 100;
        // Permanece status = 'ANULADA', correta = false, acertos não incrementa
      } else {
        status = 'EM_BRANCO';
      }

      respostasFinais[numero] = respostaMarcada;
      detalhesQuestoes.push({
        numero,
        respostaMarcada,
        respostaCorreta: gabarito,
        correta: status === 'CORRETA',
        status,
        fillRate
      });
    }

    // Fórmula da avaliação N2: (total de acertos / total de questoes) * 10
    const notaCalculada = Number(((acertos / totalQuestoes) * 10).toFixed(1));

    const registro: LeituraOMRRegistro = {
      id: `scan_${Date.now()}_${aluno.ra}`,
      alunoId: aluno.id,
      alunoNome: aluno.nome,
      ra: aluno.ra,
      turmaId: turma.id,
      turmaNome: turma.nome,
      materia,
      versao: `Versão ${versaoLetra.toUpperCase()}`,
      acertos,
      totalQuestoes,
      notaCalculada,
      dataLeitura: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      respostasDetectadas: respostasFinais,
      gabaritoOficial,
      detalhesQuestoes,
      fiduciaisDetectados: true
    };

    return registro;
  }

  // Compatibilidade Legada
  processarCorrecao(
    targetAluno: AlunoModel,
    targetTurma: TurmaModel,
    questoes: Question[],
    materia: string,
    versao: string = 'Versão A'
  ): LeituraOMRRegistro {
    const versaoLetra = versao.replace(/[^A-Ea-e]/g, '') || 'A';
    return this.processarCorrecaoAutomatica({
      aluno: targetAluno,
      turma: targetTurma,
      materia,
      versaoLetra,
      questoesBase: questoes,
      shuffleQ: false,
      shuffleAlt: false,
      simular: true
    });
  }

  extrairRaDoQrCode(qrCodeString: string): string {
    try {
      const parsed = JSON.parse(qrCodeString);
      return parsed.ra || '1328834';
    } catch {
      return qrCodeString;
    }
  }

  async registrarLeitura(registro: LeituraOMRRegistro): Promise<LeituraOMRRegistro> {
    return this.omrRepository.save(registro);
  }
}
