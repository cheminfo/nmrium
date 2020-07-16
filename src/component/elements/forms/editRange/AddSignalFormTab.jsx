import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import { memo, useState, useCallback, useEffect } from 'react';

import { useChartData } from '../../../context/ChartContext';
import { useDispatch } from '../../../context/DispatchContext';
import {
  UNSET_SELECTED_NEW_SIGNAL_DELTA,
  SET_NEW_SIGNAL_DELTA_SELECTION_IS_ENABLED,
} from '../../../reducer/types/Types';
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

  .addSignalButton {
    margin-top: 15px;
    margin-top: 20px;
    background-color: transparent;
    border: 0.5px solid #dedede;
  }
`;

const AddSignalFormTab = memo(() => {
  const { values, setFieldValue, errors } = useFormikContext();
  const { editRangeModalMeta } = useChartData();
  const dispatch = useDispatch();

  const [disableAddButton, setDisableAddButton] = useState(false);

  const onAddSignal = useCallback(() => {
    const newSignal = {
      multiplicity: 'm',
      kind: 'signal',
      delta: Number(values.newSignalDelta),
    };
    const _signals = values.signals.slice().concat(newSignal);
    setFieldValue('signals', _signals);
    setFieldValue('selectedSignalIndex', _signals.length - 1);

    dispatch({
      type: SET_NEW_SIGNAL_DELTA_SELECTION_IS_ENABLED,
      isEnabled: false,
    });
    dispatch({ type: UNSET_SELECTED_NEW_SIGNAL_DELTA });
  }, [dispatch, setFieldValue, values.newSignalDelta, values.signals]);

  useEffect(() => {
    if (errors.newSignalDelta) {
      setDisableAddButton(true);
    } else {
      setDisableAddButton(false);
    }
  }, [errors.newSignalDelta, values.signals]);

  useEffect(() => {
    if (editRangeModalMeta && editRangeModalMeta.newSignalDelta) {
      setFieldValue(
        'newSignalDelta',
        editRangeModalMeta.newSignalDelta.toFixed(5),
      );
    } else {
      setFieldValue(
        'newSignalDelta',
        ((values.from + values.to) / 2).toFixed(5),
      );
    }
  }, [editRangeModalMeta, setFieldValue, values.from, values.to]);

  return (
    <div css={AddSignalFormTabStyle}>
      <div>
        <p>Add delta value of new signal (ppm): </p>
        <p className="infoText">
          (You can do mouse click (left) + shift key within the range in
          spectrum or type it in manually)
        </p>
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
