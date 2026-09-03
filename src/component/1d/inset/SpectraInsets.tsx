

import { useChartData } from '../../context/ChartContext.js';

import { DraggableInset } from './DraggableInset.js';

export function SpectraInsets() {
  const insets = useInsets();

  if (!insets || insets?.length === 0) return null;

  return insets.map((inset) => {
    return <DraggableInset key={inset.id} {...inset} />;
  });
}

function useInsets() {
  const {
    view: {
      spectra: { activeTab },
      insets,
    },
  } = useChartData();
  return insets?.[activeTab];
}
