import { jsx } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import { memo } from 'react';
import { FaPlus } from 'react-icons/fa';

import Button from './elements/Button';
import Input from './elements/Input';

const AddSignalFormTab = memo(({ onAddSignal }) => {
  const { values } = useFormikContext();

  return (
    <div>
      <Input
        label="new Signal: From (ppm)"
        name="newSignalFrom"
        type="number"
      />
      <Input label="new Signal: to (ppm)" name="newSignalTo" type="number" />
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
