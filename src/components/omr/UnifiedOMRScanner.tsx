'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Camera, 
  VideoOff, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft, 
  Zap, 
  Sparkles, 
  Clock, 
  Check, 
  X, 
  Loader2, 
  RotateCw, 
  Eye,
  Smartphone,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { ProvaMontadaRegistro, CadernoProvaRegistro } from '@/types';
import { AlunoModel } from '@/models/AlunoModel';
import { OMRProcessorOutput } from '@/lib/omr/omrProcessor';
import { classificarLeituraGrade, SaidaMotorGrade } from '@/lib/omr/omrGradeAdapter';
import { desenharAncoras, desenharResultadoOmr, gerarRecorteConferencia } from '@/lib/omr/desenharConferencia';
import { gerarLayoutCartao } from '@/lib/omr/layoutCartaoOmr';
import {
  DetectorNativo,
  QrDetectado,
  decodificarRegiao,
  detectarQrCompleto,
  gerarRegioesBusca
} from '@/lib/omr/qrScanner';
import { decodificarGabaritoQr, sementeGabarito } from '@/lib/answerKey';
import { OmrService } from '@/services/OmrService';

export type ScannerFlowStep = 
  | 'SCAN_QR'       // Passo 1: Busca e decodificação do QR Code 360°
  | 'STABILIZING'   // Passo 2: Timer regressivo de 2.0 segundos com enquadramento ativo
  | 'PROCESSING'    // Passo 3: Processamento OMR das marcas fiduciais e preenchimento
  | 'CONFERENCE';   // Passo 4: Conferência visual com sobreposição de cores e gravação

export interface UnifiedOMRScannerProps {
  provaMontadaId?: string; // Se fornecido, valida correspondência de turma/prova
  provasDisponiveis?: ProvaMontadaRegistro[];
  alunosDisponiveis?: AlunoModel[];
  onNotaSalva?: (resultado: any) => void;
  onVoltar?: () => void;
}

export function UnifiedOMRScanner({
  provaMontadaId,
  provasDisponiveis = [],
  alunosDisponiveis = [],
  onNotaSalva,
  onVoltar
}: UnifiedOMRScannerProps) {
  // Referências de DOM
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const snapshotCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Estados do Fluxo Unificado
  const [step, setStep] = useState<ScannerFlowStep>('SCAN_QR');
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [cameraErro, setCameraErro] = useState<string | null>(null);
  const [alertaDivergenciaProva, setAlertaDivergenciaProva] = useState<string | null>(null);

  // Controles de Hardware
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeCameraIdx, setActiveCameraIdx] = useState(0);
  const [torchDisponivel, setTorchDisponivel] = useState(false);
  const [torchAtivo, setTorchAtivo] = useState(false);

  // Dados da Avaliação e Caderno Identificados
  const [provaDetectadaId, setProvaDetectadaId] = useState<string>('');
  const [cadernoDetectadoId, setCadernoDetectadoId] = useState<string>('');
  const [provaTitulo, setProvaTitulo] = useState<string>('Avaliação Oficial');
  const [codigoVersao, setCodigoVersao] = useState<string>('CADERNO-A');
  const [gabaritoOficial, setGabaritoOficial] = useState<Record<string, string>>({});
  const [totalQuestoesCaderno, setTotalQuestoesCaderno] = useState<number>(10);
  const [valorPorQuestaoCaderno, setValorPorQuestaoCaderno] = useState<number>(1.0);

  // Dados do Estudante
  const [alunoNome, setAlunoNome] = useState<string>('Estudante Avaliado');
  const [alunoRa, setAlunoRa] = useState<string>('');

  // Timer de 2 Segundos (Passo 2)
  const [countdown, setCountdown] = useState<number>(2.0);

  // Resultado do Processamento OMR (Passos 3 e 4)
  const [omrResult, setOmrResult] = useState<OMRProcessorOutput | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [folhasLidasCount, setFolhasLidasCount] = useState<number>(0);

  // Snapshot congelado (imagem em base64 para preview)
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);
  // Recorte "de frente" do cartão com as cores da correção (Passo 4)
  const [recorteUrl, setRecorteUrl] = useState<string | null>(null);
  const [metodoLeitura, setMetodoLeitura] = useState<string>('');
  const saidaMotorRef = useRef<SaidaMotorGrade | null>(null);

  // Motor óptico comprovado (GridOmrEngine ancorado no QR) e estado de rastreamento
  const omrService = useMemo(() => new OmrService(), []);
  const detectorNativoRef = useRef<DetectorNativo>(new DetectorNativo());
  const ultimaAncoraRef = useRef<QrDetectado['anchor'] | null>(null);
  const regiaoIdxRef = useRef<number>(0);
  const cadernoRealIdRef = useRef<string | null>(null);
  const leituraRef = useRef<{
    totalQuestoes: number;
    gabarito: Record<string, string>;
    pontos: number[];
    opcoes: number[];
  }>({ totalQuestoes: 0, gabarito: {}, pontos: [], opcoes: [] });

  // Som de Feedback (Web Audio API)
  const tocarSom = useCallback((frequencia = 900, duracao = 0.1, tipo: OscillatorType = 'sine') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = tipo;
      osc.frequency.setValueAtTime(frequencia, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracao);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duracao);
    } catch (_) {}
  }, []);

  // Vibração Tátil
  const vibrar = useCallback((padrao = [60, 40, 60]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(padrao); } catch (_) {}
    }
  }, []);

  // Inicialização da Câmera (Preferência traseira + alta resolução)
  const startCamera = useCallback(async (deviceId?: string) => {
    setCameraErro(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : {
              facingMode: { ideal: 'environment' },
              width: { ideal: 3840 },
              height: { ideal: 2160 },
              advanced: [{ focusMode: 'continuous' }] as any
            }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraAtiva(true);
      }

      const track = stream.getVideoTracks()[0];
      if (track) {
        const caps = (track.getCapabilities ? track.getCapabilities() : {}) as any;
        setTorchDisponivel(!!caps.torch);
      }

      const devList = await navigator.mediaDevices.enumerateDevices();
      setCameras(devList.filter(d => d.kind === 'videoinput'));
    } catch (err: any) {
      console.error('Erro na câmera do scanner unificado:', err);
      setCameraErro('Não foi possível ativar a câmera. Verifique as permissões de vídeo do seu dispositivo.');
      setCameraAtiva(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera]);

  const alternarCamera = () => {
    if (cameras.length <= 1) return;
    const nextIdx = (activeCameraIdx + 1) % cameras.length;
    setActiveCameraIdx(nextIdx);
    startCamera(cameras[nextIdx].deviceId);
  };

  const alternarTorch = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (track) {
      try {
        const novoEstado = !torchAtivo;
        await (track as any).applyConstraints({ advanced: [{ torch: novoEstado }] });
        setTorchAtivo(novoEstado);
      } catch (_) {}
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PASSO 1: VARREDURA DO QR CODE (qualquer orientação)
  // jsQR já decodifica QR rotacionado; o que impedia a leitura era a resolução:
  // agora a busca roda em resolução nativa por blocos + BarcodeDetector nativo.
  // ─────────────────────────────────────────────────────────────────────────────
  const processarQrDetectado = useCallback(async (texto: string): Promise<boolean> => {
    let parsed: any;
    try {
      parsed = JSON.parse(texto.trim());
    } catch {
      setAlertaDivergenciaProva('QR Code lido não pertence a uma folha do SGP Católica.');
      return false;
    }

    const pId = String(parsed.p || parsed.examId || '').trim();
    const turmaQr = String(parsed.t || parsed.turmaId || '').trim();
    const etapaQr = String(parsed.s || parsed.stage || parsed.ciclo || '').trim().toUpperCase();
    const ra = String(parsed.r || parsed.studentRa || parsed.ra || '').trim();
    const versao = String(parsed.v || parsed.examVersion || 'A').toUpperCase();
    const cId = String(parsed.c || parsed.cadernoId || '').trim();
    const nomeQr = String(parsed.a || parsed.studentName || parsed.name || '').trim();

    if (!pId) {
      setAlertaDivergenciaProva('QR Code sem identificação da prova. Reimprima a folha pelo sistema.');
      return false;
    }

    // Localiza a prova correspondente em provasDisponiveis:
    // Compatível tanto com o UUID do banco quanto com o formato de impressão EXAM-{turmaId}-{ciclo}
    const provaAlvo = provaMontadaId ? (provasDisponiveis.find(p => p.id === provaMontadaId) || null) : null;
    const provaLocal = provasDisponiveis.find(p => {
      if (p.id === pId) return true;
      if (p.turmaId && (pId === `EXAM-${p.turmaId}-${p.ciclo}` || pId === `EXAM-${p.turmaId}`)) return true;
      if (turmaQr && p.turmaId === turmaQr && (!etapaQr || !p.ciclo || p.ciclo.toUpperCase() === etapaQr)) return true;
      if (cId && p.cadernos?.some(c => c.id === cId || c.codigoVersao === cId)) return true;
      if (ra && ra !== 'ANONIMO' && p.cadernos?.some(c => c.alunoRa === ra)) return true;
      return false;
    }) || null;

    if (provaMontadaId) {
      const ehMesmaProva =
        pId === provaMontadaId ||
        (provaLocal !== null && provaLocal.id === provaMontadaId) ||
        (provaAlvo !== null && (
          pId === `EXAM-${provaAlvo.turmaId}-${provaAlvo.ciclo}` ||
          pId === `EXAM-${provaAlvo.turmaId}` ||
          pId.includes(provaAlvo.turmaId) ||
          (turmaQr !== '' && provaAlvo.turmaId !== '' && turmaQr === provaAlvo.turmaId && (!etapaQr || !provaAlvo.ciclo || etapaQr === String(provaAlvo.ciclo).toUpperCase())) ||
          (cId !== '' && (provaAlvo.cadernos?.some(c => c.id === cId || c.codigoVersao === cId) ?? false)) ||
          (ra !== '' && ra !== 'ANONIMO' && (provaAlvo.cadernos?.some(c => c.alunoRa === ra) ?? false))
        ));

      if (!ehMesmaProva) {
        const nomeAlvo = provaAlvo?.titulo || provaMontadaId;
        const msg = `Esta folha pertence a outra prova (${pId}). Você abriu o leitor para a prova "${nomeAlvo}".`;
        setAlertaDivergenciaProva(prev => {
          if (prev !== msg) {
            tocarSom(300, 0.25, 'sawtooth');
            vibrar([200, 100, 200]);
          }
          return msg;
        });
        return false;
      }
    }

    // 1) Gabarito embutido (ofuscado) no próprio QR — fonte de verdade da folha impressa
    let decod = decodificarGabaritoQr(parsed, sementeGabarito(pId, ra, versao));

    // 2) Caderno salvo localmente / no servidor
    let cadernoData: CadernoProvaRegistro | null = null;
    if (provaLocal?.cadernos) {
      cadernoData = provaLocal.cadernos.find(c =>
        (cId && (c.id === cId || c.codigoVersao === cId)) ||
        (ra && (c as any).alunoRa === ra && String(c.codigoVersao || '').toUpperCase().endsWith(versao))
      ) || null;
    }
    if (!cadernoData && cId) {
      try {
        const res = await fetch(`/api/cadernos/${encodeURIComponent(cId)}`);
        if (res.ok) cadernoData = await res.json();
      } catch (_) {}
    }

    if (!decod && cadernoData?.gabaritoOficialJson && Object.keys(cadernoData.gabaritoOficialJson).length > 0) {
      const gab = cadernoData.gabaritoOficialJson as Record<string, string>;
      const n = Object.keys(gab).length;
      const g: Record<number, string> = {};
      Object.entries(gab).forEach(([k, v]) => { g[Number(k)] = String(v).toUpperCase(); });
      decod = {
        totalQuestoes: n,
        opcoesPorQuestao: Array.from({ length: n }, () => 5),
        gabarito: g,
        pontos: Array.from({ length: n }, () => 10 / n)
      };
    }

    if (!decod) {
      setAlertaDivergenciaProva('Não foi possível obter o gabarito desta folha. Reimprima a prova pelo sistema e tente novamente.');
      return false;
    }

    const gabaritoStr: Record<string, string> = {};
    Object.entries(decod.gabarito).forEach(([k, v]) => { gabaritoStr[String(k)] = v; });

    leituraRef.current = {
      totalQuestoes: decod.totalQuestoes,
      gabarito: gabaritoStr,
      pontos: decod.pontos,
      opcoes: decod.opcoesPorQuestao
    };
    cadernoRealIdRef.current = cadernoData?.id || null;

    const alunoCadastro = ra
      ? alunosDisponiveis.find(a => a.ra.trim().replace(/^0+/, '') === ra.replace(/^0+/, ''))
      : undefined;

    setAlertaDivergenciaProva(null);
    setProvaDetectadaId(provaLocal?.id || provaMontadaId || pId);
    setCadernoDetectadoId(cadernoData?.id || cId);
    setProvaTitulo(provaLocal?.titulo || provaAlvo?.titulo || 'Avaliação Oficial');
    setGabaritoOficial(gabaritoStr);
    setTotalQuestoesCaderno(decod.totalQuestoes);
    setValorPorQuestaoCaderno(Number((10 / decod.totalQuestoes).toFixed(2)));
    setCodigoVersao(cadernoData?.codigoVersao || `VERSÃO ${versao}`);
    setAlunoNome(alunoCadastro?.nome || nomeQr || cadernoData?.alunoNome || 'Estudante Avaliado');
    setAlunoRa(ra && ra !== 'ANONIMO' ? ra : (cadernoData?.alunoRa || ''));

    tocarSom(1100, 0.12, 'sine');
    vibrar([80, 40, 80]);
    setCountdown(2.0);
    setStep('STABILIZING');
    return true;
  }, [provaMontadaId, provasDisponiveis, alunosDisponiveis, tocarSom, vibrar]);

  useEffect(() => {
    if (!cameraAtiva || step !== 'SCAN_QR') return;

    let animId = 0;
    let cancelado = false;
    let ocupado = false;
    let ultimoScan = 0;
    const CADENCIA_MS = 80;

    const tick = async (ts: number) => {
      if (cancelado) return;
      const video = videoRef.current;
      const canvas = qrCanvasRef.current;

      if (
        video && canvas && !ocupado &&
        video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0 &&
        ts - ultimoScan >= CADENCIA_MS
      ) {
        ultimoScan = ts;
        ocupado = true;
        let concluido = false;
        try {
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          let det: QrDetectado | null = null;

          const nativo = detectorNativoRef.current;
          if (await nativo.inicializar()) {
            det = await nativo.detectar(video);
          }

          if (!det) {
            const regioes = gerarRegioesBusca(vw, vh, ultimaAncoraRef.current);
            const idx = regiaoIdxRef.current % regioes.length;
            regiaoIdxRef.current = (regiaoIdxRef.current + 1) % 10000;
            det = decodificarRegiao(video, regioes[idx], canvas);
          }

          if (det && !cancelado) {
            ultimaAncoraRef.current = det.anchor;
            concluido = await processarQrDetectado(det.data);
          }
        } catch (e) {
          console.warn('Falha na varredura do QR Code:', e);
        } finally {
          ocupado = false;
        }
        if (concluido) return;
      }

      if (!cancelado) animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => {
      cancelado = true;
      cancelAnimationFrame(animId);
    };
  }, [cameraAtiva, step, processarQrDetectado]);

  // PASSO 2: CONTADOR REGRESSIVO DE 2.0 SEGUNDOS COM PREVIEW AO VIVO
  // Durante a contagem o QR continua sendo rastreado para manter a âncora atualizada.
  useEffect(() => {
    if (step !== 'STABILIZING') return;

    const inicio = performance.now();
    const DURACAO_MS = 2000;
    let disparado = false;

    const timer = setInterval(() => {
      const restante = Math.max(0, DURACAO_MS - (performance.now() - inicio));
      setCountdown(Number((restante / 1000).toFixed(1)));

      const video = videoRef.current;
      const canvas = qrCanvasRef.current;
      if (video && canvas && ultimaAncoraRef.current && video.videoWidth > 0) {
        const regioes = gerarRegioesBusca(video.videoWidth, video.videoHeight, ultimaAncoraRef.current);
        const det = decodificarRegiao(video, regioes[0], canvas);
        if (det) ultimaAncoraRef.current = det.anchor;
      }

      if (restante <= 0 && !disparado) {
        disparado = true;
        clearInterval(timer);
        void capturarSnapshotEProcessar();
      }
    }, 100);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // PASSO 3: PRINT EM ALTA RESOLUÇÃO + MOTOR ÓPTICO ANCORADO NO QR CODE
  const capturarSnapshotEProcessar = async () => {
    if (!videoRef.current || !snapshotCanvasRef.current || !qrCanvasRef.current) return;
    const video = videoRef.current;
    const canvas = snapshotCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setSnapshotDataUrl(canvas.toDataURL('image/jpeg', 0.92));

    setStep('PROCESSING');
    tocarSom(750, 0.08, 'triangle');

    // Cede um frame para a UI mostrar o spinner antes do processamento pesado
    await new Promise(r => setTimeout(r, 60));

    try {
      // Posição EXATA do QR no instante da foto (a folha pode ter se movido)
      const qrNoPrint = await detectarQrCompleto(
        canvas,
        canvas.width,
        canvas.height,
        qrCanvasRef.current,
        detectorNativoRef.current,
        ultimaAncoraRef.current
      );
      const ancora = qrNoPrint?.anchor || ultimaAncoraRef.current;

      if (!ancora) {
        throw new Error('QR Code saiu do enquadramento durante a captura.');
      }

      const cfg = leituraRef.current;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const saidaBruta = omrService.processarGradeOMRFromImageData(
        imageData,
        cfg.totalQuestoes,
        ancora,
        cfg.opcoes
      );

      const configClassificacao = {
        totalQuestoes: cfg.totalQuestoes,
        gabarito: cfg.gabarito,
        pontosPorQuestao: cfg.pontos,
        opcoesPorQuestao: cfg.opcoes
      };
      const preliminar = classificarLeituraGrade(saidaBruta, configClassificacao);

      if (!preliminar.sucesso) {
        throw new Error(preliminar.erro || 'Grade de respostas não localizada.');
      }

      // Marcações explícitas por questão (base para a correção manual por toque)
      const marcadasPorQuestao: Record<number, string[]> = saidaBruta.marcadasPorQuestao
        ? { ...saidaBruta.marcadasPorQuestao }
        : Object.fromEntries(
            preliminar.questoes.map(q => [q.numero, q.bubbles.filter(b => b.isMarked).map(b => b.optionLetter)])
          );
      const saida: SaidaMotorGrade = { ...saidaBruta, marcadasPorQuestao };
      saidaMotorRef.current = saida;
      const resultado = classificarLeituraGrade(saida, configClassificacao);

      setMetodoLeitura(saida.metodo || '');
      setOmrResult(resultado);
      desenharSobreposicaoVisual(canvas.width, canvas.height, resultado);
      atualizarRecorte(resultado);
      setStep('CONFERENCE');
      tocarSom(1400, 0.15, 'sine');
      vibrar([100]);
    } catch (err: any) {
      console.warn('Falha no processamento OMR:', err);
      tocarSom(300, 0.25, 'sawtooth');
      setAlertaDivergenciaProva(
        `${err?.message || 'Falha na leitura.'} Enquadre a folha inteira (QR Code + quadro de respostas), sem sombra, e tente de novo.`
      );
      setSnapshotDataUrl(null);
      setStep('SCAN_QR');
    }
  };

  // PASSO 4: DESENHO DA SOBREPOSIÇÃO VISUAL (cores por status sobre a foto inteira)
  const desenharSobreposicaoVisual = (w: number, h: number, resultado: OMRProcessorOutput) => {
    if (!overlayCanvasRef.current) return;
    const overlay = overlayCanvasRef.current;
    overlay.width = w;
    overlay.height = h;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    const identidade = (p: { x: number; y: number }) => p;
    desenharAncoras(ctx, resultado, identidade, 1);
    desenharResultadoOmr(ctx, resultado, {
      paraDestino: identidade,
      escalaRaio: 1,
      raioPadrao: Math.max(10, Math.min(22, w * 0.016))
    });
  };

  // Recorte retificado do cartão (homografia) ou recorte girado (folhas antigas)
  const atualizarRecorte = (resultado: OMRProcessorOutput) => {
    const canvas = snapshotCanvasRef.current;
    if (!canvas) return;
    const saida = saidaMotorRef.current;
    const layout = saida?.homografia ? gerarLayoutCartao(leituraRef.current.opcoes) : null;
    try {
      setRecorteUrl(gerarRecorteConferencia(canvas, resultado, saida?.homografia ?? null, layout));
    } catch (e) {
      console.warn('Falha ao gerar recorte de conferência:', e);
      setRecorteUrl(null);
    }
  };

  // CORREÇÃO MANUAL: o professor toca numa alternativa para marcar/desmarcar
  const alternarMarcacaoManual = (numeroQuestao: number, letra: string) => {
    const saida = saidaMotorRef.current;
    if (!saida || !snapshotCanvasRef.current) return;
    const atuais = saida.marcadasPorQuestao?.[numeroQuestao] ?? [];
    const novas = atuais.includes(letra)
      ? atuais.filter(l => l !== letra)
      : [...atuais, letra].sort();
    const atualizada: SaidaMotorGrade = {
      ...saida,
      marcadasPorQuestao: { ...(saida.marcadasPorQuestao || {}), [numeroQuestao]: novas }
    };
    saidaMotorRef.current = atualizada;
    const cfg = leituraRef.current;
    const resultado = classificarLeituraGrade(atualizada, {
      totalQuestoes: cfg.totalQuestoes,
      gabarito: cfg.gabarito,
      pontosPorQuestao: cfg.pontos,
      opcoesPorQuestao: cfg.opcoes
    });
    setOmrResult(resultado);
    desenharSobreposicaoVisual(snapshotCanvasRef.current.width, snapshotCanvasRef.current.height, resultado);
    atualizarRecorte(resultado);
    tocarSom(1000, 0.05, 'sine');
  };

  // GRAVAÇÃO DA NOTA (CONFIRMAR E SALVAR NOTA)
  const handleConfirmarSalvarNota = async () => {
    if (!omrResult) return;
    try {
      setIsSaving(true);
      const payload = {
        provaMontadaId: provaDetectadaId,
        cadernoProvaId: cadernoRealIdRef.current,
        alunoNome: alunoNome.trim() || 'Estudante Avaliado',
        alunoRa: alunoRa.trim() || null,
        respostasMarcadasJson: omrResult.respostasMarcadasJson,
        acertos: omrResult.totalAcertos,
        totalQuestoes: omrResult.totalQuestoes,
        notaFinal: omrResult.notaFinal,
        lidoViaMobile: true
      };

      const res = await fetch('/api/resultados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Falha ao gravar resultado no servidor.');
      }

      const salvo = await res.json();
      if (onNotaSalva) {
        const provaLocal = provasDisponiveis.find(p => p.id === provaDetectadaId) || null;
        onNotaSalva({
          ...salvo,
          ciclo: (provaLocal?.ciclo || (provaDetectadaId.endsWith('-N1') ? 'N1' : provaDetectadaId.endsWith('-N3') ? 'N3' : provaDetectadaId.endsWith('-N-1') ? 'N-1' : 'N2')).toUpperCase(),
          turmaId: provaLocal?.turmaId,
          turmaNome: provaLocal?.turmaNome,
          materia: provaLocal?.disciplina,
          codigoVersao: codigoVersao,
          gabaritoOficial: leituraRef.current.gabarito,
          respostasMarcadasJson: omrResult.respostasMarcadasJson,
          detalhesQuestoes: omrResult.questoes.map(q => ({
            numero: q.numero,
            respostaMarcada: q.respostaMarcada,
            respostaCorreta: q.gabaritoOficial,
            correta: q.status === 'ACERTO',
            status: q.status === 'ACERTO' ? 'CORRETA' : q.status === 'ERRO' ? 'INCORRETA' : q.status === 'DUPLICADA' ? 'ANULADA' : 'EM_BRANCO',
            score: q.pontuacao,
            maxScore: q.maxPontuacao
          }))
        });
      }

      // Sucesso auditivo e háptico
      tocarSom(1600, 0.2, 'sine');
      vibrar([120]);
      setSaveSuccess(true);
      setFolhasLidasCount(prev => prev + 1);

      // Reinicia imediatamente para a próxima folha
      setTimeout(() => {
        setSaveSuccess(false);
        reiniciarParaProximaLeitura();
      }, 700);
    } catch (err: any) {
      alert(err?.message || 'Erro ao registrar nota.');
      setIsSaving(false);
    }
  };

  // REFAZER LEITURA (Descarta o snapshot e volta para a câmera imediatamente)
  const reiniciarParaProximaLeitura = () => {
    setSnapshotDataUrl(null);
    setRecorteUrl(null);
    setMetodoLeitura('');
    saidaMotorRef.current = null;
    setOmrResult(null);
    setCountdown(2.0);
    setIsSaving(false);
    ultimaAncoraRef.current = null;
    setStep('SCAN_QR');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans select-none animate-in fade-in duration-300">
      
      {/* 1. TOPO DA INTERFACE COM STATUS E CONTROLES DE CÂMERA */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 z-10">
        <button
          type="button"
          onClick={onVoltar}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Sair</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-catolica-primary text-white shadow-sm">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Leitor OMR Unificado</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Católica SC
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {torchDisponivel && (
            <button
              type="button"
              onClick={alternarTorch}
              className={`p-2 rounded-xl transition cursor-pointer ${
                torchAtivo
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40 ring-2 ring-amber-300'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title={torchAtivo ? 'Desligar Lanterna' : 'Ligar Lanterna'}
            >
              <Zap className="h-4 w-4" />
            </button>
          )}

          {cameras.length > 1 && (
            <button
              type="button"
              onClick={alternarCamera}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Alternar Câmera"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}

          <span className="text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
            Lidas: {folhasLidasCount}
          </span>
        </div>
      </div>

      {/* ALERTA DE DIVERGÊNCIA DE PROVA */}
      {alertaDivergenciaProva && (
        <div className="bg-amber-500/90 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between gap-2 z-20 animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{alertaDivergenciaProva}</span>
          </div>
          <button 
            type="button"
            onClick={() => setAlertaDivergenciaProva(null)}
            className="p-1 rounded bg-black/10 hover:bg-black/20"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. ÁREA CENTRAL: CÂMERA AO VIVO COM MIRA LASER OU SNAPSHOT CONFERÊNCIA */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        
        {/* Canvases Offscreen de Varredura e Snapshot */}
        <canvas ref={qrCanvasRef} className="hidden" />
        <canvas ref={snapshotCanvasRef} className="hidden" />

        {cameraErro ? (
          <div className="p-6 text-center max-w-sm space-y-3">
            <VideoOff className="h-12 w-12 mx-auto text-rose-500" />
            <h3 className="text-sm font-bold text-white">Câmera Indisponível</h3>
            <p className="text-xs text-slate-400">{cameraErro}</p>
            <button
              type="button"
              onClick={() => startCamera()}
              className="rounded-xl bg-catolica-primary px-4 py-2 text-xs font-bold text-white shadow-sm"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <>
            {/* Feed de Vídeo ao Vivo (visível nos passos SCAN_QR e STABILIZING) */}
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                step === 'CONFERENCE' ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              autoPlay
              playsInline
              muted
            />

            {/* Imagem Congelada do Snapshot (visível no passo CONFERENCE) */}
            {snapshotDataUrl && step === 'CONFERENCE' && (
              <img
                src={snapshotDataUrl}
                alt="Snapshot do Gabarito"
                className="absolute inset-0 w-full h-full object-contain"
              />
            )}

            {/* Canvas de Sobreposição de Círculos Coloridos (Acerto/Erro) */}
            <canvas
              ref={overlayCanvasRef}
              className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${
                step === 'CONFERENCE' ? 'block' : 'hidden'
              }`}
            />

            {/* PASSO 1: MIRA VISUAL DE ENQUADRAMENTO COM DETECÇÃO 360° */}
            {step === 'SCAN_QR' && (
              <div className="absolute inset-x-8 inset-y-16 sm:inset-x-16 sm:inset-y-20 border-2 border-emerald-500/60 rounded-3xl pointer-events-none shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col items-center justify-between p-4">
                {/* Cantoneiras Estilizadas */}
                <div className="absolute -top-1 -left-1 w-9 h-9 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl shadow-sm" />
                <div className="absolute -top-1 -right-1 w-9 h-9 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl shadow-sm" />
                <div className="absolute -bottom-1 -left-1 w-9 h-9 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl shadow-sm" />
                <div className="absolute -bottom-1 -right-1 w-9 h-9 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl shadow-sm" />

                {/* Dica de enquadramento (sem retículo central: o QR fica no rodapé da folha) */}
                <div className="mt-2 rounded-xl bg-black/75 px-3 py-1.5 text-center border border-emerald-500/30">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                    Buscando QR Code da folha...
                  </span>
                  <p className="text-[9px] text-slate-300 mt-0.5">
                    Qualquer orientação • boa iluminação • sem sombra
                  </p>
                </div>

                <div className="rounded-2xl bg-black/80 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white border border-white/10 text-center shadow-lg mb-2">
                  Enquadre a folha INTEIRA (QR Code + quadro de respostas)
                </div>
              </div>
            )}

            {/* PASSO 2: CONTADOR REGRESSIVO DE 2 SEGUNDOS (ESTABILIZAÇÃO) */}
            {step === 'STABILIZING' && (
              <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-xs border-4 border-emerald-400 flex flex-col items-center justify-center p-6 z-30 animate-in fade-in duration-200">
                <div className="w-24 h-24 rounded-full border-4 border-emerald-400 flex items-center justify-center bg-black/70 shadow-2xl shadow-emerald-500/50 mb-3 animate-pulse">
                  <span className="font-mono text-3xl font-black text-emerald-300">
                    {countdown.toFixed(1)}s
                  </span>
                </div>
                <div className="rounded-2xl bg-black/85 backdrop-blur-md px-5 py-3 text-center border border-emerald-500/50 shadow-2xl space-y-1">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>QR Code Identificado!</span>
                  </div>
                  <p className="text-xs text-slate-200">
                    Mantenha a folha parada e inteira no quadro... Capturando foto!
                  </p>
                </div>
              </div>
            )}

            {/* PASSO 3: SPINNER DE PROCESSAMENTO OMR */}
            {step === 'PROCESSING' && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30">
                <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
                <h3 className="text-sm font-black text-white">Processando Marcas e Gabarito...</h3>
                <p className="text-xs text-slate-300">Localizando as 4 âncoras do cartão e corrigindo a perspectiva...</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* PASSO 4: PAINEL INFERIOR DE CONFERÊNCIA VISUAL E GRAVAÇÃO DA NOTA */}
      {step === 'CONFERENCE' && omrResult && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[78vh] overflow-y-auto">
          {saveSuccess ? (
            <div className="py-6 text-center space-y-2">
              <CheckCheck className="h-14 w-14 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-base font-black text-white">Nota Registrada com Sucesso!</h3>
              <p className="text-xs text-slate-400">Pronto para escanear a próxima prova...</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* Header do Resultado com Nota Destacada */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {codigoVersao}
                    </span>
                    <span className="text-xs font-bold text-slate-300 line-clamp-1">
                      {provaTitulo}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {metodoLeitura === 'fiducial-homografia'
                      ? '✓ Cartão localizado pelas 4 âncoras (perspectiva corrigida)'
                      : omrResult.fiduciaisDetectados
                        ? '✓ Quadro de respostas localizado (folha modelo anterior)'
                        : '⚠️ Confira as marcações antes de salvar'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Nota Calculada</span>
                  <span className="text-3xl font-black text-emerald-400 tracking-tight">
                    {omrResult.notaFinal.toFixed(1)} <span className="text-sm font-normal text-slate-400">pts</span>
                  </span>
                </div>
              </div>

              {/* Cartão lido, de frente, com as cores da correção */}
              {recorteUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black">
                  <img src={recorteUrl} alt="Cartão de respostas lido" className="w-full h-auto max-h-[38vh] object-contain mx-auto" />
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2 py-1.5 text-[10px] font-bold bg-slate-950">
                    <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Acerto</span>
                    <span className="flex items-center gap-1 text-rose-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" />Erro</span>
                    <span className="flex items-center gap-1 text-orange-400"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" />Duplicada</span>
                    <span className="flex items-center gap-1 text-amber-300"><span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-amber-400" />Em branco / correta</span>
                  </div>
                </div>
              )}

              {/* Marcações por questão (toque numa letra para corrigir a leitura) */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-2.5">
                <p className="text-[10px] font-bold text-slate-400 mb-2 px-1">
                  Marcações lidas — toque numa letra para corrigir manualmente
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {omrResult.questoes.map(q => {
                    const opcoesQ = leituraRef.current.opcoes[q.numero - 1] ?? 5;
                    const marcadas = saidaMotorRef.current?.marcadasPorQuestao?.[q.numero] ?? [];
                    const corLinha =
                      q.status === 'ACERTO' ? 'border-emerald-500/50 bg-emerald-500/10'
                        : q.status === 'ERRO' ? 'border-rose-500/50 bg-rose-500/10'
                          : q.status === 'DUPLICADA' ? 'border-orange-500/50 bg-orange-500/10'
                            : 'border-amber-500/40 bg-amber-500/5';
                    const rotulo =
                      q.status === 'ACERTO' ? 'Acerto'
                        : q.status === 'ERRO' ? `Erro (certa: ${q.gabaritoOficial})`
                          : q.status === 'DUPLICADA' ? 'Duplicada'
                            : `Em branco (certa: ${q.gabaritoOficial})`;
                    return (
                      <div key={q.numero} className={`flex items-center gap-2 rounded-xl border px-2 py-1 ${corLinha}`}>
                        <span className="font-mono text-[11px] font-black text-white w-9">Q.{String(q.numero).padStart(2, '0')}</span>
                        <div className="flex gap-1">
                          {['A', 'B', 'C', 'D', 'E'].slice(0, opcoesQ).map(letra => {
                            const marcada = marcadas.includes(letra);
                            const correta = letra === q.gabaritoOficial;
                            const estilo = marcada
                              ? q.status === 'ACERTO' ? 'bg-emerald-500 text-white border-emerald-400'
                                : q.status === 'ERRO' ? 'bg-rose-500 text-white border-rose-400'
                                  : 'bg-orange-500 text-white border-orange-400'
                              : correta && q.status !== 'ACERTO'
                                ? 'bg-transparent text-emerald-300 border-emerald-400 border-dashed'
                                : 'bg-slate-900 text-slate-400 border-slate-600';
                            return (
                              <button
                                key={letra}
                                type="button"
                                onClick={() => alternarMarcacaoManual(q.numero, letra)}
                                className={`w-7 h-7 rounded-full border-2 text-[11px] font-black transition cursor-pointer ${estilo}`}
                                title={marcada ? `Desmarcar ${letra}` : `Marcar ${letra}`}
                              >
                                {letra}
                              </button>
                            );
                          })}
                        </div>
                        <span className="ml-auto text-[10px] font-bold text-slate-200 text-right leading-tight">{rotulo}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Informações do Estudante (Editáveis se necessário) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold mb-1">Nome do Aluno:</span>
                  <input
                    type="text"
                    value={alunoNome}
                    onChange={(e) => setAlunoNome(e.target.value)}
                    className="w-full font-bold text-white bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-600 focus:border-emerald-500 focus:outline-none"
                    placeholder="Nome do Aluno"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold mb-1">RA / Matrícula:</span>
                  <input
                    type="text"
                    value={alunoRa}
                    onChange={(e) => setAlunoRa(e.target.value)}
                    className="w-full font-mono text-slate-200 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-600 focus:border-emerald-500 focus:outline-none"
                    placeholder="Sem RA"
                  />
                </div>
              </div>

              {/* Badges de Contagem de Acertos, Erros e Alertas */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase">Acertos</span>
                  <strong className="text-base font-black text-emerald-400">{omrResult.totalAcertos}</strong>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/30 p-2 rounded-xl">
                  <span className="text-[10px] font-bold text-rose-400 block uppercase">Erros</span>
                  <strong className="text-base font-black text-rose-400">{omrResult.totalErros}</strong>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-400 block uppercase">Duplicadas</span>
                  <strong className="text-base font-black text-amber-400">{omrResult.totalDuplicadas}</strong>
                </div>
                <div className="bg-slate-800 border border-slate-700 p-2 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Em Branco</span>
                  <strong className="text-base font-black text-slate-300">{omrResult.totalEmBranco}</strong>
                </div>
              </div>

              {/* Botões de Ação Final */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={reiniciarParaProximaLeitura}
                  disabled={isSaving}
                  className="py-3 px-4 rounded-2xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refazer Leitura</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmarSalvarNota}
                  disabled={isSaving}
                  className="py-3 px-4 rounded-2xl bg-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Confirmar e Salvar Nota</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
