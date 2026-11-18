import React, { useEffect, useRef } from 'react';
import { Gift } from 'lucide-react';
import { BirthdayConfig } from '../types/birthday';
import { ThreeGiftScene } from '../components/three/ThreeGiftScene';
import { PrimaryButton } from '../components/PrimaryButton';
import { triggerPastelConfetti, triggerSparkleBurst } from '../components/ConfettiEffect';

interface GiftStageProps {
  config: BirthdayConfig;
  giftOpened: boolean;
  onOpenGift: () => void;
  onNext: () => void;
}

export const GiftStage: React.FC<GiftStageProps> = ({
  config,
  giftOpened,
  onOpenGift,
  onNext,
}) => {
  const transitionedRef = useRef(false);

  const handleOpen = () => {
    if (giftOpened) return;
    onOpenGift();
    triggerPastelConfetti('burst');
    triggerSparkleBurst();
  };

  useEffect(() => {
    if (!giftOpened) {
      transitionedRef.current = false;
      return;
    }
    if (transitionedRef.current) return;
    transitionedRef.current = true;
    const timer = window.setTimeout(() => {
      onNext();
    }, 1350);
    return () => window.clearTimeout(timer);
  }, [giftOpened, onNext]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10 text-center flex flex-col items-center">
      <h2 className="font-serif-editorial font-semibold text-3xl sm:text-4xl text-[#914B61]">
        One Last Thing...
      </h2>
      <p className="mt-2 text-sm sm:text-base text-[#A27B84]">
        {giftOpened ? 'Opening your surprise! 🎀' : 'Tap the gift'}
      </p>

      <div className="w-full my-2">
        <ThreeGiftScene opened={giftOpened} onOpen={handleOpen} />
      </div>

      {!giftOpened && (
        <PrimaryButton
          onClick={handleOpen}
          accentColor={config.theme.accent}
          deepAccentColor={config.theme.deepAccent}
        >
          <Gift className="w-4 h-4" />
          Open Gift
        </PrimaryButton>
      )}
    </div>
  );
};
