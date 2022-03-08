import { memo } from 'react';

import * as Filters from '../../data/Filters';
import { Datum1D } from '../../data/types/data1d';
import { ExclusionZone } from '../../data/types/data1d/ExclusionZone';
import { useChartData } from '../context/ChartContext';
import useSpectraByActiveNucleus from '../hooks/useSpectraPerNucleus';
import { VerticalAlign } from '../reducer/Reducer';
import { DISPLAYER_MODE } from '../reducer/core/Constants';

import ExclusionZoneAnnotation from './ExclusionZoneAnnotation';
import getVerticalShift from './utilities/getVerticalShift';

interface ExclusionZonesAnnotationsInnerProps {
  displayerKey: string;
  spectra: Datum1D[];
  xDomains: any;
  verticalAlign: VerticalAlign;
}

function ExclusionZonesAnnotationsInner({
  displayerKey,
  xDomains,
  spectra,
  verticalAlign,
}: ExclusionZonesAnnotationsInnerProps) {
  return (
    <g
      className="spectrum-exclusion-zones-group"
      clipPath={`url(#${displayerKey}clip-chart-1d)`}
    >
      {spectra
        .filter((d) => d.display.isVisible === true && xDomains[d.id])
        .map((d, index) =>
          getExclusionZones(d).map((zone) => {
            return (
              <ExclusionZoneAnnotation
                key={zone.id}
                spectrumID={d.id}
                vAlign={getVerticalShift(verticalAlign, { index })}
                zone={zone}
                color={d.display.color}
              />
            );
          }),
        )}
    </g>
  );
}

const MemoizedPeakAnnotations = memo(ExclusionZonesAnnotationsInner);

function ExclusionZonesAnnotations() {
  const { displayerKey, xDomains, displayerMode, verticalAlign } =
    useChartData();

  const spectra = useSpectraByActiveNucleus() as Datum1D[];

  if (displayerMode !== DISPLAYER_MODE.DM_1D) return null;

  return (
    <MemoizedPeakAnnotations
      spectra={spectra}
      displayerKey={displayerKey}
      xDomains={xDomains}
      verticalAlign={verticalAlign}
    />
  );
}

export default ExclusionZonesAnnotations;

function getExclusionZones(data: Datum1D): ExclusionZone[] {
  return (
    data.filters.find(
      (filter) => filter.name === Filters.exclusionZones.id && filter.flag,
    )?.value || []
  );
}
