import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Heart } from 'lucide-react';
import { BirthdayConfig } from '../types/birthday';
import { formatPersonalizedText } from '../config/birthdayConfig';
import { BirthdayIllustration } from '../components/BirthdayIllustration';
import { PrimaryButton } from '../components/PrimaryButton';

interface LetterStageProps {
  config: BirthdayConfig;
  envelopeOpened: boolean;
  letterCompleted: boolean;
  onOpenEnvelope: () => void;
  onCompleteLetter: () => void;
  onNext: () => void;
}

export const LetterStage: React.FC<LetterStageProps> = ({
  config,
  envelopeOpened,
  letterCompleted,
  onOpenEnvelope,
  onCompleteLetter,
  onNext,
}) => {
  const [flapOpen, setFlapOpen] = useState(envelopeOpened);
  const [showCard, setShowCard] = useState(envelopeOpened);
  const [visibleLines, setVisibleLines] = useState(0);

  const paragraphs = useMemo(() => {
    const body = formatPersonalizedText(
      config.letter.body,
      config.recipientName,
      config.senderName
    );
    return body
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }, [config.letter.body, config.recipientName, config.senderName]);

  const greetingText = formatPersonalizedText(
    config.letter.greeting,
    config.recipientName,
    config.senderName
  );

  const handleOpen = () => {
    if (flapOpen) return;
    setFlapOpen(true);
    onOpenEnvelope();
    window.setTimeout(() => {
      setShowCard(true);
    }, 520);
  };

  useEffect(() => {
    if (!showCard) return;
    if (letterCompleted) {
      setVisibleLines(paragraphs.length);
      return;
    }

    setVisibleLines(0);
    let idx = 0;
    const interval = window.setInterval(() => {
      idx += 1;
      setVisibleLines(idx);
      if (idx >= paragraphs.length) {
        window.clearInterval(interval);
        onCompleteLetter();
      }
    }, 480);

    return () => window.clearInterval(interval);
  }, [showCard, paragraphs.length, letterCompleted, onCompleteLetter]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
      <h2 className="font-serif-editorial font-semibold text-3xl sm:text-4xl text-[#914B61] text-center mb-6">
        {config.letter.heading}
      </h2>

      <AnimatePresence mode="wait">
        {!showCard ? (
          <motion.div
            key="envelope-view"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center gap-5 my-4"
          >
            <button
              type="button"
              onClick={handleOpen}
              aria-label="Tap to open the birthday letter envelope"
              className="group relative w-[290px] sm:w-[340px] h-[200px] sm:h-[224px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C8758B] rounded-2xl transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              <div className="relative w-full h-full perspective-1200">
                {/* Envelope Back Body */}
                <div
                  className="absolute inset-0 rounded-2xl shadow-card-soft"
                  style={{
                    backgroundColor: '#FFF9F0',
                    border: '1.5px solid #D9BC8C',
                  }}
                />

                {/* Emerging Letter Peek */}
                <div
                  className={`absolute left-4 right-4 top-3 bottom-4 rounded-xl bg-white border border-[#EED8DE] transition-transform duration-500 ${
                    flapOpen ? '-translate-y-10' : 'translate-y-0'
                  }`}
                />

                {/* Envelope Front Fold */}
                <svg
                  viewBox="0 0 340 224"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  aria-hidden="true"
                >
                  <path
                    d="M 2 4 L 170 124 L 338 4 L 338 220 Q 338 222 334 222 L 6 222 Q 2 222 2 220 Z"
                    fill="#FFFDF8"
                    stroke="#D9BC8C"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 4 220 L 130 108 M 336 220 L 210 108"
                    stroke="#E7D3B0"
                    strokeWidth="1.2"
                  />
                </svg>

                {/* Animated 3D Flap */}
                <div
                  className="absolute top-0 left-0 right-0 h-[126px] origin-top transition-transform duration-500 ease-out preserve-3d"
                  style={{
                    transform: flapOpen ? 'rotateX(175deg)' : 'rotateX(0deg)',
                    zIndex: flapOpen ? 0 : 10,
                  }}
                >
                  <svg
                    viewBox="0 0 340 126"
                    className="w-full h-full drop-shadow-sm"
                    aria-hidden="true"
                  >
                    <path
                      d="M 4 2 L 336 2 L 170 118 Z"
                      fill="#FFF6E8"
                      stroke="#D9BC8C"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {/* Wax heart seal */}
                  <div
                    className="absolute left-1/2 bottom-1 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
                    style={{
                      backgroundColor: config.theme.accent,
                      border: '2px solid #FFF8E9',
                    }}
                  >
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
              </div>
            </button>

            <span className="text-xs font-bold tracking-[0.28em] uppercase text-[#914B61]">
              TAP TO OPEN
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="letter-card"
            initial={{ opacity: 0, y: 26, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55 }}
            className="w-full flex flex-col items-center gap-6"
          >
            {/* Ivory / Soft Mint Letter Card */}
            <article className="relative w-full bg-[#FFFDF9] border border-[#EED8DE] rounded-3xl px-6 py-7 sm:px-10 sm:py-9 shadow-card-soft text-left">
              {/* Top-right heart accent */}
              <div
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FFF1F4] flex items-center justify-center"
                aria-hidden="true"
              >
                <Heart className="w-4 h-4 text-[#C8758B] fill-[#EFA9B8]" />
              </div>

              <h3 className="font-handwritten font-bold text-3xl sm:text-4xl text-[#914B61] pr-10 mb-5">
                {greetingText}
              </h3>

              <div className="space-y-4 text-[15px] sm:text-base leading-relaxed text-[#684650] max-w-[65ch]">
                {paragraphs.map((para, idx) => (
                  <motion.p
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={
                      idx < visibleLines
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 8 }
                    }
                    transition={{ duration: 0.4 }}
                    className={
                      idx === paragraphs.length - 1
                        ? 'font-handwritten text-2xl sm:text-3xl text-[#914B61] pt-2'
                        : ''
                    }
                  >
                    {para}
                  </motion.p>
                ))}
              </div>

              {/* Tiny cute illustration in bottom-right */}
              <div className="mt-4 flex items-end justify-between">
                {!letterCompleted ? (
                  <button
                    type="button"
                    onClick={() => {
                      setVisibleLines(paragraphs.length);
                      onCompleteLetter();
                    }}
                    className="text-xs font-semibold text-[#A27B84] hover:text-[#914B61] underline cursor-pointer"
                  >
                    Reveal full letter
                  </button>
                ) : (
                  <span className="text-xs text-[#A27B84]">
                    From {config.senderName}
                  </span>
                )}
                <BirthdayIllustration variant="mini" />
              </div>
            </article>

            <AnimatePresence>
              {letterCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <PrimaryButton
                    onClick={onNext}
                    accentColor={config.theme.accent}
                    deepAccentColor={config.theme.deepAccent}
                  >
                    <Gift className="w-4 h-4" />
                    One Last Surprise
                  </PrimaryButton>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
