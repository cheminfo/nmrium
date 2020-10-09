import { Formik } from 'formik';
import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

const AppForm = forwardRef(
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

AppForm.defaultProps = {
  initialValues: {},
  onSubmit: () => null,
  validationSchema: null,
};
AppForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func,
  validationSchema: PropTypes.object,
};

export default AppForm;
