/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrOverlay } from 'cheminfo-font';
import { Spectrum1D } from 'nmr-load-save';
import { useCallback, useState, useRef, memo } from 'react';
import { FaChartBar, FaFileExport } from 'react-icons/fa';
import { IoPulseOutline } from 'react-icons/io5';
import { useToggle } from 'react-use';

import {
  getDataAsString,
  generateAnalyzeSpectra,
} from '../../../data/data1d/multipleSpectraAnalysis';
import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import ActiveButton from '../../elements/ActiveButton';
import Button from '../../elements/ButtonToolTip';
import { useAlert } from '../../elements/popup/Alert';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { DisplayerMode } from '../../reducer/Reducer';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import AlignSpectra from './AlignSpectra';
import AnalysisChart from './AnalysisChart';
import MultipleSpectraAnalysisTable from './MultipleSpectraAnalysisTable';
import MultipleSpectraAnalysisPreferences from './preferences';

interface MultipleSpectraAnalysisPanelInnerProps {
  spectra: Spectrum1D[];
  displayerMode: DisplayerMode;
  activeTab: string;
  showLegend: boolean;
}

function MultipleSpectraAnalysisPanelInner({
  activeTab,
  spectra,
  showLegend,
  displayerMode,
}: MultipleSpectraAnalysisPanelInnerProps) {
  const [isFlipped, setFlipStatus] = useState(false);
  const [calibration, setCalibration] = useState(false);
  const spectraPreferences = usePanelPreferences('spectra', activeTab);
  const preferences = usePanelPreferences('multipleSpectraAnalysis', activeTab);
  const [showAnalysisChart, toggleAnalysisChart] = useToggle(false);
  const spectraAnalysis = generateAnalyzeSpectra(
    preferences as any,
    spectra,
    activeTab,
  ) as any;

  const settingRef = useRef<any>();
  const alert = useAlert();
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
    dispatch({ type: 'TOGGLE_SPECTRA_LEGEND' });
  }, [dispatch]);

  const { rawWriteWithType, cleanShouldFallback, shouldFallback, text } =
    useClipboard();

  const copyToClipboardHandler = useCallback(() => {
    const data = getDataAsString(spectraAnalysis, spectra, spectraPreferences);
    if (!data) return;

    void rawWriteWithType(data).then(() =>
      alert.success('Data copied to clipboard'),
    );
  }, [alert, rawWriteWithType, spectra, spectraAnalysis, spectraPreferences]);

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
          {displayerMode === '1D' && (
            <>
              <Button
                popupTitle="Spectra calibration"
                onClick={() => {
                  setCalibration((value) => {
                    if (value) dispatch({ type: 'RESET_SELECTED_TOOL' });
                    return !value;
                  });
                }}
              >
                <SvgNmrOverlay style={{ fontSize: '16px' }} />
              </Button>

              <ActiveButton
                popupTitle="Y spectra tracker"
                popupPlacement="right"
                onClick={showTrackerHandler}
                value={showLegend}
                key={`${showLegend}`}
              >
                <IoPulseOutline />
              </ActiveButton>
              <ActiveButton
                popupTitle={`${
                  !showAnalysisChart ? 'Show' : 'Hide'
                } analysis chart`}
                popupPlacement="right"
                onClick={() => toggleAnalysisChart()}
                value={showAnalysisChart}
                style={{ marginLeft: '5px' }}
              >
                <FaChartBar />
              </ActiveButton>
            </>
          )}
        </DefaultPanelHeader>
      )}
      {isFlipped && (
        <PreferencesHeader
          onSave={saveSettingHandler}
          onClose={settingsPanelHandler}
        />
      )}
      <div className="inner-container">
        {isFlipped ? (
          <MultipleSpectraAnalysisPreferences
            data={spectraAnalysis}
            activeTab={activeTab}
            onAfterSave={afterSaveHandler}
            ref={settingRef}
          />
        ) : calibration ? (
          <AlignSpectra
            nucleus={activeTab}
            onClose={() => setCalibration(false)}
          />
        ) : (
          <div style={{ overflow: 'auto', maxHeight: '100%' }}>
            {showAnalysisChart && (
              <AnalysisChart spectraAnalysisData={spectraAnalysis} />
            )}
            <MultipleSpectraAnalysisTable
              data={spectraAnalysis}
              resortSpectra={preferences.analysisOptions.resortSpectra}
              activeTab={activeTab}
            />
          </div>
        )}
      </div>
      <ClipboardFallbackModal
        mode={shouldFallback}
        onDismiss={cleanShouldFallback}
        text={text}
        label="Spectra Analysis"
      />
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
    displayerMode,
  } = useChartData();

  const spectra = getSpectraByNucleus(activeTab, data) as Spectrum1D[];

  if (!activeTab) {
    return <div />;
  }

  return (
    <MemoizedMultipleSpectraAnalysisPanel
      {...{ activeTab, displayerMode, displayerKey, spectra, showLegend }}
    />
  );
}
