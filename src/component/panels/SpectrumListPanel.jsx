import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { useDispatch } from '../context/DispatchContext';
import { useChartData } from '../context/ChartContext';
import {
  CHANGE_VISIBILITY,
  CHANGE_PEAKS_MARKERS_VISIBILITY,
  CHANGE_ACTIVE_SPECTRUM,
  CHANGE_SPECTRUM_COLOR,
  DELETE_SPECTRA,
} from '../reducer/Actions';
import { useModal } from '../elements/Modal';
import ToolTip from '../elements/ToolTip/ToolTip';
import { Tabs } from '../elements/Tab';

import SpectrumListItem from './SpectrumListItem';
import ColorPicker from './ColorPicker';
import DefaultPanelHeader from './header/DefaultPanelHeader';

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

const groupBy = (key) => (array) =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj.info[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

const SpectrumListPanel = () => {
  const [activated, setActivated] = useState(null);
  const [visible, setVisible] = useState([]);
  const [markersVisible, setMarkersVisible] = useState([]);
  const [isColorPickerDisplayed, setIsColorPickerDisplayed] = useState(false);
  const [selectedSpectrumData, setSelectedSpectrum] = useState(null);
  const [colorPickerPosition, setColorPickerPosition] = useState(null);
  const { data } = useChartData();
  const modal = useModal();
  const dispatch = useDispatch();
  const [spectrumsGroupByNucleus, setSpectrumsGroupByNucleus] = useState([]);

  const handleChangeVisibility = useCallback(
    (d) => {
      const currentIndex = visible.findIndex((v) => v.id === d.id);
      const newChecked = [...visible];
      if (currentIndex === -1) {
        newChecked.push({ id: d.id });
      } else {
        newChecked.splice(currentIndex, 1);
      }
      dispatch({ type: CHANGE_VISIBILITY, data: newChecked });
      setVisible(newChecked);
    },
    [dispatch, visible],
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
        setActivated(null);
      } else {
        dispatch({ type: CHANGE_ACTIVE_SPECTRUM, data: { id: d.id } });
        setActivated({ id: d.id });
      }
    },
    [activated, dispatch],
  );
  const handleOnColorChanged = useCallback(
    (color) => {
      if (selectedSpectrumData !== null) {
        dispatch({
          type: CHANGE_SPECTRUM_COLOR,
          data: { id: selectedSpectrumData.id, color: color.hex },
        });
      }
    },
    [dispatch, selectedSpectrumData],
  );

  useEffect(() => {
    const visibleSpectra = data ? data.filter((d) => d.isVisible === true) : [];
    const visibleMarkers = data
      ? data.filter((d) => d.isPeaksMarkersVisible === true)
      : [];

    setVisible(visibleSpectra);
    setMarkersVisible(visibleMarkers);

    if (data && data.length === 1 && activated == null) {
      handleChangeActiveSpectrum(data[0]);
    }

    if (data) {
      const groupByNucleus = groupBy('nucleus');
      setSpectrumsGroupByNucleus(groupByNucleus(data));
    }
  }, [data, handleChangeActiveSpectrum, activated]);

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

  const ListItems = useMemo(() => {
    return (
      <Tabs>
        {spectrumsGroupByNucleus &&
          Object.keys(spectrumsGroupByNucleus).map((group) => (
            <div label={group} key={group}>
              {spectrumsGroupByNucleus[group] &&
                spectrumsGroupByNucleus[group].map((d) => (
                  <SpectrumListItem
                    key={d.id}
                    visible={visible}
                    activated={activated}
                    markersVisible={markersVisible}
                    data={d}
                    onChangeVisibility={handleChangeVisibility}
                    onChangeMarkersVisibility={handleChangeMarkersVisibility}
                    onChangeActiveSpectrum={handleChangeActiveSpectrum}
                    onOpenColorPicker={handleOpenColorPicker}
                  />
                ))}
            </div>
          ))}
      </Tabs>
    );
  }, [
    spectrumsGroupByNucleus,
    visible,
    activated,
    markersVisible,
    handleChangeVisibility,
    handleChangeMarkersVisibility,
    handleChangeActiveSpectrum,
    handleOpenColorPicker,
  ]);

  const yesHandler = useCallback(() => {
    dispatch({ type: DELETE_SPECTRA });
  }, [dispatch]);

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
    const allSpectrums = data.map((spectrum) => {
      return {
        id: spectrum.id,
      };
    });
    dispatch({ type: CHANGE_VISIBILITY, data: allSpectrums });
    setVisible(allSpectrums);
  }, [data, dispatch]);
  const hideAllSpectrumsHandler = useCallback(() => {
    dispatch({ type: CHANGE_VISIBILITY, data: [] });
    setVisible([]);
  }, [dispatch]);

  return (
    <div style={styles.container}>
      <DefaultPanelHeader
        onDelete={handleDelete}
        counter={data && data.length}
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
      </DefaultPanelHeader>
      <div style={{ overflow: 'auto' }}>
        {ListItems}
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
};

export default SpectrumListPanel;
