/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useState } from 'react';

import CloseButton from '../../elements/CloseButton';
import MolecularFormulaInput from '../../elements/MolecularFormulaInput';
import MoleculeSelection from '../../elements/MoleculeSelection';

const modalContainer = css`
  overflow: auto;
  width: 400px;
  height: 550px;
  padding: 5px;
  button:focus {
    outline: none;
  }
  .header {
    height: 24px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;

    button {
      height: 36px;
      margin: 2px;
      background-color: transparent;
      border: none;
      svg {
        height: 16px;
      }
    }
  }

  button {
    flex: 2;
    padding: 5px;
    border: 1px solid gray;
    border-radius: 5px;
    height: 30px;
    margin: 0 auto;
    margin-top: 15px;
    display: block;
    width: 20%;

    color: white;
    background-color: gray;
  }

  .info {
    margin-top: 0;
    margin-bottom: 10px;
    padding: 0px 10px;
    width: 100%;

    text-align: center;
  }

  .optional {
    margin-top: 20px;
    margin-bottom: 5px;
    padding: 0px 10px;

    text-align: center;
    font-size: 18px;
    font-weight: bold;
  }
  .optional2 {
    margin-top: 5px;
    margin-bottom: 25px;
    padding: 0px 10px;
    width: 100%;

    text-align: center;
  }
`;

export default function SetMolecularFormulaModal({
  onClose,
  onSave,
  molecules,
  previousMF,
}) {
  const [currentIndex, setCurrentIndex] = useState();

  useEffect(() => {
    if (molecules && molecules.length > 0) {
      setCurrentIndex(0);
    }
  }, [molecules]);

  const onSaveHandlerMolecularFormulaInput = useCallback(
    (mf) => {
      onSave?.(mf);
      onClose?.();
    },
    [onClose, onSave],
  );

  const onSaveHandlerMoleculeSelection = useCallback(() => {
    onSave?.(molecules[currentIndex].mf);
    onClose?.();
  }, [currentIndex, molecules, onClose, onSave]);

  const onChangeHandlerMoleculeSelection = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  return (
    <div css={modalContainer}>
      <div className="header handle">
        <CloseButton onClick={onClose} />
      </div>
      <div>
        <p className="info">Please type in a molecular formula!</p>
      </div>
      <MolecularFormulaInput
        onSave={onSaveHandlerMolecularFormulaInput}
        previousMF={previousMF}
      />
      <div>
        <p className="optional">OR</p>
        <p className="optional2">Select a molecule as reference!</p>
      </div>
      <MoleculeSelection
        molecules={molecules}
        onChange={onChangeHandlerMoleculeSelection}
      />
      <button type="button" onClick={onSaveHandlerMoleculeSelection}>
        Set
      </button>
    </div>
  );
}
