import { jsx } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import { memo, useMemo } from 'react';
import { FaMinus } from 'react-icons/fa';

import Button from './elements/Button';

const SignalFormTab = memo(({ onDeleteSignal }) => {
  const { values } = useFormikContext();
  const signal = useMemo(() => {
    return values.signals[values.selectedSignalIndex];
  }, [values.selectedSignalIndex, values.signals]);

  return (
    <div>
      {signal.from && signal.to ? (
        <div>
          <p>From (ppm) : {signal.from.toFixed(5)}</p>
          <p>To (ppm) : {signal.to.toFixed(5)}</p>
          <p>Signal size (ppm) : {(signal.to - signal.from).toFixed(5)}</p>
        </div>
      ) : null}

      <Button name="deleteSignalButton" onClick={onDeleteSignal}>
        <FaMinus color="red" />
      </Button>
    </div>
  );
});

export default SignalFormTab;
