import { Jcoupling } from 'nmr-processing';

import { Range, Signal1D } from '../../../data/types/data1d';
/**
 * Links object that use coupling as key and value is an array of objects {id:signal id ,x:signal delta,y:coupling}
 */

interface Coupling {
  coupling: number;
  delta: number;
}

export interface CouplingLink {
  couplings: Coupling[];
  from: number;
  to: number;
}

interface GenerateJGraphDataResult {
  signals: Signal1D[];
  jCouplingMax: number;
  links: CouplingLink[];
}

export default function generateJGraphData(
  ranges: Range[],
  jGraphTolerance: number,
): GenerateJGraphDataResult | null {
  if (!ranges && !Array.isArray(ranges)) return null;

  let signals: Signal1D[] = [];
  let jCouplingMax = 0;
  let links: CouplingLink[] = createLinks(ranges, jGraphTolerance);

  for (const range of ranges) {
    for (const signal of range.signals) {
      const { id: signalId, ...restSignal } = signal;

      if (restSignal.js) {
        signals.push({ id: `${range.id}${signalId}`, ...restSignal });
        const tempMax = getJsCouplingMax(restSignal.js);
        jCouplingMax = tempMax > jCouplingMax ? tempMax : jCouplingMax;
      }
    }
  }

  return { signals, jCouplingMax, links };
}

function getJsCouplingMax(js: Jcoupling[]): number {
  let max = -Infinity;
  for (const { coupling } of js) {
    max = coupling > max ? coupling : max;
  }
  return max;
}

function getCouplings(ranges: Range[]): Coupling[] {
  const couplings: Coupling[] = [];
  for (let range of ranges) {
    for (const { delta, js } of range.signals) {
      for (const { coupling } of js || []) {
        couplings.push({ coupling, delta });
      }
    }
  }
  return couplings;
}

function initLink(coupling: Coupling): CouplingLink {
  const { delta } = coupling;
  return {
    from: delta,
    to: delta,
    couplings: [coupling],
  };
}

function createLinks(ranges: Range[], jGraphTolerance = 0) {
  const couplings = getCouplings(ranges).sort(
    (a, b) => a.coupling - b.coupling,
  );

  if (!couplings || couplings.length === 0) return [];

  const links: CouplingLink[] = [];

  for (let i = 0; i < couplings.length; i++) {
    let link: CouplingLink = initLink(couplings[i]);

    for (let j = i; j < couplings.length; j++) {
      const nextCoupling = couplings[j];

      if (
        Math.abs(couplings[i].coupling - nextCoupling.coupling) <
        jGraphTolerance
      ) {
        link.couplings.push(nextCoupling);
      } else {
        break;
      }
    }
    if (link.couplings.length >= 2) {
      const couplingsSortByDelta = link.couplings.sort(
        (a, b) => a.delta - b.delta,
      );
      link.from = couplingsSortByDelta[0].delta;
      link.to = couplingsSortByDelta[couplingsSortByDelta.length - 1].delta;
    }
    links.push(link);
  }
  return links;
}
