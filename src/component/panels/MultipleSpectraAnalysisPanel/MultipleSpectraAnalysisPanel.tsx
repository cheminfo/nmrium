import {
  SvgNmrOverlay,
  SvgNmrAddFilter,
  SvgNmrExportAsMatrix,
} from 'cheminfo-font';
import {
  useCallback,
  useState,
  useRef,
  memo,
  useMemo,
  CSSProperties,
} from 'react';
import ReactCardFlip from 'react-card-flip';
import { FaFileExport } from 'react-icons/fa';
import { IoPulseOutline } from 'react-icons/io5';

import { getDataAsString } from '../../../data/data1d/MulitpleAnalysis';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/ButtonToolTip';
import ToggleButton from '../../elements/ToggleButton';
import { positions, useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import AlignSpectraModal from '../../modal/AlignSpectraModal';
import ExportAsMatrixModal from '../../modal/ExportAsMatrixModal';
import MultipleSpectraFiltersModal from '../../modal/MultipleSpectraFiltersModal';
import { RESET_SELECTED_TOOL } from '../../reducer/types/Types';
import Events from '../../utility/Events';
import { copyTextToClipboard } from '../../utility/Export';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import MultipleSpectraAnalysisPreferences from './MultipleSpectraAnalysisPreferences';
import MultipleSpectraAnalysisTable from './MultipleSpectraAnalysisTable';

const styles: Record<'container' | 'button', CSSProperties> = {
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

interface MultipleSpectraAnalysisPanelInnerProps {
  activeTab: string;
  spectraAnalysis: Record<
    string,
    { values: any; options: { columns: Array<number>; code: any } }
  >;
}

function MultipleSpectraAnalysisPanelInner({
  activeTab,
  spectraAnalysis,
}: MultipleSpectraAnalysisPanelInnerProps) {
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<any>();
  const alert = useAlert();
  const modal = useModal();
  const dispatch = useDispatch();

  const data = useMemo<any>(() => {
    const {
      values,
      options: { columns, code },
    } = spectraAnalysis[activeTab] || {
      values: {},
      options: { columns: {}, code: null },
    };
    return { values: Object.values(values), columns, code };
  }, [activeTab, spectraAnalysis]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
  }, []);

  const afterSaveHandler = useCallback(() => {
    setFlipStatus(false);
  }, []);

  const showTrackerHandler = useCallback((flag) => {
    Events.emit('showYSpectraTrackers', flag);
  }, []);
  const openAlignSpectra = useCallback(() => {
    dispatch({ type: RESET_SELECTED_TOOL });
    modal.show(<AlignSpectraModal nucleus={activeTab} />, {
      isBackgroundBlur: false,
      position: positions.TOP_CENTER,
      // enableResizing: false,
      width: 500,
      // height: 600,
    });
  }, [activeTab, modal, dispatch]);
  const openFiltersModal = useCallback(() => {
    dispatch({ type: RESET_SELECTED_TOOL });
    modal.show(<MultipleSpectraFiltersModal />, {
      isBackgroundBlur: false,
      position: positions.TOP_CENTER,
      // enableResizing: false,
      width: 500,
      // height: 600,
    });
  }, [modal, dispatch]);

  const copyToClipboardHandler = useCallback(async () => {
    const data = getDataAsString(spectraAnalysis, activeTab);
    const success = await copyTextToClipboard(data);
    if (success) {
      alert.success('Data copied to clipboard');
    } else {
      alert.error('copy to clipboard failed');
    }
  }, [activeTab, alert, spectraAnalysis]);

  const openExportAsMatrixModal = useCallback(() => {
    dispatch({ type: RESET_SELECTED_TOOL });
    modal.show(<ExportAsMatrixModal />, {
      isBackgroundBlur: false,
      position: positions.TOP_CENTER,
      width: 500,
    });
  }, [modal, dispatch]);

  return (
    <div style={styles.container}>
      {!isFlipped && (
        <DefaultPanelHeader
          deleteToolTip="Delete All Peaks"
          showSettingButton
          canDelete={false}
          onSettingClick={settingsPanelHandler}
        >
          <Button
            popupTitle="Copy To Clipboard"
            style={styles.button}
            onClick={copyToClipboardHandler}
          >
            <FaFileExport />
          </Button>
          <Button
            popupTitle="Spectra calibration"
            style={styles.button}
            onClick={openAlignSpectra}
          >
            <SvgNmrOverlay style={{ fontSize: '18px' }} />
          </Button>
          <ToggleButton
            popupTitle="Y Spectra Tracker"
            popupPlacement="right"
            onClick={showTrackerHandler}
          >
            <IoPulseOutline />
          </ToggleButton>

          <Button
            popupTitle="Add Filter"
            style={styles.button}
            onClick={openFiltersModal}
          >
            <SvgNmrAddFilter style={{ fontSize: '18px' }} />
          </Button>
          <Button
            popupTitle="Export spectra as a Matrix"
            onClick={openExportAsMatrixModal}
          >
            <SvgNmrExportAsMatrix />
          </Button>
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
          infinite
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
}

const MemoizedMultipleSpectraAnalysisPanel = memo(
  MultipleSpectraAnalysisPanelInner,
);

export default function MultipleSpectraAnalysisPanel() {
  const { activeTab, spectraAnalysis, displayerKey } = useChartData();

  return (
    <MemoizedMultipleSpectraAnalysisPanel
      {...{ activeTab, spectraAnalysis, displayerKey }}
    />
  );
}
