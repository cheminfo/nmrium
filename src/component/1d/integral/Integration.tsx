import { useActiveSpectrumIntegralsViewState } from '../../hooks/useActiveSpectrumIntegralsViewState.js';
import useIntegralPath from '../../hooks/useIntegralPath.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';

import IntegralResizable from './IntegralResizable.js';
import { IntegralData } from './IntegralsSeries.js';

interface IntegralProps {
  integral: IntegralData;
  nucleus: string;
  max: number;
  from: number;
  to: number;
}

export function Integration(props: IntegralProps) {
  const { integral, nucleus, max, from, to } = props;
  const { x, y } = integral;
  const { scaleRatio } = useActiveSpectrumIntegralsViewState();
  const path = useIntegralPath({ x, y, max, scaleRatio, from, to });
  const { showIntegralsValues } = useActiveSpectrumIntegralsViewState();
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

      {showIntegralsValues && (
        <IntegralResizable
          integralData={integral}
          integralFormat={integralPreferences.relative.format}
        />
      )}
    </g>
  );
}
