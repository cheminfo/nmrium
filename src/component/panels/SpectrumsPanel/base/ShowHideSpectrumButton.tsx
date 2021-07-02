import { CSSProperties } from 'react';
import { FaEye } from 'react-icons/fa';

interface DataProps {
  id: string;
  display: { color: string; positiveColor: string; negativeColor: string };
  info: {
    dimension: 1 | 2;
  };
}

interface ShowHideSpectrumButtonProps {
  data: DataProps;
  onChangeVisibility: (
    data: DataProps,
    is: 'isVisible' | 'isPositiveVisible' | 'isNegativeVisible',
  ) => void;
  style: CSSProperties;
}

export default function ShowHideSpectrumButton({
  data,
  onChangeVisibility,
  style,
}: ShowHideSpectrumButtonProps) {
  const isVisible = (id, key) => {
    return data ? data.display[key] : true;
  };
  return (
    <>
      {data.info.dimension === 1 && (
        <button
          data-test-id="hide-show-spectrum-button"
          style={style}
          type="button"
          onClick={() => onChangeVisibility(data, 'isVisible')}
        >
          <FaEye
            style={{
              ...(isVisible(data.id, 'isVisible')
                ? {
                    opacity: 1,
                    strokeWidth: '1px',
                    fill: data.display.color,
                  }
                : {
                    opacity: 0.1,
                    fill: data.display.color,
                  }),
            }}
          />
        </button>
      )}
      {data.info.dimension === 2 && (
        <div style={{ minWidth: '40px' }}>
          <button
            style={{ ...style, width: '20px', minWidth: '20px' }}
            type="button"
            onClick={() => onChangeVisibility(data, 'isPositiveVisible')}
          >
            <FaEye
              style={{
                ...(isVisible(data.id, 'isPositiveVisible')
                  ? {
                      opacity: 1,
                      strokeWidth: '1px',
                      fill: data.display.positiveColor,
                    }
                  : {
                      opacity: 0.1,
                      fill: data.display.positiveColor,
                    }),
              }}
            />
          </button>
          <button
            style={{ ...style, width: '20px', minWidth: '20px' }}
            type="button"
            onClick={() => onChangeVisibility(data, 'isNegativeVisible')}
          >
            <FaEye
              style={{
                ...(isVisible(data.id, 'isNegativeVisible')
                  ? {
                      opacity: 1,
                      strokeWidth: '1px',
                      fill: data.display.negativeColor,
                    }
                  : {
                      opacity: 0.1,
                      fill: data.display.negativeColor,
                    }),
              }}
            />
          </button>
        </div>
      )}
    </>
  );
}
