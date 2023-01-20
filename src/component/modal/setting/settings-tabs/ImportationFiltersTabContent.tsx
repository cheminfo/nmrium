import { CheckBoxCell } from '../../../elements/CheckBoxCell';
import { GroupPane } from '../../../elements/GroupPane';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import FormikInput from '../../../elements/formik/FormikInput';

interface ListItem {
  label: string;
  name: string;
  fieldType: 'input' | 'checkbox';
}

const GENERAL_LIST: ListItem[] = [
  {
    label: 'Keep FID',
    name: 'general.keepFID',
    fieldType: 'checkbox',
  },
  {
    label: 'Keep FT',
    name: 'general.keepFT',
    fieldType: 'checkbox',
  },
  {
    label: 'Keep 1D',
    name: 'general.keep1D',
    fieldType: 'checkbox',
  },
  {
    label: 'Keep 2D',
    name: 'general.keep2D',
    fieldType: 'checkbox',
  },
  {
    label: 'Only Real',
    name: 'general.onlyReal',
    fieldType: 'checkbox',
  },
];
const BRUKER_LIST: ListItem[] = [
  {
    label: 'Processing Numbers',
    name: 'bruker.processingNumbers',
    fieldType: 'input',
  },
  {
    label: 'Experiment Numbers',
    name: 'bruker.experimentNumbers',
    fieldType: 'input',
  },
  {
    label: 'Only First Processed Data',
    name: 'bruker.onlyFirstProcessedData',
    fieldType: 'checkbox',
  },
];

const COLUMNS: Column<ListItem>[] = [
  {
    Header: '#',
    style: { width: '10px' },
    accessor: (_, index) => index + 1,
  },
  {
    Header: 'Feature',
    accessor: 'label',
    style: { width: '70%' },
  },
  {
    Header: ' ',
    Cell: ({ row }) => {
      const fieldType = row.original.fieldType;
      switch (fieldType) {
        case 'checkbox':
          return (
            <CheckBoxCell
              name={`nmrLoaders.${row.original.name}`}
              defaultValue={false}
            />
          );
        case 'input':
          return (
            <FormikInput
              name={`nmrLoaders.${row.original.name}`}
              type="string"
              style={{ input: { width: '100%', padding: 0 } }}
              nullable
            />
          );
        default:
          return <span />;
      }
    },
  },
];

function ImportationFiltersTabContent() {
  return (
    <>
      <GroupPane text="General">
        <ReactTable columns={COLUMNS} data={GENERAL_LIST} />
      </GroupPane>
      <GroupPane text="Bruker">
        <ReactTable columns={COLUMNS} data={BRUKER_LIST} />
      </GroupPane>
    </>
  );
}

export default ImportationFiltersTabContent;
