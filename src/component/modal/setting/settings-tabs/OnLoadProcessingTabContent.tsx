import { useFormikContext } from 'formik';
import { WorkspacePreferences } from 'nmr-load-save';
import { BaseFilter } from 'nmr-processing';
import { useState } from 'react';
import { TabItem, Tabs } from 'react-science/ui';

import { Nucleus } from '../../../../data/types/common/Nucleus';
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
        title="Enable auto processing"
        htmlFor="onLoadProcessing.autoProcessing"
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
  const [activeTab, setActiveTab] = useState<Nucleus>('1H');
  const autoProcessingFilters = values?.onLoadProcessing?.filters || {};
  const tabItems: TabItem[] = Object.keys(autoProcessingFilters).map(
    (nucleus) => ({
      id: nucleus,
      title: <IsotopesViewer value={nucleus} />,
      content: (
        <FiltersTable data={autoProcessingFilters[nucleus]} nucleus={nucleus} />
      ),
    }),
  );
  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <Tabs
        items={tabItems}
        opened={activeTab}
        onClick={(id) => setActiveTab(id)}
      />
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
  return <ReactTable columns={COLUMNS} data={data} />;
}

export default OnLoadProcessingTabContent;
