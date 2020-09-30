/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback } from 'react';

import NumberInput from './NumberInput';
import SelectMolecule from './SelectMolecule';

const modalContainer = css`
  display: flex;
  flex-direction: column;
  padding: 5px;
`;

const ChangeSumModal = ({ onSave, onClose, header, molecules, element }) => {
  const saveInputValueHandler = useCallback(
    (inputValue) => {
      onSave(inputValue);
    },
    [onSave],
  );

  const saveSelectMoleculeHandler = useCallback(
    (sum) => {
      onSave(sum);
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
};

ChangeSumModal.defaultProps = {
  onSave: () => {
    return null;
  },
  onClose: () => {
    return null;
  },
};
export default ChangeSumModal;
