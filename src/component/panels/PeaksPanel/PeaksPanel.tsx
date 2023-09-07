/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrFt } from 'cheminfo-font';
import SvgPeaks from 'cheminfo-font/lib-react-cjs/lib-react-tsx/nmr/Peaks';
import { PeaksViewState, Spectrum1D } from 'nmr-load-save';
import { Info1D, Peak1D, Peaks } from 'nmr-processing';
import { useCallback, useMemo, useState, useRef, memo } from 'react';
import { FaThinkPeaks } from 'react-icons/fa';

import isInRange from '../../../data/utilities/isInRange';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { usePreferences } from '../../context/PreferencesContext';
import ActiveButton from '../../elements/ActiveButton';
import Button from '../../elements/Button';
import { useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import { useActiveSpectrumPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState';
import useCheckExperimentalFeature from '../../hooks/useCheckExperimentalFeature';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus';
import useSpectrum from '../../hooks/useSpectrum';
import { FilterType } from '../../utility/filterType';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader, {
  createFilterLabel,
} from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import PeaksPreferences from './PeaksPreferences';
import PeaksTable from './PeaksTable';
import { PeaksToggleActions } from './PeaksToggleActions';

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

function PeaksPanelInner({
  peaks,
  info,
  xDomain,
  activeTab,
  peaksViewState,
}: PeaksPanelInnerProps) {
  const [filterIsActive, setFilterIsActive] = useState(false);
  const [isFlipped, setFlipStatus] = useState(false);
  const format = useFormatNumberByNucleus(info.nucleus);

  const dispatch = useDispatch();
  const modal = useModal();
  const alert = useAlert();
  const isExperimental = useCheckExperimentalFeature();

  const settingRef = useRef<any>();

  const yesHandler = useCallback(() => {
    dispatch({ type: 'DELETE_PEAK', payload: {} });
  }, [dispatch]);

  const handleDeleteAll = useCallback(() => {
    modal.showConfirmDialog({
      message: 'All records will be deleted, Are You sure?',
      buttons: [{ text: 'Yes', handler: yesHandler }, { text: 'No' }],
    });
  }, [modal, yesHandler]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  const handleOnFilter = useCallback(() => {
    setFilterIsActive(!filterIsActive);
  }, [filterIsActive]);

  const filteredPeaks = useMemo<PeakRecord[]>(() => {
    if (peaks?.values) {
      const [from, to] = xDomain;
      const _peaks = filterIsActive
        ? peaks.values.filter((peak) => isInRange(peak.x, { from, to }))
        : peaks.values;

      return _peaks
        .map((peak) => {
          const { x, y, width, ...peakProperties } = peak;
          const value = Number(format(x));
          return {
            ...peakProperties,
            x,
            xHz: info?.originFrequency && value * info.originFrequency,
            y,
            width,
            isConstantlyHighlighted: isInRange(value, { from, to }),
          };
        })
        .sort((prev, next) => prev.x - next.x);
    }

    return [];
  }, [filterIsActive, format, info, peaks, xDomain]);

  const optimizePeaksHandler = () => {
    const [from, to] = xDomain;
    const filterPeaks = peaks.values.filter((peak) =>
      isInRange(peak.x, { from, to }),
    );
    if (filterPeaks.length <= 4) {
      dispatch({ type: 'OPTIMIZE_PEAKS', payload: { peaks: filterPeaks } });
    } else {
      alert.error('optimization can be done on no more than 4 peaks');
    }
  };

  function toggleViewProperty(key: keyof FilterType<PeaksViewState, boolean>) {
    dispatch({ type: 'TOGGLE_PEAKS_VIEW_PROPERTY', payload: { key } });
  }
  function toggleDisplayingMode() {
    dispatch({ type: 'TOGGLE_PEAKS_DISPLAYING_MODE' });
  }
  const counter = peaks?.values?.length || 0;

  const disbale = !peaks?.values || peaks.values.length === 0;
  return (
    <div
      css={[
        tablePanelStyle,
        isFlipped &&
          css`
            .table-container {
              table,
              th {
                position: relative !important;
              }
            }
          `,
      ]}
    >
      {!isFlipped && (
        <DefaultPanelHeader
          counter={counter}
          counterLabel={createFilterLabel(
            counter,
            filterIsActive && filteredPeaks?.length,
          )}
          onDelete={handleDeleteAll}
          deleteToolTip="Delete All Peaks"
          onFilter={handleOnFilter}
          filterToolTip={
            filterIsActive ? 'Show all peaks' : 'Hide peaks out of view'
          }
          showSettingButton
          onSettingClick={settingsPanelHandler}
        >
          {isExperimental && (
            <>
              <ActiveButton
                style={{ marginLeft: '2px', marginRight: '2px' }}
                popupTitle={
                  peaksViewState.showPeaksShapes
                    ? 'Hide peaks shapes'
                    : 'Show peaks shapes'
                }
                popupPlacement="right"
                onClick={() => toggleViewProperty('showPeaksShapes')}
                disabled={disbale}
                value={peaksViewState.showPeaksShapes}
              >
                <SvgPeaks style={{ pointerEvents: 'none', fontSize: '12px' }} />
              </ActiveButton>
              <ActiveButton
                style={{ marginLeft: '2px', marginRight: '2px' }}
                popupTitle={
                  peaksViewState.showPeaksSum
                    ? 'Hide peaks sum'
                    : 'Show peaks sum'
                }
                popupPlacement="right"
                onClick={() => toggleViewProperty('showPeaksSum')}
                disabled={disbale}
                value={peaksViewState.showPeaksSum}
              >
                <SvgNmrFt style={{ pointerEvents: 'none', fontSize: '12px' }} />
              </ActiveButton>

              <Button.BarButton
                onClick={optimizePeaksHandler}
                toolTip="Optimize peaks"
                tooltipOrientation="horizontal"
              >
                <FaThinkPeaks />
              </Button.BarButton>
            </>
          )}
          <PeaksToggleActions
            disbale={disbale}
            showPeaks={peaksViewState.showPeaks}
            onShowToggle={() => toggleViewProperty('showPeaks')}
            displayingMode={peaksViewState.displayingMode}
            onDisplayingModeToggle={toggleDisplayingMode}
          />
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
          <PeaksTable data={filteredPeaks} info={info} activeTab={activeTab} />
        ) : (
          <PeaksPreferences ref={settingRef} />
        )}
      </div>
    </div>
  );
}

const MemoizedPeaksPanel = memo(PeaksPanelInner);

const emptyData = { peaks: null, info: {} };

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
