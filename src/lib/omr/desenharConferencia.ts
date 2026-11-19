/**
 * Desenho da conferência visual do leitor OMR (cores por status de cada questão).
 *
 *  Verde ........ alternativa marcada e correta (ACERTO)
 *  Vermelho ..... alternativa marcada e errada (ERRO) + anel verde tracejado na correta
 *  Laranja ...... alternativas marcadas numa questão com dupla marcação (DUPLICADA)
 *  Âmbar ........ questão em branco: anel tracejado na alternativa correta
 *
 * O mesmo desenho é aplicado sobre a foto inteira e sobre o recorte retificado do cartão.
 */
import type { OMRProcessorOutput, QuestionOMRResult } from './omrProcessor';
import { aplicarHomografia, inverterHomografia } from './cartaoOmrEngine';
import type { LayoutCartaoOmr } from './layoutCartaoOmr';

type Pt = { x: number; y: number };

export const CORES_STATUS = {
  ACERTO: { fill: 'rgba(16, 185, 129, 0.55)', stroke: '#059669', texto: '#ffffff', fundo: '#059669' },
  ERRO: { fill: 'rgba(239, 68, 68, 0.55)', stroke: '#dc2626', texto: '#ffffff', fundo: '#dc2626' },
  DUPLICADA: { fill: 'rgba(249, 115, 22, 0.55)', stroke: '#ea580c', texto: '#ffffff', fundo: '#ea580c' },
  EM_BRANCO: { fill: 'rgba(245, 158, 11, 0.20)', stroke: '#d97706', texto: '#1f2937', fundo: '#fbbf24' }
} as const;

export interface TransformacaoDesenho {
  /** Converte um ponto da foto original para a tela/canvas de destino. */
  paraDestino: (p: Pt) => Pt;
  /** Fator aplicado ao raio real da bolinha (px da foto → px do destino). */
  escalaRaio: number;
  /** Raio usado quando o motor não informou o tamanho real da bolinha. */
  raioPadrao: number;
}

const rotuloStatus = (q: QuestionOMRResult): string => {
  if (q.status === 'ACERTO') return '✓';
  if (q.status === 'ERRO') return `✗ ${q.gabaritoOficial || '?'}`;
  if (q.status === 'DUPLICADA') return '2×';
  return '—';
};

export function desenharResultadoOmr(
  ctx: CanvasRenderingContext2D,
  resultado: OMRProcessorOutput,
  t: TransformacaoDesenho,
  opcoes: { rotulos?: boolean } = {}
): void {
  const mostrarRotulos = opcoes.rotulos ?? true;

  resultado.questoes.forEach(q => {
    if (q.bubbles.length === 0) return;
    const cor = CORES_STATUS[q.status];
    const len = q.bubbles.length;
    const ultimoBubble = len > 0 ? q.bubbles[len - 1] : null;
    const penultimoBubble = len > 1 ? q.bubbles[len - 2] : null;
    const ultimoPt: Pt | null = ultimoBubble ? t.paraDestino({ x: ultimoBubble.pixelX, y: ultimoBubble.pixelY }) : null;
    const penultimoPt: Pt | null = penultimoBubble ? t.paraDestino({ x: penultimoBubble.pixelX, y: penultimoBubble.pixelY }) : null;
    const raioLinha = ultimoBubble?.raioPx ? Math.max(4, ultimoBubble.raioPx * t.escalaRaio) : t.raioPadrao;

    for (const b of q.bubbles) {
      const p = t.paraDestino({ x: b.pixelX, y: b.pixelY });
      const r = b.raioPx ? Math.max(4, b.raioPx * t.escalaRaio) : t.raioPadrao;

      const correta = b.optionLetter === q.gabaritoOficial;
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 1.08, 0, 2 * Math.PI);

      if (b.isMarked) {
        const c = q.status === 'ACERTO' ? CORES_STATUS.ACERTO : q.status === 'ERRO' ? CORES_STATUS.ERRO : CORES_STATUS.DUPLICADA;
        ctx.fillStyle = c.fill;
        ctx.fill();
        ctx.lineWidth = Math.max(2, r * 0.28);
        ctx.strokeStyle = c.stroke;
        ctx.stroke();
      } else if (correta && (q.status === 'ERRO' || q.status === 'DUPLICADA')) {
        ctx.setLineDash([Math.max(3, r * 0.35), Math.max(2, r * 0.25)]);
        ctx.lineWidth = Math.max(2, r * 0.24);
        ctx.strokeStyle = CORES_STATUS.ACERTO.stroke;
        ctx.stroke();
      } else if (correta && q.status === 'EM_BRANCO') {
        ctx.fillStyle = CORES_STATUS.EM_BRANCO.fill;
        ctx.fill();
        ctx.setLineDash([Math.max(3, r * 0.35), Math.max(2, r * 0.25)]);
        ctx.lineWidth = Math.max(2, r * 0.24);
        ctx.strokeStyle = CORES_STATUS.EM_BRANCO.stroke;
        ctx.stroke();
      }
      ctx.restore();
    }

    if (mostrarRotulos && ultimoPt) {
      let dir = { x: 1, y: 0 };
      if (penultimoPt) {
        const dx = ultimoPt.x - penultimoPt.x, dy = ultimoPt.y - penultimoPt.y, d = Math.hypot(dx, dy);
        if (d > 0) dir = { x: dx / d, y: dy / d };
      }
      const texto = rotuloStatus(q);
      const fonte = Math.max(10, raioLinha * 1.25);
      const cx = ultimoPt.x + dir.x * raioLinha * 2.6;
      const cy = ultimoPt.y + dir.y * raioLinha * 2.6;
      ctx.save();
      ctx.font = `900 ${fonte}px Arial, Helvetica, sans-serif`;
      const larg = ctx.measureText(texto).width + fonte * 0.8;
      const alt = fonte * 1.35;
      ctx.fillStyle = cor.fundo;
      ctx.beginPath();
      const rx = cx - larg / 2, ry = cy - alt / 2, rr = alt / 2;
      ctx.moveTo(rx + rr, ry);
      ctx.lineTo(rx + larg - rr, ry);
      ctx.arc(rx + larg - rr, cy, rr, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(rx + rr, ry + alt);
      ctx.arc(rx + rr, cy, rr, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = cor.texto;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(texto, cx, cy + fonte * 0.04);
      ctx.restore();
    }
  });
}

/** Desenha o quadrilátero das 4 âncoras detectadas. */
export function desenharAncoras(
  ctx: CanvasRenderingContext2D,
  resultado: OMRProcessorOutput,
  paraDestino: (p: Pt) => Pt,
  escala: number
): void {
  const a = resultado.anchors;
  if (!a) return;
  const cantos = [a.topLeft, a.topRight, a.bottomRight, a.bottomLeft];
  ctx.save();
  ctx.lineWidth = Math.max(2, 3 * escala);
  ctx.strokeStyle = '#10b981';
  cantos.forEach(c => {
    const p = paraDestino({ x: c.x, y: c.y });
    const l = Math.max(8, c.width * escala);
    ctx.strokeRect(p.x - l / 2, p.y - l / 2, l, l);
  });
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = Math.max(1.5, 2 * escala);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
  ctx.beginPath();
  cantos.forEach((c, i) => {
    const p = paraDestino({ x: c.x, y: c.y });
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/**
 * Gera uma imagem "de frente" do cartão de respostas com as cores da correção.
 *  - Com homografia (cartão novo): retifica perspectiva e rotação → cartão reto.
 *  - Sem homografia (folhas antigas): recorte girado em torno das bolinhas lidas.
 */
export function gerarRecorteConferencia(
  fonte: HTMLCanvasElement,
  resultado: OMRProcessorOutput,
  homografia?: number[] | null,
  layout?: LayoutCartaoOmr | null
): string | null {
  const ctxFonte = fonte.getContext('2d', { willReadFrequently: true });
  if (!ctxFonte) return null;
  const destino = document.createElement('canvas');
  const ctx = destino.getContext('2d');
  if (!ctx) return null;

  if (homografia && layout) {
    const Hinv = inverterHomografia(homografia);
    if (!Hinv) return null;
    const k = Math.min(9, 1000 / Math.max(layout.larguraTotal, layout.alturaTotal));
    const pad = layout.margemExterna;
    const ow = Math.round(layout.larguraTotal * k);
    const oh = Math.round(layout.alturaTotal * k);
    destino.width = ow;
    destino.height = oh;
    const src = ctxFonte.getImageData(0, 0, fonte.width, fonte.height);
    const out = ctx.createImageData(ow, oh);
    const sw = src.width, sh = src.height;
    for (let oy = 0; oy < oh; oy++) {
      for (let ox = 0; ox < ow; ox++) {
        const p = aplicarHomografia(homografia, { x: (ox + 0.5) / k - pad, y: (oy + 0.5) / k - pad });
        const sx = Math.round(p.x), sy = Math.round(p.y);
        const o = (oy * ow + ox) * 4;
        if (sx >= 0 && sy >= 0 && sx < sw && sy < sh) {
          const s = (sy * sw + sx) * 4;
          out.data[o] = src.data[s];
          out.data[o + 1] = src.data[s + 1];
          out.data[o + 2] = src.data[s + 2];
        } else {
          out.data[o] = out.data[o + 1] = out.data[o + 2] = 30;
        }
        out.data[o + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
    const paraDestino = (p: Pt): Pt => {
      const mm = aplicarHomografia(Hinv, p);
      return { x: (mm.x + pad) * k, y: (mm.y + pad) * k };
    };
    desenharResultadoOmr(ctx, resultado, {
      paraDestino,
      escalaRaio: 0,
      raioPadrao: (layout.diametroBolha / 2) * k
    });
    return destino.toDataURL('image/jpeg', 0.9);
  }

  // Recorte girado (folhas sem as âncoras do cartão novo)
  const pontos = resultado.questoes.flatMap(q => q.bubbles.map(b => ({ x: b.pixelX, y: b.pixelY, r: b.raioPx ?? 0 })));
  if (pontos.length === 0) return null;
  const linha1 = resultado.questoes.find(q => q.bubbles.length >= 2)?.bubbles;
  const theta = linha1
    ? Math.atan2(linha1[linha1.length - 1].pixelY - linha1[0].pixelY, linha1[linha1.length - 1].pixelX - linha1[0].pixelX)
    : 0;
  const cx = pontos.reduce((s, p) => s + p.x, 0) / pontos.length;
  const cy = pontos.reduce((s, p) => s + p.y, 0) / pontos.length;
  const cos = Math.cos(-theta), sin = Math.sin(-theta);
  const girar = (p: Pt): Pt => ({
    x: (p.x - cx) * cos - (p.y - cy) * sin,
    y: (p.x - cx) * sin + (p.y - cy) * cos
  });
  const rot = pontos.map(girar);
  const raioMedio = pontos.reduce((s, p) => s + p.r, 0) / pontos.length || 12;
  const margem = raioMedio * 5;
  const minX = Math.min(...rot.map(p => p.x)) - margem;
  const maxX = Math.max(...rot.map(p => p.x)) + margem;
  const minY = Math.min(...rot.map(p => p.y)) - margem;
  const maxY = Math.max(...rot.map(p => p.y)) + margem;
  const s = Math.min(3, 1000 / Math.max(maxX - minX, maxY - minY));
  destino.width = Math.round((maxX - minX) * s);
  destino.height = Math.round((maxY - minY) * s);
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, destino.width, destino.height);
  ctx.save();
  ctx.translate(-minX * s, -minY * s);
  ctx.scale(s, s);
  ctx.rotate(-theta);
  ctx.translate(-cx, -cy);
  ctx.drawImage(fonte, 0, 0);
  ctx.restore();
  const paraDestino = (p: Pt): Pt => {
    const r = girar(p);
    return { x: (r.x - minX) * s, y: (r.y - minY) * s };
  };
  desenharResultadoOmr(ctx, resultado, { paraDestino, escalaRaio: s, raioPadrao: raioMedio * s });
  return destino.toDataURL('image/jpeg', 0.9);
}
