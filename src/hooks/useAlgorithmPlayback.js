import { useState, useEffect, useRef } from 'react';

const SPEEDS = { slow: 900, medium: 380, fast: 100 };

export default function useAlgorithmPlayback(steps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState('medium');
  const timerRef = useRef(null);

  const isFinished = stepIndex >= steps.length - 1;

  useEffect(() => {
    if (!isPlaying || isFinished) {
      setIsPlaying(false);
      return;
    }

    // Pause longer on interesting steps so they're visible
    const currentStep = steps[stepIndex];
    const pause = currentStep?.type === 'found' ? SPEEDS[speed] * 3 : SPEEDS[speed];

    timerRef.current = setTimeout(() => {
      setStepIndex(i => i + 1);
    }, pause);

    return () => clearTimeout(timerRef.current);
  }, [isPlaying, stepIndex, speed, steps, isFinished]);

  // Reset playback when the steps array changes (new graph selected)
  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [steps]);

  return {
    stepIndex,
    currentStep: steps[stepIndex] ?? null,
    isPlaying,
    isFinished,
    totalSteps: steps.length,
    speed,
    play:        () => setIsPlaying(true),
    pause:       () => setIsPlaying(false),
    stepForward: () => { setIsPlaying(false); setStepIndex(i => Math.min(i + 1, steps.length - 1)); },
    stepBack:    () => { setIsPlaying(false); setStepIndex(i => Math.max(i - 1, 0)); },
    reset:       () => { setIsPlaying(false); setStepIndex(0); },
    setSpeed,
  };
}
