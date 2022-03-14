import lodashGet from 'lodash/get';

import FormikCheckBox from '../../elements/formik/FormikCheckBox';
import { PreferencesState } from '../../reducer/preferencesReducer';

const LIST: Array<{ label: string; name: string }> = [
  {
    label: 'Spectra selection panel',
    name: 'panels.spectraPanel',
  },
  {
    label: 'Spectra information Panel',
    name: 'panels.informationPanel',
  },
  {
    label: 'Peaks and peak picking',
    name: 'panels.peaksPanel',
  },
  {
    label: 'Integration and integrals',
    name: 'panels.integralsPanel',
  },
  {
    label: '1D ranges peak picking',
    name: 'panels.rangesPanel',
  },
  {
    label: 'Chemical structure panel',
    name: 'panels.structuresPanel',
  },
  {
    label: 'Filters Panel',
    name: 'panels.filtersPanel',
  },
  {
    label: '2D zones peak picking',
    name: 'panels.zonesPanel',
  },
  {
    label: 'Assignment summary Panel',
    name: 'panels.summaryPanel',
  },
  {
    label: 'Multiple Spectra Analysis Panel',
    name: 'panels.multipleSpectraAnalysisPanel',
  },
  {
    label: 'Database Panel',
    name: 'panels.databasePanel',
  },
  {
    label: 'Prediction Panel',
    name: 'panels.predictionPanel',
  },
  {
    label: 'Experimental Features',
    name: 'general.experimentalFeatures',
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
          lodashGet(preferences, `display.${item.name}`) !== 'hide' && (
            <FormikCheckBox
              key={`display.${item.name}`}
              className="checkbox-element"
              label={item.label}
              name={`display.${item.name}`}
              // reverse
            />
          ),
      )}
    </>
  );
}

export default DisplayTabContent;
