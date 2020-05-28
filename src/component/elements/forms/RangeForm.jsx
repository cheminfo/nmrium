/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Formik, Form } from 'formik';

import MultiplicitiesForm from './MultiplicitiesForm';
import SignalsForm from './SignalsForm';
import {
  SaveButton,
  ResetButton,
  CloseButton,
} from './elements/DefaultButtons';
import RangeValidationSchema from './validation/RangeValidationScheme';

const RangeForm = ({
  rangeData,
  spectrumData,
  handleOnClose,
  handleOnSave,
}) => {
  return (
    <Formik
      initialValues={{
        from: rangeData.from,
        to: rangeData.to,
        selectedSignalIndex: 0,
        selectedMultiplicityIndex: 0,
        signals: rangeData.signal.slice(),
        newSignalFrom: rangeData.from,
        newSignalTo: rangeData.to,
        spectrumData: spectrumData,
      }}
      validationSchema={RangeValidationSchema(spectrumData)}
      onSubmit={(values, { setSubmitting }) => {
        handleOnSave(values);
        setSubmitting(false);
      }}
    >
      {({ values }) => (
        <Form>
          <p>from (ppm): {values.from.toFixed(5)} </p>
          <p>to (ppm): {values.to.toFixed(5)} </p>
          <p>size (ppm) : {(values.to - values.from).toFixed(5)}</p>

          <p>
            signal count: {values.signals.length} ({values.selectedSignalIndex})
          </p>

          <div>
            <SignalsForm spectrumData={spectrumData} />
          </div>

          <div>
            <MultiplicitiesForm />
          </div>

          <SaveButton />
          <ResetButton />
          <CloseButton onClose={handleOnClose} />
        </Form>
      )}
    </Formik>
  );
};

export default RangeForm;
