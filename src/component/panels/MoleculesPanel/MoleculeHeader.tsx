import { useCallback, CSSProperties } from 'react';
import { MF } from 'react-mf';

import { InternalMolecule } from '../../../data/molecules/Molecule';
import {
  extractLabelsNumbers,
  extractNumber,
} from '../../../data/molecules/MoleculeManager';
import { useDispatch } from '../../context/DispatchContext';
import EditableColumn from '../../elements/EditableColumn';
import { InputKeyboardEvent } from '../../elements/Input';
import { CHANGE_MOLECULE_LABEL } from '../../reducer/types/Types';

interface MoleculeHeaderProps {
  currentMolecule: InternalMolecule;
  molecules: InternalMolecule[];
}

const styles: Record<'toolbar' | 'labelInput', CSSProperties> = {
  toolbar: {
    display: 'flex',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
    padding: '5px 10px',
    justifyContent: 'space-between',
    height: '35px',
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
    (id: string, event: InputKeyboardEvent) => {
      const label = event.target.value;
      dispatch({ type: CHANGE_MOLECULE_LABEL, payload: { label, id } });
    },
    [dispatch],
  );

  return (
    <div style={styles.toolbar}>
      <div style={{ display: 'flex' }}>
        <span>Label</span>
        <EditableColumn
          value={currentMolecule.label}
          style={styles.labelInput}
          validate={validateLabel}
          onSave={(event) => saveLabelHandler(currentMolecule.id, event)}
        />
      </div>

      <span>
        <MF mf={currentMolecule.mf} /> - {currentMolecule.mw?.toFixed(2)}
      </span>
    </div>
  );
}
