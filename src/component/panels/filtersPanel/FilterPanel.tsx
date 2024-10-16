/** @jsxImportSource @emotion/react */
import { useDispatch } from '../../context/DispatchContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import { AlertButton, useAlert } from '../../elements/Alert.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { tablePanelStyle } from '../extra/BasicPanelStyle.js';
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
    <div css={tablePanelStyle}>
      <DefaultPanelHeader
        deleteToolTip="Delete all filters"
        onDelete={handleDeleteFilter}
        total={filters?.length}
        hideCounter
      />
      <div className="inner-container">
        <FiltersSectionsPanel />
      </div>
    </div>
  );
}
