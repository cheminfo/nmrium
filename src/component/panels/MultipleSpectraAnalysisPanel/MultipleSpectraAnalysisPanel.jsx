import React, { useCallback, useState, useRef, memo, useMemo } from 'react';
import { useAlert } from 'react-alert';
import ReactCardFlip from 'react-card-flip';
import { FaFileExport } from 'react-icons/fa';

import ToolTip from '../../elements/ToolTip/ToolTip';
import MultiAnalysisWrapper from '../../hoc/MultiAnalysisWrapper';
import { AnalysisObj } from '../../reducer/core/Analysis';
import { copyTextToClipboard } from '../../utility/Export';
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
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
};

const MultipleSpectraAnalysisPanel = memo(({ spectraAanalysis, activeTab }) => {
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef();
  const alert = useAlert();

  const data = useMemo(() => {
    const {
      values,
      options: { columns },
    } = spectraAanalysis[activeTab] || {
      values: {},
      options: { columns: {} },
    };
    return { values: Object.values(values), columns };
  }, [activeTab, spectraAanalysis]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);
  const copyToClipboardHandler = useCallback(() => {
    const data = AnalysisObj.getMultipleAnalysisTableAsString(activeTab);
    const success = copyTextToClipboard(data);
    if (success) {
      alert.success('Data copied to clipboard');
    } else {
      alert.error('copy to clipboard failed');
    }
  }, [activeTab, alert]);

  return (
    <div style={styles.container}>
      {!isFlipped && (
        <DefaultPanelHeader
          deleteToolTip="Delete All Peaks"
          showSettingButton="true"
          canDelete={false}
          onSettingClick={settingsPanelHandler}
        >
          <ToolTip title="Copy To Clipboard" popupPlacement="right">
            <button
              style={styles.button}
              type="button"
              onClick={copyToClipboardHandler}
            >
              <FaFileExport />
            </button>
          </ToolTip>
        </DefaultPanelHeader>
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
        <div style={{ overflow: 'auto', height: '100%' }}>
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
