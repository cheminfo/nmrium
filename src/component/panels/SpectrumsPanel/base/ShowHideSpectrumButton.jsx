import { FaEye } from 'react-icons/fa';

export default function ShowHideSpectrumButton({
  data,
  onChangeVisibility,
  style,
}) {
  const isVisible = (id, key) => {
    return data ? data.display[key] : true;
  };
  return (
    <>
      {data.info.dimension === 1 && (
        <button
          style={style}
          type="button"
          onClick={() => onChangeVisibility(data, 'isVisible')}
        >
          <FaEye
            style={{
              fill: data.display.color,

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
                fill: data.display.positiveColor,
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
                fill: data.display.negativeColor,
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
