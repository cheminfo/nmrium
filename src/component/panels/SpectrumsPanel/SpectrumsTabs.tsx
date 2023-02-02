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
import { ActiveSpectrum } from '../../reducer/Reducer';
import {
  SET_ACTIVE_TAB,
  CHANGE_VISIBILITY,
  CHANGE_ACTIVE_SPECTRUM,
} from '../../reducer/types/Types';
import groupByInfoKey from '../../utility/GroupByInfoKey';

import { SpectraTable } from './SpectraTable';
import SpectrumSetting from './base/setting/SpectrumSetting';
import { useKbs } from 'react-kbs';

interface SpectrumsTabsInnerProps {
  data: Array<Datum1D | Datum2D>;
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

  function handleChangeActiveSpectrum(e, spectrum) {
    setTimeout(() => {
      const modifier = `shift[${e.shiftKey ? 'true' : 'false'}]_ctrl[${
        e.ctrlKey ? 'true' : 'false'
      }]`;
      dispatch({
        type: CHANGE_ACTIVE_SPECTRUM,
        payload: { modifier, id: spectrum.id },
      });
    }, 0);
  }

  function mouseLeaveHandler() {
    setIsSettingModalDisplayed(false);
  }

  const shortcutProps = useKbs([
    {
      shortcut: [{ ctrl: true, key: 'a' }],
      handler: (e) => {
        e.stopPropagation();
        dispatch({
          type: CHANGE_ACTIVE_SPECTRUM,
          payload: {},
        });
      },
    },
  ]);

  return (
    <div
      style={{ height: 'calc(100% - 25px)' }}
      css={css`
        tbody tr {
          height: 20px;
        }
      `}
      {...shortcutProps}
      onMouseEnter={(e) => e.currentTarget.focus()}
      onMouseLeave={(e) => e.currentTarget.blur()}
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
