import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import { useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';

import { Modal } from '../elements/Modal';
import RangeForm from '../elements/forms/RangeForm';

const styles = css`
  display: flex;
  flex-direction: column;
  width: 600px;
  height: 450px;
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

const basicMultiplets = [
  'singlet (s)',
  'doublet (d)',
  'triplet (t)',
  'quartet (q)',
  'quintet (i)',
  'sextet (x)',
  'septet (p)',
  'octet (o)',
  'nonet (n)',
  'massive (m)',
];

const multiplets = basicMultiplets.map((_multiplet, i) => {
  return {
    index: i,
    description: _multiplet,
    value: _multiplet.split('(')[1].charAt(0),
  };
});

const checkMultiplicity = (multiplicity) => {
  if (
    multiplicity === undefined ||
    multiplicity.length === 0 ||
    multiplicity === multiplets[0].value ||
    multiplicity === multiplets[0].description ||
    multiplicity === multiplets[9].value ||
    multiplicity === multiplets[9].description
  ) {
    return false;
  }

  return true;
};

const translateMultiplicity = (multiplicity) => {
  return multiplicity.length === 1
    ? multiplets.find((_multiplet) => _multiplet.value === multiplicity)
        .description
    : multiplets.find((_multiplet) => _multiplet.description === multiplicity)
        .value;
};

const EditRangeModal = ({
  isOpen,
  onSave,
  onClose,
  rangeData,
  spectrumData,
}) => {
  const handleOnSave = useCallback(
    (formValues) => {
      const editedRange = {
        ...rangeData,
        signal: formValues.signals,
      };
      console.log(editedRange);
      onSave(editedRange);
      onClose();
    },
    [onClose, onSave, rangeData],
  );

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div css={styles}>
        <div className="header">
          <span>Range Information and Editing</span>
          <button onClick={onClose} type="button">
            <FaTimes />
          </button>
        </div>

        {rangeData ? (
          <RangeForm
            rangeData={rangeData}
            spectrumData={spectrumData}
            handleOnClose={onClose}
            handleOnSave={handleOnSave}
            multiplets={multiplets}
            checkMultiplicity={checkMultiplicity}
            translateMultiplicity={translateMultiplicity}
          />
        ) : null}
      </div>
    </Modal>
  );
};

EditRangeModal.defaultProps = {
  onSave: () => {
    return null;
  },
  onClose: () => {
    return null;
  },
};

export default EditRangeModal;
