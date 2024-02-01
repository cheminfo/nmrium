import { Range } from 'nmr-processing';

import { useChartData } from '../../context/ChartContext';
import { useTopicMolecule } from '../../context/TopicMoleculeContext';

const fontSize = 12;
const lineHeight = fontSize * 1.1;
const marginTop = 55;

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
    for (const id of diaIDs) {
      const existingAtoms = diaIDsObject[id]?.existingAtoms;
      if (existingAtoms?.length > 0) {
        atoms.push(...existingAtoms);
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
    <g transform={`translate(${x},${marginTop})`}>
      {atomsList.map((row, rowIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={rowIndex} transform={`translate(${rowIndex * lineHeight}, 0)`}>
          {row.atoms.map((item, colIndex) => (
            <text
              // eslint-disable-next-line react/no-array-index-key
              key={colIndex}
              x={0}
              y={colIndex * lineHeight}
              fontSize={fontSize}
              fill="black"
            >
              {item}
            </text>
          ))}
        </g>
      ))}
    </g>
  );
}
