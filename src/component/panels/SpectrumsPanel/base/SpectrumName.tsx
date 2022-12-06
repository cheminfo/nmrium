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
  },
};

export function SpectrumName(props: SpectrumNameProps) {
  const { data } = props;

  return (
    <div style={styles.info}>
      {' '}
      <div style={styles.icon}>
        {data.info.isFid ? (
          <SvgNmrFid />
        ) : data.info.dimension === 2 ? (
          <SvgNmr2D />
        ) : (
          <SvgNmrFt />
        )}
      </div>
      <span>{data.display.name}</span>
    </div>
  );
}
