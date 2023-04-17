/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrOverlay } from 'cheminfo-font';
import { Spectrum1D } from 'nmr-load-save';
import { useCallback, useState, useRef, memo } from 'react';
import { FaFileExport } from 'react-icons/fa';
import { IoPulseOutline } from 'react-icons/io5';

import {
  getDataAsString,
  generateAnalyzeSpectra,
} from '../../../data/data1d/multipleSpectraAnalysis';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/ButtonToolTip';
import ToggleButton from '../../elements/ToggleButton';
import { positions, useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import AlignSpectraModal from '../../modal/AlignSpectraModal';
import {
  RESET_SELECTED_TOOL,
  TOGGLE_SPECTRA_LEGEND,
} from '../../reducer/types/Types';
import { copyTextToClipboard } from '../../utility/export';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import MultipleSpectraAnalysisTable from './MultipleSpectraAnalysisTable';
import MultipleSpectraAnalysisPreferences from './preferences';

interface MultipleSpectraAnalysisPanelInnerProps {
  spectra: Spectrum1D[];
  activeTab: string;
  showLegend: boolean;
}

function MultipleSpectraAnalysisPanelInner({
  activeTab,
  spectra,
  showLegend,
}: MultipleSpectraAnalysisPanelInnerProps) {
  const [isFlipped, setFlipStatus] = useState(false);
  const spectraPreferences = usePanelPreferences('spectra', activeTab);
  const preferences = usePanelPreferences('multipleSpectraAnalysis', activeTab);

  const spectraAnalysis = generateAnalyzeSpectra(
    preferences as any,
    spectra,
    activeTab,
  ) as any;

  const settingRef = useRef<any>();
  const alert = useAlert();
  const modal = useModal();
  const dispatch = useDispatch();

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
    dispatch({ type: TOGGLE_SPECTRA_LEGEND });
  }, [dispatch]);
  const openAlignSpectra = useCallback(() => {
    dispatch({ type: RESET_SELECTED_TOOL });
    modal.show(<AlignSpectraModal nucleus={activeTab} />, {
      isBackgroundBlur: false,
      position: positions.TOP_CENTER,
      width: 500,
    });
  }, [activeTab, modal, dispatch]);

  const copyToClipboardHandler = useCallback(() => {
    void (async () => {
      const data = getDataAsString(
        spectraAnalysis,
        spectra,
        spectraPreferences,
      );
      const success = await copyTextToClipboard(data);
      if (success) {
        alert.success('Data copied to clipboard');
      } else {
        alert.error('copy to clipboard failed');
      }
    })();
  }, [alert, spectra, spectraAnalysis, spectraPreferences]);

  return (
    <div
      css={[
        tablePanelStyle,
        isFlipped &&
          css`
            .table-container th {
              position: relative;
            }
          `,
      ]}
    >
      {!isFlipped && (
        <DefaultPanelHeader
          deleteToolTip="Delete All Peaks"
          showSettingButton
          canDelete={false}
          onSettingClick={settingsPanelHandler}
        >
          <Button
            popupTitle="Copy To Clipboard"
            onClick={copyToClipboardHandler}
          >
            <FaFileExport />
          </Button>
          <Button popupTitle="Spectra calibration" onClick={openAlignSpectra}>
            <SvgNmrOverlay style={{ fontSize: '18px' }} />
          </Button>
          <ToggleButton
            popupTitle="Y Spectra Tracker"
            popupPlacement="right"
            onClick={showTrackerHandler}
            defaultValue={showLegend}
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            key={`${showLegend}`}
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
      <div className="inner-container">
        {!isFlipped ? (
          <MultipleSpectraAnalysisTable
            data={spectraAnalysis}
            resortSpectra={preferences.analysisOptions.resortSpectra}
            activeTab={activeTab}
          />
        ) : (
          <MultipleSpectraAnalysisPreferences
            data={spectraAnalysis}
            activeTab={activeTab}
            onAfterSave={afterSaveHandler}
            ref={settingRef}
          />
        )}
      </div>
    </div>
  );
}

const MemoizedMultipleSpectraAnalysisPanel = memo(
  MultipleSpectraAnalysisPanelInner,
);

export default function MultipleSpectraAnalysisPanel() {
  const {
    data,
    view: {
      spectra: { activeTab, showLegend },
    },
    displayerKey,
  } = useChartData();

  const spectra = getSpectraByNucleus(activeTab, data) as Spectrum1D[];

  if (!activeTab) {
    return <div />;
  }

  return (
    <MemoizedMultipleSpectraAnalysisPanel
      {...{ activeTab, displayerKey, spectra, showLegend }}
    />
  );
}
