'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Scan, 
  AlertCircle, 
  Camera, 
  VideoOff, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  UserCheck, 
  Check, 
  X, 
  FileCheck2, 
  ShieldCheck,
  Upload,
  ArrowRight,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import jsQR from 'jsqr';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { 
  Question, 
  LeituraOMRRegistro, 
  SecureQrPayload, 
  OMRQuestionResult,
  CardPayload,
  EvaluationStage,
  QuestionResult,
  ScanResult
} from '@/types';
import { OmrService } from '@/services/OmrService';

export type ScannerState = 'IDLE' | 'SCANNING' | 'ANALYZED' | 'VALIDATED';

export interface CorrectionScannerProps {
  alunos: AlunoModel[];
  turmas: TurmaModel[];
  turmaSelecionadaId: string;
  questoesSelecionadas: Question[];
  bancoQuestoes?: Question[];
  tituloProva: string;
  shuffleQ: boolean;
  shuffleAlt: boolean;
  leiturasOMR: LeituraOMRRegistro[];
  onSalvarLeitura: (registro: LeituraOMRRegistro, alunoAtualizado: AlunoModel) => void;
  onSelecionarTurma?: (turmaId: string) => void;
}

export function CorrectionScanner({
  alunos,
  turmas,
  turmaSelecionadaId,
  questoesSelecionadas,
  bancoQuestoes = [],
  tituloProva,
  shuffleQ,
  shuffleAlt,
  leiturasOMR,
  onSalvarLeitura,
  onSelecionarTurma
}: CorrectionScannerProps) {
  const omrService = useMemo(() => new OmrService(), []);

  // 1. Controle de Abas de Turma: 'TODAS' (Automático) ou ID específico de turma
  const [abaTurmaAtiva, setAbaTurmaAtiva] = useState<string>('TODAS');

  // 2. Seletor de Ciclo Avaliativo de Contingência: 'AUTO' | 'N1' | 'N2' | 'N3' | 'N-1'
  const [cicloContingencia, setCicloContingencia] = useState<'AUTO' | EvaluationStage>('AUTO');

  // 3. Máquina de Estados: IDLE -> SCANNING -> ANALYZED -> VALIDATED
  const [scannerState, setScannerState] = useState<ScannerState>('IDLE');
  const [cameraAtiva, setCameraAtiva] = useState<boolean>(false);
  const [cameraErro, setCameraErro] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [showFlash, setShowFlash] = useState<boolean>(false);
  const [autoProgresso, setAutoProgresso] = useState<number>(0);
  const [etapaAnalise, setEtapaAnalise] = useState<string>('');

  // Dispositivos de Câmera
  const [camerasDisponiveis, setCamerasDisponiveis] = useState<Array<{ id: string; label: string }>>([]);
  const [cameraSelecionadaId, setCameraSelecionadaId] = useState<string>('');

  // 4. Alerta de Validação Cruzada (Cartão de outra turma lido com aba específica ativa)
  const [alertaCruzado, setAlertaCruzado] = useState<{
    turmaCartaoId: string;
    turmaCartaoNome: string;
    turmaAbaNome: string;
    rawText: string;
  } | null>(null);

  // 5. Dados do Aluno e Cartão Lido
  const [cardPayloadDetectado, setCardPayloadDetectado] = useState<CardPayload | null>(null);
  const [alunoAutenticado, setAlunoAutenticado] = useState<AlunoModel | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [resultadoRegistro, setResultadoRegistro] = useState<LeituraOMRRegistro | null>(null);
  const [alunoAtualizadoPendente, setAlunoAtualizadoPendente] = useState<AlunoModel | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Refs de Hardware e Canvas
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scannerStateRef = useRef<ScannerState>(scannerState);
  const qrAnchorRef = useRef<any>(null);
  const isPausedRef = useRef<boolean>(false);

  useEffect(() => {
    scannerStateRef.current = scannerState;
  }, [scannerState]);

  // Turma ativa selecionada na aba
  const turmaAbaObj = useMemo(() => {
    if (abaTurmaAtiva === 'TODAS') return null;
    return turmas.find(t => t.id === abaTurmaAtiva) || null;
  }, [turmas, abaTurmaAtiva]);

  // Alunos visíveis para a aba atual
  const alunosFiltradosAba = useMemo(() => {
    if (abaTurmaAtiva === 'TODAS') return alunos;
    return alunos.filter(a => a.turmaId === abaTurmaAtiva);
  }, [alunos, abaTurmaAtiva]);

  // Som de Beep
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (_) {}
  };

  // Enumeração de Câmeras
  const carregarCameras = async () => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devices
          .filter(d => d.kind === 'videoinput')
          .map((d, i) => ({
            id: d.deviceId,
            label: d.label || `Câmera ${i + 1}`
          }));
        if (videoDevs.length > 0) {
          setCamerasDisponiveis(videoDevs);
          if (!cameraSelecionadaId) {
            const traseira = videoDevs.find(d => /back|rear|environment|traseira/i.test(d.label));
            setCameraSelecionadaId(traseira ? traseira.id : videoDevs[0].id);
          }
        }
      } catch (_) {}
    }
  };

  useEffect(() => {
    carregarCameras();
  }, []);

  // Cleanup de Câmera
  useEffect(() => {
    return () => {
      if (scanLoopRef.current) {
        cancelAnimationFrame(scanLoopRef.current);
        scanLoopRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  /**
   * Resolução das Questões da Prova para a Turma e Ciclo
   */
  const obterQuestoesParaProva = useCallback((classId: string, stage: EvaluationStage): Question[] => {
    // 1. Tenta encontrar no banco de questões do professor para a turma e ciclo exatos
    if (bancoQuestoes && bancoQuestoes.length > 0) {
      const questoesTurmaCiclo = bancoQuestoes.filter(
        q => (q.turmaId === classId || q.classId === classId) && (q.avaliacao === stage || q.stage === stage)
      );
      if (questoesTurmaCiclo.length > 0) return questoesTurmaCiclo;

      // Se N-1 (recuperação / conteúdo semestral), pode unir N1 + N2 + N3
      if (stage === 'N-1') {
        const todasSemestre = bancoQuestoes.filter(
          q => (q.turmaId === classId || q.classId === classId) &&
               (q.avaliacao === 'N1' || q.avaliacao === 'N2' || q.avaliacao === 'N3' || q.avaliacao === 'N-1' ||
                q.stage === 'N1' || q.stage === 'N2' || q.stage === 'N3' || q.stage === 'N-1')
        );
        if (todasSemestre.length > 0) return todasSemestre;
      }
    }

    // 2. Fallback para as questões atualmente selecionadas no montador
    return questoesSelecionadas;
  }, [bancoQuestoes, questoesSelecionadas]);

  /**
   * Inicia o Sensor de Câmera
   */
  const handleIniciarCamera = async (deviceIdOverride?: string) => {
    if (isStartingCamera) return;
    setIsStartingCamera(true);
    setCameraErro(null);
    setAlertaCruzado(null);
    setMensagemSucesso(null);
    isPausedRef.current = false;

    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    try {
      await carregarCameras();
      const targetId = deviceIdOverride || cameraSelecionadaId;

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: targetId
            ? {
                deviceId: { exact: targetId },
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 }
              }
            : {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 }
              },
          audio: false
        });
      } catch (_) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: targetId ? { deviceId: { exact: targetId } } : true,
          audio: false
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      await carregarCameras();
      setCameraAtiva(true);
      setScannerState('SCANNING');
      iniciarLoopVarredura();
    } catch (err: any) {
      console.error('Erro ao acessar webcam:', err);
      setCameraErro('Não foi possível acessar a câmera. Verifique permissões ou use a bancada de simulação.');
      setCameraAtiva(false);
      setScannerState('IDLE');
    } finally {
      setIsStartingCamera(false);
    }
  };

  /**
   * Encerramento da Câmera
   */
  const handleDesligarCamera = () => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraAtiva(false);
    setScannerState('IDLE');
  };

  /**
   * Loop de Varredura Contínua (QR Code + Detecção Rápida)
   */
  const iniciarLoopVarredura = () => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let ultimoScan = 0;

    const tick = () => {
      if (scannerStateRef.current !== 'SCANNING' || isPausedRef.current) {
        scanLoopRef.current = requestAnimationFrame(tick);
        return;
      }

      const agora = performance.now();
      if (agora - ultimoScan >= 60) {
        ultimoScan = agora;

        const video = videoRef.current;
        if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          let textoDecodificado: string | null = null;
          let detectedAnchor: any = null;

          // 1. Centro do retículo
          const cropSize = Math.floor(Math.min(vw, vh) * 0.72);
          const cropX = Math.floor((vw - cropSize) / 2);
          const cropY = Math.floor((vh - cropSize) / 2);

          canvas.width = cropSize;
          canvas.height = cropSize;
          ctx.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);
          const centerImg = ctx.getImageData(0, 0, cropSize, cropSize);

          let code = jsQR(centerImg.data, cropSize, cropSize, { inversionAttempts: 'attemptBoth' });

          if (code && code.data) {
            textoDecodificado = code.data;
            const loc = code.location;
            detectedAnchor = {
              x: loc.topLeftCorner.x + cropX,
              y: loc.topLeftCorner.y + cropY,
              width: Math.hypot(loc.topRightCorner.x - loc.topLeftCorner.x, loc.topRightCorner.y - loc.topLeftCorner.y),
              height: Math.hypot(loc.bottomLeftCorner.x - loc.topLeftCorner.x, loc.bottomLeftCorner.y - loc.topLeftCorner.y),
              location: {
                topLeftCorner: { x: loc.topLeftCorner.x + cropX, y: loc.topLeftCorner.y + cropY },
                topRightCorner: { x: loc.topRightCorner.x + cropX, y: loc.topRightCorner.y + cropY },
                bottomRightCorner: { x: loc.bottomRightCorner.x + cropX, y: loc.bottomRightCorner.y + cropY },
                bottomLeftCorner: { x: loc.bottomLeftCorner.x + cropX, y: loc.bottomLeftCorner.y + cropY }
              }
            };
          }

          // 2. Quadro completo escalonado
          if (!textoDecodificado) {
            const scale = Math.min(1, 960 / Math.max(vw, vh));
            const sw = Math.floor(vw * scale);
            const sh = Math.floor(vh * scale);

            canvas.width = sw;
            canvas.height = sh;
            ctx.drawImage(video, 0, 0, sw, sh);
            const fullImg = ctx.getImageData(0, 0, sw, sh);

            code = jsQR(fullImg.data, sw, sh, { inversionAttempts: 'attemptBoth' });
            if (code && code.data) {
              textoDecodificado = code.data;
              const inv = 1 / scale;
              const loc = code.location;
              detectedAnchor = {
                x: loc.topLeftCorner.x * inv,
                y: loc.topLeftCorner.y * inv,
                width: Math.hypot(loc.topRightCorner.x - loc.topLeftCorner.x, loc.topRightCorner.y - loc.topLeftCorner.y) * inv,
                height: Math.hypot(loc.bottomLeftCorner.x - loc.topLeftCorner.x, loc.bottomLeftCorner.y - loc.topLeftCorner.y) * inv,
                location: {
                  topLeftCorner: { x: loc.topLeftCorner.x * inv, y: loc.topLeftCorner.y * inv },
                  topRightCorner: { x: loc.topRightCorner.x * inv, y: loc.topRightCorner.y * inv },
                  bottomRightCorner: { x: loc.bottomRightCorner.x * inv, y: loc.bottomRightCorner.y * inv },
                  bottomLeftCorner: { x: loc.bottomLeftCorner.x * inv, y: loc.bottomLeftCorner.y * inv }
                }
              };
            }
          }

          if (textoDecodificado && detectedAnchor) {
            qrAnchorRef.current = detectedAnchor;
            processarLeituraQrDetectado(textoDecodificado, video);
            return;
          }
        }
      }

      scanLoopRef.current = requestAnimationFrame(tick);
    };

    scanLoopRef.current = requestAnimationFrame(tick);
  };

  /**
   * Processamento e Validação Cruzada ao Detectar QR Code
   */
  const processarLeituraQrDetectado = (rawText: string, video: HTMLVideoElement) => {
    // Validação do QR Code com suporte a isolamento de turmas
    const validacao = omrService.validarPayloadQrCode(
      rawText,
      alunosFiltradosAba,
      abaTurmaAtiva,
      turmas,
      alunos
    );

    // Validação Cruzada: Aba ativa específica vs Cartão pertencente a outra turma
    if (validacao.inconsistenciaTurma) {
      isPausedRef.current = true;
      try {
        video.pause();
      } catch (_) {}

      let parsed: any = {};
      try { parsed = JSON.parse(rawText); } catch (_) {}
      const classIdDoCartao = parsed.classId || parsed.turmaId || '';
      const nomeTurmaCartao = validacao.turmaDetectadaNome || 'Outra Turma';
      const nomeAbaAtiva = validacao.turmaAtivaNome || turmaAbaObj?.nome || abaTurmaAtiva;

      setAlertaCruzado({
        turmaCartaoId: classIdDoCartao,
        turmaCartaoNome: nomeTurmaCartao,
        turmaAbaNome: nomeAbaAtiva,
        rawText
      });
      return;
    }

    if (!validacao.sucesso || !validacao.cardPayload || !validacao.aluno) {
      setCameraErro(validacao.erro || 'QR Code não autorizado ou inválido.');
      return;
    }

    setCameraErro(null);
    setAlertaCruzado(null);

    // Ciclo efetivo: Contingência manual (se selecionada) sobrepõe o QR Code
    const stageFinal: EvaluationStage = cicloContingencia !== 'AUTO' 
      ? cicloContingencia 
      : validacao.cardPayload.stage;

    const payloadFinal: CardPayload = {
      ...validacao.cardPayload,
      stage: stageFinal
    };

    setCardPayloadDetectado(payloadFinal);
    setAlunoAutenticado(validacao.aluno);

    // Dispara a captura estática e análise de notas
    executarCapturaEAnalise(video, payloadFinal, validacao.aluno);
  };

  /**
   * Captura Freeze-Frame (Snapshot) + Leitura OMR das Bolhas/Quadrados
   */
  const executarCapturaEAnalise = async (
    video: HTMLVideoElement,
    payload: CardPayload,
    aluno: AlunoModel
  ) => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }

    const vw = video.videoWidth || 960;
    const vh = video.videoHeight || 720;

    const snap = document.createElement('canvas');
    snap.width = vw;
    snap.height = vh;
    const snapCtx = snap.getContext('2d', { willReadFrequently: true });
    if (!snapCtx) return;
    snapCtx.drawImage(video, 0, 0, vw, vh);

    try {
      video.pause();
    } catch (_) {}

    const rCanvas = resultCanvasRef.current;
    if (rCanvas) {
      rCanvas.width = vw;
      rCanvas.height = vh;
      rCanvas.getContext('2d')?.drawImage(snap, 0, 0);
    }

    playBeep();
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 260);

    setAutoProgresso(15);
    setEtapaAnalise('📸 Cartão detectado! Analisando respostas...');

    try {
      const imgData = snapCtx.getImageData(0, 0, vw, vh);

      // Localiza questões e gabarito oficial para a turma e ciclo
      const questoesBase = obterQuestoesParaProva(payload.classId, payload.stage);
      const totalObjetivas = Math.max(1, questoesBase.filter(q => q.tipo === 'objetiva' || q.type === 'OBJECTIVE').length);

      setAutoProgresso(45);
      setEtapaAnalise('📐 Mapeando quadro de respostas óptico...');

      const anchor = qrAnchorRef.current;
      const resOMR = omrService.processarGradeOMRFromImageData(imgData, totalObjetivas, anchor || undefined);

      setAutoProgresso(80);
      setEtapaAnalise('✏️ Computando alternativas assinaladas...');

      const turmaCardObj = turmas.find(t => t.id === payload.classId) || new TurmaModel({
        id: payload.classId,
        nome: payload.className
      });

      const versaoLetra = payload.examVersion || 'A';

      const registro = omrService.processarCorrecaoAutomatica({
        aluno,
        turma: turmaCardObj,
        materia: tituloProva,
        versaoLetra,
        questoesBase,
        shuffleQ,
        shuffleAlt,
        respostasDetectadas: resOMR.respostas,
        statusCustom: resOMR.statusQuestoes,
        fillRatesCustom: resOMR.fillRates,
        fiduciaisValidados: true,
        simular: false,
        stage: payload.stage
      });

      // Desenha grid de sobreposição no canvas de resultado
      if (rCanvas && resOMR.coordenadasDetectadas) {
        const ctx2 = rCanvas.getContext('2d');
        if (ctx2) {
          ctx2.drawImage(snap, 0, 0);
          Object.entries(resOMR.coordenadasDetectadas).forEach(([qNum, letrasCoords]) => {
            const questaoDet = registro.detalhesQuestoes?.find(d => d.numero === parseInt(qNum, 10));
            const status = questaoDet?.status;
            const respostaMarcada = questaoDet?.respostaMarcada;

            Object.entries(letrasCoords).forEach(([letra, pt]) => {
              const bSize = pt.boxSize || 22;
              const half = bSize / 2;

              ctx2.beginPath();
              ctx2.rect(pt.x - half, pt.y - half, bSize, bSize);
              ctx2.lineWidth = 1.5;
              ctx2.strokeStyle = 'rgba(56, 189, 248, 0.85)';
              ctx2.stroke();

              if (status && status !== 'EM_BRANCO' && letra === respostaMarcada) {
                const cor = status === 'CORRETA' ? '#10b981' : '#ef4444';
                ctx2.lineWidth = 3.5;
                ctx2.strokeStyle = cor;
                ctx2.fillStyle = status === 'CORRETA' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)';
                ctx2.fill();
                ctx2.stroke();
              }
            });
          });
        }
      }

      // Prepara o Aluno Atualizado com a nota no ciclo correspondente
      const notaFinal = registro.notaCalculada;
      let alunoAtualizado = new AlunoModel({ ...aluno });

      if (payload.stage === 'N1') {
        alunoAtualizado = new AlunoModel({ ...aluno, n1: notaFinal });
      } else if (payload.stage === 'N2') {
        alunoAtualizado = new AlunoModel({ ...aluno, n2: notaFinal });
      } else if (payload.stage === 'N3') {
        alunoAtualizado = new AlunoModel({ ...aluno, n3: notaFinal });
      } else if (payload.stage === 'N-1') {
        // N-1 substitui a menor nota ou n2
        const menor = Math.min(aluno.n1, aluno.n2, aluno.n3);
        if (menor === aluno.n1) alunoAtualizado = new AlunoModel({ ...aluno, n1: notaFinal });
        else if (menor === aluno.n3) alunoAtualizado = new AlunoModel({ ...aluno, n3: notaFinal });
        else alunoAtualizado = new AlunoModel({ ...aluno, n2: notaFinal });
      }

      // Snapshot em Base64
      let snapBase64 = '';
      try { snapBase64 = snap.toDataURL('image/jpeg', 0.85); } catch (_) {}

      const scanRes = omrService.converterParaScanResult(registro, payload, snapBase64);

      setScanResult(scanRes);
      setResultadoRegistro(registro);
      setAlunoAtualizadoPendente(alunoAtualizado);
      setAutoProgresso(100);
      setEtapaAnalise('✅ Prova analisada. Confira as notas e valide.');
      setScannerState('ANALYZED');

      // Interrompe temporariamente a câmera física durante o estado ANALYZED
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setCameraAtiva(false);
    } catch (err: any) {
      console.error('Erro na análise OMR:', err);
      setCameraErro(err.message || 'Erro ao processar grade óptica do cartão.');
      setScannerState('IDLE');
    }
  };

  /**
   * Ação: Corrigir Novamente (descarta o scan atual e retoma a câmera)
   */
  const handleCorrigirNovamente = () => {
    setScanResult(null);
    setResultadoRegistro(null);
    setAlunoAtualizadoPendente(null);
    setCardPayloadDetectado(null);
    setCameraErro(null);
    setAlertaCruzado(null);
    setAutoProgresso(0);
    setEtapaAnalise('');
    qrAnchorRef.current = null;
    isPausedRef.current = false;

    if (resultCanvasRef.current) {
      const ctx = resultCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, resultCanvasRef.current.width, resultCanvasRef.current.height);
    }

    void handleIniciarCamera();
  };

  /**
   * Ação: Validar Nota (Persiste a nota no ciclo correspondente e avança para VALIDATED)
   */
  const handleValidarNota = () => {
    if (!resultadoRegistro || !alunoAtualizadoPendente || !cardPayloadDetectado) return;

    onSalvarLeitura(resultadoRegistro, alunoAtualizadoPendente);

    const msg = `Nota da ${cardPayloadDetectado.stage} validada com sucesso para ${cardPayloadDetectado.studentName}!`;
    setMensagemSucesso(msg);
    setScannerState('VALIDATED');
  };

  /**
   * Ação: Corrigir Próximo Aluno (Reativa a câmera e aguarda o próximo cartão)
   */
  const handleCorrigirProximoAluno = () => {
    setScanResult(null);
    setResultadoRegistro(null);
    setAlunoAtualizadoPendente(null);
    setCardPayloadDetectado(null);
    setAlunoAutenticado(null);
    setCameraErro(null);
    setAlertaCruzado(null);
    setMensagemSucesso(null);
    setAutoProgresso(0);
    setEtapaAnalise('');
    qrAnchorRef.current = null;
    isPausedRef.current = false;

    if (resultCanvasRef.current) {
      const ctx = resultCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, resultCanvasRef.current.width, resultCanvasRef.current.height);
    }

    void handleIniciarCamera();
  };

  /**
   * Resolução da Cor do Badge de Ciclo Avaliativo
   */
  const renderBadgeCiclo = (stg: EvaluationStage) => {
    switch (stg) {
      case 'N1':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black bg-blue-600 text-white shadow-sm">
            [ PROVA N1 ]
          </span>
        );
      case 'N2':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black bg-purple-600 text-white shadow-sm">
            [ PROVA N2 ]
          </span>
        );
      case 'N3':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black bg-amber-600 text-white shadow-sm">
            [ PROVA N3 ]
          </span>
        );
      case 'N-1':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black bg-rose-600 text-white shadow-sm">
            [ PROVA N-1 (RECUPERAÇÃO / CONTEÚDO SEMESTRAL) ]
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SELETOR HORIZONTAL DE ABAS DE TURMA */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Modo de Reconhecimento e Seleção de Turma:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {/* Aba Padrão: Todas as Turmas (Automático) */}
            <button
              onClick={() => {
                setAbaTurmaAtiva('TODAS');
                setAlertaCruzado(null);
                isPausedRef.current = false;
                if (onSelecionarTurma) onSelecionarTurma('TODAS');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm ${
                abaTurmaAtiva === 'TODAS'
                  ? 'bg-catolica-primary text-white shadow-catolica-primary/20 ring-2 ring-catolica-primary'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              [ Todas as Turmas (Automático) ]
            </button>

            {/* Abas Individuais de cada turma cadastrada */}
            {turmas.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setAbaTurmaAtiva(t.id);
                  setAlertaCruzado(null);
                  isPausedRef.current = false;
                  if (onSelecionarTurma) onSelecionarTurma(t.id);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  abaTurmaAtiva === t.id
                    ? 'bg-slate-900 text-white shadow-slate-900/20 ring-2 ring-slate-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                {t.nome}
              </button>
            ))}
          </div>
        </div>

        {/* 2. SELETOR DE CICLO AVALIATIVO DE CONTINGÊNCIA */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Ciclo Avaliativo:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              {(['AUTO', 'N1', 'N2', 'N3', 'N-1'] as const).map(opcao => (
                <button
                  key={opcao}
                  onClick={() => setCicloContingencia(opcao)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    cicloContingencia === opcao
                      ? 'bg-white text-catolica-primary shadow-sm font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opcao === 'AUTO' ? 'Automático (via QR)' : opcao}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            {cicloContingencia === 'AUTO' 
              ? '🎯 Ciclo detectado dinamicamente no QR Code da prova.' 
              : `⚠️ Contingência ativa: Forçando registro das notas em ${cicloContingencia}.`}
          </div>
        </div>
      </div>

      {/* 3. ALERTA DE VALIDAÇÃO CRUZADA (CARTÃO DE OUTRA TURMA LIDO) */}
      {alertaCruzado && (
        <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl shadow-md text-amber-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-shake">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-black text-amber-900">
                Atenção: Cartão lido pertence à {alertaCruzado.turmaCartaoNome}, mas a aba ativa é {alertaCruzado.turmaAbaNome}.
              </h4>
              <p className="text-xs text-amber-800">
                Troque de aba ou selecione &apos;Todas as Turmas (Automático)&apos; para prosseguir com a leitura deste cartão.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setAbaTurmaAtiva(alertaCruzado.turmaCartaoId);
                setAlertaCruzado(null);
                isPausedRef.current = false;
                if (videoRef.current) {
                  try { videoRef.current.play(); } catch (_) {}
                  processarLeituraQrDetectado(alertaCruzado.rawText, videoRef.current);
                }
              }}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Trocar para {alertaCruzado.turmaCartaoNome}
            </button>
            <button
              onClick={() => {
                setAbaTurmaAtiva('TODAS');
                setAlertaCruzado(null);
                isPausedRef.current = false;
                if (videoRef.current) {
                  try { videoRef.current.play(); } catch (_) {}
                  processarLeituraQrDetectado(alertaCruzado.rawText, videoRef.current);
                }
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Selecionar &apos;Todas as Turmas&apos;
            </button>
          </div>
        </div>
      )}

      {/* 4. BANNER DE SUCESSO APÓS VALIDAÇÃO */}
      {mensagemSucesso && scannerState === 'VALIDATED' && (
        <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-2xl shadow-md text-emerald-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-black text-emerald-900">{mensagemSucesso}</h4>
              <p className="text-xs text-emerald-800">
                A nota foi registrada com sucesso e o histórico acadêmico foi atualizado.
              </p>
            </div>
          </div>
          <button
            onClick={handleCorrigirProximoAluno}
            className="px-5 py-2.5 bg-catolica-primary hover:bg-catolica-dark text-white rounded-xl text-xs font-bold shadow-md shadow-catolica-primary/20 transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-4 h-4" /> Corrigir Próximo Aluno
          </button>
        </div>
      )}

      {/* 5. ÁREA PRINCIPAL: CÂMERA & HUD DE FEEDBACK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* VIEWPORT DA CÂMERA / RESULTADO */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-catolica-primary" />
              <h3 className="text-sm font-black text-slate-900">
                {scannerState === 'ANALYZED' || scannerState === 'VALIDATED' 
                  ? 'Quadro Congelado (Snapshot OMR)' 
                  : 'Sensor Óptico de Captura'}
              </h3>
            </div>

            {/* Status Visual do Scanner */}
            <div>
              {scannerState === 'IDLE' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> Câmera Desligada
                </span>
              )}
              {scannerState === 'SCANNING' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  Aguardando Prova na Câmera
                </span>
              )}
              {scannerState === 'ANALYZED' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-600 text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Prova Analisada (Pendente Validação)
                </span>
              )}
              {scannerState === 'VALIDATED' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white">
                  <Check className="w-3.5 h-3.5 text-white" /> Nota Validada com Sucesso
                </span>
              )}
            </div>
          </div>

          {/* Erro de Câmera */}
          {cameraErro && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{cameraErro}</span>
            </div>
          )}

          {/* Viewport de Vídeo / Canvas de Resultado */}
          <div className="relative w-full aspect-[4/3] max-h-[460px] bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white border-4 border-slate-800 shadow-inner">
            
            {/* Flash Effect */}
            {showFlash && (
              <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-300" />
            )}

            {/* Vídeo Nativo */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${
                cameraAtiva && scannerState === 'SCANNING' ? 'block' : 'hidden'
              }`}
            />

            {/* Canvas de Freeze-Frame com Marcações OMR */}
            <canvas
              ref={resultCanvasRef}
              className={`w-full h-full object-contain ${
                scannerState === 'ANALYZED' || scannerState === 'VALIDATED' ? 'block' : 'hidden'
              }`}
            />

            {/* Estado IDLE (Sem Câmera Ativa) */}
            {!cameraAtiva && scannerState === 'IDLE' && (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-300">Sensor Óptico Pronto</p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Ative a câmera para reconhecimento automático instantâneo do cartão-resposta.
                  </p>
                </div>
                <button
                  onClick={() => handleIniciarCamera()}
                  disabled={isStartingCamera}
                  className="px-5 py-2.5 rounded-xl bg-catolica-primary hover:bg-catolica-dark text-white text-xs font-bold shadow-md shadow-catolica-primary/20 transition flex items-center gap-2 cursor-pointer"
                >
                  {isStartingCamera ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Conectando...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" /> Iniciar Câmera do Computador
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Retículo de Alinhamento na Câmera Ativa */}
            {cameraAtiva && scannerState === 'SCANNING' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                <div className="relative w-4/5 h-4/5 border-2 border-dashed border-sky-400/80 rounded-2xl flex flex-col items-center justify-between p-4">
                  <div className="w-full flex justify-between items-center text-[10px] font-mono text-sky-300 font-bold bg-slate-950/60 px-3 py-1 rounded-full">
                    <span>CATÓLICA SC • SGP</span>
                    <span>POSICIONE A FOLHA INTEIRA</span>
                  </div>
                  <div className="text-center bg-slate-950/80 px-4 py-1.5 rounded-xl text-xs font-bold text-sky-200">
                    Aponte o QR Code no topo para reconhecimento automático
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controles da Câmera */}
          {cameraAtiva && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600">Dispositivo:</label>
                <select
                  value={cameraSelecionadaId}
                  onChange={(e) => {
                    const novoId = e.target.value;
                    setCameraSelecionadaId(novoId);
                    handleIniciarCamera(novoId);
                  }}
                  className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none"
                >
                  {camerasDisponiveis.map(cam => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleDesligarCamera}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <VideoOff className="w-3.5 h-3.5" /> Desligar Câmera
              </button>
            </div>
          )}
        </div>

        {/* 6. PAINEL HUD DE FEEDBACK VISUAL EM TEMPO REAL */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* CARD DE DETECÇÃO EM TEMPO REAL / RESULTADO */}
          {cardPayloadDetectado && scanResult ? (
            <div className="bg-white p-5 rounded-2xl border-2 border-catolica-primary/20 shadow-md space-y-4 animate-fadeIn">
              
              {/* Topo do HUD: Turma Detectada & Badge de Ciclo */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Turma Detectada
                  </span>
                  <h4 className="text-sm font-black text-slate-900">
                    {cardPayloadDetectado.className || 'Turma Reconhecida'}
                  </h4>
                </div>
                <div>
                  {renderBadgeCiclo(cardPayloadDetectado.stage)}
                </div>
              </div>

              {/* Dados do Aluno Reconhecido */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-catolica-primary/10 text-catolica-primary flex items-center justify-center font-black text-sm">
                    {cardPayloadDetectado.studentName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">
                      {cardPayloadDetectado.studentName}
                    </h5>
                    <p className="text-[11px] font-semibold text-slate-500 font-mono">
                      RA: {cardPayloadDetectado.studentRa}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Versão</span>
                  <span className="text-xs font-black text-slate-800">
                    {cardPayloadDetectado.examVersion ? `Versão ${cardPayloadDetectado.examVersion}` : 'Versão A'}
                  </span>
                </div>
              </div>

              {/* Resumo da Pontuação */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Nota Final</span>
                  <span className={`text-2xl font-black ${
                    scanResult.totalScore >= 7.0 
                      ? 'text-emerald-600' 
                      : scanResult.totalScore >= 4.0 
                        ? 'text-amber-600' 
                        : 'text-red-600'
                  }`}>
                    {scanResult.totalScore.toFixed(1)} <span className="text-xs font-semibold text-slate-500">/ 10.0 pts</span>
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Desempenho</span>
                  <div className="text-xs font-black text-slate-800 mt-1">
                    <span className="text-emerald-600">{scanResult.questions.filter(q => q.isCorrect).length} Acertos</span>
                    {' • '}
                    <span className="text-red-600">{scanResult.questions.filter(q => !q.isCorrect).length} Erros</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {scanResult.questions.length} questões avaliadas
                  </span>
                </div>
              </div>

              {/* Tabela Comparativa Linha a Linha das Questões */}
              <div className="space-y-2">
                <h5 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Espelho de Respostas Linha a Linha:
                </h5>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Q#</th>
                        <th className="p-2.5 text-center">Marcada</th>
                        <th className="p-2.5 text-center">Gabarito</th>
                        <th className="p-2.5 text-center">Status</th>
                        <th className="p-2.5 text-right">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {scanResult.questions.map((q) => {
                        // Comparação estrita sem divergência de case/espaço
                        const isHit = q.isCorrect;
                        return (
                          <tr key={q.questionNumber} className={isHit ? 'bg-emerald-50/40' : 'bg-red-50/40'}>
                            <td className="p-2.5 font-bold font-mono text-slate-900">
                              Q.{q.questionNumber}
                            </td>
                            <td className="p-2.5 text-center font-black">
                              {q.markedOption ? (
                                <span className="inline-block px-2 py-0.5 rounded bg-white border border-slate-300 shadow-xs">
                                  {q.markedOption}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-mono">EM BRANCO</span>
                              )}
                            </td>
                            <td className="p-2.5 text-center font-black text-slate-700">
                              <span className="inline-block px-2 py-0.5 rounded bg-white border border-slate-300 shadow-xs">
                                {q.correctOption}
                              </span>
                            </td>
                            <td className="p-2.5 text-center">
                              {isHit ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correta
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-700 font-bold text-[11px]">
                                  <XCircle className="w-4 h-4 text-red-600" /> Incorreta
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-700">
                              {q.score.toFixed(1)} / {q.maxScore.toFixed(1)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7. BOTÕES DE AÇÃO CONFORME A MÁQUINA DE ESTADOS */}
              {scannerState === 'ANALYZED' && (
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleCorrigirNovamente}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Corrigir Novamente
                  </button>
                  <button
                    onClick={handleValidarNota}
                    className="flex-1 py-2.5 bg-catolica-primary hover:bg-catolica-dark text-white rounded-xl text-xs font-black transition shadow-md shadow-catolica-primary/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Validar Nota
                  </button>
                </div>
              )}

              {scannerState === 'VALIDATED' && (
                <div className="pt-2">
                  <button
                    onClick={handleCorrigirProximoAluno}
                    className="w-full py-3 bg-catolica-primary hover:bg-catolica-dark text-white rounded-xl text-xs font-black transition shadow-md shadow-catolica-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> Corrigir Próximo Aluno
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* HUD Placeholder quando nenhum cartão foi lido */
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Scan className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">Aguardando Leitura de Cartão</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Assim que o cartão-resposta for apontado na câmera ou simulado, os dados da turma, aluno, ciclo e nota aparecerão instantaneamente aqui.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Reconhecimento 100% Automático via QR Code Nominal</span>
              </div>
            </div>
          )}

          {/* Histórico das Últimas Leituras da Sessão */}
          {leiturasOMR.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Últimas Correções Realizadas:
                </h5>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {leiturasOMR.length} registro(s)
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {leiturasOMR.slice(0, 5).map((l, idx) => (
                  <div key={l.id || idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{l.alunoNome}</span>
                      <span className="text-[10px] text-slate-500">
                        RA: {l.ra} • {l.turmaNome} {l.stage ? `[${l.stage}]` : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block">{l.notaCalculada.toFixed(1)} pts</span>
                      <span className="text-[10px] text-slate-400">{l.dataLeitura}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
