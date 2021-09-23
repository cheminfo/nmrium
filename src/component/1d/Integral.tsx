// import { xyReduce, xyIntegral } from 'ml-spectra-processing';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { integralDefaultValues } from '../panels/extra/preferences/defaultValues';
import { getValue } from '../utility/LocalStorage';

import IntegralResizable from './IntegralResizable';
import useIntegralPath from './utilities/useIntegralPath';

interface IntegralProps {
  integral: { id: string; from: number; to: number; integral?: number };
  isActive: boolean;
}

function Integral({ integral, isActive }: IntegralProps) {
  const preferences = usePreferences();
  const path = useIntegralPath(integral);
  const { height, margin } = useChartData();

  const integralSettings = useMemo(() => {
    let {
      color = integralDefaultValues.color,
      strokeWidth = integralDefaultValues.strokeWidth,
    } = getValue(preferences, 'formatting.panels.integrals') || {};
    return { color, strokeWidth };
  }, [preferences]);

  return (
    <g>
      <path
        className="line"
        stroke={integralSettings.color}
        strokeWidth={integralSettings.strokeWidth}
        fill="none"
        style={{
          transformOrigin: 'center top',
          opacity: isActive ? 1 : 0.2,
          transform: `translateY(-${margin.bottom + height * 0.3}px)`,
        }}
        d={path}
      />

      <IntegralResizable integralData={integral} />
    </g>
  );
}

export default Integral;
