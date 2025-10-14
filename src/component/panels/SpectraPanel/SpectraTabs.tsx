import styled from '@emotion/styled';
import type { ActiveSpectrum, Spectrum } from '@zakodium/nmrium-core';
import { memo, useCallback, useMemo } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import IsotopesViewer from '../../elements/IsotopesViewer.js';
import Tab from '../../elements/Tab/Tab.js';
import Tabs from '../../elements/Tab/Tabs.js';
import { useSetActiveSpectrumAction } from '../../hooks/useSetActiveSpectrumAction.js';
import groupByInfoKey from '../../utility/groupByInfoKey.js';

import { SpectraTable } from './SpectraTable.js';

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
  const dispatch = useDispatch();

  const spectraGroupByNucleus = useMemo(() => {
    const groupByNucleus = groupByInfoKey('nucleus');
    return groupByNucleus(spectra, true);
  }, [spectra]);
  const { setActiveSpectrum } = useSetActiveSpectrumAction();

  function onTabChangeHandler(tab: any) {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: { tab: tab.tabid } });
  }

  const handleChangeVisibility = useCallback(
    (d: any, key: any) => {
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

  function handleChangeActiveSpectrum(e: any, spectrum: any) {
    setActiveSpectrum(e, spectrum.id);
  }

  // function mouseLeaveHandler() {
  //   setIsSettingModalDisplayed(false);
  // }

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
              />
            </Tab>
          ))}
      </Tabs>
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
