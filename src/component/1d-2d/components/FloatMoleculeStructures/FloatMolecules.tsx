import type { Ranges, Zones } from '@zakodium/nmr-types';
import type { MoleculeView, Spectrum1D, Spectrum2D } from '@zakodium/nmrium-core';
import { memo } from 'react';
import { assert } from 'react-science/ui';

import type {
  MoleculesView,
  StateMoleculeExtended,
} from '../../../../data/molecules/Molecule.js';
import { useChartData } from '../../../context/ChartContext.js';
import useSpectrum from '../../../hooks/useSpectrum.js';
import type { DisplayerMode } from '../../../reducer/Reducer.js';

import { DraggableStructure } from './DraggableStructure.js';

interface FloatMoleculeStructuresProps {
  zones: Zones;
  ranges: Ranges;
  molecules: StateMoleculeExtended[];
  moleculesView: MoleculesView;
  activeTab: string;
  displayerMode: DisplayerMode;
}

function FloatMoleculesInner(props: FloatMoleculeStructuresProps) {
  const { zones, ranges, moleculesView, molecules, activeTab, displayerMode } =
    props;

  const floatingMolecules = Object.entries<MoleculeView>(moleculesView);

  if (floatingMolecules.length === 0) return null;

  const visibleMolecules = floatingMolecules.filter(
    ([, view]) => view.floating.visible,
  );

  return visibleMolecules.map(([id, moleculeView], index) => {
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
  });
}

const MemoizedFloatMolecules = memo(FloatMoleculesInner);
const emptyData = { ranges: {}, zones: {} };

export function FloatMolecules() {
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
    <MemoizedFloatMolecules
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
