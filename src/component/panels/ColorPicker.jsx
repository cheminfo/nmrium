/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { memo } from 'react';
import { SketchPicker } from 'react-color';

import { COLORS } from '../utility/ColorGenerator';

const style = css`
  position: fixed;
  z-index: 999999999;
  display: flex;
  flex-direction: row;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px,
    rgba(0, 0, 0, 0.15) 0px 8px 16px;
  .sketch-picker {
    border-radius: none !important;
    box-shadow: none !important;
  }

  .sketch-picker > div:first-child {
    // padding-bottom: 40% !important;
  }
`;

const ColorPicker = ({
  colorPickerPosition,
  selectedSpectrumData,
  onColorChanged,
  onMouseLeave,
}) => {
  console.log(selectedSpectrumData);
  return (
    <div
      css={[
        style,
        {
          left: colorPickerPosition.x - 450,
          top: colorPickerPosition.y,
        },
      ]}
      onMouseLeave={onMouseLeave}
    >
      <SketchPicker
        color={selectedSpectrumData.color}
        presetColors={COLORS}
        onChangeComplete={onColorChanged}
      />
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
