import type { Spectrum, SpectrumLabelField } from '@zakodium/nmrium-core';
import dlv from 'dlv';
import { SVGStyledText } from 'react-science/ui';

import { useChartData } from '../context/ChartContext.tsx';
import { usePreferences } from '../context/PreferencesContext.tsx';
import { useScaleChecked } from '../context/ScaleContext.tsx';
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
  } = useChartData();
  const { current } = usePreferences();
  const verticalAlign = useVerticalAlign();
  const { fields, visible, valueStyle } = current.spectraLabel;

  if (
    verticalAlign !== 'stack' ||
    selectedTool !== 'zoom' ||
    !Array.isArray(fields) ||
    fields.length === 0 ||
    !visible
  ) {
    return null;
  }

  const innerHeight = height - margin.bottom - spectraBottomMargin;
  const label = getSpectrumLabel(fields, spectrum);

  return (
    <SVGStyledText
      {...valueStyle}
      dy={-5}
      transform={`translate(${margin.left},${innerHeight - shiftY * index})`}
    >
      {label}
    </SVGStyledText>
  );
}

function getSpectrumLabel(
  fields: SpectrumLabelField[],
  spectrum: Spectrum,
): string {
  return fields
    .filter((field) => field.visible)
    .map((field) => (field.jpath ? dlv(spectrum, field.jpath, '') : ''))
    .join(', ');
}
