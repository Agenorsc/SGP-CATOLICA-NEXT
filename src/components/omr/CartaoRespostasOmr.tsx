'use client';

import React, { useMemo } from 'react';
import { gerarLayoutCartao } from '@/lib/omr/layoutCartaoOmr';

export interface CartaoRespostasOmrProps {
  /** Quantidade de alternativas impressas em cada questão (2..5), na ordem das questões. */
  opcoesPorQuestao: number[];
  className?: string;
}

/**
 * Cartão de respostas óptico desenhado em SVG com unidades em MILÍMETROS.
 *
 * O SVG garante que a distância entre as 4 âncoras e cada bolinha seja exatamente a
 * mesma usada pelo leitor (layoutCartaoOmr.ts), independente de fonte, navegador,
 * zoom ou impressora — exatamente como os volantes de loteria.
 */
export function CartaoRespostasOmr({ opcoesPorQuestao, className }: CartaoRespostasOmrProps) {
  const L = useMemo(() => gerarLayoutCartao(opcoesPorQuestao), [opcoesPorQuestao]);
  const meioFid = L.ladoFiducial / 2;
  const raioDesenho = L.diametroBolha / 2 - L.espessuraBorda / 2;
  const fiduciais = [L.fiduciais.topLeft, L.fiduciais.topRight, L.fiduciais.bottomLeft, L.fiduciais.bottomRight];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${L.larguraTotal}mm`}
      height={`${L.alturaTotal}mm`}
      viewBox={`${-L.margemExterna} ${-L.margemExterna} ${L.larguraTotal} ${L.alturaTotal}`}
      className={className}
      style={{ display: 'block', flexShrink: 0, printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
      role="img"
      aria-label={`Cartão de respostas com ${L.totalQuestoes} questões`}
      data-omr-layout={L.versao}
      data-omr-questoes={L.totalQuestoes}
    >
      <rect
        x={-L.margemExterna}
        y={-L.margemExterna}
        width={L.larguraTotal}
        height={L.alturaTotal}
        fill="#ffffff"
      />

      {fiduciais.map((f, i) => (
        <rect
          key={`fid-${i}`}
          x={f.x - meioFid}
          y={f.y - meioFid}
          width={L.ladoFiducial}
          height={L.ladoFiducial}
          fill="#000000"
          data-fiducial={['TL', 'TR', 'BL', 'BR'][i]}
        />
      ))}

      {L.cabecalhos.map((c, i) => (
        <text
          key={`cab-${i}`}
          x={c.x}
          y={c.y}
          fontSize={2.8}
          fontWeight={800}
          fontFamily="Arial, Helvetica, sans-serif"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#000000"
        >
          {c.letra}
        </text>
      ))}

      {L.rotulos.map(r => (
        <text
          key={`rot-${r.questao}`}
          x={r.x}
          y={r.y}
          fontSize={2.6}
          fontWeight={800}
          fontFamily="Arial, Helvetica, sans-serif"
          textAnchor="end"
          dominantBaseline="central"
          fill="#000000"
        >
          {r.texto}
        </text>
      ))}

      {L.bolhas.map((linha, q) =>
        linha.map(b => (
          <g key={`b-${q}-${b.indice}`} data-question={b.questao} data-option={b.letra}>
            <circle
              cx={b.x}
              cy={b.y}
              r={raioDesenho}
              fill="#ffffff"
              stroke="#000000"
              strokeWidth={L.espessuraBorda}
            />
            <text
              x={b.x}
              y={b.y}
              fontSize={2.3}
              fontWeight={400}
              fontFamily="Arial, Helvetica, sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#b8b8b8"
            >
              {b.letra.toLowerCase()}
            </text>
          </g>
        ))
      )}
    </svg>
  );
}
