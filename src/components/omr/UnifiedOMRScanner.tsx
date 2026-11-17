'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import jsQR from 'jsqr';
import { ProvaMontadaRegistro, CadernoProvaRegistro } from '@/types';
import { AlunoModel } from '@/models/AlunoModel';
import { processarOMR, OMRProcessorOutput, QuestionOMRResult } from '@/lib/omr/omrProcessor';

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
              width: { ideal: 1920, min: 1280 },
              height: { ideal: 1080, min: 720 },
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

  // PASSO 1: LOOP DE VARREDURA DO QR CODE 360° (0°, 90°, 180°, 270°)
  useEffect(() => {
    if (!cameraAtiva || step !== 'SCAN_QR') return;

    let animId: number;
    let lastScan = 0;
    const SCAN_CADENCE_MS = 60; // 16 verificações por segundo

    const scanFrame = async (timestamp: number) => {
      if (!videoRef.current || !qrCanvasRef.current) {
        animId = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = qrCanvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx && (timestamp - lastScan >= SCAN_CADENCE_MS)) {
        lastScan = timestamp;
        const vw = video.videoWidth;
        const vh = video.videoHeight;

        let detectedQr: any = null;

        // 1.1 Orientação Nativa 0°
        canvas.width = 640;
        canvas.height = Math.round((640 * vh) / vw);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        detectedQr = jsQR(imgData.data, canvas.width, canvas.height, { inversionAttempts: 'attemptBoth' });

        // 1.2 Rotação 90° (folha virada de lado na mesa)
        if (!detectedQr) {
          canvas.width = Math.round((640 * vh) / vw);
          canvas.height = 640;
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((90 * Math.PI) / 180);
          ctx.drawImage(video, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width);
          ctx.restore();
          imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          detectedQr = jsQR(imgData.data, canvas.width, canvas.height, { inversionAttempts: 'attemptBoth' });
        }

        // 1.3 Rotação 180° (folha de ponta-cabeça)
        if (!detectedQr) {
          canvas.width = 640;
          canvas.height = Math.round((640 * vh) / vw);
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((180 * Math.PI) / 180);
          ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
          ctx.restore();
          imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          detectedQr = jsQR(imgData.data, canvas.width, canvas.height, { inversionAttempts: 'attemptBoth' });
        }

        // 1.4 Rotação 270°
        if (!detectedQr) {
          canvas.width = Math.round((640 * vh) / vw);
          canvas.height = 640;
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((270 * Math.PI) / 180);
          ctx.drawImage(video, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width);
          ctx.restore();
          imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          detectedQr = jsQR(imgData.data, canvas.width, canvas.height, { inversionAttempts: 'attemptBoth' });
        }

        // QR Code Reconhecido!
        if (detectedQr && detectedQr.data) {
          try {
            let pId = '';
            let cId = '';
            let aNome = '';
            let aRa = '';

            try {
              const parsed = JSON.parse(detectedQr.data);
              pId = parsed.p || parsed.examId || '';
              cId = parsed.c || parsed.cadernoId || '';
              aNome = parsed.a || parsed.studentName || parsed.name || '';
              aRa = parsed.r || parsed.studentRa || parsed.ra || '';
            } catch (_) {
              if (detectedQr.data.includes('EXAM')) {
                pId = 'prova_padrao';
                cId = 'cad_padrao_a';
              }
            }

            if (pId && cId) {
              // Validação de Prova Selecionada na aba "Provas Montadas"
              if (provaMontadaId && pId !== provaMontadaId) {
                setAlertaDivergenciaProva(`Atenção: Você está na prova "${provaMontadaId}", mas o gabarito apontado pertence à prova "${pId}".`);
                tocarSom(300, 0.25, 'sawtooth');
                vibrar([200, 100, 200]);
              } else {
                setAlertaDivergenciaProva(null);
                setProvaDetectadaId(pId);
                setCadernoDetectadoId(cId);

                // Recupera metadados do Caderno e Gabarito Oficial
                let cadernoData: CadernoProvaRegistro | null = null;
                const provaLocal = provasDisponiveis.find(p => p.id === pId);
                if (provaLocal) {
                  setProvaTitulo(provaLocal.titulo);
                  if (provaLocal.cadernos) {
                    cadernoData = provaLocal.cadernos.find(c => c.id === cId || c.codigoVersao === cId) || null;
                  }
                }

                if (!cadernoData) {
                  try {
                    const res = await fetch(`/api/cadernos/${cId}`);
                    if (res.ok) cadernoData = await res.json();
                  } catch (_) {}
                }

                const gabaritoFinal = cadernoData?.gabaritoOficialJson || {
                  "1": "B", "2": "A", "3": "C", "4": "B", "5": "D",
                  "6": "A", "7": "C", "8": "B", "9": "A", "10": "D"
                };

                const totalQ = Object.keys(gabaritoFinal).length || 10;
                setGabaritoOficial(gabaritoFinal);
                setTotalQuestoesCaderno(totalQ);
                setValorPorQuestaoCaderno(Number((10 / totalQ).toFixed(2)));
                setCodigoVersao(cadernoData?.codigoVersao || 'CADERNO-OFICIAL');
                setAlunoNome(aNome || cadernoData?.alunoNome || 'Estudante Avaliado');
                setAlunoRa(aRa || cadernoData?.alunoRa || '');

                // Transição para PASSO 2: Feedback Sonoro + Timer de 2 Segundos
                tocarSom(1100, 0.12, 'sine');
                vibrar([80, 40, 80]);
                setCountdown(2.0);
                setStep('STABILIZING');
                return;
              }
            }
          } catch (e) {
            console.warn('Erro ao decodificar QR Code:', e);
          }
        }
      }

      animId = requestAnimationFrame(scanFrame);
    };

    animId = requestAnimationFrame(scanFrame);
    return () => cancelAnimationFrame(animId);
  }, [cameraAtiva, step, provaMontadaId, provasDisponiveis, tocarSom, vibrar]);

  // PASSO 2: CONTADOR REGRESSIVO DE 2.0 SEGUNDOS COM PREVIEW AO VIVO
  useEffect(() => {
    if (step !== 'STABILIZING') return;

    const interval = 100; // atualiza a cada 0.1s
    const timer = setInterval(() => {
      setCountdown(prev => {
        const nextVal = Number((prev - 0.1).toFixed(1));
        if (nextVal <= 0) {
          clearInterval(timer);
          // Ao zerar o timer: Bate o Print (Snapshot) e vai para o PASSO 3
          capturarSnapshotEProcessar();
          return 0;
        }
        return nextVal;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [step]);

  // PASSO 3: BATE O PRINT EM ALTA RESOLUÇÃO E EXECUTA O MOTOR OMR
  const capturarSnapshotEProcessar = () => {
    if (!videoRef.current || !snapshotCanvasRef.current) return;
    const video = videoRef.current;
    const canvas = snapshotCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Congela no canvas na resolução nativa máxima do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Salva dataUrl para preview visual estático
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setSnapshotDataUrl(dataUrl);

    // Transita para o processamento
    setStep('PROCESSING');
    tocarSom(750, 0.08, 'triangle');

    // Executa o processador em background no frame seguinte para não travar a UI
    setTimeout(() => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const resultado = processarOMR(imageData, {
        totalQuestoes: totalQuestoesCaderno,
        gabaritoOficialJson: gabaritoOficial,
        valorPorQuestao: valorPorQuestaoCaderno,
        opcoesPorQuestao: 5
      });

      setOmrResult(resultado);
      desenharSobreposicaoVisual(canvas.width, canvas.height, resultado);
      setStep('CONFERENCE');
      tocarSom(1400, 0.15, 'sine');
      vibrar([100]);
    }, 150);
  };

  // PASSO 4: DESENHO DA SOBREPOSIÇÃO VISUAL (Círculos Coloridos sobre as Questões)
  const desenharSobreposicaoVisual = (w: number, h: number, resultado: OMRProcessorOutput) => {
    if (!overlayCanvasRef.current) return;
    const overlay = overlayCanvasRef.current;
    overlay.width = w;
    overlay.height = h;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);

    // 1. Destaca as 4 Âncoras Fiduciais Detectadas com Quadrados Verdes
    if (resultado.anchors) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#10b981'; // Esmeralda
      [resultado.anchors.topLeft, resultado.anchors.topRight, resultado.anchors.bottomLeft, resultado.anchors.bottomRight].forEach(a => {
        ctx.strokeRect(a.x - a.width / 2, a.y - a.height / 2, a.width, a.height);
      });

      // Linha conectando as 4 âncoras (retângulo delimitador)
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.moveTo(resultado.anchors.topLeft.x, resultado.anchors.topLeft.y);
      ctx.lineTo(resultado.anchors.topRight.x, resultado.anchors.topRight.y);
      ctx.lineTo(resultado.anchors.bottomRight.x, resultado.anchors.bottomRight.y);
      ctx.lineTo(resultado.anchors.bottomLeft.x, resultado.anchors.bottomLeft.y);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Sobreposição das Bolinhas e Status das Questões
    resultado.questoes.forEach(q => {
      q.bubbles.forEach(b => {
        ctx.beginPath();
        const r = Math.max(10, Math.min(22, w * 0.016));
        ctx.arc(b.pixelX, b.pixelY, r, 0, 2 * Math.PI);

        if (b.isMarked) {
          if (q.status === 'ACERTO') {
            // VERDE: Acerto
            ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#10b981';
            ctx.stroke();
          } else if (q.status === 'ERRO') {
            // VERMELHO: Erro
            ctx.fillStyle = 'rgba(239, 68, 68, 0.50)';
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#ef4444';
            ctx.stroke();
          } else {
            // LARANJA: Duplicada
            ctx.fillStyle = 'rgba(245, 158, 11, 0.50)';
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#f59e0b';
            ctx.stroke();
          }
        } else if (q.status === 'ERRO' && b.optionLetter === q.gabaritoOficial) {
          // Borda verde indicando qual era a alternativa correta
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#10b981';
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (q.status === 'EM_BRANCO') {
          // Marcação suave em amarelo/âmbar para questões em branco
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
          ctx.stroke();
        }
      });
    });
  };

  // GRAVAÇÃO DA NOTA (CONFIRMAR E SALVAR NOTA)
  const handleConfirmarSalvarNota = async () => {
    if (!omrResult) return;
    try {
      setIsSaving(true);
      const payload = {
        provaMontadaId: provaDetectadaId,
        cadernoProvaId: cadernoDetectadoId,
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
      if (onNotaSalva) onNotaSalva(salvo);

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
    setOmrResult(null);
    setCountdown(2.0);
    setIsSaving(false);
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

                {/* Retículo do QR Code com Suporte 360° */}
                <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-dashed border-emerald-400/70 rounded-2xl flex flex-col items-center justify-center p-3 text-center bg-black/20 backdrop-blur-xs mt-4">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse mb-3" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-black/75 px-2.5 py-1 rounded-md border border-emerald-500/30">
                    Aponte para o QR Code
                  </span>
                  <p className="text-[9px] text-slate-300 mt-1">
                    Leitura em 360° (qualquer ângulo)
                  </p>
                </div>

                <div className="rounded-2xl bg-black/80 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white border border-white/10 text-center shadow-lg mb-2">
                  Enquadre a folha na câmera para iniciar a leitura
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
                    Mantenha a folha e as 4 marcas enquadradas... Capturando foto!
                  </p>
                </div>
              </div>
            )}

            {/* PASSO 3: SPINNER DE PROCESSAMENTO OMR */}
            {step === 'PROCESSING' && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30">
                <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
                <h3 className="text-sm font-black text-white">Processando Marcas e Gabarito...</h3>
                <p className="text-xs text-slate-300">Retificando perspectiva das 4 âncoras fiduciais...</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* PASSO 4: PAINEL INFERIOR DE CONFERÊNCIA VISUAL E GRAVAÇÃO DA NOTA */}
      {step === 'CONFERENCE' && omrResult && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[55vh] overflow-y-auto">
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
                    {omrResult.fiduciaisDetectados ? '✓ 4 Marcas Fiduciais Alinhadas' : '⚠️ Alinhamento Estimado'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Nota Calculada</span>
                  <span className="text-3xl font-black text-emerald-400 tracking-tight">
                    {omrResult.notaFinal.toFixed(1)} <span className="text-sm font-normal text-slate-400">pts</span>
                  </span>
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
