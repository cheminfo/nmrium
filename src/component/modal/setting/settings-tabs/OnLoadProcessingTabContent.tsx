import { Checkbox, Tab, Tabs } from '@blueprintjs/core';
import type {
  WorkspacePreferences,
  AutoProcessingFilterEntry,
} from 'nmr-load-save';
import { useFormContext } from 'react-hook-form';

import IsotopesViewer from '../../../elements/IsotopesViewer.js';
import Label from '../../../elements/Label.js';
import ReactTable from '../../../elements/ReactTable/ReactTable.js';
import type { CustomColumn } from '../../../elements/ReactTable/utility/addCustomColumn.js';
import type { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer.js';
import { getFilterLabel } from '../../../../data/getFilterLabel.js';

function OnLoadProcessingTabContent() {
  const { register, watch } = useFormContext<WorkspacePreferences>();

  const isExperimentalFeatures =
    watch('display.general.experimentalFeatures.display') || false;
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

  const COLUMNS: Array<CustomColumn<AutoProcessingFilterEntry>> = [
    {
      index: 1,
      Header: '#',
      accessor: (_, index) => index + 1,
    },
    {
      index: 1,
      Header: 'Filter',
      accessor: (row) => getFilterLabel(row.name),
      style: { width: '60%' },
    },
    {
      index: 2,
      Header: 'Enable',
      Cell: ({ row }) => (
        <Checkbox
          style={{ margin: 0 }}
          {...register(
            `onLoadProcessing.filters.${nucleus}.${row.index}.enabled`,
          )}
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
