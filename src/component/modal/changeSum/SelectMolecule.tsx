import styled from '@emotion/styled';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ControllerProps, FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';

import getAtom from '../../../data/utilities/getAtom.js';
import { useChartData } from '../../context/ChartContext.js';
import MoleculeSelection from '../../elements/MoleculeSelection.js';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;
const SelectionContainer = styled.div`
  display: block;
  margin: 0 auto;
  width: 450px;
`;
const Title = styled.p`
  padding: 0 10px;
  text-align: center;
  width: 100%;
`;

const SumValue = styled.p`
  margin-top: 15px;
  padding: 0 10px;
  text-align: center;
  width: 100%;
`;
const EmptyText = styled.p<{ color: CSSProperties['color'] }>`
  color: ${({ color }) => color};
  padding: 20%;
  text-align: center;
  width: 100%;
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
    <div>
      {element && molecules && molecules.length > 0 ? (
        <Container>
          <Title>Select a molecule as reference!</Title>

          <SelectionContainer>
            <MoleculeSelection
              index={currentIndex}
              molecules={molecules}
              onChange={onChangeMoleculeSelectionHandler}
            />
            <SumValue>
              New sum for {element} will be {newSum}!
            </SumValue>
          </SelectionContainer>
        </Container>
      ) : (
        <EmptyText color={invalid ? 'red' : 'black'}>
          You have to Select a spectrum and Add a molecule from the Structure
          panel to select as a reference!
        </EmptyText>
      )}
    </div>
  );
}
