/**
 * Motor de leitura OMR padrão "lotérica" — 4 âncoras fiduciais + homografia 2D.
 *
 * Fluxo:
 *  1. Converte a foto para cinza (descartando o canal azul: caneta azul fica escura e a
 *     luz amarelada da sala não escurece o papel) e reduz para no máximo 2000 px.
 *  2. Usa o QR Code (já lido) apenas para saber a ORIENTAÇÃO e a ESCALA aproximada da folha.
 *  3. Binarização adaptativa + componentes conexos → candidatos a quadrados pretos sólidos
 *     de 8 mm (teste rotação-invariante por momentos de inércia).
 *  4. Escolhe os 4 candidatos que formam exatamente o retângulo das âncoras do layout
 *     (aceita 3 âncoras e estima a 4ª por paralelogramo, ex.: dedo cobrindo um canto).
 *  5. Homografia mm → pixel a partir das âncoras; refinamento fino pelas bordas impressas
 *     das bolinhas (global e por linha), compensando curvatura do papel.
 *  6. Para cada bolinha, mede a fração de tinta no miolo relativa ao papel ao redor dela
 *     (compensa sombras locais) e classifica: em branco, marcada única ou dupla marcação.
 *
 * Funciona em qualquer rotação (0°–360°) e com perspectiva, pois a posição de cada bolinha
 * é obtida por projeção a partir das âncoras, nunca por proporções fixas da foto.
 * Retorna `null` quando o cartão não é encontrado com segurança (o chamador usa o motor legado).
 */
import { gerarLayoutCartao, LayoutCartaoOmr, LETRAS_CARTAO } from './layoutCartaoOmr';

type Pt = { x: number; y: number };

export interface AncoraQrCartao {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  location?: {
    topLeftCorner?: Pt;
    topRightCorner?: Pt;
    bottomRightCorner?: Pt;
    bottomLeftCorner?: Pt;
  };
}

export interface ImagemRgbaCartao {
  width: number;
  height: number;
  data: ArrayLike<number>;
}

export interface FiducialDetectado {
  x: number;
  y: number;
  lado: number;
  estimado: boolean;
}

export interface ResultadoCartaoOmr {
  respostas: Record<number, string | null>;
  statusQuestoes: Record<number, 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO'>;
  fillRates: Record<number, number>;
  detalhesLetras: Record<number, Record<string, number>>;
  coordenadasDetectadas: Record<number, Record<string, { x: number; y: number; fill: number; boxSize?: number }>>;
  confianca: number;
  metodo: 'fiducial-homografia';
  marcadasPorQuestao: Record<number, string[]>;
  fiduciais: {
    topLeft: FiducialDetectado;
    topRight: FiducialDetectado;
    bottomLeft: FiducialDetectado;
    bottomRight: FiducialDetectado;
  };
  /** Homografia 3×3 (linha a linha) que leva mm do layout → pixel da imagem original. */
  homografia: number[];
  layout: LayoutCartaoOmr;
}

export interface OpcoesLeituraCartao {
  /** Maior dimensão usada no processamento (px). Padrão 2000. */
  limiteResolucao?: number;
  /** Lado aproximado da área de módulos do QR impresso (mm). Padrão 33. */
  tamanhoQrMm?: number;
  /** Preenchimento a partir do qual a bolinha é marcada com certeza (0..1). Padrão 0.38. */
  limiarMarcada?: number;
  /** Preenchimento mínimo para considerar marcação leve (0..1). Padrão 0.22. */
  limiarMinimo?: number;
  /** Fração mínima de bolinhas com borda reconhecida para aceitar a leitura. Padrão 0.55. */
  confiancaMinima?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Álgebra da homografia
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve H (3×3, h33 = 1) tal que destino ≈ H · origem para 4 correspondências. */
export function resolverHomografia(origem: Pt[], destino: Pt[]): number[] | null {
  if (origem.length !== 4 || destino.length !== 4) return null;
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const X = origem[i].x, Y = origem[i].y;
    const x = destino[i].x, y = destino[i].y;
    A.push([X, Y, 1, 0, 0, 0, -x * X, -x * Y, x]);
    A.push([0, 0, 0, X, Y, 1, -y * X, -y * Y, y]);
  }
  const n = 8;
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    }
    if (Math.abs(A[piv][col]) < 1e-12) return null;
    if (piv !== col) {
      const t = A[col];
      A[col] = A[piv];
      A[piv] = t;
    }
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = A[r][col] / A[col][col];
      if (f === 0) continue;
      for (let c = col; c <= n; c++) A[r][c] -= f * A[col][c];
    }
  }
  const h = A.map((linha, i) => linha[n] / linha[i]);
  if (h.some(v => !Number.isFinite(v))) return null;
  return [...h, 1];
}

export function aplicarHomografia(H: number[], p: Pt): Pt {
  const w = H[6] * p.x + H[7] * p.y + H[8];
  return {
    x: (H[0] * p.x + H[1] * p.y + H[2]) / w,
    y: (H[3] * p.x + H[4] * p.y + H[5]) / w
  };
}

export function inverterHomografia(H: number[]): number[] | null {
  const [a, b, c, d, e, f, g, h, i] = H;
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-12) return null;
  const inv = [
    A, -(b * i - c * h), b * f - c * e,
    B, a * i - c * g, -(a * f - c * d),
    C, -(a * h - b * g), a * e - b * d
  ].map(v => v / det);
  return inv.map(v => v / inv[8]);
}

const multiplicar3x3 = (M: number[], N: number[]): number[] => {
  const R = new Array(9).fill(0);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += M[r * 3 + k] * N[k * 3 + c];
      R[r * 3 + c] = s;
    }
  }
  return R;
};

const mediana = (v: number[]): number => {
  if (v.length === 0) return 0;
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const percentil = (v: number[], p: number): number => {
  if (v.length === 0) return 0;
  const s = [...v].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))];
};

// ─────────────────────────────────────────────────────────────────────────────
// Motor principal
// ─────────────────────────────────────────────────────────────────────────────

export function lerCartaoOmrPorFiduciais(
  img: ImagemRgbaCartao,
  ancora: AncoraQrCartao,
  opcoesPorQuestao: number[],
  opcoes: OpcoesLeituraCartao = {}
): ResultadoCartaoOmr | null {
  const W = img.width;
  const H = img.height;
  const data = img.data;
  if (!W || !H || !data || opcoesPorQuestao.length === 0) return null;

  const layout = gerarLayoutCartao(opcoesPorQuestao);
  const limite = opcoes.limiteResolucao ?? 2000;
  const qrMm = opcoes.tamanhoQrMm ?? 33;
  const LIMIAR_MARCADA = opcoes.limiarMarcada ?? 0.38;
  const LIMIAR_MINIMO = opcoes.limiarMinimo ?? 0.22;
  const CONFIANCA_MIN = opcoes.confiancaMinima ?? 0.55;

  // ── 1. Cinza reduzido (box filter) ──────────────────────────────────────────
  const escala = Math.min(1, limite / Math.max(W, H));
  const w = Math.max(1, Math.round(W * escala));
  const h = Math.max(1, Math.round(H * escala));
  const gray = new Float32Array(w * h);
  if (escala === 1) {
    for (let i = 0, p = 0; i < w * h; i++, p += 4) {
      gray[i] = data[p] * 0.45 + data[p + 1] * 0.55;
    }
  } else {
    const cont = new Float32Array(w * h);
    for (let sy = 0; sy < H; sy++) {
      const dy = Math.min(h - 1, Math.floor(sy * escala));
      const baseD = dy * w;
      let p = sy * W * 4;
      for (let sx = 0; sx < W; sx++, p += 4) {
        const di = baseD + Math.min(w - 1, Math.floor(sx * escala));
        gray[di] += data[p] * 0.45 + data[p + 1] * 0.55;
        cont[di] += 1;
      }
    }
    for (let i = 0; i < w * h; i++) gray[i] = cont[i] > 0 ? gray[i] / cont[i] : 255;
  }
  const paraReduzida = (v: number) => (v + 0.5) * escala - 0.5;
  const paraOriginal = (v: number) => (v + 0.5) / escala - 0.5;

  const amostrar = (x: number, y: number): number => {
    if (!(x >= 0 && y >= 0 && x <= w - 1 && y <= h - 1)) return NaN;
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
    const fx = x - x0, fy = y - y0;
    const a = gray[y0 * w + x0], b = gray[y0 * w + x1];
    const c = gray[y1 * w + x0], d = gray[y1 * w + x1];
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  };

  // ── 2. Referencial da folha a partir do QR ─────────────────────────────────
  const loc = ancora.location;
  const tlQ0: Pt = loc?.topLeftCorner ?? { x: ancora.x ?? 0, y: ancora.y ?? 0 };
  const trQ0: Pt = loc?.topRightCorner ?? { x: tlQ0.x + (ancora.width ?? 0), y: tlQ0.y };
  const blQ0: Pt = loc?.bottomLeftCorner ?? { x: tlQ0.x, y: tlQ0.y + (ancora.height ?? ancora.width ?? 0) };
  const tlQ = { x: paraReduzida(tlQ0.x), y: paraReduzida(tlQ0.y) };
  const trQ = { x: paraReduzida(trQ0.x), y: paraReduzida(trQ0.y) };
  const blQ = { x: paraReduzida(blQ0.x), y: paraReduzida(blQ0.y) };
  const ladoQrPx = (Math.hypot(trQ.x - tlQ.x, trQ.y - tlQ.y) + Math.hypot(blQ.x - tlQ.x, blQ.y - tlQ.y)) / 2;
  if (!(ladoQrPx >= 20)) return null;
  const pxPorMm = ladoQrPx / qrMm;
  const Ux = (trQ.x - tlQ.x) / qrMm, Uy = (trQ.y - tlQ.y) / qrMm;
  const Vx = (blQ.x - tlQ.x) / qrMm, Vy = (blQ.y - tlQ.y) / qrMm;
  const detUV = Ux * Vy - Uy * Vx;
  if (Math.abs(detUV) < 1e-9) return null;
  const paraMmFolha = (p: Pt): Pt => {
    const dx = p.x - tlQ.x, dy = p.y - tlQ.y;
    return { x: (dx * Vy - dy * Vx) / detUV, y: (Ux * dy - Uy * dx) / detUV };
  };

  // ── 3. Binarização adaptativa ──────────────────────────────────────────────
  const w1 = w + 1;
  const integral = new Float64Array(w1 * (h + 1));
  for (let y = 0; y < h; y++) {
    let linha = 0;
    for (let x = 0; x < w; x++) {
      linha += gray[y * w + x];
      integral[(y + 1) * w1 + x + 1] = integral[y * w1 + x + 1] + linha;
    }
  }
  const meia = Math.max(12, Math.round(pxPorMm * 12));
  const escuro = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - meia), y1 = Math.min(h, y + meia + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - meia), x1 = Math.min(w, x + meia + 1);
      const area = (x1 - x0) * (y1 - y0);
      const soma = integral[y1 * w1 + x1] - integral[y0 * w1 + x1] - integral[y1 * w1 + x0] + integral[y0 * w1 + x0];
      if (gray[y * w + x] * area < soma * 0.7) escuro[y * w + x] = 1;
    }
  }

  // ── 4. Componentes conexos → candidatos a âncoras ──────────────────────────
  const ladoEsperado = layout.ladoFiducial * pxPorMm;
  const areaMin = (0.5 * ladoEsperado) ** 2;
  const areaMax = (1.8 * ladoEsperado) ** 2;
  type Candidato = { x: number; y: number; lado: number; mm: Pt };
  const candidatos: Candidato[] = [];
  const visitado = new Uint8Array(w * h);
  const pilha = new Int32Array(w * h);

  for (let inicio = 0; inicio < w * h; inicio++) {
    if (!escuro[inicio] || visitado[inicio]) continue;
    let topo = 0;
    pilha[topo++] = inicio;
    visitado[inicio] = 1;
    let area = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
    let minX = w, maxX = 0, minY = h, maxY = 0;
    while (topo > 0) {
      const i = pilha[--topo];
      const x = i % w, y = (i - x) / w;
      area++;
      sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w || (dx === 0 && dy === 0)) continue;
          const j = yy * w + xx;
          if (escuro[j] && !visitado[j]) {
            visitado[j] = 1;
            pilha[topo++] = j;
          }
        }
      }
    }

    if (area < areaMin || area > areaMax) continue;
    const bw = maxX - minX + 1, bh = maxY - minY + 1;
    if (bw > 2.8 * ladoEsperado || bh > 2.8 * ladoEsperado) continue;
    if (area / (bw * bh) < 0.42) continue;
    const mx = sx / area, my = sy / area;
    const vx = sxx / area - mx * mx;
    const vy = syy / area - my * my;
    const cv = sxy / area - mx * my;
    const tr = vx + vy;
    const det = vx * vy - cv * cv;
    const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
    const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
    if (l2 <= 0) continue;
    if (l1 / l2 > 2.2) continue;
    // Quadrado sólido: área = 12·√(λ1·λ2). Anéis, letras e linhas ficam bem abaixo de 0.8.
    const compacidade = area / (12 * Math.sqrt(l1 * l2));
    if (compacidade < 0.8 || compacidade > 1.25) continue;
    const mm = paraMmFolha({ x: mx, y: my });
    if (mm.x > -4 && mm.x < qrMm + 4 && mm.y > -4 && mm.y < qrMm + 4) continue; // dentro do QR
    candidatos.push({ x: mx, y: my, lado: Math.sqrt(area), mm });
  }
  if (candidatos.length < 3) return null;

  // ── 5. Encaixe do retângulo das âncoras ────────────────────────────────────
  // Testa trios de candidatos (pivô + dois vizinhos) cuja geometria, no referencial
  // orientado pelo QR, bate com o retângulo do layout (direção e proporção, invariante
  // à escala). O 4º canto é procurado na posição prevista pelo próprio trio; se não for
  // encontrado (dedo, sombra, dobra), é estimado por paralelogramo.
  const Wf = layout.larguraFiduciais;
  const Hf = layout.alturaFiduciais;
  const cantosMm: Pt[] = [
    { x: 0, y: 0 },
    { x: Wf, y: 0 },
    { x: 0, y: Hf },
    { x: Wf, y: Hf }
  ];
  // Cada trio: [pivô, vizinho1, vizinho2, canto oposto]
  const TRIOS: [number, number, number, number][] = [
    [0, 1, 2, 3],
    [1, 0, 3, 2],
    [2, 3, 0, 1],
    [3, 2, 1, 0]
  ];

  // Limita aos candidatos de tamanho mais coerente com o esperado
  const cands = [...candidatos]
    .sort((a, b) => Math.abs(Math.log(a.lado / ladoEsperado)) - Math.abs(Math.log(b.lado / ladoEsperado)))
    .slice(0, 40);

  const difAngulo = (a: number, b: number) => {
    let d = a - b;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return Math.abs(d);
  };

  type Encaixe = { idx: number[]; score: number };
  let melhor: Encaixe | null = null;

  for (const [p, v1, v2, op] of TRIOS) {
    const e1 = { x: cantosMm[v1].x - cantosMm[p].x, y: cantosMm[v1].y - cantosMm[p].y };
    const e2 = { x: cantosMm[v2].x - cantosMm[p].x, y: cantosMm[v2].y - cantosMm[p].y };
    const len1 = Math.hypot(e1.x, e1.y), len2 = Math.hypot(e2.x, e2.y);
    const ang1 = Math.atan2(e1.y, e1.x), ang2 = Math.atan2(e2.y, e2.x);

    for (let ip = 0; ip < cands.length; ip++) {
      const P = cands[ip];
      for (let ia = 0; ia < cands.length; ia++) {
        if (ia === ip) continue;
        const A = cands[ia];
        const dA = { x: A.mm.x - P.mm.x, y: A.mm.y - P.mm.y };
        const errAngA = difAngulo(Math.atan2(dA.y, dA.x), ang1);
        if (errAngA > 0.4) continue;
        const kA = Math.hypot(dA.x, dA.y) / len1;
        if (kA < 0.65 || kA > 1.5) continue;

        for (let ib = 0; ib < cands.length; ib++) {
          if (ib === ip || ib === ia) continue;
          const B = cands[ib];
          const dB = { x: B.mm.x - P.mm.x, y: B.mm.y - P.mm.y };
          const errAngB = difAngulo(Math.atan2(dB.y, dB.x), ang2);
          if (errAngB > 0.4) continue;
          const kB = Math.hypot(dB.x, dB.y) / len2;
          if (kB < 0.65 || kB > 1.5) continue;
          const errProp = Math.abs(kA / kB - 1);
          if (errProp > 0.3) continue;

          const lados = [P.lado, A.lado, B.lado];
          const espalhamento = Math.max(...lados) / Math.min(...lados);
          if (espalhamento > 1.7) continue;

          // 4º canto previsto (em pixels) pelo paralelogramo do próprio trio
          const prev = { x: A.x + B.x - P.x, y: A.y + B.y - P.y };
          const ladoPx = Math.min(Math.hypot(A.x - P.x, A.y - P.y), Math.hypot(B.x - P.x, B.y - P.y));
          const ladoMedioTrio = (P.lado + A.lado + B.lado) / 3;
          let iop = -1;
          let distOp = Infinity;
          for (let j = 0; j < cands.length; j++) {
            if (j === ip || j === ia || j === ib) continue;
            const d = Math.hypot(cands[j].x - prev.x, cands[j].y - prev.y);
            const razao = cands[j].lado / ladoMedioTrio;
            if (d < distOp && d < 0.22 * ladoPx && razao > 0.65 && razao < 1.55) {
              distOp = d;
              iop = j;
            }
          }

          const score =
            errAngA + errAngB +
            0.5 * Math.abs(kA - 1) + 0.5 * Math.abs(kB - 1) +
            errProp +
            0.3 * (espalhamento - 1) +
            (iop >= 0 ? distOp / ladoPx : 0.6);

          if (!melhor || score < melhor.score) {
            const idx = [-1, -1, -1, -1];
            idx[p] = ip;
            idx[v1] = ia;
            idx[v2] = ib;
            idx[op] = iop;
            melhor = { idx, score };
          }
        }
      }
    }
  }
  if (!melhor) return null;

  const pts: (Pt | null)[] = melhor.idx.map(i => (i >= 0 ? { x: cands[i].x, y: cands[i].y } : null));
  const faltando = pts.findIndex(p => p === null);
  if (faltando >= 0) {
    // Paralelogramo: TL + BR = TR + BL
    const [tl, tr, bl, br] = pts;
    if (faltando === 0) pts[0] = { x: tr!.x + bl!.x - br!.x, y: tr!.y + bl!.y - br!.y };
    if (faltando === 1) pts[1] = { x: tl!.x + br!.x - bl!.x, y: tl!.y + br!.y - bl!.y };
    if (faltando === 2) pts[2] = { x: tl!.x + br!.x - tr!.x, y: tl!.y + br!.y - tr!.y };
    if (faltando === 3) pts[3] = { x: tr!.x + bl!.x - tl!.x, y: tr!.y + bl!.y - tl!.y };
  }
  const cantosPx = pts as Pt[];
  const Hr = resolverHomografia(cantosMm, cantosPx);
  if (!Hr) return null;

  // Sanidade da escala projetada
  const centroMm = { x: Wf / 2, y: Hf / 2 };
  const c0 = aplicarHomografia(Hr, centroMm);
  const c1 = aplicarHomografia(Hr, { x: centroMm.x + 1, y: centroMm.y });
  const c2 = aplicarHomografia(Hr, { x: centroMm.x, y: centroMm.y + 1 });
  const escalaX = Math.hypot(c1.x - c0.x, c1.y - c0.y);
  const escalaY = Math.hypot(c2.x - c0.x, c2.y - c0.y);
  if (!(escalaX > pxPorMm * 0.55 && escalaX < pxPorMm * 1.8 && escalaY > pxPorMm * 0.55 && escalaY < pxPorMm * 1.8)) {
    return null;
  }

  // ── 6. Refinamento pelas bordas impressas das bolinhas ─────────────────────
  const D = layout.diametroBolha;
  const rBorda = D / 2 - layout.espessuraBorda / 2;
  const rFora = D / 2 + 0.8;
  const N_ANG = 24;
  const cosT = Array.from({ length: N_ANG }, (_, k) => Math.cos((2 * Math.PI * k) / N_ANG));
  const sinT = Array.from({ length: N_ANG }, (_, k) => Math.sin((2 * Math.PI * k) / N_ANG));

  const amostrarMm = (X: number, Y: number): number => {
    const p = aplicarHomografia(Hr, { x: X, y: Y });
    return amostrar(p.x, p.y);
  };

  const contrasteAnel = (cx: number, cy: number): number => {
    let sB = 0, sF = 0, n = 0;
    for (let k = 0; k < N_ANG; k++) {
      const gB = Math.min(
        amostrarMm(cx + (rBorda - 0.25) * cosT[k], cy + (rBorda - 0.25) * sinT[k]),
        amostrarMm(cx + rBorda * cosT[k], cy + rBorda * sinT[k]),
        amostrarMm(cx + (rBorda + 0.25) * cosT[k], cy + (rBorda + 0.25) * sinT[k])
      );
      const gF = amostrarMm(cx + rFora * cosT[k], cy + rFora * sinT[k]);
      if (Number.isNaN(gB) || Number.isNaN(gF)) continue;
      sB += gB;
      sF += gF;
      n++;
    }
    return n >= N_ANG / 2 ? (sF - sB) / n : -255;
  };

  const todasBolhas = layout.bolhas.flat();
  let offG = { x: 0, y: 0 };
  {
    let melhorS = -Infinity;
    for (let oy = -1.5; oy <= 1.5001; oy += 0.25) {
      for (let ox = -1.5; ox <= 1.5001; ox += 0.25) {
        let s = 0;
        for (const b of todasBolhas) s += contrasteAnel(b.x + ox, b.y + oy);
        s -= (Math.abs(ox) + Math.abs(oy)) * todasBolhas.length * 0.4;
        if (s > melhorS) { melhorS = s; offG = { x: ox, y: oy }; }
      }
    }
  }

  const offLinha: Pt[] = layout.bolhas.map(linha => {
    let melhorS = -Infinity;
    let melhorO = { x: offG.x, y: offG.y };
    for (let oy = -0.9; oy <= 0.9001; oy += 0.3) {
      for (let ox = -0.9; ox <= 0.9001; ox += 0.3) {
        let s = 0;
        for (const b of linha) s += contrasteAnel(b.x + offG.x + ox, b.y + offG.y + oy);
        s -= (Math.abs(ox) + Math.abs(oy)) * linha.length * 0.8;
        if (s > melhorS) { melhorS = s; melhorO = { x: offG.x + ox, y: offG.y + oy }; }
      }
    }
    return melhorO;
  });

  // ── 7. Medição do preenchimento ────────────────────────────────────────────
  const rMiolo = 0.36 * D;
  const passo = 0.3;
  const pontosMiolo: Pt[] = [];
  for (let dy = -rMiolo; dy <= rMiolo + 1e-9; dy += passo) {
    for (let dx = -rMiolo; dx <= rMiolo + 1e-9; dx += passo) {
      if (dx * dx + dy * dy <= rMiolo * rMiolo) pontosMiolo.push({ x: dx, y: dy });
    }
  }
  const raiosPapel = [D / 2 + 0.7, D / 2 + 1.0];

  type Medida = { cx: number; cy: number; papel: number; anel: number; valores: number[] };
  const medidas: Medida[][] = layout.bolhas.map((linha, q) =>
    linha.map(b => {
      const cx = b.x + offLinha[q].x;
      const cy = b.y + offLinha[q].y;
      const papelAmostras: number[] = [];
      for (const r of raiosPapel) {
        for (let k = 0; k < N_ANG; k++) {
          const g = amostrarMm(cx + r * cosT[k], cy + r * sinT[k]);
          if (!Number.isNaN(g)) papelAmostras.push(g);
        }
      }
      const valores: number[] = [];
      for (const p of pontosMiolo) {
        const g = amostrarMm(cx + p.x, cy + p.y);
        if (!Number.isNaN(g)) valores.push(g);
      }
      return {
        cx,
        cy,
        papel: percentil(papelAmostras, 0.7),
        anel: contrasteAnel(cx, cy),
        valores
      };
    })
  );

  const papelGlobal = mediana(medidas.flat().map(m => m.papel).filter(v => v > 0));
  if (!(papelGlobal > 20)) return null;

  const fills: number[][] = medidas.map(linha =>
    linha.map(m => {
      if (m.valores.length < pontosMiolo.length * 0.6) return 0;
      const papel = Math.max(m.papel, papelGlobal * 0.6);
      let soma = 0;
      for (const g of m.valores) {
        const d = (papel - g) / (papel * 0.55);
        soma += d <= 0 ? 0 : d >= 1 ? 1 : d;
      }
      return soma / m.valores.length;
    })
  );

  const contrasteMin = Math.max(8, papelGlobal * 0.05);
  const totalB = todasBolhas.length;
  const bordasOk = medidas.flat().filter(m => m.anel >= contrasteMin).length;
  const confianca = totalB > 0 ? bordasOk / totalB : 0;
  if (confianca < CONFIANCA_MIN) return null;

  // ── 8. Classificação (padrão lotérica) ─────────────────────────────────────
  const todosFills = fills.flat();
  const nivelBranco = percentil(todosFills, 0.35);
  const T_ALTO = Math.max(LIMIAR_MARCADA, nivelBranco + 0.28);
  const T_BAIXO = Math.max(LIMIAR_MINIMO, nivelBranco + 0.15);

  const respostas: ResultadoCartaoOmr['respostas'] = {};
  const statusQuestoes: ResultadoCartaoOmr['statusQuestoes'] = {};
  const fillRates: ResultadoCartaoOmr['fillRates'] = {};
  const detalhesLetras: ResultadoCartaoOmr['detalhesLetras'] = {};
  const coordenadasDetectadas: ResultadoCartaoOmr['coordenadasDetectadas'] = {};
  const marcadasPorQuestao: ResultadoCartaoOmr['marcadasPorQuestao'] = {};

  // Homografia na imagem ORIGINAL: T(reduzida→original) · Hr
  const fator = 1 / escala;
  const desloc = 0.5 / escala - 0.5;
  const T = [fator, 0, desloc, 0, fator, desloc, 0, 0, 1];
  const Horig = multiplicar3x3(T, Hr);
  const norm = Horig[8];
  const HorigN = Horig.map(v => v / norm);

  layout.bolhas.forEach((linha, q) => {
    const numero = q + 1;
    const f = fills[q];
    const ordem = f.map((v, i) => i).sort((a, b) => f[b] - f[a]);
    const f1 = f[ordem[0]] ?? 0;
    const f2 = f[ordem[1]] ?? 0;
    const outras = ordem.slice(1).map(i => f[i]);
    const base = Math.min(mediana(outras), nivelBranco + 0.12);

    let marcadas: number[] = ordem.filter(i => f[i] >= T_ALTO && f[i] - base >= 0.18);
    if (marcadas.length === 0 && f1 >= T_BAIXO && f1 - f2 >= 0.15 && f1 - base >= 0.15) {
      marcadas = [ordem[0]];
    }
    if (marcadas.length >= 1) {
      const fTopo = f[marcadas[0]];
      for (const i of ordem) {
        if (marcadas.includes(i)) continue;
        if (f[i] >= Math.max(T_BAIXO, 0.72 * fTopo) && f[i] - base >= 0.15) marcadas.push(i);
      }
    }
    marcadas.sort((a, b) => a - b);
    const letras = marcadas.map(i => LETRAS_CARTAO[i]);
    marcadasPorQuestao[numero] = letras;

    if (letras.length === 0) {
      respostas[numero] = null;
      statusQuestoes[numero] = 'EM_BRANCO';
    } else if (letras.length >= 2) {
      respostas[numero] = null;
      statusQuestoes[numero] = 'ANULADA';
    } else {
      respostas[numero] = letras[0];
      statusQuestoes[numero] = 'CORRETA';
    }
    fillRates[numero] = Math.round(f1 * 100);

    const porLetra: Record<string, number> = {};
    const coords: Record<string, { x: number; y: number; fill: number; boxSize?: number }> = {};
    linha.forEach((b, c) => {
      const m = medidas[q][c];
      const pOrig = aplicarHomografia(HorigN, { x: m.cx, y: m.cy });
      const pBorda = aplicarHomografia(HorigN, { x: m.cx + D / 2, y: m.cy });
      const fillPct = Math.round(f[c] * 100);
      porLetra[b.letra] = fillPct;
      coords[b.letra] = {
        x: Math.round(pOrig.x),
        y: Math.round(pOrig.y),
        fill: fillPct,
        boxSize: Math.max(6, Math.round(2 * Math.hypot(pBorda.x - pOrig.x, pBorda.y - pOrig.y)))
      };
    });
    detalhesLetras[numero] = porLetra;
    coordenadasDetectadas[numero] = coords;
  });

  const ladoMedio = mediana(melhor.idx.filter(i => i >= 0).map(i => cands[i].lado)) / escala;
  const fid = (k: number): FiducialDetectado => ({
    x: Math.round(paraOriginal(cantosPx[k].x)),
    y: Math.round(paraOriginal(cantosPx[k].y)),
    lado: Math.round(melhor!.idx[k] >= 0 ? cands[melhor!.idx[k]].lado / escala : ladoMedio),
    estimado: melhor!.idx[k] < 0
  });

  return {
    respostas,
    statusQuestoes,
    fillRates,
    detalhesLetras,
    coordenadasDetectadas,
    confianca: Math.round(confianca * 100) / 100,
    metodo: 'fiducial-homografia',
    marcadasPorQuestao,
    fiduciais: { topLeft: fid(0), topRight: fid(1), bottomLeft: fid(2), bottomRight: fid(3) },
    homografia: HorigN,
    layout
  };
}
