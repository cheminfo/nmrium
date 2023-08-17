interface ReferenceInfo {
  from: number;
  to: number;
  nbPeaks: number;
  delta: number;
}

export type OneHReferences = 'tms' | 'tsp' | 'glucose';

export const REFERENCES:
  | Record<'1H', Record<OneHReferences, ReferenceInfo>>
  | Record<'13C', any> = {
  '1H': {
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
  },
  '13C': {},
};

export interface GetRangeOptions {
  nucleus?: string;
  reference?: string;
}

export function getRange(options: GetRangeOptions = {}): ReferenceInfo {
  const { nucleus = '1H', reference = 'tms' } = options;

  if (!REFERENCES[nucleus]) {
    throw new Error(`Nucleus not found: ${nucleus}`);
  }

  const info = REFERENCES[nucleus][reference.toLowerCase()];

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
