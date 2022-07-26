import { useMemo } from 'react';

import { CheckBoxCell } from '../../elements/CheckBoxCell';
import ReactTable from '../../elements/ReactTable/ReactTable';
import { CustomColumn } from '../../elements/ReactTable/utility/addCustomColumn';

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
    label: 'Spectra information panel',
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
    label: 'Filters panel',
    name: 'panels.filtersPanel',
  },
  {
    label: '2D zones peak picking',
    name: 'panels.zonesPanel',
  },
  {
    label: 'Assignment summary panel',
    name: 'panels.summaryPanel',
  },
  {
    label: 'Multiple spectra analysis panel',
    name: 'panels.multipleSpectraAnalysisPanel',
  },
  {
    label: 'Databases panel',
    name: 'panels.databasePanel',
  },
  {
    label: 'Prediction panel',
    name: 'panels.predictionPanel',
  },
  {
    label: 'Automatic assignment panel',
    name: 'panels.automaticAssignmentPanel',
  },
  {
    label: 'Experimental features',
    name: 'general.experimentalFeatures',
    hideOpenOption: true,
  },
];

function DisplayTabContent() {
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
          <CheckBoxCell
            name={`display.${row.original.name}.display`}
            defaultValue={false}
          />
        ),
      },
      {
        index: 3,
        Header: 'Open on load',
        Cell: ({ row }) =>
          !row.original.hideOpenOption ? (
            <CheckBoxCell
              name={`display.${row.original.name}.open`}
              defaultValue={false}
            />
          ) : (
            <div />
          ),
      },
    ],
    [],
  );

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <ReactTable columns={COLUMNS} data={LIST} />
    </div>
  );
}

export default DisplayTabContent;
