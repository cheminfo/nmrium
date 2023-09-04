import { SignalKind } from '../types/common/SignalKind';

export const SIGNAL_KINDS: SignalKind[] = [
  'undefined',
  'signal',
  'reference',
  'solvent',
  'standard',
];

export const SignalKindsToInclude: SignalKind[] = ['signal'];
export const DatumKind = { signal: 'signal', mixed: 'mixed' };
