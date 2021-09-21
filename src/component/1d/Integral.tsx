// import { xyReduce, xyIntegral } from 'ml-spectra-processing';
import { useMemo } from 'react';

import { Datum1D } from '../../data/data1d/Spectrum1D';
import { usePreferences } from '../context/PreferencesContext';
import { integralDefaultValues } from '../panels/extra/preferences/defaultValues';
import { getValue } from '../utility/LocalStorage';

import IntegralResizable from './IntegralResizable';
import useIntegralPath from './utilities/useIntegralPath';

interface IntegralProps {
  integral: { id: string; from: number; to: number; integral?: number };
  spectrum: Datum1D;
  isActive: boolean;
}

function Integral({ integral, spectrum, isActive }: IntegralProps) {
  const preferences = usePreferences();
  const path = useIntegralPath(integral, { spectrum });

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
        }}
        d={path}
      />

      <IntegralResizable integralData={integral} />
    </g>
  );
}

export default Integral;
