// Signboard paint colours. Each category is painted in one of these, and the
// same tone carries through to its cards, work samples and profile banners.
// Board colours stay the same in dark mode — they're paint, not UI chrome.

export const TONES = {
  forest: { board: '#123F36', ink: '#F3F1E7', soft: '#E3EEE8', pattern: '#2C6153' },
  leaf: { board: '#3F8A5F', ink: '#F6F4EA', soft: '#E4F1E8', pattern: '#5FA77C' },
  indigo: { board: '#2B3A67', ink: '#EEF0F7', soft: '#E6E9F3', pattern: '#43558C' },
  ochre: { board: '#C98A1E', ink: '#1E1A12', soft: '#F7ECD6', pattern: '#DDA545' },
  kola: { board: '#8E3527', ink: '#F7ECE6', soft: '#F5E3DE', pattern: '#AA4C3C' },
  charcoal: { board: '#1F2523', ink: '#F1EFE6', soft: '#E6E7E4', pattern: '#3A4340' },
  cream: { board: '#EFE8D6', ink: '#1F2523', soft: '#F4EFE2', pattern: '#DCD2B9' },
};

export const tone = (name) => TONES[name] ?? TONES.forest;
