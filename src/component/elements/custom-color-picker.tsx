import { Button, Icon, PopoverNext } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { colord } from 'colord';
import { useRef, useState } from 'react';
import type { ColorPickerProps } from 'react-science/ui';
import { ColorPicker } from 'react-science/ui';

type Color = NonNullable<ColorPickerProps['color']>;
type ChangeProps = Parameters<NonNullable<ColorPickerProps['onChange']>>[0];

function normalizeHex(value: string): string {
  const c = colord(value);
  return c.isValid() ? c.toHex() : value.toLowerCase();
}

function isSameColor(a: string, b: string) {
  return normalizeHex(a) === normalizeHex(b);
}

function colorToHex(color?: Color): string {
  if (!color) return '#000000';
  if ('hex' in color) return normalizeHex(color.hex);
  return colord(color).toHex();
}

function hexToChangeProps(hex: string): ChangeProps | null {
  const c = colord(hex);
  if (!c.isValid()) return null;
  return {
    hex: c.toHex(),
    rgb: c.toRgb(),
    hsl: c.toHsl(),
    hsv: c.toHsv(),
    oldHue: 0,
    source: 'hex',
  };
}

const DEFAULT_PRESETS = [
  '#C10020',
  '#007D34',
  '#803E75',
  '#FF6800',
  '#B32851',
  '#7F180D',
  '#232C16',
  '#A6BDD7',
  '#CEA262',
  '#817066',
  '#FF8E00',
  '#F6768E',
  '#00538A',
  '#FF7A5C',
  '#53377A',
  '#FFB300',
  '#F4C800',
  '#93AA00',
  '#593315',
  '#F13A13',
];

const ColorPickerRoot = styled.div`
  width: 100%;
`;

const SelectedColorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
`;

const SelectedColorButton = styled(Button)`
  padding: 0;

  span {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
  }
`;
const SelectedColorPreview = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 6px;
`;

const ColorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, minmax(20px, 1fr));
  width: 100%;
  min-width: 0;
  gap: 6px;
`;

const swatchBase = `
  aspect-ratio: 1;
  width: 100%;
  padding: 0;
  cursor: pointer;
  border-radius: 4px;
`;
const ColorSwatch = styled.div<{ color: string; active: boolean }>`
  ${swatchBase}
  background: ${(props) => props.color};
  border: 1px solid rgb(17 20 24 / 20%);
  outline: ${(props) => (props.active ? `2px solid` : 'none')};
  outline-offset: 1px;

  &:hover {
    opacity: 0.8;
  }
`;

const SelectColorButton = styled.button<{ active: boolean }>`
  ${swatchBase}
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: conic-gradient(
    #ff3b30,
    #fc0,
    #34c759,
    #00c7be,
    #007aff,
    #af52de,
    #ff3b30
  );

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 0.7;
  }

  &:focus-visible {
    outline-width: 2px;
  }
`;

export function CustomColorPicker(props: ColorPickerProps) {
  const { color, onChange, presetColors = DEFAULT_PRESETS } = props;
  const hex = colorToHex(color);

  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const hexOnOpen = useRef(hex);

  function openPicker() {
    hexOnOpen.current = hex;
    setOpen(true);
  }

  function closePicker() {
    setOpen(false);
    if (isSameColor(hex, hexOnOpen.current)) return;
    if (presetColors.some((p) => isSameColor(p, hex))) return;
    setRecent((r) => [hex, ...r.filter((c) => !isSameColor(c, hex))]);
  }

  function applyHex(value: string) {
    const changeProps = hexToChangeProps(value);
    if (changeProps) onChange?.(changeProps);
  }

  return (
    <ColorPickerRoot>
      <SelectedColorHeader>
        <SelectedColorButton
          variant="minimal"
          onClick={() => setOpen(!open)}
          data-testid={`selected-color-btn`}
        >
          <SelectedColorPreview style={{ background: hex }} />{' '}
          <span>{hex}</span>
        </SelectedColorButton>
      </SelectedColorHeader>
      <ColorsGrid>
        {presetColors?.map((preset) => (
          <ColorSwatch
            data-testid={`color-hex-${preset}`}
            key={preset}
            color={preset}
            active={isSameColor(hex, preset)}
            onClick={() => applyHex(preset)}
          />
        ))}
        {recent?.map((preset) => (
          <ColorSwatch
            data-testid={`color-hex-${preset}`}
            key={preset}
            color={preset}
            active={isSameColor(hex, preset)}
            onClick={() => applyHex(preset)}
          />
        ))}

        <PopoverNext
          isOpen={open}
          placement="bottom"
          onInteraction={(next) => (next ? openPicker() : closePicker())}
          content={
            <ColorPicker
              onChangeComplete={onChange}
              color={color}
              presetColors={presetColors}
              style={{ boxShadow: 'none', width: 250 }}
            />
          }
          renderTarget={({ isOpen, ref, ...targetProps }) => (
            <SelectColorButton
              {...targetProps}
              ref={ref}
              type="button"
              active={isOpen}
              data-testid={`select-color-btn`}
            >
              <Icon icon="plus" color="white" size={12} />
            </SelectColorButton>
          )}
        />
      </ColorsGrid>
    </ColorPickerRoot>
  );
}
