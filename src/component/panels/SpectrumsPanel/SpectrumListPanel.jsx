import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  Fragment,
  useRef,
} from 'react';
import { useAlert } from 'react-alert';
import {
  FaEye,
  FaEyeSlash,
  FaCreativeCommonsSamplingPlus,
} from 'react-icons/fa';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import ContextMenu from '../../elements/ContextMenu';
import { useModal } from '../../elements/Modal';
import { Tabs } from '../../elements/Tab';
import ToolTip from '../../elements/ToolTip/ToolTip';
import ConnectToContext from '../../hoc/ConnectToContext';
import {
  CHANGE_VISIBILITY,
  CHANGE_PEAKS_MARKERS_VISIBILITY,
  CHANGE_ACTIVE_SPECTRUM,
  CHANGE_SPECTRUM_COLOR,
  DELETE_SPECTRA,
  SET_ACTIVE_TAB,
  ADD_MISSING_PROJECTION,
} from '../../reducer/types/Types';
import { copyTextToClipboard } from '../../utility/Export';
import groupByInfoKey from '../../utility/GroupByInfoKey';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import ColorPicker from './ColorPicker';
import SpectrumListItem from './SpectrumListItem';

const styles = {
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
};

const SpectrumListPanel = memo(
  ({ data, activeSpectrum, activeTab: activeTabState }) => {
    const contextRef = useRef();

    const [activated, setActivated] = useState(null);
    const [markersVisible, setMarkersVisible] = useState([]);
    const [isColorPickerDisplayed, setIsColorPickerDisplayed] = useState(false);
    const [selectedSpectrumData, setSelectedSpectrum] = useState(null);
    const [colorPickerPosition, setColorPickerPosition] = useState(null);
    const [activeTabID, setActiveTabID] = useState(null);
    // const { data, activeSpectrum, activeTab: activeTabState } = useChartData();
    const modal = useModal();
    const alert = useAlert();
    const dispatch = useDispatch();
    const [spectrumsGroupByNucleus, setSpectrumsGroupByNucleus] = useState([]);

    const getActiveTabSpectrumsIDs = useCallback(() => {
      if (Array.isArray(spectrumsGroupByNucleus[activeTabID])) {
        const spectrumsIDs = spectrumsGroupByNucleus[activeTabID].map(
          (sp) => sp.id,
        );
        return spectrumsIDs;
      }
      return [];
    }, [activeTabID, spectrumsGroupByNucleus]);

    const handleChangeVisibility = useCallback(
      (d, key) => {
        // if (d.info.dimension === 2) {
        dispatch({
          type: CHANGE_VISIBILITY,
          id: d.id,
          key,
          value: !d.display[key],
        });
        // } else {
        // }
        // const currentIndex = visible.findIndex((v) => v.id === d.id);
        // const newChecked = [...visible];
        // if (currentIndex === -1) {
        //   newChecked.push({ id: d.id });
        // } else {
        //   newChecked.splice(currentIndex, 1);
        // }
        // dispatch({ type: CHANGE_VISIBILITY, data: newChecked });
        // setVisible(newChecked);
      },
      [dispatch],
    );

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
    const handleChangeActiveSpectrum = useCallback(
      (d) => {
        if (activated && activated.id === d.id) {
          dispatch({ type: CHANGE_ACTIVE_SPECTRUM, data: null });
          // setActivated(null);
        } else {
          dispatch({ type: CHANGE_ACTIVE_SPECTRUM, data: { id: d.id } });
          // setActivated({ id: d.id });
        }
      },
      [activated, dispatch],
    );
    const handleOnColorChanged = useCallback(
      (color, key) => {
        if (selectedSpectrumData !== null) {
          dispatch({
            type: CHANGE_SPECTRUM_COLOR,
            data: {
              id: selectedSpectrumData.id,
              color: `${color.hex}${Math.round(color.rgb.a * 255).toString(
                16,
              )}`,
              key,
            },
          });
        }
      },
      [dispatch, selectedSpectrumData],
    );

    const showSpectrumsByGroup = useCallback((activeTab) => {
      if (activeTab) {
        setActiveTabID(activeTab);
      }
    }, []);

    useEffect(() => {
      if (data) {
        const visibleMarkers = data
          ? data.filter((d) => d.display.isPeaksMarkersVisible === true)
          : [];

        setMarkersVisible(visibleMarkers);

        // if (data && data.length === 1 && activated == null) {
        //   handleChangeActiveSpectrum(data[0]);
        // }
      }
    }, [data, activated, activeTabID, dispatch]);

    useEffect(() => {
      setActivated(activeSpectrum);
    }, [activeSpectrum]);
    useEffect(() => {
      if (data) {
        const groupByNucleus = groupByInfoKey('nucleus');
        const spectrumsGroupsList = groupByNucleus(data);

        setSpectrumsGroupByNucleus(spectrumsGroupsList);
        if (!activeTabID) {
          const activeTab = Object.keys(spectrumsGroupsList)[0];
          showSpectrumsByGroup(activeTab);
          dispatch({ type: SET_ACTIVE_TAB, tab: activeTab });
        }
      }
    }, [
      data,
      handleChangeActiveSpectrum,
      activated,
      activeTabID,
      dispatch,
      showSpectrumsByGroup,
    ]);

    const handleOpenColorPicker = useCallback((selectedSpectrum, event) => {
      setColorPickerPosition({
        x: event.nativeEvent.clientX,
        y: event.nativeEvent.clientY,
      });
      setSelectedSpectrum(selectedSpectrum);
      setIsColorPickerDisplayed(true);
    }, []);

    const handleCloseColorPicker = useCallback(() => {
      setIsColorPickerDisplayed(false);
    }, []);

    const onTabChangeHandler = useCallback(
      (tab) => {
        // setActiveTabID(tab);
        // showSpectrumsByGroup(tab, spectrumsGroupByNucleus);

        dispatch({ type: SET_ACTIVE_TAB, tab: tab.label });
      },
      [dispatch],
    );

    const contextMenu = [
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
    ];

    const contextMenuHandler = useCallback(
      (e, rowData) => {
        e.preventDefault();
        contextRef.current.handleContextMenu(e, rowData);
      },
      [contextRef],
    );

    const SpectrumsTabs = useMemo(() => {
      return (
        <Fragment>
          <Tabs
            defaultTabID={
              activeTabState
                ? activeTabState
                : spectrumsGroupByNucleus &&
                  Object.keys(spectrumsGroupByNucleus)[0]
            }
            onClick={onTabChangeHandler}
          >
            {spectrumsGroupByNucleus &&
              Object.keys(spectrumsGroupByNucleus).map((group) => (
                <div label={group} key={group}>
                  {spectrumsGroupByNucleus[group] &&
                    spectrumsGroupByNucleus[group].map((d) => (
                      <SpectrumListItem
                        key={d.id}
                        activated={activated}
                        markersVisible={markersVisible}
                        data={d}
                        onChangeVisibility={handleChangeVisibility}
                        onChangeMarkersVisibility={
                          handleChangeMarkersVisibility
                        }
                        onChangeActiveSpectrum={handleChangeActiveSpectrum}
                        onOpenColorPicker={handleOpenColorPicker}
                        onContextMenu={(e) =>
                          d.info.dimension === 1
                            ? contextMenuHandler(e, d)
                            : null
                        }
                      />
                    ))}
                </div>
              ))}
          </Tabs>
          <ContextMenu ref={contextRef} context={contextMenu} />
        </Fragment>
      );
    }, [
      activeTabState,
      spectrumsGroupByNucleus,
      onTabChangeHandler,
      contextMenu,
      activated,
      markersVisible,
      handleChangeVisibility,
      handleChangeMarkersVisibility,
      handleChangeActiveSpectrum,
      handleOpenColorPicker,
      contextMenuHandler,
    ]);

    const yesHandler = useCallback(() => {
      const spectrumsPerTab = getActiveTabSpectrumsIDs();
      dispatch({ type: DELETE_SPECTRA, IDs: spectrumsPerTab });
    }, [dispatch, getActiveTabSpectrumsIDs]);

    const handleDelete = useCallback(() => {
      if (activated) {
        setActivated(null);
        dispatch({ type: DELETE_SPECTRA });
      } else {
        modal.showConfirmDialog('All records will be deleted,Are You sure?', {
          onYes: yesHandler,
        });
      }
    }, [activated, dispatch, modal, yesHandler]);

    const showAllSpectrumsHandler = useCallback(() => {
      const spectrumsPerTab = getActiveTabSpectrumsIDs().map((id) => {
        return id;
      });
      dispatch({ type: CHANGE_VISIBILITY, id: spectrumsPerTab });
      // setVisible(spectrumsPerTab);
    }, [dispatch, getActiveTabSpectrumsIDs]);

    const hideAllSpectrumsHandler = useCallback(() => {
      dispatch({ type: CHANGE_VISIBILITY, id: [] });
      // setVisible([]);
    }, [dispatch]);

    const addMissingProjectionHandler = useCallback(() => {
      function getMissingProjection(SpectrumsData) {
        let nucleus = activeTabState.split(',');
        nucleus = nucleus[0] === nucleus[1] ? [nucleus[0]] : nucleus;
        const missingNucleus = [];
        for (const n of nucleus) {
          const hasSpectrums = SpectrumsData.some((d) => d.info.nucleus === n);
          if (!hasSpectrums) {
            missingNucleus.push(n);
          }
        }
        return missingNucleus;
      }
      const missingNucleus = getMissingProjection(data);
      if (missingNucleus.length > 0) {
        dispatch({ type: ADD_MISSING_PROJECTION, nucleus: missingNucleus });
      } else {
        alert.error('Nothing to calculate');
      }
    }, [activeTabState, alert, data, dispatch]);

    return (
      <div style={styles.container}>
        <div style={{ overflow: 'auto' }}>
          <DefaultPanelHeader
            onDelete={handleDelete}
            counter={
              spectrumsGroupByNucleus[activeTabID] &&
              spectrumsGroupByNucleus[activeTabID].length
            }
            deleteToolTip="Delete All Spectrums"
          >
            <ToolTip title="Hide all spectrums" popupPlacement="right">
              <button
                style={styles.button}
                type="button"
                onClick={hideAllSpectrumsHandler}
              >
                <FaEyeSlash />
              </button>
            </ToolTip>
            <ToolTip title="Show all spectrums" popupPlacement="right">
              <button
                style={styles.button}
                type="button"
                onClick={showAllSpectrumsHandler}
              >
                <FaEye />
              </button>
            </ToolTip>
            {activeSpectrum &&
              activeTabState &&
              activeTabState.split(',').length > 1 && (
                <ToolTip title="Add missing projection" popupPlacement="right">
                  <button
                    style={styles.button}
                    type="button"
                    onClick={addMissingProjectionHandler}
                  >
                    <FaCreativeCommonsSamplingPlus />
                  </button>
                </ToolTip>
              )}
          </DefaultPanelHeader>
          {SpectrumsTabs}
          {isColorPickerDisplayed ? (
            <ColorPicker
              onMouseLeave={handleCloseColorPicker}
              selectedSpectrumData={selectedSpectrumData}
              colorPickerPosition={colorPickerPosition}
              onColorChanged={handleOnColorChanged}
            />
          ) : null}
        </div>
      </div>
    );
  },
);

export default ConnectToContext(SpectrumListPanel, useChartData);
