import React, { memo } from 'react';
import { SketchPicker } from 'react-color';

import { COLORS } from '../utility/ColorGenerator';

const style = {
  position: 'fixed',
  zIndex: 999999999,
};

const ColorPicker = ({
  colorPickerPosition,
  selectedSpectrumData,
  onColorChanged,
  onMouseLeave,
}) => {
  return (
    <div
      style={{
        ...style,
        left: colorPickerPosition.x - 200,
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
};

function arePropsEqual() {
  return true;
}

export default memo(ColorPicker, arePropsEqual);
