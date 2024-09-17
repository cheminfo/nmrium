/** @jsxImportSource @emotion/react */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { css } from '@emotion/react';

import { useDispatch } from '../../context/DispatchContext';
import { useToaster } from '../../context/ToasterContext';
import { AlertButton, useAlert } from '../../elements/Alert';
import useSpectrum from '../../hooks/useSpectrum';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import { Filters } from './Filters';

export default function FiltersPanel() {
  const dispatch = useDispatch();
  const toaster = useToaster();
  const { showAlert } = useAlert();
  const { filters } = useSpectrum({ filters: [] });

  function handelDeleteFilter() {
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
        onDelete={handelDeleteFilter}
        total={filters?.length}
        hideCounter
      />
      <div className="inner-container">
        <Filters />
        {/* <FiltersTable /> */}
      </div>
    </div>
  );
}
