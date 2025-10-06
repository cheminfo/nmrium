import type { Spectrum1D } from '@zakodium/nmrium-core';
import { SvgNmrOverlay } from 'cheminfo-font';
import { memo, useCallback, useRef, useState } from 'react';
import { FaChartBar, FaFileExport } from 'react-icons/fa';
import { IoPulseOutline } from 'react-icons/io5';
import { useToggle } from 'react-science/ui';

import {
  generateAnalyzeSpectra,
  getDataAsString,
} from '../../../data/data1d/multipleSpectraAnalysis.js';
import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents.js';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import type { DisplayerMode } from '../../reducer/Reducer.js';
import { booleanToString } from '../../utility/booleanToString.js';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus.js';
import { TablePanel } from '../extra/BasicPanelStyle.js';
import type { SettingsRef } from '../extra/utilities/settingImperativeHandle.js';
import type { ToolbarItemProps } from '../header/DefaultPanelHeader.js';
import DefaultPanelHeader from '../header/DefaultPanelHeader.js';
import PreferencesHeader from '../header/PreferencesHeader.js';

import AlignSpectra from './AlignSpectra.js';
import AnalysisChart from './AnalysisChart.js';
import MultipleSpectraAnalysisTable from './MultipleSpectraAnalysisTable.js';
import MultipleSpectraAnalysisPreferences from './preferences/index.js';

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
  );

  const settingRef = useRef<SettingsRef | null>(null);
  const toaster = useToaster();
  const dispatch = useDispatch();

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  function saveSettingHandler() {
    void settingRef.current?.saveSetting();
  }

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
      toaster.show({ message: 'Data copied to clipboard', intent: 'success' }),
    );
  }, [rawWriteWithType, spectra, spectraAnalysis, spectraPreferences, toaster]);

  function handleSpectraCalibration() {
    setCalibration((value) => {
      if (value) dispatch({ type: 'RESET_SELECTED_TOOL' });
      return !value;
    });
  }

  let lefButtons: ToolbarItemProps[] = [
    {
      icon: <FaFileExport />,
      tooltip: 'Copy to clipboard',
      onClick: copyToClipboardHandler,
    },
  ];

  if (displayerMode === '1D') {
    lefButtons = lefButtons.concat([
      {
        icon: <SvgNmrOverlay />,
        tooltip: 'Spectra calibration',
        onClick: handleSpectraCalibration,
        active: calibration,
      },
      {
        icon: <IoPulseOutline />,
        tooltip: 'Y spectra tracker',
        onClick: showTrackerHandler,
        active: showLegend,
      },
      {
        icon: <FaChartBar />,
        tooltip: `${booleanToString(!showAnalysisChart)} analysis chart`,
        onClick: toggleAnalysisChart,
        active: showAnalysisChart,
      },
    ]);
  }

  return (
    <TablePanel isFlipped={isFlipped}>
      {!isFlipped && (
        <DefaultPanelHeader
          deleteToolTip="Delete All Peaks"
          onSettingClick={settingsPanelHandler}
          leftButtons={lefButtons}
        />
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
    </TablePanel>
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
