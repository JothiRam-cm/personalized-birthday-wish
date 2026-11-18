import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { BirthdayConfig } from '../types/birthday';
import { ThreeBalloonScene } from '../components/three/ThreeBalloonScene';
import { PrimaryButton } from '../components/PrimaryButton';
import { triggerPastelConfetti } from '../components/ConfettiEffect';

interface BalloonStageProps {
  config: BirthdayConfig;
  poppedBalloons: [boolean, boolean, boolean, boolean];
  onPopBalloon: (index: number) => void;
  onNext: () => void;
}

export const BalloonStage: React.FC<BalloonStageProps> = ({
  config,
  poppedBalloons,
  onPopBalloon,
  onNext,
}) => {
  const allPopped = poppedBalloons.every(Boolean);
  const poppedCount = poppedBalloons.filter(Boolean).length;
  const confettiFiredRef = useRef(false);

  useEffect(() => {
    if (allPopped && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      triggerPastelConfetti('burst');
    } else if (!allPopped) {
      confettiFiredRef.current = false;
    }
  }, [allPopped]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 text-center flex flex-col items-center">
      <h2 className="font-serif-editorial font-semibold text-3xl sm:text-4xl text-[#914B61] text-balance">
        Pop all 4 balloons
      </h2>
      <p className="mt-2 text-sm sm:text-base text-[#A27B84]">
        Let&apos;s reveal something special for you!
      </p>

      {/* Interactive 3D 2x2 Balloons */}
      <div className="w-full mt-2">
        <ThreeBalloonScene
          words={config.balloonWords}
          popped={poppedBalloons}
          onPop={onPopBalloon}
        />
      </div>

      {/* Progressive sentence reveal bar */}
      <div className="mt-3 min-h-[84px] flex flex-col items-center justify-center gap-4">
        <div
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          aria-live="polite"
        >
          {config.balloonWords.map((word, idx) => (
            <span
              key={idx}
              className={`px-3.5 py-1.5 rounded-xl border text-sm sm:text-base font-bold tracking-wider transition-all duration-300 ${
                poppedBalloons[idx]
                  ? 'bg-white border-[#EED8DE] text-[#914B61] shadow-sm scale-100 opacity-100'
                  : 'bg-[#FFF1F4] border-dashed border-[#EED8DE] text-[#A27B84]/45 scale-95'
              }`}
            >
              {poppedBalloons[idx] ? word : '• • •'}
            </span>
          ))}
        </div>

        <AnimatePresence>
          {allPopped ? (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col items-center gap-3"
            >
              <p className="font-handwritten font-bold text-3xl sm:text-4xl text-[#914B61]">
                &ldquo;{config.balloonWords.join(' ')}&rdquo; 💗
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
          ) : (
            <p className="text-xs sm:text-sm text-[#A27B84]">
              {poppedCount} of 4 popped — tap each balloon to reveal a word
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
