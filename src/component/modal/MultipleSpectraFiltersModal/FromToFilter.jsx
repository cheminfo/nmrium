import React, { forwardRef } from 'react';

import { useChartData } from '../../context/ChartContext';
import FormikForm from '../../elements/formik/FormikForm';
import FormikInput from '../../elements/formik/FormikInput';

function FromToFilter({ onSubmit }, ref) {
  const { xDomain } = useChartData();
  return (
    <FormikForm
      ref={ref}
      initialValues={{ from: xDomain[0], to: xDomain[1] }}
      onSubmit={onSubmit}
    >
      <div className="row margin-10">
        <span className="custom-label">Range :</span>
        <FormikInput label="From : " name="from" type="number" />
        <FormikInput label="To :" name="to" type="number" />
      </div>
    </FormikForm>
  );
}

export default forwardRef(FromToFilter);
