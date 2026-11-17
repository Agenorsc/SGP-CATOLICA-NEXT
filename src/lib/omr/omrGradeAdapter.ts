/**
 * Adaptador entre o motor óptico comprovado (OmrService.processarGradeOMRFromImageData,
 * que usa o GridOmrEngine ancorado no QR Code — 100% no benchmark TSK-45) e o modelo de
 * resultado exibido na tela de conferência do <UnifiedOMRScanner />.
 *
 * Classificação estrita por questão:
 *  - 0 alternativas marcadas  → EM_BRANCO (0 pts)
 *  - 2+ alternativas marcadas → DUPLICADA (0 pts)
 *  - 1 marcada == gabarito    → ACERTO (pontos da questão)
 *  - 1 marcada != gabarito    → ERRO (0 pts)
 */
import type { BubblePoint, OMRProcessorOutput, QuestionOMRResult, QuestionStatus } from './omrProcessor';

const LETRAS = ['A', 'B', 'C', 'D', 'E'];

export interface SaidaMotorGrade {
  respostas: Record<number, string | null>;
  statusQuestoes: Record<number, 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO'>;
  fillRates: Record<number, number>;
  detalhesLetras: Record<number, Record<string, number>>;
  coordenadasDetectadas?: Record<number, Record<string, { x: number; y: number; fill: number; boxSize?: number }>>;
  confianca?: number;
  metodo?: string;
}

export interface ConfigClassificacao {
  totalQuestoes: number;
  gabarito: Record<string | number, string>;
  pontosPorQuestao: number[];
  opcoesPorQuestao: number[];
}

/** Letras consideradas marcadas numa questão (usado para destacar duplicidades). */
export function letrasMarcadas(
  fills: Record<string, number> | undefined,
  respostaMotor: string | null,
  statusMotor: string | undefined
): string[] {
  if (!fills) return respostaMotor ? [respostaMotor] : [];
  if (statusMotor === 'EM_BRANCO') return [];
  if (statusMotor !== 'ANULADA') return respostaMotor ? [respostaMotor] : [];
  // Duplicada: todas as letras com preenchimento próximo do mais escuro da linha
  const valores = Object.values(fills);
  const max = Math.max(...valores);
  const ordenados = [...valores].sort((a, b) => a - b);
  const mediana = ordenados[Math.floor(ordenados.length / 2)] ?? 0;
  const corte = Math.max(mediana + (max - mediana) * 0.5, max * 0.6);
  return Object.entries(fills)
    .filter(([, v]) => v >= corte)
    .map(([l]) => l);
}

export function classificarLeituraGrade(
  saida: SaidaMotorGrade,
  config: ConfigClassificacao
): OMRProcessorOutput {
  const questoes: QuestionOMRResult[] = [];
  const respostasMarcadasJson: Record<string, string | null> = {};
  let acertos = 0;
  let erros = 0;
  let duplicadas = 0;
  let emBranco = 0;
  let nota = 0;

  const detectouGrade = Object.keys(saida.respostas || {}).length > 0 ||
    Object.keys(saida.coordenadasDetectadas || {}).length > 0;

  for (let q = 1; q <= config.totalQuestoes; q++) {
    const correta = String(config.gabarito[q] ?? config.gabarito[String(q)] ?? '').toUpperCase();
    const maxPts = config.pontosPorQuestao[q - 1] ?? 10 / config.totalQuestoes;
    const fills = saida.detalhesLetras?.[q];
    const statusMotor = saida.statusQuestoes?.[q];
    const respostaMotor = saida.respostas?.[q] ?? null;
    const marcadas = letrasMarcadas(fills, respostaMotor, statusMotor);

    let status: QuestionStatus;
    let respostaMarcada: string | null = null;
    let pts = 0;

    if (marcadas.length === 0) {
      status = 'EM_BRANCO';
      emBranco++;
    } else if (marcadas.length >= 2 || statusMotor === 'ANULADA') {
      status = 'DUPLICADA';
      respostaMarcada = marcadas.join('+');
      duplicadas++;
    } else {
      respostaMarcada = marcadas[0];
      if (correta && respostaMarcada === correta) {
        status = 'ACERTO';
        pts = maxPts;
        acertos++;
      } else {
        status = 'ERRO';
        erros++;
      }
    }

    nota += pts;
    respostasMarcadasJson[String(q)] = respostaMarcada;

    const coords = saida.coordenadasDetectadas?.[q] || {};
    const nOpcoes = config.opcoesPorQuestao[q - 1] ?? 5;
    const bubbles: BubblePoint[] = LETRAS.slice(0, nOpcoes)
      .filter(l => coords[l])
      .map(l => ({
        questionNumber: q,
        optionLetter: l,
        u: 0,
        v: 0,
        pixelX: coords[l].x,
        pixelY: coords[l].y,
        fillRatio: Math.max(0, Math.min(1, (fills?.[l] ?? coords[l].fill ?? 0) / 100)),
        isMarked: marcadas.includes(l)
      }));

    questoes.push({
      numero: q,
      gabaritoOficial: correta,
      respostaMarcada,
      status,
      pontuacao: Number(pts.toFixed(2)),
      maxPontuacao: Number(maxPts.toFixed(2)),
      bubbles
    });
  }

  return {
    sucesso: detectouGrade,
    erro: detectouGrade ? undefined : 'Não foi possível localizar a grade de respostas na foto.',
    fiduciaisDetectados: detectouGrade && (saida.confianca ?? 1) >= 0.5,
    questoes,
    totalQuestoes: config.totalQuestoes,
    totalAcertos: acertos,
    totalErros: erros,
    totalDuplicadas: duplicadas,
    totalEmBranco: emBranco,
    notaFinal: Number(Math.min(10, nota).toFixed(2)),
    respostasMarcadasJson
  };
}
