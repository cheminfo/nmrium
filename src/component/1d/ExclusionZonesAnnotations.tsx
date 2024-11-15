import type { Spectrum1D } from 'nmr-load-save';
import { Filters1D } from 'nmr-processing';
import { memo } from 'react';

import type { ExclusionZone } from '../../data/types/data1d/ExclusionZone.js';
import { useChartData } from '../context/ChartContext.js';
import { useScale } from '../context/ScaleContext.js';
import useSpectraByActiveNucleus from '../hooks/useSpectraPerNucleus.js';

import ExclusionZoneAnnotation from './ExclusionZoneAnnotation.js';

interface ExclusionZonesAnnotationsInnerProps {
  displayerKey: string;
  spectra: Spectrum1D[];
  xDomains: Record<string, number[]>;
  shiftY: number;
}

function ExclusionZonesAnnotationsInner({
  displayerKey,
  xDomains,
  spectra,
  shiftY,
}: ExclusionZonesAnnotationsInnerProps) {
  return (
    <g
      className="spectrum-exclusion-zones-group"
      clipPath={`url(#${displayerKey}clip-chart-1d)`}
    >
      {spectra
        .filter((d) => d.display.isVisible && xDomains[d.id])
        .map((d, index) =>
          getExclusionZones(d).map((record) => {
            return record.zones.map((zone) => {
              return (
                <ExclusionZoneAnnotation
                  key={zone.id}
                  spectrumID={d.id}
                  vAlign={shiftY * index}
                  zone={zone}
                  filterId={record.id}
                  color={d.display.color}
                />
              );
            });
          }),
        )}
    </g>
  );
}

const MemoizedPeakAnnotations = memo(ExclusionZonesAnnotationsInner);

function ExclusionZonesAnnotations() {
  const { displayerKey, xDomains, displayerMode } = useChartData();
  const { shiftY } = useScale();

  const spectra = useSpectraByActiveNucleus() as Spectrum1D[];

  if (displayerMode !== '1D') return null;

  return (
    <MemoizedPeakAnnotations
      spectra={spectra}
      displayerKey={displayerKey}
      xDomains={xDomains}
      shiftY={shiftY}
    />
  );
}

export default ExclusionZonesAnnotations;

function getExclusionZones(
  data: Spectrum1D,
): Array<{ id: string; zones: ExclusionZone[] }> {
  const zones: Array<{ id: string; zones: ExclusionZone[] }> = [];
  for (const filter of data.filters) {
    if (filter.name === Filters1D.exclusionZones.name && filter.enabled) {
      zones.push({ id: Filters1D.exclusionZones.name, zones: filter.value });
    } else if (
      filter.name === Filters1D.signalProcessing.name &&
      filter.enabled
    ) {
      zones.push({
        id: Filters1D.signalProcessing.name,
        zones: filter.value.exclusionsZones,
      });
    }
  }
  return zones;
}
