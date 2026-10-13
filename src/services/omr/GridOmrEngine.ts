/**
 * Motor de Leitura OMR por Ajuste de Grade (Grid Fitting)
 *
 * Em vez de confiar em proporções fixas entre o QR Code e o Quadro de Respostas
 * (que variam conforme a escala de impressão, o navegador e o corte da folha),
 * este motor LOCALIZA os quadrados impressos diretamente na foto estática:
 *
 *  1. Binarização adaptativa (limiar local) — robusta a sombras e variação de luz.
 *  2. Retificação da região abaixo do QR Code usando a orientação do próprio QR
 *     (corrige rotação/escala da folha na frente da câmera).
 *  3. Mapa de "resposta de contorno": realça pontos cujo entorno forma um quadrado
 *     com borda escura e espaço claro ao redor (exatamente os quadrados A–E).
 *  4. Busca global da grade 5 × N (origem, espaçamento entre colunas e linhas e
 *     tamanho do quadrado) que melhor encaixa nos contornos detectados.
 *  5. Refinamento fino em resolução nativa + ajuste por linha e por quadrado.
 *  6. Medição do preenchimento SOMENTE no interior de cada quadrado, comparado com
 *     o nível de fundo da própria folha (letras impressas não contam como marcação).
 *
 * Retorna `null` quando a grade não é encontrada com confiança suficiente,
 * permitindo que o chamador use o método legado como fallback.
 */

type Pt = { x: number; y: number };

export interface AncoraQrGrade {
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

type StatusQ = 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO';

export interface ResultadoGradeOmr {
  respostas: Record<number, string | null>;
  statusQuestoes: Record<number, StatusQ>;
  fillRates: Record<number, number>;
  detalhesLetras: Record<number, Record<string, number>>;
  coordenadasDetectadas: Record<number, Record<string, { x: number; y: number; fill: number; boxSize?: number }>>;
  confianca: number;
  metodo: 'grid-fit';
}

interface ImagemRGBA {
  width: number;
  height: number;
  data: ArrayLike<number>;
}

interface Retificada {
  w: number;
  h: number;
  S: number;
  aMin: number;
  bMin: number;
  ii: Float64Array;
}

const LETRAS = ['A', 'B', 'C', 'D', 'E'];
const CAP_RESPOSTA = 0.5;
const MIN_RESPOSTA_CELULA = 0.05;
const MIN_CONFIANCA = 0.50;

export function lerGradeOmrPorAjuste(
  img: ImagemRGBA,
  totalQuestoes: number,
  ancora: AncoraQrGrade
): ResultadoGradeOmr | null {
  const N = Math.max(1, Math.min(20, Math.round(totalQuestoes)));
  const W = img.width;
  const H = img.height;
  const data = img.data;
  if (!W || !H || !data) return null;

  // ---------------------------------------------------------------------------
  // Geometria do QR Code (origem + vetores de orientação u/v)
  // ---------------------------------------------------------------------------
  const tl: Pt = ancora.location?.topLeftCorner ?? { x: ancora.x ?? 0, y: ancora.y ?? 0 };
  let qrW = ancora.width || 0;
  let qrH = ancora.height || qrW;
  let ux = 1, uy = 0, vx = 0, vy = 1;
  const tr = ancora.location?.topRightCorner;
  const bl = ancora.location?.bottomLeftCorner;
  if (tr) {
    const dx = tr.x - tl.x, dy = tr.y - tl.y, d = Math.hypot(dx, dy);
    if (d > 0) { ux = dx / d; uy = dy / d; qrW = d; }
  }
  if (bl) {
    const dx = bl.x - tl.x, dy = bl.y - tl.y, d = Math.hypot(dx, dy);
    if (d > 0) { vx = dx / d; vy = dy / d; qrH = d; }
  }
  if (qrW < 24 || qrH < 24) return null;

  // ---------------------------------------------------------------------------
  // 1. Escala de cinza + binarização adaptativa (limiar local)
  // ---------------------------------------------------------------------------
  const W1 = W + 1;
  const total = W * H;

  const integral = (src: ArrayLike<number>): Uint32Array => {
    const ii = new Uint32Array(W1 * (H + 1));
    for (let y = 0; y < H; y++) {
      let linha = 0;
      const base = y * W;
      const o0 = y * W1;
      const o1 = (y + 1) * W1;
      for (let x = 0; x < W; x++) {
        linha += src[base + x];
        ii[o1 + x + 1] = ii[o0 + x + 1] + linha;
      }
    }
    return ii;
  };

  const somaImg = (ii: Uint32Array, x0: number, y0: number, x1: number, y1: number): number => {
    if (x0 < 0) x0 = 0;
    if (y0 < 0) y0 = 0;
    if (x1 > W) x1 = W;
    if (y1 > H) y1 = H;
    if (x1 <= x0 || y1 <= y0) return 0;
    return ii[y1 * W1 + x1] - ii[y0 * W1 + x1] - ii[y1 * W1 + x0] + ii[y0 * W1 + x0];
  };

  const gray = new Uint8Array(total);
  for (let i = 0, p = 0; i < total; i++, p += 4) {
    gray[i] = (data[p] * 77 + data[p + 1] * 150 + data[p + 2] * 29) >> 8;
  }
  const iiGray = integral(gray);

  const meiaJanela = Math.max(8, Math.round(Math.max(qrW, qrH) * 0.45));
  const escuro = new Uint8Array(total);
  for (let y = 0; y < H; y++) {
    const y0 = Math.max(0, y - meiaJanela);
    const y1 = Math.min(H, y + meiaJanela + 1);
    for (let x = 0; x < W; x++) {
      const x0 = Math.max(0, x - meiaJanela);
      const x1 = Math.min(W, x + meiaJanela + 1);
      const area = (x1 - x0) * (y1 - y0);
      const soma = somaImg(iiGray, x0, y0, x1, y1);
      const i = y * W + x;
      // Pixel é "tinta" quando está 22% mais escuro que o papel ao redor
      if (gray[i] * area < soma * 0.78) escuro[i] = 1;
    }
  }
  const iiEscuro = integral(escuro);

  // ---------------------------------------------------------------------------
  // 2. Retificação (coordenadas em "unidades de QR": a → horizontal, b → vertical)
  // ---------------------------------------------------------------------------
  const retificar = (S: number, aMin: number, aMax: number, bMin: number, bMax: number): Retificada => {
    const w = Math.max(4, Math.ceil((aMax - aMin) * S));
    const h = Math.max(4, Math.ceil((bMax - bMin) * S));
    const fx = Math.max(1, qrW / S) / 2;
    const fy = Math.max(1, qrH / S) / 2;
    const w1 = w + 1;
    const ii = new Float64Array(w1 * (h + 1));
    for (let j = 0; j < h; j++) {
      const b = bMin + (j + 0.5) / S;
      const bx = tl.x + b * qrH * vx;
      const by = tl.y + b * qrH * vy;
      let linha = 0;
      const o0 = j * w1;
      const o1 = (j + 1) * w1;
      for (let i = 0; i < w; i++) {
        const a = aMin + (i + 0.5) / S;
        const px = bx + a * qrW * ux;
        const py = by + a * qrW * uy;
        const x0 = Math.floor(px - fx);
        const y0 = Math.floor(py - fy);
        const x1 = Math.max(x0 + 1, Math.ceil(px + fx));
        const y1 = Math.max(y0 + 1, Math.ceil(py + fy));
        const cx0 = Math.max(0, x0), cy0 = Math.max(0, y0);
        const cx1 = Math.min(W, x1), cy1 = Math.min(H, y1);
        let v = 0;
        if (cx1 > cx0 && cy1 > cy0) {
          v = somaImg(iiEscuro, cx0, cy0, cx1, cy1) / ((cx1 - cx0) * (cy1 - cy0));
        }
        linha += v;
        ii[o1 + i + 1] = ii[o0 + i + 1] + linha;
      }
    }
    return { w, h, S, aMin, bMin, ii };
  };

  const somaRet = (r: Retificada, x0: number, y0: number, x1: number, y1: number): number => {
    if (x0 < 0) x0 = 0;
    if (y0 < 0) y0 = 0;
    if (x1 > r.w) x1 = r.w;
    if (y1 > r.h) y1 = r.h;
    if (x1 <= x0 || y1 <= y0) return 0;
    const w1 = r.w + 1;
    return r.ii[y1 * w1 + x1] - r.ii[y0 * w1 + x1] - r.ii[y1 * w1 + x0] + r.ii[y0 * w1 + x0];
  };

  const somaQuadrado = (r: Retificada, cx: number, cy: number, rad: number): number =>
    somaRet(r, cx - rad, cy - rad, cx + rad + 1, cy + rad + 1);

  // ---------------------------------------------------------------------------
  // 3. Mapa de resposta de contorno de quadrado (borda escura + entorno claro)
  // ---------------------------------------------------------------------------
  const mapaAnel = (r: Retificada, hPx: number): Float32Array => {
    const t = Math.max(1, Math.round(hPx * 0.25));
    const g = Math.max(1, Math.round(hPx * 0.25));
    const rIn = hPx - t;
    const rOut = hPx + t;
    const rFar = rOut + g;
    const aOut = (2 * rOut + 1) ** 2;
    const aIn = rIn >= 0 ? (2 * rIn + 1) ** 2 : 0;
    const aFar = (2 * rFar + 1) ** 2;
    const anelArea = aOut - aIn;
    const foraArea = aFar - aOut;
    const out = new Float32Array(r.w * r.h);
    for (let y = 0; y < r.h; y++) {
      for (let x = 0; x < r.w; x++) {
        const sOut = somaQuadrado(r, x, y, rOut);
        const sIn = rIn >= 0 ? somaQuadrado(r, x, y, rIn) : 0;
        const sFar = somaQuadrado(r, x, y, rFar);
        out[y * r.w + x] = (sOut - sIn) / anelArea - (sFar - sOut) / foraArea;
      }
    }
    return out;
  };

  const criarCacheAnel = (r: Retificada) => {
    const cache = new Map<number, Float32Array>();
    return (hPx: number) => {
      let m = cache.get(hPx);
      if (!m) {
        m = mapaAnel(r, hPx);
        cache.set(hPx, m);
      }
      return m;
    };
  };

  // ---------------------------------------------------------------------------
  // 4. Busca global (grossa) da grade 5 × N
  // ---------------------------------------------------------------------------
  const Sc = 48;
  const aMinC = -3.9;
  const aMaxC = 2.9;
  const bMinC = 0.95;
  const b1MaxU = 4.8;
  const bMaxC = Math.min(b1MaxU + (N - 1) * 0.6 * 1.3 + 0.6, bMinC + 1400 / Sc);
  const rc = retificar(Sc, aMinC, aMaxC, bMinC, bMaxC);
  const anelC = criarCacheAnel(rc);

  const pcMin = Math.ceil(0.2 * Sc);
  const pcMax = Math.floor(0.6 * Sc);
  const xMin = Math.max(0, Math.round((-3.6 - aMinC) * Sc));
  const xEMax = Math.min(rc.w - 1, Math.round((2.5 - aMinC) * Sc));
  const yMin = Math.max(0, Math.round((1.1 - bMinC) * Sc));
  const yMaxB1 = Math.round((b1MaxU - bMinC) * Sc);
  const proporcoes = [0.28, 0.35, 0.42];

  let melhor = { score: -Infinity, x0: 0, y0: 0, pc: 0, pr: 0, prop: 0.35 };
  const somaLinha = new Float32Array(rc.w * rc.h);

  for (let pc = pcMin; pc <= pcMax; pc++) {
    for (const prop of proporcoes) {
      const hPx = Math.max(2, Math.round(prop * pc));
      const R = anelC(hPx);
      const xLim = rc.w - 1 - 4 * pc;
      for (let y = 0; y < rc.h; y++) {
        const off = y * rc.w;
        for (let x = 0; x <= xLim; x++) {
          let s = 0;
          for (let c = 0; c < 5; c++) {
            const v = R[off + x + c * pc];
            s += v > CAP_RESPOSTA ? CAP_RESPOSTA : v;
          }
          somaLinha[off + x] = s;
        }
      }
      const prIni = Math.max(2, Math.round(pc * 0.88));
      const prFim = Math.round(pc * 1.3);
      for (let pr = prIni; pr <= prFim; pr++) {
        for (let y0 = yMin; y0 <= yMaxB1 && y0 + (N - 1) * pr < rc.h; y0 += 2) {
          for (let x0 = xMin; x0 + 4 * pc <= xEMax && x0 <= xLim; x0 += 2) {
            let s = 0;
            for (let q = 0; q < N; q++) {
              s += somaLinha[(y0 + q * pr) * rc.w + x0];
            }
            if (s > melhor.score) {
              melhor = { score: s, x0, y0, pc, pr, prop };
            }
          }
        }
      }
    }
  }

  if (!isFinite(melhor.score) || melhor.pc === 0) return null;

  // Refino ±2 px (passo 1) na escala grossa
  {
    const hPx = Math.max(2, Math.round(melhor.prop * melhor.pc));
    const R = anelC(hPx);
    const base = { ...melhor };
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x0 = base.x0 + dx;
        const y0 = base.y0 + dy;
        if (x0 < 0 || y0 < 0 || x0 + 4 * base.pc >= rc.w || y0 + (N - 1) * base.pr >= rc.h) continue;
        let s = 0;
        for (let q = 0; q < N; q++) {
          const off = (y0 + q * base.pr) * rc.w;
          for (let c = 0; c < 5; c++) {
            const v = R[off + x0 + c * base.pc];
            s += v > CAP_RESPOSTA ? CAP_RESPOSTA : v;
          }
        }
        if (s > melhor.score) melhor = { ...base, score: s, x0, y0 };
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Refinamento fino em resolução próxima da nativa
  // ---------------------------------------------------------------------------
  const pcU = melhor.pc / Sc;
  const prU = melhor.pr / Sc;
  const aA = aMinC + (melhor.x0 + 0.5) / Sc;
  const b1 = bMinC + (melhor.y0 + 0.5) / Sc;

  const Sf = Math.max(64, Math.min(160, Math.round(Math.max(qrW, qrH))));
  const aMinF = aA - pcU * 1.3;
  const aMaxF = aA + 4 * pcU + pcU * 1.3;
  const bMinF = b1 - prU * 1.3;
  const bMaxF = b1 + (N - 1) * prU + prU * 1.3;
  const rf = retificar(Sf, aMinF, aMaxF, bMinF, bMaxF);
  const anelF = criarCacheAnel(rf);

  const x0c = (aA - aMinF) * Sf - 0.5;
  const y0c = (b1 - bMinF) * Sf - 0.5;
  const pcC = pcU * Sf;
  const prC = prU * Sf;
  const escala = Sf / Sc;
  const raio = Math.max(2, Math.ceil(escala * 1.5));

  const lerR = (R: Float32Array, x: number, y: number): number => {
    if (x < 0 || y < 0 || x >= rf.w || y >= rf.h) return -0.2;
    return R[y * rf.w + x];
  };

  let fino = { score: -Infinity, x0: x0c, y0: y0c, pc: pcC, pr: prC, hPx: Math.max(2, Math.round(melhor.prop * pcC)) };
  const propsFinas = [melhor.prop - 0.05, melhor.prop, melhor.prop + 0.05];
  for (const prop of propsFinas) {
    const hPx = Math.max(2, Math.round(prop * pcC));
    const R = anelF(hPx);
    for (let k = -4; k <= 4; k++) {
      const pcF = pcC * (1 + k * 0.01);
      for (let m = -4; m <= 4; m++) {
        const prF = prC * (1 + m * 0.01);
        for (let dy = -raio; dy <= raio; dy++) {
          for (let dx = -raio; dx <= raio; dx++) {
            const bx = x0c + dx;
            const by = y0c + dy;
            let s = 0;
            for (let q = 0; q < N; q++) {
              const yy = Math.round(by + q * prF);
              for (let c = 0; c < 5; c++) {
                const v = lerR(R, Math.round(bx + c * pcF), yy);
                s += v > CAP_RESPOSTA ? CAP_RESPOSTA : v;
              }
            }
            if (s > fino.score) fino = { score: s, x0: bx, y0: by, pc: pcF, pr: prF, hPx };
          }
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Ajuste por linha e micro-centralização por quadrado
  // ---------------------------------------------------------------------------
  const Rf = anelF(fino.hPx);
  const raioLinha = Math.max(1, Math.round(fino.pc * 0.08));
  const raioCel = Math.max(1, Math.round(fino.pc * 0.05));
  const centros: Pt[][] = [];
  let celulasOk = 0;

  for (let q = 0; q < N; q++) {
    const yBase = fino.y0 + q * fino.pr;
    let melhorLinha = { s: -Infinity, dx: 0, dy: 0 };
    for (let dy = -raioLinha; dy <= raioLinha; dy++) {
      for (let dx = -raioLinha; dx <= raioLinha; dx++) {
        let s = 0;
        const yy = Math.round(yBase + dy);
        for (let c = 0; c < 5; c++) {
          const v = lerR(Rf, Math.round(fino.x0 + c * fino.pc + dx), yy);
          s += v > CAP_RESPOSTA ? CAP_RESPOSTA : v;
        }
        // Leve preferência pela posição prevista (evita saltos)
        s -= (Math.abs(dx) + Math.abs(dy)) * 0.002;
        if (s > melhorLinha.s) melhorLinha = { s, dx, dy };
      }
    }

    const linha: Pt[] = [];
    for (let c = 0; c < 5; c++) {
      const cx0 = Math.round(fino.x0 + c * fino.pc + melhorLinha.dx);
      const cy0 = Math.round(yBase + melhorLinha.dy);
      let bx = cx0, by = cy0, bv = lerR(Rf, cx0, cy0);
      for (let dy = -raioCel; dy <= raioCel; dy++) {
        for (let dx = -raioCel; dx <= raioCel; dx++) {
          const v = lerR(Rf, cx0 + dx, cy0 + dy) - (Math.abs(dx) + Math.abs(dy)) * 0.002;
          if (v > bv) { bv = v; bx = cx0 + dx; by = cy0 + dy; }
        }
      }
      if (lerR(Rf, bx, by) >= MIN_RESPOSTA_CELULA) celulasOk++;
      linha.push({ x: bx, y: by });
    }
    centros.push(linha);
  }

  const confianca = celulasOk / (5 * N);
  if (confianca < MIN_CONFIANCA) return null;

  // ---------------------------------------------------------------------------
  // 7. Medição do preenchimento interno de cada quadrado
  // ---------------------------------------------------------------------------
  const raioInterno = Math.max(1, Math.round(fino.hPx * 0.6));
  const areaInterna = (2 * raioInterno + 1) ** 2;
  const fills: number[][] = centros.map(linha =>
    linha.map(p => Math.round((somaQuadrado(rf, p.x, p.y, raioInterno) / areaInterna) * 100))
  );

  const todos = fills.flat().sort((a, b) => a - b);
  const fundo = todos[Math.floor(todos.length / 2)]; // mediana ≈ quadrado em branco (letra impressa)
  const maxFill = todos[todos.length - 1];
  const amplitude = Math.max(0, maxFill - fundo);
  const limiarPrincipal = Math.max(18, amplitude * 0.4);
  const limiarSecundario = Math.max(14, amplitude * 0.3);

  const respostas: Record<number, string | null> = {};
  const statusQuestoes: Record<number, StatusQ> = {};
  const fillRates: Record<number, number> = {};
  const detalhesLetras: Record<number, Record<string, number>> = {};
  const coordenadasDetectadas: ResultadoGradeOmr['coordenadasDetectadas'] = {};

  const boxSizeImg = Math.max(6, Math.round(((2 * fino.hPx) / Sf) * Math.max(qrW, qrH)));
  const paraImagem = (p: Pt): Pt => {
    const a = aMinF + (p.x + 0.5) / Sf;
    const b = bMinF + (p.y + 0.5) / Sf;
    return {
      x: Math.round(tl.x + a * qrW * ux + b * qrH * vx),
      y: Math.round(tl.y + a * qrW * uy + b * qrH * vy)
    };
  };

  for (let q = 0; q < N; q++) {
    const numero = q + 1;
    const porLetra: Record<string, number> = {};
    const coords: Record<string, { x: number; y: number; fill: number; boxSize?: number }> = {};
    LETRAS.forEach((letra, c) => {
      porLetra[letra] = fills[q][c];
      const pImg = paraImagem(centros[q][c]);
      coords[letra] = { x: pImg.x, y: pImg.y, fill: fills[q][c], boxSize: boxSizeImg };
    });
    detalhesLetras[numero] = porLetra;
    coordenadasDetectadas[numero] = coords;

    const ordenadas = LETRAS.map(l => ({ letra: l, fill: porLetra[l] })).sort((a, b) => b.fill - a.fill);
    const f1 = ordenadas[0];
    const f2 = ordenadas[1];
    const marcadaPrincipal = f1.fill - fundo >= limiarPrincipal && f1.fill >= 30;
    const marcadaSecundaria = marcadaPrincipal && f2.fill - fundo >= limiarSecundario && f2.fill >= 25;

    if (marcadaSecundaria) {
      respostas[numero] = null;
      statusQuestoes[numero] = 'ANULADA';
      fillRates[numero] = f1.fill;
    } else if (marcadaPrincipal) {
      respostas[numero] = f1.letra;
      statusQuestoes[numero] = 'CORRETA';
      fillRates[numero] = f1.fill;
    } else {
      respostas[numero] = null;
      statusQuestoes[numero] = 'EM_BRANCO';
      fillRates[numero] = f1.fill;
    }
  }

  return {
    respostas,
    statusQuestoes,
    fillRates,
    detalhesLetras,
    coordenadasDetectadas,
    confianca: Math.round(confianca * 100) / 100,
    metodo: 'grid-fit'
  };
}
