import React from 'react';

import FormikCheckBox from '../../elements/formik/FormikCheckBox';

const DisplayTabContent = () => {
  return (
    <>
      <p className="section-header">Show / Hid Panels</p>
      <FormikCheckBox
        className="checkbox-element"
        label="Spectra Panel"
        name="display.panels.hideSpectraPanel"
        reverse={true}
      />
      <FormikCheckBox
        className="checkbox-element"
        label="Information Panel"
        name="display.panels.hideInformationPanel"
        reverse={true}
      />
      <FormikCheckBox
        className="checkbox-element"
        label="Peaks Panel"
        name="display.panels.hidePeaksPanel"
        reverse={true}
      />
      <FormikCheckBox
        className="checkbox-element"
        label="Integrals Panel"
        name="display.panels.hideIntegralsPanel"
        reverse={true}
      />
      <FormikCheckBox
        className="checkbox-element"
        label="Ranges Panel"
        name="display.panels.hideRangesPanel"
        reverse={true}
      />
      <FormikCheckBox
        className="checkbox-element"
        label="Structures Panel"
        name="display.panels.hideStructuresPanel"
        reverse={true}
      />
      <FormikCheckBox
        className="checkbox-element"
        label="Filters Panel"
        name="display.panels.hideFiltersPanel"
        reverse={true}
      />
      <FormikCheckBox
        className="checkbox-element"
        label="Zones Panel"
        name="display.panels.hideZonesPanel"
        reverse={true}
      />
      <FormikCheckBox
        className="checkbox-element"
        label="Summary Panel"
        name="display.panels.hideSummaryPanel"
        reverse={true}
      />
      <FormikCheckBox
        className="checkbox-element"
        label="Multiple Spectra Analysis Panel"
        name="display.panels.hideMultipleSpectraAnalysisPanel"
        reverse={true}
      />
    </>
  );
};

export default DisplayTabContent;
