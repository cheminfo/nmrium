import { useCallback, memo, useState } from 'react';

import SpectraPanelHeader from './SpectraPanelHeader';
import SpectrumsTabs from './SpectrumsTabs';

const styles = {
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

function SpectrumListPanel({
  data,
  activeSpectrum,
  activeTab: activeTabState,
}) {
  const [spectrums, setSpectrums] = useState([]);

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
