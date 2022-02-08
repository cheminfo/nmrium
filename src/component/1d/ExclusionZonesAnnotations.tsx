import { memo } from 'react';

import { Datum1D } from '../../data/types/data1d';
import { useChartData } from '../context/ChartContext';

import getVerticalShift from './utilities/getVerticalShift';
import * as Filters from '../../data/Filters';
import ExclusionZoneAnnotation from './ExclusionZoneAnnotation';
import { ExclusionZone } from '../../data/types/data1d/ExclusionZone';
import useSpectraByActiveNucleus from './../hooks/useSpectraPerNucleus';
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import { VerticalAlign } from '../reducer/Reducer';

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
  const { data, displayerKey, xDomains, displayerMode, verticalAlign } =
    useChartData();

  if (displayerMode !== DISPLAYER_MODE.DM_1D) return null;

  const spectra = useSpectraByActiveNucleus() as Datum1D[];

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
    data.filters.find((filter) => filter.name === Filters.exclusionZones.id)
      ?.value || []
  );
}
