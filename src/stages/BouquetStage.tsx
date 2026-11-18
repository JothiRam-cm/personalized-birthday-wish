import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { BirthdayConfig } from '../types/birthday';
import { formatPersonalizedText } from '../config/birthdayConfig';
import { RoseBouquetIllustration } from '../components/RoseBouquetIllustration';
import { PrimaryButton } from '../components/PrimaryButton';

interface BouquetStageProps {
  config: BirthdayConfig;
  onNext: () => void;
}

export const BouquetStage: React.FC<BouquetStageProps> = ({
  config,
  onNext,
}) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = window.setTimeout(() => setStep(1), 450);
    const t2 = window.setTimeout(() => setStep(2), 1100);
    const t3 = window.setTimeout(() => setStep(3), 1650);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  const bubble1 = formatPersonalizedText(
    config.bouquetMessages[0],
    config.recipientName,
    config.senderName
  );
  const bubble2 = formatPersonalizedText(
    config.bouquetMessages[1],
    config.recipientName,
    config.senderName
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10 flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-serif-editorial font-semibold text-3xl sm:text-4xl text-[#914B61] text-center mb-6 sm:mb-10"
      >
        Your Rose Bouquet 🌹
      </motion.h2>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-10">
        {/* Left / Center: Rose Bouquet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="flex justify-center animate-float-slow"
        >
          <RoseBouquetIllustration />
        </motion.div>

        {/* Right: Sequential Message Bubbles */}
        <div className="flex flex-col items-center md:items-start gap-5">
          <motion.div
            initial={{ opacity: 0, x: 18, scale: 0.96 }}
            animate={
              step >= 1
                ? { opacity: 1, x: 0, scale: 1 }
                : { opacity: 0, x: 18, scale: 0.96 }
            }
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm bg-white border border-[#EED8DE] rounded-3xl rounded-bl-lg px-6 py-5 shadow-card-soft"
          >
            <p className="font-serif-editorial text-lg sm:text-xl text-[#684650] leading-relaxed">
              {bubble1}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 18, scale: 0.96 }}
            animate={
              step >= 2
                ? { opacity: 1, x: 0, scale: 1 }
                : { opacity: 0, x: 18, scale: 0.96 }
            }
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm bg-[#FFF1F4] border border-[#EED8DE] rounded-3xl rounded-tl-lg px-6 py-5 shadow-card-soft md:ml-6"
          >
            <p className="font-handwritten font-bold text-2xl sm:text-3xl text-[#914B61]">
              {bubble2}
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={step >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.45 }}
        className="mt-8 sm:mt-10"
      >
        <PrimaryButton
          onClick={onNext}
          accentColor={config.theme.accent}
          deepAccentColor={config.theme.deepAccent}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </PrimaryButton>
      </motion.div>
    </div>
  );
};
