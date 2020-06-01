import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import { useCallback, useMemo } from 'react';
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
  'massive (m)',
  'singlet (s)',
  'doublet (d)',
  'triplet (t)',
  'quartet (q)',
  'quintet (i)',
  'sextet (x)',
  'septet (p)',
  'octet (o)',
  'nonet (n)',
];

const multiplets = basicMultiplets.map((_multiplet, i) => {
  return {
    index: i,
    description: _multiplet,
    value: _multiplet.split('(')[1].charAt(0),
  };
});

const checkMultiplicity = (multiplicity, options = {}) => {
  const checkOptions = { ...{ massive: true, singlet: true }, ...options };
  if (
    multiplicity === undefined ||
    multiplicity.length === 0 ||
    (checkOptions.massive &&
      (multiplicity === multiplets[0].value ||
        multiplicity === multiplets[0].description)) ||
    (checkOptions.singlet &&
      (multiplicity === multiplets[1].value ||
        multiplicity === multiplets[1].description))
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
  const diaIDs = useMemo(() => {
    return []
      .concat(
        rangeData.diaID ? rangeData.diaID.flat() : [],
        rangeData.signal
          ? rangeData.signal.map((_signal) => _signal.diaID).flat()
          : [],
      )
      .filter((_diaID, i, _diaIDs) => _diaIDs.indexOf(_diaID) === i);
  }, [rangeData.diaID, rangeData.signal]);

  const resetDiaIDs = useCallback(
    (range) => {
      const _range = { ...range };

      _range.diaID = _range.signal.find((_signal) =>
        _signal.multiplicity
          .split('')
          .find((mult) => !checkMultiplicity(mult, { singlet: false })),
      )
        ? diaIDs
        : [];
      _range.signal = _range.signal.map((signal) => {
        const _signal = { ...signal };
        if (
          // in case of no "m" but at least one of the others in signal's multiplicity string save the diaID on signal level
          signal.multiplicity
            .split('')
            .find((mult) => checkMultiplicity(mult, { singlet: false }))
        ) {
          _signal.diaID = diaIDs;
        } else {
          _signal.diaID = [];
        }
        return _signal;
      });

      return _range;
    },
    [diaIDs],
  );

  const handleOnSave = useCallback(
    (formValues) => {
      let editedRange = {
        ...rangeData,
        signal: formValues.signals,
      };
      editedRange = resetDiaIDs(editedRange);
      onSave(editedRange);
      onClose();
    },
    [onClose, onSave, rangeData, resetDiaIDs],
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
