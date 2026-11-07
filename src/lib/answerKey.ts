/**
 * Gabarito embutido no QR Code da folha de respostas.
 *
 * A folha impressa é a única fonte de verdade sobre:
 *  - quantas questões objetivas foram impressas (nq);
 *  - quantas alternativas cada questão tem (op);
 *  - qual a alternativa correta de cada questão, já na ordem/embaralhamento
 *    daquela versão (k);
 *  - a pontuação de cada questão (pt).
 *
 * O gabarito é ofuscado com um deslocamento derivado do RA/ID do exame, para
 * que não seja legível ao simplesmente ler o QR Code com um app comum.
 */

const LETRAS = ['A', 'B', 'C', 'D', 'E'];
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface LayoutGabaritoQr {
  nq: number;
  op: string;
  k: string;
  pt?: string;
}

export interface GabaritoDecodificado {
  totalQuestoes: number;
  opcoesPorQuestao: number[];
  gabarito: Record<number, string>;
  pontos: number[];
}

const gerarDeslocamentos = (semente: string, n: number): number[] => {
  let h = 2166136261;
  for (let i = 0; i < semente.length; i++) {
    h ^= semente.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    h = (Math.imul(h ^ (h >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
    out.push(h % 26);
  }
  return out;
};

export function codificarGabaritoQr(
  respostasCorretas: string[],
  opcoesPorQuestao: number[],
  pontos: number[],
  semente: string
): LayoutGabaritoQr {
  const n = respostasCorretas.length;
  const desl = gerarDeslocamentos(semente, n);
  const k = respostasCorretas
    .map((letra, i) => {
      const idx = Math.max(0, LETRAS.indexOf(String(letra).trim().toUpperCase()));
      return ALFABETO[(idx + desl[i]) % 26];
    })
    .join('');
  return {
    nq: n,
    op: opcoesPorQuestao.map(o => String(Math.max(2, Math.min(5, o)))).join(''),
    k,
    pt: pontos.map(p => String(Number(p.toFixed(2)))).join(',')
  };
}

export function decodificarGabaritoQr(
  payload: Partial<LayoutGabaritoQr> | null | undefined,
  semente: string
): GabaritoDecodificado | null {
  if (!payload || typeof payload.k !== 'string' || !payload.k || !payload.nq) return null;
  const n = Math.max(1, Math.min(30, Number(payload.nq)));
  if (payload.k.length < n) return null;
  const desl = gerarDeslocamentos(semente, n);
  const opcoes: number[] = [];
  const gabarito: Record<number, string> = {};
  for (let i = 0; i < n; i++) {
    const o = Number(payload.op?.[i] ?? 5);
    opcoes.push(o >= 2 && o <= 5 ? o : 5);
    const c = ALFABETO.indexOf(payload.k[i].toUpperCase());
    if (c < 0) return null;
    const idx = (c - desl[i] + 26 * 4) % 26;
    if (idx > 4) return null;
    gabarito[i + 1] = LETRAS[idx];
  }
  const pontosBrutos = (payload.pt || '').split(',').map(Number);
  const pontos = Array.from({ length: n }, (_, i) =>
    Number.isFinite(pontosBrutos[i]) && pontosBrutos[i] > 0 ? pontosBrutos[i] : 10 / n
  );
  return { totalQuestoes: n, opcoesPorQuestao: opcoes, gabarito, pontos };
}

/** Semente estável da folha: exame + RA + versão. */
export const sementeGabarito = (examId: string, ra: string, versao: string) =>
  `${examId}|${String(ra).trim()}|${String(versao).trim().toUpperCase()}`;
