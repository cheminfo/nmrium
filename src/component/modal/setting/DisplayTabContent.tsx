import lodashGet from 'lodash/get';
import { useMemo } from 'react';

import { NMRiumPreferences } from '../../NMRium';
import ReactTable from '../../elements/ReactTable/ReactTable';
import { CustomColumn } from '../../elements/ReactTable/utility/addCustomColumn';
import FormikCheckBox from '../../elements/formik/FormikCheckBox';

interface ListItem {
  label: string;
  name: string;
  hideOpenOption?: boolean;
}
const LIST: ListItem[] = [
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
    label: 'Databases Panel',
    name: 'panels.databasePanel',
  },
  {
    label: 'Prediction Panel',
    name: 'panels.predictionPanel',
  },
  {
    label: 'Automatic Assignment Panel',
    name: 'panels.automaticAssignmentPanel',
  },
  {
    label: 'Experimental Features',
    name: 'general.experimentalFeatures',
    hideOpenOption: true,
  },
];

interface DisplayTabContentProps {
  preferences: NMRiumPreferences;
}

function CheckBoxCell(props) {
  return (
    <FormikCheckBox
      style={{
        container: { display: 'block', margin: '0 auto', width: 'fit-content' },
      }}
      key={props.name}
      className="checkbox-element"
      name={props.name}
    />
  );
}

function DisplayTabContent({ preferences }: DisplayTabContentProps) {
  const COLUMNS: CustomColumn[] = useMemo(
    () => [
      {
        index: 1,
        Header: '#',
        Cell: ({ row }) => row.index + 1,
      },
      {
        index: 1,
        Header: 'Feature',
        accessor: 'label',
        style: { width: '60%' },
      },
      {
        index: 2,
        Header: 'Active',
        Cell: ({ row }) => (
          <CheckBoxCell name={`display.${row.original.name}.display`} />
        ),
      },
      {
        index: 3,
        Header: 'Open on load',
        Cell: ({ row }) =>
          !row.original.hideOpenOption ? (
            <CheckBoxCell name={`display.${row.original.name}.open`} />
          ) : (
            <div />
          ),
      },
    ],
    [],
  );

  const data = useMemo(() => {
    return LIST.filter(
      (item) => lodashGet(preferences, `${item.name}.hidden`) !== true,
    );
  }, [preferences]);

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <ReactTable columns={COLUMNS} data={data} />
    </div>
  );
}

export default DisplayTabContent;
