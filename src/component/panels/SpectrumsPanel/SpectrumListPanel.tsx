import { useCallback, memo, useState, CSSProperties } from 'react';

import SpectraPanelHeader from './SpectraPanelHeader';
import SpectrumsTabs from './SpectrumsTabs';

const styles: CSSProperties = {
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
};

function SpectrumListPanel() {
  const [spectra, setSpectra] = useState<Array<any>>([]);

  const tabChangeHandler = useCallback((e) => {
    setSpectra(e.data || []);
  }, []);

  return (
    <div style={styles}>
      <SpectraPanelHeader spectrums={spectra} />
      <SpectrumsTabs onTabChange={tabChangeHandler} />
    </div>
  );
}

export default memo(SpectrumListPanel);
