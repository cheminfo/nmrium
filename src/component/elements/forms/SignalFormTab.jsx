/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useFormikContext, FieldArray } from 'formik';
import { memo, useEffect, useCallback } from 'react';
import { FaMinus } from 'react-icons/fa';

import CouplingsTable from './CouplingsTable';
import Button from './elements/Button';

const SignalFormTabStyle = css`
  border-spacing: 0;
  border: 1px solid #dedede;
  width: 100%;
  font-size: 12px;
  height: 100%;

  margin: 0;
  padding: 0.4rem;
  text-align: center;

  .deleteSignalButton {
    background-color: transparent;
    border: 1px;
  }
`;

const SignalFormTab = memo(({ onDeleteSignal }) => {
  const { values, setFieldValue } = useFormikContext();

  useEffect(() => {
    const signal = values.signals[values.selectedSignalIndex];
    if (signal && signal.multiplicity) {
      // counter within j array to access to right j values
      let counterJ = 0;
      const couplings = [];
      signal.multiplicity.split('').forEach((_multiplicity) => {
        if (_multiplicity !== 's' && _multiplicity !== 'm') {
          couplings.push(signal.j[counterJ]);
          counterJ++;
        } else {
          couplings.push({ multiplicity: _multiplicity, coupling: '' });
        }
      });
      setFieldValue('selectedSignalCouplings', couplings);
    }
  }, [setFieldValue, values.selectedSignalIndex, values.signals]);

  const onAddCoupling = useCallback(
    (newCoupling) => {
      const _signals = values.signals.slice();
      const _signal = { ..._signals[values.selectedSignalIndex] };
      if (
        !_signal.j &&
        newCoupling.multiplicity !== 's' &&
        newCoupling.multiplicity !== 'm'
      ) {
        _signal.j = [];
      }
      if (
        newCoupling.multiplicity !== 's' &&
        newCoupling.multiplicity !== 'm'
      ) {
        _signal.j.push(newCoupling);
      }
      _signal.multiplicity = _signal.multiplicity.concat(
        newCoupling.multiplicity,
      );
      _signals[values.selectedSignalIndex] = _signal;

      setFieldValue('signals', _signals);
    },
    [setFieldValue, values.selectedSignalIndex, values.signals],
  );

  const onEditCoupling = useCallback(
    (index, editedCoupling) => {
      const _signals = values.signals.slice();
      const _signal = { ..._signals[values.selectedSignalIndex] };

      if (
        !_signal.j &&
        editedCoupling.multiplicity !== 's' &&
        editedCoupling.multiplicity !== 'm'
      ) {
        _signal.j = [];
      }

      let counterJ = 0;
      const multSplit = _signal.multiplicity.split('');
      for (let k = 0; k < multSplit.length; k++) {
        if (k === index) {
          if (
            editedCoupling.multiplicity !== 's' &&
            editedCoupling.multiplicity !== 'm'
          ) {
            // in case of "d", "t" etc. set the value in j array
            _signal.j[counterJ] = editedCoupling;
          } else {
            // in case of "s" or "m" remove the entry in j array
            _signal.j.splice(counterJ, 1);
          }
          // delete unnecessary empty j array
          if (_signal.j.length === 0) {
            delete _signal.j;
          }
          break;
        }
        if (multSplit[k] !== 's' && multSplit[k] !== 'm') {
          counterJ++;
        }
      }
      _signal.multiplicity =
        _signal.multiplicity.substr(0, index) +
        editedCoupling.multiplicity +
        _signal.multiplicity.substr(index + 1);

      _signals[values.selectedSignalIndex] = _signal;

      setFieldValue('signals', _signals);
    },
    [setFieldValue, values.selectedSignalIndex, values.signals],
  );

  const onDeleteCoupling = useCallback(
    (index, oldCoupling) => {
      const _signals = values.signals.slice();
      const _signal = { ..._signals[values.selectedSignalIndex] };

      let counterJ = 0;
      const multSplit = _signal.multiplicity.split('');
      for (let k = 0; k < multSplit.length; k++) {
        if (k === index) {
          if (
            oldCoupling.multiplicity !== 's' &&
            oldCoupling.multiplicity !== 'm'
          ) {
            // in case of "d", "t" etc. remove the entry in j array
            _signal.j.splice(counterJ, 1);
            // delete unnecessary empty j array
            if (_signal.j.length === 0) {
              delete _signal.j;
            }
          }

          break;
        }
        if (multSplit[k] !== 's' && multSplit[k] !== 'm') {
          counterJ++;
        }
      }
      _signal.multiplicity =
        _signal.multiplicity.substr(0, index) +
        _signal.multiplicity.substr(index + 1);

      _signals[values.selectedSignalIndex] = _signal;

      setFieldValue('signals', _signals);
    },
    [setFieldValue, values.selectedSignalIndex, values.signals],
  );

  return (
    <div css={SignalFormTabStyle}>
      <FieldArray
        name="selectedSignalCouplings"
        render={({ push, remove }) => (
          <div>
            <CouplingsTable
              push={push}
              remove={remove}
              onAddCoupling={onAddCoupling}
              onDeleteCoupling={onDeleteCoupling}
              onEditCoupling={onEditCoupling}
            />
          </div>
        )}
      />
      <Button
        className="deleteSignalButton"
        name="deleteSignalButton"
        onClick={onDeleteSignal}
      >
        <FaMinus color="red" title="Delete Signal" />
      </Button>
    </div>
  );
});

export default SignalFormTab;
