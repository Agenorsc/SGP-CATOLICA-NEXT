# TSK-62 — Impressão A4 frente e verso

Validação do RF09 e do RNF05. A correção deste PR se aplica à impressão individual da main, que já inclui a paginação da TSK-54 (PR #24).

## Resultados em PDF

Teste com Chrome Headless 157, 14 questões de múltipla escolha, uma imagem na questão 06 e dados fictícios.

| Cenário | Resultado |
| --- | --- |
| Individual, frente e verso | 7 páginas A4. Folha de respostas na página 1, página 2 totalmente branca e caderno a partir da página 3. |
| Individual, só frente | 6 páginas A4. Caderno a partir da página 2. |
| Controles e quebras | Controles de tela ausentes no PDF. Enunciado, imagem e alternativas da questão 06 na mesma página. |
| Lote, frente e verso | Na integração local com a TSK-52 (136f09e), o segundo cartão começou na página 8, uma página par. O lote precisa alinhar o início de cada cartão à frente da folha, inclusive após um caderno com número ímpar de páginas. |
| Edge e impressora física | Pendentes. O Edge não iniciou neste ambiente. A conferência em papel exige uma impressora física. |

A integração diagnóstica da TSK-52 exigiu resolver conflitos de CSS e de componente e preservar a renderização da imagem do PR #24 no componente de lote. A TSK-52 continua em sua branch própria.

## Roteiro de conferência

1. Monte uma prova com questões longas e com imagem perto de uma quebra de página.
2. Na aba **Impressão**, imprima primeiro em modo individual. Em Chrome e Edge, use A4 retrato, escala de 100% e desative cabeçalhos e rodapés do navegador.
3. Confira se os controles da tela ficam fora do PDF, se as margens ficam sem cortes e se enunciado, imagem e alternativas permanecem juntos quando cabem em uma página.
4. Com **Imprimir Frente e Verso (Duplex)** ativado, imprima pela borda longa e confirme que o gabarito está na frente da primeira folha, o verso do gabarito está em branco e o caderno começa na frente da próxima folha. Repita com a opção desligada e confira se o caderno começa na segunda página do PDF.
5. Quando a TSK-52 estiver integrada, repita com dois alunos e um caderno com quantidade ímpar de páginas. Confira se os dois cartões começam na frente de uma folha e se cada verso está em branco.
