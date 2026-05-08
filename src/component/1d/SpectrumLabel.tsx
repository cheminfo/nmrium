import type { SpectraTableColumn, Spectrum } from '@zakodium/nmrium-core';
import dlv from 'dlv';

import { useChartData } from '../context/ChartContext.tsx';
import { useScaleChecked } from '../context/ScaleContext.tsx';
import { usePanelPreferences } from '../hooks/usePanelPreferences.ts';
import { useVerticalAlign } from '../hooks/useVerticalAlign.ts';

export function SpectrumLabel({
  index,
  spectrum,
}: {
  index: number;
  spectrum: Spectrum;
}) {
  const { spectraBottomMargin, shiftY } = useScaleChecked();
  const {
    height,
    margin,
    toolOptions: { selectedTool },
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const { columns, enableSpectraLabel } = usePanelPreferences(
    'spectra',
    activeTab,
  );
  const verticalAlign = useVerticalAlign();

  if (
    verticalAlign !== 'stack' ||
    selectedTool !== 'zoom' ||
    !Array.isArray(columns) ||
    columns.length === 0 ||
    !enableSpectraLabel
  ) {
    return null;
  }

  const innerHeight = height - margin.bottom - spectraBottomMargin;
  const label = getSpectrumLabel(columns, spectrum);

  return (
    <text
      dy={-5}
      fontSize={12}
      transform={`translate(${margin.left},${innerHeight - shiftY * index})`}
    >
      {label}
    </text>
  );
}

function getSpectrumLabel(
  columns: SpectraTableColumn[],
  spectrum: Spectrum,
): string {
  return columns
    .filter((column) => column.isSpectrumLabel)
    .map((column) => (column.jpath ? dlv(spectrum, column.jpath, '') : ''))
    .join(', ');
}
