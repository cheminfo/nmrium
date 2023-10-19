import { stringCapitalize } from '../../utils/stringCapitalize';
import { SignalKind } from '../types/common/SignalKind';

const KINDS: SignalKind[] = [
  'undefined',
  'signal',
  'reference',
  'solvent',
  'standard',
  'p1',
  'p2',
  'p3',
];

interface SignalKindItem {
  value: SignalKind;
  label: string;
}

export const SIGNAL_KINDS: SignalKindItem[] = KINDS.map((key) => ({
  value: key,
  label: stringCapitalize(key),
}));

export const SIGNAL_INLCUDED_KINDS: SignalKind[] = ['signal'];
export const DATUM_KIND = { signal: 'signal', mixed: 'mixed' } as const;
