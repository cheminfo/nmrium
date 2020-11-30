import React, { useCallback, useState, useRef, memo, useMemo } from 'react';
import { useAlert } from 'react-alert';
import ReactCardFlip from 'react-card-flip';
import { FaFileExport } from 'react-icons/fa';
import { IoPulseOutline } from 'react-icons/io5';

import ToggleButton from '../../elements/ToggleButton';
import ToolTip from '../../elements/ToolTip/ToolTip';
import MultiAnalysisWrapper from '../../hoc/MultiAnalysisWrapper';
import { AnalysisObj } from '../../reducer/core/Analysis';
import Events from '../../utility/Events';
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
      options: { columns, code },
    } = spectraAanalysis[activeTab] || {
      values: {},
      options: { columns: {}, code: null },
    };
    return { values: Object.values(values), columns, code };
  }, [activeTab, spectraAanalysis]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
  }, []);

  const afterSaveHandler = useCallback(() => {
    setFlipStatus(false);
  }, []);

  const showTrackerHandler = useCallback(() => {
    Events.emit('showYSpectraTrackers', true);
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
          <ToggleButton
            popupTitle="Y Spectra Tracker"
            popupPlacement="right"
            onClick={showTrackerHandler}
          >
            <IoPulseOutline />
          </ToggleButton>
        </DefaultPanelHeader>
      )}
      {isFlipped && (
        <PreferencesHeader
          onSave={saveSettingHandler}
          onClose={settingsPanelHandler}
        />
      )}
      <div style={{ height: '100%', overflow: 'auto' }}>
        <ReactCardFlip
          isFlipped={isFlipped}
          infinite={true}
          containerStyle={{ overflow: 'hidden' }}
        >
          <MultipleSpectraAnalysisTable data={data} activeTab={activeTab} />
          <MultipleSpectraAnalysisPreferences
            data={data}
            onAfterSave={afterSaveHandler}
            ref={settingRef}
          />
        </ReactCardFlip>
      </div>
    </div>
  );
});

export default MultiAnalysisWrapper(MultipleSpectraAnalysisPanel);
