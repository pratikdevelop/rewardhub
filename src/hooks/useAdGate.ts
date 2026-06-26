import { useCallback, useState } from 'react';

/**
 * useAdGate — handles the "Play Again → Show Ad → Resume Game" flow.
 *
 * Usage in any game screen:
 *   const { adVisible, requestPlayAgain, onAdClose } = useAdGate(resetGame);
 *
 *   <TouchableOpacity onPress={requestPlayAgain}>Play Again</TouchableOpacity>
 *   <AdModal visible={adVisible} onClose={onAdClose} />
 */
export function useAdGate(onResume: () => void) {
  const [adVisible, setAdVisible] = useState(false);

  const requestPlayAgain = useCallback(() => {
    setAdVisible(true);
  }, []);

  const onAdClose = useCallback(() => {
    setAdVisible(false);
    onResume();
  }, [onResume]);

  return { adVisible, requestPlayAgain, onAdClose };
}