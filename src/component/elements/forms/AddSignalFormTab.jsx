import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import { memo } from 'react';
import { FaPlus } from 'react-icons/fa';

import Button from './elements/Button';
import Input from './elements/Input';

const AddSignalFormTabStyle = css`
  text-align: center;
  button {
    background-color: transparent;
    border: none;
  }
  input {
    background-color: transparent;
    border: 0.5px solid #dedede;
    height: 50%;
    width: 50%;
    text-align: center;
  }
`;

const AddSignalFormTab = memo(({ onAddSignal }) => {
  const { values } = useFormikContext();

  return (
    <div css={AddSignalFormTabStyle}>
      <Input name="newSignalFrom" type="number" />
      <Input name="newSignalTo" type="number" />
      <p>
        New signal size (ppm) :{' '}
        {(values.newSignalTo - values.newSignalFrom).toFixed(5)}
      </p>
      <Button name="addSignalButton" onClick={onAddSignal}>
        <FaPlus color="green" />
      </Button>
    </div>
  );
});

export default AddSignalFormTab;
