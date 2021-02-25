/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import CloseButton from '../../elements/CloseButton';

const modalContainer = css`
  overflow: auto;
  width: 300px;
  height: 300px;
  padding: 5px;
  button:focus {
    outline: none;
  }
  text-align: center;

  .header {
    height: 24px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;

    button {
      height: 36px;
      margin: 2px;
      background-color: transparent;
      border: none;
      svg {
        height: 16px;
      }
    }
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
    width: 20%;

    color: white;
    background-color: gray;
  }

  .info {
    margin-top: 0;
    margin-bottom: 10px;
    padding: 0px 10px;
    width: 100%;

    text-align: center;
  }

  input {
    border-radius: 5px;
    border: 0.55px solid #c7c7c7;
    margin: 0px 5px 0px 5px;
    text-align: center;
  }
`;

function SetShiftToleranceModal({ onClose, onSave, previousTolerance }) {
  const [tolerance, setTolerance] = useState();

  useEffect(() => {
    if (previousTolerance) {
      setTolerance(previousTolerance);
    } else {
      setTolerance(undefined);
    }
  }, [previousTolerance]);

  const onSaveHandler = useCallback(() => {
    onSave(tolerance);
    onClose();
  }, [onClose, onSave, tolerance]);

  const onChangeHandler = useCallback(
    (e, atomType) =>
      setTolerance({ ...tolerance, [atomType]: Number(e.target.value) }),
    [tolerance],
  );

  const inputFields = useMemo(() => {
    return tolerance
      ? Object.keys(tolerance).map((atomType) => {
          return (
            <div
              key={`toleranceInputField_${atomType}`}
              className="input-field"
            >
              <span>{atomType}: </span>
              <input
                type="number"
                onChange={(e) => onChangeHandler(e, atomType)}
                defaultValue={tolerance[atomType]}
              />
            </div>
          );
        })
      : undefined;
  }, [onChangeHandler, tolerance]);

  return (
    <div css={modalContainer}>
      <div className="header">
        <CloseButton onClick={onClose} />
      </div>
      <div>
        <p className="info">Shift tolerances: </p>
      </div>
      {inputFields}
      <button type="button" onClick={onSaveHandler}>
        Set
      </button>
    </div>
  );
}

SetShiftToleranceModal.defaultProps = {
  onSave: () => {
    return null;
  },
  onClose: () => {
    return null;
  },
};

export default SetShiftToleranceModal;
