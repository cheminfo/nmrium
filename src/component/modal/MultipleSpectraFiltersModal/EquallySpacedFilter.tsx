import { FormikHelpers, FormikProps } from 'formik';
import { ForwardedRef, forwardRef } from 'react';

import { useChartData } from '../../context/ChartContext';
import FormikForm from '../../elements/formik/FormikForm';
import FormikInput from '../../elements/formik/FormikInput';

interface EquallySpacedFilterProps {
  onSubmit: (values: any, helper: FormikHelpers<any>) => void;
}

function EquallySpacedFilter(
  { onSubmit }: EquallySpacedFilterProps,
  ref: ForwardedRef<FormikProps<any>>,
) {
  const { xDomain } = useChartData();
  return (
    <FormikForm
      ref={ref}
      initialValues={{
        from: xDomain[0],
        to: xDomain[1],
        numberOfPoints: 1024,
      }}
      onSubmit={onSubmit}
    >
      <div className="row margin-10">
        <span className="custom-label">Range :</span>
        <FormikInput label="From : " name="from" type="number" />
        <FormikInput label="To :" name="to" type="number" />
      </div>
      <div className="row margin-10">
        <span className="custom-label">Number of points :</span>
        <FormikInput label="" name="numberOfPoints" type="number" />
      </div>
    </FormikForm>
  );
}

export default forwardRef(EquallySpacedFilter);
