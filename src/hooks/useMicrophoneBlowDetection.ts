import { useCallback, useEffect, useRef, useState } from 'react';

export type MicStatus = 'idle' | 'requesting' | 'listening' | 'blown' | 'error';

interface UseMicrophoneBlowDetectionOptions {
  enabled: boolean;
  onBlowDetected: () => void;
}

export function useMicrophoneBlowDetection({
  enabled,
  onBlowDetected,
}: UseMicrophoneBlowDetectionOptions) {
  const [status, setStatus] = useState<MicStatus>('idle');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const onBlowRef = useRef(onBlowDetected);
  onBlowRef.current = onBlowDetected;

  const stopListening = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    setVolumeLevel(0);
  }, []);

  const startListening = useCallback(async () => {
    if (!enabled) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error');
      setErrorMessage('Microphone is not supported on this browser. Tap to blow instead.');
      return;
    }

    setErrorMessage(null);
    setStatus('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      setStatus('listening');

      let sustainedFrames = 0;

      const sample = () => {
        if (!streamRef.current || !audioCtxRef.current) return;
        analyser.getByteFrequencyData(dataArray);

        // Blowing produces strong energy across low and mid frequency bins
        let sum = 0;
        const binCount = Math.min(36, dataArray.length);
        for (let i = 0; i < binCount; i++) {
          sum += dataArray[i];
        }
        const avg = sum / binCount / 255;
        setVolumeLevel(Math.min(1, avg * 1.9));

        if (avg > 0.24) {
          sustainedFrames += 1;
        } else {
          sustainedFrames = Math.max(0, sustainedFrames - 1);
        }

        if (sustainedFrames >= 10) {
          setStatus('blown');
          stopListening();
          onBlowRef.current();
          return;
        }

        rafRef.current = requestAnimationFrame(sample);
      };

      rafRef.current = requestAnimationFrame(sample);
    } catch {
      stopListening();
      setStatus('error');
      setErrorMessage(
        'Microphone permission was declined. You can tap the button below to blow out the candle!'
      );
    }
  }, [enabled, stopListening]);

  const resetMic = useCallback(() => {
    stopListening();
    setStatus('idle');
    setErrorMessage(null);
  }, [stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    status,
    volumeLevel,
    errorMessage,
    startListening,
    stopListening,
    resetMic,
  };
}
