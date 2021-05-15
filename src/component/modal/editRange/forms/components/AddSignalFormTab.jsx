/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext } from 'formik';
import { memo, useState, useCallback, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';

import Button from '../../../../elements/Button';
import Input from '../../../../elements/formik/Input';
import { translateMultiplet } from '../../../../panels/extra/utilities/MultiplicityUtilities';

const AddSignalFormTabStyle = css`
  text-align: center;
  width: 100%;
  height: 100%;

  .infoText {
    margin-top: 20px;
    font-size: 12px;
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
    border: none;
    padding: 0.3rem;
    border-radius: 25%;
  }
`;

function AddSignalFormTab({ onFocus, onBlur }) {
  const { values, setFieldValue, errors } = useFormikContext();

  const [disableAddButton, setDisableAddButton] = useState(false);

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
        <p className="infoText">
          Edit or select a delta value of new signal (ppm):
        </p>
        <Input
          name="newSignalDelta"
          type="number"
          placeholder={`𝛅 (ppm)`}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>

      <div>
        <Button
          className="addSignalButton"
          onClick={onAddSignal}
          disabled={disableAddButton}
          css={{
            color: disableAddButton ? 'grey' : 'blue',
            width: '100%',
          }}
        >
          <FaPlus title="Add new signal" />
        </Button>
      </div>
    </div>
  );
}

export default memo(AddSignalFormTab);
