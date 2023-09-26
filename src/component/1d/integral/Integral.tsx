import { useActiveSpectrumIntegralsViewState } from '../../hooks/useActiveSpectrumIntegralsViewState';
import useIntegralPath from '../../hooks/useIntegralPath';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';

import IntegralResizable from './IntegralResizable';
import { IntegralData } from './IntegralsSeries';

interface IntegralProps {
  integral: IntegralData;
  nucleus: string;
  max: number;
}

function Integral({ integral, nucleus, max }: IntegralProps) {
  const { x, y } = integral;
  const { scaleRatio } = useActiveSpectrumIntegralsViewState();
  const path = useIntegralPath({ x, y, max, scaleRatio });
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
