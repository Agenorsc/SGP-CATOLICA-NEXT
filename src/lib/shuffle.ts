/**
 * Algoritmo determinístico de embaralhamento compartilhado (Fisher-Yates com seed pseudo-randômico)
 * Garante que a folha impressa (ImpressaoTab) e o motor óptico (OmrService/ExamService)
 * gerem a mesma ordem de questões e alternativas para cada versão de prova.
 */
export function shuffleArray<T>(array: T[], seed: number): T[] {
  const copy = [...array];
  let currentIndex = copy.length;
  let temporaryValue: T;
  let randomIndex: number;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.abs(Math.sin(seed++) * 10000)) % currentIndex;
    currentIndex -= 1;
    temporaryValue = copy[currentIndex];
    copy[currentIndex] = copy[randomIndex];
    copy[randomIndex] = temporaryValue;
  }
  return copy;
}
