import styled from '@emotion/styled';
import type { Signal2D } from '@zakodium/nmr-types';
import type { FromTo } from 'cheminfo-types';
import { useCallback, useEffect, useState } from 'react';

import DefaultPathLengths from '../../../../../data/constants/DefaultPathLengths.js';
import Button from '../../../../elements/Button.js';
import Input from '../../../../elements/Input.js';
import Label from '../../../../elements/Label.js';

const Container = styled.div`
  height: 100%;
  margin-top: 10px;
  text-align: center;
  width: 100%;

  button {
    background-color: gray;
    border: 1px solid gray;
    border-radius: 5px;
    color: white;
    display: block;
    flex: 2;
    height: 30px;
    margin: 0 auto;
    margin-top: 15px;
    padding: 5px;
    width: 60px;
  }
`;

const InputContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 5px;
  text-align: center;
  width: 100%;
`;
const WarningText = styled.span`
  color: red;
  margin-top: 5px;
`;

interface InputProps {
  signal: Signal2D;
  experimentType: string;
  onEdit: (editedSignal: Signal2D) => void;
}

function EditPathLength({ signal, experimentType, onEdit }: InputProps) {
  const [from, setFrom] = useState<number>(
    signal.j?.pathLength !== undefined
      ? (signal.j.pathLength as FromTo).from
      : DefaultPathLengths[experimentType]?.from || 0,
  );
  const [to, setTo] = useState<number>(
    signal.j?.pathLength !== undefined
      ? (signal.j.pathLength as FromTo).to
      : DefaultPathLengths[experimentType]?.to || 0,
  );
  const [isError, setIsError] = useState<boolean>(false);

  const handleOnEdit = useCallback(() => {
    const pathLength: FromTo = {
      from,
      to,
    };
    const editedSignal: Signal2D = {
      ...signal,
      j: {
        ...signal.j,
        pathLength,
      },
    };

    onEdit(editedSignal);
  }, [to, from, onEdit, signal]);

  useEffect(() => {
    setIsError(from <= 0 || from > to);
  }, [to, from]);

  return (
    <Container>
      <p>Setting of the minimum and maximum path length (J coupling).</p>
      <InputContainer>
        <Label
          title="Min:"
          style={{
            label: {
              marginRight: '5px',
              fontSize: '14px',
              fontWeight: 'normal',
            },
          }}
        >
          <Input
            type="number"
            value={from}
            onChange={(e) => {
              setFrom(Number(e.target.value));
            }}
            style={{ input: { color: isError ? 'red' : 'black' } }}
          />
        </Label>
        <Label
          title="Max:"
          style={{
            label: {
              marginRight: '5px',
              fontSize: '14px',
              fontWeight: 'normal',
            },
          }}
        >
          <Input
            type="number"
            value={to}
            onChange={(e) => {
              setTo(Number(e.target.value));
            }}
          />
        </Label>
      </InputContainer>
      {isError ? (
        <WarningText>
          Minimum must not be 0 or higher than the maximum value.{' '}
        </WarningText>
      ) : (
        <Button type="button" onClick={handleOnEdit} disabled={isError}>
          Set
        </Button>
      )}
    </Container>
  );
}

export default EditPathLength;
