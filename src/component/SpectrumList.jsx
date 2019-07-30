import React, { useEffect, useState, Fragment, useMemo } from 'react';
import propTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { FaEye } from 'react-icons/fa';
import { FaMinus } from 'react-icons/fa';
import { FaCog } from 'react-icons/fa';
import { FaMapMarker } from 'react-icons/fa';

import { FaPaintBrush } from 'react-icons/fa';

import { Button } from '@material-ui/core';
// import { ChromePicker } from 'react-color';
// import ColorPicker from './color-picker';

import './css/spectrum-list.css';

import { ChromePicker } from 'react-color';

function arePropsEqual(prevProps, nextProps) {
  return true;
}
const ColorPicker = React.memo(({ onColorChanged }) => {
  return <ChromePicker onChangeComplete={onColorChanged} />;
}, arePropsEqual);

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
  const [spectrumId, setSelectedSpectrumId] = useState(null);

  useEffect(() => {
    const visibleSpectrums = data.filter((d) => d.isVisible === true);
    const visibleMarkers = data.filter((d) => d.isPeaksMarkersVisible === true);
    console.log(visibleMarkers);
    setVisible(visibleSpectrums);
    setMarkersVisible(visibleMarkers);
    setActivated(activated);

    // onChangeVisibility(data);
    // onChangeActive(data[0])
  }, [activated, data]);

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

  const handleOpenColorPicker = (selectedID) => {
    setSelectedSpectrumId(selectedID);
    setIsColorPickerDisplayed(true);
  };

  const handleCloseColorPicker = () => {
    setIsColorPickerDisplayed(false);
  };

  const handleColorChanged = (color, event) => {
    if (spectrumId !== null) {
      onColorChanged({ id: spectrumId, color: color.hex });
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
                  onClick={() => handleOpenColorPicker(d.id)}
                >
                  <FaPaintBrush />
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>

      {isColorPickerDisplayed ? (
        <div
          className="color-picker-popover"
          onMouseLeave={handleCloseColorPicker}
        >
          <div
            className="color-picker-cover"
            onClick={handleCloseColorPicker}
          />
          <ColorPicker onColorChanged={handleColorChanged} />
        </div>
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
