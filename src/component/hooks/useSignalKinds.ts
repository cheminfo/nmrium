import { useMemo } from 'react';
import { SIGNAL_KINDS } from '../../data/constants/SignalsKinds';
import { SignalKind } from '../../data/types/common/SignalKind';
import { useChartData } from '../context/ChartContext';
import { stringCapitalize } from '../utility/stringCapitalize';

export interface SignalKindItem {
  value: SignalKind;
  label: string;
}

const SignalKinds: SignalKindItem[] = SIGNAL_KINDS.map((key) => ({
  value: key,
  label: stringCapitalize(key),
}));

export function useSignalKinds() {
  const { molecules } = useChartData();
  return useMemo(() => {
    const moleculesLabelsList = molecules.map(({ id, label }) => ({
      value: id,
      label,
    }));
    const kinds = SignalKinds.concat(moleculesLabelsList);
    return kinds;
  }, [molecules]);
}
