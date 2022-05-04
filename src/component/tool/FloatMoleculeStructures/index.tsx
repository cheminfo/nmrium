import { memo } from 'react';

import { Molecule } from '../../../data/molecules/Molecule';
import { Datum1D, Ranges } from '../../../data/types/data1d';
import { Datum2D, Zones } from '../../../data/types/data2d';
import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';
import { DISPLAYER_MODE } from '../../reducer/core/Constants';

import { DraggableStructure } from './DraggableStructure';

interface FloatMoleculeStructuresProps {
  zones: Zones;
  ranges: Ranges;
  molecules: Array<Molecule>;
  activeTab: string;
  displayerMode: DISPLAYER_MODE;
}

export function FloatMoleculeStructuresInner(
  props: FloatMoleculeStructuresProps,
) {
  const { zones, ranges, molecules, activeTab, displayerMode } = props;

  if (!molecules || molecules.length === 0) return null;

  return (
    <g>
      {molecules
        .filter((molecule) => molecule.isFloat)
        .map((molecule) => (
          <DraggableStructure
            key={molecule.key}
            {...{ zones, ranges, activeTab, displayerMode, molecule }}
          />
        ))}
    </g>
  );
}

const MemoizedFloatMoleculeStructures = memo(FloatMoleculeStructuresInner);
const emptyData = { ranges: {}, zones: {} };

export default function FloatMoleculeStructures() {
  const { molecules, displayerMode, activeTab } = useChartData();

  const data = useSpectrum(emptyData);
  const ranges: Ranges = (data as Datum1D)?.ranges || {};
  const zones: Zones = (data as Datum2D)?.zones || {};

  return (
    <MemoizedFloatMoleculeStructures
      {...{
        molecules,
        displayerMode,
        activeTab,
        ranges,
        zones,
      }}
    />
  );
}
