import { Range } from 'nmr-processing';

import { useChartData } from '../../context/ChartContext';
import { useTopicMolecule } from '../../context/TopicMoleculeContext';
import { SVGGroup } from '../../elements/SVGGroup';
import { SVGText } from '../../elements/SVGText';

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

function useAtoms(range: Range) {
  const topicMolecule = useTopicMolecule();
  const diaIDs = getDiaIds(range);
  const atomsList: Array<{ id: string; atoms: number[] }> = [];

  for (const [id, topicMoleculeObject] of Object.entries(topicMolecule)) {
    const atoms: number[] = [];
    const diaIDsObject = topicMoleculeObject.getDiaIDsObject();
    if (diaIDsObject) {
      for (const id of diaIDs) {
        const existingAtoms = diaIDsObject[id]?.existingAtoms;
        if (existingAtoms?.length > 0) {
          atoms.push(...existingAtoms);
        }
      }
    }
    if (atoms.length > 0) {
      atomsList.push({ id, atoms: [...new Set(atoms.sort((a, b) => a - b))] });
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
  const atomsList = useAtoms(range).filter(
    (atomsList) => molecules?.[atomsList.id]?.showAtomNumber,
  );

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
