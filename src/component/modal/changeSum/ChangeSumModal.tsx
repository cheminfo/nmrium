/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback } from 'react';

import NumberInput from './NumberInput';
import SelectMolecule from './SelectMolecule';

const modalContainer = css`
  display: flex;
  flex-direction: column;
  padding: 5px;
`;

interface ChangeSumModalProps {
  onSave?: (element: any) => void;
  onClose: () => void;
  header: any;
  molecules: any;
  element: any;
}

export default function ChangeSumModal({
  onSave,
  onClose,
  header,
  molecules,
  element,
}: ChangeSumModalProps) {
  const saveInputValueHandler = useCallback(
    (inputValue) => {
      onSave?.(inputValue);
    },
    [onSave],
  );

  const saveSelectMoleculeHandler = useCallback(
    (sum) => {
      onSave?.(sum);
    },
    [onSave],
  );

  return (
    <div css={modalContainer}>
      <NumberInput
        onSave={saveInputValueHandler}
        onClose={onClose}
        header={header}
      />

      <SelectMolecule
        onSave={saveSelectMoleculeHandler}
        molecules={molecules}
        element={element}
      />
    </div>
  );
}
