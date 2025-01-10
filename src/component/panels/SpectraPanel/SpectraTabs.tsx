import styled from '@emotion/styled';
import type { ActiveSpectrum, Spectrum } from 'nmr-load-save';
import { memo, useCallback, useMemo, useState } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import IsotopesViewer from '../../elements/IsotopesViewer.js';
import Tab from '../../elements/Tab/Tab.js';
import Tabs from '../../elements/Tab/Tabs.js';
import { useSetActiveSpectrumAction } from '../../hooks/useSetActiveSpectrumAction.js';
import groupByInfoKey from '../../utility/GroupByInfoKey.js';

import { SpectraTable } from './SpectraTable.js';
import SpectrumSetting from './base/setting/SpectrumSetting.js';

const Container = styled.div`
  height: calc(100% - 25px);

  tbody tr {
    height: 20px;
  }
`;
interface SpectraTabsInnerProps {
  spectra: Spectrum[];
  activeTab: string;
  activeSpectra: Record<string, ActiveSpectrum[] | null>;
}

function SpectraTabsInner({
  spectra,
  activeSpectra,
  activeTab,
}: SpectraTabsInnerProps) {
  const [selectedSpectrumData, setSelectedSpectrum] = useState(null);
  const [settingModalPosition, setSettingModalPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isSettingModalDisplayed, setIsSettingModalDisplayed] = useState(false);
  const dispatch = useDispatch();

  const spectraGroupByNucleus = useMemo(() => {
    if (!spectra) return [];
    const groupByNucleus = groupByInfoKey('nucleus');
    return groupByNucleus(spectra, true);
  }, [spectra]);
  const { setActiveSpectrum } = useSetActiveSpectrumAction();

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
    setActiveSpectrum(e, spectrum.id);
  }

  function mouseLeaveHandler() {
    setIsSettingModalDisplayed(false);
  }

  return (
    <Container>
      <Tabs key={activeTab} activeTab={activeTab} onClick={onTabChangeHandler}>
        {spectraGroupByNucleus &&
          Object.keys(spectraGroupByNucleus).map((nucleus) => (
            <Tab
              render={({ title }) => <IsotopesViewer value={title} />}
              title={nucleus}
              tabid={nucleus}
              key={nucleus}
            >
              <SpectraTable
                nucleus={nucleus}
                data={spectraGroupByNucleus[nucleus]}
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
    </Container>
  );
}

const MemoizedSpectra = memo(SpectraTabsInner);

export default function SpectraTabs() {
  const {
    data: spectra,
    view: {
      spectra: { activeTab, activeSpectra },
    },
  } = useChartData();

  return <MemoizedSpectra {...{ spectra, activeSpectra, activeTab }} />;
}
