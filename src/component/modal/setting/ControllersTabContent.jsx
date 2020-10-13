import React from 'react';

import FormikInput from '../../elements/formik/FormikInput';

const ControllersTabContent = () => {
  return (
    <>
      <p className="section-header">Mouse Scroll Wheel Sensitivity</p>
      <FormikInput type="number" label="Low" name="controllers.mws.low" />
      <FormikInput type="number" label="high" name="controllers.mws.high" />
    </>
  );
};

export default ControllersTabContent;
