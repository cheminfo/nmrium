import type { CSSProperties } from 'react';
import { useCallback } from 'react';
import { MF } from 'react-mf';

import type { StateMoleculeExtended } from '../../../data/molecules/Molecule.js';
import {
  extractLabelsNumbers,
  extractNumber,
} from '../../../data/molecules/MoleculeManager.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { EditableColumn } from '../../elements/EditableColumn.js';
import Label from '../../elements/Label.js';

interface MoleculeHeaderProps {
  currentMolecule: StateMoleculeExtended;
  molecules: StateMoleculeExtended[];
}

const styles: Record<'toolbar' | 'labelInput', CSSProperties> = {
  toolbar: {
    display: 'flex',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
    padding: '5px 10px',
    justifyContent: 'space-between',
  },
  labelInput: {
    width: '150px',
    border: '1px solid #f4f4f4',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'center',
    marginLeft: '5px',
  },
};

export default function MoleculeHeader(props: MoleculeHeaderProps) {
  const { currentMolecule, molecules } = props;
  const dispatch = useDispatch();

  const validateLabel = useCallback(
    (value) => {
      const reservedNumbers = extractLabelsNumbers(molecules);
      const number = extractNumber(value);
      return value && !reservedNumbers.includes(Number(number));
    },
    [molecules],
  );
  const saveLabelHandler = useCallback(
    (id: string, event) => {
      const label = event.target.value as string;
      dispatch({ type: 'CHANGE_MOLECULE_LABEL', payload: { label, id } });
    },
    [dispatch],
  );

  return (
    <div style={styles.toolbar}>
      <Label title="Label">
        <EditableColumn
          value={currentMolecule.label}
          style={styles.labelInput}
          validate={validateLabel}
          onSave={(event) => saveLabelHandler(currentMolecule.id, event)}
          textOverflowEllipses
          type="text"
        />
      </Label>
      <span>
        <MF mf={currentMolecule.mf} /> - {currentMolecule.mw?.toFixed(2)}
      </span>
    </div>
  );
}
