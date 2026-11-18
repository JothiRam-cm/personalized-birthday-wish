import { useCallback, useState } from 'react';
import { BirthdayFlowState, StageId } from '../types/birthday';

const INITIAL_FLOW_STATE: BirthdayFlowState = {
  currentStage: 'welcome',
  poppedBalloons: [false, false, false, false],
  candleExtinguished: false,
  wishMade: false,
  envelopeOpened: false,
  letterCompleted: false,
  giftOpened: false,
};

export const STAGE_ORDER: StageId[] = [
  'welcome',
  'balloons',
  'candle',
  'bouquet',
  'letter',
  'gift',
  'final',
];

export function useBirthdayFlow() {
  const [flow, setFlow] = useState<BirthdayFlowState>(INITIAL_FLOW_STATE);

  const goToStage = useCallback((stage: StageId) => {
    setFlow((prev) => ({ ...prev, currentStage: stage }));
  }, []);

  const popBalloon = useCallback((index: number) => {
    setFlow((prev) => {
      if (index < 0 || index > 3 || prev.poppedBalloons[index]) return prev;
      const next = [...prev.poppedBalloons] as [
        boolean,
        boolean,
        boolean,
        boolean,
      ];
      next[index] = true;
      return { ...prev, poppedBalloons: next };
    });
  }, []);

  const extinguishCandle = useCallback(() => {
    setFlow((prev) => ({ ...prev, candleExtinguished: true }));
  }, []);

  const makeWish = useCallback(() => {
    setFlow((prev) => ({ ...prev, wishMade: true }));
  }, []);

  const openEnvelope = useCallback(() => {
    setFlow((prev) => ({ ...prev, envelopeOpened: true }));
  }, []);

  const completeLetter = useCallback(() => {
    setFlow((prev) => ({ ...prev, letterCompleted: true }));
  }, []);

  const openGift = useCallback(() => {
    setFlow((prev) => ({ ...prev, giftOpened: true }));
  }, []);

  const resetFlow = useCallback(() => {
    setFlow(INITIAL_FLOW_STATE);
  }, []);

  return {
    flow,
    goToStage,
    popBalloon,
    extinguishCandle,
    makeWish,
    openEnvelope,
    completeLetter,
    openGift,
    resetFlow,
  };
}
