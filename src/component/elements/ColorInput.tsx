/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ColorPicker } from 'analysis-ui-components';
import { useCallback, memo, useState, useEffect } from 'react';

const style = css`
  display: flex;
  margin: 5px 0px;

.inputLabel{
  flex: 2;
  font-size: 11px;
  font-weight: bold;
  color: #232323;
}

.input {
  width: '60%',
  text-align: 'center',
}

.color{
  width: 36px;
  height: 14px;
  border-radius: 2px;
}

.swatch{
  padding: 5px;
  background: #fff;
  border-radius: 1px;
  box-shadow: 0 0 0 1px rgba(0,0,0,.1);
  display: inline-block;
  cursor: pointer;
}
.color-popover {
  position: absolute;
  z-index: 2;
}

.cover {
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
}
  .chrome-picker {
    border-radius: none !important;
    width: 200px !important;
    height: 60px !important;
    display: flex;


  }
  .chrome-picker > div:first-of-type {
    padding: 0px !important;

  }
  .chrome-picker > div:last-child >  div:first-of-type {
    width: 120px;

  }
  .chrome-picker > div:last-child >  div:last-child {
    display:none !important;
  }
`;

export interface ColorInputProps {
  value?: string;
  label?: string;
  name: string;
  onColorChange?: (element: any) => void;
}

function ColorInput(props: ColorInputProps) {
  const {
    label = 'Color: ',
    onColorChange = () => null,
    name,
    value = '#000000',
  } = props;

  const [displayColorPicker, showColorPicker] = useState(false);
  const [selectedColor, setColor] = useState(value);

  useEffect(() => {
    setColor(value);
  }, [value]);

  const handleClick = useCallback(() => {
    showColorPicker(!displayColorPicker);
  }, [displayColorPicker]);

  const handleClose = useCallback(() => {
    showColorPicker(false);
  }, []);

  const handleOnColorChanged = useCallback(
    (colorEvent) => {
      const hex = `${colorEvent.hex}${Math.round(
        colorEvent.rgb.a * 255,
      ).toString(16)}`;
      setColor(hex);
      onColorChange({ ...colorEvent, hex, name });
    },
    [name, onColorChange],
  );
  return (
    <div css={style}>
      <span className="inputLabel">{label}</span>
      <div style={{ flex: 4 }}>
        <div className="swatch" onClick={handleClick}>
          <div className="color" style={{ backgroundColor: selectedColor }} />
          <input type="hidden" value={selectedColor} name={name} />
        </div>
        {displayColorPicker ? (
          <div className="color-popover">
            <div className="cover" onClick={handleClose} />
            <ColorPicker
              color={{ hex: selectedColor }}
              onChangeComplete={handleOnColorChanged}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default memo(ColorInput);
