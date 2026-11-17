/**
 * Detecção robusta de QR Code em frames de câmera de celular.
 *
 * Problema anterior: o frame era reduzido para 640 px antes do jsQR. Numa foto da
 * folha A4 inteira o QR ocupa ~15–20% da largura, ou seja ~100 px para dezenas de
 * módulos (< 2 px por módulo) — ilegível.
 *
 * Estratégia atual (round-robin entre ticks para manter a fluidez):
 *  1. BarcodeDetector nativo (Chrome/Android, Safari recentes) quando disponível.
 *  2. jsQR no quadro inteiro reduzido para no máximo 1280 px.
 *  3. jsQR em 4 blocos sobrepostos (quadrantes) em RESOLUÇÃO NATIVA.
 *  4. jsQR em um recorte ao redor da última posição conhecida do QR (rastreamento).
 *
 * O jsQR já decodifica QR em qualquer rotação (detecta os 3 padrões localizadores),
 * então não é necessário girar o frame manualmente.
 */
import jsQR from 'jsqr';
import type { QrCodeAnchor } from '@/services/OmrService';

export interface Ponto {
  x: number;
  y: number;
}

export interface QrDetectado {
  data: string;
  anchor: QrCodeAnchor & {
    x: number;
    y: number;
    width: number;
    height: number;
    location: {
      topLeftCorner: Ponto;
      topRightCorner: Ponto;
      bottomRightCorner: Ponto;
      bottomLeftCorner: Ponto;
    };
  };
}

export interface RegiaoBusca {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Fator de escala aplicado ao recorte (1 = resolução nativa). */
  escala: number;
}

export const montarAncora = (
  tl: Ponto,
  tr: Ponto,
  br: Ponto,
  bl: Ponto
): QrDetectado['anchor'] => ({
  x: tl.x,
  y: tl.y,
  width: Math.hypot(tr.x - tl.x, tr.y - tl.y),
  height: Math.hypot(bl.x - tl.x, bl.y - tl.y),
  location: {
    topLeftCorner: tl,
    topRightCorner: tr,
    bottomRightCorner: br,
    bottomLeftCorner: bl
  }
});

/**
 * Gera a lista de regiões a testar, em ordem de prioridade.
 * Regiões em resolução nativa usam blocos de no máximo ~1100 px para manter o
 * custo do jsQR baixo em celulares.
 */
export function gerarRegioesBusca(
  vw: number,
  vh: number,
  ultimaAncora?: QrDetectado['anchor'] | null
): RegiaoBusca[] {
  const regioes: RegiaoBusca[] = [];

  // Rastreamento: recorte em torno da última posição conhecida
  if (ultimaAncora) {
    const lado = Math.max(ultimaAncora.width, ultimaAncora.height);
    const cx = ultimaAncora.x + lado / 2;
    const cy = ultimaAncora.y + lado / 2;
    const meia = Math.max(lado * 1.6, 160);
    const x = Math.max(0, Math.floor(cx - meia));
    const y = Math.max(0, Math.floor(cy - meia));
    const w = Math.min(vw - x, Math.ceil(meia * 2));
    const h = Math.min(vh - y, Math.ceil(meia * 2));
    if (w > 40 && h > 40) {
      const escala = Math.min(1, 900 / Math.max(w, h));
      regioes.push({ x, y, w, h, escala });
    }
  }

  // Quadro completo reduzido
  regioes.push({ x: 0, y: 0, w: vw, h: vh, escala: Math.min(1, 1280 / Math.max(vw, vh)) });

  // 4 quadrantes sobrepostos (62% de cada dimensão) em resolução nativa
  const tw = Math.floor(vw * 0.62);
  const th = Math.floor(vh * 0.62);
  const posicoes: Array<[number, number]> = [
    [0, vh - th], // inferior-esquerdo (posição típica do QR na folha)
    [0, 0],
    [vw - tw, vh - th],
    [vw - tw, 0]
  ];
  for (const [x, y] of posicoes) {
    regioes.push({ x, y, w: tw, h: th, escala: Math.min(1, 1100 / Math.max(tw, th)) });
  }

  // Centro em resolução nativa
  const cw = Math.floor(vw * 0.7);
  const ch = Math.floor(vh * 0.7);
  regioes.push({
    x: Math.floor((vw - cw) / 2),
    y: Math.floor((vh - ch) / 2),
    w: cw,
    h: ch,
    escala: Math.min(1, 1100 / Math.max(cw, ch))
  });

  return regioes;
}

/**
 * Decodifica o QR numa região específica da fonte (vídeo ou canvas).
 * Retorna as coordenadas já convertidas para o sistema da fonte (resolução nativa).
 */
export function decodificarRegiao(
  fonte: CanvasImageSource,
  regiao: RegiaoBusca,
  canvas: HTMLCanvasElement
): QrDetectado | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  const dw = Math.max(1, Math.round(regiao.w * regiao.escala));
  const dh = Math.max(1, Math.round(regiao.h * regiao.escala));
  if (canvas.width !== dw) canvas.width = dw;
  if (canvas.height !== dh) canvas.height = dh;

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(fonte, regiao.x, regiao.y, regiao.w, regiao.h, 0, 0, dw, dh);
  const img = ctx.getImageData(0, 0, dw, dh);
  const code = jsQR(img.data, dw, dh, { inversionAttempts: 'attemptBoth' });
  if (!code || !code.data) return null;

  const inv = 1 / regiao.escala;
  const conv = (p: Ponto): Ponto => ({ x: regiao.x + p.x * inv, y: regiao.y + p.y * inv });
  const loc = code.location;
  return {
    data: code.data,
    anchor: montarAncora(
      conv(loc.topLeftCorner),
      conv(loc.topRightCorner),
      conv(loc.bottomRightCorner),
      conv(loc.bottomLeftCorner)
    )
  };
}

/** Wrapper do BarcodeDetector nativo (quando suportado pelo navegador). */
export class DetectorNativo {
  private detector: any = null;
  private disponivel: boolean | null = null;

  async inicializar(): Promise<boolean> {
    if (this.disponivel !== null) return this.disponivel;
    try {
      const BD = typeof window !== 'undefined' ? (window as any).BarcodeDetector : undefined;
      if (!BD) {
        this.disponivel = false;
        return false;
      }
      const formatos: string[] = BD.getSupportedFormats ? await BD.getSupportedFormats() : ['qr_code'];
      if (!formatos.includes('qr_code')) {
        this.disponivel = false;
        return false;
      }
      this.detector = new BD({ formats: ['qr_code'] });
      this.disponivel = true;
      return true;
    } catch {
      this.disponivel = false;
      return false;
    }
  }

  async detectar(fonte: CanvasImageSource): Promise<QrDetectado | null> {
    if (!this.disponivel || !this.detector) return null;
    try {
      const codigos = await this.detector.detect(fonte);
      const c = codigos && codigos[0];
      if (!c || !c.rawValue) return null;
      const pts: Ponto[] = c.cornerPoints && c.cornerPoints.length === 4
        ? c.cornerPoints
        : [
            { x: c.boundingBox.x, y: c.boundingBox.y },
            { x: c.boundingBox.x + c.boundingBox.width, y: c.boundingBox.y },
            { x: c.boundingBox.x + c.boundingBox.width, y: c.boundingBox.y + c.boundingBox.height },
            { x: c.boundingBox.x, y: c.boundingBox.y + c.boundingBox.height }
          ];
      // cornerPoints vêm em sentido horário a partir do canto superior-esquerdo do código
      return { data: c.rawValue, anchor: montarAncora(pts[0], pts[1], pts[2], pts[3]) };
    } catch {
      return null;
    }
  }
}

/**
 * Varredura completa (todas as regiões) — usada no snapshot estático para obter a
 * posição exata do QR no instante da foto.
 */
export async function detectarQrCompleto(
  fonte: CanvasImageSource,
  largura: number,
  altura: number,
  canvasTrabalho: HTMLCanvasElement,
  detectorNativo?: DetectorNativo | null,
  ultimaAncora?: QrDetectado['anchor'] | null
): Promise<QrDetectado | null> {
  if (detectorNativo) {
    const nativo = await detectorNativo.detectar(fonte);
    if (nativo) return nativo;
  }
  for (const regiao of gerarRegioesBusca(largura, altura, ultimaAncora)) {
    const r = decodificarRegiao(fonte, regiao, canvasTrabalho);
    if (r) return r;
  }
  return null;
}
