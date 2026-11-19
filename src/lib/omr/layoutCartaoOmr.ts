/**
 * Layout geométrico ÚNICO do cartão de respostas óptico (padrão "lotérica").
 *
 * A mesma função é usada:
 *  - na IMPRESSÃO (CartaoRespostasOmr.tsx desenha um SVG com dimensões em milímetros);
 *  - na LEITURA (cartaoOmrEngine.ts projeta cada bolinha na foto via homografia).
 *
 * Todas as medidas estão em milímetros, no referencial cuja origem (0,0) é o CENTRO da
 * âncora fiducial superior-esquerda. As outras âncoras ficam em (Wf,0), (0,Hf) e (Wf,Hf).
 * Como o cartão é desenhado em mm absolutos, a posição de cada bolinha em relação às
 * 4 âncoras é exata, independentemente do navegador, da escala ou da impressora.
 */

export const VERSAO_LAYOUT_CARTAO = 2;

export const MEDIDAS_CARTAO = {
  /** Lado das 4 âncoras fiduciais (quadrados pretos sólidos). */
  LADO_FIDUCIAL: 8,
  /** Zona branca livre ao redor das âncoras (quiet zone). */
  ZONA_LIVRE: 3,
  /** Diâmetro externo de cada bolinha. */
  DIAMETRO_BOLHA: 5,
  /** Espessura da borda impressa da bolinha. */
  ESPESSURA_BORDA: 0.3,
  /** Distância entre centros de alternativas vizinhas (A→B). */
  PASSO_COLUNA: 6.6,
  /** Distância entre centros de questões vizinhas (Q1→Q2). */
  PASSO_LINHA: 6,
  /** Largura reservada ao rótulo "Q.01". */
  LARGURA_ROTULO: 9.5,
  /** Espaço entre o bloco Q1–Q15 e o bloco Q16–Q30. */
  ESPACO_BLOCOS: 7,
  /** Início horizontal do conteúdo (a partir do centro da âncora esquerda). */
  INICIO_X: 7.5,
  /** Linha do cabeçalho "a b c d e". */
  Y_CABECALHO: 0.8,
  /** Centro da primeira linha de bolinhas. */
  Y_PRIMEIRA_LINHA: 7,
  /** Margem entre a última bolinha e o centro das âncoras da direita. */
  MARGEM_DIREITA: 6.5,
  /** Margem entre a última linha e o centro das âncoras de baixo. */
  MARGEM_INFERIOR: 5.5,
  /** Máximo de questões por bloco vertical. */
  QUESTOES_POR_BLOCO: 15,
  /** Máximo de questões por cartão. */
  MAX_QUESTOES: 30
} as const;

export const LETRAS_CARTAO = ['A', 'B', 'C', 'D', 'E'];

export interface PontoMm {
  x: number;
  y: number;
}

export interface BolhaLayout extends PontoMm {
  questao: number;
  letra: string;
  indice: number;
}

export interface RotuloLayout extends PontoMm {
  questao: number;
  texto: string;
}

export interface CabecalhoLayout extends PontoMm {
  letra: string;
}

export interface LayoutCartaoOmr {
  versao: number;
  totalQuestoes: number;
  opcoesPorQuestao: number[];
  /** Distância horizontal entre os centros das âncoras esquerda→direita. */
  larguraFiduciais: number;
  /** Distância vertical entre os centros das âncoras superior→inferior. */
  alturaFiduciais: number;
  ladoFiducial: number;
  /** Distância do centro de uma âncora até a borda do SVG. */
  margemExterna: number;
  larguraTotal: number;
  alturaTotal: number;
  diametroBolha: number;
  espessuraBorda: number;
  passoColuna: number;
  passoLinha: number;
  /** Centros das âncoras: TL, TR, BL, BR. */
  fiduciais: { topLeft: PontoMm; topRight: PontoMm; bottomLeft: PontoMm; bottomRight: PontoMm };
  /** bolhas[q][c] = centro da alternativa c da questão q+1. */
  bolhas: BolhaLayout[][];
  rotulos: RotuloLayout[];
  cabecalhos: CabecalhoLayout[];
}

const normalizarOpcoes = (opcoes: number[]): number[] =>
  opcoes
    .slice(0, MEDIDAS_CARTAO.MAX_QUESTOES)
    .map(o => {
      const n = Math.round(Number(o));
      return Number.isFinite(n) && n >= 2 && n <= 5 ? n : 5;
    });

const arred = (v: number) => Math.round(v * 1000) / 1000;

export function gerarLayoutCartao(opcoesPorQuestao: number[]): LayoutCartaoOmr {
  const M = MEDIDAS_CARTAO;
  const ops = normalizarOpcoes(opcoesPorQuestao.length > 0 ? opcoesPorQuestao : [5]);
  const N = ops.length;
  const raio = M.DIAMETRO_BOLHA / 2;

  const blocos: number[][] = [];
  for (let q = 0; q < N; q++) {
    const b = Math.floor(q / M.QUESTOES_POR_BLOCO);
    if (!blocos[b]) blocos[b] = [];
    blocos[b].push(q);
  }

  const bolhas: BolhaLayout[][] = [];
  const rotulos: RotuloLayout[] = [];
  const cabecalhos: CabecalhoLayout[] = [];

  let inicioBloco: number = M.INICIO_X;
  let maiorX = 0;

  blocos.forEach(questoesBloco => {
    const maxOpsBloco = Math.max(2, ...questoesBloco.map(q => ops[q]));
    const xPrimeiraBolha = inicioBloco + M.LARGURA_ROTULO + raio;

    for (let c = 0; c < maxOpsBloco; c++) {
      cabecalhos.push({
        letra: LETRAS_CARTAO[c].toLowerCase(),
        x: arred(xPrimeiraBolha + c * M.PASSO_COLUNA),
        y: M.Y_CABECALHO
      });
    }

    questoesBloco.forEach((q, linha) => {
      const y = M.Y_PRIMEIRA_LINHA + linha * M.PASSO_LINHA;
      rotulos.push({
        questao: q + 1,
        texto: `Q.${String(q + 1).padStart(2, '0')}`,
        x: arred(inicioBloco + M.LARGURA_ROTULO - 1.2),
        y: arred(y)
      });
      const linhaBolhas: BolhaLayout[] = [];
      for (let c = 0; c < ops[q]; c++) {
        linhaBolhas.push({
          questao: q + 1,
          letra: LETRAS_CARTAO[c],
          indice: c,
          x: arred(xPrimeiraBolha + c * M.PASSO_COLUNA),
          y: arred(y)
        });
      }
      bolhas[q] = linhaBolhas;
    });

    const xUltimaBolha = xPrimeiraBolha + (maxOpsBloco - 1) * M.PASSO_COLUNA;
    maiorX = Math.max(maiorX, xUltimaBolha);
    inicioBloco = xUltimaBolha + raio + M.ESPACO_BLOCOS;
  });

  const linhasMax = Math.min(M.QUESTOES_POR_BLOCO, N);
  const larguraFiduciais = arred(maiorX + raio + M.MARGEM_DIREITA);
  const alturaFiduciais = arred(
    M.Y_PRIMEIRA_LINHA + (linhasMax - 1) * M.PASSO_LINHA + raio + M.MARGEM_INFERIOR
  );
  const margemExterna = M.LADO_FIDUCIAL / 2 + M.ZONA_LIVRE;

  return {
    versao: VERSAO_LAYOUT_CARTAO,
    totalQuestoes: N,
    opcoesPorQuestao: ops,
    larguraFiduciais,
    alturaFiduciais,
    ladoFiducial: M.LADO_FIDUCIAL,
    margemExterna,
    larguraTotal: arred(larguraFiduciais + 2 * margemExterna),
    alturaTotal: arred(alturaFiduciais + 2 * margemExterna),
    diametroBolha: M.DIAMETRO_BOLHA,
    espessuraBorda: M.ESPESSURA_BORDA,
    passoColuna: M.PASSO_COLUNA,
    passoLinha: M.PASSO_LINHA,
    fiduciais: {
      topLeft: { x: 0, y: 0 },
      topRight: { x: larguraFiduciais, y: 0 },
      bottomLeft: { x: 0, y: alturaFiduciais },
      bottomRight: { x: larguraFiduciais, y: alturaFiduciais }
    },
    bolhas,
    rotulos,
    cabecalhos
  };
}
