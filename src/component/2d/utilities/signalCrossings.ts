import type { Signal1D, Spectrum2D } from '@zakodium/nmr-types';

export interface Candidate {
  xSignalId: string;
  ySignalId: string;
  xDelta: number;
  yDelta: number;
  isLinked: boolean;
  assignment: string;
}

export interface CrossingScales {
  x: (ppm: number) => number;
  y: (ppm: number) => number;
}

interface CrossingDomains {
  xDomain: number[];
  yDomain: number[];
}

interface BuildCandidatesOptions extends Pick<Spectrum2D, 'linkedSignals'> {
  xSignals: Signal1D[];
  ySignals: Signal1D[];
  domains: CrossingDomains;
}

interface Position {
  x: number;
  y: number;
}

function inDomain(value: number, domain: number[]) {
  const [min, max] = domain;
  return value >= Math.min(min, max) && value <= Math.max(min, max);
}

export function buildCandidates({
  xSignals,
  ySignals,
  linkedSignals,
  domains,
}: BuildCandidatesOptions): Candidate[] {
  const linked = new Set(
    linkedSignals?.map((link) => `${link.xSignalId}:${link.ySignalId}`),
  );
  const xs = xSignals.filter((signal) =>
    inDomain(signal.delta, domains.xDomain),
  );
  const ys = ySignals.filter((signal) =>
    inDomain(signal.delta, domains.yDomain),
  );
  const candidates: Candidate[] = [];

  for (const x of xs) {
    for (const y of ys) {
      candidates.push({
        xSignalId: x.id,
        ySignalId: y.id,
        xDelta: x.delta,
        yDelta: y.delta,
        isLinked: linked.has(`${x.id}:${y.id}`),
        assignment: [x.assignment, y.assignment].filter(Boolean).join(','),
      });
    }
  }
  return candidates;
}

function distance(
  candidate: Candidate,
  mouse: Position,
  scales: CrossingScales,
) {
  return Math.hypot(
    scales.x(candidate.xDelta) - mouse.x,
    scales.y(candidate.yDelta) - mouse.y,
  );
}

export function findNearestCrossing(
  mouse: Position,
  candidates: Candidate[],
  scales: CrossingScales,
  radius = 14,
): Candidate | null {
  let best: Candidate | null = null;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    const candidateDistance = distance(candidate, mouse, scales);
    if (candidateDistance < bestDistance) {
      bestDistance = candidateDistance;
      best = candidate;
    }
  }

  //return null if the nearest crossing is outside the cursor's pixel radius.
  if (!best || bestDistance > radius) return null;

  return best;
}
