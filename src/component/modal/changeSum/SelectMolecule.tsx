/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ControllerProps, FieldValues, useController } from 'react-hook-form';

import getAtom from '../../../data/utilities/getAtom.js';
import { useChartData } from '../../context/ChartContext.js';
import MoleculeSelection from '../../elements/MoleculeSelection.js';

const styles = css`
  .molecule-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    .title {
      padding: 0 10px;
      width: 100%;
      text-align: center;
    }

    .molecule-selection-container {
      width: 450px;
      display: block;
      margin: 0 auto;
    }

    .new-sum-text {
      margin-top: 15px;
      padding: 0 10px;
      width: 100%;
      text-align: center;
    }
  }

  .empty {
    width: 100%;
    padding: 20%;
    text-align: center;
  }
`;

export default function SelectMolecule<
  FieldType extends FieldValues = FieldValues,
>(props: Pick<ControllerProps<FieldType>, 'control' | 'name'>) {
  const { name, control } = props;
  const [currentIndex, setCurrentIndex] = useState<number>();
  const {
    field: { onChange, value },
    fieldState: { invalid },
  } = useController({ name, control });
  const {
    molecules,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const element = getAtom(activeTab);
  const newSum = useMemo(() => {
    return element &&
      molecules &&
      molecules.length > 0 &&
      currentIndex !== undefined &&
      molecules[currentIndex].atoms[element]
      ? molecules[currentIndex].atoms[element]
      : 0;
  }, [currentIndex, element, molecules]);

  const setValue = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      onChange(molecules[index]);
    },
    [molecules, onChange],
  );

  useEffect(() => {
    if (molecules && molecules.length > 0) {
      const index = value
        ? molecules.findIndex((molecule) => molecule.id === value.id)
        : -1;
      setValue(index !== -1 ? index : 0);
    }
  }, [molecules, setValue, value]);

  const onChangeMoleculeSelectionHandler = useCallback(
    (index) => {
      setValue(index);
    },
    [setValue],
  );

  return (
    <div css={styles}>
      {element && molecules && molecules.length > 0 ? (
        <div className="molecule-container">
          <p className="title">Select a molecule as reference!</p>

          <div className="molecule-selection-container">
            <MoleculeSelection
              index={currentIndex}
              molecules={molecules}
              onChange={onChangeMoleculeSelectionHandler}
            />
            <p className="new-sum-text">
              New sum for {element} will be {newSum}!
            </p>
          </div>
        </div>
      ) : (
        <p className="empty" style={{ color: invalid ? 'red' : 'black' }}>
          You have to Select a spectrum and Add a molecule from the Structure
          panel to select as a reference!
        </p>
      )}
    </div>
  );
}
