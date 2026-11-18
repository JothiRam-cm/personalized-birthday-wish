import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BirthdayConfig } from '../types/birthday';
import { formatPersonalizedText } from '../config/birthdayConfig';
import {
  BirthdayBunting,
  BirthdayIllustration,
} from '../components/BirthdayIllustration';
import { PrimaryButton } from '../components/PrimaryButton';
import { triggerPastelConfetti } from '../components/ConfettiEffect';

interface WelcomeStageProps {
  config: BirthdayConfig;
  onNext: () => void;
}

const NO_RESPONSES = [
  "Are you sure? There are surprises waiting for you! 💗",
  "Pretty please? I wrapped something really sweet for you! 🎀",
  "Come on, peek just a little bit—you'll love it! ✨",
];

export const WelcomeStage: React.FC<WelcomeStageProps> = ({
  config,
  onNext,
}) => {
  const [noClicks, setNoClicks] = useState(0);

  const handleYes = () => {
    triggerPastelConfetti('gentle');
    window.setTimeout(() => {
      onNext();
    }, 280);
  };

  const handleNo = () => {
    setNoClicks((prev) => prev + 1);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-10 text-center flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="font-handwritten font-bold text-4xl sm:text-6xl text-[#914B61] leading-tight text-balance mb-3"
      >
        {config.greeting}, {config.recipientName} 🎀 💗
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full mb-3"
      >
        <BirthdayBunting
          primaryColor={config.theme.primary}
          accentColor={config.theme.accent}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16 }}
        className="w-full my-1 animate-float-slow"
      >
        <BirthdayIllustration variant="welcome" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.25 }}
        className="mt-4 flex flex-col items-center gap-4"
      >
        <p className="font-serif-editorial text-xl sm:text-2xl text-[#684650] font-medium">
          Are you excited for what&apos;s next?
        </p>

        <AnimatePresence mode="wait">
          {noClicks > 0 && (
            <motion.p
              key={noClicks}
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-5 py-2.5 rounded-2xl bg-white/95 border border-[#EED8DE] text-[#914B61] text-sm sm:text-base font-semibold shadow-sm max-w-md"
            >
              {formatPersonalizedText(
                NO_RESPONSES[(noClicks - 1) % NO_RESPONSES.length],
                config.recipientName
              )}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-1">
          <PrimaryButton
            onClick={handleYes}
            accentColor={config.theme.accent}
            deepAccentColor={config.theme.deepAccent}
          >
            Yes! ✨
          </PrimaryButton>
          <PrimaryButton
            variant="secondary"
            onClick={handleNo}
            accentColor={config.theme.accent}
          >
            {noClicks > 0 ? 'Still no? 🙈' : 'No'}
          </PrimaryButton>
        </div>
      </motion.div>
    </div>
  );
};
