import { memo } from 'react';

import { FloatingMolecules, Molecule } from '../../../data/molecules/Molecule';
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
  floatingMolecules: Array<FloatingMolecules>;
  activeTab: string;
  displayerMode: DISPLAYER_MODE;
}

export function FloatMoleculeStructuresInner(
  props: FloatMoleculeStructuresProps,
) {
  const {
    zones,
    ranges,
    floatingMolecules,
    molecules,
    activeTab,
    displayerMode,
  } = props;

  if (!floatingMolecules || floatingMolecules.length === 0) return null;

  return (
    <g>
      {floatingMolecules
        .filter((molecule) => molecule.visible)
        .map((molecule) => (
          <DraggableStructure
            key={molecule.id}
            {...{
              zones,
              ranges,
              activeTab,
              displayerMode,
              molecule: molecules.find((m) => m.id === molecule.id) as Molecule,
            }}
          />
        ))}
    </g>
  );
}

const MemoizedFloatMoleculeStructures = memo(FloatMoleculeStructuresInner);
const emptyData = { ranges: {}, zones: {} };

export default function FloatMoleculeStructures() {
  const {
    molecules,
    displayerMode,
    activeTab,
    view: { floatingMolecules },
  } = useChartData();

  const data = useSpectrum(emptyData);
  const ranges: Ranges = (data as Datum1D)?.ranges || {};
  const zones: Zones = (data as Datum2D)?.zones || {};

  return (
    <MemoizedFloatMoleculeStructures
      {...{
        floatingMolecules,
        molecules,
        displayerMode,
        activeTab,
        ranges,
        zones,
      }}
    />
  );
}
