/** TSK-62: regressão do contrato de impressão A4 (RF09 / RNF05).
 * Testes estáticos: NÃO substituem impressão em Chrome, Edge ou papel.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
const component = readFileSync(join(process.cwd(), 'src/components/impressao/ImpressaoTab.tsx'), 'utf8');

describe('TSK-62 — contrato de impressão A4', () => {
  it('define página A4 retrato e margens de impressão', () => {
    expect(css).toMatch(/@page\s*\{[^}]*size:\s*A4 portrait\s*;/s);
    expect(css).toMatch(/@page\s*\{[^}]*margin:\s*10mm 12mm\s*;/s);
  });

  it('oculta controles interativos na impressão', () => {
    expect(component).toMatch(/BARRA SUPERIOR DE CONTROLES[\s\S]*?print:hidden/);
    expect(component).toContain('print:hidden');
  });

  it('inclui verso em branco apenas quando duplex está ativado', () => {
    expect(component).toMatch(/\{modoFrenteVerso\s*&&\s*\(\s*<div className="sgp-answer-sheet-back hidden print:block"/);
    expect(component).toContain('aria-hidden="true"');
  });

  it('força quebra após o cartão e após o verso em branco', () => {
    expect(css).toMatch(/\.sgp-answer-sheet\s*\{[^}]*break-after:\s*page/s);
    expect(css).toMatch(/\.sgp-answer-sheet-back\s*\{[^}]*break-after:\s*page/s);
  });

  it('evita dividir enunciado, imagem e alternativas quando cabem', () => {
    for (const selector of ['sgp-print-question', 'sgp-print-question-heading', 'sgp-print-question-image', 'sgp-print-question-option']) {
      expect(css).toContain('.' + selector);
      expect(component).toContain(selector);
    }
    expect(css).toMatch(/\.sgp-print-question\s*\{[^}]*break-inside:\s*avoid-page/s);
    expect(css).toMatch(/\.sgp-print-question-image,\s*\.sgp-print-question-option\s*\{[^}]*break-inside:\s*avoid-page/s);
  });

  it('preserva a opção de impressão frente e verso para o usuário', () => {
    expect(component).toContain('Imprimir Frente e Verso (Duplex)');
    expect(component).toContain('setModoFrenteVerso(e.target.checked)');
  });
});
