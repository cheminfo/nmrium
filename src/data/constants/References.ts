interface ReferenceInfo {
  from: number;
  to: number;
  nbPeaks: number;
  delta: number;
}

type OneHReferences = 'tms' | 'tsp' | 'glucose';

const references1H: Record<OneHReferences, ReferenceInfo> = {
  tms: {
    from: -0.1,
    to: 0.1,
    nbPeaks: 1,
    delta: 0,
  },
  tsp: {
    from: -0.1,
    to: 0.1,
    nbPeaks: 1,
    delta: 0,
  },
  glucose: {
    from: 5.18,
    to: 5.28,
    nbPeaks: 2,
    delta: 5.23,
  },
};

export const REFERENCES = {
  '1H': references1H,
  '13C': {} as any,
};

interface GetRangeOptions {
  nucleus?: string;
  reference?: string;
}

export function getRange(options: GetRangeOptions = {}): ReferenceInfo {
  const { nucleus = '1H', reference = 'tms' } = options;

  const nucleusReferences = (REFERENCES as any)[nucleus];
  if (!nucleusReferences) {
    throw new Error(`Nucleus not found: ${nucleus}`);
  }

  const info = nucleusReferences[reference.toLowerCase()];

  if (!info) {
    throw new Error(`Reference not found: ${reference}`);
  }

  return {
    from: info.delta - 0.05,
    to: info.delta + 0.05,
    delta: info.delta,
    nbPeaks: info.nbPeaks,
  };
}
