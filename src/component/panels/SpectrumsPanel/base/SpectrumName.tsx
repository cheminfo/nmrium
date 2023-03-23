import { SvgNmr2D, SvgNmrFid, SvgNmrFt } from 'cheminfo-font';
import { CSSProperties } from 'react';

import { Datum1D } from '../../../../data/types/data1d';
import { Datum2D } from '../../../../data/types/data2d';

interface SpectrumNameProps {
  data: Datum1D | Datum2D;
}

const styles: Record<'info' | 'icon', CSSProperties> = {
  info: {
    display: 'block',
    alignItems: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: '24px',
  },
  icon: {
    width: '16px',
    height: '16px',
    display: 'inline-block',
    verticalAlign: 'middle',
    position: 'relative',
  },
};

export function SpectrumName(props: SpectrumNameProps) {
  return (
    <div style={styles.info}>
      <div style={styles.icon}>
        <SpectraIcon {...props} />
      </div>
      <span>{props.data.info.name}</span>
    </div>
  );
}

function SpectraIcon(props: SpectrumNameProps) {
  const {
    data: {
      info: { isFt, isFid, dimension },
      originalInfo,
    },
  } = props;

  if (dimension === 1 && isFt && originalInfo?.isFid) {
    return (
      <>
        <SvgNmrFid style={{ opacity: '0.3', position: 'absolute' }} />
        <SvgNmrFt />
      </>
    );
  } else if (dimension === 1 && isFt) {
    return <SvgNmrFt />;
  } else if (isFid) {
    return <SvgNmrFid />;
  } else {
    return <SvgNmr2D />;
  }
}
