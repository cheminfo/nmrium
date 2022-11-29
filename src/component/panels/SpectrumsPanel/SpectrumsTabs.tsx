/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useMemo, memo } from 'react';

import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import IsotopesViewer from '../../elements/IsotopesViewer';
import Tab from '../../elements/Tab/Tab';
import Tabs from '../../elements/Tab/Tabs';
import { ActiveSpectrum, useActiveSpectrum } from '../../reducer/Reducer';
import {
  SET_ACTIVE_TAB,
  CHANGE_VISIBILITY,
  CHANGE_ACTIVE_SPECTRUM,
} from '../../reducer/types/Types';
import groupByInfoKey from '../../utility/GroupByInfoKey';

import { SpectraTable } from './SpectraTable';
import SpectrumSetting from './base/setting/SpectrumSetting';

interface SpectrumsTabsInnerProps {
  data: Array<Datum1D | Datum2D>;
  activeTab: string;
  activeSpectrum: ActiveSpectrum | null;
}

function SpectrumsTabsInner({
  data,
  activeSpectrum,
  activeTab,
}: SpectrumsTabsInnerProps) {
  const [selectedSpectrumData, setSelectedSpectrum] = useState(null);
  const [settingModalPosition, setSettingModalPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isSettingModalDisplayed, setIsSettingModalDisplayed] = useState(false);
  const dispatch = useDispatch();

  const spectrumsGroupByNucleus = useMemo(() => {
    if (!data) return [];
    const groupByNucleus = groupByInfoKey('nucleus');
    return groupByNucleus(data, true);
  }, [data]);

  function onTabChangeHandler(tab) {
    dispatch({ type: SET_ACTIVE_TAB, tab: tab.tabid });
  }

  function openSettingHandler(event, selectedSpectrum) {
    event.stopPropagation();
    setSettingModalPosition({
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
    });
    setSelectedSpectrum(selectedSpectrum);
    setIsSettingModalDisplayed(true);
  }

  function handleChangeVisibility(d, key) {
    dispatch({
      type: CHANGE_VISIBILITY,
      payload: {
        id: d.id,
        key,
      },
    });
  }

  function handleChangeActiveSpectrum(_, spectrum) {
    setTimeout(() => {
      if (activeSpectrum && activeSpectrum.id === spectrum.id) {
        dispatch({ type: CHANGE_ACTIVE_SPECTRUM, data: null });
      } else {
        dispatch({ type: CHANGE_ACTIVE_SPECTRUM, data: { id: spectrum.id } });
      }
    }, 0);
  }

  function mouseLeaveHandler() {
    setIsSettingModalDisplayed(false);
  }

  return (
    <div
      style={{ height: 'calc(100% - 25px)' }}
      css={css`
        tbody tr {
          height: 20px;
        }
      `}
    >
      <Tabs key={activeTab} activeTab={activeTab} onClick={onTabChangeHandler}>
        {spectrumsGroupByNucleus &&
          Object.keys(spectrumsGroupByNucleus).map((nucleus) => (
            <Tab
              render={({ title }) => <IsotopesViewer value={title} />}
              title={nucleus}
              tabid={nucleus}
              key={nucleus}
            >
              <SpectraTable
                nucleus={nucleus}
                data={spectrumsGroupByNucleus[nucleus]}
                activeSpectrum={activeSpectrum}
                onChangeVisibility={handleChangeVisibility}
                onChangeActiveSpectrum={handleChangeActiveSpectrum}
                onOpenSettingModal={openSettingHandler}
              />
            </Tab>
          ))}
      </Tabs>

      {isSettingModalDisplayed ? (
        <SpectrumSetting
          onClose={mouseLeaveHandler}
          data={selectedSpectrumData}
          position={settingModalPosition}
        />
      ) : null}
    </div>
  );
}

const MemoizedSpectra = memo(SpectrumsTabsInner);

export default function SpectrumsTabs() {
  const {
    data,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const activeSpectrum = useActiveSpectrum();

  return <MemoizedSpectra {...{ data, activeSpectrum, activeTab }} />;
}
