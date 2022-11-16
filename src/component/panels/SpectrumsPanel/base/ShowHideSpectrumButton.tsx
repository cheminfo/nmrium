import { FaEye } from 'react-icons/fa';

import { Datum1D } from '../../../../data/types/data1d';
import { Display1D } from '../../../../data/types/data1d/Display1D';
import { Datum2D } from '../../../../data/types/data2d';
import { Display2D } from '../../../../data/types/data2d/Display2D';
import { SpectraTableButtonStyle } from '../SpectraTable';

type VisibleKey = 'isVisible' | 'isPositiveVisible' | 'isNegativeVisible';
export interface OnChangeVisibilityEvent {
  onChangeVisibility: (data: Datum1D | Datum2D, is: VisibleKey) => void;
}

interface ShowHideSpectrumButtonProps extends OnChangeVisibilityEvent {
  data: Datum1D | Datum2D;
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
      data-test-id="hide-show-spectrum-button"
      style={SpectraTableButtonStyle}
      type="button"
      onClick={() => onChangeVisibility(data, 'isVisible')}
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
        style={SpectraTableButtonStyle}
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
        style={SpectraTableButtonStyle}
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
