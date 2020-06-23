/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Formik, Form } from 'formik';
import { useMemo } from 'react';

import { hasCouplingConstant } from '../../../panels/extra/utilities/MultiplicityUtilities';
import { SaveButton, CancelButton } from '../elements/DefaultButtons';
import EditRangeValidation from '../validation/EditRangeValidation';

import SignalsForm from './SignalsForm';

const FormButtonStyle = css`
  text-align: center;
  button {
    background-color: transparent;
    border: 1px solid #dedede;
    margin-top: 40px;
  }
`;

const RangeForm = ({ rangeData, handleOnClose, handleOnSave }) => {
  const initialStateSignalCouplings = useMemo(() => {
    const signal = rangeData.signal[0];
    if (signal && signal.multiplicity) {
      // counter within j array to access to right j values
      let counterJ = 0;
      const couplings = [];
      let coupling;
      signal.multiplicity.split('').forEach((_multiplicity) => {
        if (hasCouplingConstant(_multiplicity)) {
          coupling = { ...signal.j[counterJ] };
          counterJ++;
        } else {
          coupling = { multiplicity: _multiplicity, coupling: '' };
        }
        couplings.push(coupling);
      });
      return couplings;
    }
  }, [rangeData.signal]);

  return (
    <Formik
      initialValues={{
        from: rangeData.from,
        to: rangeData.to,
        signals: rangeData.signal.slice(),
        newSignalDelta: (rangeData.from + rangeData.to) / 2,
        selectedSignalIndex: 0,
        selectedSignalCouplings: initialStateSignalCouplings,
        newCouplingMultiplicity: '',
        newCouplingCoupling: '',
      }}
      validate={(values) => EditRangeValidation(values, rangeData)}
      onSubmit={(values, { setSubmitting }) => {
        handleOnSave(values);
        setSubmitting(false);
      }}
    >
      {() => {
        return (
          <Form>
            <SignalsForm />
            <div css={FormButtonStyle}>
              <SaveButton />
              <CancelButton onCancel={handleOnClose} />
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default RangeForm;
