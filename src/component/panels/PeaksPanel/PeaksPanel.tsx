/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useMemo, useState, useRef, memo } from 'react';

import { Datum1D, Info1D, Peaks } from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useModal } from '../../elements/popup/Modal';
import useSpectrum from '../../hooks/useSpectrum';
import { DELETE_PEAK_NOTATION } from '../../reducer/types/Types';
import { useFormatNumberByNucleus } from '../../utility/FormatNumber';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import PeaksPreferences from './PeaksPreferences';
import PeaksTable from './PeaksTable';

interface PeaksPanelInnerProps {
  peaks: Peaks;
  xDomain: number[];
  activeTab: string;
  info: Info1D;
}

function PeaksPanelInner({
  peaks,
  info,
  xDomain,
  activeTab,
}: PeaksPanelInnerProps) {
  const [filterIsActive, setFilterIsActive] = useState(false);
  const [isFlipped, setFlipStatus] = useState(false);
  const format = useFormatNumberByNucleus(info.nucleus);

  const dispatch = useDispatch();
  const modal = useModal();

  const settingRef = useRef<any>();

  const yesHandler = useCallback(() => {
    dispatch({ type: DELETE_PEAK_NOTATION, data: null });
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

  const filteredPeaks = useMemo(() => {
    function isInRange(value) {
      const factor = 100000;
      return (
        value * factor >= xDomain[0] * factor &&
        value * factor <= xDomain[1] * factor
      );
    }
    if (peaks?.values) {
      const _peaks = filterIsActive
        ? peaks.values.filter((peak) => isInRange(peak.x))
        : peaks.values;

      return _peaks
        .map((peak) => {
          const value = Number(format(peak.x));
          return {
            value: value,
            valueHz: info?.originFrequency
              ? Number(value) * info.originFrequency
              : '',
            id: peak.id,
            intensity: peak.y,
            peakWidth: peak.width ? peak.width : '',
            isConstantlyHighlighted: isInRange(value),
          };
        })
        .sort((prev, next) => prev.value - next.value);
    }

    return [];
  }, [filterIsActive, format, info, peaks, xDomain]);

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
          counter={peaks?.values?.length}
          onDelete={handleDeleteAll}
          deleteToolTip="Delete All Peaks"
          onFilter={handleOnFilter}
          filterToolTip={
            filterIsActive ? 'Show all peaks' : 'Hide peaks out of view'
          }
          filterIsActive={filterIsActive}
          counterFiltered={filteredPeaks.length}
          showSettingButton
          onSettingClick={settingsPanelHandler}
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
          <PeaksTable data={filteredPeaks} activeTab={activeTab} />
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
  const { xDomain, activeTab } = useChartData();
  const { peaks, info } = useSpectrum(emptyData) as Datum1D;
  const preferences = usePreferences();

  return (
    <MemoizedPeaksPanel {...{ peaks, info, xDomain, activeTab, preferences }} />
  );
}
