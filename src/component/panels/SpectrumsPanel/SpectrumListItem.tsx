import { SvgNmrFid, SvgNmrFt, SvgNmr2D } from 'cheminfo-font';
import { CSSProperties, memo } from 'react';

import ColorIndicator from './base/ColorIndicator';
import ShowHideMarkersButton from './base/ShowHideMarkersButton';
import ShowHideSpectrumButton from './base/ShowHideSpectrumButton';

const styles: Record<
  'button' | 'row' | 'name' | 'info' | 'icon',
  CSSProperties
> = {
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

function SpectrumListItem({
  activeSpectrum,
  markersVisible,
  data,
  onChangeVisibility,
  onChangeMarkersVisibility,
  onChangeActiveSpectrum,
  onOpenSettingModal,
  onContextMenu,
}) {
  const formatValueAsHTML = (value) => {
    if (value) {
      value = value.replace(/(?<value>[0-9]+)/g, '<sub>$<value></sub>');
    }
    return value;
  };
  const activated = activeSpectrum && activeSpectrum.id === data.id;
  const { color, name, positiveColor, negativeColor } = data.display;
  return (
    <div
      style={{
        ...styles.row,
        ...(activated
          ? { backgroundColor: '#fafafa' }
          : { opacity: activeSpectrum ? 0.2 : 1 }),
      }}
      onContextMenu={onContextMenu}
    >
      <ShowHideSpectrumButton
        data={data}
        onChangeVisibility={onChangeVisibility}
        style={styles.button}
      />

      <div
        data-test-id="activate-deactivate-spectrum-button"
        style={styles.name}
        onClick={() => onChangeActiveSpectrum(data)}
      >
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
          {data.info?.experiment}
        </span>

        {/* {data.info && data.info.solvent} */}
        {/* </div> */}
        <span style={styles.info}>{data.info?.pulse}</span>
      </div>

      <ShowHideMarkersButton
        data={data}
        style={{
          ...styles.icon,
          ...styles.button,
        }}
        onChangeMarkersVisibility={onChangeMarkersVisibility}
        markersVisible={markersVisible}
      />
      <ColorIndicator
        style={styles.button}
        dimension={data.info.dimension}
        color={{ positiveColor, color, negativeColor }}
        activated={activated}
        onClick={(event) => onOpenSettingModal(data, event)}
      />
    </div>
  );
}

export default memo(SpectrumListItem);
