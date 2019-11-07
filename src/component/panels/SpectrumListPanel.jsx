import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { useDispatch } from '../context/DispatchContext';
import { useChartData } from '../context/ChartContext';
import {
  CHANGE_VISIBILITY,
  CHANGE_PEAKS_MARKERS_VISIBILITY,
  CHANGE_ACTIVE_SPECTRUM,
  CHANGE_SPECTRUM_COLOR,
  DELETE_SPECTRA,
} from '../reducer/Actions';
import ToolTip from '../elements/ToolTip/ToolTip';

import SpectrumListItem from './SpectrumListItem';
import ColorPicker from './ColorPicker';

const styles = {
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    height: '100%',
  },

  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
  },
  counterLabel: {
    margin: 0,
    textAlign: 'right',
    width: '100%',
    lineHeight: '22px',
    padding: '0px 10px',
  },
};

const SpectrumListPanel = () => {
  const [activated, setActivated] = useState(null);
  const [visible, setVisible] = useState([]);
  const [markersVisible, setMarkersVisible] = useState([]);
  const [isColorPickerDisplayed, setIsColorPickerDisplayed] = useState(false);
  const [selectedSpectrumData, setSelectedSpectrum] = useState(null);
  const [colorPickerPosition, setColorPickerPosition] = useState(null);
  const { data } = useChartData();

  const dispatch = useDispatch();
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
    const visibleSpectra = data
      ? data.filter((d) => d.isVisible === true)
      : [];
    const visibleMarkers = data
      ? data.filter((d) => d.isPeaksMarkersVisible === true)
      : [];

    setVisible(visibleSpectra);
    setMarkersVisible(visibleMarkers);

    if (data && data.length === 1 && activated == null) {
      handleChangeActiveSpectrum(data[0]);
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
      data &&
      data.map((d) => (
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
      ))
    );
  }, [
    data,
    handleChangeActiveSpectrum,
    handleChangeMarkersVisibility,
    handleChangeVisibility,
    handleOpenColorPicker,
    activated,
    markersVisible,
    visible,
  ]);

  const handleDelete = useCallback(() => {
    dispatch({ type: DELETE_SPECTRA });
  }, [dispatch]);

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <ToolTip title="Delete Spectrum" poupPlacement="left">
          <button style={styles.button} type="button" onClick={handleDelete}>
            <FaRegTrashAlt />
          </button>
        </ToolTip>
        <p style={styles.counterLabel}>[ {data && data.length} ]</p>
      </div>
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
