import { Range } from 'nmr-processing';

import { useTopicMolecule } from '../../context/TopicMoleculeContext';

const fontSize = 12;
const lineHeight = fontSize * 1.5;

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
  const atomsList: number[][] = [];

  for (const topicMoleculeObject of Object.values(topicMolecule)) {
    const atoms: number[] = [];
    const diaIDsObject = topicMoleculeObject.getDiaIDsObject();
    for (const id of diaIDs) {
      if (diaIDsObject[id]?.counter > 0) {
        atoms.push(...diaIDsObject[id].existingAtoms);
      }
    }
    const uniqueAtoms = [...new Set(atoms.sort((a, b) => a - b))];
    atomsList.push(uniqueAtoms);
  }
  return atomsList;
}

interface AtomsProps {
  range: Range;
  x: number;
}
export function Atoms(props: AtomsProps) {
  const { range, x } = props;
  const atomsList = useAtoms(range);
  return (
    <g transform={`translate(${x},55)`}>
      {atomsList.map((row, rowIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={rowIndex} transform={`translate(${rowIndex * lineHeight}, 0)`}>
          {row.map((item, colIndex) => (
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
