import React from 'react';
import {
  ListItem,
  ListItemIcon,
  Button,
  ListItemSecondaryAction,
} from '@material-ui/core';
import { FaEye, FaMinus, FaPaintBrush } from 'react-icons/fa';

const SpectrumListItem = ({
  visible,
  activated,
  markersVisible,
  data,
  onChangeVisibility,
  onChangeMarkersVisibility,
  onChangeActiveSpectrum,
  onOpenColorPicker,
}) => {
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
    <ListItem key={`slist${data.id}`}>
      <ListItemIcon>
        <Button onClick={() => onChangeVisibility(data)}>
          <FaEye
            style={
              isVisible(data.id)
                ? { opacity: 1, strokeWidth: '1px', fill: data.color }
                : { opacity: 0.1, fill: data.color }
            }
          />
        </Button>
      </ListItemIcon>
      <div style={{ width: '50%' }}>{data.name}</div>

      <ListItemSecondaryAction>
        <Button onClick={() => onChangeMarkersVisibility(data)}>
          <FaEye
            style={
              isMarkerVisible(data.id)
                ? { width: 12, opacity: 1, fill: 'black' }
                : { width: 12, opacity: 0.1, fill: 'black' }
            }
          />
        </Button>
        <Button onClick={() => onChangeActiveSpectrum(data)}>
          <FaMinus
            style={
              isActivated(data.id)
                ? { fill: data.color, height: '15px' }
                : { fill: data.color, opacity: 0.1 }
            }
          />
        </Button>
        <Button
          className="color-change-bt"
          onClick={(event) => onOpenColorPicker(data, event)}
        >
          <FaPaintBrush />
        </Button>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default SpectrumListItem;
