/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Formik, Form } from 'formik';

// import MultiplicitiesForm from './MultiplicitiesForm';
import SignalsForm from './SignalsForm';
import {
  SaveButton,
  ResetButton,
  CloseButton,
} from './elements/DefaultButtons';
import RangeValidationSchema from './validation/RangeValidationScheme';

const ButtonContainerStyle = css`
  text-align: center;
  button {
    background-color: transparent;
    border: 1px solid #dedede;
  }
`;

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
        // selectedMultiplicityIndex: 0,
        signals: rangeData.signal.slice(),
        newSignalFrom: rangeData.from,
        newSignalTo: rangeData.to,
        selectedSignalIndex: 0,
        selectedSignalCouplings: [],
        newCouplingMultiplicity: '',
        newCouplingCoupling: '',
        spectrumData: spectrumData,
      }}
      validationSchema={RangeValidationSchema(spectrumData)}
      onSubmit={(values, { setSubmitting }) => {
        handleOnSave(values);
        setSubmitting(false);
      }}
    >
      {() => {
        return (
          <Form>
            <SignalsForm spectrumData={spectrumData} />

            <div css={ButtonContainerStyle}>
              <SaveButton />
              <ResetButton />
              <CloseButton onClose={handleOnClose} />
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default RangeForm;
