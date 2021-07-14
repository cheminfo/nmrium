import lodashGet from 'lodash/get';

import FormikCheckBox from '../../elements/formik/FormikCheckBox';
import { PreferencesState } from '../../reducer/preferencesReducer';

const LIST: Array<{ label: string; name: string }> = [
  {
    label: 'Spectra selection panel',
    name: 'display.panels.hideSpectraPanel',
  },
  {
    label: 'Spectra information Panel',
    name: 'display.panels.hideInformationPanel',
  },
  {
    label: 'Peaks and peak picking',
    name: 'display.panels.hidePeaksPanel',
  },
  {
    label: 'Integration and integrals',
    name: 'display.panels.hideIntegralsPanel',
  },
  {
    label: '1D ranges peak picking',
    name: 'display.panels.hideRangesPanel',
  },
  {
    label: 'Chemical structure panel',
    name: 'display.panels.hideStructuresPanel',
  },
  {
    label: 'Filters Panel',
    name: 'display.panels.hideFiltersPanel',
  },
  {
    label: '2D zones peak picking',
    name: 'display.panels.hideZonesPanel',
  },
  {
    label: 'Assignment summary Panel',
    name: 'display.panels.hideSummaryPanel',
  },
  {
    label: 'Multiple Spectra Analysis Panel',
    name: 'display.panels.hideMultipleSpectraAnalysisPanel',
  },
];

interface DisplayTabContentProps {
  preferences: PreferencesState;
}

function DisplayTabContent({ preferences }: DisplayTabContentProps) {
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
              reverse
            />
          ),
      )}
    </>
  );
}

export default DisplayTabContent;
