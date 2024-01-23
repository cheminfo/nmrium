/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Spectrum1D } from 'nmr-load-save';

import { get1DDataXY } from '../../data/data1d/Spectrum1D/get1DDataXY';
import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D';
import { useChartData } from '../context/ChartContext';
import { useScaleChecked } from '../context/ScaleContext';
import { useActiveSpectra } from '../hooks/useActiveSpectra';
import { useSetActiveSpectrumAction } from '../hooks/useSetActiveSpectrumAction';
import { useVerticalAlign } from '../hooks/useVerticalAlign';

import Line from './Line';
import { SPECTRA_BOTTOM_MARGIN } from './utilities/scale';

const BOX_SIZE = 10;

const style = css`
  fill: transparent;

  &:hover {
    fill: #ff6f0057;
  }
`;

function LinesSeries() {
  const { data, displayerKey, xDomains, width, margin, height } =
    useChartData();
  const activeSpectra = useActiveSpectra();
  const { shiftY } = useScaleChecked();
  const verticalAlign = useVerticalAlign();
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.bottom - SPECTRA_BOTTOM_MARGIN;

  const spectra = (data?.filter(
    (d) => isSpectrum1D(d) && d.display.isVisible && xDomains[d.id],
  ) || []) as Spectrum1D[];

  const { setActiveSpectrum } = useSetActiveSpectrumAction();
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`} className="spectrums">
      {spectra.map((d, i) => (
        <g key={d.id}>
          <Line display={d.display} id={d.id} data={get1DDataXY(d)} index={i} />
          {verticalAlign === 'stack' && (
            <rect
              css={style}
              y={innerHeight - shiftY * i - BOX_SIZE / 2}
              x={margin.left}
              width={`${innerWidth}px`}
              height={`${BOX_SIZE}px`}
              onClick={(e) => {
                setActiveSpectrum(e as unknown as MouseEvent, d.id);
              }}
            />
          )}
        </g>
      ))}

      {activeSpectra?.map((activeSpectrum) => (
        <use key={activeSpectrum.id} href={`#${activeSpectrum.id}`} />
      ))}
    </g>
  );
}

export default LinesSeries;
