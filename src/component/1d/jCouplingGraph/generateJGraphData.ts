import { Jcoupling } from 'nmr-processing';

import { Range, Signal1D } from '../../../data/types/data1d';
/**
 * Links object that use coupling as key and value is an array of objects {id:signal id ,x:signal delta,y:coupling}
 */
export interface CouplingLink {
  id: string;
  x: number;
  y: number;
}
export type CouplingLinks = Record<number, CouplingLink[]>;

interface GenerateJGraphDataResult {
  signals: Signal1D[];
  jCouplingMax: number;
  links: CouplingLinks;
}

export default function generateJGraphData(
  Ranges: Range[],
): GenerateJGraphDataResult | null {
  if (!Ranges && !Array.isArray(Ranges)) return null;

  let signals: Signal1D[] = [];
  let jCouplingMax = 0;
  let links: CouplingLinks = {};

  for (const range of Ranges) {
    for (const signal of range.signals) {
      const { id: signalId, ...restSignal } = signal;

      if (restSignal.js) {
        signals.push({ id: `${range.id}${signalId}`, ...restSignal });
        const tempMax = getJsCouplingMax(restSignal.js);
        createLinks(links, signal);
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

function createLinks(links: CouplingLinks, Signal: Signal1D) {
  if (!Signal.js) return;
  const { id, delta, js } = Signal;

  for (const { coupling } of js) {
    const key = coupling.toFixed(1);
    const link = { id, x: delta, y: coupling };

    if (key in links) {
      links[key] = [...links[key], link].sort((a, b) => a.x - b.x);
    } else {
      links[key] = [link];
    }
  }
}
