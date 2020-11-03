import React, { useCallback, useState, useRef, memo } from 'react';
import ReactCardFlip from 'react-card-flip';

import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import MultipleSpectraAnalysisTable from './MultipleSpectraAnalysisTable';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
};

const MultipleSpectraAnalysisPanel = memo(() => {
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef();

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    // settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  return (
    <div style={styles.container}>
      {!isFlipped && (
        <DefaultPanelHeader
          deleteToolTip="Delete All Peaks"
          showSettingButton="true"
          canDelete={false}
          onSettingClick={settingsPanelHandler}
        />
      )}
      {isFlipped && (
        <PreferencesHeader
          onSave={saveSettingHandler}
          onClose={settingsPanelHandler}
        />
      )}

      <ReactCardFlip
        isFlipped={isFlipped}
        infinite={true}
        containerStyle={{ height: '100%' }}
      >
        <div style={{ overflow: 'auto' }}>
          <MultipleSpectraAnalysisTable />
        </div>
        <div ref={settingRef}>comming soon</div>
      </ReactCardFlip>
    </div>
  );
});

export default MultipleSpectraAnalysisPanel;
