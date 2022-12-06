import { Formik, FormikHelpers, FormikProps } from 'formik';
import { ForwardedRef, forwardRef } from 'react';

import { useChartData } from '../../context/ChartContext';
import Label from '../../elements/Label';
import FormikInput from '../../elements/formik/FormikInput';

interface FromToFilterProps {
  onSubmit: (values: any, helper: FormikHelpers<any>) => void;
}

function FromToFilter(
  { onSubmit }: FromToFilterProps,
  ref: ForwardedRef<FormikProps<any>>,
) {
  const { xDomain } = useChartData();
  return (
    <Formik
      innerRef={ref}
      initialValues={{ from: xDomain[0], to: xDomain[1] }}
      onSubmit={onSubmit}
    >
      <div className="row margin-10">
        <span className="custom-label">Range :</span>
        <Label title="From :">
          <FormikInput name="from" type="number" />
        </Label>
        <Label title="To :">
          <FormikInput name="to" type="number" />
        </Label>
      </div>
    </Formik>
  );
}

export default forwardRef(FromToFilter);
