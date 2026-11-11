'use client';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Question } from '@/types';
import { printedAlternatives } from '@/lib/printVersions';

/** Um bloco por questão; só permite fragmentar quando ele ultrapassa a página A4. */
export function PrintableQuestion({ question, number, defaultPoints, answerNumber }: { question: Question; number: number; defaultPoints: string; answerNumber?: number }) {
  const element = useRef<HTMLElement>(null);
  const [oversized, setOversized] = useState(false);
  useLayoutEffect(() => {
    const measure = () => {
      const tooTall = (element.current?.getBoundingClientRect().height || 0) > 277 * 96 / 25.4;
      element.current?.classList.toggle('sgp-question--oversized', tooTall);
      setOversized(tooTall);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (element.current) observer?.observe(element.current);
    window.addEventListener('beforeprint', measure);
    return () => { observer?.disconnect(); window.removeEventListener('beforeprint', measure); };
  }, [question]);
  const alternatives = printedAlternatives(question);
  const objective = question.tipo === 'objetiva' || question.type === 'OBJECTIVE';
  const points = question.pontuacao ?? question.points ?? Number(defaultPoints);
  return <section ref={element} data-question-id={question.id} className={`sgp-question text-xs space-y-2.5 border-b border-slate-100 pb-4${oversized ? ' sgp-question--oversized' : ''}`}>
    <div className="sgp-question-heading font-bold text-slate-900 print:text-black">
      <span className="sgp-question-points float-right ml-2 text-[11px] font-mono">({points} pts)</span>
      <p className="sgp-question-statement text-xs sm:text-sm font-black">{number}) {question.enunciado || question.statement}</p>
      {answerNumber !== undefined && answerNumber !== number && <p className="text-[10px] mt-1">Folha de respostas: Q.{String(answerNumber).padStart(2, '0')}</p>}
      {question.imageUrl && <img className="sgp-question-image my-3 max-w-full" src={question.imageUrl} alt={question.imageAlt || `Imagem da questão ${number}`} />}
    </div>
    {objective && <div className="sgp-question-options space-y-1.5 pl-4 pt-1">
      {alternatives.map(({ text }, index) => <div key={index} className="sgp-question-option flex items-start gap-2 text-slate-800 print:text-black leading-relaxed">
        <span className="font-bold w-4 shrink-0">{String.fromCharCode(97 + index)})</span><span className="flex-1 whitespace-pre-wrap">{text}</span>
      </div>)}
    </div>}
    {!objective && <div className="sgp-discursive-answer mt-3 border border-dashed border-slate-300 print:border-slate-500 rounded-lg p-3 min-h-[90px] text-[10px] text-slate-400 italic">Espaço reservado para a resposta discursiva do estudante...</div>}
    {oversized && <p className="print:hidden text-amber-800 text-xs">Esta questão ultrapassa uma página e terá continuação.</p>}
  </section>;
}
