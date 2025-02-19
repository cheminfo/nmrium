import type { Spectrum1D } from 'nmr-load-save';
import type { Jcoupling, Range } from 'nmr-processing';

import {
  getMultiplicityNumber,
  getPascal,
} from '../../panels/extra/utilities/MultiplicityUtilities.js';

export interface TreeNode {
  x: number;
  parentX?: number;
  level: number;
  ratio: number;
}

export interface TreeNodes {
  rangeKey: string;
  signalKey: string;
  multiplicity?: string;
  nodes: TreeNode[];
  diaIDs?: string[];
  min: number;
  max: number;
}

export function generateTreeNodes(range: Range, spectrumData: Spectrum1D) {
  // TODO: make sure spectrumData is not a lie and remove the optional chaining.
  const frequency = spectrumData?.info?.originFrequency;

  const result: TreeNodes[] = [];
  let nodes: TreeNode[] = [];

  function generateNodes(
    startX: number,
    parentX: number,
    js: Jcoupling[],
    jsIndex: number,
    minMax: {
      min: number;
      max: number;
    },
  ) {
    if (jsIndex >= js.length) return;

    const { multiplicity, coupling: couplingHz } = js[jsIndex];
    const pascal = getPascal(getMultiplicityNumber(multiplicity), 0.5); // @TODO for now we use the default spin of 1 / 2 only

    // convert to ppm
    const coupling = couplingHz / frequency;

    let x =
      pascal.length % 2 === 0
        ? startX - (pascal.length / 2) * coupling + coupling / 2 // in case of even number of nodes
        : startX - (pascal.length / 2 - 0.5) * coupling; // in case of odd number of nodes

    for (const [k, ratio] of pascal.entries()) {
      if (k > 0) {
        x += coupling;
      }
      if (x < minMax.min) {
        minMax.min = x;
      }

      if (x > minMax.max) {
        minMax.max = x;
      }
      nodes.push({
        x,
        parentX,
        ratio,
        level: jsIndex,
      });
      generateNodes(x, x, js, jsIndex + 1, minMax);
    }
  }

  const { signals, from, to, id: rangeKey } = range;
  for (const signal of signals || []) {
    nodes = [];

    const { multiplicity, js, delta, id: signalKey, diaIDs } = signal;
    const minMax = { min: delta, max: delta };

    nodes.push({
      x: delta,
      level: 0,
      ratio: 1,
    });

    if (!multiplicity) continue;

    if (multiplicity === 'm') {
      nodes.push(
        { x: from, parentX: delta, level: 1, ratio: 1 },
        { x: to, parentX: delta, level: 1, ratio: 1 },
      );
      minMax.min = from;
      minMax.max = to;
    } else {
      generateNodes(delta, delta, js, 0, minMax);
    }

    result.push({
      rangeKey,
      signalKey,
      diaIDs,
      multiplicity,
      nodes,
      ...minMax,
    });
  }

  return result;
}
