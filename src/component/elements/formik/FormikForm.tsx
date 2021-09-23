import { Formik, FormikHelpers, FormikProps } from 'formik';
import { ForwardedRef, forwardRef, ReactNode } from 'react';

interface FormikFormProps {
  initialValues?: any;
  onSubmit?: (values: any, helpers: FormikHelpers<any>) => void;
  validationSchema?: any;
  children?: Array<ReactNode> | ReactNode;
}

const FormikForm = forwardRef(
  (props: FormikFormProps, ref: ForwardedRef<FormikProps<any>>) => {
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
        <>{props.children}</>
      </Formik>
    );
  },
);

export default FormikForm;
