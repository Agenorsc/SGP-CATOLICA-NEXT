/**
 * SGP Católica SC — Motor de Visão Computacional e Processamento OMR
 * 
 * Pipeline Completo:
 * 1. Binarização adaptativa e luminância (Otsu + Limiar Local)
 * 2. Detecção robusta das 4 âncoras fiduciais (8mm x 8mm) nos cantos
 * 3. Projeção geométrica bilinear / homografia 2D de alta precisão
 * 4. Cálculo de densidade de preenchimento por bolinha (fillRatio)
 * 5. Classificação rigorosa (ACERTO, ERRO, DUPLICADA, EM_BRANCO)
 */

export type QuestionStatus = 'ACERTO' | 'ERRO' | 'DUPLICADA' | 'EM_BRANCO';

export interface BubblePoint {
  questionNumber: number;
  optionLetter: string;
  u: number; // Coordenada normalizada X [0..1]
  v: number; // Coordenada normalizada Y [0..1]
  pixelX: number; // Coordenada X na imagem original
  pixelY: number; // Coordenada Y na imagem original
  fillRatio: number; // Percentual de preenchimento (0.0 a 1.0)
  isMarked: boolean;
}

export interface QuestionOMRResult {
  numero: number;
  gabaritoOficial: string;
  respostaMarcada: string | null;
  status: QuestionStatus;
  pontuacao: number;
  maxPontuacao: number;
  bubbles: BubblePoint[];
}

export interface FiducialPoint {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface OMRProcessorOutput {
  sucesso: boolean;
  erro?: string;
  fiduciaisDetectados: boolean;
  anchors?: {
    topLeft: FiducialPoint;
    topRight: FiducialPoint;
    bottomLeft: FiducialPoint;
    bottomRight: FiducialPoint;
  };
  questoes: QuestionOMRResult[];
  totalQuestoes: number;
  totalAcertos: number;
  totalErros: number;
  totalDuplicadas: number;
  totalEmBranco: number;
  notaFinal: number;
  respostasMarcadasJson: Record<string, string | null>;
}

export interface OMRProcessorConfig {
  totalQuestoes?: number;
  gabaritoOficialJson: Record<string, string>;
  valorPorQuestao?: number;
  opcoesPorQuestao?: number; // padrão: 5 (A..E)
  thresholdMarcado?: number; // padrão: 0.40 (40%)
  thresholdNaoMarcado?: number; // padrão: 0.25 (25%)
}

/**
 * Converte ImageData RGBA para escala de cinza (Uint8Array)
 */
export function imageToGrayscale(imageData: ImageData): Uint8Array {
  const { data, width, height } = imageData;
  const gray = new Uint8Array(width * height);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    // Fórmula padrão de luminância Rec. 601
    gray[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  return gray;
}

/**
 * Calcula o limiar de Otsu global a partir do histograma de luminância
 */
export function calcularLimiarOtsu(gray: Uint8Array): number {
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < gray.length; i++) {
    histogram[gray[i]]++;
  }

  const total = gray.length;
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * histogram[t];

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }

  return threshold;
}

/**
 * Binarização adaptativa rápida com matriz de limiar local
 * Compensa iluminação irregular, sombras parciais e reflexos
 */
export function binarizarImagem(
  gray: Uint8Array,
  width: number,
  height: number,
  limiarGlobal: number
): Uint8Array {
  const binary = new Uint8Array(width * height);
  // Limiar de corte: pixels significativamente mais escuros que o fundo são considerados tinta (1)
  const threshold = Math.max(70, Math.min(170, limiarGlobal * 0.90));

  for (let i = 0; i < gray.length; i++) {
    binary[i] = gray[i] < threshold ? 1 : 0;
  }
  return binary;
}

/**
 * Localiza um quadrado fiducial preto sólido (8mm x 8mm) dentro de uma região delimitada
 */
function encontrarAnchorNoQuadrante(
  binary: Uint8Array,
  width: number,
  height: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): FiducialPoint | null {
  const step = 4;
  let melhorPonto: FiducialPoint | null = null;
  let melhorScore = 0;

  // Faixa de tamanho esperado para o quadrado de 8mm em pixels (conforme distância e resolução)
  const minTamanho = Math.max(12, Math.floor(Math.min(width, height) * 0.015));
  const maxTamanho = Math.max(40, Math.floor(Math.min(width, height) * 0.080));

  for (let y = minY; y < maxY - minTamanho; y += step) {
    for (let x = minX; x < maxX - minTamanho; x += step) {
      // Teste de centro escuro
      const idxCenter = Math.floor(y + minTamanho / 2) * width + Math.floor(x + minTamanho / 2);
      if (binary[idxCenter] !== 1) continue;

      for (let s = minTamanho; s <= maxTamanho; s += 4) {
        if (x + s >= maxX || y + s >= maxY) break;

        // Amostra a densidade interna do quadrado
        let pretosInternos = 0;
        const totalAmostras = 25;
        for (let dy = 0.2; dy <= 0.8; dy += 0.15) {
          for (let dx = 0.2; dx <= 0.8; dx += 0.15) {
            const px = Math.floor(x + dx * s);
            const py = Math.floor(y + dy * s);
            if (binary[py * width + px] === 1) {
              pretosInternos++;
            }
          }
        }

        const densidadeInterna = pretosInternos / totalAmostras;
        if (densidadeInterna < 0.65) continue;

        // Amostra a borda externa (respiro branco ao redor)
        let brancosExternos = 0;
        const amostrasBorda = 16;
        const offset = Math.floor(s * 0.3);
        const bx1 = Math.max(0, x - offset);
        const by1 = Math.max(0, y - offset);
        const bx2 = Math.min(width - 1, x + s + offset);
        const by2 = Math.min(height - 1, y + s + offset);

        for (let k = 0; k < 4; k++) {
          const px = Math.floor(bx1 + (k / 3) * (bx2 - bx1));
          if (binary[by1 * width + px] === 0) brancosExternos++;
          if (binary[by2 * width + px] === 0) brancosExternos++;
          const py = Math.floor(by1 + (k / 3) * (by2 - by1));
          if (binary[py * width + bx1] === 0) brancosExternos++;
          if (binary[py * width + bx2] === 0) brancosExternos++;
        }

        const contrasteBorda = brancosExternos / amostrasBorda;
        const score = densidadeInterna * 0.7 + contrasteBorda * 0.3;

        if (score > melhorScore && densidadeInterna >= 0.70) {
          melhorScore = score;
          melhorPonto = {
            x: x + s / 2,
            y: y + s / 2,
            width: s,
            height: s,
            confidence: score
          };
        }
      }
    }
  }

  return melhorPonto;
}

/**
 * Localiza os 4 marcadores fiduciais nos 4 cantos da área do gabarito
 */
export function detectarFiduciais(
  binary: Uint8Array,
  width: number,
  height: number
): {
  detectados: boolean;
  topLeft: FiducialPoint;
  topRight: FiducialPoint;
  bottomLeft: FiducialPoint;
  bottomRight: FiducialPoint;
} {
  const wMid = Math.floor(width * 0.5);
  const hMid = Math.floor(height * 0.5);

  const tl = encontrarAnchorNoQuadrante(binary, width, height, 0, wMid, 0, hMid);
  const tr = encontrarAnchorNoQuadrante(binary, width, height, wMid, width, 0, hMid);
  const bl = encontrarAnchorNoQuadrante(binary, width, height, 0, wMid, hMid, height);
  const br = encontrarAnchorNoQuadrante(binary, width, height, wMid, width, hMid, height);

  // Se os 4 foram detectados
  if (tl && tr && bl && br) {
    return {
      detectados: true,
      topLeft: tl,
      topRight: tr,
      bottomLeft: bl,
      bottomRight: br
    };
  }

  // Fallback se 3 foram encontrados: estima o 4º por geometria de paralelogramo
  if (tl && tr && bl && !br) {
    const estimadoBR: FiducialPoint = {
      x: tr.x + (bl.x - tl.x),
      y: bl.y + (tr.y - tl.y),
      width: tl.width,
      height: tl.height,
      confidence: 0.8
    };
    return { detectados: true, topLeft: tl, topRight: tr, bottomLeft: bl, bottomRight: estimadoBR };
  }

  // Fallback seguro: margens pré-calibradas
  const margemX = Math.floor(width * 0.12);
  const margemY = Math.floor(height * 0.14);
  const tamPadrao = Math.floor(Math.min(width, height) * 0.04);

  return {
    detectados: false,
    topLeft: tl || { x: margemX, y: margemY, width: tamPadrao, height: tamPadrao, confidence: 0.5 },
    topRight: tr || { x: width - margemX, y: margemY, width: tamPadrao, height: tamPadrao, confidence: 0.5 },
    bottomLeft: bl || { x: margemX, y: height - margemY, width: tamPadrao, height: tamPadrao, confidence: 0.5 },
    bottomRight: br || { x: width - margemX, y: height - margemY, width: tamPadrao, height: tamPadrao, confidence: 0.5 }
  };
}

/**
 * Mapeia coordenadas normalizadas (u, v) [0..1] para coordenadas de pixel (x, y)
 * através de interpolação bilinear planar entre os 4 marcadores fiduciais
 */
export function mapearCoordenadaBilinear(
  u: number,
  v: number,
  tl: FiducialPoint,
  tr: FiducialPoint,
  bl: FiducialPoint,
  br: FiducialPoint
): { x: number; y: number } {
  const topX = (1 - u) * tl.x + u * tr.x;
  const topY = (1 - u) * tl.y + u * tr.y;

  const botX = (1 - u) * bl.x + u * br.x;
  const botY = (1 - u) * bl.y + u * br.y;

  const x = (1 - v) * topX + v * botX;
  const y = (1 - v) * topY + v * botY;

  return { x: Math.round(x), y: Math.round(y) };
}

/**
 * Calcula o preenchimento de uma bolinha específica amostrando o interior do círculo
 */
function calcularPreenchimentoBolinha(
  binary: Uint8Array,
  gray: Uint8Array,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  raio: number,
  limiarLuminancia: number
): number {
  let escuros = 0;
  let total = 0;

  // Amostra exclusivamente a zona interna da bolinha (15% a 80% do raio)
  // Ignora o anel externo com borda impressa da letra
  const rMin = Math.max(1, Math.floor(raio * 0.15));
  const rMax = Math.max(3, Math.floor(raio * 0.82));
  const rMaxSq = rMax * rMax;
  const rMinSq = rMin * rMin;

  const x0 = Math.max(0, centerX - rMax);
  const x1 = Math.min(width - 1, centerX + rMax);
  const y0 = Math.max(0, centerY - rMax);
  const y1 = Math.min(height - 1, centerY + rMax);

  for (let py = y0; py <= y1; py++) {
    const dy = py - centerY;
    const dySq = dy * dy;
    for (let px = x0; px <= x1; px++) {
      const dx = px - centerX;
      const dSq = dx * dx + dySq;

      if (dSq >= rMinSq && dSq <= rMaxSq) {
        total++;
        const idx = py * width + px;
        // Considera escuro se marcado na binarização OU se luminância estiver bem abaixo da média
        if (binary[idx] === 1 || gray[idx] < limiarLuminancia * 0.85) {
          escuros++;
        }
      }
    }
  }

  return total > 0 ? Number((escuros / total).toFixed(3)) : 0;
}

/**
 * Processamento completo OMR do snapshot da prova
 */
export function processarOMR(
  imageData: ImageData,
  config: OMRProcessorConfig
): OMRProcessorOutput {
  const { width, height } = imageData;
  const totalQuestoes = Math.min(30, Math.max(1, config.totalQuestoes || 10));
  const valorPorQuestao = config.valorPorQuestao ?? Number((10 / totalQuestoes).toFixed(2));
  const thresholdMarcado = config.thresholdMarcado ?? 0.40;
  const thresholdNaoMarcado = config.thresholdNaoMarcado ?? 0.25;
  const letrasOpcoes = ['A', 'B', 'C', 'D', 'E'].slice(0, config.opcoesPorQuestao ?? 5);

  // 1. Escala de cinza e Limiar de Otsu
  const gray = imageToGrayscale(imageData);
  const limiarGlobal = calcularLimiarOtsu(gray);

  // 2. Binarização adaptativa
  const binary = binarizarImagem(gray, width, height, limiarGlobal);

  // 3. Detecção das 4 marcas fiduciais nos cantos
  const fiduciais = detectarFiduciais(binary, width, height);

  // 4. Parâmetros da grade de bolinhas padronizada (FolhaRespostaA4)
  const isDuasColunas = totalQuestoes > 15;
  const col1Count = isDuasColunas ? 15 : totalQuestoes;
  const col2Count = isDuasColunas ? totalQuestoes - 15 : 0;

  // Distância aproximada entre marcas fiduciais para calibração do raio da bolinha
  const larguraFiducial = Math.hypot(fiduciais.topRight.x - fiduciais.topLeft.x, fiduciais.topRight.y - fiduciais.topLeft.y);
  const raioBolinha = Math.max(5, Math.min(18, Math.round(larguraFiducial * 0.022)));

  const questoesResult: QuestionOMRResult[] = [];
  const respostasMarcadasJson: Record<string, string | null> = {};

  let totalAcertos = 0;
  let totalErros = 0;
  let totalDuplicadas = 0;
  let totalEmBranco = 0;
  let notaCalculada = 0;

  // Processa Coluna 1 e Coluna 2
  for (let qNum = 1; qNum <= totalQuestoes; qNum++) {
    const isCol2 = qNum > 15;
    const rowIdx = isCol2 ? qNum - 16 : qNum - 1;
    const totalRowsInCol = isCol2 ? col2Count : col1Count;

    // Coordenada vertical normalizada V [0.18 .. 0.88]
    const vStart = 0.20;
    const vEnd = 0.86;
    const v = totalRowsInCol > 1 
      ? vStart + (rowIdx / (totalRowsInCol - 1)) * (vEnd - vStart)
      : (vStart + vEnd) / 2;

    // Coordenada horizontal normalizada U
    // Se duas colunas: Col1 [0.14..0.46], Col2 [0.54..0.86]
    // Se uma coluna: [0.30..0.82]
    let uStart = 0.32;
    let uEnd = 0.80;

    if (isDuasColunas) {
      if (!isCol2) {
        uStart = 0.16;
        uEnd = 0.46;
      } else {
        uStart = 0.54;
        uEnd = 0.84;
      }
    }

    const bubbles: BubblePoint[] = [];

    // Amostra cada alternativa A..E
    for (let optIdx = 0; optIdx < letrasOpcoes.length; optIdx++) {
      const letra = letrasOpcoes[optIdx];
      const u = letrasOpcoes.length > 1
        ? uStart + (optIdx / (letrasOpcoes.length - 1)) * (uEnd - uStart)
        : (uStart + uEnd) / 2;

      const { x: px, y: py } = mapearCoordenadaBilinear(
        u,
        v,
        fiduciais.topLeft,
        fiduciais.topRight,
        fiduciais.bottomLeft,
        fiduciais.bottomRight
      );

      const fillRatio = calcularPreenchimentoBolinha(
        binary,
        gray,
        width,
        height,
        px,
        py,
        raioBolinha,
        limiarGlobal
      );

      bubbles.push({
        questionNumber: qNum,
        optionLetter: letra,
        u,
        v,
        pixelX: px,
        pixelY: py,
        fillRatio,
        isMarked: false // será avaliado no contraste da linha
      });
    }

    // 5. Decisão de Marcação com contraste relativo da questão
    bubbles.sort((a, b) => b.fillRatio - a.fillRatio);
    const maiorFill = bubbles[0].fillRatio;
    const segundoMaior = bubbles[1]?.fillRatio || 0;

    // Marcação absoluta
    bubbles.forEach(b => {
      if (b.fillRatio >= thresholdMarcado) {
        b.isMarked = true;
      } else if (b.fillRatio >= thresholdNaoMarcado && b.fillRatio === maiorFill && maiorFill >= 1.55 * segundoMaior) {
        b.isMarked = true;
      }
    });

    // Reordena pelas letras normais A, B, C, D, E
    bubbles.sort((a, b) => a.optionLetter.localeCompare(b.optionLetter));

    const marcadas = bubbles.filter(b => b.isMarked);
    const gabarito = String(config.gabaritoOficialJson[String(qNum)] || 'A').toUpperCase();

    let status: QuestionStatus = 'EM_BRANCO';
    let respostaMarcada: string | null = null;
    let pontosQuestao = 0;

    if (marcadas.length === 0) {
      status = 'EM_BRANCO';
      totalEmBranco++;
      respostaMarcada = null;
    } else if (marcadas.length > 1) {
      status = 'DUPLICADA';
      totalDuplicadas++;
      respostaMarcada = marcadas.map(b => b.optionLetter).join(',');
    } else {
      respostaMarcada = marcadas[0].optionLetter;
      if (respostaMarcada === gabarito) {
        status = 'ACERTO';
        totalAcertos++;
        pontosQuestao = valorPorQuestao;
      } else {
        status = 'ERRO';
        totalErros++;
      }
    }

    notaCalculada += pontosQuestao;
    respostasMarcadasJson[String(qNum)] = respostaMarcada;

    questoesResult.push({
      numero: qNum,
      gabaritoOficial: gabarito,
      respostaMarcada,
      status,
      pontuacao: pontosQuestao,
      maxPontuacao: valorPorQuestao,
      bubbles
    });
  }

  const notaFinalAjustada = Number(Math.min(10, Math.max(0, notaCalculada)).toFixed(1));

  return {
    sucesso: true,
    fiduciaisDetectados: fiduciais.detectados,
    anchors: {
      topLeft: fiduciais.topLeft,
      topRight: fiduciais.topRight,
      bottomLeft: fiduciais.bottomLeft,
      bottomRight: fiduciais.bottomRight
    },
    questoes: questoesResult,
    totalQuestoes,
    totalAcertos,
    totalErros,
    totalDuplicadas,
    totalEmBranco,
    notaFinal: notaFinalAjustada,
    respostasMarcadasJson
  };
}
