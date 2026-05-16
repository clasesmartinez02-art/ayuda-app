/**
 * Utility for haptic feedback on mobile devices.
 * Uses the navigator.vibrate API.
 */
export const haptic = {
  light: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  },
  heavy: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }
  },
  success: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
  },
  error: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 100, 50, 100]);
    }
  }
};
