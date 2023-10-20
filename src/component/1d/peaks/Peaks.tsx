import { Spectrum1D } from 'nmr-load-save';
import { NMRPeak1D, Peak1D, Range } from 'nmr-processing';
import { memo, useMemo } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useActiveSpectrumPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useSpectrum from '../../hooks/useSpectrum';
import { useScaleX } from '../utilities/scale';

import PeakAnnotations from './PeakAnnotations';
import PeakAnnotationsSpreadMode from './PeakAnnotationsSpreadMode';

interface Peak1DWithParentKeys extends Peak1D {
  parentKeys?: string[];
}
interface NMRPeak1DWithParentKeys extends NMRPeak1D {
  parentKeys?: string[];
}

interface SpreadPeak1D extends Peak1DWithParentKeys {
  scaleX: number;
}
interface SpreadNMRPeak1D extends NMRPeak1DWithParentKeys {
  scaleX: number;
}

export type Peak = Required<SpreadPeak1D | SpreadNMRPeak1D>;
export type PeaksMode = 'spread' | 'single';
export type PeaksSource = 'peaks' | 'ranges';

type FilterPeaksBy = `Source[${PeaksSource}]_Mode[${PeaksMode}]`;

export interface BasePeaksProps {
  peaksSource: PeaksSource;
  displayerKey: string;
  xDomain: number[];
  peakFormat: string;
}

export interface PeaksAnnotationsProps extends BasePeaksProps {
  peaks: Peak[];
  spectrumColor: string;
  spectrumId: string;
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
    for (const { peaks = [], id: signalID } of signals) {
      for (const peak of peaks) {
        results.push({ ...peak, parentKeys: [rangeID, signalID] });
      }
    }
  }
  return results;
}

function mapPeaks(peaks: Peak[], scale: (value: number) => number) {
  return peaks
    .map((peak) => ({
      ...peak,
      scaleX: scale(peak.x),
    }))
    .sort((p1, p2) => p2.x - p1.x);
}

function useMapPeaks(spectrum: Spectrum1D, filterBy: FilterPeaksBy) {
  const scaleX = useScaleX();
  return useMemo(() => {
    switch (filterBy) {
      case 'Source[peaks]_Mode[single]':
        return spectrum.peaks.values;
      case 'Source[peaks]_Mode[spread]':
        return mapPeaks(spectrum.peaks.values as Peak[], (val) =>
          scaleX()(val),
        );
      case 'Source[ranges]_Mode[single]':
        return flatRangesPeaks(spectrum.ranges.values);
      case 'Source[ranges]_Mode[spread]':
        return mapPeaks(
          flatRangesPeaks(spectrum.ranges.values) as Peak[],
          (val) => scaleX()(val),
        );
      default:
        return [];
    }
  }, [scaleX, spectrum, filterBy]);
}

interface InnerPeaksProps extends BasePeaksProps {
  spectrum: Spectrum1D;
  mode: PeaksMode;
}

function InnerPeaks(props: InnerPeaksProps) {
  const { peaksSource, spectrum, mode, displayerKey, xDomain, peakFormat } =
    props;

  const peaks = useMapPeaks(
    spectrum,
    `Source[${peaksSource}]_Mode[${mode}]`,
  ) as Peak[];

  if (mode === 'spread') {
    return (
      <PeakAnnotationsSpreadMode
        peaksSource={peaksSource}
        peaks={peaks}
        spectrumId={spectrum.id}
        spectrumColor={spectrum.display.color}
        peakFormat={peakFormat}
        displayerKey={displayerKey}
        xDomain={xDomain}
      />
    );
  }

  return (
    <PeakAnnotations
      peaksSource={peaksSource}
      peaks={peaks}
      spectrumId={spectrum.id}
      spectrumColor={spectrum.display.color}
      peakFormat={peakFormat}
      displayerKey={displayerKey}
      xDomain={xDomain}
    />
  );
}

const MemoizedPeaksPanel = memo(InnerPeaks);

const emptyData = { peaks: {}, ranges: {}, info: {}, display: {} };

export default function Peaks(props) {
  const { peaksSource } = props;
  const {
    view: {
      spectra: { activeTab: nucleus },
    },
    displayerKey,
    xDomain,
  } = useChartData();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;
  const peaksViewState = useActiveSpectrumPeaksViewState();
  const rangesViewState = useActiveSpectrumRangesViewState();
  const {
    deltaPPM: { format: peakFormat },
  } = usePanelPreferences(
    peaksSource === 'peaks' ? 'peaks' : 'ranges',
    nucleus,
  );

  const canDisplaySpectrumPeaks =
    !spectrum.display.isVisible || spectrum.info?.isFid;
  let mode: PeaksMode = 'spread';
  if (
    !spectrum.peaks?.values ||
    !peaksViewState.showPeaks ||
    canDisplaySpectrumPeaks
  ) {
    return null;
  }

  if (
    peaksSource === 'ranges' &&
    (!spectrum.ranges?.values ||
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
      {...{ spectrum, mode, peaksSource, displayerKey, xDomain, peakFormat }}
    />
  );
}
