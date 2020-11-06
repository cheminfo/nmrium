import { Formik } from 'formik';
import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

const FormikForm = forwardRef(
  ({ initialValues, onSubmit, validationSchema, children }, ref) => {
    return (
      <Formik
        innerRef={ref}
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        {() => <>{children}</>}
      </Formik>
    );
  },
);

FormikForm.defaultProps = {
  initialValues: {},
  onSubmit: () => null,
  validationSchema: null,
};
FormikForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func,
  validationSchema: PropTypes.object,
};

export default FormikForm;
