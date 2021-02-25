import lodashGet from 'lodash/get';

import FormikCheckBox from '../../elements/formik/FormikCheckBox';

const LIST = [
  {
    label: 'Spectra Panel',
    name: 'display.panels.hideSpectraPanel',
  },
  {
    label: 'Information Panel',
    name: 'display.panels.hideInformationPanel',
  },
  {
    label: 'Peaks Panel',
    name: 'display.panels.hidePeaksPanel',
  },
  {
    label: 'Integrals Panel',
    name: 'display.panels.hideIntegralsPanel',
  },
  {
    label: 'Ranges Panel',
    name: 'display.panels.hideRangesPanel',
  },
  {
    label: 'Structures Panel',
    name: 'display.panels.hideStructuresPanel',
  },
  {
    label: 'Filters Panel',
    name: 'display.panels.hideFiltersPanel',
  },
  {
    label: 'Zones Panel',
    name: 'display.panels.hideZonesPanel',
  },
  {
    label: 'Summary Panel',
    name: 'display.panels.hideSummaryPanel',
  },
  {
    label: 'Multiple Spectra Analysis Panel',
    name: 'display.panels.hideMultipleSpectraAnalysisPanel',
  },
];

function DisplayTabContent({ preferences }) {
  return (
    <>
      <p className="section-header">Show / Hide Panels</p>
      {LIST.map(
        (item) =>
          !lodashGet(preferences, `basePreferences.${item.name}`, false) && (
            <FormikCheckBox
              key={item.name}
              className="checkbox-element"
              label={item.label}
              name={item.name}
              reverse={true}
            />
          ),
      )}
    </>
  );
}

export default DisplayTabContent;
