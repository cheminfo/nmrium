import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import { useCallback, useEffect } from 'react';
import { FaTimes, FaSearchPlus } from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext';

import RangeForm from './forms/editRange/RangeForm';
// import {
//   UNSET_RANGE_IN_EDITION,
//   SET_NEW_SIGNAL_DELTA_SELECTION_IS_ENABLED,
//   UNSET_SELECTED_NEW_SIGNAL_DELTA,
//   SET_RANGE_IN_EDITION,
// } from '../reducer/types/Types';

const styles = css`
  overflow: auto;
  width: 600px;
  height: 500px;
  padding: 5px;
  button:focus {
    outline: none;
  }
  .header {
    height: 24px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    span {
      color: #464646;
      font-size: 15px;
      flex: 1;
    }

    button {
      background-color: transparent;
      border: none;
      svg {
        height: 16px;
      }
    }
    .zoom-button {
      background-color: transparent;
      border: none;
      svg {
        height: 16px;
      }
      margin-right: 10px;
    }
  }
  .container {
    display: flex;
    margin: 30px 5px;
    input,
    button {
      padding: 5px;
      border: 1px solid gray;
      border-radius: 5px;
      height: 36px;
      margin: 2px;
    }
    input {
      flex: 10;
    }
    button {
      flex: 2;
      color: white;
      background-color: gray;
    }
  }
`;

const EditRangeModal = ({ onSave, onClose, onZoom, range }) => {
  const dispatch = useDispatch();

  const handleOnZoom = useCallback(() => {
    onZoom(range);
  }, [onZoom, range]);

  useEffect(() => {
    handleOnZoom();
  }, [dispatch, handleOnZoom, range]);

  const handleOnClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleOnSave = useCallback(
    async (formValues) => {
      range.signal = formValues.signals.slice();
      await onSave(range);
      handleOnClose();
    },
    [handleOnClose, onSave, range],
  );

  return (
    <div css={styles}>
      <div className="header">
        <span>Range Information and Editing</span>
        <button type="button" onClick={handleOnZoom} className="zoom-button">
          <FaSearchPlus title="Set to default view on range in spectrum" />
        </button>
        <button type="button" onClick={handleOnClose} title="Close">
          <FaTimes />
        </button>
      </div>

      {range && (
        <RangeForm
          rangeData={range}
          handleOnClose={handleOnClose}
          handleOnSave={handleOnSave}
        />
      )}
    </div>
  );
};

EditRangeModal.defaultProps = {
  onSave: () => {
    return null;
  },
  onClose: () => {
    return null;
  },
  onZoom: () => {
    return null;
  },
};

export default EditRangeModal;
