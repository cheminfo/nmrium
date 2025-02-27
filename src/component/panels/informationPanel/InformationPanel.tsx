import { useMemo } from 'react';
import type { InfoPanelData } from 'react-science/ui';
import { InfoPanel } from 'react-science/ui';

import useSpectrum from '../../hooks/useSpectrum.js';

const emptyData = { info: {}, meta: {} };

export function InformationPanel() {
  const { info, meta, customInfo } = useSpectrum(emptyData);
  const data: InfoPanelData[] = useMemo(
    () => [
      { description: 'Custom information', data: customInfo || {} },
      { description: 'Spectrum information', data: info || {} },
      { description: 'Other spectrum parameters', data: meta || {} },
    ],
    [customInfo, info, meta],
  );

  return <InfoPanel data={data} title="" />;
}
