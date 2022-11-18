/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useMemo, useEffect, memo } from 'react';

import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Tab from '../../elements/Tab/Tab';
import Tabs from '../../elements/Tab/Tabs';
import { ActiveSpectrum, useActiveSpectrum } from '../../reducer/Reducer';
import {
  CHANGE_PEAKS_MARKERS_VISIBILITY,
  SET_ACTIVE_TAB,
  CHANGE_VISIBILITY,
  CHANGE_ACTIVE_SPECTRUM,
} from '../../reducer/types/Types';
import groupByInfoKey from '../../utility/GroupByInfoKey';

import { SpectraTable } from './SpectraTable';
import SpectrumSetting from './base/setting/SpectrumSetting';

interface TabChangeProps {
  tab: string;
  data: Array<Datum1D | Datum2D>;
}

interface SpectrumsTabsProps {
  onTabChange: (data: TabChangeProps) => void;
}
interface SpectrumsTabsInnerProps extends SpectrumsTabsProps {
  data: Array<Datum1D | Datum2D>;
  activeTab: string;
  activeSpectrum: ActiveSpectrum | null;
}

function SpectrumsTabsInner({
  data,
  activeSpectrum,
  activeTab,
  onTabChange,
}: SpectrumsTabsInnerProps) {
  const [markersVisible, setMarkersVisible] = useState<Array<{ id: string }>>(
    [],
  );
  const [selectedSpectrumData, setSelectedSpectrum] = useState(null);
  const [settingModalPosition, setSettingModalPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isSettingModalDisplayed, setIsSettingModalDisplayed] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      const visibleMarkers: Array<{ id: string }> = [];
      for (const datum of data) {
        if (
          datum.info.dimension === 1 &&
          (datum as Datum1D).display.isPeaksMarkersVisible
        ) {
          visibleMarkers.push({ id: datum.id });
        }
      }
      setMarkersVisible(visibleMarkers);
    }
  }, [data, dispatch]);

  const spectrumsGroupByNucleus = useMemo(() => {
    if (!data) return [];
    const groupByNucleus = groupByInfoKey('nucleus');
    return groupByNucleus(data, true);
  }, [data]);

  // useEffect(() => {
  //   onTabChange({
  //     tab: activeTab,
  //     data: spectrumsGroupByNucleus[activeTab],
  //   });
  // }, [activeTab, onTabChange, spectrumsGroupByNucleus]);

  function handleChangeMarkersVisibility(d) {
    const currentIndex = markersVisible.findIndex((v) => v.id === d.id);
    const newChecked = [...markersVisible];
    if (currentIndex === -1) {
      newChecked.push({ id: d.id });
    } else {
      newChecked.splice(currentIndex, 1);
    }
    dispatch({ type: CHANGE_PEAKS_MARKERS_VISIBILITY, data: newChecked });
    // setMarkersVisible(newChecked);
  }

  function onTabChangeHandler(tab) {
    onTabChange({
      tab: tab.tabid,
      data: spectrumsGroupByNucleus[tab.tabid],
    });

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
      id: d.id,
      key,
      value: !d.display[key],
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
            <Tab tablabel={nucleus} tabid={nucleus} key={nucleus}>
              <SpectraTable
                nucleus={nucleus}
                data={spectrumsGroupByNucleus[nucleus]}
                markersVisible={markersVisible}
                activeSpectrum={activeSpectrum}
                onChangeVisibility={handleChangeVisibility}
                onChangeMarkersVisibility={handleChangeMarkersVisibility}
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

export default function SpectrumsTabs({ onTabChange }: SpectrumsTabsProps) {
  const {
    data,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const activeSpectrum = useActiveSpectrum();

  return (
    <MemoizedSpectra {...{ data, activeSpectrum, activeTab, onTabChange }} />
  );
}
