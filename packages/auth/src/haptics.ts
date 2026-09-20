/**
 * Native Mobile Haptic Feedback Engine
 * Gracefully vibrates supported mobile devices & tablets for physical confirmation.
 */
export const posHaptics = {
  /** Short crisp tick when a QR code or barcode is recognized */
  scan: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25)
      } catch {}
    }
  },

  /** Double confirmation pulse when points are successfully awarded */
  pointsIssued: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([35, 40, 55])
      } catch {}
    }
  },

  /** Celebratory rhythm pulse when a customer redeems a reward or perk */
  rewardClaimed: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([45, 60, 75, 60, 110])
      } catch {}
    }
  },

  /** Heavy warning buzz on error or store mismatch */
  error: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100])
      } catch {}
    }
  },

  /** Gentle tactile click for keypads and toggles */
  tap: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12)
      } catch {}
    }
  },
}
