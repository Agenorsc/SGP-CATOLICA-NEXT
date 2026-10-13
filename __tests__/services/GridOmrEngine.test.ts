import { OmrService } from '@/services/OmrService';
import { lerGradeOmrPorAjuste } from '@/services/omr/GridOmrEngine';

/**
 * Gera uma "foto" sintética realista da folha de respostas:
 * QR Code com módulos aleatórios, quadrados com borda impressa e letra interna,
 * linha de cabeçalho, rótulos "Q.n", rotação, iluminação irregular e ruído.
 */
interface Cenario {
  W: number;
  H: number;
  qrX: number;
  qrY: number;
  qrSize: number;
  anguloGraus: number;
  aA: number; // centro da coluna A (unidades de QR)
  b1: number; // centro da linha Q.1 (unidades de QR)
  pc: number; // passo entre colunas
  pr: number; // passo entre linhas
  half: number; // meia-largura do quadrado
  borda: number; // espessura da borda impressa
  marcas: Record<number, Record<string, number>>; // questão -> letra -> cobertura (0..1)
  totalQuestoes: number;
}

function gerarFoto(c: Cenario) {
  const data = new Uint8ClampedArray(c.W * c.H * 4);
  const th = (c.anguloGraus * Math.PI) / 180;
  const ux = Math.cos(th), uy = Math.sin(th);
  const vx = -Math.sin(th), vy = Math.cos(th);
  let seed = 1234;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const modulos: boolean[] = Array.from({ length: 25 * 25 }, () => rnd() > 0.5);
  const letras = ['A', 'B', 'C', 'D', 'E'];

  const lumEm = (a: number, b: number, px: number, py: number): number => {
    const tinta = 35;
    if (a >= 0 && a <= 1 && b >= 0 && b <= 1) {
      const mi = Math.min(24, Math.floor(a * 25));
      const mj = Math.min(24, Math.floor(b * 25));
      return modulos[mj * 25 + mi] ? tinta : 215;
    }
    // Linha do cabeçalho do quadro
    if (Math.abs(b - (c.b1 - c.pr * 0.9)) < c.borda * 0.6 && a > c.aA - c.pc * 1.6 && a < c.aA + 4.6 * c.pc) return tinta;
    for (let q = 0; q < c.totalQuestoes; q++) {
      const cb = c.b1 + q * c.pr;
      // Rótulo "Q.n:" à esquerda
      const la = c.aA - c.pc * 1.1;
      if (Math.abs(b - cb) < c.half * 0.45 && Math.abs(a - la) < c.half * 0.8 && Math.floor((a - la) * 400) % 3 === 0) return tinta;
      for (let k = 0; k < 5; k++) {
        const ca = c.aA + k * c.pc;
        const da = Math.abs(a - ca), db = Math.abs(b - cb);
        const m = Math.max(da, db);
        if (m > c.half) continue;
        if (m >= c.half - c.borda) return tinta;
        const cobertura = c.marcas[q + 1]?.[letras[k]] ?? 0;
        if (cobertura > 0) {
          // Rabisco de caneta: cobre uma fração da área interna com falhas
          const fracY = (b - (cb - c.half)) / (2 * c.half);
          const falha = ((px * 7 + py * 13) % 11) === 0;
          if (fracY <= cobertura + 0.02 && !falha) return 60;
        }
        // Letra impressa no centro do quadrado
        const s = c.half * 0.12;
        if ((da < s && db < c.half * 0.45) || (db < s && da < c.half * 0.35)) return tinta;
        return 215;
      }
    }
    return 215;
  };

  for (let py = 0; py < c.H; py++) {
    for (let px = 0; px < c.W; px++) {
      const dx = px - c.qrX, dy = py - c.qrY;
      const a = (dx * ux + dy * uy) / c.qrSize;
      const b = (dx * vx + dy * vy) / c.qrSize;
      let lum = lumEm(a, b, px, py);
      // Iluminação irregular (sombra lateral) + ruído do sensor
      lum = lum * (0.72 + 0.3 * (px / c.W)) + (rnd() - 0.5) * 18;
      const idx = (py * c.W + px) * 4;
      data[idx] = lum;
      data[idx + 1] = lum;
      data[idx + 2] = lum + 4;
      data[idx + 3] = 255;
    }
  }

  const s = c.qrSize;
  const anchor = {
    x: c.qrX,
    y: c.qrY,
    width: s,
    height: s,
    location: {
      topLeftCorner: { x: c.qrX, y: c.qrY },
      topRightCorner: { x: c.qrX + s * ux, y: c.qrY + s * uy },
      bottomLeftCorner: { x: c.qrX + s * vx, y: c.qrY + s * vy },
      bottomRightCorner: { x: c.qrX + s * ux + s * vx, y: c.qrY + s * uy + s * vy }
    }
  };
  return { img: { width: c.W, height: c.H, data }, anchor };
}

describe('GridOmrEngine - Leitura por ajuste de grade em foto estática', () => {
  it('lê corretamente a folha impressa em escala grande (QR pequeno) com rotação e sombra, anulando Q.4 dupla', () => {
    const { img, anchor } = gerarFoto({
      W: 1280,
      H: 720,
      qrX: 700,
      qrY: 60,
      qrSize: 110,
      anguloGraus: 4,
      aA: -2.3,
      b1: 3.6,
      pc: 0.47,
      pr: 0.5,
      half: 0.18,
      borda: 0.03,
      totalQuestoes: 4,
      marcas: {
        1: { E: 0.95 },
        2: { C: 0.9 },
        4: { B: 0.95, D: 0.6 }
      }
    });

    const inicio = Date.now();
    const res = lerGradeOmrPorAjuste(img, 4, anchor);
    const ms = Date.now() - inicio;
    // eslint-disable-next-line no-console
    console.log(`[grid-fit] cenário 1: ${ms} ms, confiança ${res?.confianca}`, res?.detalhesLetras);

    expect(res).not.toBeNull();
    expect(res!.respostas[1]).toBe('E');
    expect(res!.respostas[2]).toBe('C');
    expect(res!.statusQuestoes[3]).toBe('EM_BRANCO');
    expect(res!.respostas[4]).toBeNull();
    expect(res!.statusQuestoes[4]).toBe('ANULADA');
  });

  it('lê corretamente a folha em escala compacta (QR grande) com rotação negativa', () => {
    const { img, anchor } = gerarFoto({
      W: 1280,
      H: 720,
      qrX: 640,
      qrY: 40,
      qrSize: 150,
      anguloGraus: -3,
      aA: -1.33,
      b1: 2.15,
      pc: 0.276,
      pr: 0.29,
      half: 0.105,
      borda: 0.016,
      totalQuestoes: 4,
      marcas: {
        1: { A: 0.95 },
        2: { D: 0.9 },
        4: { C: 0.85 }
      }
    });

    const res = lerGradeOmrPorAjuste(img, 4, anchor);
    // eslint-disable-next-line no-console
    console.log(`[grid-fit] cenário 2: confiança ${res?.confianca}`, res?.detalhesLetras);

    expect(res).not.toBeNull();
    expect(res!.respostas[1]).toBe('A');
    expect(res!.respostas[2]).toBe('D');
    expect(res!.statusQuestoes[3]).toBe('EM_BRANCO');
    expect(res!.respostas[4]).toBe('C');
  });

  it('OmrService usa o motor de grade quando o QR Code está disponível', () => {
    const { img, anchor } = gerarFoto({
      W: 1280,
      H: 720,
      qrX: 700,
      qrY: 60,
      qrSize: 110,
      anguloGraus: 1,
      aA: -2.3,
      b1: 3.6,
      pc: 0.47,
      pr: 0.5,
      half: 0.18,
      borda: 0.03,
      totalQuestoes: 4,
      marcas: { 1: { B: 0.9 }, 2: { B: 0.9 }, 3: { A: 0.9 }, 4: { E: 0.9 } }
    });
    const res = new OmrService().processarGradeOMRFromImageData(img, 4, anchor);
    expect(res.metodo).toBe('grid-fit');
    expect(res.respostas).toEqual({ 1: 'B', 2: 'B', 3: 'A', 4: 'E' });
  });
});
