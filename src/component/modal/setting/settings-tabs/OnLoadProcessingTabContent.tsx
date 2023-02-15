import { useFormikContext } from 'formik';
import { useState } from 'react';
import { TabItem, Tabs } from 'react-science/ui';

import { Nucleus } from '../../../../data/types/common/Nucleus';
import { CheckBoxCell } from '../../../elements/CheckBoxCell';
import IsotopesViewer from '../../../elements/IsotopesViewer';
import ReactTable from '../../../elements/ReactTable/ReactTable';
import { CustomColumn } from '../../../elements/ReactTable/utility/addCustomColumn';
import {
  OnLoadProcessing,
  WorkspacePreferences,
} from '../../../workspaces/Workspace';

function OnLoadProcessingTabContent() {
  const { values } = useFormikContext<WorkspacePreferences>();
  const [activeTab, setActiveTab] = useState<Nucleus>('1H');

  const tabItems: TabItem[] = Object.keys(values?.onLoadProcessing || {}).map(
    (nucleus) => ({
      id: nucleus,
      title: <IsotopesViewer value={nucleus} />,
      content: (
        <FiltersTable
          data={values?.onLoadProcessing?.[nucleus]}
          nucleus={nucleus}
        />
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
  const COLUMNS: CustomColumn<OnLoadProcessing>[] = [
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
          name={`onLoadProcessing.${nucleus}.${row.index}.flag`}
          defaultValue={false}
        />
      ),
    },
  ];
  return <ReactTable columns={COLUMNS} data={data} />;
}

export default OnLoadProcessingTabContent;
