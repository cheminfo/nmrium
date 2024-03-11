/** @jsxImportSource @emotion/react */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { css } from '@emotion/react';

import { useDispatch } from '../../context/DispatchContext';
import { useToaster } from '../../context/ToasterContext';
import { useModal } from '../../elements/popup/Modal/Context';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import FiltersTable from './FiltersTable';

export default function FiltersPanel() {
  const dispatch = useDispatch();
  const modal = useModal();
  const toaster = useToaster();

  function handelDeleteFilter() {
    const buttons = [
      {
        text: 'Yes',
        handler: async () => {
          const hideLoading = toaster.showLoading({
            message: 'Delete filters process in progress',
          });
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
        deleteToolTip="Delete all filters"
        onDelete={handelDeleteFilter}
      />
      <div className="inner-container">
        <FiltersTable />
      </div>
    </div>
  );
}
