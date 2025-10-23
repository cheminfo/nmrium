import type { Info1D, Peak1D, Peaks } from '@zakodium/nmr-types';
import type { PeaksViewState, Spectrum1D } from '@zakodium/nmrium-core';
import { SvgNmrFt, SvgNmrPeaks, SvgNmrPeaksTopLabels } from 'cheminfo-font';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { FaThinkPeaks } from 'react-icons/fa';

import isInRange from '../../../data/utilities/isInRange.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import { useAlert } from '../../elements/Alert.js';
import { useActiveSpectrumPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState.js';
import useCheckExperimentalFeature from '../../hooks/useCheckExperimentalFeature.js';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { booleanToString } from '../../utility/booleanToString.js';
import type { FilterType } from '../../utility/filterType.js';
import { TablePanel } from '../extra/BasicPanelStyle.js';
import type { SettingsRef } from '../extra/utilities/settingImperativeHandle.js';
import type { ToolbarItemProps } from '../header/DefaultPanelHeader.js';
import DefaultPanelHeader from '../header/DefaultPanelHeader.js';
import PreferencesHeader from '../header/PreferencesHeader.js';

import PeaksPreferences from './PeaksPreferences.js';
import PeaksTable from './PeaksTable.js';

interface PeaksPanelInnerProps {
  peaks: Peaks;
  xDomain: number[];
  activeTab: string;
  info: Info1D;
  peaksViewState: PeaksViewState;
}

export interface PeakRecord extends Peak1D {
  xHz: number;
  isConstantlyHighlighted: boolean;
}

function PeaksPanelInner(props: PeaksPanelInnerProps) {
  const { peaks, info, xDomain, activeTab, peaksViewState } = props;
  const [filterIsActive, setFilterIsActive] = useState(false);
  const [isFlipped, setFlipStatus] = useState(false);
  const format = useFormatNumberByNucleus(info.nucleus);

  const dispatch = useDispatch();
  const alert = useAlert();
  const toaster = useToaster();
  const isExperimental = useCheckExperimentalFeature();

  const settingRef = useRef<SettingsRef | null>(null);

  const yesHandler = useCallback(() => {
    dispatch({ type: 'DELETE_PEAK', payload: {} });
  }, [dispatch]);

  const handleDeleteAll = useCallback(() => {
    alert.showAlert({
      message: 'All records will be deleted, Are You sure?',
      buttons: [
        { text: 'Yes', onClick: yesHandler, intent: 'danger' },
        { text: 'No' },
      ],
    });
  }, [alert, yesHandler]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  async function saveSettingHandler() {
    const isSettingsValid = await settingRef.current?.saveSetting();
    if (isSettingsValid) {
      setFlipStatus(false);
    }
  }

  const handleOnFilter = useCallback(() => {
    setFilterIsActive(!filterIsActive);
  }, [filterIsActive]);

  const filteredPeaks = useMemo<PeakRecord[]>(() => {
    const [from, to] = xDomain;
    const _peaks = filterIsActive
      ? peaks.values.filter((peak) => isInRange(peak.x, { from, to }))
      : peaks.values;

    const mappedPeaks = _peaks.map((peak) => {
      const { x, y, width, ...peakProperties } = peak;
      const value = Number(format(x));
      return {
        ...peakProperties,
        x,
        xHz: info.originFrequency && value * info.originFrequency,
        y,
        width,
        isConstantlyHighlighted: isInRange(value, { from, to }),
      };
    });
    mappedPeaks.sort((prev, next) => prev.x - next.x);
    return mappedPeaks;
  }, [filterIsActive, format, info, peaks, xDomain]);

  const optimizePeaksHandler = () => {
    const [from, to] = xDomain;
    const filterPeaks = peaks.values.filter((peak) =>
      isInRange(peak.x, { from, to }),
    );
    if (filterPeaks.length <= 4) {
      dispatch({ type: 'OPTIMIZE_PEAKS', payload: { peaks: filterPeaks } });
    } else {
      toaster.show({
        message: 'optimization can be done on no more than 4 peaks',
        intent: 'danger',
      });
    }
  };

  function toggleViewProperty(key: keyof FilterType<PeaksViewState, boolean>) {
    dispatch({ type: 'TOGGLE_PEAKS_VIEW_PROPERTY', payload: { key } });
  }
  function toggleDisplayingMode() {
    dispatch({ type: 'TOGGLE_PEAKS_DISPLAYING_MODE' });
  }
  const total = peaks.values.length;
  const disabled = total === 0;
  const { showPeaks, displayingMode, showPeaksShapes, showPeaksSum } =
    peaksViewState;

  const leftButtons: ToolbarItemProps[] = [
    {
      disabled,
      icon: <SvgNmrPeaks />,
      tooltip: `${booleanToString(!showPeaks)} peaks`,
      onClick: () => toggleViewProperty('showPeaks'),
      active: showPeaks,
    },
    {
      disabled,
      icon: <SvgNmrPeaksTopLabels />,
      tooltip:
        displayingMode === 'spread' ? 'Top of the peak' : 'Top of the spectrum',
      onClick: toggleDisplayingMode,
      active: displayingMode === 'spread',
    },
  ];

  if (isExperimental) {
    leftButtons.unshift(
      {
        disabled,
        icon: <SvgNmrPeaks />,
        tooltip: `${booleanToString(!showPeaksShapes)} peaks shapes`,
        onClick: () => toggleViewProperty('showPeaksShapes'),
        active: showPeaksShapes,
      },
      {
        disabled,
        icon: <SvgNmrFt />,
        tooltip: `${booleanToString(!showPeaksSum)} peaks sum`,
        onClick: () => toggleViewProperty('showPeaksSum'),
        active: showPeaksSum,
      },
      {
        icon: <FaThinkPeaks />,
        tooltip: 'Optimize peaks',
        onClick: optimizePeaksHandler,
      },
    );
  }
  return (
    <TablePanel isFlipped={isFlipped}>
      {!isFlipped && (
        <DefaultPanelHeader
          total={total}
          counter={filteredPeaks.length}
          onDelete={handleDeleteAll}
          deleteToolTip="Delete All Peaks"
          onFilter={handleOnFilter}
          filterToolTip={
            filterIsActive ? 'Show all peaks' : 'Hide peaks out of view'
          }
          onSettingClick={settingsPanelHandler}
          leftButtons={leftButtons}
        />
      )}
      {isFlipped && (
        <PreferencesHeader
          onSave={saveSettingHandler}
          onClose={settingsPanelHandler}
        />
      )}
      <div className="inner-container">
        {!isFlipped ? (
          <PeaksTable data={filteredPeaks} info={info} activeTab={activeTab} />
        ) : (
          <PeaksPreferences ref={settingRef} />
        )}
      </div>
    </TablePanel>
  );
}

const MemoizedPeaksPanel = memo(PeaksPanelInner);

const emptyData = { peaks: { values: [] }, info: {} };

export default function PeaksPanel() {
  const {
    xDomain,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const { peaks, info } = useSpectrum(emptyData) as Spectrum1D;
  const preferences = usePreferences();
  const peaksViewState = useActiveSpectrumPeaksViewState();

  return (
    <MemoizedPeaksPanel
      {...{ peaks, info, xDomain, activeTab, preferences, peaksViewState }}
    />
  );
}
