import {
  useCallback,
  useState,
  useMemo,
  useRef,
  Fragment,
  useEffect,
  memo,
} from 'react';

import { Datum1D } from '../../../data/data1d/Spectrum1D';
import { Datum2D } from '../../../data/data2d/Spectrum2D';
import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import ContextMenu from '../../elements/ContextMenu';
import Tab from '../../elements/Tab/Tab';
import Tabs from '../../elements/Tab/Tabs';
import { useAlert } from '../../elements/popup/Alert';
import { ActiveSpectrum } from '../../reducer/Reducer';
import {
  CHANGE_PEAKS_MARKERS_VISIBILITY,
  SET_ACTIVE_TAB,
  CHANGE_VISIBILITY,
  CHANGE_ACTIVE_SPECTRUM,
  DELETE_SPECTRA,
} from '../../reducer/types/Types';
import { copyTextToClipboard } from '../../utility/Export';
import GroupByInfoKey from '../../utility/GroupByInfoKey';

import SpectrumListItem from './SpectrumListItem';
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
  const contextRef = useRef<any>();
  const [markersVisible, setMarkersVisible] = useState<Array<{ id: string }>>(
    [],
  );
  const [selectedSpectrumData, setSelectedSpectrum] = useState(null);
  const [settingModalPosition, setSettingModalPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isSettingModalDisplayed, setIsSettingModalDisplayed] = useState(false);

  const alert = useAlert();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      const visibleMarkers = data.reduce((acc: any, datum) => {
        if (
          datum.info.dimension === 1 &&
          (datum as Datum1D).display.isPeaksMarkersVisible === true
        ) {
          acc.push({ id: datum.id });
        }
        return acc;
      }, []);

      setMarkersVisible(visibleMarkers);
    }
  }, [data, dispatch]);

  const spectrumsGroupByNucleus = useMemo(() => {
    if (!data) return [];
    const groupByNucleus = GroupByInfoKey('nucleus');
    return groupByNucleus(data, true);
  }, [data]);

  useEffect(() => {
    onTabChange({
      tab: activeTab,
      data: spectrumsGroupByNucleus[activeTab],
    });
  }, [activeTab, onTabChange, spectrumsGroupByNucleus]);

  const handleChangeMarkersVisibility = useCallback(
    (d) => {
      const currentIndex = markersVisible.findIndex((v) => v.id === d.id);
      const newChecked = [...markersVisible];
      if (currentIndex === -1) {
        newChecked.push({ id: d.id });
      } else {
        newChecked.splice(currentIndex, 1);
      }
      dispatch({ type: CHANGE_PEAKS_MARKERS_VISIBILITY, data: newChecked });
      setMarkersVisible(newChecked);
    },
    [dispatch, markersVisible],
  );

  const onTabChangeHandler = useCallback(
    (tab) => {
      onTabChange({
        tab: tab.tabid,
        data: spectrumsGroupByNucleus[tab.tabid],
      });

      dispatch({ type: SET_ACTIVE_TAB, tab: tab.tabid });
    },
    [dispatch, onTabChange, spectrumsGroupByNucleus],
  );

  const contextMenu = useMemo(
    () => [
      {
        label: 'Copy to Clipboard',
        onClick: async (spectrumData) => {
          const { x, y, info } = spectrumData;
          const success = await copyTextToClipboard(
            JSON.stringify({ x, y, info }, undefined, 2),
          );

          if (success) {
            alert.success('Data copied to clipboard');
          } else {
            alert.error('Copy to clipboard failed');
          }
        },
      },
      {
        label: 'Delete',
        onClick: (spectrumData) => {
          setTimeout(() => {
            dispatch({ type: DELETE_SPECTRA, id: spectrumData.id });
          }, 0);
        },
      },
    ],
    [alert, dispatch],
  );

  const contextMenuHandler = useCallback(
    (e, rowData) => {
      if (!checkModifierKeyActivated(e)) {
        e.preventDefault();
        contextRef.current.handleContextMenu(e, rowData);
      }
    },
    [contextRef],
  );

  const openSettingHandler = useCallback((selectedSpectrum, event) => {
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
        type: CHANGE_VISIBILITY,
        id: d.id,
        key,
        value: !d.display[key],
      });
    },
    [dispatch],
  );

  const handleChangeActiveSpectrum = useCallback(
    (d) => {
      setTimeout(() => {
        if (activeSpectrum && activeSpectrum.id === d.id) {
          dispatch({ type: CHANGE_ACTIVE_SPECTRUM, data: null });
        } else {
          dispatch({ type: CHANGE_ACTIVE_SPECTRUM, data: { id: d.id } });
        }
      }, 0);
    },
    [activeSpectrum, dispatch],
  );

  const mouseLeaveHandler = useCallback(() => {
    setIsSettingModalDisplayed(false);
  }, []);

  return (
    <Fragment>
      <Tabs activeTab={activeTab} onClick={onTabChangeHandler}>
        {spectrumsGroupByNucleus &&
          Object.keys(spectrumsGroupByNucleus).map((group) => (
            <Tab
              tablabel={group}
              tabid={group}
              key={group}
              tabstyles={{ overflow: 'auto', height: '100%' }}
            >
              {spectrumsGroupByNucleus[group]?.map((d) => (
                <SpectrumListItem
                  key={d.id}
                  activeSpectrum={activeSpectrum}
                  markersVisible={markersVisible}
                  data={d}
                  onChangeVisibility={handleChangeVisibility}
                  onChangeMarkersVisibility={handleChangeMarkersVisibility}
                  onChangeActiveSpectrum={handleChangeActiveSpectrum}
                  onOpenSettingModal={openSettingHandler}
                  onContextMenu={(e) => contextMenuHandler(e, d)}
                />
              ))}
            </Tab>
          ))}
      </Tabs>
      <ContextMenu ref={contextRef} context={contextMenu} />

      {isSettingModalDisplayed ? (
        <SpectrumSetting
          onClose={mouseLeaveHandler}
          data={selectedSpectrumData}
          position={settingModalPosition}
        />
      ) : null}
    </Fragment>
  );
}

const MemoizedSpectra = memo(SpectrumsTabsInner);

export default function SpectrumsTabs({ onTabChange }: SpectrumsTabsProps) {
  const { data, activeSpectrum, activeTab } = useChartData();

  return (
    <MemoizedSpectra {...{ data, activeSpectrum, activeTab, onTabChange }} />
  );
}
