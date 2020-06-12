import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import { memo, useState, useCallback, useEffect } from 'react';

import Button from './elements/Button';
import Input from './elements/Input';

const AddSignalFormTabStyle = css`
  text-align: center;

  p {
    margin-top: 5px;
    margin-bottom: 10px;
  }

  input {
    background-color: transparent;
    border: 0.5px solid #dedede;
    width: 50%;
    text-align: center;
  }

  .addSignalButton {
    margin-top: 15px;
    background-color: transparent;
    border: 0.5px solid #dedede;
  }
`;

const AddSignalFormTab = memo(() => {
  const { values, setFieldValue, errors } = useFormikContext();

  const [disableAddButton, setDisableAddButton] = useState(false);

  const onAddSignal = useCallback(() => {
    const newSignal = {
      multiplicity: 'm',
      kind: 'signal',
      delta: values.newSignalDelta,
    };
    const _signals = values.signals.slice().concat(newSignal);
    setFieldValue('signals', _signals);
    setFieldValue('selectedSignalIndex', _signals.length - 1);
  }, [setFieldValue, values.newSignalDelta, values.signals]);

  useEffect(() => {
    if (errors.newSignalDelta) {
      setDisableAddButton(true);
    } else {
      setDisableAddButton(false);
    }
  }, [errors.newSignalDelta, values.signals]);

  return (
    <div css={AddSignalFormTabStyle}>
      <div>
        <p>Delta value of new signal (ppm): </p>
        <Input
          name="newSignalDelta"
          type="number"
          placeholder={`${'\u0394'} (ppm)`}
        />
      </div>

      <div>
        <Button
          className="addSignalButton"
          onClick={onAddSignal}
          disabled={disableAddButton}
          style={{
            color: disableAddButton ? 'grey' : 'blue',
          }}
        >
          Add Signal
        </Button>
      </div>
    </div>
  );
});

export default AddSignalFormTab;
