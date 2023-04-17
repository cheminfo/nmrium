import { Spectrum1D } from 'nmr-load-save';
import { memo } from 'react';

import * as Filters from '../../data/Filters';
import { ExclusionZone } from '../../data/types/data1d/ExclusionZone';
import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';
import useSpectraByActiveNucleus from '../hooks/useSpectraPerNucleus';
import { DISPLAYER_MODE } from '../reducer/core/Constants';

import ExclusionZoneAnnotation from './ExclusionZoneAnnotation';

interface ExclusionZonesAnnotationsInnerProps {
  displayerKey: string;
  spectra: Spectrum1D[];
  xDomains: any;
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

  if (displayerMode !== DISPLAYER_MODE.DM_1D) return null;

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
): { id: string; zones: ExclusionZone[] }[] {
  const zones: { id: string; zones: ExclusionZone[] }[] = [];
  for (const filter of data.filters) {
    if (filter.name === Filters.exclusionZones.id && filter.flag) {
      zones.push({ id: Filters.exclusionZones.id, zones: filter.value });
    } else if (filter.name === Filters.signalProcessing.id && filter.flag) {
      zones.push({
        id: Filters.signalProcessing.id,
        zones: filter.value.exclusionsZones,
      });
    }
  }
  return zones;
}
