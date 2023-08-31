import { Spectrum1D } from 'nmr-load-save';

import { useChartData } from '../../context/ChartContext';
import { useActiveSpectrumPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState';
import useSpectrum from '../../hooks/useSpectrum';

import PeakAnnotations from './PeakAnnotations';
import PeakAnnotationsSpreadMode from './PeakAnnotationsSpreadMode';
import { NMRPeak1D, Peak1D, Range } from 'nmr-processing';
import { v4 } from '@lukeed/uuid';
import { memo, useMemo } from 'react';
import { useScaleX } from '../utilities/scale';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';

interface SpreadPeak1D extends Peak1D {
  scaleX: number;
}
interface SpreadNMRPeak1D extends NMRPeak1D {
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

function flatRangesPeaks(ranges: Range[]) {
  const peaks: NMRPeak1D[] = [];
  for (const range of ranges) {
    for (const signal of range?.signals || []) {
      if (signal.peaks) {
        peaks.push(...signal.peaks);
      }
    }
  }
  return peaks;
}

function mapPeaks(peaks: Peak[], scale: (value: number) => number) {
  return peaks
    .map((peak) => ({
      ...peak,
      scaleX: scale(peak.x),
      id: peak.id || v4(),
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

const emptyData = { peaks: {}, info: {}, display: {} };

export default function Peaks(props) {
  const { peaksSource } = props;
  const {
    view: {
      peaks: peaksView,
      spectra: { activeTab: nucleus },
    },
    displayerKey,
    xDomain,
  } = useChartData();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;
  const peaksViewState = useActiveSpectrumPeaksViewState();
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
    (!spectrum.ranges?.values || canDisplaySpectrumPeaks)
  ) {
    return null;
  }

  if (peaksSource === 'peaks') {
    mode = peaksView?.[spectrum.id]?.displayingMode || 'spread';
  }

  return (
    <MemoizedPeaksPanel
      {...{ spectrum, mode, peaksSource, displayerKey, xDomain, peakFormat }}
    />
  );
}
