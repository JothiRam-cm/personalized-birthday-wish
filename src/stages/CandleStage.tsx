import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Mic, Sparkles, Wind } from 'lucide-react';
import { BirthdayConfig } from '../types/birthday';
import { ThreeCakeScene } from '../components/three/ThreeCakeScene';
import { PrimaryButton } from '../components/PrimaryButton';
import { triggerSparkleBurst } from '../components/ConfettiEffect';
import { useMicrophoneBlowDetection } from '../hooks/useMicrophoneBlowDetection';

interface CandleStageProps {
  config: BirthdayConfig;
  candleExtinguished: boolean;
  wishMade: boolean;
  onExtinguish: () => void;
  onMakeWish: () => void;
  onNext: () => void;
}

export const CandleStage: React.FC<CandleStageProps> = ({
  config,
  candleExtinguished,
  wishMade,
  onExtinguish,
  onMakeWish,
  onNext,
}) => {
  const {
    status: micStatus,
    volumeLevel,
    errorMessage,
    startListening,
    stopListening,
  } = useMicrophoneBlowDetection({
    enabled: config.enableMicrophone && !candleExtinguished,
    onBlowDetected: onExtinguish,
  });

  const handleManualBlow = () => {
    stopListening();
    onExtinguish();
  };

  const handleWish = () => {
    triggerSparkleBurst();
    onMakeWish();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 text-center flex flex-col items-center">
      <h2
        className={`font-handwritten font-bold text-4xl sm:text-5xl text-balance transition-colors duration-700 ${
          candleExtinguished && !wishMade ? 'text-[#FFF8E9]' : 'text-[#914B61]'
        }`}
      >
        Blow the candle, {config.recipientName} 💙👸
      </h2>
      <p
        className={`mt-1.5 text-xs sm:text-sm transition-colors duration-700 ${
          candleExtinguished && !wishMade ? 'text-[#F6DFE5]' : 'text-[#A27B84]'
        }`}
      >
        Drag gently to admire the cake, then blow out the flame
      </p>

      {/* Interactive 3D Cake */}
      <div className="w-full mt-2">
        <ThreeCakeScene
          extinguished={candleExtinguished}
          wishMade={wishMade}
        />
      </div>

      {/* Controls & Wish Overlay */}
      <div className="mt-2 min-h-[140px] flex flex-col items-center justify-center w-full max-w-md">
        <AnimatePresence mode="wait">
          {!candleExtinguished ? (
            <motion.div
              key="blow-controls"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <div className="flex flex-wrap items-center justify-center gap-3">
                <PrimaryButton
                  onClick={handleManualBlow}
                  accentColor={config.theme.accent}
                  deepAccentColor={config.theme.deepAccent}
                >
                  <Wind className="w-4 h-4" />
                  Tap to blow
                </PrimaryButton>

                {config.enableMicrophone && micStatus !== 'listening' && (
                  <PrimaryButton
                    variant="secondary"
                    onClick={() => void startListening()}
                    disabled={micStatus === 'requesting'}
                  >
                    <Mic className="w-4 h-4 text-[#914B61]" />
                    {micStatus === 'requesting'
                      ? 'Starting mic...'
                      : 'Use Microphone'}
                  </PrimaryButton>
                )}
              </div>

              {micStatus === 'listening' && (
                <div className="w-full max-w-xs bg-white border border-[#EED8DE] rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#914B61] mb-1.5">
                    <span>Listening for a gentle blow...</span>
                    <button
                      type="button"
                      onClick={stopListening}
                      className="underline text-[#A27B84] hover:text-[#684650] cursor-pointer"
                    >
                      Stop
                    </button>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#FFF1F4] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-75"
                      style={{
                        width: `${Math.round(volumeLevel * 100)}%`,
                        backgroundColor: config.theme.accent,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#A27B84]">
                    Audio stays strictly on your device and stops automatically.
                  </p>
                </div>
              )}

              {errorMessage && (
                <p className="text-xs text-[#914B61] bg-white/95 border border-[#EED8DE] rounded-xl px-4 py-2">
                  {errorMessage}
                </p>
              )}
            </motion.div>
          ) : !wishMade ? (
            <motion.div
              key="wish-prompt"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="bg-[#FFF8F9] border border-[#EED8DE] rounded-3xl px-7 py-6 shadow-card-soft flex flex-col items-center gap-4"
            >
              <p className="font-handwritten font-bold text-3xl sm:text-4xl text-[#914B61]">
                Close your eyes &amp; make a wish ✨
              </p>
              <PrimaryButton
                onClick={handleWish}
                accentColor={config.theme.accent}
                deepAccentColor={config.theme.deepAccent}
              >
                <Sparkles className="w-4 h-4" />
                Make a Wish
              </PrimaryButton>
            </motion.div>
          ) : (
            <motion.div
              key="wish-complete"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col items-center gap-3"
            >
              <p className="font-handwritten font-bold text-3xl text-[#914B61]">
                May every single wish come true 💖
              </p>
              <PrimaryButton
                onClick={onNext}
                accentColor={config.theme.accent}
                deepAccentColor={config.theme.deepAccent}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </PrimaryButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
