import styled from '@emotion/styled';
import type { Spectrum1D } from '@zakodium/nmrium-core';

import { get1DDataXY } from '../../data/data1d/Spectrum1D/get1DDataXY.js';
import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { useBrushTracker } from '../EventsTrackers/BrushTracker.js';
import { useChartData } from '../context/ChartContext.js';
import { useScaleChecked } from '../context/ScaleContext.js';
import { useActiveSpectra } from '../hooks/useActiveSpectra.js';
import { useSetActiveSpectrumAction } from '../hooks/useSetActiveSpectrumAction.js';
import { useVerticalAlign } from '../hooks/useVerticalAlign.js';

import Line from './Line.js';
import { useInsetOptions } from './inset/InsetProvider.js';

const BOX_SIZE = 10;

const Rect = styled.rect`
  fill: transparent;

  &:hover {
    fill: #ff6f0057;
  }
`;

function useSpectra() {
  const { xDomains, data } = useChartData();

  const inset = useInsetOptions();

  if (inset) {
    return data?.filter((d) => isSpectrum1D(d) && d.id === inset.spectrumKey);
  }

  return data?.filter(
    (d) => isSpectrum1D(d) && d.display.isVisible && xDomains[d.id],
  );
}

function LinesSeries() {
  const activeSpectra = useActiveSpectra();
  const spectra = useSpectra() as Spectrum1D[];
  const { id: insetKey = 'primary' } = useInsetOptions() || {};

  return (
    <g className="spectra">
      {spectra.map((d, i) => (
        <g key={d.id}>
          <Line display={d.display} id={d.id} data={get1DDataXY(d)} index={i} />
          <HeadlightRectStackMode spectrumID={d.id} index={i} />
        </g>
      ))}
      {activeSpectra?.map((activeSpectrum) => (
        <use
          key={activeSpectrum.id}
          href={`#${activeSpectrum.id}-${insetKey}`}
        />
      ))}
    </g>
  );
}

interface HeadlightRectStackModeProps {
  spectrumID: string;
  index: number;
}

function HeadlightRectStackMode(props: HeadlightRectStackModeProps) {
  const { spectrumID, index } = props;
  const { step } = useBrushTracker();
  const {
    width,
    margin,
    height,
    toolOptions: { selectedTool },
  } = useChartData();
  const { shiftY, spectraBottomMargin } = useScaleChecked();
  const verticalAlign = useVerticalAlign();
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.bottom - spectraBottomMargin;
  const { setActiveSpectrum } = useSetActiveSpectrumAction();

  if (
    verticalAlign !== 'stack' ||
    selectedTool !== 'zoom' ||
    step === 'brushing'
  ) {
    return null;
  }

  return (
    <Rect
      y={innerHeight - shiftY * index - BOX_SIZE / 2}
      x={margin.left}
      width={`${innerWidth}px`}
      height={`${BOX_SIZE}px`}
      onClick={(e) => {
        setActiveSpectrum(e as unknown as MouseEvent, spectrumID);
      }}
      data-no-export="true"
    />
  );
}

export default LinesSeries;
