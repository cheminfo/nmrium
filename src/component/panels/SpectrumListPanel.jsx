import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import { useDispatch } from '../context/DispatchContext';
import { useChartData } from '../context/ChartContext';
import {
  CHANGE_VISIBILITY,
  CHANGE_PEAKS_MARKERS_VISIBILITY,
  CHANGE_ACTIVE_SPECTRUM,
  CHANGE_SPECTRUM_COLOR,
  DELETE_SPECTRA,
} from '../reducer/Actions';
import { ConfirmationDialog } from '../elements/Modal';

import SpectrumListItem from './SpectrumListItem';
import ColorPicker from './ColorPicker';
import DefaultPanelHeader from './header/DefaultPanelHeader';

const styles = {
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
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
  const confirmRef = useRef();

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
    const visibleSpectra = data ? data.filter((d) => d.isVisible === true) : [];
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
    if (activated) {
      setActivated(null);
      dispatch({ type: DELETE_SPECTRA });
    } else {
      confirmRef.current.present();
    }
  }, [activated, dispatch]);

  const yesHandler = useCallback(() => {
    dispatch({ type: DELETE_SPECTRA });
  }, [dispatch]);

  return (
    <>
      <div style={styles.container}>
        <DefaultPanelHeader
          onDelete={handleDelete}
          counter={data && data.length}
          deleteToolTip="Delete All Spectrums"
        />
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
      <ConfirmationDialog onYes={yesHandler} ref={confirmRef} />
    </>
  );
};

export default SpectrumListPanel;
