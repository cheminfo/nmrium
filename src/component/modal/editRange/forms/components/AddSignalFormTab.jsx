/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext } from 'formik';
import { memo, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';

import Button from '../../../../elements/Button';
import Input from '../../../../elements/formik/Input';
import { translateMultiplet } from '../../../../panels/extra/utilities/MultiplicityUtilities';

const AddSignalFormTabStyle = css`
  text-align: center;
  width: 100%;
  height: 100%;
  padding: 0.4rem;

  .info-text {
    padding: 10px;
    font-size: 13px;
  }
  .input-notes {
    font-size: 10px;
    color: black;
    font-weight: bold;
  }

  input {
    background-color: transparent;
    border: 0.55px solid #dedede;
    width: 50%;
    text-align: center;
    outline: none;
  }

  .add-signal-container {
    border: 0.55px solid #dedede;
  }

  .addSignalButton {
    margin-top: 15px;
    margin-top: 20px;
    width: 100%;
    background-color: #fcfcfc;
    border-top: 0.55px solid #dedede;
    align-items: center;
    justify-content: center;
    display: flex;
    padding: 0.4rem;
    font-size: 12px;
  }
  .addSignalButton:disabled {
    opacity: 0.6;
  }
`;

function AddSignalFormTab({ onFocus, onBlur, rangeLabel }) {
  const { values, setFieldValue, errors } = useFormikContext();

  const onAddSignal = useCallback(() => {
    const newSignal = {
      multiplicity: 'm',
      kind: 'signal',
      delta: Number(values.newSignalDelta),
      j: [{ multiplicity: translateMultiplet('m'), coupling: '' }],
    };
    const _signals = values.signals.slice().concat(newSignal);

    setFieldValue('signals', _signals);
    setFieldValue('activeTab', String(_signals.length - 1));
  }, [setFieldValue, values.newSignalDelta, values.signals]);

  return (
    <div css={AddSignalFormTabStyle}>
      <div className="add-signal-container">
        <p className="info-text">
          Edit or select a delta value of new signal (ppm):
        </p>
        <Input
          name="newSignalDelta"
          type="number"
          placeholder={`𝛅 (ppm)`}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{
            ...(errors.newSignalDelta && { border: '1px solid red' }),
          }}
        />
        <p className="input-notes">[ {rangeLabel} ]</p>

        <Button
          className="addSignalButton"
          onClick={onAddSignal}
          disabled={errors.newSignalDelta}
        >
          <FaPlus
            title="Add new signal"
            color={errors.newSignalDelta ? 'grey' : 'blue'}
          />
        </Button>
      </div>
    </div>
  );
}

export default memo(AddSignalFormTab);
