import { Tab, Tabs } from '@blueprintjs/core';
import { useFormikContext } from 'formik';
import { WorkspacePreferences } from 'nmr-load-save';
import { BaseFilter } from 'nmr-processing';

import { CheckBoxCell } from '../../../elements/CheckBoxCell';
import IsotopesViewer from '../../../elements/IsotopesViewer';
import Label from '../../../elements/Label';
import ReactTable from '../../../elements/ReactTable/ReactTable';
import { CustomColumn } from '../../../elements/ReactTable/utility/addCustomColumn';
import FormikCheckBox from '../../../elements/formik/FormikCheckBox';

function OnLoadProcessingTabContent() {
  const { values } = useFormikContext<WorkspacePreferences>();
  const isExperimentalFeatures =
    values.display?.general?.experimentalFeatures?.display || false;

  return (
    <div>
      <Label
        title="Enable auto processing on load"
        style={{ wrapper: { padding: '10px 0' } }}
      >
        <FormikCheckBox name="onLoadProcessing.autoProcessing" />
      </Label>
      {isExperimentalFeatures && <AutoProcessingFilters />}
    </div>
  );
}

function AutoProcessingFilters() {
  const { values } = useFormikContext<WorkspacePreferences>();
  const autoProcessingFilters = values?.onLoadProcessing?.filters || {};
  const tabItems = Object.keys(autoProcessingFilters).map((nucleus) => ({
    id: nucleus,
    title: <IsotopesViewer value={nucleus} />,
    content: (
      <FiltersTable data={autoProcessingFilters[nucleus]} nucleus={nucleus} />
    ),
  }));
  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <Tabs>
        {tabItems.map((item) => (
          <Tab
            id={item.id}
            key={item.id}
            title={item.title}
            panel={item.content}
          />
        ))}
      </Tabs>
    </div>
  );
}

function FiltersTable({ data, nucleus }) {
  const COLUMNS: Array<CustomColumn<BaseFilter>> = [
    {
      index: 1,
      Header: '#',
      accessor: (_, index) => index + 1,
    },
    {
      index: 1,
      Header: 'Filter',
      accessor: 'label',
      style: { width: '60%' },
    },
    {
      index: 2,
      Header: 'Enable',
      Cell: ({ row }) => (
        <CheckBoxCell
          name={`onLoadProcessing.filters.${nucleus}.${row.index}.flag`}
          defaultValue={false}
        />
      ),
    },
  ];
  return (
    <ReactTable
      columns={COLUMNS}
      data={data}
      rowStyle={{
        hover: { backgroundColor: '#f7f7f7' },
        active: { backgroundColor: '#f5f5f5' },
      }}
    />
  );
}

export default OnLoadProcessingTabContent;
