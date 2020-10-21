/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback, useState, useEffect, useMemo } from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import MoleculeSelection from '../../elements/MoleculeSelection';

const selectMoleculeContainerStyle = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const optionalTextStyle = css`
  display: flex;
  flex-direction: column;
  padding: 5px;

  .optional {
    margin-top: 5px;
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

const moleculeContainerStyle = css`
  button {
    flex: 2;
    padding: 5px;
    border: 1px solid gray;
    border-radius: 5px;
    height: 36px;
    margin: 0 auto;
    margin-top: 15px;
    display: block;
    width: 20%;

    color: white;
    background-color: gray;
  }

  .newSumText {
    margin-top: 15px;
    // margin-bottom: 25px;
    padding: 0px 10px;
    width: 100%;

    text-align: center;
  }
`;

const SelectMolecule = ({ onSave, molecules, element }) => {
  const [currentIndex, setCurrentIndex] = useState();
  const { general, panels } = usePreferences();

  const newSum = useMemo(() => {
    return element &&
      molecules &&
      molecules.length > 0 &&
      currentIndex !== undefined &&
      molecules[currentIndex].atoms[element]
      ? molecules[currentIndex].atoms[element]
      : 0;
  }, [currentIndex, element, molecules]);

  useEffect(() => {
    if (molecules && molecules.length > 0) {
      setCurrentIndex(0);
    }
  }, [molecules]);

  const saveSelectMoleculeHandler = useCallback(
    (e) => {
      e.preventDefault();
      onSave(newSum);
    },
    [newSum, onSave],
  );

  const onChangeMoleculeSelectionHandler = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  return !general.hideSetSumFromMolecule &&
    !panels.hideStructuresPanel &&
    element &&
    molecules &&
    molecules.length > 0 ? (
    <div css={selectMoleculeContainerStyle}>
      <div css={optionalTextStyle}>
        <p className="optional">OR</p>
        <p className="optional2">Select a molecule as reference!</p>
      </div>
      <div css={moleculeContainerStyle}>
        <MoleculeSelection
          molecules={molecules}
          onChange={onChangeMoleculeSelectionHandler}
        />
        <button type="button" onClick={saveSelectMoleculeHandler}>
          Set
        </button>
        <p className="newSumText">
          New sum for {element} will be {newSum}!
        </p>
      </div>
    </div>
  ) : null;
};

SelectMolecule.defaultProps = {
  onSave: () => {
    return null;
  },
};
export default SelectMolecule;
