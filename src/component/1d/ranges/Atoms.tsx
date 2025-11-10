import type { Range } from '@zakodium/nmr-types';
import type { MoleculesView } from '@zakodium/nmrium-core';

import { useChartData } from '../../context/ChartContext.js';
import { useTopicMolecule } from '../../context/TopicMoleculeContext.js';
import { SVGGroup } from '../../elements/SVGGroup.js';
import { SVGText } from '../../elements/SVGText.js';

const fontSize = 12;
const marginTop = 45;

function getDiaIds(range: Range) {
  const { diaIDs = [], signals } = range;
  const ids = diaIDs.slice();
  for (const signal of signals) {
    if (signal?.diaIDs) {
      ids.push(...signal.diaIDs);
    }
  }
  return ids;
}

function useAtoms(range: Range, moleculesView: MoleculesView) {
  const topicMolecule = useTopicMolecule();
  const diaIDs = getDiaIds(range);
  const atomsList: Array<{ id: string; atoms: Array<string | number> }> = [];

  for (const [id, topicMoleculeObject] of Object.entries(topicMolecule)) {
    const atoms: Array<string | number> = [];
    const diaIDsObject = topicMoleculeObject.getDiaIDsObject();

    if (!diaIDsObject || !(id in moleculesView)) continue;

    const { atomAnnotation } = moleculesView[id];
    for (const id of diaIDs) {
      if (!(id in diaIDsObject)) continue;

      const {
        existingAtoms = [],
        customLabels = [],
        heavyAtomsCustomLabels = [],
      } = diaIDsObject[id];

      if (atomAnnotation === 'atom-numbers') {
        atoms.push(...existingAtoms);
      }

      if (atomAnnotation === 'custom-labels') {
        const labels =
          customLabels.length > 0 ? customLabels : heavyAtomsCustomLabels;
        atoms.push(...labels);
      }
    }

    if (atoms.length > 0) {
      atoms.sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') {
          return a - b;
        }
        if (typeof a === 'string' && typeof b === 'string') {
          return a.localeCompare(b);
        }
        return 0;
      });
      atomsList.push({
        id,
        atoms: Array.from(new Set(atoms)),
      });
    }
  }

  return atomsList;
}

interface AtomsProps {
  range: Range;
  x: number;
}
export function Atoms(props: AtomsProps) {
  const { range, x } = props;
  const {
    view: { molecules },
  } = useChartData();
  const atomsList = useAtoms(range, molecules);

  return (
    <SVGGroup
      direction="column"
      transform={`translate(${x},${marginTop})`}
      space={5}
    >
      {atomsList.map((row) => (
        <SVGText
          key={range.id + row.atoms.join(',')}
          x={0}
          fontSize={fontSize}
          borderRadius={5}
          padding={2}
          rectProps={{ fill: 'white', stroke: 'black', strokeWidth: 0.5 }}
        >
          {row.atoms.join(',')}
        </SVGText>
      ))}
    </SVGGroup>
  );
}
