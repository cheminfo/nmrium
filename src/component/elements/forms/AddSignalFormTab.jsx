import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import { memo, useState, useCallback, useEffect } from 'react';

import detectSignal from '../../../data/data1d/detectSignal';

import Button from './elements/Button';
import Input from './elements/Input';

const AddSignalFormTabStyle = css`
  text-align: center;
  width: 100%;

  .inputComponent {
    height: 35px;
    margin-top: 5px;
    .label1 {
      float: left;
      width: 25%;
      text-align: left;
    }
    .InputDiv {
      float: left;
      width: 50%;
      .Input {
        background-color: transparent;
        border: 0.5px solid #dedede;
        width: 100%;
        text-align: center;
      }
    }
    .label2 {
      float: left;
      width: 25%;
      text-align: left;
    }
  }
  .controlComponent {
    height: 35px;
    margin-top: 5px;
    label {
      width: 25%;
      text-align: left;
    }
    input {
      background-color: transparent;
      border: 0.5px solid #dedede;
      width: 50%;
      text-align: center;
    }
  }
  .errorComponent {
    margin-top: 5px;
    p {
      color: red;
    }
  }
  .addSignalButton {
    background-color: transparent;
    border: 0.5px solid #dedede;
    // color: blue;
  }
`;

const AddSignalFormTab = memo(() => {
  const { values, setFieldValue, errors } = useFormikContext();

  const [isCalculating, setIsCalculating] = useState(false);
  const [isInvalidSignalSize, setIsInvalidSignalSize] = useState(false);
  const [noSignalDetection, setNoSignalDetection] = useState(false);
  const [disableAddButton, setDisableAddButton] = useState(false);

  const onAddSignal = useCallback(() => {
    const newSignal = detectSignal(
      values.spectrumData.x,
      values.spectrumData.re,
      values.newSignalFrom,
      values.newSignalTo,
      values.spectrumData.info.frequency,
    );
    if (
      newSignal &&
      newSignal.multiplicity &&
      newSignal.multiplicity.length > 0
    ) {
      const _signals = values.signals.slice().concat(newSignal);
      setFieldValue('signals', _signals);
      setFieldValue('selectedSignalIndex', _signals.length - 1);
      setNoSignalDetection(false);
    } else {
      setNoSignalDetection(true);
    }
  }, [
    setFieldValue,
    values.newSignalFrom,
    values.newSignalTo,
    values.signals,
    values.spectrumData.info.frequency,
    values.spectrumData.re,
    values.spectrumData.x,
  ]);

  useEffect(() => {
    if (isCalculating) {
      onAddSignal();
      setIsCalculating(false);
    }
  }, [isCalculating, onAddSignal]);

  useEffect(() => {
    if (values.newSignalTo <= values.newSignalFrom) {
      setIsInvalidSignalSize(true);
    } else {
      setIsInvalidSignalSize(false);
    }
  }, [values.newSignalFrom, values.newSignalTo]);

  useEffect(() => {
    if (
      isCalculating ||
      isInvalidSignalSize ||
      errors.newSignalFrom ||
      errors.newSignalTo
    ) {
      setDisableAddButton(true);
    } else {
      setDisableAddButton(false);
    }
  }, [
    // isBlockedByM,
    errors.newSignalFrom,
    errors.newSignalTo,
    isCalculating,
    isInvalidSignalSize,
    values.signals,
  ]);

  return (
    <div css={AddSignalFormTabStyle}>
      <div className="inputComponent">
        <p className="label1">From: </p>
        <div className="InputDiv">
          <Input className="Input" name="newSignalFrom" type="number" />
        </div>
        <p className="label2">&nbsp;ppm</p>
      </div>
      <div className="inputComponent">
        <p className="label1">To: </p>
        <div className="InputDiv">
          <Input className="Input" name="newSignalTo" type="number" />
        </div>
        <p className="label2">&nbsp;ppm</p>
      </div>
      <div className="controlComponent">
        <label>Delta: </label>
        <input
          type="number"
          value={((values.newSignalTo + values.newSignalFrom) / 2).toFixed(5)}
          disabled={true}
        />

        <label>&nbsp;ppm</label>
      </div>
      <div className="controlComponent">
        <label>Size: </label>
        <input
          type="number"
          value={(values.newSignalTo - values.newSignalFrom).toFixed(5)}
          disabled={true}
        />
        <label>&nbsp;ppm</label>
      </div>
      <div className="errorComponent">
        {isInvalidSignalSize ? (
          <p>Signal size must be greater than 0 ppm!</p>
        ) : null}
      </div>
      <div className="errorComponent">
        {noSignalDetection ? <p>Could not detect a signal!</p> : null}
      </div>
      <Button
        className="addSignalButton"
        onClick={async () => {
          setIsCalculating(true);
        }}
        disabled={disableAddButton}
        style={{
          color: disableAddButton ? 'grey' : 'blue',
        }}
      >
        {!isCalculating ? 'Add Signal' : 'Calculating...'}
      </Button>
    </div>
  );
});

export default AddSignalFormTab;
