import type { NMRPeak1D, Peak1D, Range } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import { memo, useMemo } from 'react';

import { getOpacityBasedOnSignalKind } from '../../../data/utilities/RangeUtilities.ts';
import { useChartData } from '../../context/ChartContext.js';
import { useScaleChecked } from '../../context/ScaleContext.tsx';
import { useActiveSpectrumPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState.js';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import type { Margin } from '../../reducer/Reducer.js';

import PeakAnnotations from './PeakAnnotations.js';
import PeakAnnotationsSpreadMode from './PeakAnnotationsSpreadMode.js';

interface Peak1DWithParentKeys extends Peak1D {
  parentKeys?: string[];
}
interface NMRPeak1DWithParentKeys extends NMRPeak1D {
  parentKeys?: string[];
  opacity: number;
}

interface SpreadPeak1D extends Peak1DWithParentKeys {
  xInPixel: number;
  yInPixel: number;
}
interface SpreadNMRPeak1D extends NMRPeak1DWithParentKeys {
  xInPixel: number;
  yInPixel: number;
}

export type Peak = Required<SpreadPeak1D | SpreadNMRPeak1D> & {
  opacity: number;
};
type PeaksMode = 'spread' | 'single';
export type PeaksSource = 'peaks' | 'ranges';

interface BasePeaksProps {
  peaksSource: PeaksSource;
  displayerKey: string;
  xDomain: number[];
  peakFormat: string;
}

export interface PeaksAnnotationsProps extends BasePeaksProps {
  peaks: Peak[];
  spectrumColor: string;
  spectrumKey: string;
}

export function getHighlightSource(peaksSource: PeaksSource) {
  return peaksSource === 'peaks' ? 'PEAK' : 'RANGE_PEAK';
}

export function getHighlightExtraId(
  peaksSource: PeaksSource,
  id: string,
  parentKeys: string[],
) {
  return peaksSource === 'peaks' ? id : [...parentKeys, id].join(',');
}

function flatRangesPeaks(ranges: Range[]) {
  const results: NMRPeak1DWithParentKeys[] = [];
  for (const { signals = [], id: rangeID } of ranges) {
    for (const signal of signals) {
      const { peaks = [], id: signalID } = signal;
      const opacity = getOpacityBasedOnSignalKind(signal);
      for (const peak of peaks) {
        results.push({ ...peak, parentKeys: [rangeID, signalID], opacity });
      }
    }
  }
  return results;
}

function mapPeaks(
  peaks: Peak[],
  options: {
    scaleX: (value: number) => number;
    scaleY: (value: number) => number;
  },
) {
  const { scaleX, scaleY } = options;
  const mappedPeaks = peaks.map((peak) => ({
    ...peak,
    xInPixel: scaleX(peak.x),
    yInPixel: scaleY(peak.y),
  }));
  return mappedPeaks;
}

function sortPeaks(peaks: Peak[]) {
  return peaks.toSorted((a, b) => b.x - a.x);
}

function useMapPeaks(spectrum: Spectrum1D, peaksSource: PeaksSource) {
  const { scaleX, scaleY } = useScaleChecked();
  return useMemo(() => {
    let sourcePeaks: Peak[] = [];
    if (peaksSource === 'peaks') {
      sourcePeaks = spectrum.peaks.values as Peak[];
    }

    if (peaksSource === 'ranges') {
      sourcePeaks = flatRangesPeaks(spectrum.ranges.values) as Peak[];
    }

    const sortedPeaks = sortPeaks(sourcePeaks);

    return mapPeaks(sortedPeaks, {
      scaleX: (val) => scaleX()(val),
      scaleY: (val) => scaleY()(val),
    });
  }, [peaksSource, spectrum, scaleX, scaleY]);
}

interface InnerPeaksProps extends BasePeaksProps {
  spectrum: Spectrum1D;
  mode: PeaksMode;
  height: number;
  margin: Margin;
}

function InnerPeaks(props: InnerPeaksProps) {
  const {
    peaksSource,
    spectrum,
    mode,
    displayerKey,
    xDomain,
    height,
    margin,
    peakFormat,
  } = props;

  const peaks = useMapPeaks(spectrum, peaksSource);

  if (mode === 'spread') {
    return (
      <PeakAnnotationsSpreadMode
        peaksSource={peaksSource}
        peaks={peaks}
        spectrumKey={spectrum.id}
        spectrumColor={spectrum.display.color}
        peakFormat={peakFormat}
        displayerKey={displayerKey}
        height={height}
        margin={margin}
      />
    );
  }

  return (
    <PeakAnnotations
      peaksSource={peaksSource}
      peaks={peaks}
      spectrumKey={spectrum.id}
      spectrumColor={spectrum.display.color}
      peakFormat={peakFormat}
      displayerKey={displayerKey}
      xDomain={xDomain}
    />
  );
}

const MemoizedPeaksPanel = memo(InnerPeaks);

const emptyData = { peaks: {}, ranges: {}, info: {}, display: {} };

interface PeaksProps {
  peaksSource: PeaksSource;
}

export default function Peaks(props: PeaksProps) {
  const { peaksSource } = props;
  const {
    view: {
      spectra: { activeTab: nucleus },
    },
    displayerKey,
    xDomain,
    height,
    margin,
  } = useChartData();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;
  const peaksViewState = useActiveSpectrumPeaksViewState();
  const rangesViewState = useActiveSpectrumRangesViewState();
  const { deltaPPM: { format: peakFormat } = { format: '0.0' } } =
    usePanelPreferences(peaksSource === 'peaks' ? 'peaks' : 'ranges', nucleus);

  const canDisplaySpectrumPeaks =
    !spectrum.display.isVisible || spectrum.info?.isFid;
  let mode: PeaksMode = 'spread';

  if (
    peaksSource === 'peaks' &&
    (spectrum.peaks?.values?.length === 0 ||
      !peaksViewState.showPeaks ||
      canDisplaySpectrumPeaks)
  ) {
    return null;
  }

  if (
    peaksSource === 'ranges' &&
    (spectrum.ranges?.values?.length === 0 ||
      !rangesViewState.showPeaks ||
      canDisplaySpectrumPeaks)
  ) {
    return null;
  }

  if (peaksSource === 'peaks') {
    mode = peaksViewState?.displayingMode || 'spread';
  }

  if (peaksSource === 'ranges') {
    mode = rangesViewState?.displayingMode || 'spread';
  }

  return (
    <MemoizedPeaksPanel
      {...{
        spectrum,
        mode,
        peaksSource,
        displayerKey,
        xDomain,
        peakFormat,
        margin,
        height,
      }}
    />
  );
}
