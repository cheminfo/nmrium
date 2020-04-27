import React, { memo, Fragment } from 'react';
import { FaEye, FaPaintBrush } from 'react-icons/fa';

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
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '18px 18px',
  },
  spectrumClassIcon: {
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px 16px',
    width: '16px',
    height: '100%',
    margin: '0px 2px',
  },
};

const SpectrumListItem = memo(
  ({
    visible,
    activated,
    markersVisible,
    data,
    onChangeVisibility,
    onChangeMarkersVisibility,
    onChangeActiveSpectrum,
    onOpenColorPicker,
    onContextMenu,
  }) => {
    const isVisible = (id) => {
      return visible.findIndex((v) => v.id === id) !== -1 ? true : false;
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

    const ColorIndicator = ({ id, color, width = '14px' }) => {
      return (
        <div
          style={{
            backgroundColor: color,
            height: '4px',
            width: width,
            opacity: activated && activated.id === id ? 1 : 0.1,
            display: 'inline-block',
          }}
        />
      );
    };

    const { color, name, positiveColor, negativeColor } = data.display;

    return (
      <div style={styles.row} key={data.id} onContextMenu={onContextMenu}>
        <button
          style={styles.button}
          type="button"
          onClick={() => onChangeVisibility(data)}
        >
          <FaEye
            style={{
              fill: data.info.dimension === 2 ? positiveColor : color,
              ...(isVisible(data.id)
                ? { opacity: 1, strokeWidth: '1px', fill: color }
                : { opacity: 0.1, fill: color }),
            }}
          />
        </button>
        <div style={styles.name} onClick={() => onChangeActiveSpectrum(data)}>
          <div
            style={styles.spectrumClassIcon}
            className={
              data.info.isFid
                ? 'ci-icon-nmr-fid'
                : data.info.dimension === 2
                ? 'ci-icon-nmr-2d'
                : 'ci-icon-nmr-ft'
            }
          />
          <span style={styles.info}>{name}</span>
          <div
            style={styles.info}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: data.info && formatValueAsHTML(data.info.solvent),
            }}
          />
          {/* {data.info && data.info.solvent} */}
          {/* </div> */}
          <span style={styles.info}>{data.info && data.info.pulse}</span>
        </div>
        <button
          style={{
            ...styles.button,
            ...styles.icon,
            opacity:
              isMarkerVisible(data.id) && data.peaks && data.peaks.length > 0
                ? 1
                : 0.1,
          }}
          type="button"
          onClick={() => onChangeMarkersVisibility(data)}
          className="ci-icon-nmr-peaks"
          disabled={data.peaks && data.peaks.length === 0}
        />
        <button
          style={styles.button}
          type="button"
          onClick={() => onChangeActiveSpectrum(data)}
        >
          {data.info.dimension === 2 ? (
            <Fragment>
              <ColorIndicator id={data.id} color={positiveColor} width="7px" />
              <ColorIndicator id={data.id} color={negativeColor} width="7px" />
            </Fragment>
          ) : (
            <ColorIndicator id={data.id} color={color} />
          )}

          {/* <FaMinus
            style={
              isActivated(data.id)
                ? { fill: color, height: '15px', width: '12px' }
                : { fill: color, opacity: 0.1, width: '12px' }
            }
          /> */}
        </button>
        <button
          style={styles.button}
          type="button"
          className="color-change-bt"
          onClick={(event) => onOpenColorPicker(data, event)}
        >
          <FaPaintBrush />
        </button>
      </div>
    );
  },
);

SpectrumListItem.defaultProps = {
  onContextMenu: () => null,
};

export default SpectrumListItem;
