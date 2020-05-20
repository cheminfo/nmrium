/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { memo } from 'react';
import { SketchPicker } from 'react-color';

import { COLORS } from '../../../data/utilities/getColor';

const style = css`
  position: fixed;
  z-index: 999999999;
  display: flex;
  flex-direction: row-reverse;
  border-radius: 4px;
  background-color: white;
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
  const { info, display } = selectedSpectrumData;
  const colors =
    info.dimension === 2
      ? [
          {
            color: display.positiveColor,
            key: 'positiveColor',
            label: 'Positive',
          },
          {
            color: display.negativeColor,
            key: 'negativeColor',
            label: 'Negative',
          },
        ]
      : [{ color: display.color, key: 'color', label: '' }];

  return (
    <div
      css={[
        style,
        {
          left:
            info.dimension === 2
              ? colorPickerPosition.x - 450
              : colorPickerPosition.x - 220,
          padding: info.dimension === 2 ? '10px 0' : '',
          top: colorPickerPosition.y,
        },
      ]}
      onMouseLeave={onMouseLeave}
    >
      {colors.map((colorData) => (
        <div key={colorData.key}>
          <span style={{ padding: info.dimension === 2 ? '0 10px' : '0' }}>
            {colorData.label}
          </span>
          <SketchPicker
            color={{ hex: colorData.color }}
            presetColors={COLORS}
            onChangeComplete={(e) => onColorChanged(e, colorData.key)}
          />
        </div>
      ))}
    </div>
  );
};

function arePropsEqual() {
  return true;
}

export default memo(ColorPicker, arePropsEqual);
