/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FromTo } from 'cheminfo-types';
import { useCallback, useEffect, useState } from 'react';

import DefaultPathLengths from '../../../../../data/constants/DefaultPathLengths';
import { Signal2D } from '../../../../../data/types/data2d';
import Button from '../../../../elements/Button';
import Input from '../../../../elements/Input';
import Label from '../../../../elements/Label';
import isDefaultPathLength from '../../../../modal/editZone/validation/isDefaultPathLength';

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
    <div css={editPathLengthsStyles}>
      <p>Setting of the minimum and maximum path length (J coupling).</p>
      <div className="input-container">
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
