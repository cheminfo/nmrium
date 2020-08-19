import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import { memo, useState, useCallback, useEffect } from 'react';
// import { FaVectorSquare } from 'react-icons/fa';

// import { useChartData } from '../../../../context/ChartContext';
// import { useDispatch } from '../../../context/DispatchContext';
// import {
//   UNSET_SELECTED_NEW_SIGNAL_DELTA,
//   SET_NEW_SIGNAL_DELTA_SELECTION_IS_ENABLED,
// } from '../../../reducer/types/Types';
import Events from '../../../../utility/Events';
import Button from '../elements/Button';
import Input from '../elements/Input';

const AddSignalFormTabStyle = css`
  text-align: center;

  p {
    margin-top: 5px;
    // margin-bottom: 10px;
  }

  .infoText {
    margin-top: 3px;
    margin-bottom: 10px;
    font-size: 11px;
  }

  input {
    background-color: transparent;
    border: 0.5px solid #dedede;
    width: 50%;
    text-align: center;
  }

  .bt {
    width: 20px;
    height: 20px;
    padding: 2px;
    background-color: white;
  }

  .bt.active {
    background-color: gray;
    color: white;
  }

  .addSignalButton {
    margin-top: 15px;
    margin-top: 20px;
    background-color: transparent;
    border: 0.5px solid #dedede;
  }
`;

const AddSignalFormTab = memo(() => {
  const { values, setFieldValue, errors } = useFormikContext();

  const [disableAddButton, setDisableAddButton] = useState(false);
  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    const unsubscribe = Events.subscribe('brushEnd', (event) => {
      if (activeField) {
        setFieldValue(activeField, event.range[0] + event.range[1] / 2);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeField, setFieldValue]);

  const onAddSignal = useCallback(() => {
    const newSignal = {
      multiplicity: 'm',
      kind: 'signal',
      delta: Number(values.newSignalDelta),
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
        <p>Add delta value of new signal (ppm): </p>
        <p className="infoText">
          {/* (You can do mouse click (left) + shift key within the range in
          spectrum or type it in manually)  */}
          Focus on the input field and then Press Shift + Left mouse button to
          to select new range.
        </p>
        <Input
          name="newSignalDelta"
          type="number"
          placeholder={`${'\u0394'} (ppm)`}
          onFocus={(name) => setActiveField(name)}
          // onBlur={() => setActiveField(null)}
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
