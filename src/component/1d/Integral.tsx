import { useMemo } from 'react';

import { usePreferences } from '../context/PreferencesContext';
import useIntegralPath from '../hooks/useIntegralPath';
import { integralDefaultValues } from '../panels/extra/preferences/defaultValues';
import { getValue } from '../utility/LocalStorage';

import IntegralResizable from './IntegralResizable';

interface IntegralProps {
  integral: { id: string; from: number; to: number; integral?: number };
  isActive: boolean;
}

function Integral({ integral, isActive }: IntegralProps) {
  const preferences = usePreferences();
  const path = useIntegralPath(integral);

  const integralSettings = useMemo(() => {
    let {
      color = integralDefaultValues.color,
      strokeWidth = integralDefaultValues.strokeWidth,
    } = getValue(preferences.current, 'formatting.panels.integrals') || {};
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
          opacity: isActive ? 1 : 0.2,
        }}
        d={path}
      />

      <IntegralResizable integralData={integral} />
    </g>
  );
}

export default Integral;
