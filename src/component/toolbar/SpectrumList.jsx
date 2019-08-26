import React, {
  useEffect,
  useState,
  Fragment,
  useCallback,
  useMemo,
  memo,
} from 'react';
import propTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { FaEye } from 'react-icons/fa';
import { FaMinus } from 'react-icons/fa';
import { FaPaintBrush } from 'react-icons/fa';
import { Button } from '@material-ui/core';
import '../css/spectrum-list.css';
import { SketchPicker } from 'react-color';
import { COLORS } from '../utility/ColorGenerator';
import { useDispatch } from '../context/DispatchContext';
import {
  CHANGE_VISIBILITY,
  CHANGE_PEAKS_MARKERS_VISIBILITY,
  CHNAGE_ACTIVE_SPECTRUM,
  CHNAGE_SPECTRUM_COLOR,
} from '../reducer/Actions';

function arePropsEqual(prevProps, nextProps) {
  return true;
}
const ColorPicker = React.memo(
  ({
    colorPickerPosition,
    selectedSpectrumData,
    onColorChanged,
    onMouseLeave,
  }) => {
    return (
      <div
        style={{
          position: 'fixed',
          left: colorPickerPosition.x,
          top: colorPickerPosition.y,
          zIndex: 999999999,
        }}
        onMouseLeave={onMouseLeave}
      >
        <SketchPicker
          color={selectedSpectrumData.color}
          presetColors={COLORS}
          onChangeComplete={onColorChanged}
        />
      </div>
    );
  },
  arePropsEqual,
);

const SpectrumList = ({ data }) => {
  const [activated, setActivated] = useState(null);
  const [visible, setVisible] = useState([]);
  const [markersVisible, setMarkersVisible] = useState([]);
  const [isColorPickerDisplayed, setIsColorPickerDisplayed] = useState(false);
  const [selectedSpectrumData, setSelectedSpectrum] = useState(null);
  const [colorPickerPosition, setColorPickerPosition] = useState(null);

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
        dispatch({ type: CHNAGE_ACTIVE_SPECTRUM, data: null });
        setActivated(null);
      } else {
        dispatch({ type: CHNAGE_ACTIVE_SPECTRUM, data: { id: d.id } });
        setActivated({ id: d.id });
      }
    },
    [activated, dispatch],
  );
  const handleOnColorChanged = useCallback(
    (color) => {
      if (selectedSpectrumData !== null) {
        dispatch({
          type: CHNAGE_SPECTRUM_COLOR,
          data: { id: selectedSpectrumData.id, color: color.hex },
        });
      }
    },
    [dispatch, selectedSpectrumData],
  );

  useEffect(() => {
    const visibleSpectrums = data.filter((d) => d.isVisible === true);
    const visibleMarkers = data.filter((d) => d.isPeaksMarkersVisible === true);

    setVisible(visibleSpectrums);
    setMarkersVisible(visibleMarkers);

    if (data && data.length === 1 && activated == null) {
      handleChangeActiveSpectrum(data[0]);
    }
  }, [data,handleChangeActiveSpectrum,activated]);

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
    const isVisible = (id) => {
      return visible.findIndex((v) => v.id === id) !== -1 ? true : false;
    };

    const isActivated = (id) => {
      return activated && activated.id === id;
    };

    const isMarkerVisible = (id) => {
      return markersVisible.findIndex((v) => v.id === id) !== -1 ? true : false;
    };
    return (
      data &&
      data.map((d, i) => {
        return (
          <ListItem key={'slist' + d.id}>
            <ListItemIcon>
              <Button onClick={() => handleChangeVisibility(d)}>
                <FaEye
                  style={
                    isVisible(d.id)
                      ? { opacity: 1, stroke: 'black', strokeWidth: '1px' }
                      : { opacity: 0.1 }
                  }
                />
              </Button>
            </ListItemIcon>
            <div style={{ width: '50%' }}>{d.name}</div>

            <ListItemSecondaryAction>
              <Button onClick={() => handleChangeMarkersVisibility(d)}>
                <FaEye
                  style={
                    isMarkerVisible(d.id)
                      ? { width: 12, opacity: 1, fill: d.color }
                      : { width: 12, opacity: 0.1, fill: d.color }
                  }
                />
              </Button>
              <Button onClick={() => handleChangeActiveSpectrum(d)}>
                <FaMinus
                  style={
                    isActivated(d.id)
                      ? { fill: d.color, height: '15px' }
                      : { fill: d.color, opacity: 0.1 }
                  }
                />
              </Button>
              <Button
                className="color-change-bt"
                onClick={(event) => handleOpenColorPicker(d, event)}
              >
                <FaPaintBrush />
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        );
      })
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
  return (
    <Fragment>
      <List className="spectrum-list">{ListItems}</List>

      {isColorPickerDisplayed ? (
        <ColorPicker
          onMouseLeave={handleCloseColorPicker}
          selectedSpectrumData={selectedSpectrumData}
          colorPickerPosition={colorPickerPosition}
          onColorChanged={handleOnColorChanged}
        />
      ) : null}
    </Fragment>
  );
};

SpectrumList.propTypes = {
  data: propTypes.array.isRequired,
};

export default SpectrumList;

// SpectrumList.defaultProps = {
//   onChangeVisibility: function() {
//     return null;
//   },
//   onChangeMarkersVisibility: function() {
//     return null;
//   },
//   onChangeActive: function() {
//     return null;
//   },
//   onColorChanged: function() {
//     return null;
//   },
// };
