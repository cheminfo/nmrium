/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ActiveSpectrum, Spectrum } from 'nmr-load-save';
import { useState, useMemo, memo, useCallback } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { getModifiers } from '../../context/KeyModifierContext';
import IsotopesViewer from '../../elements/IsotopesViewer';
import Tab from '../../elements/Tab/Tab';
import Tabs from '../../elements/Tab/Tabs';
import groupByInfoKey from '../../utility/GroupByInfoKey';

import { SpectraTable } from './SpectraTable';
import SpectrumSetting from './base/setting/SpectrumSetting';

interface SpectrumsTabsInnerProps {
  data: Spectrum[];
  activeTab: string;
  activeSpectra: Record<string, ActiveSpectrum[] | null>;
}

function SpectrumsTabsInner({
  data,
  activeSpectra,
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
    dispatch({ type: 'SET_ACTIVE_TAB', payload: { tab: tab.tabid } });
  }

  const openSettingHandler = useCallback((event, selectedSpectrum) => {
    event.stopPropagation();
    setSettingModalPosition({
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
    });
    setSelectedSpectrum(selectedSpectrum);
    setIsSettingModalDisplayed(true);
  }, []);

  const handleChangeVisibility = useCallback(
    (d, key) => {
      dispatch({
        type: 'CHANGE_SPECTRUM_VISIBILITY',
        payload: {
          id: d.id,
          key,
        },
      });
    },
    [dispatch],
  );

  function handleChangeActiveSpectrum(e, spectrum) {
    setTimeout(() => {
      const { ctrlKey, shiftKey } = getModifiers(e);
      const modifier = `shift[${shiftKey ? 'true' : 'false'}]_ctrl[${
        ctrlKey ? 'true' : 'false'
      }]`;
      dispatch({
        type: 'CHANGE_ACTIVE_SPECTRUM',
        payload: { modifier, id: spectrum.id },
      });
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
                activeSpectra={activeSpectra?.[nucleus] || null}
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
      spectra: { activeTab, activeSpectra },
    },
  } = useChartData();

  return <MemoizedSpectra {...{ data, activeSpectra, activeTab }} />;
}
