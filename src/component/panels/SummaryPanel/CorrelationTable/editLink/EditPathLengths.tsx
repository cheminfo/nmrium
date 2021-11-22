/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodashCloneDeep from 'lodash/cloneDeep';
import { Types } from 'nmr-correlation';
import { useCallback, useEffect, useState } from 'react';

import PathLength from '../../../../../data/types/data2d/PathLength';
import Button from '../../../../elements/Button';
import Input from '../../../../elements/Input';
import { DefaultPathLengths } from '../Constants';

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
`;

interface InputProps {
  link: Types.Link;
  onEdit: (editedLink: Types.Link) => void;
}

function EditPathLengths({ link, onEdit }: InputProps) {
  const [min, setMin] = useState<number>(
    link.signal.pathLength?.min ||
      DefaultPathLengths[link.experimentType]?.min ||
      0,
  );
  const [max, setMax] = useState<number>(
    link.signal.pathLength?.max ||
      DefaultPathLengths[link.experimentType]?.max ||
      0,
  );
  const [isError, setIsError] = useState<boolean>(false);

  const handleOnEdit = useCallback(() => {
    const editedLink = lodashCloneDeep(link);
    const newPathLength: PathLength = {
      min,
      max,
      source: 'manual',
    };
    editedLink.signal.pathLength = newPathLength;
    onEdit(editedLink);
  }, [link, max, min, onEdit]);

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
      <Button type="button" onClick={handleOnEdit} disabled={isError}>
        Set
      </Button>
    </div>
  );
}

export default EditPathLengths;
