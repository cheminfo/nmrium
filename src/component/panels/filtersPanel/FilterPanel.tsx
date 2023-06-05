/** @jsxImportSource @emotion/react */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { css } from '@emotion/react';

import { useDispatch } from '../../context/DispatchContext';
import { useAlert } from '../../elements/popup/Alert/Context';
import { useModal } from '../../elements/popup/Modal/Context';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import FiltersTable from './FiltersTable';

export default function FiltersPanel() {
  const dispatch = useDispatch();
  const modal = useModal();
  const alert = useAlert();

  function handelDeleteFilter() {
    const buttons = [
      {
        text: 'Yes',
        handler: async () => {
          const hideLoading = await alert.showLoading(
            'Delete filters process in progress',
          );
          dispatch({ type: 'DELETE_FILTER', payload: {} });
          hideLoading();
        },
      },
      { text: 'No' },
    ];

    modal.showConfirmDialog({
      message: 'You are about to delete all processing steps, Are you sure?',
      buttons,
    });
  }

  return (
    <div css={tablePanelStyle}>
      <DefaultPanelHeader
        showSettingButton={false}
        deleteToolTip="Delete all filters"
        onDelete={handelDeleteFilter}
      />
      <div className="inner-container">
        <FiltersTable />
      </div>
    </div>
  );
}
