import { useMemo } from 'react';
import { InfoPanel, InfoPanelData } from 'react-science/ui';

import useSpectrum from '../hooks/useSpectrum';

const emptyData = { info: {}, meta: {} };

export default function InformationPanel() {
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
