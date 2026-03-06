import { useDispatch } from '../../context/DispatchContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import type { AlertButton } from '../../elements/Alert.js';
import { useAlert } from '../../elements/Alert.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import CreateAutoProcessingPipelineModal from '../../modal/CreateAutoProcessingPipelineModal.tsx';
import { TablePanel } from '../extra/BasicPanelStyle.js';
import DefaultPanelHeader from '../header/DefaultPanelHeader.js';

import { FiltersSectionsPanel } from './Filters/FiltersSectionsPanel.js';

export default function FiltersPanel() {
  const dispatch = useDispatch();
  const toaster = useToaster();
  const { showAlert } = useAlert();
  const { filters } = useSpectrum({ filters: [] });

  function handleDeleteFilter() {
    const buttons: AlertButton[] = [
      {
        text: 'Yes',
        onClick: async () => {
          const hideLoading = await toaster.showAsyncLoading({
            message: 'Delete filters process in progress',
          });
          dispatch({ type: 'DELETE_FILTER', payload: {} });
          hideLoading();
        },
        intent: 'danger',
      },
      { text: 'No' },
    ];

    showAlert({
      message: 'You are about to delete all processing steps, Are you sure?',
      buttons,
    });
  }

  return (
    <TablePanel>
      <DefaultPanelHeader
        deleteToolTip="Delete all filters"
        onDelete={handleDeleteFilter}
        total={filters?.length}
        hideCounter
        rightButtons={[{ component: <CreateAutoProcessingPipelineModal /> }]}
      />

      <div className="inner-container">
        <FiltersSectionsPanel />
      </div>
    </TablePanel>
  );
}
