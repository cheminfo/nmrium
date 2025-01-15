import styled from '@emotion/styled';
import { useCallback, memo, useState, useEffect } from 'react';
import type { ColorPickerProps } from 'react-science/ui';
import { ColorPicker } from 'react-science/ui';

const Container = styled.div`
  display: flex;
  margin: 5px 0;

  .input-label {
    flex: 2;
    font-size: 11px;
    font-weight: bold;
    color: #232323;
  }

  .input {
    width: 60%;
    text-align: center;
  }

  .chrome-picker {
    border-radius: 0 !important;
    width: 200px !important;
    height: 60px !important;
    display: flex;
  }

  .chrome-picker > div:first-of-type {
    padding: 0 !important;
  }

  .chrome-picker > div:last-child > div:first-of-type {
    width: 120px;
  }

  .chrome-picker > div:last-child > div:last-child {
    display: none !important;
  }
`;

const Switch = styled.div`
  padding: 5px;
  background: #fff;
  border-radius: 1px;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 10%);
  display: inline-block;
  cursor: pointer;
`;
const Color = styled.div`
  width: 36px;
  height: 14px;
  border-radius: 2px;
`;
const ColorPopover = styled.div`
  position: absolute;
  z-index: 2;
`;
const Cover = styled.div`
  position: fixed;
  inset: 0;
`;

export interface ColorInputProps {
  value?: string;
  name: string;
  onColorChange?: ColorPickerProps['onChangeComplete'];
}

function ColorInput(props: ColorInputProps) {
  const { onColorChange = () => null, name, value = '#000000' } = props;

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
    <Container>
      <Switch onClick={handleClick}>
        <Color style={{ backgroundColor: selectedColor }} />
        <input type="hidden" value={selectedColor} name={name} />
      </Switch>
      {displayColorPicker ? (
        <ColorPopover>
          <Cover onClick={handleClose} />
          <ColorPicker
            color={{ hex: selectedColor }}
            onChangeComplete={handleOnColorChanged}
          />
        </ColorPopover>
      ) : null}
    </Container>
  );
}

export default memo(ColorInput);
