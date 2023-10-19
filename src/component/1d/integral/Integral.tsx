import { Integral as IntegralType } from 'nmr-processing';

import useIntegralPath from '../../hooks/useIntegralPath';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';

import IntegralResizable from './IntegralResizable';

interface IntegralProps {
  integral: IntegralType;
  nucleus: string;
}

function Integral({ integral, nucleus }: IntegralProps) {
  const path = useIntegralPath(integral);
  const integralPreferences = usePanelPreferences('integrals', nucleus);

  return (
    <g>
      <path
        className="line"
        stroke={integralPreferences.color}
        strokeWidth={integralPreferences.strokeWidth}
        fill="none"
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
