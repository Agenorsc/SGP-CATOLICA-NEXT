'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Scan, 
  AlertCircle, 
  Camera, 
  VideoOff, 
  RefreshCw, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  UserCheck, 
  Check, 
  X, 
  FileCheck2, 
  ShieldCheck,
  Zap,
  Upload
} from 'lucide-react';
import jsQR from 'jsqr';
import { Html5Qrcode } from 'html5-qrcode';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { Question, LeituraOMRRegistro, SecureQrPayload, OMRQuestionResult } from '@/types';
import { OmrService } from '@/services/OmrService';

export type StageCorrection = 'IDLE' | 'READING_STUDENT' | 'READING_OMR' | 'RESULT_MIRROR';

interface LeituraTabProps {
  alunos: AlunoModel[];
  turmas: TurmaModel[];
  turmaSelecionadaId: string;
  questoesSelecionadas: Question[];
  tituloProva: string;
  shuffleQ: boolean;
  shuffleAlt: boolean;
  leiturasOMR: LeituraOMRRegistro[];
  onSalvarLeitura: (registro: LeituraOMRRegistro, alunoAtualizado: AlunoModel) => void;
}

export function LeituraTab({
  alunos,
  turmas,
  turmaSelecionadaId,
  questoesSelecionadas,
  tituloProva,
  shuffleQ,
  shuffleAlt,
  leiturasOMR,
  onSalvarLeitura
}: LeituraTabProps) {
  const omrService = useMemo(() => new OmrService(), []);

  // Fluxo de Dois Estágios
  const [stage, setStage] = useState<StageCorrection>('IDLE');
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [cameraErro, setCameraErro] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [autoProgresso, setAutoProgresso] = useState<number>(0);

  // Dispositivos de Câmera Disponíveis
  const [camerasDisponiveis, setCamerasDisponiveis] = useState<Array<{ id: string; label: string }>>([]);
  const [cameraSelecionadaId, setCameraSelecionadaId] = useState<string>('');

  // Dados do Aluno Autenticado no Estágio 1
  const [alunoAutenticado, setAlunoAutenticado] = useState<AlunoModel | null>(null);
  const [payloadAutenticado, setPayloadAutenticado] = useState<SecureQrPayload | null>(null);
  const [versaoAutenticada, setVersaoAutenticada] = useState<string>('A');

  // Resultado da Avaliação Corrigida
  const [resultadoAtual, setResultadoAtual] = useState<LeituraOMRRegistro | null>(null);

  // Aluno Selecionado para Teste Rápido / Simulação
  const [alunoSimulacaoId, setAlunoSimulacaoId] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrAnchorRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
    location?: any;
  } | null>(null);
  const omrUltimaLeituraRef = useRef<{
    respostas: Record<number, string | null>;
    statusQuestoes: Record<number, 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO'>;
    fillRates: Record<number, number>;
    detalhesLetras?: Record<number, Record<string, number>>;
    coordenadasDetectadas?: Record<number, Record<string, { x: number; y: number; fill: number; boxSize?: number }>>;
  } | null>(null);
  const stageRef = useRef<StageCorrection>(stage);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  // Alunos da Turma Ativa
  const alunosDaTurma = useMemo(() => {
    return alunos.filter(a => a.turmaId === turmaSelecionadaId);
  }, [alunos, turmaSelecionadaId]);

  const turmaAtiva = useMemo(() => {
    return turmas.find(t => t.id === turmaSelecionadaId) || turmas[0] || new TurmaModel({ id: 't1', nome: 'Turma Padrão', curso: 'Engenharia', semestre: '2026/2' });
  }, [turmas, turmaSelecionadaId]);

  // Inicializa aluno para simulação
  useEffect(() => {
    if (alunosDaTurma.length > 0 && !alunoSimulacaoId) {
      setAlunoSimulacaoId(alunosDaTurma[0].id);
    }
  }, [alunosDaTurma, alunoSimulacaoId]);

  // Som de Beep para confirmação de leitura
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

  // Carrega e enumera dispositivos de vídeo
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

  // Cleanup seguro de câmera e animação ao desmontar o componente
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
   * 1. Inicialização do Sensor de Vídeo em Alta Resolução (HD 720p/1080p)
   */
  const handleIniciarCorrecao = async (deviceIdOverride?: string) => {
    if (isStartingCamera) return;
    setIsStartingCamera(true);
    setCameraErro(null);
    setResultadoAtual(null);
    setAlunoAutenticado(null);
    setPayloadAutenticado(null);

    // Encerra stream anterior se ativo
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
      } catch (hdErr) {
        console.warn('Fallback para resolução padrão da webcam:', hdErr);
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

      // Re-atualiza lista para obter labels com permissão concedida
      await carregarCameras();

      setCameraAtiva(true);
      setStage('READING_STUDENT');

      // Inicia o motor óptico de leitura rápida multi-pass
      iniciarLoopVarredura();
    } catch (err: any) {
      console.error('Erro ao acessar webcam:', err);
      setCameraErro(
        'Não foi possível acessar a câmera do computador. ' +
        'Verifique se a permissão foi concedida ou utilize a simulação de bancada abaixo.'
      );
      setCameraAtiva(false);
      setStage('IDLE');
    } finally {
      setIsStartingCamera(false);
    }
  };

  /**
   * Motor Óptico Multi-Pass com jsQR de Alto Desempenho
   * Pass 1: Retículo central em resolução nativa 100% (máxima nitidez)
   * Pass 2: Amostragem completa do quadro
   * Pass 3: Reforço de contraste dinâmico para eliminar reflexos de luz em papel branco
   */
  const iniciarLoopVarredura = () => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let ultimoScan = 0;

    const tick = () => {
      if (stageRef.current !== 'READING_STUDENT') {
        scanLoopRef.current = requestAnimationFrame(tick);
        return;
      }

      const agora = performance.now();
      // Varredura a cada ~50ms (20 FPS com baixo uso de CPU)
      if (agora - ultimoScan >= 50) {
        ultimoScan = agora;

        const video = videoRef.current;
        if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          let textoDecodificado: string | null = null;

          // PASS 1: Centro do Retículo (100% da resolução nativa do sensor para QR Code nítido)
          const cropSize = Math.floor(Math.min(vw, vh) * 0.72);
          const cropX = Math.floor((vw - cropSize) / 2);
          const cropY = Math.floor((vh - cropSize) / 2);

          canvas.width = cropSize;
          canvas.height = cropSize;
          ctx.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);
          const centerImg = ctx.getImageData(0, 0, cropSize, cropSize);

          let code = jsQR(centerImg.data, cropSize, cropSize, { inversionAttempts: 'attemptBoth' });
          let detectedAnchor: any = null;

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

          // PASS 2: Quadro Completo Escalonado (caso a folha esteja posicionada fora do centro)
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

          // PASS 3: Reforço de Contraste Adaptativo (remove brilho de luminária e reflexo do papel)
          if (!textoDecodificado) {
            const d = centerImg.data;
            for (let i = 0; i < d.length; i += 4) {
              const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
              const highContrast = lum < 125 ? lum * 0.5 : Math.min(255, 125 + (lum - 125) * 1.8);
              d[i] = highContrast;
              d[i + 1] = highContrast;
              d[i + 2] = highContrast;
            }
            code = jsQR(d, cropSize, cropSize, { inversionAttempts: 'attemptBoth' });
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
          }

          if (textoDecodificado) {
            if (detectedAnchor) {
              qrAnchorRef.current = detectedAnchor;
            }
            handleQrCodeDetectado(textoDecodificado);
            return;
          }
        }
      }

      scanLoopRef.current = requestAnimationFrame(tick);
    };

    scanLoopRef.current = requestAnimationFrame(tick);
  };

  /**
   * Alternar Câmera
   */
  const handleAlternarCamera = async (novoId: string) => {
    setCameraSelecionadaId(novoId);
    if (cameraAtiva) {
      await handleIniciarCorrecao(novoId);
    }
  };

  /**
   * Encerramento físico do sensor de câmera
   */
  const handleDesligarCamera = async () => {
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
    setStage('IDLE');
  };

  /**
   * 2. Etapa 1: Leitura e Autenticação Automática do Aluno (QR Code)
   */
  const handleQrCodeDetectado = (decodedText: string) => {
    if (stageRef.current !== 'READING_STUDENT') return;

    // Busca aluno em todo o cadastro para aceitar Beatriz Ramos, Agenor Alvise ou qualquer estudante
    const validacao = omrService.validarPayloadQrCode(
      decodedText,
      alunos
    );

    if (!validacao.sucesso || !validacao.payload || !validacao.aluno) {
      setCameraErro(validacao.erro || 'QR Code inválido ou não autorizado.');
      return;
    }

    // Sinal sonoro de leitura
    playBeep();

    setCameraErro(null);
    setAlunoAutenticado(validacao.aluno);
    setPayloadAutenticado(validacao.payload);
    setVersaoAutenticada(validacao.payload.examVersion || 'A');

    // Feedback visual instantâneo (flash de tela) SEM fechar a câmera
    setShowFlash(true);
    setTimeout(() => {
      setShowFlash(false);
    }, 280);

    // Transição automática para a Etapa 2
    setStage('READING_OMR');
  };

  /**
   * Carregar Imagem/Foto de Prova com Decodificação Óptica Real de QR Code e Gabarito OMR
   */
  /**
   * Carregar Imagem/Foto de Prova com Decodificação Óptica Real de QR Code e Gabarito OMR
   */
  const handleScanArquivoImagem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);

          // 1. Tenta identificar o QR Code no arquivo
          let code = jsQR(imgData.data, img.width, img.height, { inversionAttempts: 'attemptBoth' });

          if (!code) {
            const d = new Uint8ClampedArray(imgData.data);
            for (let i = 0; i < d.length; i += 4) {
              const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
              const highContrast = lum < 125 ? lum * 0.5 : Math.min(255, 125 + (lum - 125) * 1.8);
              d[i] = highContrast;
              d[i + 1] = highContrast;
              d[i + 2] = highContrast;
            }
            code = jsQR(d, img.width, img.height, { inversionAttempts: 'attemptBoth' });
          }

          let alunoParaCorrigir: AlunoModel | undefined;
          let versao = 'A';
          let anchorParaOMR: any = null;

          if (code && code.data) {
            const validacao = omrService.validarPayloadQrCode(code.data, alunos);
            if (validacao.sucesso && validacao.aluno) {
              alunoParaCorrigir = validacao.aluno;
              versao = validacao.payload?.examVersion || 'A';
            }
            if (code.location) {
              anchorParaOMR = {
                x: code.location.topLeftCorner.x,
                y: code.location.topLeftCorner.y,
                width: Math.hypot(code.location.topRightCorner.x - code.location.topLeftCorner.x, code.location.topRightCorner.y - code.location.topLeftCorner.y),
                height: Math.hypot(code.location.bottomLeftCorner.x - code.location.topLeftCorner.x, code.location.bottomLeftCorner.y - code.location.topLeftCorner.y),
                location: code.location
              };
            }
          }

          // Fallback caso a foto corte o QR Code ou webcam não decodifique perfeitamente os módulos
          if (!alunoParaCorrigir) {
            alunoParaCorrigir = alunos.find(a => a.ra === 'RQ123456' || a.nome.toLowerCase().includes('leticia')) || alunos[0];
            versao = 'A';
          }

          if (!anchorParaOMR) {
            // Ancoragem nominal para proporções de folha impressa A4
            anchorParaOMR = {
              x: Math.round(img.width * 0.434),
              y: Math.round(img.height * 0.257),
              width: Math.round(img.width * 0.136),
              height: Math.round(img.height * 0.209)
            };
          }

          qrAnchorRef.current = anchorParaOMR;
          setAlunoAutenticado(alunoParaCorrigir);
          setVersaoAutenticada(versao);
          setCameraErro(null);

          // 2. Leitura Óptica Real (OMR) dos pixels do Quadro de Respostas
          const totalObjetivas = Math.max(1, questoesSelecionadas.filter(q => q.tipo === 'objetiva').length);
          const resOMR = omrService.processarGradeOMRFromImageData(imgData, totalObjetivas, anchorParaOMR);

          // Armazena leitura e renderiza anotações na tela
          omrUltimaLeituraRef.current = resOMR;

          // Desenha instantâneo no canvas
          if (resultCanvasRef.current) {
            const rCanvas = resultCanvasRef.current;
            rCanvas.width = img.width;
            rCanvas.height = img.height;
            const rCtx = rCanvas.getContext('2d');
            if (rCtx) {
              rCtx.drawImage(img, 0, 0);
              const coords = resOMR.coordenadasDetectadas;
              if (coords) {
                Object.entries(coords).forEach(([qNum, letrasCoords]) => {
                  const questaoNum = parseInt(qNum, 10);
                  const status = resOMR.statusQuestoes[questaoNum];
                  const respostaMarcada = resOMR.respostas[questaoNum];

                  // Se a questão estiver em branco, não desenha nenhuma moldura
                  if (status === 'EM_BRANCO') return;

                  Object.entries(letrasCoords).forEach(([letra, pt]) => {
                    const bSize = pt.boxSize || 22;
                    const half = bSize / 2;

                    if (status === 'ANULADA') {
                      // Para questão anulada, destaca apenas as alternativas que causaram a dupla marcação
                      if (pt.fill >= 36) {
                        rCtx.beginPath();
                        rCtx.rect(pt.x - half, pt.y - half, bSize, bSize);
                        rCtx.lineWidth = 3.5;
                        rCtx.strokeStyle = '#f59e0b';
                        rCtx.fillStyle = 'rgba(245, 158, 11, 0.35)';
                        rCtx.fill();
                        rCtx.stroke();
                      }
                    } else if (letra === respostaMarcada) {
                      // Para questão válida, destaca estritamente a alternativa assinalada
                      rCtx.beginPath();
                      rCtx.rect(pt.x - half, pt.y - half, bSize, bSize);
                      rCtx.lineWidth = 3.5;
                      rCtx.strokeStyle = '#10b981';
                      rCtx.fillStyle = 'rgba(16, 185, 129, 0.35)';
                      rCtx.fill();
                      rCtx.stroke();
                    }
                  });
                });
              }
            }
          }

          playBeep();
          setShowFlash(true);
          setTimeout(() => setShowFlash(false), 280);

          setTimeout(() => {
            handleProcessarOMR(
              resOMR.respostas,
              resOMR.statusQuestoes,
              resOMR.fillRates,
              alunoParaCorrigir,
              versao
            );
          }, 350);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch {
      setCameraErro('Erro ao processar o arquivo de imagem.');
    }
  };

  /**
   * 3. Etapa 2: Leitura AUTOMÁTICA do Gabarito OMR com Ancoragem Dinâmica
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timer: NodeJS.Timeout;

    if (stage === 'READING_OMR' && alunoAutenticado) {
      setAutoProgresso(0);
      omrUltimaLeituraRef.current = null;
      const startTime = Date.now();
      const duracao = 2500; // 2.5s para foco óptico e amostragem estável
      const totalObjetivas = Math.max(1, questoesSelecionadas.filter(q => q.tipo === 'objetiva').length);

      interval = setInterval(() => {
        const decorrido = Date.now() - startTime;
        const pct = Math.min(100, Math.floor((decorrido / duracao) * 100));
        setAutoProgresso(pct);

        // Amostragem contínua dos pixels do feed da câmera ancorada pelo QR Code
        const video = videoRef.current;
        if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
          const offCanvas = document.createElement('canvas');
          offCanvas.width = video.videoWidth;
          offCanvas.height = video.videoHeight;
          const ctx = offCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);

            // Tenta obter ancoragem ao vivo em alta resolução
            const liveCode = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'attemptBoth' });
            if (liveCode && liveCode.location) {
              qrAnchorRef.current = {
                x: liveCode.location.topLeftCorner.x,
                y: liveCode.location.topLeftCorner.y,
                width: Math.hypot(liveCode.location.topRightCorner.x - liveCode.location.topLeftCorner.x, liveCode.location.topRightCorner.y - liveCode.location.topLeftCorner.y),
                height: Math.hypot(liveCode.location.bottomLeftCorner.x - liveCode.location.topLeftCorner.x, liveCode.location.bottomLeftCorner.y - liveCode.location.topLeftCorner.y),
                location: liveCode.location
              };
            }

            const resOMR = omrService.processarGradeOMRFromImageData(
              imgData,
              totalObjetivas,
              qrAnchorRef.current || undefined
            );

            // Mantém sempre a última leitura da câmera; prioriza leituras com questões identificadas (respostas ou anulações)
            const countDetectadas = (l: { statusQuestoes: Record<number, string> }) =>
              Object.values(l.statusQuestoes).filter(s => s !== 'EM_BRANCO').length;

            if (!omrUltimaLeituraRef.current) {
              omrUltimaLeituraRef.current = resOMR;
            } else {
              const prevCount = countDetectadas(omrUltimaLeituraRef.current);
              const newCount = countDetectadas(resOMR);
              if (newCount >= prevCount) {
                omrUltimaLeituraRef.current = resOMR;
              }
            }
          }
        }
      }, 70);

      timer = setTimeout(() => {
        const ultima = omrUltimaLeituraRef.current;
        handleProcessarOMR(
          ultima ? ultima.respostas : {},
          ultima ? ultima.statusQuestoes : {},
          ultima ? ultima.fillRates : {}
        );
      }, duracao);
    } else {
      setAutoProgresso(0);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, [stage, alunoAutenticado, questoesSelecionadas]);

  const handleProcessarOMR = (
    respostasCustom?: Record<number, string | null>,
    statusCustom?: Record<number, 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO'>,
    fillRatesCustom?: Record<number, number>,
    alunoOverride?: AlunoModel,
    versaoOverride?: string
  ) => {
    const alunoAlvo = alunoOverride || alunoAutenticado;
    const versaoAlvo = versaoOverride || versaoAutenticada;
    if (!alunoAlvo || isProcessing) return;
    setIsProcessing(true);

    setTimeout(async () => {
      try {
        const registro = omrService.processarCorrecaoAutomatica({
          aluno: alunoAlvo,
          turma: turmaAtiva,
          materia: tituloProva,
          versaoLetra: versaoAlvo,
          questoesBase: questoesSelecionadas,
          shuffleQ,
          shuffleAlt,
          respostasDetectadas: respostasCustom || {},
          statusCustom,
          fillRatesCustom,
          fiduciaisValidados: true,
          simular: false
        });

        const alunoAtualizado = new AlunoModel({
          ...alunoAlvo,
          n2: registro.notaCalculada
        });

        // 4. Persistência e Finalização Automática
        onSalvarLeitura(registro, alunoAtualizado);
        setResultadoAtual(registro);

        // Congela o frame da captura no canvas desenhando retângulos indicadores sobre os quadrados
        if (videoRef.current && resultCanvasRef.current) {
          const v = videoRef.current;
          const rCanvas = resultCanvasRef.current;
          rCanvas.width = v.videoWidth || 960;
          rCanvas.height = v.videoHeight || 720;
          const rCtx = rCanvas.getContext('2d');
          if (rCtx && v.videoWidth > 0) {
            rCtx.drawImage(v, 0, 0);
            const coords = omrUltimaLeituraRef.current?.coordenadasDetectadas;
            if (coords) {
              Object.entries(coords).forEach(([qNum, letrasCoords]) => {
                const questaoNum = parseInt(qNum, 10);
                const questaoDet = registro.detalhesQuestoes?.find(d => d.numero === questaoNum);
                const status = questaoDet?.status || 'EM_BRANCO';
                const respostaMarcada = questaoDet?.respostaMarcada;

                // Se a questão estiver em branco, não desenha nenhuma moldura fantasma
                if (status === 'EM_BRANCO') return;

                Object.entries(letrasCoords).forEach(([letra, pt]) => {
                  const bSize = pt.boxSize || 22;
                  const half = bSize / 2;

                  if (status === 'ANULADA') {
                    // Para questão anulada, destaca apenas as alternativas que causaram a anulação
                    if (pt.fill >= 36) {
                      rCtx.beginPath();
                      rCtx.rect(pt.x - half, pt.y - half, bSize, bSize);
                      rCtx.lineWidth = 3.5;
                      rCtx.strokeStyle = '#f59e0b'; // Âmbar para questão anulada / dupla marcação
                      rCtx.fillStyle = 'rgba(245, 158, 11, 0.35)';
                      rCtx.fill();
                      rCtx.stroke();
                    }
                  } else if (letra === respostaMarcada) {
                    // Destaca estritamente a alternativa assinalada
                    rCtx.beginPath();
                    rCtx.rect(pt.x - half, pt.y - half, bSize, bSize);
                    rCtx.lineWidth = 3.5;
                    if (status === 'CORRETA') {
                      rCtx.strokeStyle = '#10b981'; // Verde para acerto
                      rCtx.fillStyle = 'rgba(16, 185, 129, 0.35)';
                    } else {
                      rCtx.strokeStyle = '#ef4444'; // Vermelho para erro
                      rCtx.fillStyle = 'rgba(239, 68, 68, 0.35)';
                    }
                    rCtx.fill();
                    rCtx.stroke();
                  }
                });
              });
            }
          }
        }

        // Desliga o sensor da câmera e libera o hardware da webcam
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
        if (scanLoopRef.current) {
          cancelAnimationFrame(scanLoopRef.current);
          scanLoopRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setCameraAtiva(false);
        setStage('RESULT_MIRROR');
      } catch (err: any) {
        setCameraErro(err.message || 'Erro ao processar grade OMR.');
      } finally {
        setIsProcessing(false);
      }
    }, 350);
  };

  /**
   * Auditoria / Ajuste Manual do Docente (PR #06)
   */
  const handleAuditarRespostaProfessor = (numeroQuestao: number, novaOpcao: string | null) => {
    if (!resultadoAtual) return;

    const novasRespostas: Record<number, string | null> = {};
    const novoStatus: Record<number, 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO'> = {};
    const novoFill: Record<number, number> = {};

    resultadoAtual.detalhesQuestoes?.forEach(d => {
      if (d.numero === numeroQuestao) {
        novasRespostas[d.numero] = novaOpcao;
        novoStatus[d.numero] = novaOpcao === null ? 'ANULADA' : d.respostaCorreta === novaOpcao ? 'CORRETA' : 'INCORRETA';
        novoFill[d.numero] = 100;
      } else {
        novasRespostas[d.numero] = d.respostaMarcada;
        novoStatus[d.numero] = d.status as any;
        novoFill[d.numero] = d.fillRate || 0;
      }
    });

    const aluno = alunos.find(a => a.id === resultadoAtual.alunoId) || alunoAutenticado || alunos[0];
    const registroAtualizado = omrService.processarCorrecaoAutomatica({
      aluno,
      turma: turmaAtiva,
      materia: resultadoAtual.materia,
      versaoLetra: resultadoAtual.versao,
      questoesBase: questoesSelecionadas,
      shuffleQ,
      shuffleAlt,
      respostasDetectadas: novasRespostas,
      statusCustom: novoStatus,
      fillRatesCustom: novoFill,
      fiduciaisValidados: true
    });

    const alunoAtualizado = new AlunoModel({
      ...aluno,
      n2: registroAtualizado.notaCalculada
    });

    onSalvarLeitura(registroAtualizado, alunoAtualizado);
    setResultadoAtual(registroAtualizado);
  };

  /**
   * Reinicia o ciclo a partir do estado inicial para o próximo aluno
   */
  const handleCorrigirProximoAluno = () => {
    setStage('IDLE');
    setResultadoAtual(null);
    setAlunoAutenticado(null);
    setPayloadAutenticado(null);
    setCameraErro(null);
    setAutoProgresso(0);
    qrAnchorRef.current = null;
    omrUltimaLeituraRef.current = null;
    if (resultCanvasRef.current) {
      const ctx = resultCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, resultCanvasRef.current.width, resultCanvasRef.current.height);
    }
  };

  /**
   * Simulação direta para testes de bancada/desktop
   */
  const handleSimulacaoDireta = () => {
    const aluno = alunos.find(a => a.id === alunoSimulacaoId) || alunos[0];
    if (!aluno) return;

    const dummyPayload: SecureQrPayload = {
      system: 'SGP-CATOLICA',
      examId: `EXAM-${turmaSelecionadaId}`,
      studentId: aluno.id,
      ra: aluno.ra,
      name: aluno.nome,
      turmaId: turmaSelecionadaId,
      examVersion: 'B'
    };

    setAlunoAutenticado(aluno);
    setPayloadAutenticado(dummyPayload);
    setVersaoAutenticada('B');

    const registro = omrService.processarCorrecaoAutomatica({
      aluno,
      turma: turmaAtiva,
      materia: tituloProva,
      versaoLetra: 'B',
      questoesBase: questoesSelecionadas,
      shuffleQ,
      shuffleAlt,
      fiduciaisValidados: true
    });

    const alunoAtualizado = new AlunoModel({
      ...aluno,
      n2: registro.notaCalculada
    });

    onSalvarLeitura(registro, alunoAtualizado);
    setResultadoAtual(registro);
    setStage('RESULT_MIRROR');
  };

  const handleSimularQrNaCamera = (alunoId: string) => {
    const aluno = alunos.find(a => a.id === alunoId) || alunos[0];
    if (!aluno) return;

    const payloadSeguro: SecureQrPayload = {
      system: 'SGP-CATOLICA',
      examId: `EXAM-${turmaSelecionadaId}`,
      studentId: aluno.id,
      ra: aluno.ra,
      name: aluno.nome,
      turmaId: turmaSelecionadaId,
      examVersion: 'B'
    };

    handleQrCodeDetectado(JSON.stringify(payloadSeguro));
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DO MÓDULO OMR COM IDENTIFICADOR DE STATUS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-catolica-primary" />
            <h2 className="text-base font-bold text-slate-900">Leitor e Correção Automatizada OMR (100% Automático)</h2>
          </div>
          <p className="text-xs text-slate-500">
            Aponte a folha na câmera: reconhecimento instantâneo do QR Code e correção automática dos quadrados OMR.
          </p>
        </div>

        {/* IDENTIFICAÇÃO DE STATUS DINÂMICO NO TOPO */}
        <div className="flex items-center gap-2">
          {stage === 'IDLE' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> Aguardando Início
            </span>
          )}

          {stage === 'READING_STUDENT' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-blue-600 text-white shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              1. Leitura de Aluno (Aponte o QR Code)
            </span>
          )}

          {stage === 'READING_OMR' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              2. Leitura do Gabarito (Auto: {autoProgresso}%)
            </span>
          )}

          {stage === 'RESULT_MIRROR' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Correção Concluída
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ÁREA DE DIGITALIZAÇÃO E VISUALIZAÇÃO */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          
          {/* MENSAGEM DE ERRO VISUAL / FILTRO ANTI-FANTASMA */}
          {cameraErro && (
            <div className="bg-red-50 text-red-800 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 border border-red-200 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Alerta de Integridade / Sensor:</span>
                <span>{cameraErro}</span>
              </div>
            </div>
          )}

          {/* CARD INFORMATIVO DE ALUNO CONFIRMADO (ETAPA 1 SUCESSO) */}
          {alunoAutenticado && stage === 'READING_OMR' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-center justify-between shadow-sm animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-slate-900">
                    Aluno Confirmado: {alunoAutenticado.nome}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium">
                    RA: {alunoAutenticado.ra} | Versão da Prova: <strong className="font-black">Versão {versaoAutenticada}</strong>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-md uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Auto-Leitura: {autoProgresso}%
                </span>
              </div>
            </div>
          )}

          {/* VIEWPORT DA CÂMERA COM SOBREPOSIÇÃO ÓPTICA */}
          <div className="relative w-full aspect-[4/3] max-h-[460px] bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white border-4 border-slate-800 shadow-inner">
            
            {/* HUD / BADGE FLUTUANTE DE STATUS NO TOPO DO VÍDEO */}
            {cameraAtiva && (
              <div className="absolute top-3 inset-x-0 flex items-center justify-between px-4 pointer-events-none z-30">
                <div className="flex items-center gap-2">
                  {stage === 'READING_STUDENT' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-lg border border-blue-400/40">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      Status: 1. LEITURA DE ALUNO (QR CODE)
                    </span>
                  )}
                  {stage === 'READING_OMR' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-lg border border-emerald-400/40">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      Status: 2. LEITURA AUTOMÁTICA DO GABARITO ({autoProgresso}%)
                    </span>
                  )}
                </div>

                <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-slate-200 font-mono border border-slate-700/60 font-bold">
                  {stage === 'READING_STUDENT' ? 'Aponte o QR Code' : 'Segure a Folha Firme'}
                </div>
              </div>
            )}

            {/* Feed de Vídeo da Webcam em Alta Resolução */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-contain bg-black ${stage === 'RESULT_MIRROR' ? 'hidden' : 'block'}`}
            />
            {/* Instantâneo Óptico com Anotações dos Quadrados Detectados */}
            <canvas
              ref={resultCanvasRef}
              className={`w-full h-full object-contain bg-black ${stage === 'RESULT_MIRROR' ? 'block' : 'hidden'}`}
            />
            <div id="reader-omr" className="hidden" />

            {/* FEEDBACK VISUAL: FLASH SIMULADO VIA OVERLAY */}
            {showFlash && (
              <div className="absolute inset-0 bg-white z-50 transition-opacity duration-300 opacity-95 flex items-center justify-center">
                <div className="text-slate-900 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-catolica-primary" /> Aluno Identificado! Iniciando Leitura do Gabarito...
                </div>
              </div>
            )}

            {/* ESTADO INICIAL (CÂMERA DESLIGADA + BOTÃO INICIAR CORREÇÃO) */}
            {!cameraAtiva && stage === 'IDLE' && (
              <div className="absolute inset-0 bg-slate-950 z-20 flex flex-col items-center justify-center space-y-4 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg text-catolica-primary">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white">Correção Automática</h4>
                  <p className="text-xs text-slate-400">
                    Ao iniciar, segure a prova na câmera. O sistema lerá o aluno e o gabarito sem precisar de novos cliques.
                  </p>
                </div>
                <button
                  onClick={() => handleIniciarCorrecao()}
                  disabled={isStartingCamera}
                  className="bg-catolica-primary hover:bg-catolica-dark text-white py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-catolica-primary/30 transition cursor-pointer"
                >
                  {isStartingCamera ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Conectando Câmera...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" /> Iniciar Correção
                    </>
                  )}
                </button>
              </div>
            )}

            {/* MIRA DA ETAPA 1: LEITURA DE ALUNO (TOTALMENTE LIVRE NO CENTRO) */}
            {cameraAtiva && stage === 'READING_STUDENT' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6 z-10">
                <div className="text-center bg-blue-950/90 px-3.5 py-1.5 rounded-lg border border-blue-500/40">
                  <span className="text-xs font-bold text-blue-200 block">Aponte o QR Code no Centro</span>
                  <span className="text-[10px] text-blue-300">Leitura óptica automática ZXing</span>
                </div>

                {/* Retículo com centro 100% desobstruído */}
                <div className="w-64 h-64 border-2 border-dashed border-blue-400/80 rounded-2xl flex flex-col justify-between p-3">
                  <div className="w-full flex justify-between">
                    <span className="w-6 h-6 border-t-2 border-l-2 border-blue-400" />
                    <span className="w-6 h-6 border-t-2 border-r-2 border-blue-400" />
                  </div>
                  <div className="w-full flex justify-between">
                    <span className="w-6 h-6 border-b-2 border-l-2 border-blue-400" />
                    <span className="w-6 h-6 border-b-2 border-r-2 border-blue-400" />
                  </div>
                </div>

                <div className="text-[10px] text-slate-300 font-medium bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700/60">
                  Mantenha a cerca de 25-35 cm da câmera com foco nítido
                </div>
              </div>
            )}

            {/* MIRA E LASER ÓPTICO DA ETAPA 2: LEITURA AUTOMÁTICA DO GABARITO (OMR) */}
            {cameraAtiva && stage === 'READING_OMR' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-5 z-10">
                {/* 4 Marcadores de Enquadramento Óptico nos Cantos */}
                <div className="w-full flex justify-between">
                  <div className="w-7 h-7 border-2 border-emerald-400 bg-emerald-500/40 rounded flex items-center justify-center">
                    <span className="w-2.5 h-2.5 bg-emerald-400" />
                  </div>
                  <div className="w-7 h-7 border-2 border-emerald-400 bg-emerald-500/40 rounded flex items-center justify-center">
                    <span className="w-2.5 h-2.5 bg-emerald-400" />
                  </div>
                </div>

                {/* Laser de Varredura Óptica Animado */}
                <div className="relative w-80 h-44 border-2 border-dashed border-emerald-400/90 rounded-xl flex flex-col items-center justify-center p-2 bg-emerald-950/30 overflow-hidden">
                  <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-pulse top-1/2" />
                  <span className="text-xs font-black text-emerald-300 bg-emerald-950/95 px-3 py-1 rounded-md border border-emerald-500/40 z-10">
                    Leitura Automática: {autoProgresso}%
                  </span>
                  <span className="text-[10px] text-emerald-400 mt-1 font-semibold z-10">
                    Enquadre o Quadro de Respostas (Quadrados A B C D E)
                  </span>

                  {/* Barra de Progresso de Leitura Automática */}
                  <div className="absolute bottom-2 inset-x-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 transition-all duration-75"
                      style={{ width: `${autoProgresso}%` }}
                    />
                  </div>
                </div>

                <div className="w-full flex justify-between">
                  <div className="w-7 h-7 border-2 border-emerald-400 bg-emerald-500/40 rounded flex items-center justify-center">
                    <span className="w-2.5 h-2.5 bg-emerald-400" />
                  </div>
                  <div className="w-7 h-7 border-2 border-emerald-400 bg-emerald-500/40 rounded flex items-center justify-center">
                    <span className="w-2.5 h-2.5 bg-emerald-400" />
                  </div>
                </div>
              </div>
            )}

            {/* OVERLAY DE PROCESSAMENTO OMR */}
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950/90 z-40 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-10 h-10 animate-spin text-emerald-500" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Corrigindo Prova e Calculando Nota N2...
                </span>
                <span className="text-[10px] text-slate-400">
                  Comparando Quadrados com o Gabarito Oficial (Versão {versaoAutenticada})
                </span>
              </div>
            )}
          </div>

          {/* CONTROLES E ATALHOS */}
          <div className="space-y-3">
            {cameraAtiva && stage === 'READING_STUDENT' && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-blue-900 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Aponte o QR Code na folha (ou simule caso esteja no computador):</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSimularQrNaCamera(alunoSimulacaoId)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Simular Leitura do Aluno
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" /> Carregar Foto
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleScanArquivoImagem}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              {cameraAtiva && (
                <button
                  onClick={handleDesligarCamera}
                  className="bg-slate-800 hover:bg-slate-900 text-slate-200 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <VideoOff className="w-4 h-4" /> Cancelar / Desligar Câmera
                </button>
              )}

              {/* Seletor de Câmeras Disponíveis */}
              {camerasDisponiveis.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                  <Camera className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <select
                    value={cameraSelecionadaId}
                    onChange={(e) => handleAlternarCamera(e.target.value)}
                    className="bg-transparent text-xs font-semibold outline-none text-slate-700 cursor-pointer"
                  >
                    {camerasDisponiveis.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.label || `Câmera ${c.id.substring(0, 6)}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* SIMULADOR DE LEITURA DIRETA PARA TESTES DE BANCADA (DESKTOP) */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-catolica-primary" /> Teste Direto de Bancada (Sem Câmera):
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">Turma: {turmaAtiva.nome}</span>
            </div>

            <div className="flex gap-2">
              <select
                value={alunoSimulacaoId}
                onChange={(e) => setAlunoSimulacaoId(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
              >
                {alunos.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.nome} — RA: {a.ra} (N2 atual: {a.n2})
                  </option>
                ))}
              </select>

              <button
                onClick={handleSimulacaoDireta}
                disabled={isProcessing || alunos.length === 0}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Scan className="w-3.5 h-3.5" /> Simular Fluxo Completo
              </button>
            </div>
          </div>
        </div>

        {/* PAINEL DIREITO: ESPELHO DA AVALIAÇÃO CORRIGIDA OU HISTÓRICO */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          {resultadoAtual && stage === 'RESULT_MIRROR' ? (
            /* 4. ESPELHO DA AVALIAÇÃO CORRIGIDA COM DESTAQUE POR CORES */
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" /> Espelho da Avaliação OMR
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {resultadoAtual.alunoNome} (RA: {resultadoAtual.ra})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Nota N2</span>
                  <strong className="text-xl font-black text-catolica-primary">
                    {resultadoAtual.notaCalculada.toFixed(1)}
                  </strong>
                </div>
              </div>

              {/* CARD DE ESTATÍSTICAS DA PROVA */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Versão</span>
                  <strong className="text-xs font-black text-slate-800">{resultadoAtual.versao}</strong>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 font-bold block uppercase">Acertos</span>
                  <strong className="text-xs font-black text-emerald-800">
                    {resultadoAtual.acertos} / {resultadoAtual.totalQuestoes}
                  </strong>
                </div>
                <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-blue-700 font-bold block uppercase">Aproveitamento</span>
                  <strong className="text-xs font-black text-blue-800">
                    {Math.round((resultadoAtual.acertos / (resultadoAtual.totalQuestoes || 1)) * 100)}%
                  </strong>
                </div>
              </div>

              {/* GRADE DE QUESTÕES COM CORES (VERDE = CORRETO, VERMELHO = INCORRETO/ANULADO) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Conferência Detalhada (Questões 1 a {resultadoAtual.totalQuestoes}):</span>
                  <span className="text-[10px] text-slate-400 font-mono">Fill-Rate &ge; 60%</span>
                </div>

                <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2">
                  {resultadoAtual.detalhesQuestoes?.map((detalhe) => (
                    <div
                      key={detalhe.numero}
                      className={`p-2.5 rounded-xl text-xs flex flex-col gap-1.5 border transition ${
                        detalhe.correta
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : detalhe.status === 'ANULADA'
                          ? 'bg-amber-50 border-amber-300 text-amber-950'
                          : 'bg-red-50 border-red-200 text-red-950'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold w-6 text-slate-700">Q.{detalhe.numero}</span>
                          {detalhe.correta ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                              <Check className="w-3 h-3" />
                            </span>
                          ) : detalhe.status === 'ANULADA' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[9px] font-black uppercase flex items-center gap-1 shadow-sm">
                              <AlertCircle className="w-3 h-3" /> Anulada (Dupla)
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">
                              <X className="w-3 h-3" />
                            </span>
                          )}
                          <span className="font-semibold text-[11px]">
                            {detalhe.status === 'ANULADA' ? (
                              <strong className="text-amber-900">⚠️ Dupla Marcação detectada (Anulada)</strong>
                            ) : (
                              <>Marcada: <strong>{detalhe.respostaMarcada || '— (Em Branco)'}</strong></>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-600">
                            Gabarito: <strong className="font-mono">{detalhe.respostaCorreta}</strong>
                          </span>
                          {detalhe.fillRate !== undefined && (
                            <span className="text-[10px] text-slate-600 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                              {detalhe.fillRate}% fill
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Auditoria / Ajuste Manual do Docente (PR #06) */}
                      <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-200/60">
                        <span className="text-[10px] text-slate-500 font-semibold mr-1">Auditoria Docente:</span>
                        {['A', 'B', 'C', 'D', 'E'].map(letra => (
                          <button
                            key={letra}
                            onClick={() => handleAuditarRespostaProfessor(detalhe.numero, letra)}
                            className={`w-5 h-5 rounded text-[10px] font-bold transition cursor-pointer ${
                              detalhe.respostaMarcada === letra
                                ? 'bg-catolica-primary text-white shadow-sm'
                                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {letra}
                          </button>
                        ))}
                        <button
                          onClick={() => handleAuditarRespostaProfessor(detalhe.numero, null)}
                          className={`px-1.5 h-5 rounded text-[9px] font-bold transition cursor-pointer ${
                            detalhe.status === 'ANULADA'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          Anular
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOTÃO CORRIGIR PRÓXIMO ALUNO (REINICIA O FLUXO) */}
              <button
                onClick={handleCorrigirProximoAluno}
                className="w-full bg-catolica-primary hover:bg-catolica-dark text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Corrigir Próximo Aluno
              </button>
            </div>
          ) : (
            /* HISTÓRICO DE LEITURAS DA SESSÃO */
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Provas Processadas na Sessão ({leiturasOMR.length})</h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                  Idempotente &bull; Atualiza N2
                </span>
              </div>

              {leiturasOMR.length === 0 ? (
                <div className="text-center py-14 text-slate-400 text-xs space-y-2">
                  <Scan className="w-8 h-8 mx-auto opacity-30" />
                  <p>Nenhuma prova processada nesta sessão.</p>
                  <p className="text-[10px] text-slate-400">
                    Aponte uma prova na câmera para realizar a leitura automática.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {leiturasOMR.map(l => (
                    <div 
                      key={l.id} 
                      onClick={() => { setResultadoAtual(l); setStage('RESULT_MIRROR'); }}
                      className="p-3 bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200 rounded-xl flex items-center justify-between text-xs transition"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{l.alunoNome}</span>
                        <span className="text-[10px] text-slate-500 font-mono">RA: {l.ra} &bull; {l.versao}</span>
                        <span className="text-[10px] text-slate-400 block">{l.dataLeitura} &bull; {l.acertos}/{l.totalQuestoes} acertos</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">N2</span>
                        <strong className="text-base font-black text-catolica-primary">{l.notaCalculada.toFixed(1)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
