/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useFormikContext, FieldArray } from 'formik';
import { memo, useEffect, useCallback } from 'react';

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
    border: 1px solid #dedede;
    margin-top: 5px;
    color: red;
  }
`;

const SignalFormTab = memo(
  ({ onDeleteSignal, checkMultiplicity, translateMultiplicity }) => {
    const { values, setFieldValue } = useFormikContext();

    useEffect(() => {
      const signal = values.signals[values.selectedSignalIndex];
      if (signal && signal.multiplicity) {
        // counter within j array to access to right j values
        let counterJ = 0;
        const couplings = [];
        let coupling;
        signal.multiplicity.split('').forEach((_multiplicity) => {
          if (checkMultiplicity(_multiplicity)) {
            coupling = { ...signal.j[counterJ] };
            counterJ++;
          } else {
            coupling = { multiplicity: _multiplicity, coupling: '' };
          }
          coupling.multiplicity = translateMultiplicity(coupling.multiplicity);
          couplings.push(coupling);
        });
        setFieldValue('selectedSignalCouplings', couplings);
      }
    }, [
      checkMultiplicity,
      setFieldValue,
      translateMultiplicity,
      values.selectedSignalIndex,
      values.signals,
    ]);

    const onAddCoupling = useCallback(
      (newCoupling) => {
        if (!checkMultiplicity(newCoupling.multiplicity)) {
          newCoupling.coupling = '';
        }
        newCoupling.multiplicity = translateMultiplicity(
          newCoupling.multiplicity,
        );
        const _signals = values.signals.slice();
        const _signal = { ..._signals[values.selectedSignalIndex] };
        if (!_signal.j && checkMultiplicity(newCoupling.multiplicity)) {
          _signal.j = [];
        }
        if (checkMultiplicity(newCoupling.multiplicity)) {
          _signal.j.push(newCoupling);
        }
        _signal.multiplicity = _signal.multiplicity.concat(
          newCoupling.multiplicity,
        );
        _signals[values.selectedSignalIndex] = _signal;

        setFieldValue('signals', _signals);
      },
      [
        checkMultiplicity,
        setFieldValue,
        translateMultiplicity,
        values.selectedSignalIndex,
        values.signals,
      ],
    );

    const onEditCoupling = useCallback(
      (index, editedCoupling) => {
        if (!checkMultiplicity(editedCoupling.multiplicity)) {
          editedCoupling.coupling = '';
        }
        editedCoupling.multiplicity = translateMultiplicity(
          editedCoupling.multiplicity,
        );
        const _signals = values.signals.slice();
        const _signal = { ..._signals[values.selectedSignalIndex] };

        if (!_signal.j && checkMultiplicity(editedCoupling.multiplicity)) {
          _signal.j = [];
        }

        let counterJ = 0;
        const multSplit = _signal.multiplicity.split('');
        for (let k = 0; k < multSplit.length; k++) {
          if (k === index) {
            if (checkMultiplicity(editedCoupling.multiplicity)) {
              // in case of "d", "t" etc. set the value in j array
              _signal.j[counterJ] = editedCoupling;
            } else {
              // in case of "s" or "m" remove the entry in j array
              if (_signal.j) {
                _signal.j.splice(counterJ, 1);
              }
            }
            // delete unnecessary empty j array
            if (_signal.j && _signal.j.length === 0) {
              delete _signal.j;
            }
            break;
          }
          if (checkMultiplicity(multSplit[k])) {
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
      [
        checkMultiplicity,
        setFieldValue,
        translateMultiplicity,
        values.selectedSignalIndex,
        values.signals,
      ],
    );

    const onDeleteCoupling = useCallback(
      (index, oldCoupling) => {
        oldCoupling.multiplicity = translateMultiplicity(
          oldCoupling.multiplicity,
        );
        const _signals = values.signals.slice();
        const _signal = { ..._signals[values.selectedSignalIndex] };

        let counterJ = 0;
        const multSplit = _signal.multiplicity.split('');
        for (let k = 0; k < multSplit.length; k++) {
          if (k === index) {
            if (checkMultiplicity(oldCoupling.multiplicity)) {
              // in case of "d", "t" etc. remove the entry in j array
              _signal.j.splice(counterJ, 1);
              // delete unnecessary empty j array
              if (_signal.j.length === 0) {
                delete _signal.j;
              }
            }
            break;
          }
          if (checkMultiplicity(multSplit[k])) {
            counterJ++;
          }
        }
        _signal.multiplicity =
          _signal.multiplicity.substr(0, index) +
          _signal.multiplicity.substr(index + 1);

        _signals[values.selectedSignalIndex] = _signal;

        setFieldValue('signals', _signals);
      },
      [
        checkMultiplicity,
        setFieldValue,
        translateMultiplicity,
        values.selectedSignalIndex,
        values.signals,
      ],
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
                checkMultiplicity={checkMultiplicity}
              />
            </div>
          )}
        />
        <Button
          className="deleteSignalButton"
          name="deleteSignalButton"
          onClick={onDeleteSignal}
          title="Delete Signal"
        >
          Delete Signal
        </Button>
      </div>
    );
  },
);

export default SignalFormTab;
