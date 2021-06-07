import { Formik, FormikHelpers } from 'formik';
import { ReactNode } from 'react';

import { forwardRefWithAs } from '../../../utils';

interface FormikFormProps {
  initialValues?: any;
  onSubmit?: (values: any, helpers: FormikHelpers<any>) => void;
  validationSchema?: any;
  children: Array<ReactNode> | ReactNode;
  ref: any;
}

const FormikForm = forwardRefWithAs((props: FormikFormProps, ref: any) => {
  const {
    onSubmit = () => null,
    initialValues = {},
    validationSchema = null,
  } = props;

  return (
    <Formik
      innerRef={ref}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    >
      <div>{props.children}</div>
    </Formik>
  );
});

export default FormikForm;
