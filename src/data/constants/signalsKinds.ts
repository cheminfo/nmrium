import type { SignalKind } from '@zakodium/nmr-types';
import { signalKindLabelMapping } from 'nmr-processing';

interface SignalKindItem {
  value: SignalKind;
  label: string;
}

export const SIGNAL_KINDS: SignalKindItem[] = Object.entries(
  signalKindLabelMapping,
).map(([kind, label]) => ({ value: kind as SignalKind, label }));
