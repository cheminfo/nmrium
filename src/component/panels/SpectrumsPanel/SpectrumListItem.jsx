import { SvgNmrFid, SvgNmrFt, SvgNmr2D, SvgNmrPeaks } from 'cheminfo-font';
import { memo } from 'react';
import { FaEye } from 'react-icons/fa';

import ColorIndicator from './base/ColorIndicator';

const styles = {
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    width: '26px',
    minWidth: '26px',
  },
  row: {
    display: 'flex',
    alignContent: 'center',
    height: '25px',
    borderBottom: '0.55px solid #f1f1f1',
  },
  name: {
    flex: 1,
    height: '100%',
    display: 'flex',
    // alignItems: 'center',
  },
  info: {
    flex: '1 1 1px',
    height: '100%',
    display: 'block',
    alignItems: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: '24px',
  },
  icon: {
    display: 'flex',
    margin: 'auto',
    justifyContent: 'center',
  },
};

const SpectrumListItem = memo(
  ({
    activated,
    markersVisible,
    data,
    onChangeVisibility,
    onChangeMarkersVisibility,
    onChangeActiveSpectrum,
    onOpenSettingModal,
    onContextMenu,
  }) => {
    const isVisible = (id, key) => {
      return data ? data.display[key] : true;
    };

    const isMarkerVisible = (id) => {
      return markersVisible.findIndex((v) => v.id === id) !== -1 ? true : false;
    };

    const formatValueAsHTML = (value) => {
      if (value) {
        // eslint-disable-next-line prefer-named-capture-group
        value = value.replace(/([0-9]+)/g, '<sub>$1</sub>');
      }
      return value;
    };

    const { color, name, positiveColor, negativeColor } = data.display;
    // const eyeIconColor = data.info.dimension === 2 ? positiveColor : color;
    return (
      <div
        style={{
          ...styles.row,
          ...(activated && activated.id === data.id
            ? { backgroundColor: '#fafafa' }
            : {}),
        }}
        key={data.id}
        onContextMenu={onContextMenu}
      >
        {data.info.dimension === 1 && (
          <button
            style={styles.button}
            type="button"
            onClick={() => onChangeVisibility(data, 'isVisible')}
          >
            <FaEye
              style={{
                fill: color,
                ...(isVisible(data.id, 'isVisible')
                  ? {
                      opacity: 1,
                      strokeWidth: '1px',
                      fill: color,
                    }
                  : {
                      opacity: 0.1,
                      fill: color,
                    }),
              }}
            />
          </button>
        )}
        {data.info.dimension === 2 && (
          <div style={{ minWidth: '40px' }}>
            <button
              style={{ ...styles.button, width: '20px', minWidth: '20px' }}
              type="button"
              onClick={() => onChangeVisibility(data, 'isPositiveVisible')}
            >
              <FaEye
                style={{
                  fill: positiveColor,
                  ...(isVisible(data.id, 'isPositiveVisible')
                    ? {
                        opacity: 1,
                        strokeWidth: '1px',
                        fill: positiveColor,
                      }
                    : {
                        opacity: 0.1,
                        fill: positiveColor,
                      }),
                }}
              />
            </button>
            <button
              style={{ ...styles.button, width: '20px', minWidth: '20px' }}
              type="button"
              onClick={() => onChangeVisibility(data, 'isNegativeVisible')}
            >
              <FaEye
                style={{
                  fill: negativeColor,
                  ...(isVisible(data.id, 'isNegativeVisible')
                    ? {
                        opacity: 1,
                        strokeWidth: '1px',
                        fill: negativeColor,
                      }
                    : {
                        opacity: 0.1,
                        fill: negativeColor,
                      }),
                }}
              />
            </button>
          </div>
        )}

        <div style={styles.name} onClick={() => onChangeActiveSpectrum(data)}>
          <div style={{ ...styles.icon, width: '16px' }}>
            {data.info.isFid ? (
              <SvgNmrFid />
            ) : data.info.dimension === 2 ? (
              <SvgNmr2D />
            ) : (
              <SvgNmrFt />
            )}
          </div>
          <span style={styles.info}>{name}</span>
          <div
            style={styles.info}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: data.info && formatValueAsHTML(data.info.solvent),
            }}
          />
          <span style={styles.info}>
            <span
              style={{
                borderLeft: '0.55px solid #e5e5e5',
                paddingRight: '5px',
              }}
            />
            {data.info && data.info.experiment}
          </span>

          {/* {data.info && data.info.solvent} */}
          {/* </div> */}
          <span style={styles.info}>{data.info && data.info.pulse}</span>
        </div>
        <button
          style={{
            ...styles.icon,
            ...styles.button,
            opacity:
              isMarkerVisible(data.id) &&
              data.peaks &&
              data.peaks.values.length > 0
                ? 1
                : 0.1,
          }}
          type="button"
          onClick={() => onChangeMarkersVisibility(data)}
          disabled={data.peaks && data.peaks.values.length === 0}
        >
          <SvgNmrPeaks />
        </button>

        <ColorIndicator
          style={styles.button}
          dimension={data.info.dimension}
          color={{ positiveColor, color, negativeColor }}
          activated={activated && activated.id === data.id ? true : false}
          onClick={(event) => onOpenSettingModal(data, event)}
        />
      </div>
    );
  },
);

SpectrumListItem.defaultProps = {
  onContextMenu: () => null,
};

export default SpectrumListItem;
