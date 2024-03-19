import { Display1D, Display2D, Spectrum } from 'nmr-load-save';
import { CSSProperties } from 'react';
import { FaEye } from 'react-icons/fa';

const buttonStyle: CSSProperties = {
  backgroundColor: 'transparent',
  border: 'none',
  width: '20px',
  height: '20px',
  margin: 'auto',
};

type VisibleKey = 'isVisible' | 'isPositiveVisible' | 'isNegativeVisible';
export interface OnChangeVisibilityEvent {
  onChangeVisibility: (data: Spectrum, is: VisibleKey) => void;
}

interface ShowHideSpectrumButtonProps extends OnChangeVisibilityEvent {
  data: Spectrum;
}

function getStyle(display, key: VisibleKey) {
  return display[key]
    ? {
        opacity: 1,
        strokeWidth: '1px',
      }
    : {
        opacity: 0.1,
      };
}

export default function ShowHideSpectrumButton({
  data,
  onChangeVisibility,
}: ShowHideSpectrumButtonProps) {
  return (
    <div>
      <DisplayButtons1D
        {...{
          data,
          onChangeVisibility,
        }}
      />

      <DisplayButtons2D
        {...{
          data,
          onChangeVisibility,
        }}
      />
    </div>
  );
}

function DisplayButtons1D(props: ShowHideSpectrumButtonProps) {
  const { data, onChangeVisibility } = props;

  if (data.info.dimension !== 1) {
    return null;
  }

  const display = data.display as Display1D;

  return (
    <button
      data-testid="hide-show-spectrum-button"
      style={buttonStyle}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChangeVisibility(data, 'isVisible');
      }}
    >
      <FaEye
        style={{
          ...getStyle(display, 'isVisible'),
          fill: display.color,
          margin: 'auto',
        }}
      />
    </button>
  );
}

function DisplayButtons2D(props: ShowHideSpectrumButtonProps) {
  const { data, onChangeVisibility } = props;

  if (data.info.dimension !== 2) {
    return null;
  }

  const display = data.display as Display2D;

  return (
    <div style={{ minWidth: '40px' }}>
      <button
        style={buttonStyle}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChangeVisibility(data, 'isPositiveVisible');
        }}
      >
        <FaEye
          style={{
            ...getStyle(display, 'isPositiveVisible'),
            fill: display.positiveColor,
            margin: 'auto',
          }}
        />
      </button>
      <button
        style={buttonStyle}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChangeVisibility(data, 'isNegativeVisible');
        }}
      >
        <FaEye
          style={{
            ...getStyle(display, 'isNegativeVisible'),
            fill: display.negativeColor,
            margin: 'auto',
          }}
        />
      </button>
    </div>
  );
}
