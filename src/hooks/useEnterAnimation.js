import { useState, useEffect, useCallback } from 'react';

const useEnterAnimation = ({
  ticker,
  canEnter = true,
  enterTime,
  enterDelay = 0,
  enterDuration = 750,
  debug = false,
}) => {
  const [hasEntered, setHasEntered] = useState(false);
  const [enteredProgress, setEnteredProg] = useState(0.0);

  const updateAnimation = useCallback(() => {
    if (!hasEntered) {
      const currentTime = new Date().getTime();
      const lifeFactor = Math.min(Math.max(currentTime - enterTime - enterDelay, 0) / enterDuration, 1);

      if (lifeFactor < 1) {
        if (debug) console.log('inside!', lifeFactor);
        setEnteredProg(lifeFactor);
      } else {
        if (debug) console.log('hasEntered!', lifeFactor);
        setEnteredProg(1);
        setHasEntered(true);
        ticker.remove(updateAnimation);
      }
    }
  }, [debug, enterDelay, enterDuration, enterTime, hasEntered, ticker]);

  const startTicker = useCallback(() => {
    if (!hasEntered && enterTime > 0) {
      ticker.add(updateAnimation);
      if (debug) console.log('Starting ticker!', hasEntered);
    }
  }, [debug, enterTime, hasEntered, ticker, updateAnimation]);

  useEffect(() => {
    startTicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEnter]);

  return [enteredProgress, hasEntered];
};

export default useEnterAnimation;
