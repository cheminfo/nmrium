import { Checkbox, Tab, Tabs } from '@blueprintjs/core';
import { WorkspacePreferences } from 'nmr-load-save';
import { BaseFilter } from 'nmr-processing';
import { useFormContext, useWatch } from 'react-hook-form';

import IsotopesViewer from '../../../elements/IsotopesViewer';
import Label from '../../../elements/Label';
import ReactTable from '../../../elements/ReactTable/ReactTable';
import { CustomColumn } from '../../../elements/ReactTable/utility/addCustomColumn';
import { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer';

function OnLoadProcessingTabContent() {
  const { register, control } = useFormContext<WorkspacePreferences>();

  const isExperimentalFeatures =
    useWatch({
      control,
      name: 'display.general.experimentalFeatures.display',
    }) || false;
  return (
    <div>
      <Label
        title="Enable auto processing on load"
        style={{ wrapper: { padding: '10px 0' } }}
      >
        <Checkbox
          style={{ margin: 0 }}
          {...register('onLoadProcessing.autoProcessing')}
          defaultChecked={false}
        />
      </Label>
      {isExperimentalFeatures && <AutoProcessingFilters />}
    </div>
  );
}

function AutoProcessingFilters() {
  const { getValues } = useFormContext<WorkspaceWithSource>();
  const autoProcessingFilters = getValues('onLoadProcessing.filters') || {};
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
  const { register } = useFormContext();

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
        <Checkbox
          style={{ margin: 0 }}
          {...register(`onLoadProcessing.filters.${nucleus}.${row.index}.flag`)}
          defaultChecked={false}
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
