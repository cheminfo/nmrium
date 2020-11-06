import React, { useCallback, useState, useRef, memo, useMemo } from 'react';
import ReactCardFlip from 'react-card-flip';

import MultiAnalysisWrapper from '../../hoc/MultiAnalysisWrapper';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import MultipleSpectraAnalysisPreferences from './MultipleSpectraAnalysisPreferences';
import MultipleSpectraAnalysisTable from './MultipleSpectraAnalysisTable';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
};

const MultipleSpectraAnalysisPanel = memo(({ spectraAanalysis, activeTab }) => {
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef();

  const data = useMemo(() => {
    const {
      values,
      options: { columns },
    } = spectraAanalysis[activeTab] || {
      values: {},
      options: { columns: {} },
    };
    // eslint-disable-next-line no-console
    console.log(columns);
    return { values: Object.values(values), columns };
  }, [activeTab, spectraAanalysis]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
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
          <MultipleSpectraAnalysisTable data={data} activeTab={activeTab} />
        </div>
        <MultipleSpectraAnalysisPreferences
          columns={data.columns}
          ref={settingRef}
        />
      </ReactCardFlip>
    </div>
  );
});

export default MultiAnalysisWrapper(MultipleSpectraAnalysisPanel);
