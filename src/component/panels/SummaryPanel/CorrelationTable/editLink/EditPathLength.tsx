/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useState } from 'react';

import DefaultPathLengths from '../../../../../data/constants/DefaultPathLengths';
import { Signal2D } from '../../../../../data/types/data2d';
import PathLength from '../../../../../data/types/data2d/PathLength';
import Button from '../../../../elements/Button';
import Input from '../../../../elements/Input';

const editPathLengthsStyles = css`
  width: 100%;
  height: 100%;
  margin-top: 10px;
  text-align: center;

  .input-container {
    width: 100%;
    margin-top: 5px;
    text-align: center;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
    width: 60px;

    color: white;
    background-color: gray;
  }

  .warning {
    margin-top: 5px;
    color: red;
  }
`;

interface InputProps {
  signal: Signal2D;
  experimentType: string;
  onEdit: (editedSignal: Signal2D) => void;
}

function EditPathLength({ signal, experimentType, onEdit }: InputProps) {
  const [min, setMin] = useState<number>(
    signal.pathLength?.min || DefaultPathLengths[experimentType]?.min || 0,
  );
  const [max, setMax] = useState<number>(
    signal.pathLength?.max || DefaultPathLengths[experimentType]?.max || 0,
  );
  const [isError, setIsError] = useState<boolean>(false);

  const handleOnEdit = useCallback(() => {
    const newPathLength: PathLength = {
      min,
      max,
      source: 'manual',
    };
    const editedSignal = { ...signal, pathLength: newPathLength };

    onEdit(editedSignal);
  }, [max, min, onEdit, signal]);

  useEffect(() => {
    setIsError(min <= 0 || min > max);
  }, [max, min]);

  return (
    <div css={editPathLengthsStyles}>
      <p>Setting of the minimum and maximum path length.</p>
      <div className="input-container">
        <Input
          type="number"
          value={min}
          label="Min: "
          onChange={(e) => {
            setMin(Number(e.target.value));
          }}
          style={{ input: { color: isError ? 'red' : 'black' } }}
        />
        <Input
          type="number"
          value={max}
          label="Max:"
          onChange={(e) => {
            setMax(Number(e.target.value));
          }}
        />
      </div>
      {isError ? (
        <p className="warning">
          Minimum must not be 0 or higher than the maximum value.{' '}
        </p>
      ) : (
        <Button type="button" onClick={handleOnEdit} disabled={isError}>
          Set
        </Button>
      )}
    </div>
  );
}

export default EditPathLength;
