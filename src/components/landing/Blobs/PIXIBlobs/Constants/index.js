const ModeValues = {
  EXTRA_SMALL: 'xs',
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
  EXTRA_LARGE: 'xl',
};

// Above but in order
const ScreenModes = [
  ModeValues.EXTRA_SMALL,
  ModeValues.SMALL,
  ModeValues.MEDIUM,
  ModeValues.LARGE,
  ModeValues.EXTRA_LARGE,
];

const BreakpointValues = [576, 768, 992, 1200];

export const getBreakPoint = width => {
  // Find out how many breakpoint values width is greater than; 0 = xs, 1 = sm, etc...
  const ScreenModeIndex = BreakpointValues.reduce(
    (modeKey, _, bpKey) => modeKey + (width > BreakpointValues[bpKey] ? 1 : 0),
    0
  );
  return ScreenModes[ScreenModeIndex];
};

export const BlobAlign = {
  CENTERED: 'center',
  LEFT: 'left',
  COMPACT: 'compact',
};

const BASE_VALUES = {
  stageWidthFn: windowWidth => Math.min(windowWidth * 0.8, 2048),
  blobRadius: 18,
  timelineBlobSizeFactor: 1.05,
  blobAlign: BlobAlign.CENTERED,
  blobSpread: 700,
  showTimelineBlobJoin: true,
  globalScale: 1,
};

const ResponsiveValues = windowWidth => ({
  [ModeValues.EXTRA_SMALL]: {
    ...BASE_VALUES,
    stageWidthFn: windowWidth => windowWidth,
    blobAlign: BlobAlign.COMPACT,
    blobRadius: BASE_VALUES.blobRadius * 0.5,
    blobSpread: windowWidth * 0.5,
    showTimelineBlobJoin: false,
    globalScale: 0.25,
  },
  [ModeValues.SMALL]: {
    ...BASE_VALUES,
    blobAlign: BlobAlign.LEFT,
    globalScale: 0.4,
  },
  [ModeValues.MEDIUM]: {
    ...BASE_VALUES,
    globalScale: 0.55,
  },
  [ModeValues.LARGE]: {
    ...BASE_VALUES,
    globalScale: 0.65,
  },
  [ModeValues.EXTRA_LARGE]: {
    globalScale: 0.65,
    ...BASE_VALUES,
  },
});

const getResponsiveValueFromIndex = (windowWidth, modeIndex, valueName) => {
  const value = ResponsiveValues(windowWidth)[ScreenModes[modeIndex]][valueName];
  return value !== undefined ? value : getResponsiveValueFromIndex(windowWidth, modeIndex - 1, valueName);
};

export const getResponsiveValue = (windowWidth, mode, valueName) => {
  const modeIndex = ScreenModes.indexOf(mode);
  return modeIndex >= 0 ? getResponsiveValueFromIndex(windowWidth, modeIndex, valueName) : 0;
};
