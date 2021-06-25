import { useCallback, memo, useState, CSSProperties } from 'react';

import SpectraPanelHeader from './SpectraPanelHeader';
import SpectrumsTabs from './SpectrumsTabs';

const styles: CSSProperties = {
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

interface SpectrumListPanelProps {
  data?: any;
  activeSpectrum?: any;
  activeTab?: any;
}

function SpectrumListPanel({
  data,
  activeSpectrum,
  activeTab: activeTabState,
}: SpectrumListPanelProps) {
  const [spectrums, setSpectrums] = useState<Array<any>>([]);

  const tabChangeHandler = useCallback((e) => {
    setSpectrums(e.data ? e.data : []);
  }, []);

  return (
    <div style={styles}>
      <SpectraPanelHeader spectrums={spectrums} />
      <SpectrumsTabs
        onTabChange={tabChangeHandler}
        data={data}
        activeSpectrum={activeSpectrum}
        activeTab={activeTabState}
      />
    </div>
  );
}

export default memo(SpectrumListPanel);
