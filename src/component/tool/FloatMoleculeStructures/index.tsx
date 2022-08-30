import { memo } from 'react';

import {
  FloatingMolecules,
  StateMoleculeExtended,
} from '../../../data/molecules/Molecule';
import { Datum1D, Ranges } from '../../../data/types/data1d';
import { Datum2D, Zones } from '../../../data/types/data2d';
import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';
import { DISPLAYER_MODE } from '../../reducer/core/Constants';
import { assert } from '../../utility/assert';

import { DraggableStructure } from './DraggableStructure';

interface FloatMoleculeStructuresProps {
  zones: Zones;
  ranges: Ranges;
  molecules: Array<StateMoleculeExtended>;
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
        .map(({ id, position }) => {
          const molecule = molecules.find((m) => m.id === id);
          assert(molecule !== undefined, 'molecule should be defined');
          return (
            <DraggableStructure
              key={id}
              {...{
                zones,
                ranges,
                activeTab,
                displayerMode,
                position,
                molecule,
              }}
            />
          );
        })}
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
