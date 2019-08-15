import React, { useEffect, useState, Fragment } from 'react';
import propTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
// import ListItemText from '@material-ui/core/ListItemText';
import { FaEye } from 'react-icons/fa';
import { FaMinus } from 'react-icons/fa';

import { FaPaintBrush } from 'react-icons/fa';

import { Button } from '@material-ui/core';
// import { ChromePicker } from 'react-color';
// import ColorPicker from './color-picker';

import '../css/spectrum-list.css';

import { SketchPicker } from 'react-color';
import { COLORS } from '../utility/ColorGenerator';

function arePropsEqual(prevProps, nextProps) {
  return true;
}
const ColorPicker = React.memo(
  ({ colorPickerPosition, selectedSpectrumData, onColorChanged, onMouseLeave }) => {
    return (
      <div
        style={{
          position: 'fixed',
          left: colorPickerPosition.x,
          top: colorPickerPosition.y,
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

export default function SpectrumList({
  data,
  onChangeVisibility,
  onChangeMarkersVisibility,
  onChangeActive,
  onColorChanged,
}) {
  const [activated, setActivated] = useState(null);
  const [visible, setVisible] = useState([]);
  const [markersVisible, setMarkersVisible] = useState([]);
  const [isColorPickerDisplayed, setIsColorPickerDisplayed] = useState(false);
  const [selectedSpectrumData, setSelectedSpectrum] = useState(null);
  const [colorPickerPosition, setColorPickerPosition] = useState(null);

  useEffect(() => {
    const visibleSpectrums = data.filter((d) => d.isVisible === true);
    const visibleMarkers = data.filter((d) => d.isPeaksMarkersVisible === true);

    setVisible(visibleSpectrums);
    setMarkersVisible(visibleMarkers);

    // onChangeVisibility(data);
    // onChangeActive(data[0])
  }, [data]);

  useEffect(() => {
    if (data && data.length === 1) {
      setActivated(data[0]);
      onChangeActive(data[0]);
    }
  }, []);

  const handleVisibility = (d) => {
    const currentIndex = visible.findIndex((v) => v.id === d.id);
    const newChecked = [...visible];
    if (currentIndex === -1) {
      newChecked.push({ id: d.id });
    } else {
      newChecked.splice(currentIndex, 1);
    }
    onChangeVisibility(newChecked);
    setVisible(newChecked);
  };

  const isVisible = (id) => {
    return visible.findIndex((v) => v.id === id) !== -1 ? true : false;
  };

  const handleToggle = (d) => {
    if (activated && activated.id === d.id) {
      onChangeActive(null);
      setActivated(null);
    } else {
      onChangeActive({ id: d.id });
      setActivated({ id: d.id });
    }
  };

  const isActivated = (id) => {
    return activated && activated.id === id;
  };

  const handleMarkersVisibility = (d) => {
    const currentIndex = markersVisible.findIndex((v) => v.id === d.id);
    const newChecked = [...markersVisible];
    if (currentIndex === -1) {
      newChecked.push({ id: d.id });
    } else {
      newChecked.splice(currentIndex, 1);
    }
    onChangeMarkersVisibility(newChecked);
    setMarkersVisible(newChecked);
  };

  const isMarkerVisible = (id) => {
    return markersVisible.findIndex((v) => v.id === id) !== -1 ? true : false;
  };

  const handleOpenColorPicker = (selectedSpectrum, event) => {
    setColorPickerPosition({
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
    });
    setSelectedSpectrum(selectedSpectrum);
    setIsColorPickerDisplayed(true);
  };

  const handleCloseColorPicker = () => {
    setIsColorPickerDisplayed(false);
  };

  const handleColorChanged = (color, event) => {
    if (selectedSpectrumData !== null) {
      onColorChanged({ id: selectedSpectrumData.id, color: color.hex });
    }
  };

  return (
    <Fragment>
      <List
        // subheader={<ListSubheader>Spectrum List</ListSubheader>}
        className="spectrum-list"
      >
        {data.map((d) => {
          return (
            <ListItem key={d.id}>
              <ListItemIcon>
                <Button onClick={() => handleVisibility(d)}>
                  <FaEye
                    style={
                      isVisible(d.id)
                        ? { opacity: 1, stroke: 'black', strokeWidth: '1px' }
                        : { opacity: 0.1 }
                    }
                  />
                </Button>
              </ListItemIcon>
              {/* <ListItemText primary={d.name} /> */}
              <div style={{ width: '50%' }}>{d.name}</div>

              <ListItemSecondaryAction>
                <Button onClick={() => handleMarkersVisibility(d)}>
                  <FaEye
                    style={
                      isMarkerVisible(d.id)
                        ? { width: 12, opacity: 1, fill: d.color }
                        : { width: 12, opacity: 0.1, fill: d.color }
                    }
                  />
                </Button>
                <Button onClick={() => handleToggle(d)}>
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
        })}
      </List>

      {isColorPickerDisplayed ? (
        // <div className="color-picker-popover">
          <ColorPicker
            onMouseLeave={handleCloseColorPicker}
            selectedSpectrumData={selectedSpectrumData}
            colorPickerPosition={colorPickerPosition}
            onColorChanged={handleColorChanged}
          />
        // </div>
      ) : null}
    </Fragment>
  );
}

SpectrumList.propTypes = {
  data: propTypes.array.isRequired,
};

SpectrumList.defaultProps = {
  onChangeVisibility: function() {
    return null;
  },
  onChangeMarkersVisibility: function() {
    return null;
  },
  onChangeActive: function() {
    return null;
  },
  onColorChanged: function() {
    return null;
  },
};
