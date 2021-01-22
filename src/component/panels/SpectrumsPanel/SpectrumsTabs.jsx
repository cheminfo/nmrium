import {
  useCallback,
  useState,
  useMemo,
  useRef,
  Fragment,
  useEffect,
} from 'react';

import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated';
import { useDispatch } from '../../context/DispatchContext';
import ContextMenu from '../../elements/ContextMenu';
import { Tabs } from '../../elements/Tab';
import { useAlert } from '../../elements/popup/Alert';
import SpectraWraper from '../../hoc/SpectraWraper';
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

function SpectrumsTabs({ data, activeSpectrum, activeTab, onTabChange }) {
  const contextRef = useRef();
  const [markersVisible, setMarkersVisible] = useState([]);
  const [selectedSpectrumData, setSelectedSpectrum] = useState(null);
  const [settingModalPosition, setSettingModalPosition] = useState(null);
  const [isSettingModalDisplayed, setIsSettingModalDisplayed] = useState(false);

  const alert = useAlert();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      const visibleMarkers = data
        ? data.filter((d) => d.display.isPeaksMarkersVisible === true)
        : [];

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
        onClick: (spectrumData) => {
          const { x, y, info } = spectrumData;
          const success = copyTextToClipboard(
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
      <Tabs defaultTabID={activeTab} onClick={onTabChangeHandler}>
        {spectrumsGroupByNucleus &&
          Object.keys(spectrumsGroupByNucleus).map((group) => (
            <div
              tablabel={group}
              tabid={group}
              key={group}
              style={{ overflow: 'auto', height: '100%' }}
            >
              {spectrumsGroupByNucleus[group] &&
                spectrumsGroupByNucleus[group].map((d) => (
                  <SpectrumListItem
                    key={d.id}
                    activeSpectrum={activeSpectrum}
                    // activated={
                    //   activeSpectrum && activeSpectrum.id === d.id
                    //     ? true
                    //     : false
                    // }
                    markersVisible={markersVisible}
                    data={d}
                    onChangeVisibility={handleChangeVisibility}
                    onChangeMarkersVisibility={handleChangeMarkersVisibility}
                    onChangeActiveSpectrum={handleChangeActiveSpectrum}
                    onOpenSettingModal={openSettingHandler}
                    onContextMenu={(e) => contextMenuHandler(e, d)}
                  />
                ))}
            </div>
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

export default SpectraWraper(SpectrumsTabs);
