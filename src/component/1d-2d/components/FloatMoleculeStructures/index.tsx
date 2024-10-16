import type { Spectrum1D, Spectrum2D } from 'nmr-load-save';
import type { Ranges, Zones } from 'nmr-processing';
import { memo } from 'react';

import type {
  MoleculesView,
  MoleculeView,
  StateMoleculeExtended,
} from '../../../../data/molecules/Molecule.js';
import { useChartData } from '../../../context/ChartContext.js';
import useSpectrum from '../../../hooks/useSpectrum.js';
import type { DisplayerMode } from '../../../reducer/Reducer.js';
import { assert } from '../../../utility/assert.js';

import { DraggableStructure } from './DraggableStructure.js';

interface FloatMoleculeStructuresProps {
  zones: Zones;
  ranges: Ranges;
  molecules: StateMoleculeExtended[];
  moleculesView: MoleculesView;
  activeTab: string;
  displayerMode: DisplayerMode;
}

export function FloatMoleculeStructuresInner(
  props: FloatMoleculeStructuresProps,
) {
  const { zones, ranges, moleculesView, molecules, activeTab, displayerMode } =
    props;

  const floatingMolecules = Object.entries<MoleculeView>(moleculesView);

  if (floatingMolecules.length === 0) return null;

  return (
    <>
      {floatingMolecules
        .filter(([, view]) => view.floating.visible)
        .map(([id, moleculeView], index) => {
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
                moleculeView,
                molecule,
                index,
              }}
            />
          );
        })}
    </>
  );
}

const MemoizedFloatMoleculeStructures = memo(FloatMoleculeStructuresInner);
const emptyData = { ranges: {}, zones: {} };

export default function FloatMoleculeStructures() {
  const {
    molecules,
    displayerMode,
    view: {
      molecules: moleculesView,
      spectra: { activeTab },
    },
  } = useChartData();

  const data = useSpectrum(emptyData);
  const ranges: Ranges = (data as Spectrum1D)?.ranges || {};
  const zones: Zones = (data as Spectrum2D)?.zones || {};

  return (
    <MemoizedFloatMoleculeStructures
      {...{
        moleculesView,
        molecules,
        displayerMode,
        activeTab,
        ranges,
        zones,
      }}
    />
  );
}
