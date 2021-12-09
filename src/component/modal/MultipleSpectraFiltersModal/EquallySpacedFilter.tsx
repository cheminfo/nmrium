import { FormikHelpers, FormikProps } from 'formik';
import { ForwardedRef, forwardRef } from 'react';

import { useChartData } from '../../context/ChartContext';
import Label from '../../elements/Label';
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
        <Label title="From : ">
          <FormikInput name="from" type="number" />
        </Label>
        <Label title="To : ">
          <FormikInput name="to" type="number" />
        </Label>
      </div>
      <div className="row margin-10">
        <Label className="custom-label" title="Number of points : ">
          <FormikInput name="numberOfPoints" type="number" />
        </Label>
      </div>
    </FormikForm>
  );
}

export default forwardRef(EquallySpacedFilter);
