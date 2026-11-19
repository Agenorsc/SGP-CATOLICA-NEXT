import { gerarLayoutCartao, LayoutCartaoOmr } from '@/lib/omr/layoutCartaoOmr';
import { lerCartaoOmrPorFiduciais, resolverHomografia, aplicarHomografia, inverterHomografia } from '@/lib/omr/cartaoOmrEngine';
import { OmrService } from '@/services/OmrService';

type Pt = { x: number; y: number };

interface CenarioFoto {
  W: number;
  H: number;
  opcoes: number[];
  /** questão -> letras marcadas (cobertura da tinta 0..1) */
  marcas: Record<number, Record<string, number>>;
  /** rotação da folha na foto (graus) */
  angulo: number;
  /** px por mm no centro */
  escala: number;
  /** deformação de perspectiva (0 = nenhuma) */
  perspectiva: number;
  caneta: 'azul' | 'preta';
  sombra?: boolean;
}

const QR_MM = 33;
const ORIGEM_CARTAO = { x: 48, y: -3 }; // centro da âncora TL no referencial da folha (mm a partir do canto do QR)
let fotoDebugH: number[] | null = null;

function gerarFoto(c: CenarioFoto) {
  const L: LayoutCartaoOmr = gerarLayoutCartao(c.opcoes);
  // Região da folha (mm) que será projetada na foto
  const regiao = [
    { x: -15, y: -20 },
    { x: ORIGEM_CARTAO.x + L.larguraFiduciais + 20, y: -20 },
    { x: -15, y: ORIGEM_CARTAO.y + L.alturaFiduciais + 20 },
    { x: ORIGEM_CARTAO.x + L.larguraFiduciais + 20, y: ORIGEM_CARTAO.y + L.alturaFiduciais + 20 }
  ];
  const cx = (regiao[0].x + regiao[3].x) / 2;
  const cy = (regiao[0].y + regiao[3].y) / 2;
  const th = (c.angulo * Math.PI) / 180;
  const destino = regiao.map((p, i) => {
    const dx = (p.x - cx) * c.escala;
    const dy = (p.y - cy) * c.escala;
    // perspectiva: lado "de cima" da folha mais estreito
    const k = i < 2 ? 1 - c.perspectiva : 1 + c.perspectiva;
    const rx = dx * k * Math.cos(th) - dy * Math.sin(th);
    const ry = dx * k * Math.sin(th) + dy * Math.cos(th);
    return { x: c.W / 2 + rx, y: c.H / 2 + ry };
  });
  const Hfolha = resolverHomografia(regiao, destino)!;
  fotoDebugH = Hfolha;
  const Hinv = inverterHomografia(Hfolha)!;

  let seed = 987;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const modulos = Array.from({ length: 33 * 33 }, () => rnd() > 0.5);
  const bolhas = L.bolhas.flat();
  const rBorda = L.diametroBolha / 2 - L.espessuraBorda / 2;

  const corEm = (X: number, Y: number): [number, number, number] => {
    const papel: [number, number, number] = [222, 214, 196];
    const preto: [number, number, number] = [28, 28, 32];
    // QR Code
    if (X >= 0 && X < QR_MM && Y >= 0 && Y < QR_MM) {
      return modulos[Math.floor(Y) * 33 + Math.floor(X)] ? preto : papel;
    }
    // Borda do quadro de respostas impresso
    const bx0 = -8, by0 = -15, bx1 = ORIGEM_CARTAO.x + L.larguraFiduciais + 12, by1 = ORIGEM_CARTAO.y + L.alturaFiduciais + 12;
    if (X >= bx0 && X <= bx1 && Y >= by0 && Y <= by1) {
      if (Math.abs(X - bx0) < 0.5 || Math.abs(X - bx1) < 0.5 || Math.abs(Y - by0) < 0.5 || Math.abs(Y - by1) < 0.5) return preto;
    }
    const Xc = X - ORIGEM_CARTAO.x;
    const Yc = Y - ORIGEM_CARTAO.y;
    const f = L.fiduciais;
    for (const p of [f.topLeft, f.topRight, f.bottomLeft, f.bottomRight]) {
      if (Math.abs(Xc - p.x) <= L.ladoFiducial / 2 && Math.abs(Yc - p.y) <= L.ladoFiducial / 2) return preto;
    }
    // Rótulos "Q.nn" e cabeçalho simulados com traços de texto
    for (const r of L.rotulos) {
      if (Xc <= r.x && Xc >= r.x - 6 && Math.abs(Yc - r.y) < 1.1 && Math.floor((r.x - Xc) / 0.55) % 2 === 0) return preto;
    }
    for (const h of L.cabecalhos) {
      if (Math.abs(Xc - h.x) < 0.9 && Math.abs(Yc - h.y) < 1.1 && Math.floor((Xc - h.x + 1) / 0.5) % 2 === 0) return preto;
    }
    for (const b of bolhas) {
      const dx = Xc - b.x, dy = Yc - b.y;
      if (Math.abs(dx) > 2.8 || Math.abs(dy) > 2.8) continue;
      const d = Math.hypot(dx, dy);
      const cobertura = c.marcas[b.questao]?.[b.letra] ?? 0;
      if (cobertura > 0 && d <= L.diametroBolha / 2 + 0.2) {
        const frac = (dy + L.diametroBolha / 2) / L.diametroBolha;
        const falha = (Math.floor(X * 7.3) + Math.floor(Y * 5.1)) % 9 === 0;
        if (frac <= cobertura && !falha) {
          return c.caneta === 'azul' ? [52, 70, 165] : [35, 35, 40];
        }
      }
      if (Math.abs(d - rBorda) <= L.espessuraBorda / 2 + 0.05) return preto;
      // letra interna clara
      if (d < 0.9 && Math.abs(dx) < 0.18) return [185, 185, 185];
      return papel;
    }
    return papel;
  };

  const data = new Uint8ClampedArray(c.W * c.H * 4);
  for (let py = 0; py < c.H; py++) {
    for (let px = 0; px < c.W; px++) {
      const p = aplicarHomografia(Hinv, { x: px, y: py });
      const [r, g, b] = corEm(p.x, p.y);
      const luz = c.sombra ? 0.62 + 0.38 * (px / c.W) : 1;
      const ruido = (rnd() - 0.5) * 16;
      const i = (py * c.W + px) * 4;
      data[i] = r * luz + ruido;
      data[i + 1] = g * luz + ruido;
      data[i + 2] = b * luz + ruido;
      data[i + 3] = 255;
    }
  }

  const q = (X: number, Y: number): Pt => aplicarHomografia(Hfolha, { x: X, y: Y });
  const tl = q(0, 0), tr = q(QR_MM, 0), br = q(QR_MM, QR_MM), bl = q(0, QR_MM);
  const anchor = {
    x: tl.x,
    y: tl.y,
    width: Math.hypot(tr.x - tl.x, tr.y - tl.y),
    height: Math.hypot(bl.x - tl.x, bl.y - tl.y),
    location: { topLeftCorner: tl, topRightCorner: tr, bottomRightCorner: br, bottomLeftCorner: bl }
  };
  return { img: { width: c.W, height: c.H, data }, anchor };
}

const MARCAS_7Q = {
  1: { B: 0.95 },
  2: { B: 0.9 },
  3: { A: 0.95 },
  4: { C: 0.88 },
  5: { A: 0.92 },
  6: { A: 0.9 },
  7: { C: 0.85 }
};
const ESPERADO_7Q = { 1: 'B', 2: 'B', 3: 'A', 4: 'C', 5: 'A', 6: 'A', 7: 'C' };
const OPS_7 = [4, 4, 4, 4, 4, 4, 4];

describe('CartaoOmrEngine — leitura por 4 âncoras + homografia (padrão lotérica)', () => {
  it('gera layout com geometria exata e âncoras nos 4 cantos', () => {
    const L = gerarLayoutCartao(OPS_7);
    expect(L.bolhas).toHaveLength(7);
    expect(L.bolhas[0]).toHaveLength(4);
    expect(L.fiduciais.bottomRight).toEqual({ x: L.larguraFiduciais, y: L.alturaFiduciais });
    const L30 = gerarLayoutCartao(Array(30).fill(5));
    expect(L30.bolhas[15][0].x).toBeGreaterThan(L30.bolhas[0][4].x);
    expect(L30.bolhas[15][0].y).toBe(L30.bolhas[0][0].y);
  });

  it.each([0, 90, 180, 270])('lê 7 questões com caneta azul com a folha girada %i°', angulo => {
    const { img, anchor } = gerarFoto({
      W: 1400, H: 1400, opcoes: OPS_7, marcas: MARCAS_7Q, angulo, escala: 7, perspectiva: 0, caneta: 'azul'
    });
    const res = lerCartaoOmrPorFiduciais(img, anchor, OPS_7);
    expect(res).not.toBeNull();
    expect(res!.metodo).toBe('fiducial-homografia');
    expect(res!.respostas).toEqual(ESPERADO_7Q);
    expect(res!.confianca).toBeGreaterThanOrEqual(0.9);
  });

  it('lê com rotação livre (37°), perspectiva forte e sombra lateral', () => {
    const { img, anchor } = gerarFoto({
      W: 1500, H: 1300, opcoes: OPS_7, marcas: MARCAS_7Q, angulo: 37, escala: 6.5, perspectiva: 0.12, caneta: 'azul', sombra: true
    });
    const res = lerCartaoOmrPorFiduciais(img, anchor, OPS_7);
    expect(res).not.toBeNull();
    expect(res!.fiduciais.topLeft.estimado).toBe(false);
    const tlEsperado = aplicarHomografia(fotoDebugH!, { x: ORIGEM_CARTAO.x, y: ORIGEM_CARTAO.y });
    expect(Math.hypot(res!.fiduciais.topLeft.x - tlEsperado.x, res!.fiduciais.topLeft.y - tlEsperado.y)).toBeLessThan(4);
    expect(res!.respostas).toEqual(ESPERADO_7Q);
  });

  it('identifica questão em branco e dupla marcação (anulada) com caneta preta', () => {
    const marcas = { 1: { A: 0.95 }, 2: { B: 0.9, D: 0.92 }, 4: { D: 0.9 }, 5: { E: 0.9 } };
    const ops = [5, 5, 5, 5, 5];
    const { img, anchor } = gerarFoto({
      W: 1300, H: 1100, opcoes: ops, marcas, angulo: -8, escala: 6.5, perspectiva: 0.05, caneta: 'preta'
    });
    const res = lerCartaoOmrPorFiduciais(img, anchor, ops);
    expect(res).not.toBeNull();
    expect(res!.respostas[1]).toBe('A');
    expect(res!.statusQuestoes[2]).toBe('ANULADA');
    expect(res!.marcadasPorQuestao[2]).toEqual(['B', 'D']);
    expect(res!.statusQuestoes[3]).toBe('EM_BRANCO');
    expect(res!.respostas[4]).toBe('D');
    expect(res!.respostas[5]).toBe('E');
  });

  it('lê cartão completo de 30 questões (2 blocos) girado 180°', () => {
    const ops = Array(30).fill(5);
    const letras = ['A', 'B', 'C', 'D', 'E'];
    const marcas: Record<number, Record<string, number>> = {};
    const esperado: Record<number, string | null> = {};
    for (let q = 1; q <= 30; q++) {
      if (q % 7 === 0) { esperado[q] = null; continue; }
      const l = letras[(q * 3) % 5];
      marcas[q] = { [l]: 0.9 };
      esperado[q] = l;
    }
    const { img, anchor } = gerarFoto({
      W: 1800, H: 1500, opcoes: ops, marcas, angulo: 180, escala: 6, perspectiva: 0.04, caneta: 'azul'
    });
    const res = lerCartaoOmrPorFiduciais(img, anchor, ops);
    expect(res).not.toBeNull();
    expect(res!.respostas).toEqual(esperado);
  });

  it('retorna null em folhas do layout antigo (sem âncoras de 8 mm) para acionar o motor legado', () => {
    const W = 800, H = 600;
    const data = new Uint8ClampedArray(W * H * 4).fill(220);
    const anchor = {
      x: 100, y: 100, width: 150, height: 150,
      location: {
        topLeftCorner: { x: 100, y: 100 }, topRightCorner: { x: 250, y: 100 },
        bottomRightCorner: { x: 250, y: 250 }, bottomLeftCorner: { x: 100, y: 250 }
      }
    };
    expect(lerCartaoOmrPorFiduciais({ width: W, height: H, data }, anchor, OPS_7)).toBeNull();
  });

  it('OmrService prioriza o motor de âncoras quando o cartão novo está presente', () => {
    const { img, anchor } = gerarFoto({
      W: 1400, H: 1400, opcoes: OPS_7, marcas: MARCAS_7Q, angulo: 90, escala: 7, perspectiva: 0.03, caneta: 'azul'
    });
    const res = new OmrService().processarGradeOMRFromImageData(img, 7, anchor, OPS_7);
    expect(res.metodo).toBe('fiducial-homografia');
    expect(res.respostas).toEqual(ESPERADO_7Q);
  });
});
