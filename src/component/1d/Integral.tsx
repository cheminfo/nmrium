import useIntegralPath from '../hooks/useIntegralPath';
import { usePanelPreferences } from '../hooks/usePanelPreferences';

import IntegralResizable from './IntegralResizable';

interface IntegralProps {
  integral: { id: string; from: number; to: number; integral?: number };
  isActive: boolean;
  nucleus: string;
}

function Integral({ integral, isActive, nucleus }: IntegralProps) {
  const path = useIntegralPath(integral);
  const integralPreferences = usePanelPreferences('integrals', nucleus);

  return (
    <g>
      <path
        className="line"
        stroke={integralPreferences.color}
        strokeWidth={integralPreferences.strokeWidth}
        fill="none"
        style={{
          opacity: isActive ? 1 : 0.2,
        }}
        d={path}
      />

      <IntegralResizable
        integralData={integral}
        integralFormat={integralPreferences.relative.format}
      />
    </g>
  );
}

export default Integral;
