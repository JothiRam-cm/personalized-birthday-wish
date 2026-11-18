import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Music, SlidersHorizontal, VolumeX } from 'lucide-react';
import { defaultBirthdayConfig } from './config/birthdayConfig';
import { BirthdayConfig } from './types/birthday';
import { STAGE_ORDER, useBirthdayFlow } from './hooks/useBirthdayFlow';
import { AmbientBackground } from './components/AmbientBackground';
import { WelcomeStage } from './stages/WelcomeStage';
import { BalloonStage } from './stages/BalloonStage';
import { CandleStage } from './stages/CandleStage';
import { BouquetStage } from './stages/BouquetStage';
import { LetterStage } from './stages/LetterStage';
import { GiftStage } from './stages/GiftStage';
import { FinalStage } from './stages/FinalStage';
import { CustomizeDrawer } from './components/CustomizeDrawer';
import { parseConfigFromUrl } from './utils/shareLink';
import { musicBox } from './services/musicSynth';

export default function App() {
  const [config, setConfig] = useState<BirthdayConfig>(() => {
    const fromUrl = parseConfigFromUrl();
    return fromUrl || defaultBirthdayConfig;
  });

  const {
    flow,
    goToStage,
    popBalloon,
    extinguishCandle,
    makeWish,
    openEnvelope,
    completeLetter,
    openGift,
    resetFlow,
  } = useBirthdayFlow();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const isWishDimmed =
    flow.currentStage === 'candle' &&
    flow.candleExtinguished &&
    !flow.wishMade;

  useEffect(() => {
    return () => {
      musicBox.stop();
    };
  }, []);

  const toggleMusic = () => {
    if (musicPlaying) {
      musicBox.stop();
      setMusicPlaying(false);
    } else {
      musicBox.start();
      setMusicPlaying(true);
    }
  };

  const handleReplay = () => {
    resetFlow();
  };

  const stageIndex = STAGE_ORDER.indexOf(flow.currentStage) + 1;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden">
      <AmbientBackground theme={config.theme} dimmed={isWishDimmed} />

      {/* Minimal Top-Right Floating Controls (solid pastel surface, no backdrop-filter over WebGL) */}
      <div className="fixed top-3.5 right-3.5 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={musicPlaying ? 'Pause birthday music' : 'Play birthday music'}
          title={musicPlaying ? 'Pause music' : 'Play gentle birthday music'}
          className="h-10 w-10 rounded-full bg-white border border-[#EED8DE] shadow-sm flex items-center justify-center text-[#914B61] hover:bg-[#FFF1F4] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#C8758B]"
        >
          {musicPlaying ? (
            <Music className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#A27B84]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Personalize birthday wish and connect Google Drive"
          className="h-10 px-4 rounded-full bg-white border border-[#EED8DE] shadow-sm inline-flex items-center gap-1.5 text-xs font-bold text-[#914B61] hover:bg-[#FFF1F4] transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#C8758B]"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Customize</span>
        </button>
      </div>

      {/* Main Single-Stage Viewport */}
      <main className="relative z-20 flex-1 flex items-center justify-center w-full pt-14 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={flow.currentStage}
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.985 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {flow.currentStage === 'welcome' && (
              <WelcomeStage
                config={config}
                onNext={() => goToStage('balloons')}
              />
            )}

            {flow.currentStage === 'balloons' && (
              <BalloonStage
                config={config}
                poppedBalloons={flow.poppedBalloons}
                onPopBalloon={popBalloon}
                onNext={() => goToStage('candle')}
              />
            )}

            {flow.currentStage === 'candle' && (
              <CandleStage
                config={config}
                candleExtinguished={flow.candleExtinguished}
                wishMade={flow.wishMade}
                onExtinguish={extinguishCandle}
                onMakeWish={() => {
                  musicBox.playSparkleChime();
                  makeWish();
                }}
                onNext={() => goToStage('bouquet')}
              />
            )}

            {flow.currentStage === 'bouquet' && (
              <BouquetStage
                config={config}
                onNext={() => goToStage('letter')}
              />
            )}

            {flow.currentStage === 'letter' && (
              <LetterStage
                config={config}
                envelopeOpened={flow.envelopeOpened}
                letterCompleted={flow.letterCompleted}
                onOpenEnvelope={openEnvelope}
                onCompleteLetter={completeLetter}
                onNext={() => goToStage('gift')}
              />
            )}

            {flow.currentStage === 'gift' && (
              <GiftStage
                config={config}
                giftOpened={flow.giftOpened}
                onOpenGift={openGift}
                onNext={() => goToStage('final')}
              />
            )}

            {flow.currentStage === 'final' && (
              <FinalStage config={config} onReplay={handleReplay} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Quiet Storybook Progress Indicator */}
      <div
        className="relative z-20 pb-4 flex items-center justify-center gap-2 text-[11px] font-semibold text-[#A27B84]"
        aria-label={`Chapter ${stageIndex} of ${STAGE_ORDER.length}`}
      >
        <div className="flex items-center gap-1.5">
          {STAGE_ORDER.map((st, idx) => (
            <span
              key={st}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: st === flow.currentStage ? '18px' : '6px',
                backgroundColor:
                  idx + 1 <= stageIndex
                    ? config.theme.accent
                    : 'rgba(200, 117, 139, 0.25)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Discreet Customize & Google Drive Drawer */}
      <CustomizeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        config={config}
        onChangeConfig={setConfig}
      />
    </div>
  );
}
